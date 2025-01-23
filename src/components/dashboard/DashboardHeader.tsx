import { Button } from "@/components/ui/button";
import { Plus, Calendar, BarChart2 } from "lucide-react";

interface DashboardHeaderProps {
  familyName: string;
  onEditFamily: () => void;
  onAddTask: () => void;
  onRecordActivities: () => void;
  onToggleTrends: () => void;
  showTrends: boolean;
  hasExistingTasks: boolean;
}

export const DashboardHeader = ({
  familyName,
  onEditFamily,
  onAddTask,
  onRecordActivities,
  onToggleTrends,
  showTrends,
  hasExistingTasks,
}: DashboardHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <div className="flex items-center gap-4">
          <h1 className="text-4xl font-bold mb-2">
            {familyName}'s Tasks
          </h1>
          <Button
            variant="outline"
            size="sm"
            onClick={onEditFamily}
            className="mb-2"
          >
            Edit Family
          </Button>
        </div>
        <p className="text-muted-foreground">
          Track and manage your family's daily activities
        </p>
      </div>
      <div className="flex gap-4">
        <Button className="gap-2" onClick={onAddTask}>
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
        {hasExistingTasks && (
          <>
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={onRecordActivities}
            >
              <Calendar className="h-4 w-4" />
              Record Activities
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={onToggleTrends}
            >
              <BarChart2 className="h-4 w-4" />
              {showTrends ? "Hide" : "Show"} Trends
            </Button>
          </>
        )}
      </div>
    </div>
  );
};