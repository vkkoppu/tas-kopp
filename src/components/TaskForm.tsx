import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FrequencySelector } from "./task-form/FrequencySelector";
import { DateSelector } from "./task-form/DateSelector";
import { AssigneeSelector } from "./task-form/AssigneeSelector";
import { PrioritySelector } from "./task-form/PrioritySelector";
import { toast } from "sonner";
import { Task } from "@/types/task";
import { FamilyMember } from "@/types/family";

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
  familyMembers: FamilyMember[];
  initialValues?: Task;
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  editingTask: Task | null;
}

export const TaskForm = ({ 
  onSubmit, 
  onCancel, 
  familyMembers, 
  initialValues,
  tasks,
  setTasks,
  editingTask 
}: TaskFormProps) => {
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [priority, setPriority] = useState<"low" | "medium" | "high">(initialValues?.priority ?? "medium");
  const [frequency, setFrequency] = useState<"once" | "daily" | "weekly" | "custom">(initialValues?.frequency ?? "once");
  const [customDays, setCustomDays] = useState<number | undefined>(initialValues?.customDays);
  const [dueDate, setDueDate] = useState<Date | undefined>(initialValues?.dueDate ? new Date(initialValues.dueDate) : undefined);
  const [startDate, setStartDate] = useState<Date | undefined>(initialValues?.startDate ? new Date(initialValues.startDate) : undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(initialValues?.endDate ? new Date(initialValues.endDate) : undefined);
  const [assignedTo, setAssignedTo] = useState<string[]>(initialValues?.assignedTo ?? []);

  console.log('TaskForm: Mounted with initialValues:', initialValues);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('TaskForm: Form submitted with values:', {
      title,
      priority,
      frequency,
      customDays,
      dueDate,
      startDate,
      endDate,
      assignedTo,
    });

    if (!isFormValid()) {
      toast.error("Please fill in all required fields");
      return;
    }

    onSubmit({
      title,
      priority,
      frequency,
      customDays,
      dueDate,
      startDate,
      endDate,
      assignedTo,
    });
  };

  const isFormValid = () => {
    if (!title.trim()) return false;
    if (assignedTo.length === 0) return false;
    if (frequency === "once" && !dueDate) return false;
    if (frequency !== "once" && (!startDate || !endDate)) return false;
    if (frequency === "custom" && (!customDays || customDays <= 0)) return false;
    return true;
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-lg w-full max-w-md relative">
        <ScrollArea className="h-[80vh]">
          <div className="p-6 space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                {editingTask ? "Edit Task" : "Add New Task"}
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
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onCancel} 
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1"
                >
                  {editingTask ? "Save Changes" : "Add Task"}
                </Button>
              </div>
            </form>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};