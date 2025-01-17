import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Pencil } from "lucide-react";

interface TaskCardProps {
  title: string;
  priority: "low" | "medium" | "high";
  dueDate?: string;
  frequency: "once" | "daily" | "weekly" | "custom";
  customDays?: number;
  startDate?: string;
  endDate?: string;
  onEdit: () => void;
}

export const TaskCard = ({
  title,
  priority,
  dueDate,
  frequency,
  customDays,
  startDate,
  endDate,
  onEdit,
}: TaskCardProps) => {
  const priorityColors = {
    low: "bg-priority-low/10 text-priority-low border-priority-low",
    medium: "bg-priority-medium/10 text-priority-medium border-priority-medium",
    high: "bg-priority-high/10 text-priority-high border-priority-high",
  };

  const getFrequencyText = () => {
    switch (frequency) {
      case "once":
        return `Due: ${dueDate}`;
      case "daily":
        return "Daily";
      case "weekly":
        return "Weekly";
      case "custom":
        return `Every ${customDays} days`;
    }
  };

  return (
    <Card className="p-4 transition-all duration-300 hover:shadow-md animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <h3 className="font-medium line-clamp-1">{title}</h3>
          <p className="text-sm text-muted-foreground">
            {frequency === "once" ? (
              getFrequencyText()
            ) : (
              <>
                {getFrequencyText()}
                {startDate && endDate && (
                  <span className="ml-2">
                    ({startDate} - {endDate})
                  </span>
                )}
              </>
            )}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onEdit}
          className="mr-2"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Badge className={cn("ml-auto", priorityColors[priority])}>
          {priority}
        </Badge>
      </div>
    </Card>
  );
};