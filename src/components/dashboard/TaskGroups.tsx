import { TaskCard } from "../TaskCard";
import { Task } from "@/types/task";
import { groupTasks } from "@/utils/taskGrouping";

interface TaskGroupsProps {
  groupedTasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
}

export const TaskGroups = ({ groupedTasks, onEditTask, onDeleteTask }: TaskGroupsProps) => {
  const groups = groupTasks(groupedTasks, "shared");

  return (
    <>
      {Object.entries(groups).map(([group, tasks]) => (
        <div key={group} className="space-y-4 bg-muted/30 p-6 rounded-lg mb-6">
          <h2 className="text-2xl font-semibold">{group}</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                onDelete={() => onDeleteTask(task)}
              />
            ))}
          </div>
        </div>
      ))}
    </>
  );
};