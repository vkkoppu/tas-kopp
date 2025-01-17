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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TaskFormProps {
  onSubmit: (task: {
    title: string;
    priority: "low" | "medium" | "high";
    dueDate?: Date;
    startDate?: Date;
    endDate?: Date;
    frequency: "once" | "daily" | "weekly" | "custom";
    customDays?: number;
    assignedTo: string;
  }) => void;
  onCancel: () => void;
  familyMembers: { name: string; role: string }[];
}

export const TaskForm = ({ onSubmit, onCancel, familyMembers }: TaskFormProps) => {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [frequency, setFrequency] = useState<"once" | "daily" | "weekly" | "custom">("once");
  const [customDays, setCustomDays] = useState<number>();
  const [dueDate, setDueDate] = useState<Date>();
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [assignedTo, setAssignedTo] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
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
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-lg w-full max-w-md animate-fade-in">
        <ScrollArea className="h-[80vh]">
          <div className="p-6 space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Add New Task</h2>
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

              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Select 
                  value={frequency} 
                  onValueChange={(value: "once" | "daily" | "weekly" | "custom") => setFrequency(value)}
                >
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
              </div>

              {frequency === "custom" && (
                <div className="space-y-2">
                  <Label htmlFor="customDays">Repeat every X days</Label>
                  <Input
                    id="customDays"
                    type="number"
                    min={1}
                    value={customDays}
                    onChange={(e) => setCustomDays(Number(e.target.value))}
                    placeholder="Enter number of days"
                    required
                  />
                </div>
              )}

              {frequency === "once" ? (
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dueDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dueDate}
                        onSelect={setDueDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !startDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, "PPP") : "Pick a start date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !endDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? format(endDate, "PPP") : "Pick an end date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="assignedTo">Assign To</Label>
                <Select value={assignedTo} onValueChange={setAssignedTo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select family member" />
                  </SelectTrigger>
                  <SelectContent>
                    {familyMembers.map((member, index) => (
                      <SelectItem key={index} value={member.name}>
                        {member.name} ({member.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Add Task
                </Button>
              </div>
            </form>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
