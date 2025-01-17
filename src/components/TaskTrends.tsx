import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from './ui/card';
import { format, subDays } from 'date-fns';

interface TaskRecord {
  taskId: number;
  date: string;
  completed: boolean;
  assignedTo: string;
}

interface Task {
  id: number;
  title: string;
  assignedTo: string;
}

interface TaskTrendsProps {
  taskRecords: TaskRecord[];
  tasks: Task[];
  timeframe: 'week' | 'month';
}

export const TaskTrends = ({ taskRecords, tasks, timeframe }: TaskTrendsProps) => {
  const daysToShow = timeframe === 'week' ? 7 : 30;
  const today = new Date();
  
  const data = Array.from({ length: daysToShow }).map((_, index) => {
    const date = subDays(today, daysToShow - 1 - index);
    const dateStr = format(date, 'yyyy-MM-dd');
    const completedTasks = taskRecords.filter(record => 
      record.date === dateStr && record.completed
    ).length;

    return {
      date: format(date, 'MMM dd'),
      completed: completedTasks
    };
  });

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Task Completion Trends</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="completed" 
              stroke="#8884d8" 
              name="Completed Tasks"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};