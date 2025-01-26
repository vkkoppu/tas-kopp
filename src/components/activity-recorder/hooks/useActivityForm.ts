import { useState } from "react";
import { format } from "date-fns";
import { FilterState, ActivityRecord } from "../shared-types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Task } from "@/types/task";
import { FamilyMember } from "@/types/family";

export const useActivityForm = (
  tasks: Task[],
  familyMembers: FamilyMember[],
  onSave: (records: ActivityRecord[]) => Promise<void>,
  records: ActivityRecord[]
) => {
  // Move all useState declarations to the top
  const [filterState, setFilterState] = useState<FilterState>({
    viewMode: "all",
    selectedDate: new Date(),
    isCalendarOpen: false,
  });
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [completedBy, setCompletedBy] = useState<Record<string, string[]>>({});
  const [localRecords, setLocalRecords] = useState<ActivityRecord[]>(records);

  const isTaskCompletedForDate = (taskId: string) => {
    const formattedDate = format(filterState.selectedDate, 'yyyy-MM-dd');
    return localRecords.some(record => 
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

  const handleDeleteRecord = async (record: ActivityRecord) => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        toast.error("Authentication Error: Please sign in to delete activities.");
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

      const { error: deleteError } = await supabase
        .from('task_records')
        .delete()
        .eq('id', taskRecords[0].id);

      if (deleteError) {
        console.error('Error deleting task record:', deleteError);
        toast.error("Failed to delete the activity record");
        return;
      }

      const updatedRecords = localRecords.filter(r => 
        !(r.taskId === record.taskId && r.date === record.date && r.completedBy === record.completedBy)
      );
      setLocalRecords(updatedRecords);
      await onSave(updatedRecords);
      toast.success("Activity record deleted successfully");
    } catch (error) {
      console.error('Error in handleDeleteRecord:', error);
      toast.error("Failed to delete activity record");
    }
  };

  const handleEditRecord = async (record: ActivityRecord, newCompletedBy: string) => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        toast.error("Authentication Error: Please sign in to edit activities.");
        return;
      }

      const familyMember = familyMembers.find(m => m.name === newCompletedBy);
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
      await onSave(updatedRecords);
      toast.success("Activity record updated successfully");
    } catch (error) {
      console.error('Error in handleEditRecord:', error);
      toast.error("Failed to edit activity record");
    }
  };

  const handleSave = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        toast.error("Authentication Error: Please sign in to record activities.");
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

        const formattedDate = format(filterState.selectedDate, 'yyyy-MM-dd');

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
            date: formattedDate,
            completedBy: memberName,
          });
        }
      }

      if (errors.length > 0) {
        toast.error("Some records failed to save: " + errors.join(', '));
        return;
      }

      const updatedRecords = [...localRecords, ...newRecords];
      setLocalRecords(updatedRecords);
      await onSave(updatedRecords);
      setCompletedTasks(new Set());
      setCompletedBy({});
      
      toast.success("Activities recorded successfully");
    } catch (error) {
      console.error('Error saving records:', error);
      toast.error("Failed to save activities. Please try again.");
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
    handleDeleteRecord,
  };
};