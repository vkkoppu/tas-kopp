import { FamilyDetailsForm } from "./FamilyDetailsForm";
import { ActivityRecorder } from "./ActivityRecorder";
import { TaskTrends } from "./TaskTrends";
import { DashboardHeader } from "./dashboard/DashboardHeader";
import { TaskFilters } from "./dashboard/TaskFilters";
import { useDashboardState } from "@/hooks/useDashboardState";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "./Navigation";
import { useFamily } from "@/hooks/use-family";
import { toast } from "sonner";
import { TaskManager } from "./dashboard/TaskManager";
import { HistoryView } from "./history/HistoryView";

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
    showHistory,
    setShowHistory,
  } = useDashboardState();

  const cleanupOrphanedTasks = async (familyId: string) => {
    try {
      const { data: familyTasks, error: fetchError } = await supabase
        .from('tasks')
        .select('id')
        .eq('family_id', familyId);

      if (fetchError) {
        console.error('Error fetching tasks:', fetchError);
        return;
      }

      if (!familyTasks || familyTasks.length === 0) return;

      const { data: tasksWithAssignments, error: assignmentsError } = await supabase
        .from('task_assignments')
        .select('task_id')
        .in('task_id', familyTasks.map(t => t.id));

      if (assignmentsError) {
        console.error('Error fetching task assignments:', assignmentsError);
        return;
      }

      const assignedTaskIds = new Set(tasksWithAssignments?.map(t => t.task_id) || []);
      const orphanedTasks = familyTasks.filter(task => !assignedTaskIds.has(task.id));

      if (orphanedTasks.length > 0) {
        const { error: deleteError } = await supabase
          .from('tasks')
          .delete()
          .in('id', orphanedTasks.map(t => t.id));

        if (deleteError) {
          console.error('Error deleting orphaned tasks:', deleteError);
          return;
        }

        console.log(`Cleaned up ${orphanedTasks.length} orphaned tasks`);
        toast.success(`Cleaned up ${orphanedTasks.length} tasks without assignments`);
      }
    } catch (error) {
      console.error('Error in cleanupOrphanedTasks:', error);
    }
  };

  useEffect(() => {
    const fetchTasks = async () => {
      if (!family) return;
      
      try {
        console.log('Fetching tasks for family:', family.id);
        const { data, error } = await supabase
          .from('tasks')
          .select(`
            id,
            title,
            priority,
            frequency,
            custom_days,
            due_date,
            start_date,
            end_date,
            task_assignments (
              family_member_id,
              family_members (
                name
              )
            )
          `)
          .eq('family_id', family.id);

        if (error) {
          console.error('Error fetching tasks:', error);
          toast.error("Failed to load tasks");
          return;
        }

        console.log('Fetched tasks:', data);

        const formattedTasks = data.map(task => ({
          id: task.id,
          title: task.title,
          priority: task.priority as "low" | "medium" | "high",
          frequency: task.frequency as "once" | "daily" | "weekly" | "custom",
          customDays: task.custom_days,
          dueDate: task.due_date,
          startDate: task.start_date,
          endDate: task.end_date,
          assignedTo: task.task_assignments
            .map(assignment => assignment.family_members?.name)
            .filter(Boolean)
        }));

        setTasks(formattedTasks);
        await cleanupOrphanedTasks(family.id);
      } catch (error) {
        console.error('Error in fetchTasks:', error);
        toast.error("Failed to load tasks");
      }
    };

    fetchTasks();
  }, [family, setTasks]);

  useEffect(() => {
    const fetchTaskRecords = async () => {
      if (!family) return;
      
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
  }, [family, setTaskRecords]);

  useEffect(() => {
    if (family) {
      setFamilyData({
        familyName: family.name,
        members: family.members.map(member => ({
          id: member.id,
          name: member.name,
          role: member.role,
        }))
      });
    }
  }, [family, setFamilyData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!family) {
    return (
      <>
        <Navigation />
        <FamilyDetailsForm 
          onSubmit={() => {}}
          initialValues={undefined}
        />
      </>
    );
  }

  return (
    <div className="container py-8 animate-fade-in">
      <Navigation />
      <DashboardHeader
        familyName={family.name}
        onEditFamily={() => setShowEditFamily(true)}
        onAddTask={() => setShowTaskForm(true)}
        onRecordActivities={() => setShowActivityRecorder(true)}
        onViewHistory={() => setShowHistory(true)}
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
        <TaskManager
          tasks={tasks}
          setTasks={setTasks}
          familyMembers={family.members}
          familyId={family.id}
          showTaskForm={showTaskForm}
          setShowTaskForm={setShowTaskForm}
        />
      ) : (
        <p className="text-center text-muted-foreground py-8">
          No tasks yet. Click the "Add Task" button to get started!
        </p>
      )}

      {showActivityRecorder && (
        <ActivityRecorder
          familyMembers={family.members}
          tasks={tasks}
          onClose={() => setShowActivityRecorder(false)}
          records={taskRecords}
          onRecordAdded={(newRecords) => setTaskRecords([...taskRecords, ...newRecords])}
        />
      )}

      {showHistory && (
        <HistoryView
          records={taskRecords}
          tasks={tasks}
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  );
};