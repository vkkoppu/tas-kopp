import { useState } from "react";
import { TaskCard } from "./TaskCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { FamilyDetailsForm } from "./FamilyDetailsForm";
import { TaskForm } from "./TaskForm";
import { format } from "date-fns";

interface FamilyMember {
  name: string;
  role: string;
}

interface Task {
  id: number;
  title: string;
  priority: "low" | "medium" | "high";
  dueDate: string;
  assignedTo: string;
}

export const Dashboard = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<number[]>([]);
  const [showFamilyForm, setShowFamilyForm] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [familyData, setFamilyData] = useState<{ familyName: string; members: FamilyMember[] } | null>(null);

  const handleComplete = (taskId: number, completed: boolean) => {
    if (completed) {
      setCompletedTasks([...completedTasks, taskId]);
    } else {
      setCompletedTasks(completedTasks.filter((id) => id !== taskId));
    }
  };

  const handleFamilySubmit = (data: { familyName: string; members: FamilyMember[] }) => {
    setFamilyData(data);
    setShowFamilyForm(false);
  };

  const handleAddTask = (taskData: {
    title: string;
    priority: "low" | "medium" | "high";
    dueDate: Date;
    assignedTo: string;
  }) => {
    const newTask: Task = {
      id: tasks.length + 1,
      ...taskData,
      dueDate: format(taskData.dueDate, "PP"),
    };
    setTasks([...tasks, newTask]);
    setShowTaskForm(false);
  };

  if (showFamilyForm) {
    return <FamilyDetailsForm onSubmit={handleFamilySubmit} />;
  }

  return (
    <div className="container py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">
            {familyData?.familyName}'s Tasks
          </h1>
          <p className="text-muted-foreground">
            Track and manage your family's daily activities
          </p>
        </div>
        <Button className="gap-2" onClick={() => setShowTaskForm(true)}>
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
      </div>

      <div className="grid gap-4">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            title={task.title}
            priority={task.priority}
            dueDate={task.dueDate}
            completed={completedTasks.includes(task.id)}
            onComplete={(completed) => handleComplete(task.id, completed)}
          />
        ))}
        {tasks.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            No tasks yet. Click the "Add Task" button to get started!
          </p>
        )}
      </div>

      {showTaskForm && familyData && (
        <TaskForm
          onSubmit={handleAddTask}
          onCancel={() => setShowTaskForm(false)}
          familyMembers={familyData.members}
        />
      )}
    </div>
  );
};