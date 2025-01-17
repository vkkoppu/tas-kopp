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

interface FamilyMember {
  name: string;
  role: string;
}

interface FamilyDetailsFormProps {
  onSubmit: (data: { familyName: string; members: FamilyMember[] }) => void;
}

export const FamilyDetailsForm = ({ onSubmit }: FamilyDetailsFormProps) => {
  const [familyName, setFamilyName] = useState("");
  const [members, setMembers] = useState<FamilyMember[]>([
    { name: "", role: "parent" },
  ]);

  const handleAddMember = () => {
    setMembers([...members, { name: "", role: "child" }]);
  };

  const updateMember = (index: number, field: keyof FamilyMember, value: string) => {
    const newMembers = [...members];
    newMembers[index] = { ...newMembers[index], [field]: value };
    setMembers(newMembers);
  };

  const handleDeleteMember = (index: number) => {
    if (members.length > 1) {
      const newMembers = members.filter((_, i) => i !== index);
      setMembers(newMembers);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (familyName.trim() && members.every(member => member.name.trim())) {
      onSubmit({ familyName, members });
    }
  };

  const isFormValid = familyName.trim() && members.every(member => member.name.trim());

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
          <Button type="submit" disabled={!isFormValid}>
            Continue
          </Button>
        </div>
      </form>
    </div>
  );
};