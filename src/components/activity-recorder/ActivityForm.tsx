
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ActivityFormProps } from "./shared-types";
import { DateSelector } from "./DateSelector";
import { ActivityTable } from "./ActivityTable";
import { useActivityForm } from "./hooks/useActivityForm";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";

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
    handleEditRecord,
    handleDeleteRecord,
    localRecords
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      <ActivityTable
        tasks={filteredTasks}
        familyMembers={familyMembers}
        completedTasks={completedTasks}
        completedBy={completedBy}
        onTaskToggle={handleTaskToggle}
        onCompletedByChange={(taskId, value) => setCompletedBy({ ...completedBy, [taskId]: value })}
        isTaskCompletedForDate={isTaskCompletedForDate}
        selectedDate={filterState.selectedDate}
      />

      {localRecords.length > 0 && (
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Recent Records</h3>
          <ScrollArea className="h-[200px]">
            <div className="space-y-4">
              {localRecords.map((record, idx) => {
                const task = tasks.find(t => t.id === record.taskId);
                if (!task) return null;

                return (
                  <div key={`${record.taskId}-${record.date}-${record.completedBy}-${idx}`} className="flex items-center justify-between border-b pb-2">
                    <div className="flex-grow">
                      <p className="font-medium">{task.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Completed by {record.completedBy} on {format(new Date(record.date), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        value={record.completedBy}
                        onValueChange={(value) => handleEditRecord(record, value)}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {familyMembers.map((member) => (
                            <SelectItem key={member.id} value={member.name}>
                              {member.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteRecord(record)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </Card>
      )}

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
