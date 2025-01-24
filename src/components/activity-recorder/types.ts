import { Task } from "@/types/task";

export interface ActivityRecord {
  taskId: string;
  completed: boolean;
  date: string;
  completedBy: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  role: string;
}

export interface ActivityRecorderProps {
  familyMembers: FamilyMember[];
  tasks: Task[];
  onClose: () => void;
  records: ActivityRecord[];
  onRecordAdded: (newRecords: ActivityRecord[]) => void;
}