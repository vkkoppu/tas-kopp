import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Task {
  id: string;
  title: string;
  priority: "low" | "medium" | "high";
  frequency: "once" | "daily" | "weekly" | "custom";
  customDays?: number;
  dueDate?: string;
  startDate?: string;
  endDate?: string;
  assignedTo: string;
}

export const useTasks = (familyId?: string) => {
  const queryClient = useQueryClient();

  const { data: tasks, isLoading: isTasksLoading } = useQuery({
    queryKey: ["tasks", familyId],
    queryFn: async () => {
      if (!familyId) return [];

      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("family_id", familyId);

      if (error) throw error;

      return data.map((task) => ({
        id: task.id,
        title: task.title,
        priority: task.priority,
        frequency: task.frequency,
        customDays: task.custom_days,
        dueDate: task.due_date,
        startDate: task.start_date,
        endDate: task.end_date,
        assignedTo: task.assigned_to,
      }));
    },
    enabled: !!familyId,
  });

  const createTask = useMutation({
    mutationFn: async ({
      familyId,
      task,
    }: {
      familyId: string;
      task: Omit<Task, "id">;
    }) => {
      const { error } = await supabase.from("tasks").insert({
        family_id: familyId,
        title: task.title,
        priority: task.priority,
        frequency: task.frequency,
        custom_days: task.customDays,
        due_date: task.dueDate,
        start_date: task.startDate,
        end_date: task.endDate,
        assigned_to: task.assignedTo,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task created successfully!");
    },
    onError: (error) => {
      toast.error("Failed to create task: " + error.message);
    },
  });

  const updateTask = useMutation({
    mutationFn: async ({ taskId, task }: { taskId: string; task: Omit<Task, "id"> }) => {
      const { error } = await supabase
        .from("tasks")
        .update({
          title: task.title,
          priority: task.priority,
          frequency: task.frequency,
          custom_days: task.customDays,
          due_date: task.dueDate,
          start_date: task.startDate,
          end_date: task.endDate,
          assigned_to: task.assignedTo,
        })
        .eq("id", taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task updated successfully!");
    },
    onError: (error) => {
      toast.error("Failed to update task: " + error.message);
    },
  });

  return {
    tasks,
    isTasksLoading,
    createTask,
    updateTask,
  };
};