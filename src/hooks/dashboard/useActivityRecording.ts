
import { useState, useEffect } from "react";
import { ActivityRecord } from "@/components/activity-recorder/shared-types";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useActivityRecording = () => {
  const [showActivityRecorder, setShowActivityRecorder] = useState(false);
  const [taskRecords, setTaskRecords] = useState<ActivityRecord[]>([]);
  const { toast } = useToast();

  // Fetch task records when the component mounts
  useEffect(() => {
    const fetchTaskRecords = async () => {
      try {
        const { data, error } = await supabase
          .from('task_records')
          .select(`
            *,
            tasks (
              id,
              title
            ),
            family_members (
              id,
              name
            )
          `)
          .order('completed_at', { ascending: false });

        if (error) {
          console.error('Error fetching task records:', error);
          toast({
            title: "Error",
            description: "Failed to fetch activity records",
            variant: "destructive",
          });
          return;
        }

        // Transform the data to match ActivityRecord type
        const formattedRecords: ActivityRecord[] = data.map(record => ({
          taskId: record.task_id,
          completed: true,
          date: record.completed_at.split('T')[0], // Extract date part only
          completedBy: record.family_members?.name || 'Unknown',
        }));

        setTaskRecords(formattedRecords);
      } catch (error) {
        console.error('Error in fetchTaskRecords:', error);
        toast({
          title: "Error",
          description: "Failed to fetch activity records",
          variant: "destructive",
        });
      }
    };

    fetchTaskRecords();
  }, []);

  const handleActivityRecorded = async (newRecords: ActivityRecord[]) => {
    try {
      // Update the local state first for immediate UI feedback
      setTaskRecords(prev => [...newRecords, ...prev]);
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
