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

      console.log('Starting to save task records...');
      console.log('Tasks to complete:', Array.from(completedTasks));
      console.log('Family members:', familyMembers);

      const newRecords = [];
      const errors = [];
      
      for (const taskId of completedTasks) {
        const task = tasks.find(t => t.id === taskId);
        if (!task) {
          console.error('Task not found:', taskId);
          errors.push(`Task ${taskId} not found`);
          continue;
        }

        const memberName = completedBy[taskId];
        if (!memberName) {
          console.error('No member assigned for task:', taskId);
          errors.push(`No member assigned for task ${task.title}`);
          continue;
        }

        const familyMember = familyMembers.find(m => m.name === memberName);
        if (!familyMember) {
          console.error('Family member not found:', memberName);
          errors.push(`Family member ${memberName} not found`);
          continue;
        }

        const formattedDate = format(filterState.selectedDate, "yyyy-MM-dd'T'HH:mm:ssxxx");

        console.log('Attempting to insert task record:', {
          task_id: taskId,
          completed_by: familyMember.id,
          completed_at: formattedDate
        });

        const { data, error } = await supabase
          .from('task_records')
          .insert({
            task_id: taskId,
            completed_by: familyMember.id,
            completed_at: formattedDate
          })
          .select()
          .single();

        if (error) {
          console.error('Error details:', error);
          errors.push(`Failed to save record for task ${task.title}: ${error.message}`);
          continue;
        }

        console.log('Successfully inserted task record:', data);

        newRecords.push({
          taskId,
          completed: true,
          date: format(filterState.selectedDate, 'yyyy-MM-dd'),
          completedBy: memberName,
        });
      }

      if (errors.length > 0) {
        toast({
          title: "Some records failed to save",
          description: errors.join('\n'),
          variant: "destructive",
        });
        return;
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