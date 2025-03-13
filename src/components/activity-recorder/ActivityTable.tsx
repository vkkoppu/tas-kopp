
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Task } from "@/types/task";
import { useState } from "react";
import { Badge } from "../ui/badge";
import { format } from "date-fns";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";

interface ActivityTableProps {
  tasks: Task[];
  familyMembers: { id: string; name: string; role: string }[];
  completedTasks: Set<string>;
  completedBy: Record<string, string[]>;
  isTaskCompletedForDate: (taskId: string) => boolean;
  onTaskToggle: (taskId: string) => void;
  onCompletedByChange: (taskId: string, values: string[]) => void;
  selectedDate: Date;
}

export const ActivityTable = ({
  tasks,
  familyMembers,
  completedTasks,
  completedBy,
  isTaskCompletedForDate,
  onTaskToggle,
  onCompletedByChange,
  selectedDate
}: ActivityTableProps) => {
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  const toggleTaskExpansion = (taskId: string) => {
    const newExpandedTasks = new Set(expandedTasks);
    if (newExpandedTasks.has(taskId)) {
      newExpandedTasks.delete(taskId);
    } else {
      newExpandedTasks.add(taskId);
    }
    setExpandedTasks(newExpandedTasks);
  };

  const toggleFamilyMember = (taskId: string, memberName: string) => {
    const currentMembers = completedBy[taskId] || [];
    let newMembers: string[];
    
    if (currentMembers.includes(memberName)) {
      newMembers = currentMembers.filter(name => name !== memberName);
    } else {
      newMembers = [...currentMembers, memberName];
    }
    
    onCompletedByChange(taskId, newMembers);
  };

  const isOutOfWindow = (task: Task, date: Date) => {
    if (!task.startDate || !task.endDate) return false;
    const taskStart = new Date(task.startDate);
    const taskEnd = new Date(task.endDate);
    return date < taskStart || date > taskEnd;
  };

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">Done</TableHead>
            <TableHead>Task</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead className="w-[180px]">Completed By</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                No tasks available for {format(selectedDate, 'MMM dd, yyyy')}
              </TableCell>
            </TableRow>
          ) : (
            tasks.map((task) => {
              const isCompleted = isTaskCompletedForDate(task.id);
              const isChecked = isCompleted || completedTasks.has(task.id);
              const selectedMembers = completedBy[task.id] || [];
              const isOutOfRange = isOutOfWindow(task, selectedDate);
              const isExpanded = expandedTasks.has(task.id) || (isChecked && !isCompleted);
              
              // Auto-select the assigned user for individual tasks when checked
              const handleTaskToggle = () => {
                onTaskToggle(task.id);
                
                // Auto-expand when checked
                if (!isChecked && !isExpanded) {
                  toggleTaskExpansion(task.id);
                }
              };

              return (
                <TableRow key={task.id} className={isOutOfRange ? "bg-red-50" : ""}>
                  <TableCell>
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={handleTaskToggle}
                      disabled={isCompleted}
                    />
                  </TableCell>
                  <TableCell className={`font-medium ${isCompleted ? "text-muted-foreground line-through" : ""}`}>
                    <div 
                      className="cursor-pointer"
                      onClick={() => toggleTaskExpansion(task.id)}
                    >
                      {task.title}
                      {isOutOfRange && (
                        <Badge variant="outline" className="ml-2 text-xs bg-red-50 text-red-500 border-red-200">
                          Out of range
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {task.assignedTo.map((member) => (
                        <Badge key={member} variant="outline">
                          {member}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {isChecked && !isCompleted && isExpanded && (
                      <div className="flex flex-wrap gap-1">
                        {task.assignedTo.map((member) => (
                          <Button
                            key={member}
                            size="sm"
                            variant={selectedMembers.includes(member) ? "default" : "outline"}
                            className="mb-1"
                            onClick={() => toggleFamilyMember(task.id, member)}
                          >
                            {member}
                          </Button>
                        ))}
                      </div>
                    )}
                    {isCompleted && (
                      <div className="text-sm text-muted-foreground">
                        Already recorded
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};
