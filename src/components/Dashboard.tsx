import { useState } from "react";
import { format } from "date-fns";
import { FamilyDetailsForm } from "./FamilyDetailsForm";
import { TaskForm } from "./TaskForm";
import { ActivityRecorder } from "./ActivityRecorder";
import { TaskTrends } from "./TaskTrends";
import { DashboardHeader } from "./dashboard/DashboardHeader";
import { TaskFilters } from "./dashboard/TaskFilters";
import { TaskGroups } from "./dashboard/TaskGroups";

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

  const groupTasks = () => {
    if (groupBy === "shared") {
      const sharedTasks = tasks.filter(task => task.assignedTo.length > 1);
      const individualTasks = tasks.filter(task => task.assignedTo.length === 1);
      
      return {
        "Shared Tasks": sharedTasks,
        "Individual Tasks": individualTasks
      };
    }
    return groupTasksByAssignee();
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
      <DashboardHeader
        familyName={familyData?.familyName || ""}
        onEditFamily={() => setShowEditFamily(true)}
        onAddTask={() => setShowTaskForm(true)}
        onRecordActivities={() => setShowActivityRecorder(true)}
        onToggleTrends={() => setShowTrends(!showTrends)}
        showTrends={showTrends}
        hasExistingTasks={tasks.length > 0}
      />

      {tasks.length > 0 && (
        <TaskFilters
          groupBy={groupBy}
          onGroupByChange={(value) => setGroupBy(value)}
          showTrends={showTrends}
          trendsTimeframe={trendsTimeframe}
          onTrendsTimeframeChange={(value) => setTrendsTimeframe(value)}
        />
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

      {tasks.length > 0 ? (
        <TaskGroups
          groupedTasks={groupedTasks}
          onEditTask={handleEditTask}
        />
      ) : (
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