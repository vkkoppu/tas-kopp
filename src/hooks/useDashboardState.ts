import { useState } from "react";
import { Task } from "@/types/task";
import { FamilyData } from "@/types/family";

export interface TaskRecord {
  taskId: string;
  date: string;
  completed: boolean;
  completedBy: string;
}

export const useDashboardState = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showFamilyForm, setShowFamilyForm] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showActivityRecorder, setShowActivityRecorder] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [familyData, setFamilyData] = useState<FamilyData | null>(null);
  const [taskRecords, setTaskRecords] = useState<TaskRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showEditFamily, setShowEditFamily] = useState(false);
  const [groupBy, setGroupBy] = useState<"individual" | "shared">("individual");
  const [showTrends, setShowTrends] = useState(false);
  const [trendsTimeframe, setTrendsTimeframe] = useState<"week" | "month">("week");

  return {
    tasks,
    setTasks,
    showFamilyForm,
    setShowFamilyForm,
    showTaskForm,
    setShowTaskForm,
    showActivityRecorder,
    setShowActivityRecorder,
    editingTask,
    setEditingTask,
    familyData,
    setFamilyData,
    taskRecords,
    setTaskRecords,
    selectedDate,
    setSelectedDate,
    showEditFamily,
    setShowEditFamily,
    groupBy,
    setGroupBy,
    showTrends,
    setShowTrends,
    trendsTimeframe,
    setTrendsTimeframe,
  };
};