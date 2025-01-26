import { TaskManager } from "@/components/dashboard/TaskManager";
import { TaskHistory } from "@/components/dashboard/TaskHistory";
import { ActivityRecorder } from "@/components/ActivityRecorder";
import { FamilyData } from "@/types/family";
import { Task } from "@/types/task";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { FamilyDetailsForm } from "@/components/FamilyDetailsForm";
import { useActivityRecording } from "@/hooks/dashboard/useActivityRecording";
import { useHistoryView } from "@/hooks/dashboard/useHistoryView";
import { useTaskManagement } from "@/hooks/dashboard/useTaskManagement";

interface DashboardProps {
  familyData: FamilyData | null;
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
}

export const Dashboard = ({ familyData, tasks, setTasks }: DashboardProps) => {
  const {
    showTaskForm,
    setShowTaskForm,
    handleAddTask
  } = useTaskManagement();

  const {
    showActivityRecorder,
    setShowActivityRecorder,
    taskRecords,
    handleActivityRecorded
  } = useActivityRecording();

  const {
    showHistory,
    setShowHistory,
    handleViewHistory
  } = useHistoryView();

  console.log("Dashboard - Received familyData:", familyData);
  console.log("Dashboard - Received tasks:", tasks);

  const handleRecordActivities = () => {
    if (!familyData) {
      console.error("No family data available");
      return;
    }
    if (showHistory) {
      setShowHistory(false);
    }
    setShowActivityRecorder(true);
  };

  const handleShowHistory = () => {
    if (showActivityRecorder) {
      setShowActivityRecorder(false);
    }
    handleViewHistory(!!familyData);
  };

  const handleFamilySubmit = () => {
    window.location.reload();
  };

  if (!familyData) {
    console.log("Dashboard - No family data available, showing family setup form");
    return (
      <div className="p-6">
        <Navigation />
        <FamilyDetailsForm onSubmit={handleFamilySubmit} />
      </div>
    );
  }

  return (
    <div>
      <Navigation />
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Family Dashboard</h1>
        <div className="flex flex-wrap gap-4 mb-8">
          <Button onClick={() => handleAddTask(!!familyData)} variant="default">
            Add Task
          </Button>
          <Button onClick={handleRecordActivities} variant="secondary">
            Record Activities
          </Button>
          <Button onClick={handleShowHistory} variant="secondary">
            View History
          </Button>
        </div>

        {showTaskForm && (
          <TaskManager
            tasks={tasks}
            setTasks={setTasks}
            familyMembers={familyData.members}
            familyId={familyData.id || ""}
            showTaskForm={showTaskForm}
            setShowTaskForm={setShowTaskForm}
          />
        )}

        {!showTaskForm && tasks.length > 0 && (
          <TaskManager
            tasks={tasks}
            setTasks={setTasks}
            familyMembers={familyData.members}
            familyId={familyData.id || ""}
            showTaskForm={showTaskForm}
            setShowTaskForm={setShowTaskForm}
          />
        )}

        {showActivityRecorder && (
          <ActivityRecorder
            familyMembers={familyData.members}
            tasks={tasks}
            onClose={() => setShowActivityRecorder(false)}
            records={taskRecords}
            onRecordAdded={handleActivityRecorded}
          />
        )}

        {showHistory && (
          <TaskHistory
            records={taskRecords}
            tasks={tasks}
            onClose={() => setShowHistory(false)}
            familyMembers={familyData.members}
          />
        )}
      </div>
    </div>
  );
};