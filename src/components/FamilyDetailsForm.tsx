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

interface FamilyMember {
  name: string;
  role: string;
}

export const FamilyDetailsForm = () => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here we would typically save the family details
    console.log({ familyName, members });
  };

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
          {members.map((member, index) => (
            <div key={index} className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  value={member.name}
                  onChange={(e) => updateMember(index, "name", e.target.value)}
                  placeholder="Member name"
                  required
                />
              </div>
              <div>
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
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-4">
          <Button type="button" variant="outline" onClick={handleAddMember}>
            Add Family Member
          </Button>
          <Button type="submit">Continue</Button>
        </div>
      </form>
    </div>
  );
};