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

  const getTaskTitle = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    return task ? task.title : 'Unknown Task';
  };

  const handleEditRecord = async (record: ActivityRecord, newCompletedBy: string) => {
    try {
      const familyMember = familyMembers?.find(m => m.name === newCompletedBy);
      if (!familyMember) {
        toast.error("Family member not found");
        return;
      }

      const { error } = await supabase
        .from('task_records')
        .update({ 
          completed_by: familyMember.id 
        })
        .eq('task_id', record.taskId)
        .eq('completed_at', record.date);

      if (error) {
        console.error('Error updating record:', error);
        toast.error("Failed to update record");
        return;
      }

      // Update local state
      const updatedRecord = { ...record, completedBy: newCompletedBy };
      toast.success("Record updated successfully");
      setEditingRecord(null);
    } catch (error) {
      console.error('Error in handleEditRecord:', error);
      toast.error("Failed to update record");
    }
  };

  // Group records by date
  const groupedRecords = records.reduce((acc, record) => {
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
    <Card className="fixed inset-4 z-40 flex flex-col bg-background md:inset-auto md:left-1/2 md:top-1/2 md:max-w-2xl md:-translate-x-1/2 md:-translate-y-1/2 md:h-[80vh]">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold">Activity History</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <ScrollArea className="flex-1 p-6">
        {records.length > 0 ? (
          <div className="space-y-6">
            {sortedDates.map((date) => (
              <div key={date} className="space-y-4">
                <h3 className="text-lg font-semibold sticky top-0 bg-background py-2">
                  {format(parseISO(date), 'PPPP')}
                </h3>
                <div className="space-y-4">
                  {groupedRecords[date].map((record, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div className="space-y-1">
                        <div className="font-medium">{getTaskTitle(record.taskId)}</div>
                        {editingRecord?.taskId === record.taskId ? (
                          <Select
                            value={record.completedBy}
                            onValueChange={(value) => handleEditRecord(record, value)}
                          >
                            <SelectTrigger className="w-[200px]">
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
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <span>Completed by: {record.completedBy}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditingRecord(record)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-4">
            No activity records yet
          </p>
        )}
      </ScrollArea>
    </Card>
  );
};