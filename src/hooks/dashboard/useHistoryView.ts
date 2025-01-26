import { useState } from "react";
import { toast } from "sonner";

export const useHistoryView = () => {
  const [showHistory, setShowHistory] = useState(false);

  const handleViewHistory = (hasFamilyData: boolean) => {
    if (!hasFamilyData) {
      console.error("No family data available");
      toast.error("No family data available");
      return;
    }
    setShowHistory(true);
  };

  return {
    showHistory,
    setShowHistory,
    handleViewHistory
  };
};