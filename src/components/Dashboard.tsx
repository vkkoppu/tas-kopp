import { useState } from "react";
import { TaskManager } from "@/components/dashboard/TaskManager";
import { TaskHistory } from "@/components/dashboard/TaskHistory";
import { ActivityRecorder } from "@/components/ActivityRecorder";
import { FamilyData } from "@/types/family";
import { Task } from "@/types/task";
import { Button } from "@/components/ui/button";

interface DashboardProps {
  familyData: FamilyData | null;
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
}

export const Dashboard = ({ familyData, tasks, setTasks }: DashboardProps) => {
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showActivityRecorder, setShowActivityRecorder] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const handleAddTask = () => {
    setShowTaskForm(true);
  };

  const handleRecordActivities = () => {
    setShowActivityRecorder(true);
  };

  const handleViewHistory = () => {
    setShowActivityRecorder(false);
    setShowHistory(true);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Family Dashboard</h1>
      <div className="flex flex-wrap gap-4 mb-8">
        <Button onClick={handleAddTask} variant="default">
          Add Task
        </Button>
        <Button onClick={handleRecordActivities} variant="secondary">
          Record Activities
        </Button>
        <Button onClick={handleViewHistory} variant="secondary">
          View History
        </Button>
      </div>

      {showTaskForm && (
        <TaskManager
          tasks={tasks}
          setTasks={setTasks}
          familyMembers={familyData?.members || []}
          familyId={familyData?.id || ""}
          showTaskForm={showTaskForm}
          setShowTaskForm={setShowTaskForm}
        />
      )}

      {showActivityRecorder && (
        <ActivityRecorder
          familyMembers={familyData?.members || []}
          tasks={tasks}
          onClose={() => setShowActivityRecorder(false)}
          records={[]}
          onRecordAdded={() => {}}
        />
      )}

      {showHistory && (
        <TaskHistory
          records={[]}
          tasks={tasks}
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  );
};