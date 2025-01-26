import { useState } from "react";
import { toast } from "sonner";

export const useTaskManagement = () => {
  const [showTaskForm, setShowTaskForm] = useState(false);

  const handleAddTask = (hasFamilyData: boolean) => {
    if (!hasFamilyData) {
      console.error("No family data available");
      toast.error("No family data available");
      return;
    }
    setShowTaskForm(true);
  };

  return {
    showTaskForm,
    setShowTaskForm,
    handleAddTask
  };
};