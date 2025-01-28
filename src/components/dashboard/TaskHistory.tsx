import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { X, Edit2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Task } from "@/types/task";
import { ActivityRecord } from "@/components/activity-recorder/shared-types";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface TaskHistoryProps {
  records: ActivityRecord[];
  tasks: Task[];
  onClose: () => void;
  familyMembers?: { id: string; name: string }[];
}

export const TaskHistory = ({ records, tasks, onClose, familyMembers }: TaskHistoryProps) => {
  const [editingRecord, setEditingRecord] = useState<ActivityRecord | null>(null);
  const [localRecords, setLocalRecords] = useState<ActivityRecord[]>(records);

  const getTaskTitle = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) {
      // If task is not found, filter out this record from localRecords
      setLocalRecords(prev => prev.filter(r => r.taskId !== taskId));
      return null;
    }
    return task.title;
  };

  const handleEditRecord = async (record: ActivityRecord, newCompletedBy: string) => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        toast.error("Authentication Error: Please sign in to edit activities.");
        return;
      }

      const familyMember = familyMembers?.find(m => m.name === newCompletedBy);
      if (!familyMember) {
        toast.error("Family member not found");
        return;
      }

      const { data: taskRecords, error: fetchError } = await supabase
        .from('task_records')
        .select('*')
        .eq('task_id', record.taskId)
        .eq('completed_at', record.date);

      if (fetchError) {
        console.error('Error fetching task record:', fetchError);
        toast.error("Failed to find the activity record");
        return;
      }

      if (!taskRecords || taskRecords.length === 0) {
        console.error('No task records found for:', { taskId: record.taskId, date: record.date });
        toast.error("Activity record not found in database");
        return;
      }

      const { error: updateError } = await supabase
        .from('task_records')
        .update({ completed_by: familyMember.id })
        .eq('id', taskRecords[0].id);

      if (updateError) {
        console.error('Error updating task record:', updateError);
        toast.error("Failed to update the activity record");
        return;
      }

      // Update local state
      const updatedRecords = localRecords.map(r => {
        if (r.taskId === record.taskId && r.date === record.date) {
          return { ...r, completedBy: newCompletedBy };
        }
        return r;
      });

      setLocalRecords(updatedRecords);
      setEditingRecord(null);
      toast.success("Activity record updated successfully");
    } catch (error) {
      console.error('Error in handleEditRecord:', error);
      toast.error("Failed to edit activity record");
    }
  };

  // Group records by date
  const groupedRecords = localRecords.reduce((acc, record) => {
    const date = format(new Date(record.date), 'yyyy-MM-dd');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(record);
    return acc;
  }, {} as Record<string, ActivityRecord[]>);

  // Sort dates in descending order
  const sortedDates = Object.keys(groupedRecords).sort((a, b) => 
    parseISO(b).getTime() - parseISO(a).getTime()
  );

  return (
    <Card className="fixed inset-4 z-40 flex flex-col bg-pastel-purple/20 md:inset-auto md:left-1/2 md:top-1/2 md:max-w-2xl md:-translate-x-1/2 md:-translate-y-1/2 md:h-[80vh] rounded-lg shadow-lg border border-purple-soft">
      <div className="flex items-center justify-between p-4 border-b border-purple-soft/30">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-purple-primary">Activity History</h2>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose}
          className="hover:bg-pastel-purple/50"
        >
          <X className="h-4 w-4 text-purple-primary" />
        </Button>
      </div>
      
      <ScrollArea className="flex-1 p-6">
        {localRecords.length > 0 ? (
          <div className="space-y-6">
            {sortedDates.map((date) => (
              <div key={date} className="space-y-4">
                <h3 className="text-lg font-semibold sticky top-0 bg-pastel-purple/20 py-2 text-purple-secondary">
                  {format(parseISO(date), 'PPPP')}
                </h3>
                <div className="space-y-4">
                  {groupedRecords[date].map((record, index) => {
                    const taskTitle = getTaskTitle(record.taskId);
                    if (!taskTitle) return null; // Skip rendering if task not found

                    return (
                      <div key={index} className="flex items-center justify-between py-2 px-4 border-b last:border-0 bg-pastel-purple/10 rounded-lg hover:bg-pastel-purple/20 transition-colors">
                        <div className="space-y-1">
                          <div className="font-medium text-purple-primary">{taskTitle}</div>
                          {editingRecord?.taskId === record.taskId && editingRecord?.date === record.date ? (
                            <Select
                              defaultValue={record.completedBy}
                              onValueChange={(value) => handleEditRecord(record, value)}
                            >
                              <SelectTrigger className="w-[200px] bg-white/50">
                                <SelectValue placeholder="Select member" />
                              </SelectTrigger>
                              <SelectContent>
                                {familyMembers?.map((member) => (
                                  <SelectItem key={member.id} value={member.name}>
                                    {member.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <div className="text-sm text-purple-tertiary flex items-center gap-2">
                              <span>Completed by: {record.completedBy}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setEditingRecord(record)}
                                className="hover:bg-pastel-purple/50"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-purple-tertiary py-4">
            No activity records yet
          </p>
        )}
      </ScrollArea>
    </Card>
  );
};