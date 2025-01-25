import { useState, useEffect } from "react";
import { Dashboard } from "@/components/Dashboard";
import { Task } from "@/types/task";
import { FamilyData } from "@/types/family";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [familyData, setFamilyData] = useState<FamilyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFamilyData = async () => {
      try {
        // First get the user's family
        const { data: familiesData, error: familiesError } = await supabase
          .from('families')
          .select('*')
          .single();

        if (familiesError) {
          console.error('Error fetching family:', familiesError);
          toast.error("Failed to fetch family data");
          return;
        }

        if (!familiesData) {
          console.log('No family found for user');
          return;
        }

        // Then get the family members
        const { data: membersData, error: membersError } = await supabase
          .from('family_members')
          .select('*')
          .eq('family_id', familiesData.id);

        if (membersError) {
          console.error('Error fetching family members:', membersError);
          toast.error("Failed to fetch family members");
          return;
        }

        // Format the data to match FamilyData type
        const formattedFamilyData: FamilyData = {
          id: familiesData.id,
          familyName: familiesData.name,
          members: membersData.map(member => ({
            id: member.id,
            name: member.name,
            role: member.role
          }))
        };

        console.log('Fetched family data:', formattedFamilyData);
        setFamilyData(formattedFamilyData);

        // Fetch tasks for this family
        const { data: tasksData, error: tasksError } = await supabase
          .from('tasks')
          .select(`
            *,
            task_assignments(
              family_member_id,
              family_members(
                id,
                name
              )
            )
          `)
          .eq('family_id', familiesData.id);

        if (tasksError) {
          console.error('Error fetching tasks:', tasksError);
          toast.error("Failed to fetch tasks");
          return;
        }

        console.log('Raw tasks data:', tasksData);

        // Format tasks data with proper type checking
        const formattedTasks: Task[] = tasksData.map(task => {
          // Extract assigned member names from task_assignments
          const assignedTo = task.task_assignments
            .map((assignment: any) => assignment.family_members?.name)
            .filter((name: string | undefined): name is string => Boolean(name));

          return {
            id: task.id,
            title: task.title,
            priority: task.priority as "low" | "medium" | "high",
            frequency: task.frequency as "once" | "daily" | "weekly" | "custom",
            customDays: task.custom_days || undefined,
            dueDate: task.due_date || undefined,
            startDate: task.start_date || undefined,
            endDate: task.end_date || undefined,
            assignedTo
          };
        });

        console.log('Formatted tasks:', formattedTasks);
        setTasks(formattedTasks);
      } catch (error) {
        console.error('Error in fetchFamilyData:', error);
        toast.error("An error occurred while fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchFamilyData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Dashboard
      familyData={familyData}
      tasks={tasks}
      setTasks={setTasks}
    />
  );
};

export default Index;