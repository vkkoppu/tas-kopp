import { Task } from "@/types/task";
import { FamilyMember } from "@/types/family";

export interface ActivityRecord {
  taskId: string;
  completed: boolean;
  date: string;
  completedBy: string;
}

export interface ActivityFormProps {
  tasks: Task[];
  familyMembers: FamilyMember[];
  onSave: (records: ActivityRecord[]) => Promise<void>;
  records: ActivityRecord[];
}

export interface FilterState {
  viewMode: "all" | "pending" | "completed";
  selectedDate: Date;
  isCalendarOpen: boolean;
}