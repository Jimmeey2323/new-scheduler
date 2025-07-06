
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { week: 'Week 1', attendance: 240, capacity: 320 },
  { week: 'Week 2', attendance: 280, capacity: 320 },
  { week: 'Week 3', attendance: 260, capacity: 320 },
  { week: 'Week 4', attendance: 300, capacity: 320 },
  { week: 'Week 5', attendance: 285, capacity: 320 },
  { week: 'Week 6', attendance: 320, capacity: 320 },
  { week: 'Week 7', attendance: 310, capacity: 320 },
  { week: 'Week 8', attendance: 340, capacity: 340 },
  { week: 'Week 9', attendance: 330, capacity: 340 },
  { week: 'Week 10', attendance: 360, capacity: 340 },
  { week: 'Week 11', attendance: 350, capacity: 340 },
  { week: 'Week 12', attendance: 380, capacity: 380 },
];

export const AttendanceChart = () => {
  return (
    <div className="h-96">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="week" stroke="#6b7280" />
          <YAxis stroke="#6b7280" />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="attendance" 
            stroke="#3b82f6" 
            strokeWidth={3}
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: '#1d4ed8' }}
          />
          <Line 
            type="monotone" 
            dataKey="capacity" 
            stroke="#94a3b8" 
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
