import { format } from "date-fns";
import { Task } from "@/types/task";
import { FamilyData } from "./useDashboardState";

interface DashboardHandlersProps {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  familyData: FamilyData | null;
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
        familyData.members.map((oldMember) => {
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

  const handleAddTask = (taskData: {
    title: string;
    priority: "low" | "medium" | "high";
    dueDate?: Date;
    startDate?: Date;
    endDate?: Date;
    frequency: "once" | "daily" | "weekly" | "custom";
    customDays?: number;
    assignedTo: string[];
  }) => {
    const formattedTask: Task = {
      id: crypto.randomUUID(),
      ...taskData,
      dueDate: taskData.dueDate ? format(taskData.dueDate, "yyyy-MM-dd") : undefined,
      startDate: taskData.startDate ? format(taskData.startDate, "yyyy-MM-dd") : undefined,
      endDate: taskData.endDate ? format(taskData.endDate, "yyyy-MM-dd") : undefined,
    };

    setTasks([...tasks, formattedTask]);
    setShowTaskForm(false);
    setEditingTask(null);
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