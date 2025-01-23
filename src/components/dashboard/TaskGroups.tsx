import { TaskCard } from "../TaskCard";

interface Task {
  id: number;
  title: string;
  priority: "low" | "medium" | "high";
  dueDate?: string;
  startDate?: string;
  endDate?: string;
  frequency: "once" | "daily" | "weekly" | "custom";
  customDays?: number;
  assignedTo: string[];
}

interface TaskGroupsProps {
  groupedTasks: Record<string, Task[]>;
  onEditTask: (task: Task) => void;
}

export const TaskGroups = ({ groupedTasks, onEditTask }: TaskGroupsProps) => {
  return (
    <>
      {Object.entries(groupedTasks).map(([group, tasks]) => (
        <div key={group} className="space-y-4">
          <h2 className="text-2xl font-semibold">{group}</h2>
          <div className="grid gap-4">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                title={task.title}
                priority={task.priority}
                dueDate={task.dueDate}
                frequency={task.frequency}
                customDays={task.customDays}
                startDate={task.startDate}
                endDate={task.endDate}
                onEdit={() => onEditTask(task)}
              />
            ))}
          </div>
        </div>
      ))}
    </>
  );
};