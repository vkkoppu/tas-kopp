import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  title: string;
  priority: "low" | "medium" | "high";
  dueDate: string;
  completed?: boolean;
  onComplete?: (completed: boolean) => void;
}

export const TaskCard = ({
  title,
  priority,
  dueDate,
  completed = false,
  onComplete,
}: TaskCardProps) => {
  const priorityColors = {
    low: "bg-priority-low/10 text-priority-low border-priority-low",
    medium: "bg-priority-medium/10 text-priority-medium border-priority-medium",
    high: "bg-priority-high/10 text-priority-high border-priority-high",
  };

  return (
    <Card className={cn(
      "p-4 transition-all duration-300 hover:shadow-md animate-fade-in",
      completed && "opacity-50"
    )}>
      <div className="flex items-center gap-3">
        <Checkbox
          checked={completed}
          onCheckedChange={onComplete}
          className="h-5 w-5"
        />
        <div className="flex-1">
          <h3 className={cn(
            "font-medium line-clamp-1",
            completed && "line-through"
          )}>
            {title}
          </h3>
          <p className="text-sm text-muted-foreground">Due: {dueDate}</p>
        </div>
        <Badge className={cn("ml-auto", priorityColors[priority])}>
          {priority}
        </Badge>
      </div>
    </Card>
  );
};