import { CalendarIcon, Users2Icon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  title: string;
  priority: "low" | "medium" | "high";
  dueDate?: string;
  frequency: string;
  customDays?: number;
  startDate?: string;
  endDate?: string;
  onEdit: () => void;
}

const priorityColors = {
  low: "bg-pastel-green",
  medium: "bg-pastel-yellow",
  high: "bg-pastel-orange"
};

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
  return (
    <Card className={cn(
      "p-4 transition-all hover:shadow-md",
      priorityColors[priority],
    )}>
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-2">{title}</h3>
          <div className="space-y-1 text-sm text-muted-foreground">
            {dueDate && (
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                <span>Due: {format(new Date(dueDate), "PPP")}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Users2Icon className="h-4 w-4" />
              <span>
                {frequency === "custom"
                  ? `Every ${customDays} days`
                  : `${frequency.charAt(0).toUpperCase() + frequency.slice(1)}`}
              </span>
            </div>
            {startDate && endDate && (
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                <span>
                  {format(new Date(startDate), "PP")} -{" "}
                  {format(new Date(endDate), "PP")}
                </span>
              </div>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className="hover:bg-background/50"
        >
          Edit
        </Button>
      </div>
    </Card>
  );
};