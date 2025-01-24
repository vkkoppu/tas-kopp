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

      // First, insert the task
      const { data: newTaskData, error: taskError } = await supabase
        .from('tasks')
        .insert({
          family_id: familyId,
          title: taskData.title,
          priority: taskData.priority,
          frequency: taskData.frequency,
          custom_days: taskData.customDays,
          due_date: taskData.dueDate ? format(taskData.dueDate, "yyyy-MM-dd") : null,
          start_date: taskData.startDate ? format(taskData.startDate, "yyyy-MM-dd") : null,
          end_date: taskData.endDate ? format(taskData.endDate, "yyyy-MM-dd") : null,
        })
        .select()
        .single();

      if (taskError || !newTaskData) {
        console.error('Error creating task:', taskError);
        toast.error("Failed to create task");
        return;
      }

      console.log('Task created successfully:', newTaskData);

      // Get family members to map names to IDs
      const { data: familyMembersData, error: membersError } = await supabase
        .from('family_members')
        .select('id, name')
        .eq('family_id', familyId);

      if (membersError || !familyMembersData) {
        console.error('Error fetching family members:', membersError);
        toast.error("Failed to fetch family members");
        return;
      }

      // Create assignments
      const assignments = taskData.assignedTo.map(memberName => {
        const member = familyMembersData.find(m => m.name === memberName);
        if (!member) {
          console.error('Family member not found:', memberName);
          return null;
        }
        return {
          task_id: newTaskData.id,
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
        id: newTaskData.id,
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