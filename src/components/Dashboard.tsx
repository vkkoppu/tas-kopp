import { useState } from "react";
import { TaskCard } from "./TaskCard";
import { Button } from "@/components/ui/button";
import { Plus, Calendar } from "lucide-react";
import { FamilyDetailsForm } from "./FamilyDetailsForm";
import { TaskForm } from "./TaskForm";
import { format } from "date-fns";
import { ActivityRecorder } from "./ActivityRecorder";

interface FamilyMember {
  name: string;
  role: string;
}

interface Task {
  id: number;
  title: string;
  priority: "low" | "medium" | "high";
  dueDate?: string;
  startDate?: string;
  endDate?: string;
  frequency: "once" | "daily" | "weekly" | "custom";
  customDays?: number;
  assignedTo: string;
}

interface TaskRecord {
  taskId: number;
  date: string;
  completed: boolean;
  assignedTo: string;
}

export const Dashboard = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showFamilyForm, setShowFamilyForm] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showActivityRecorder, setShowActivityRecorder] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [familyData, setFamilyData] = useState<{ familyName: string; members: FamilyMember[] } | null>(null);
  const [taskRecords, setTaskRecords] = useState<TaskRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const handleFamilySubmit = (data: { familyName: string; members: FamilyMember[] }) => {
    setFamilyData(data);
    setShowFamilyForm(false);
  };

  const handleAddTask = (taskData: {
    title: string;
    priority: "low" | "medium" | "high";
    dueDate?: Date;
    startDate?: Date;
    endDate?: Date;
    frequency: "once" | "daily" | "weekly" | "custom";
    customDays?: number;
    assignedTo: string;
  }) => {
    const formattedTask = {
      id: editingTask?.id ?? tasks.length + 1,
      ...taskData,
      dueDate: taskData.dueDate ? format(taskData.dueDate, "PP") : undefined,
      startDate: taskData.startDate ? format(taskData.startDate, "PP") : undefined,
      endDate: taskData.endDate ? format(taskData.endDate, "PP") : undefined,
    };

    if (editingTask) {
      setTasks(tasks.map(task => task.id === editingTask.id ? formattedTask : task));
    } else {
      setTasks([...tasks, formattedTask]);
    }
    
    setShowTaskForm(false);
    setEditingTask(null);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const groupTasksByAssignee = () => {
    const grouped: Record<string, Task[]> = {};
    tasks.forEach(task => {
      if (!grouped[task.assignedTo]) {
        grouped[task.assignedTo] = [];
      }
      grouped[task.assignedTo].push(task);
    });
    return grouped;
  };

  if (showFamilyForm) {
    return <FamilyDetailsForm onSubmit={handleFamilySubmit} />;
  }

  const groupedTasks = groupTasksByAssignee();

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
        <div className="flex gap-4">
          <Button className="gap-2" onClick={() => setShowTaskForm(true)}>
            <Plus className="h-4 w-4" />
            Add Task
          </Button>
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={() => setShowActivityRecorder(true)}
          >
            <Calendar className="h-4 w-4" />
            Record Activities
          </Button>
        </div>
      </div>

      <div className="space-y-8">
        {Object.entries(groupedTasks).map(([assignee, assigneeTasks]) => (
          <div key={assignee} className="space-y-4">
            <h2 className="text-2xl font-semibold">{assignee}'s Tasks</h2>
            <div className="grid gap-4">
              {assigneeTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  title={task.title}
                  priority={task.priority}
                  dueDate={task.dueDate}
                  frequency={task.frequency}
                  customDays={task.customDays}
                  startDate={task.startDate}
                  endDate={task.endDate}
                  onEdit={() => handleEditTask(task)}
                />
              ))}
            </div>
          </div>
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
          onCancel={() => {
            setShowTaskForm(false);
            setEditingTask(null);
          }}
          familyMembers={familyData.members}
          initialValues={editingTask ? {
            ...editingTask,
            dueDate: editingTask.dueDate ? new Date(editingTask.dueDate) : undefined,
            startDate: editingTask.startDate ? new Date(editingTask.startDate) : undefined,
            endDate: editingTask.endDate ? new Date(editingTask.endDate) : undefined,
          } : undefined}
        />
      )}

      {showActivityRecorder && familyData && (
        <ActivityRecorder
          familyMembers={familyData.members}
          onClose={() => setShowActivityRecorder(false)}
        />
      )}
    </div>
  );
};