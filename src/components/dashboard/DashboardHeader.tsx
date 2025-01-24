import { Button } from "@/components/ui/button";
import { History, ListPlus, PencilLine, BarChart2, ClipboardList } from "lucide-react";

interface DashboardHeaderProps {
  familyName: string;
  onEditFamily: () => void;
  onAddTask: () => void;
  onRecordActivities: () => void;
  onViewHistory: () => void;
  onToggleTrends: () => void;
  showTrends: boolean;
  hasExistingTasks: boolean;
}

export const DashboardHeader = ({
  familyName,
  onEditFamily,
  onAddTask,
  onRecordActivities,
  onViewHistory,
  onToggleTrends,
  showTrends,
  hasExistingTasks,
}: DashboardHeaderProps) => {
  console.log('DashboardHeader render');
  
  return (
    <div className="mb-8 space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold">{familyName}</h1>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onEditFamily}
            className="hover:bg-accent"
          >
            <PencilLine className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            type="button"
            onClick={() => {
              console.log('Add Task button clicked');
              onAddTask();
            }} 
            className="flex items-center gap-2"
          >
            <ListPlus className="h-4 w-4" />
            Add Task
          </Button>
          {hasExistingTasks && (
            <>
              <Button onClick={onRecordActivities} variant="secondary" className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4" />
                Record Activities
              </Button>
              <Button onClick={onViewHistory} variant="secondary" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                View History
              </Button>
              <Button
                onClick={onToggleTrends}
                variant={showTrends ? "secondary" : "outline"}
                className="flex items-center gap-2"
              >
                <BarChart2 className="h-4 w-4" />
                {showTrends ? "Hide Trends" : "Show Trends"}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};