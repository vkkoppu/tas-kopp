import { useState } from "react";
import { TaskCard } from "./TaskCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { FamilyDetailsForm } from "./FamilyDetailsForm";

const mockTasks = [
  {
    id: 1,
    title: "Clean the kitchen",
    priority: "high",
    dueDate: "Today",
    assignedTo: "John",
  },
  {
    id: 2,
    title: "Do homework",
    priority: "medium",
    dueDate: "Tomorrow",
    assignedTo: "Sarah",
  },
  {
    id: 3,
    title: "Take out trash",
    priority: "low",
    dueDate: "Today",
    assignedTo: "Dad",
  },
];

export const Dashboard = () => {
  const [tasks, setTasks] = useState(mockTasks);
  const [completedTasks, setCompletedTasks] = useState<number[]>([]);
  const [showFamilyForm, setShowFamilyForm] = useState(true);

  const handleComplete = (taskId: number, completed: boolean) => {
    if (completed) {
      setCompletedTasks([...completedTasks, taskId]);
    } else {
      setCompletedTasks(completedTasks.filter((id) => id !== taskId));
    }
  };

  if (showFamilyForm) {
    return <FamilyDetailsForm />;
  }

  return (
    <div className="container py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Family Tasks</h1>
          <p className="text-muted-foreground">
            Track and manage your family's daily activities
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
      </div>

      <div className="grid gap-4">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            title={task.title}
            priority={task.priority as "low" | "medium" | "high"}
            dueDate={task.dueDate}
            completed={completedTasks.includes(task.id)}
            onComplete={(completed) => handleComplete(task.id, completed)}
          />
        ))}
      </div>
    </div>
  );
};