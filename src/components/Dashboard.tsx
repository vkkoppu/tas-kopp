import { useState } from "react";
import { TaskManager } from "./TaskManager";
import { TaskHistory } from "./TaskHistory";
import { ActivityRecorder } from "./activity-recorder/ActivityRecorder";
import { FamilyData } from "@/types/family";
import { Task } from "@/types/task";

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
    setShowActivityRecorder(false); // Close activity recorder when opening history
    setShowHistory(true);
  };

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold">Family Dashboard</h1>
      <div className="mt-4">
        <button onClick={handleAddTask} className="btn">
          Add Task
        </button>
        <button onClick={handleRecordActivities} className="btn">
          Record Activities
        </button>
        <button onClick={handleViewHistory} className="btn">
          View History
        </button>
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
        />
      )}
    </div>
  );
};
