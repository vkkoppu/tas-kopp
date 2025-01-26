import { useState } from "react";
import { Task } from "@/types/task";

export const useTaskManagement = () => {
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const handleAddTask = (hasFamilyData: boolean) => {
    if (!hasFamilyData) {
      console.error("No family data available");
      return;
    }
    setShowTaskForm(true);
  };

  return {
    showTaskForm,
    setShowTaskForm,
    editingTask,
    setEditingTask,
    handleAddTask
  };
};