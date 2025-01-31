import { TaskForm } from "@/components/TaskForm";
import { TaskGroups } from "./TaskGroups";
import { Task } from "@/types/task";
import { FamilyMember } from "@/types/family";
import { useTaskOperations } from "@/hooks/tasks/useTaskOperations";
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

        // Delete existing assignments first
        const { error: deleteError } = await supabase
          .from('task_assignments')
          .delete()
          .eq('task_id', editingTask.id);

        if (deleteError) {
          console.error('Error deleting existing assignments:', deleteError);
          toast.error("Failed to update task assignments");
          return;
        }

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

        // Create new assignments
        const assignments = taskData.assignedTo.map(memberName => {
          const member = familyMembersData.find(m => m.name === memberName);
          if (!member) {
            console.error('Family member not found:', memberName);
            return null;
          }
          return {
            task_id: editingTask.id,
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
        // Handle new task creation
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
      }

      setShowTaskForm(false);
      setEditingTask(null);
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast.error("An unexpected error occurred");
    }
  };

  const handleEditTask = (task: Task) => {
    console.log("Editing task in TaskManager:", task);
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

      <TaskGroups
        groupedTasks={tasks}
        onEditTask={handleEditTask}
        onDeleteTask={handleDeleteTask}
      />
    </div>
  );
};