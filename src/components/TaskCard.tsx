import { CalendarIcon, Users2Icon, Trash2Icon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Task } from "@/types/task";

interface TaskCardProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
}

const priorityColors = {
  low: "bg-pastel-green",
  medium: "bg-pastel-yellow",
  high: "bg-pastel-orange"
};

const formatFrequency = (frequency: string, customDays?: number) => {
  if (!frequency) return "";
  if (frequency === "custom" && customDays) {
    return `Every ${customDays} days`;
  }
  return frequency.charAt(0).toUpperCase() + frequency.slice(1);
};

export const TaskCard = ({
  task,
  onEdit,
  onDelete,
}: TaskCardProps) => {
  return (
    <Card className={cn(
      "p-4 transition-all hover:shadow-md",
      priorityColors[task.priority],
    )}>
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-2">{task.title}</h3>
          <div className="space-y-1 text-sm text-muted-foreground">
            {task.dueDate && (
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                <span>Due: {format(new Date(task.dueDate), "PPP")}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Users2Icon className="h-4 w-4" />
              <span>{formatFrequency(task.frequency, task.customDays)}</span>
            </div>
            {task.startDate && task.endDate && (
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                <span>
                  {format(new Date(task.startDate), "PP")} -{" "}
                  {format(new Date(task.endDate), "PP")}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="hover:bg-background/50"
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="hover:bg-destructive/20 text-destructive hover:text-destructive"
          >
            <Trash2Icon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};