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
    return {
      "Shared Tasks": [],
      "Individual Tasks": []
    };
  }

  console.log("Grouping tasks:", tasks);

  const sharedTasks = tasks.filter(task => 
    Array.isArray(task.assignedTo) && task.assignedTo.length > 1
  );
  console.log("Shared tasks:", sharedTasks);

  const individualTasks = tasks.filter(task => 
    Array.isArray(task.assignedTo) && task.assignedTo.length === 1
  );
  console.log("Individual tasks:", individualTasks);
  
  return {
    "Shared Tasks": sharedTasks || [],
    "Individual Tasks": individualTasks || []
  };
};