import { Task } from "@/types/task";

export const groupTasksByAssignee = (tasks: Task[]) => {
  const grouped: Record<string, Task[]> = {};
  
  if (!Array.isArray(tasks)) {
    console.error('Invalid tasks array:', tasks);
    return {};
  }

  tasks.forEach(task => {
    if (!task.assignedTo) return;
    
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
  if (!Array.isArray(tasks)) {
    console.error('Invalid tasks array:', tasks);
    return {};
  }

  if (groupBy === "shared") {
    const sharedTasks = tasks.filter(task => 
      Array.isArray(task.assignedTo) && task.assignedTo.length > 1
    );
    const individualTasks = tasks.filter(task => 
      Array.isArray(task.assignedTo) && task.assignedTo.length === 1
    );
    
    const groups: Record<string, Task[]> = {};
    
    if (sharedTasks.length > 0) {
      groups["Shared Tasks"] = sharedTasks;
    }
    
    if (individualTasks.length > 0) {
      groups["Individual Tasks"] = individualTasks;
    }
    
    return groups;
  }
  
  return groupTasksByAssignee(tasks);
};