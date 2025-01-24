import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ActivityFormProps } from "./shared-types";
import { DateSelector } from "./DateSelector";
import { TaskList } from "./TaskList";
import { useActivityForm } from "./hooks/useActivityForm";

export const ActivityForm = ({ tasks, familyMembers, onSave, records }: ActivityFormProps) => {
  const {
    filterState,
    setFilterState,
    completedTasks,
    completedBy,
    setCompletedBy,
    isTaskCompletedForDate,
    handleTaskToggle,
    handleSave,
  } = useActivityForm(tasks, familyMembers, onSave, records);

  const filteredTasks = tasks.filter(task => {
    const isCompleted = isTaskCompletedForDate(task.id);
    switch (filterState.viewMode) {
      case "pending":
        return !isCompleted;
      case "completed":
        return isCompleted;
      default:
        return true;
    }
  });

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <Select 
          value={filterState.viewMode} 
          onValueChange={(value: "all" | "pending" | "completed") => 
            setFilterState(prev => ({ ...prev, viewMode: value }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter tasks" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tasks</SelectItem>
            <SelectItem value="pending">Pending Tasks</SelectItem>
            <SelectItem value="completed">Completed Tasks</SelectItem>
          </SelectContent>
        </Select>

        <DateSelector
          selectedDate={filterState.selectedDate}
          isCalendarOpen={filterState.isCalendarOpen}
          onCalendarOpenChange={(isOpen) => 
            setFilterState(prev => ({ ...prev, isCalendarOpen: isOpen }))
          }
          onDateSelect={(date) => {
            setFilterState(prev => ({ 
              ...prev, 
              selectedDate: date || new Date(),
              isCalendarOpen: false 
            }));
          }}
        />
      </div>

      <TaskList
        tasks={filteredTasks}
        completedTasks={completedTasks}
        completedBy={completedBy}
        onTaskToggle={handleTaskToggle}
        onCompletedByChange={(taskId, value) => setCompletedBy({ ...completedBy, [taskId]: value })}
        isTaskCompletedForDate={isTaskCompletedForDate}
      />

      <div className="pt-4 space-y-2">
        <Button 
          onClick={handleSave}
          className="w-full"
          size="lg"
          disabled={completedTasks.size === 0}
        >
          Submit Activities
        </Button>
      </div>
    </div>
  );
};