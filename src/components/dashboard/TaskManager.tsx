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
      console.log('Creating new task with data:', taskData);
      console.log('Family ID:', familyId);

      // Format dates based on frequency
      const dueDate = taskData.frequency === "once" ? taskData.dueDate : null;
      const startDate = taskData.frequency !== "once" ? taskData.startDate : null;
      const endDate = taskData.frequency !== "once" ? taskData.endDate : null;

      // First, insert the task
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
        .select()
        .single();

      if (taskError || !newTask) {
        console.error('Error creating task:', taskError);
        toast.error("Failed to create task");
        return;
      }

      console.log('Task created successfully:', newTask);

      // Create assignments
      const assignments = await Promise.all(
        taskData.assignedTo.map(async (memberName) => {
          const member = familyMembers.find(m => m.name === memberName);
          if (!member) {
            console.error('Family member not found:', memberName);
            return null;
          }
          
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

          return member;
        })
      );

      if (assignments.some(a => a === null)) {
        toast.error("Some assignments failed to create");
        // Continue anyway as the task was created
      }

      const formattedTask: Task = {
        id: newTask.id,
        title: taskData.title,
        priority: taskData.priority,
        frequency: taskData.frequency,
        customDays: taskData.customDays,
        dueDate: dueDate ? format(dueDate, "yyyy-MM-dd") : undefined,
        startDate: startDate ? format(startDate, "yyyy-MM-dd") : undefined,
        endDate: endDate ? format(endDate, "yyyy-MM-dd") : undefined,
        assignedTo: taskData.assignedTo,
      };

      setTasks([...tasks, formattedTask]);
      setShowTaskForm(false);
      setEditingTask(null);
      toast.success("Task created successfully");
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast.error("Failed to create task");
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