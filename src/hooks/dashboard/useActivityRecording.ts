import { useState } from "react";
import { ActivityRecord } from "@/components/activity-recorder/shared-types";
import { useToast } from "@/components/ui/use-toast";

export const useActivityRecording = () => {
  const [showActivityRecorder, setShowActivityRecorder] = useState(false);
  const [taskRecords, setTaskRecords] = useState<ActivityRecord[]>([]);
  const { toast } = useToast();

  const handleActivityRecorded = async (newRecords: ActivityRecord[]) => {
    try {
      setTaskRecords(prev => [...prev, ...newRecords]);
      setShowActivityRecorder(false);
      toast({
        title: "Success",
        description: "Activities recorded successfully",
      });
    } catch (error) {
      console.error('Error handling activity records:', error);
      toast({
        title: "Error",
        description: "Failed to record activities",
        variant: "destructive",
      });
    }
  };

  return {
    showActivityRecorder,
    setShowActivityRecorder,
    taskRecords,
    handleActivityRecorded
  };
};