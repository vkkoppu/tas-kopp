import { Task } from "@/types/task";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface TaskListProps {
  tasks: Task[];
  completedTasks: Set<string>;
  completedBy: Record<string, string>;
  onTaskToggle: (taskId: string) => void;
  onCompletedByChange: (taskId: string, value: string) => void;
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
  return (
    <ScrollArea className="flex-1 border rounded-md p-4">
      {tasks.map((task) => {
        const isCompleted = isTaskCompletedForDate(task.id);
        return (
          <div key={task.id} className="flex items-center space-x-2 py-2 border-b last:border-0">
            <Checkbox
              id={`task-${task.id}`}
              checked={isCompleted || completedTasks.has(task.id)}
              onCheckedChange={() => onTaskToggle(task.id)}
              disabled={isCompleted}
            />
            <div className="flex-1">
              <Label 
                htmlFor={`task-${task.id}`} 
                className={cn(
                  "flex-1",
                  isCompleted && "text-muted-foreground line-through"
                )}
              >
                {task.title}
                <span className="ml-2 text-sm text-muted-foreground">
                  (Assigned to: {task.assignedTo.join(", ")})
                </span>
              </Label>
              {completedTasks.has(task.id) && !isCompleted && (
                <Select
                  value={completedBy[task.id] || ""}
                  onValueChange={(value) => onCompletedByChange(task.id, value)}
                >
                  <SelectTrigger className="mt-2">
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