import { Task } from "@/types/task";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { X } from "lucide-react";
import { format } from "date-fns";

interface TaskListProps {
  tasks: Task[];
  completedTasks: Set<string>;
  completedBy: Record<string, string[]>;
  onTaskToggle: (taskId: string) => void;
  onCompletedByChange: (taskId: string, values: string[]) => void;
  isTaskCompletedForDate: (taskId: string) => boolean;
}

export const TaskList = ({
  tasks,
  completedTasks,
  completedBy,
  onTaskToggle,
  onCompletedByChange,
  isTaskCompletedForDate,
}: TaskListProps) => {
  const isOutOfWindow = (task: Task, date: Date) => {
    if (!task.startDate || !task.endDate) return false;
    const taskStart = new Date(task.startDate);
    const taskEnd = new Date(task.endDate);
    return date < taskStart || date > taskEnd;
  };

  return (
    <ScrollArea className="flex-1 border rounded-md p-4">
      {tasks.map((task) => {
        const isCompleted = isTaskCompletedForDate(task.id);
        const selectedMembers = completedBy[task.id] || [];
        const isIndividualTask = task.assignedTo.length === 1;
        const isOutOfRange = isOutOfWindow(task, new Date());

        // Auto-select the assigned user for individual tasks when checked
        const handleTaskToggle = () => {
          onTaskToggle(task.id);
          if (isIndividualTask && !completedTasks.has(task.id) && !isCompleted) {
            onCompletedByChange(task.id, task.assignedTo);
          }
        };

        return (
          <div key={task.id} className="flex items-center space-x-2 py-2 border-b last:border-0">
            <Checkbox
              id={`task-${task.id}`}
              checked={isCompleted || completedTasks.has(task.id)}
              onCheckedChange={handleTaskToggle}
              disabled={isCompleted}
            />
            <div className="flex-1">
              <Label 
                htmlFor={`task-${task.id}`} 
                className={cn(
                  "flex-1",
                  isCompleted && "text-muted-foreground line-through",
                  isOutOfRange && "text-red-500"
                )}
              >
                {task.title}
                <span className="ml-2 text-sm text-muted-foreground">
                  (Assigned to: {task.assignedTo.join(", ")})
                </span>
              </Label>
              {completedTasks.has(task.id) && !isCompleted && !isIndividualTask && (
                <div className="mt-2 space-y-2">
                  <Select
                    value={selectedMembers[0] || ""}
                    onValueChange={(value) => {
                      const newMembers = [...selectedMembers];
                      if (!newMembers.includes(value)) {
                        newMembers.push(value);
                      }
                      onCompletedByChange(task.id, newMembers);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select who completed this task" />
                    </SelectTrigger>
                    <SelectContent>
                      {task.assignedTo.map((member) => (
                        <SelectItem key={member} value={member}>
                          {member}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedMembers.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedMembers.map((member) => (
                        <Badge 
                          key={member}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {member}
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => {
                              const newMembers = selectedMembers.filter(m => m !== member);
                              onCompletedByChange(task.id, newMembers);
                            }}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
      {tasks.length === 0 && (
        <p className="text-center text-muted-foreground py-4">
          No tasks available
        </p>
      )}
    </ScrollArea>
  );
};