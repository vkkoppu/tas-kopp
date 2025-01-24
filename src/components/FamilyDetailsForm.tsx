import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useFamily } from "@/hooks/use-family";
import { toast } from "sonner";

interface FamilyMember {
  name: string;
  role: string;
}

interface FamilyDetailsFormProps {
  onSubmit: (data: { familyName: string; members: FamilyMember[] }) => void;
  initialValues?: { familyName: string; members: FamilyMember[] } | null;
}

export const FamilyDetailsForm = ({ onSubmit, initialValues }: FamilyDetailsFormProps) => {
  const [familyName, setFamilyName] = useState(initialValues?.familyName || "");
  const [members, setMembers] = useState<FamilyMember[]>(
    initialValues?.members || [{ name: "", role: "parent" }]
  );
  const { createFamily, updateFamily } = useFamily();

  const handleAddMember = () => {
    setMembers([...members, { name: "", role: "child" }]);
  };

  const updateMember = (index: number, field: keyof FamilyMember, value: string) => {
    const newMembers = [...members];
    newMembers[index] = { ...newMembers[index], [field]: value };
    setMembers(newMembers);
  };

  const handleDeleteMember = async (index: number) => {
    if (members.length > 1) {
      try {
        const newMembers = members.filter((_, i) => i !== index);
        setMembers(newMembers);
        
        // If we're updating an existing family, update it immediately
        if (initialValues) {
          const familyData = {
            name: familyName,
            members: newMembers,
          };
          await updateFamily.mutateAsync(familyData);
          toast.success("Family member deleted successfully");
        }
      } catch (error) {
        console.error("Error deleting family member:", error);
        toast.error("Failed to delete family member");
        // Revert the state if the update fails
        setMembers(members);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (familyName.trim() && members.every(member => member.name.trim())) {
      const familyData = {
        name: familyName,
        members: members.map(member => ({
          name: member.name.trim(),
          role: member.role,
        })),
      };

      try {
        if (initialValues) {
          await updateFamily.mutateAsync(familyData);
        } else {
          await createFamily.mutateAsync(familyData);
        }
        onSubmit({ familyName, members });
      } catch (error) {
        console.error("Error saving family:", error);
        toast.error("Error saving family details");
      }
    }
  };

  const isFormValid = familyName.trim() && members.every(member => member.name.trim());
  const isLoading = createFamily.isPending || updateFamily.isPending;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8 animate-fade-in">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Welcome to Family Tasks</h1>
        <p className="text-muted-foreground">Let's start by setting up your family</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="familyName">Family Name</Label>
          <Input
            id="familyName"
            value={familyName}
            onChange={(e) => setFamilyName(e.target.value)}
            placeholder="Enter your family name"
            required
          />
        </div>

        <div className="space-y-4">
          <Label>Family Members</Label>
          <div className="space-y-4">
            {members.map((member, index) => (
              <div key={index} className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    value={member.name}
                    onChange={(e) => updateMember(index, "name", e.target.value)}
                    placeholder="Member name"
                    required
                  />
                </div>
                <div className="flex-1">
                  <Select
                    value={member.role}
                    onValueChange={(value) => updateMember(index, "role", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="parent">Parent</SelectItem>
                      <SelectItem value="child">Child</SelectItem>
                      <SelectItem value="grandparent">Grandparent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => handleDeleteMember(index)}
                  disabled={members.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Button type="button" variant="outline" onClick={handleAddMember}>
            Add Family Member
          </Button>
          <Button type="submit" disabled={!isFormValid || isLoading}>
            {isLoading ? "Saving..." : initialValues ? "Save Changes" : "Continue"}
          </Button>
        </div>
      </form>
    </div>
  );
};