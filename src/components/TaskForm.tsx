import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FrequencySelector } from "./task-form/FrequencySelector";
import { DateSelector } from "./task-form/DateSelector";
import { useNavigate } from "react-router-dom";
import { PrioritySelector } from "./task-form/PrioritySelector";
import { AssigneeSelector } from "./task-form/AssigneeSelector";
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

              <PrioritySelector
                priority={priority}
                onPriorityChange={setPriority}
              />

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
                  />
                  <DateSelector
                    label="End Date"
                    date={endDate}
                    onDateChange={setEndDate}
                  />
                </>
              )}

              <AssigneeSelector
                familyMembers={familyMembers}
                assignedTo={assignedTo}
                onAssigneeChange={setAssignedTo}
              />

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