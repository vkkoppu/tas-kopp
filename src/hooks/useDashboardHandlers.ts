import { format } from "date-fns";
import { Task } from "@/types/task";
import { FamilyData, FamilyMember } from "@/types/family";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DashboardHandlersProps {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  familyData: (FamilyData & { id: string }) | null;
  setFamilyData: (data: FamilyData | null) => void;
  setShowFamilyForm: (show: boolean) => void;
  setShowEditFamily: (show: boolean) => void;
  setShowTaskForm: (show: boolean) => void;
  setEditingTask: (task: Task | null) => void;
}

export const useDashboardHandlers = ({
  tasks,
  setTasks,
  familyData,
  setFamilyData,
  setShowFamilyForm,
  setShowEditFamily,
  setShowTaskForm,
  setEditingTask,
}: DashboardHandlersProps) => {
  const handleFamilySubmit = (data: FamilyData) => {
    if (familyData) {
      const oldToNewNames = new Map(
        familyData.members.map((oldMember: FamilyMember) => {
          const newMember = data.members.find((m) => m.role === oldMember.role);
          return [oldMember.name, newMember?.name || oldMember.name];
        })
      );

      setTasks(tasks.map(task => ({
        ...task,
        assignedTo: task.assignedTo.map(name => oldToNewNames.get(name) || name)
      })));
    }
    setFamilyData(data);
    setShowFamilyForm(false);
    setShowEditFamily(false);
  };

  const handleAddTask = async (taskData: {
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
      if (!familyData?.id) {
        toast.error("No family data found");
        return;
      }

      console.log('Creating new task with data:', taskData);

      // First, insert the task
      const { data: newTask, error: taskError } = await supabase
        .from('tasks')
        .insert({
          family_id: familyData.id,
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

      console.log('Task created successfully:', newTask);

      // Get family members to map names to IDs
      const { data: familyMembers, error: membersError } = await supabase
        .from('family_members')
        .select('id, name')
        .eq('family_id', familyData.id);

      if (membersError || !familyMembers) {
        console.error('Error fetching family members:', membersError);
        toast.error("Failed to fetch family members");
        return;
      }

      // Create assignments
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
      setShowTaskForm(false);
      setEditingTask(null);
      toast.success("Task created successfully");
    } catch (error) {
      console.error('Error in handleAddTask:', error);
      toast.error("Failed to create task");
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  return {
    handleFamilySubmit,
    handleAddTask,
    handleEditTask,
  };
};