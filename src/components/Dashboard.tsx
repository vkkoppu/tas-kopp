import { useState } from "react";
import { TaskCard } from "./TaskCard";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, BarChart2 } from "lucide-react";
import { FamilyDetailsForm } from "./FamilyDetailsForm";
import { TaskForm } from "./TaskForm";
import { format } from "date-fns";
import { ActivityRecorder } from "./ActivityRecorder";
import { TaskTrends } from "./TaskTrends";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  assignedTo: string[];
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
  const [showEditFamily, setShowEditFamily] = useState(false);
  const [groupBy, setGroupBy] = useState<"individual" | "shared">("individual");
  const [showTrends, setShowTrends] = useState(false);
  const [trendsTimeframe, setTrendsTimeframe] = useState<"week" | "month">("week");

  const handleFamilySubmit = (data: { familyName: string; members: FamilyMember[] }) => {
    setFamilyData(data);
    // Update task assignees when family members are renamed
    if (familyData) {
      const oldToNewNames = new Map(
        familyData.members.map((oldMember) => {
          const newMember = data.members.find((m) => m.role === oldMember.role);
          return [oldMember.name, newMember?.name || oldMember.name];
        })
      );

      setTasks(tasks.map(task => ({
        ...task,
        assignedTo: oldToNewNames.get(task.assignedTo) || task.assignedTo
      })));
    }
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

  const groupTasks = () => {
    if (groupBy === "shared") {
      const sharedTasks = tasks.filter(task => 
        tasks.filter(t => t.title === task.title).length > 1
      );
      const individualTasks = tasks.filter(task => 
        !sharedTasks.some(st => st.title === task.title)
      );
      
      return {
        "Shared Tasks": sharedTasks,
        "Individual Tasks": individualTasks
      };
    }
    return groupTasksByAssignee();
  };

  const handleEditFamily = () => {
    setShowEditFamily(true);
  };

  if (showFamilyForm || showEditFamily) {
    return (
      <FamilyDetailsForm 
        onSubmit={handleFamilySubmit}
        initialValues={showEditFamily ? familyData : undefined}
      />
    );
  }

  const groupedTasks = groupTasks();

  return (
    <div className="container py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-bold mb-2">
              {familyData?.familyName}'s Tasks
            </h1>
            <Button
              variant="outline"
              size="sm"
              onClick={handleEditFamily}
              className="mb-2"
            >
              Edit Family
            </Button>
          </div>
          <p className="text-muted-foreground">
            Track and manage your family's daily activities
          </p>
        </div>
        <div className="flex gap-4">
          <Button className="gap-2" onClick={() => setShowTaskForm(true)}>
            <Plus className="h-4 w-4" />
            Add Task
          </Button>
          {tasks.length > 0 && (
            <>
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={() => setShowActivityRecorder(true)}
              >
                <Calendar className="h-4 w-4" />
                Record Activities
              </Button>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => setShowTrends(!showTrends)}
              >
                <BarChart2 className="h-4 w-4" />
                {showTrends ? "Hide" : "Show"} Trends
              </Button>
            </>
          )}
        </div>
      </div>

      {tasks.length > 0 && (
        <div className="flex justify-between items-center mb-6">
          <Select value={groupBy} onValueChange={(value: "individual" | "shared") => setGroupBy(value)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Group by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="individual">By Individual</SelectItem>
              <SelectItem value="shared">By Shared/Individual</SelectItem>
            </SelectContent>
          </Select>

          {showTrends && (
            <Select value={trendsTimeframe} onValueChange={(value: "week" | "month") => setTrendsTimeframe(value)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Timeframe..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Last Week</SelectItem>
                <SelectItem value="month">Last Month</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      )}

      {showTrends && tasks.length > 0 && (
        <div className="mb-8">
          <TaskTrends 
            taskRecords={taskRecords}
            tasks={tasks}
            timeframe={trendsTimeframe}
          />
        </div>
      )}

      {Object.entries(groupedTasks).map(([group, groupTasks]) => (
        <div key={group} className="space-y-4">
          <h2 className="text-2xl font-semibold">{group}</h2>
          <div className="grid gap-4">
            {groupTasks.map((task) => (
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
          tasks={tasks}
          onClose={() => setShowActivityRecorder(false)}
        />
      )}
    </div>
  );
};
