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
import { Navigation } from "./Navigation";
import { useFamily } from "@/hooks/use-family";
import { toast } from "sonner";
import { Task } from "@/types/task";

// Helper function to validate priority
const validatePriority = (priority: string): "low" | "medium" | "high" => {
  if (priority === "low" || priority === "medium" || priority === "high") {
    return priority;
  }
  return "medium"; // Default fallback
};

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
    familyData: family ? { ...familyData, id: family.id } : null,
    setFamilyData,
    setShowFamilyForm,
    setShowEditFamily,
    setShowTaskForm,
    setEditingTask,
  });

  const handleDeleteTask = async (task: Task) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', task.id);

      if (error) {
        console.error('Error deleting task:', error);
        toast.error("Failed to delete task");
        return;
      }

      setTasks(tasks.filter(t => t.id !== task.id));
      toast.success("Task deleted successfully");
    } catch (error) {
      console.error('Error in handleDeleteTask:', error);
      toast.error("Failed to delete task");
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
          priority: validatePriority(task.priority),
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
      } catch (error) {
        console.error('Error in fetchTasks:', error);
        toast.error("Failed to load tasks");
      }
    };

    fetchTasks();
  }, [family, setTasks]);

  // Always declare useEffect hooks at the top level, regardless of conditions
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

  // Always declare all useEffect hooks, even if they depend on conditions
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

  // Show loading state while checking family data
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show family form only if no family exists
  if (!family) {
    return (
      <>
        <Navigation />
        <FamilyDetailsForm 
          onSubmit={handleFamilySubmit}
          initialValues={undefined}
        />
      </>
    );
  }

  const groupedTasks = groupTasks(tasks, groupBy);

  return (
    <div className="container py-8 animate-fade-in">
      <Navigation />
      <DashboardHeader
        familyName={family.name}
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
          onDeleteTask={handleDeleteTask}
        />
      ) : (
        <p className="text-center text-muted-foreground py-8">
          No tasks yet. Click the "Add Task" button to get started!
        </p>
      )}

      {showTaskForm && family && (
        <TaskForm
          onSubmit={handleAddTask}
          onCancel={() => {
            setShowTaskForm(false);
            setEditingTask(null);
          }}
          familyMembers={family.members}
          initialValues={editingTask}
        />
      )}

      {showActivityRecorder && family && (
        <ActivityRecorder
          familyMembers={family.members}
          tasks={tasks}
          onClose={() => setShowActivityRecorder(false)}
          records={taskRecords}
          onRecordAdded={(newRecords) => setTaskRecords([...taskRecords, ...newRecords])}
        />
      )}
    </div>
  );
};
