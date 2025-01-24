import { useState } from "react";
import { TaskForm } from "../TaskForm";
import { TaskGroups } from "./TaskGroups";
import { Task } from "@/types/task";
import { FamilyMember } from "@/types/family";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface TaskManagerProps {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  familyMembers: FamilyMember[];
  familyId: string;
  showTaskForm: boolean;
  setShowTaskForm: (show: boolean) => void;
}

export const TaskManager = ({
  tasks,
  setTasks,
  familyMembers,
  familyId,
  showTaskForm,
  setShowTaskForm,
}: TaskManagerProps) => {
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleDeleteTask = async (task: Task) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', task.id);

      if (error) {
        console.error('Error deleting task:', error);
        toast.error("Failed to delete task");
        return;
      }

      setTasks(tasks.filter(t => t.id !== task.id));
      toast.success("Task deleted successfully");
    } catch (error) {
      console.error('Error in handleDeleteTask:', error);
      toast.error("Failed to delete task");
    }
  };

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
      console.log('Starting task creation with data:', { ...taskData, familyId });

      if (!familyId) {
        console.error('No family ID provided');
        toast.error("Missing family ID");
        return;
      }

      // Format dates based on frequency
      const dueDate = taskData.frequency === "once" ? taskData.dueDate : null;
      const startDate = taskData.frequency !== "once" ? taskData.startDate : null;
      const endDate = taskData.frequency !== "once" ? taskData.endDate : null;

      console.log('Formatted dates:', { dueDate, startDate, endDate });

      // Create the task
      const { data: newTask, error: taskError } = await supabase
        .from('tasks')
        .insert({
          family_id: familyId,
          title: taskData.title,
          priority: taskData.priority,
          frequency: taskData.frequency,
          custom_days: taskData.customDays,
          due_date: dueDate ? format(dueDate, "yyyy-MM-dd") : null,
          start_date: startDate ? format(startDate, "yyyy-MM-dd") : null,
          end_date: endDate ? format(endDate, "yyyy-MM-dd") : null,
        })
        .select('*')
        .maybeSingle();

      if (taskError) {
        console.error('Error creating task:', taskError);
        toast.error(`Failed to create task: ${taskError.message}`);
        return;
      }

      if (!newTask) {
        console.error('No task was created');
        toast.error("Failed to create task - no data returned");
        return;
      }

      console.log('Task created successfully:', newTask);

      // Find family members and create assignments
      const memberAssignments = await Promise.all(
        taskData.assignedTo.map(async (memberName) => {
          const member = familyMembers.find(m => m.name === memberName);
          if (!member) {
            console.error('Family member not found:', memberName);
            return null;
          }

          console.log('Creating assignment for member:', member);

          const { error: assignmentError } = await supabase
            .from('task_assignments')
            .insert({
              task_id: newTask.id,
              family_member_id: member.id,
            });

          if (assignmentError) {
            console.error('Error creating task assignment:', assignmentError);
            return null;
          }

          console.log('Assignment created for:', memberName);
          return member.name;
        })
      );

      const successfulAssignments = memberAssignments.filter((name): name is string => name !== null);

      if (successfulAssignments.length === 0) {
        console.error('No assignments were created');
        toast.error("Failed to assign task to any family members");
        
        // Clean up the task since no assignments were created
        const { error: deleteError } = await supabase
          .from('tasks')
          .delete()
          .eq('id', newTask.id);

        if (deleteError) {
          console.error('Error cleaning up task:', deleteError);
        }
        return;
      }

      if (successfulAssignments.length < taskData.assignedTo.length) {
        toast.warning("Some task assignments failed");
      }

      // Format the task for the UI
      const formattedTask: Task = {
        id: newTask.id,
        title: taskData.title,
        priority: taskData.priority,
        frequency: taskData.frequency,
        customDays: taskData.customDays,
        dueDate: dueDate ? format(dueDate, "yyyy-MM-dd") : undefined,
        startDate: startDate ? format(startDate, "yyyy-MM-dd") : undefined,
        endDate: endDate ? format(endDate, "yyyy-MM-dd") : undefined,
        assignedTo: successfulAssignments,
      };

      console.log('Final formatted task:', formattedTask);

      setTasks([...tasks, formattedTask]);
      setShowTaskForm(false);
      setEditingTask(null);
      toast.success("Task created successfully");
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast.error("An unexpected error occurred while creating the task");
    }
  };

  return (
    <>
      {showTaskForm && (
        <TaskForm
          onCancel={() => {
            setShowTaskForm(false);
            setEditingTask(null);
          }}
          onSubmit={handleSubmit}
          editingTask={editingTask}
          tasks={tasks}
          setTasks={setTasks}
          familyMembers={familyMembers}
          initialValues={editingTask || undefined}
        />
      )}

      <TaskGroups
        groupedTasks={tasks}
        onEditTask={handleEditTask}
        onDeleteTask={handleDeleteTask}
      />
    </>
  );
};