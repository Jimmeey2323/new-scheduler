
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { class: 'Yoga', attendance: 85, utilization: 92 },
  { class: 'HIIT', attendance: 78, utilization: 88 },
  { class: 'Pilates', attendance: 65, utilization: 76 },
  { class: 'Spin', attendance: 92, utilization: 95 },
  { class: 'Strength', attendance: 72, utilization: 82 },
  { class: 'Dance', attendance: 68, utilization: 74 },
];

export const ClassPerformanceChart = () => {
  return (
    <div className="h-96">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="class" stroke="#6b7280" />
          <YAxis stroke="#6b7280" />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
            }}
          />
          <Bar dataKey="attendance" fill="#10b981" radius={[4, 4, 0, 0]} />
          <Bar dataKey="utilization" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
