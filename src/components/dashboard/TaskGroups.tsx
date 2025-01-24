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
  
  if (!groupedTasks || groupedTasks.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No tasks available
      </div>
    );
  }

  const groups = groupTasks(groupedTasks, "shared");
  console.log("TaskGroups - Grouped tasks:", groups);

  return (
    <div className="space-y-8">
      {Object.entries(groups).map(([groupName, tasks]) => (
        <div key={groupName} className="space-y-4 bg-muted/30 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold capitalize">{groupName}</h2>
          {tasks && tasks.length > 0 ? (
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
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No tasks in this category
            </div>
          )}
        </div>
      ))}
    </div>
  );
};