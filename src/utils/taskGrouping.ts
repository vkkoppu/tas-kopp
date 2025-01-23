import { Task } from "@/types/task";

export const groupTasksByAssignee = (tasks: Task[]) => {
  const grouped: Record<string, Task[]> = {};
  tasks.forEach(task => {
    task.assignedTo.forEach(assignee => {
      if (!grouped[assignee]) {
        grouped[assignee] = [];
      }
      if (!grouped[assignee].some(t => t.id === task.id)) {
        grouped[assignee].push(task);
      }
    });
  });
  return grouped;
};

export const groupTasks = (tasks: Task[], groupBy: "individual" | "shared") => {
  if (groupBy === "shared") {
    const sharedTasks = tasks.filter(task => task.assignedTo.length > 1);
    const individualTasks = tasks.filter(task => task.assignedTo.length === 1);
    
    return {
      "Shared Tasks": sharedTasks,
      "Individual Tasks": individualTasks
    };
  }
  return groupTasksByAssignee(tasks);
};