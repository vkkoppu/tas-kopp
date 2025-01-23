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
import { useState, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FrequencySelector } from "./task-form/FrequencySelector";
import { DateSelector } from "./task-form/DateSelector";
import { useNavigate } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { toast } from "sonner";

interface TaskFormProps {
  onSubmit: (task: {
    title: string;
    priority: "low" | "medium" | "high";
    dueDate?: Date;
    startDate?: Date;
    endDate?: Date;
    frequency: "once" | "daily" | "weekly" | "custom";
    customDays?: number;
    assignedTo: string[];
  }) => void;
  onCancel: () => void;
  familyMembers: { name: string; role: string }[];
  initialValues?: {
    title: string;
    priority: "low" | "medium" | "high";
    dueDate?: Date;
    startDate?: Date;
    endDate?: Date;
    frequency: "once" | "daily" | "weekly" | "custom";
    customDays?: number;
    assignedTo: string[];
  };
}

export const TaskForm = ({ onSubmit, onCancel, familyMembers, initialValues }: TaskFormProps) => {
  const navigate = useNavigate();
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [priority, setPriority] = useState<"low" | "medium" | "high">(initialValues?.priority ?? "medium");
  const [frequency, setFrequency] = useState<"once" | "daily" | "weekly" | "custom">(initialValues?.frequency ?? "once");
  const [customDays, setCustomDays] = useState<number | undefined>(initialValues?.customDays);
  const [dueDate, setDueDate] = useState<Date | undefined>(initialValues?.dueDate);
  const [startDate, setStartDate] = useState<Date | undefined>(initialValues?.startDate);
  const [endDate, setEndDate] = useState<Date | undefined>(initialValues?.endDate);
  const [assignedTo, setAssignedTo] = useState<string[]>(initialValues?.assignedTo ?? []);

  const endDateRef = useRef<HTMLButtonElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (assignedTo.length === 0) {
      toast({
        title: "Error",
        description: "Please assign the task to at least one family member",
        variant: "destructive",
      });
      return;
    }
    onSubmit({
      title,
      priority,
      frequency,
      customDays,
      dueDate: frequency === "once" ? dueDate : undefined,
      startDate: frequency !== "once" ? startDate : undefined,
      endDate: frequency !== "once" ? endDate : undefined,
      assignedTo,
    });
    navigate('/');
  };

  const handleCancel = () => {
    onCancel();
    navigate('/');
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-lg w-full max-w-md">
        <ScrollArea className="h-[80vh]">
          <div className="p-6 space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                {initialValues ? "Edit Task" : "Add New Task"}
              </h2>
              <p className="text-muted-foreground">Fill in the task details below</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Task Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter task title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={priority} onValueChange={(value: "low" | "medium" | "high") => setPriority(value)}>
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

              <FrequencySelector
                frequency={frequency}
                customDays={customDays}
                onFrequencyChange={setFrequency}
                onCustomDaysChange={setCustomDays}
              />

              {frequency === "once" ? (
                <DateSelector
                  label="Due Date"
                  date={dueDate}
                  onDateChange={setDueDate}
                />
              ) : (
                <>
                  <DateSelector
                    label="Start Date"
                    date={startDate}
                    onDateChange={setStartDate}
                    onDateSelected={() => endDateRef.current?.focus()}
                  />
                  <DateSelector
                    label="End Date"
                    date={endDate}
                    onDateChange={setEndDate}
                  />
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="assignedTo">Assign To (Required)</Label>
                <Select
                  value={assignedTo}
                  onValueChange={(value) => {
                    if (assignedTo.includes(value)) {
                      setAssignedTo(assignedTo.filter(v => v !== value));
                    } else {
                      setAssignedTo([...assignedTo, value]);
                    }
                  }}
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
                          onClick={() => setAssignedTo(assignedTo.filter(n => n !== name))}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" onClick={handleCancel} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  {initialValues ? "Save Changes" : "Add Task"}
                </Button>
              </div>
            </form>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};