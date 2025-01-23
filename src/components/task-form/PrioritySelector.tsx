import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface PrioritySelectorProps {
  priority: "low" | "medium" | "high";
  onPriorityChange: (value: "low" | "medium" | "high") => void;
}

export const PrioritySelector = ({
  priority,
  onPriorityChange,
}: PrioritySelectorProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="priority">Priority</Label>
      <Select value={priority} onValueChange={onPriorityChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="low">Low</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="high">High</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};