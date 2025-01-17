import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface FrequencySelectorProps {
  frequency: "once" | "daily" | "weekly" | "custom";
  customDays?: number;
  onFrequencyChange: (value: "once" | "daily" | "weekly" | "custom") => void;
  onCustomDaysChange: (value: number) => void;
}

export const FrequencySelector = ({
  frequency,
  customDays,
  onFrequencyChange,
  onCustomDaysChange,
}: FrequencySelectorProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="frequency">Frequency</Label>
      <Select value={frequency} onValueChange={onFrequencyChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select frequency" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="once">One Time</SelectItem>
          <SelectItem value="daily">Daily</SelectItem>
          <SelectItem value="weekly">Weekly</SelectItem>
          <SelectItem value="custom">Custom</SelectItem>
        </SelectContent>
      </Select>

      {frequency === "custom" && (
        <div className="space-y-2">
          <Label htmlFor="customDays">Repeat every X days</Label>
          <Input
            id="customDays"
            type="number"
            min={1}
            value={customDays}
            onChange={(e) => onCustomDaysChange(Number(e.target.value))}
            placeholder="Enter number of days"
            required
          />
        </div>
      )}
    </div>
  );
};