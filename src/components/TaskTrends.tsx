import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from './ui/card';
import { format, subDays, parseISO } from 'date-fns';

interface TaskRecord {
  taskId: string;
  date: string;
  completed: boolean;
  completedBy: string;
}

interface Task {
  id: string;
  title: string;
  assignedTo: string[];
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
    
    // Count completed tasks for this date
    const completedTasks = taskRecords.filter(record => {
      const recordDate = format(parseISO(record.date), 'yyyy-MM-dd');
      return recordDate === dateStr;
    }).length;

    return {
      date: format(date, 'MMM dd'),
      completed: completedTasks || 0
    };
  });

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Task Completion Trends</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date"
              tick={{ fill: 'hsl(var(--foreground))' }}
            />
            <YAxis 
              tick={{ fill: 'hsl(var(--foreground))' }}
              allowDecimals={false}
              domain={[0, 'auto']}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="completed" 
              stroke="hsl(var(--primary))"
              name="Completed Tasks"
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--primary))' }}
              activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};