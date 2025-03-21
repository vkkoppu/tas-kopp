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
  
  const validRecords = taskRecords.filter(record => {
    try {
      parseISO(record.date);
      return true;
    } catch {
      console.error('Invalid date found in task records:', record);
      return false;
    }
  });
  
  const data = Array.from({ length: daysToShow }).map((_, index) => {
    const date = subDays(today, daysToShow - 1 - index);
    const dateStr = format(date, 'yyyy-MM-dd');
    
    const completedTasks = validRecords.filter(record => {
      try {
        return format(parseISO(record.date), 'yyyy-MM-dd') === dateStr;
      } catch {
        return false;
      }
    });

    // Count unique tasks completed on this date
    const uniqueTaskIds = new Set(completedTasks.map(record => record.taskId));
    
    return {
      date: format(date, 'MMM dd'),
      completed: uniqueTaskIds.size
    };
  });

  return (
    <Card className="p-6 bg-pastel-blue/20 overflow-x-auto">
      <h3 className="text-lg font-semibold mb-4">Task Completion Trends</h3>
      <div className="h-[300px] min-w-[600px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ right: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis 
              dataKey="date"
              tick={{ fill: 'hsl(var(--foreground))' }}
              stroke="#94A3B8"
              interval={0}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              tick={{ fill: 'hsl(var(--foreground))' }}
              stroke="#94A3B8"
              allowDecimals={false}
              domain={[0, 'auto']}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="completed" 
              stroke="#8B5CF6"
              strokeWidth={2}
              dot={{ fill: '#8B5CF6', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: '#8B5CF6' }}
              name="Completed Tasks"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};