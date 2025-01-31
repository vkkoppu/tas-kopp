import { TaskForm } from "@/components/TaskForm";
import { TaskGroups } from "./TaskGroups";
import { Task } from "@/types/task";
import { FamilyMember } from "@/types/family";
import { useTaskOperations } from "@/hooks/tasks/useTaskOperations";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TaskManagerProps {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  familyMembers: FamilyMember[];
  familyId: string;
  showTaskForm: boolean;
  setShowTaskForm: (show: boolean) => void;
  editingTask: Task | null;
  setEditingTask: (task: Task | null) => void;
}

export const TaskManager = ({
  tasks,
  setTasks,
  familyMembers,
  familyId,
  showTaskForm,
  setShowTaskForm,
  editingTask,
  setEditingTask,
}: TaskManagerProps) => {
  const {
    handleSubmit,
  } = useTaskOperations(tasks, setTasks, familyId);

  const handleEditTask = async (task: Task) => {
    console.log("Editing task in TaskManager:", task);
    setEditingTask(task);
    setShowTaskForm(true);
  };

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

  return (
    <div className="relative">
      {showTaskForm && (
        <TaskForm
          onCancel={() => {
            setShowTaskForm(false);
            setEditingTask(null);
          }}
          onSubmit={handleSubmit}
          editingTask={editingTask}
          tasks={tasks}
          setTasks={setTasks}
          familyMembers={familyMembers}
        />
      )}

      <TaskGroups
        groupedTasks={tasks}
        onEditTask={handleEditTask}
        onDeleteTask={handleDeleteTask}
      />
    </div>
  );
};