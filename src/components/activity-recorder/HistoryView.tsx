
import { ScrollArea } from "@/components/ui/scroll-area";
import { ActivityRecord } from "./types";
import { Task } from "@/types/task";
import { useState } from "react";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { format, startOfWeek, endOfWeek, addWeeks, isWithinInterval, parseISO } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, List, CalendarDays } from "lucide-react";

interface HistoryViewProps {
  records: ActivityRecord[];
  tasks: Task[];
}

export const HistoryView = ({ records, tasks }: HistoryViewProps) => {
  const [viewMode, setViewMode] = useState<"list" | "table">("table");
  const [timeframe, setTimeframe] = useState<"week" | "month">("week");
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  
  const getTaskTitle = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    return task ? task.title : null;
  };

  // Sort records by date (newest first)
  const sortedRecords = [...records].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const validRecords = sortedRecords.filter(record => getTaskTitle(record.taskId) !== null);

  // Get unique family members who completed tasks
  const familyMembers = Array.from(new Set(validRecords.map(record => record.completedBy)));
  
  // Get unique tasks that have been completed
  const uniqueTasks = Array.from(
    new Set(validRecords.map(record => record.taskId))
  ).map(taskId => {
    return {
      id: taskId,
      title: getTaskTitle(taskId) || "Unknown Task"
    };
  });

  // Create a date range for the current view
  const currentWeekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
  const dateRange = { start: currentWeekStart, end: currentWeekEnd };

  // Filter records for the current time range
  const recordsInRange = validRecords.filter(record => {
    try {
      const recordDate = parseISO(record.date);
      return isWithinInterval(recordDate, dateRange);
    } catch (error) {
      console.error("Invalid date format:", record.date);
      return false;
    }
  });

  // Navigate to previous/next week
  const goToPreviousWeek = () => {
    setCurrentWeekStart(addWeeks(currentWeekStart, -1));
  };

  const goToNextWeek = () => {
    setCurrentWeekStart(addWeeks(currentWeekStart, 1));
  };

  // Check if a task was completed by a specific family member in the current timeframe
  const wasTaskCompletedBy = (taskId: string, familyMember: string) => {
    return recordsInRange.some(
      record => record.taskId === taskId && record.completedBy === familyMember
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4 flex justify-between items-center">
        <Tabs defaultValue="table" onValueChange={(v) => setViewMode(v as "list" | "table")}>
          <TabsList>
            <TabsTrigger value="table" className="flex items-center gap-1">
              <Table className="h-4 w-4" />
              <span>Table View</span>
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-1">
              <List className="h-4 w-4" />
              <span>List View</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={goToPreviousWeek}
            className="p-1 rounded-full hover:bg-purple-100 text-purple-primary"
          >
            ←
          </button>
          <span className="font-medium text-purple-primary">
            {format(currentWeekStart, 'MMM d')} - {format(currentWeekEnd, 'MMM d, yyyy')}
          </span>
          <button 
            onClick={goToNextWeek}
            className="p-1 rounded-full hover:bg-purple-100 text-purple-primary"
          >
            →
          </button>
        </div>
      </div>

      <ScrollArea className="flex-1 border rounded-md p-4 bg-pastel-purple/10">
        {validRecords.length > 0 ? (
          viewMode === "table" ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Task</TableHead>
                  {familyMembers.map(member => (
                    <TableHead key={member} className="text-center">{member}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {uniqueTasks.map(task => (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium text-purple-primary">{task.title}</TableCell>
                    {familyMembers.map(member => (
                      <TableCell key={`${task.id}-${member}`} className="text-center">
                        {wasTaskCompletedBy(task.id, member) ? (
                          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-100 text-green-800">✓</span>
                        ) : (
                          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-red-100 text-red-800">✗</span>
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="space-y-4">
              {validRecords.map((record, index) => (
                <div key={index} className="flex items-center justify-between py-2 px-4 border-b last:border-0 bg-pastel-purple/20 rounded-lg hover:bg-pastel-purple/30 transition-colors">
                  <div className="space-y-1">
                    <div className="font-medium text-purple-primary">{getTaskTitle(record.taskId)}</div>
                    <div className="text-sm text-purple-tertiary">
                      Completed by: {record.completedBy}
                    </div>
                    <div className="text-sm text-purple-tertiary">
                      Date: {record.date}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <p className="text-center text-purple-tertiary py-4">
            No activity records yet
          </p>
        )}
      </ScrollArea>
    </div>
  );
};
