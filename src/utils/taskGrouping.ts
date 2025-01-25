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

  // Log the incoming tasks for debugging
  console.log("Incoming tasks to group:", tasks);

  // Make sure each task has the required properties
  const validTasks = tasks.filter(task => {
    const isValid = task && 
                   typeof task === 'object' && 
                   'id' in task &&
                   'title' in task &&
                   'assignedTo' in task &&
                   Array.isArray(task.assignedTo);
    
    if (!isValid) {
      console.error('Invalid task object:', task);
    }
    
    return isValid;
  });

  console.log("Valid tasks after filtering:", validTasks);

  const sharedTasks = validTasks.filter(task => task.assignedTo.length > 1);
  const individualTasks = validTasks.filter(task => task.assignedTo.length === 1);

  console.log("Grouped shared tasks:", sharedTasks);
  console.log("Grouped individual tasks:", individualTasks);

  return {
    "Shared Tasks": sharedTasks,
    "Individual Tasks": individualTasks
  };
};