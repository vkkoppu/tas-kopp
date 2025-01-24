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
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FamilyMember } from "@/types/family";
import { Navigation } from "./Navigation";
import { useFamily } from "@/hooks/use-family";

export const Dashboard = () => {
  const { family, isLoading } = useFamily();
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
    setTaskRecords,
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

  // Fetch task records when component mounts
  useEffect(() => {
    const fetchTaskRecords = async () => {
      if (!familyData) return;
      
      const { data, error } = await supabase
        .from('task_records')
        .select(`
          id,
          task_id,
          completed_by,
          completed_at,
          tasks (title),
          family_members (name)
        `)
        .order('completed_at', { ascending: false });

      if (error) {
        console.error('Error fetching task records:', error);
        return;
      }

      const formattedRecords = data.map(record => ({
        taskId: record.task_id,
        completed: true,
        date: new Date(record.completed_at).toISOString().split('T')[0],
        completedBy: record.family_members?.name || 'Unknown',
      }));

      setTaskRecords(formattedRecords);
    };

    fetchTaskRecords();
  }, [familyData]);

  // Show loading state while checking family data
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show family form only if no family exists or if explicitly requested
  if (!family || showFamilyForm || showEditFamily) {
    return (
      <>
        <Navigation />
        <FamilyDetailsForm 
          onSubmit={handleFamilySubmit}
          initialValues={showEditFamily ? familyData : undefined}
        />
      </>
    );
  }

  const groupedTasks = groupTasks(tasks, groupBy);

  return (
    <div className="container py-8 animate-fade-in">
      <Navigation />
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
          familyMembers={familyData.members as FamilyMember[]}
          initialValues={editingTask}
        />
      )}

      {showActivityRecorder && familyData && (
        <ActivityRecorder
          familyMembers={familyData.members as FamilyMember[]}
          tasks={tasks}
          onClose={() => setShowActivityRecorder(false)}
          records={taskRecords}
          onRecordAdded={(newRecords) => setTaskRecords([...taskRecords, ...newRecords])}
        />
      )}
    </div>
  );
};