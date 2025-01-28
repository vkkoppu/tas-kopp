import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
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
  console.log("TaskForm - Editing task:", editingTask);

  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [frequency, setFrequency] = useState<"once" | "daily" | "weekly" | "custom">("once");
  const [customDays, setCustomDays] = useState<number | undefined>();
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [assignedTo, setAssignedTo] = useState<string[]>([]);

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setPriority(editingTask.priority);
      setFrequency(editingTask.frequency);
      setCustomDays(editingTask.customDays);
      setDueDate(editingTask.dueDate ? new Date(editingTask.dueDate) : undefined);
      setStartDate(editingTask.startDate ? new Date(editingTask.startDate) : undefined);
      setEndDate(editingTask.endDate ? new Date(editingTask.endDate) : undefined);
      setAssignedTo(editingTask.assignedTo);
    } else if (initialValues) {
      setTitle(initialValues.title);
      setPriority(initialValues.priority);
      setFrequency(initialValues.frequency);
      setCustomDays(initialValues.customDays);
      setDueDate(initialValues.dueDate ? new Date(initialValues.dueDate) : undefined);
      setStartDate(initialValues.startDate ? new Date(initialValues.startDate) : undefined);
      setEndDate(initialValues.endDate ? new Date(initialValues.endDate) : undefined);
      setAssignedTo(initialValues.assignedTo);
    }
  }, [editingTask, initialValues]);

  const isFormValid = () => {
    if (!title.trim()) return false;
    if (assignedTo.length === 0) return false;
    if (frequency === "custom" && (!customDays || customDays <= 0)) return false;
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md relative">
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