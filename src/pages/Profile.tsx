import { FamilyDetailsForm } from "@/components/FamilyDetailsForm";
import { useFamily } from "@/hooks/use-family";
import { Navigation } from "@/components/Navigation";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const Profile = () => {
  const { family, isLoading, updateFamily } = useFamily();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !family) {
      navigate("/");
    }
  }, [family, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!family) {
    return null;
  }

  const familyData = {
    familyName: family.name,
    members: family.members.map(member => ({
      name: member.name,
      role: member.role,
    }))
  };

  const handleFamilySubmit = async (data: { familyName: string; members: { name: string; role: string; }[] }) => {
    try {
      await updateFamily.mutateAsync({
        name: data.familyName,
        members: data.members
      });
      navigate("/");
    } catch (error) {
      console.error("Error updating family:", error);
    }
  };

  const handleCancel = () => {
    navigate("/");
  };

  return (
    <div className="container py-8">
      <Navigation />
      <div className="flex justify-end mb-4">
        <Button variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
      </div>
      <FamilyDetailsForm 
        onSubmit={handleFamilySubmit}
        initialValues={familyData}
      />
    </div>
  );
};

export default Profile;