import { FamilyDetailsForm } from "@/components/FamilyDetailsForm";
import { useDashboardState } from "@/hooks/useDashboardState";
import { useDashboardHandlers } from "@/hooks/useDashboardHandlers";

const Profile = () => {
  const {
    familyData,
    setFamilyData,
    tasks,
    setTasks,
    setShowFamilyForm,
    setShowEditFamily,
    setShowTaskForm,
    setEditingTask,
  } = useDashboardState();

  const { handleFamilySubmit } = useDashboardHandlers({
    tasks,
    setTasks,
    familyData,
    setFamilyData,
    setShowFamilyForm,
    setShowEditFamily,
    setShowTaskForm,
    setEditingTask,
  });

  return (
    <div className="container py-8">
      <FamilyDetailsForm 
        onSubmit={handleFamilySubmit}
        initialValues={familyData}
      />
    </div>
  );
};

export default Profile;