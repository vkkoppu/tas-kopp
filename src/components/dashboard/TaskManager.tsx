import { TaskForm } from "@/components/TaskForm";
import { TaskGroups } from "./TaskGroups";
import { Task } from "@/types/task";
import { FamilyMember } from "@/types/family";
import { useTaskOperations } from "@/hooks/tasks/useTaskOperations";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

interface TaskManagerProps {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  familyMembers: FamilyMember[];
  familyId: string;
  showTaskForm: boolean;
  setShowTaskForm: (show: boolean) => void;
  editingTask: Task | null;
  setEditingTask: (task: Task | null) => void;
}

export const TaskManager = ({
  tasks,
  setTasks,
  familyMembers,
  familyId,
  showTaskForm,
  setShowTaskForm,
  editingTask,
  setEditingTask,
}: TaskManagerProps) => {
  const [showEditAlert, setShowEditAlert] = useState(false);
  const [pendingEditTask, setPendingEditTask] = useState<Task | null>(null);

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
      const { data: familyMembersData, error: membersError } = await supabase
        .from('family_members')
        .select('id, name')
        .eq('family_id', familyId);

      if (membersError || !familyMembersData) {
        console.error('Error fetching family members:', membersError);
        toast.error("Failed to fetch family members");
        return;
      }

      if (editingTask) {
        // Update existing task
        const { error: taskError } = await supabase
          .from('tasks')
          .update({
            title: taskData.title,
            priority: taskData.priority,
            frequency: taskData.frequency,
            custom_days: taskData.customDays,
            due_date: taskData.dueDate ? format(taskData.dueDate, "yyyy-MM-dd") : null,
            start_date: taskData.startDate ? format(taskData.startDate, "yyyy-MM-dd") : null,
            end_date: taskData.endDate ? format(taskData.endDate, "yyyy-MM-dd") : null,
          })
          .eq('id', editingTask.id);

        if (taskError) {
          console.error('Error updating task:', taskError);
          toast.error("Failed to update task");
          return;
        }

        // First, fetch existing assignments
        const { data: existingAssignments, error: fetchError } = await supabase
          .from('task_assignments')
          .select('family_member_id')
          .eq('task_id', editingTask.id);

        if (fetchError) {
          console.error('Error fetching existing assignments:', fetchError);
          toast.error("Failed to update task assignments");
          return;
        }

        // Delete all existing assignments
        const { error: deleteError } = await supabase
          .from('task_assignments')
          .delete()
          .eq('task_id', editingTask.id);

        if (deleteError) {
          console.error('Error deleting existing assignments:', deleteError);
          toast.error("Failed to update task assignments");
          return;
        }

        // Create new assignments one by one
        for (const memberName of taskData.assignedTo) {
          const member = familyMembersData.find(m => m.name === memberName);
          if (!member) {
            console.error('Family member not found:', memberName);
            continue;
          }

          // Check if assignment already exists
          const { data: existingAssignment } = await supabase
            .from('task_assignments')
            .select()
            .eq('task_id', editingTask.id)
            .eq('family_member_id', member.id)
            .maybeSingle();

          if (existingAssignment) {
            console.log('Assignment already exists for:', memberName);
            continue;
          }

          const { error: assignmentError } = await supabase
            .from('task_assignments')
            .insert({
              task_id: editingTask.id,
              family_member_id: member.id,
            });

          if (assignmentError) {
            console.error('Error creating task assignment:', assignmentError);
            continue;
          }
        }

        // Update local state
        const updatedTasks = tasks.map(task =>
          task.id === editingTask.id
            ? {
                ...task,
                title: taskData.title,
                priority: taskData.priority,
                frequency: taskData.frequency,
                customDays: taskData.customDays,
                dueDate: taskData.dueDate ? format(taskData.dueDate, "yyyy-MM-dd") : undefined,
                startDate: taskData.startDate ? format(taskData.startDate, "yyyy-MM-dd") : undefined,
                endDate: taskData.endDate ? format(taskData.endDate, "yyyy-MM-dd") : undefined,
                assignedTo: taskData.assignedTo,
              }
            : task
        );

        setTasks(updatedTasks);
        toast.success("Task updated successfully");
      } else {
        // Create new task
        const { data: newTask, error: taskError } = await supabase
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

        if (taskError || !newTask) {
          console.error('Error creating task:', taskError);
          toast.error("Failed to create task");
          return;
        }

        // Create assignments one by one
        for (const memberName of taskData.assignedTo) {
          const member = familyMembersData.find(m => m.name === memberName);
          if (!member) {
            console.error('Family member not found:', memberName);
            break;
          }

          // Check if assignment already exists
          const { data: existingAssignment } = await supabase
            .from('task_assignments')
            .select()
            .eq('task_id', newTask.id)
            .eq('family_member_id', member.id)
            .maybeSingle();

          if (existingAssignment) {
            console.log('Assignment already exists for:', memberName);
            continue;
          }

          const { error: assignmentError } = await supabase
            .from('task_assignments')
            .insert({
              task_id: newTask.id,
              family_member_id: member.id,
            });

          if (assignmentError) {
            console.error('Error creating task assignment:', assignmentError);
            continue;
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
      }

      setShowTaskForm(false);
      setEditingTask(null);
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast.error("An unexpected error occurred");
    }
  };

  const handleEditTask = async (task: Task) => {
    // Check if task has any completed records
    const { data: records, error } = await supabase
      .from('task_records')
      .select('*')
      .eq('task_id', task.id);

    if (error) {
      console.error('Error checking task records:', error);
      toast.error("Failed to check task completion status");
      return;
    }

    if (records && records.length > 0) {
      setPendingEditTask(task);
      setShowEditAlert(true);
    } else {
      setEditingTask(task);
      setShowTaskForm(true);
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
        />
      )}

      <AlertDialog open={showEditAlert} onOpenChange={setShowEditAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Task with Completion History</AlertDialogTitle>
            <AlertDialogDescription>
              This task has already been completed one or more times. Editing it might affect historical records and analytics. Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowEditAlert(false);
              setPendingEditTask(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              setShowEditAlert(false);
              if (pendingEditTask) {
                setEditingTask(pendingEditTask);
                setShowTaskForm(true);
                setPendingEditTask(null);
              }
            }}>
              Continue Editing
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <TaskGroups
        groupedTasks={tasks}
        onEditTask={handleEditTask}
        onDeleteTask={handleDeleteTask}
      />
    </div>
  );
};