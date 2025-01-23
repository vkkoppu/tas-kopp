import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface AssigneeSelectorProps {
  familyMembers: { name: string; role: string }[];
  assignedTo: string[];
  onAssigneeChange: (assignees: string[]) => void;
}

export const AssigneeSelector = ({
  familyMembers,
  assignedTo,
  onAssigneeChange,
}: AssigneeSelectorProps) => {
  const handleValueChange = (value: string) => {
    if (assignedTo.includes(value)) {
      onAssigneeChange(assignedTo.filter(v => v !== value));
    } else {
      onAssigneeChange([...assignedTo, value]);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="assignedTo">Assign To (Required)</Label>
      <Select
        value={assignedTo[0]} // Use first value for display
        onValueChange={handleValueChange}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select family members" />
        </SelectTrigger>
        <SelectContent>
          {familyMembers.map((member, index) => (
            <SelectItem 
              key={index} 
              value={member.name}
              className="flex items-center gap-2"
            >
              <Checkbox 
                checked={assignedTo.includes(member.name)}
                className="mr-2"
              />
              {member.name} ({member.role})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {assignedTo.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {assignedTo.map((name) => (
            <Badge 
              key={name}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {name}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onAssigneeChange(assignedTo.filter(n => n !== name))}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};