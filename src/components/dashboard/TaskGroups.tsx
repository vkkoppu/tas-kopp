import { TaskCard } from "../TaskCard";
import { Task } from "@/types/task";
import { groupTasks } from "@/utils/taskGrouping";

interface TaskGroupsProps {
  groupedTasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
}

export const TaskGroups = ({ groupedTasks, onEditTask, onDeleteTask }: TaskGroupsProps) => {
  console.log("TaskGroups - Received tasks:", groupedTasks);
  const groups = groupTasks(groupedTasks, "shared");
  console.log("TaskGroups - Grouped tasks:", groups);

  return (
    <>
      {Object.entries(groups).map(([group, tasks]) => {
        if (tasks.length === 0) return null;
        return (
          <div key={group} className="space-y-4 bg-muted/30 p-6 rounded-lg mb-6">
            <h2 className="text-2xl font-semibold">{group}</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={() => onEditTask(task)}
                  onDelete={() => onDeleteTask(task)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </>
  );
};