import { FamilyDetailsForm } from "@/components/FamilyDetailsForm";
import { useFamily } from "@/hooks/use-family";
import { useDashboardHandlers } from "@/hooks/useDashboardHandlers";
import { useDashboardState } from "@/hooks/useDashboardState";
import { Navigation } from "@/components/Navigation";

const Profile = () => {
  const {
    tasks,
    setTasks,
    setShowFamilyForm,
    setShowEditFamily,
    setShowTaskForm,
    setEditingTask,
  } = useDashboardState();

  const { family, isLoading } = useFamily();

  const familyData = family ? {
    familyName: family.name,
    members: family.members.map(member => ({
      name: member.name,
      role: member.role,
    }))
  } : null;

  const { handleFamilySubmit } = useDashboardHandlers({
    tasks,
    setTasks,
    familyData,
    setFamilyData: () => {}, // We don't need this since we're using React Query
    setShowFamilyForm,
    setShowEditFamily,
    setShowTaskForm,
    setEditingTask,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <Navigation />
      <FamilyDetailsForm 
        onSubmit={handleFamilySubmit}
        initialValues={familyData}
      />
    </div>
  );
};

export default Profile;