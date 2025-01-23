import { FamilyDetailsForm } from "./FamilyDetailsForm";
import { TaskForm } from "./TaskForm";
import { ActivityRecorder } from "./ActivityRecorder";
import { TaskTrends } from "./TaskTrends";
import { DashboardHeader } from "./dashboard/DashboardHeader";
import { TaskFilters } from "./dashboard/TaskFilters";
import { TaskGroups } from "./dashboard/TaskGroups";
import { useDashboardState } from "@/hooks/useDashboardState";
import { useDashboardHandlers } from "@/hooks/useDashboardHandlers";
import { groupTasks } from "@/utils/taskGrouping";

export const Dashboard = () => {
  const {
    tasks,
    setTasks,
    showFamilyForm,
    setShowFamilyForm,
    showTaskForm,
    setShowTaskForm,
    showActivityRecorder,
    setShowActivityRecorder,
    editingTask,
    setEditingTask,
    familyData,
    setFamilyData,
    taskRecords,
    showEditFamily,
    setShowEditFamily,
    groupBy,
    setGroupBy,
    showTrends,
    setShowTrends,
    trendsTimeframe,
    setTrendsTimeframe,
  } = useDashboardState();

  const {
    handleFamilySubmit,
    handleAddTask,
    handleEditTask,
  } = useDashboardHandlers({
    tasks,
    setTasks,
    familyData,
    setFamilyData,
    setShowFamilyForm,
    setShowEditFamily,
    setShowTaskForm,
    setEditingTask,
  });

  if (showFamilyForm || showEditFamily) {
    return (
      <FamilyDetailsForm 
        onSubmit={handleFamilySubmit}
        initialValues={showEditFamily ? familyData : undefined}
      />
    );
  }

  const groupedTasks = groupTasks(tasks, groupBy);

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
          initialValues={editingTask}
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