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
      if (!familyId) {
        toast.error("Missing family ID");
        return;
      }

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
          
          await supabase.from('tasks').delete().eq('id', newTask.id);
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
      setShowTaskForm(false);
      setEditingTask(null);
      toast.success("Task created successfully");
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast.error("An unexpected error occurred");
    }
  };

  return (
    <div className="relative">
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

      {tasks.length > 0 && (
        <TaskGroups
          groupedTasks={tasks}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
        />
      )}
    </div>
  );
};