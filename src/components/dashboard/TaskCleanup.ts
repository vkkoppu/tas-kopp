import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const cleanupOrphanedTasks = async (familyId: string) => {
  try {
    const { data: familyTasks, error: fetchError } = await supabase
      .from('tasks')
      .select('id')
      .eq('family_id', familyId);

    if (fetchError) {
      console.error('Error fetching tasks:', fetchError);
      return;
    }

    if (!familyTasks || familyTasks.length === 0) return;

    const { data: tasksWithAssignments, error: assignmentsError } = await supabase
      .from('task_assignments')
      .select('task_id')
      .in('task_id', familyTasks.map(t => t.id));

    if (assignmentsError) {
      console.error('Error fetching task assignments:', assignmentsError);
      return;
    }

    const assignedTaskIds = new Set(tasksWithAssignments?.map(t => t.task_id) || []);
    const orphanedTasks = familyTasks.filter(task => !assignedTaskIds.has(task.id));

    if (orphanedTasks.length > 0) {
      const { error: deleteError } = await supabase
        .from('tasks')
        .delete()
        .in('id', orphanedTasks.map(t => t.id));

      if (deleteError) {
        console.error('Error deleting orphaned tasks:', deleteError);
        return;
      }

      console.log(`Cleaned up ${orphanedTasks.length} orphaned tasks`);
      toast.success(`Cleaned up ${orphanedTasks.length} tasks without assignments`);
    }
  } catch (error) {
    console.error('Error in cleanupOrphanedTasks:', error);
  }
};