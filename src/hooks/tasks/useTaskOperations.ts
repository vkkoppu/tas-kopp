import { useState } from "react";
import { Task } from "@/types/task";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

export const useTaskOperations = (
  tasks: Task[],
  setTasks: (tasks: Task[]) => void,
  familyId: string
) => {
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const handleSubmit = async (taskData: {
    title: string;
    priority: "low" | "medium" | "high";
    dueDate?: Date;
    startDate?: Date;
    endDate?: Date;
    frequency: "once" | "daily" | "weekly" | "custom";
    customDays?: number;
    assignedTo: string[];
  }) => {
    try {
      console.log('Creating new task with data:', taskData);

      const formattedData = {
        family_id: familyId,
        title: taskData.title,
        priority: taskData.priority,
        frequency: taskData.frequency,
        custom_days: taskData.customDays,
        due_date: taskData.dueDate ? format(taskData.dueDate, "yyyy-MM-dd") : null,
        start_date: taskData.startDate ? format(taskData.startDate, "yyyy-MM-dd") : null,
        end_date: taskData.endDate ? format(taskData.endDate, "yyyy-MM-dd") : null,
      };

      const { data: newTask, error: taskError } = await supabase
        .from('tasks')
        .insert(formattedData)
        .select()
        .single();

      if (taskError || !newTask) {
        console.error('Error creating task:', taskError);
        toast.error("Failed to create task");
        return;
      }

      const { data: familyMembers, error: membersError } = await supabase
        .from('family_members')
        .select('id, name')
        .eq('family_id', familyId);

      if (membersError || !familyMembers) {
        console.error('Error fetching family members:', membersError);
        toast.error("Failed to fetch family members");
        return;
      }

      const assignments = taskData.assignedTo.map(memberName => {
        const member = familyMembers.find(m => m.name === memberName);
        if (!member) {
          console.error('Family member not found:', memberName);
          return null;
        }
        return {
          task_id: newTask.id,
          family_member_id: member.id,
        };
      }).filter(Boolean);

      if (assignments.length > 0) {
        const { error: assignmentError } = await supabase
          .from('task_assignments')
          .insert(assignments);

        if (assignmentError) {
          console.error('Error creating task assignments:', assignmentError);
          toast.error("Failed to assign task to family members");
          return;
        }
      }

      const formattedTask: Task = {
        id: newTask.id,
        title: taskData.title,
        priority: taskData.priority,
        frequency: taskData.frequency,
        customDays: taskData.customDays,
        dueDate: taskData.dueDate ? format(taskData.dueDate, "yyyy-MM-dd") : undefined,
        startDate: taskData.startDate ? format(taskData.startDate, "yyyy-MM-dd") : undefined,
        endDate: taskData.endDate ? format(taskData.endDate, "yyyy-MM-dd") : undefined,
        assignedTo: taskData.assignedTo,
      };

      setTasks([...tasks, formattedTask]);
      toast.success("Task created successfully");
      return true;
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast.error("An unexpected error occurred");
      return false;
    }
  };

  return {
    editingTask,
    setEditingTask,
    handleSubmit,
  };
};