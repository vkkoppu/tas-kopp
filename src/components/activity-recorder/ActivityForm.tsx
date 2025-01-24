import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { ActivityFormProps, FilterState } from "./shared-types";
import { DateSelector } from "./DateSelector";
import { TaskList } from "./TaskList";
import { useToast } from "../ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const ActivityForm = ({ tasks, familyMembers, onSave, records }: ActivityFormProps) => {
  const [filterState, setFilterState] = useState<FilterState>({
    viewMode: "all",
    selectedDate: new Date(),
    isCalendarOpen: false,
  });
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [completedBy, setCompletedBy] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const isTaskCompletedForDate = (taskId: string) => {
    const formattedDate = format(filterState.selectedDate, 'yyyy-MM-dd');
    return records.some(record => 
      record.taskId === taskId && 
      record.date === formattedDate
    );
  };

  const handleTaskToggle = (taskId: string) => {
    if (isTaskCompletedForDate(taskId)) return;
    
    const newCompletedTasks = new Set(completedTasks);
    if (newCompletedTasks.has(taskId)) {
      newCompletedTasks.delete(taskId);
      const newCompletedBy = { ...completedBy };
      delete newCompletedBy[taskId];
      setCompletedBy(newCompletedBy);
    } else {
      newCompletedTasks.add(taskId);
    }
    setCompletedTasks(newCompletedTasks);
  };

  const handleSave = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        toast({
          title: "Authentication Error",
          description: "Please sign in to record activities.",
          variant: "destructive",
        });
        return;
      }

      const newRecords = [];
      
      for (const taskId of completedTasks) {
        const task = tasks.find(t => t.id === taskId);
        if (!task) continue;

        const memberName = completedBy[taskId];
        if (!memberName) continue;

        const familyMember = familyMembers.find(m => m.name === memberName);
        if (!familyMember) continue;

        const formattedDate = format(filterState.selectedDate, "yyyy-MM-dd'T'HH:mm:ssxxx");
        
        const recordData = {
          task_id: taskId,
          completed_by: familyMember.id,
          completed_at: formattedDate
        };

        const { error } = await supabase
          .from('task_records')
          .insert(recordData);

        if (error) throw error;

        newRecords.push({
          taskId,
          completed: true,
          date: format(filterState.selectedDate, 'yyyy-MM-dd'),
          completedBy: memberName,
        });
      }

      await onSave(newRecords);
      setCompletedTasks(new Set());
      setCompletedBy({});
      
      toast({
        title: "Success",
        description: "Activities recorded successfully",
      });
    } catch (error) {
      console.error('Error saving records:', error);
      toast({
        title: "Error",
        description: "Failed to save activities. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredTasks = tasks.filter(task => {
    const isCompleted = isTaskCompletedForDate(task.id);
    switch (filterState.viewMode) {
      case "pending":
        return !isCompleted;
      case "completed":
        return isCompleted;
      default:
        return true;
    }
  });

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <Select 
          value={filterState.viewMode} 
          onValueChange={(value: "all" | "pending" | "completed") => 
            setFilterState(prev => ({ ...prev, viewMode: value }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter tasks" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tasks</SelectItem>
            <SelectItem value="pending">Pending Tasks</SelectItem>
            <SelectItem value="completed">Completed Tasks</SelectItem>
          </SelectContent>
        </Select>

        <DateSelector
          selectedDate={filterState.selectedDate}
          isCalendarOpen={filterState.isCalendarOpen}
          onCalendarOpenChange={(isOpen) => 
            setFilterState(prev => ({ ...prev, isCalendarOpen: isOpen }))
          }
          onDateSelect={(date) => {
            setFilterState(prev => ({ 
              ...prev, 
              selectedDate: date || new Date(),
              isCalendarOpen: false 
            }));
            setCompletedTasks(new Set());
          }}
        />
      </div>

      <TaskList
        tasks={filteredTasks}
        completedTasks={completedTasks}
        completedBy={completedBy}
        onTaskToggle={handleTaskToggle}
        onCompletedByChange={(taskId, value) => setCompletedBy({ ...completedBy, [taskId]: value })}
        isTaskCompletedForDate={isTaskCompletedForDate}
      />

      <div className="pt-4 space-y-2">
        <Button 
          onClick={handleSave}
          className="w-full"
          size="lg"
          disabled={completedTasks.size === 0}
        >
          Submit Activities
        </Button>
      </div>
    </div>
  );
};