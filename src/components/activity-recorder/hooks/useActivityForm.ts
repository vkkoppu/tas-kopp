import { useState } from "react";
import { format } from "date-fns";
import { FilterState, ActivityRecord } from "../shared-types";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Task } from "@/types/task";
import { FamilyMember } from "@/types/family";

export const useActivityForm = (
  tasks: Task[],
  familyMembers: FamilyMember[],
  onSave: (records: ActivityRecord[]) => Promise<void>,
  records: ActivityRecord[]
) => {
  const [filterState, setFilterState] = useState<FilterState>({
    viewMode: "all",
    selectedDate: new Date(),
    isCalendarOpen: false,
  });
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [completedBy, setCompletedBy] = useState<Record<string, string[]>>({});
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

  const handleEditRecord = async (record: ActivityRecord, newCompletedBy: string) => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        toast({
          title: "Authentication Error",
          description: "Please sign in to edit activities.",
          variant: "destructive",
        });
        return;
      }

      const familyMember = familyMembers.find(m => m.name === newCompletedBy);
      if (!familyMember) {
        toast({
          title: "Error",
          description: "Family member not found",
          variant: "destructive",
        });
        return;
      }

      // Find the task record to update
      const { data: taskRecords, error: fetchError } = await supabase
        .from('task_records')
        .select('*')
        .eq('task_id', record.taskId)
        .eq('completed_at', record.date);

      if (fetchError) {
        console.error('Error fetching task record:', fetchError);
        toast({
          title: "Error",
          description: "Failed to find the activity record",
          variant: "destructive",
        });
        return;
      }

      if (!taskRecords || taskRecords.length === 0) {
        toast({
          title: "Error",
          description: "Activity record not found",
          variant: "destructive",
        });
        return;
      }

      // Update the task record
      const { error: updateError } = await supabase
        .from('task_records')
        .update({ completed_by: familyMember.id })
        .eq('id', taskRecords[0].id);

      if (updateError) {
        console.error('Error updating task record:', updateError);
        toast({
          title: "Error",
          description: "Failed to update the activity record",
          variant: "destructive",
        });
        return;
      }

      // Update local state
      const updatedRecords = records.map(r => {
        if (r.taskId === record.taskId && r.date === record.date) {
          return { ...r, completedBy: newCompletedBy };
        }
        return r;
      });

      await onSave(updatedRecords);
      
      toast({
        title: "Success",
        description: "Activity record updated successfully",
      });
    } catch (error) {
      console.error('Error editing record:', error);
      toast({
        title: "Error",
        description: "Failed to edit activity record",
        variant: "destructive",
      });
    }
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
      const errors = [];
      
      for (const taskId of completedTasks) {
        const task = tasks.find(t => t.id === taskId);
        if (!task) {
          console.error('Task not found:', taskId);
          errors.push(`Task ${taskId} not found`);
          continue;
        }

        const memberNames = completedBy[taskId] || [];
        if (memberNames.length === 0) {
          console.error('No members assigned for task:', taskId);
          errors.push(`No members assigned for task ${task.title}`);
          continue;
        }

        const formattedDate = format(filterState.selectedDate, "yyyy-MM-dd'T'HH:mm:ssxxx");

        for (const memberName of memberNames) {
          const familyMember = familyMembers.find(m => m.name === memberName);
          if (!familyMember) {
            console.error('Family member not found:', memberName);
            errors.push(`Family member ${memberName} not found`);
            continue;
          }

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

  return {
    filterState,
    setFilterState,
    completedTasks,
    completedBy,
    setCompletedBy,
    isTaskCompletedForDate,
    handleTaskToggle,
    handleSave,
    handleEditRecord,
  };
};