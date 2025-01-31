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
import { useState } from "react";

interface DashboardProps {
  familyData: FamilyData | null;
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
}

export const Dashboard = ({ familyData, tasks, setTasks }: DashboardProps) => {
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
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

  const closeAllModals = () => {
    setShowHistory(false);
    setShowActivityRecorder(false);
    setShowTaskForm(false);
    setEditingTask(null);
  };

  const handleRecordActivities = () => {
    if (!familyData) {
      console.error("No family data available");
      return;
    }
    closeAllModals();
    setShowActivityRecorder(true);
  };

  const handleShowHistory = () => {
    closeAllModals();
    handleViewHistory(!!familyData);
  };

  if (!familyData) {
    return (
      <div className="p-6 bg-pastel-purple/10 min-h-screen">
        <Navigation />
        <FamilyDetailsForm onSubmit={() => window.location.reload()} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pastel-purple/20 to-pastel-blue/20">
      <Navigation />
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-purple-primary">Family Dashboard</h1>
        <div className="flex flex-wrap gap-4 mb-8">
          <Button 
            onClick={() => {
              closeAllModals();
              handleAddTask(!!familyData);
            }} 
            className="bg-purple-primary hover:bg-purple-secondary text-white"
          >
            Add Task
          </Button>
          <Button 
            onClick={handleRecordActivities} 
            variant="secondary"
            className="bg-pastel-purple hover:bg-purple-soft text-purple-primary"
          >
            Record Activities
          </Button>
          <Button 
            onClick={handleShowHistory} 
            variant="secondary"
            className="bg-pastel-purple hover:bg-purple-soft text-purple-primary"
          >
            View History
          </Button>
        </div>

        <TaskManager
          tasks={tasks}
          setTasks={setTasks}
          familyMembers={familyData.members}
          familyId={familyData.id || ""}
          showTaskForm={showTaskForm}
          setShowTaskForm={setShowTaskForm}
          editingTask={editingTask}
          setEditingTask={setEditingTask}
        />

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
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className="relative w-full max-w-2xl h-[80vh] bg-white rounded-lg shadow-xl overflow-hidden">
              <TaskHistory
                records={taskRecords}
                tasks={tasks}
                onClose={() => setShowHistory(false)}
                familyMembers={familyData.members}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};