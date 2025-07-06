
import { Card, CardContent } from '@/components/ui/card';

export const HeatmapChart = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = ['6AM', '7AM', '8AM', '9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM', '6PM', '7PM', '8PM', '9PM'];
  
  // Sample heatmap data (0-100 intensity)
  const heatmapData = [
    [20, 40, 60, 80, 70, 90, 85, 75, 65, 55, 45, 35, 25, 15, 10, 5],
    [25, 45, 65, 85, 75, 95, 90, 80, 70, 60, 50, 40, 30, 20, 15, 10],
    [30, 50, 70, 90, 80, 85, 95, 85, 75, 65, 55, 45, 35, 25, 20, 15],
    [35, 55, 75, 95, 85, 90, 100, 90, 80, 70, 60, 50, 40, 30, 25, 20],
    [40, 60, 80, 100, 90, 95, 95, 85, 75, 65, 55, 45, 35, 25, 20, 15],
    [45, 65, 85, 95, 85, 90, 85, 75, 65, 55, 45, 35, 25, 15, 10, 5],
    [25, 45, 65, 80, 70, 85, 80, 70, 60, 50, 40, 30, 20, 10, 5, 5],
  ];

  const getIntensityColor = (intensity: number) => {
    const opacity = intensity / 100;
    return `rgba(59, 130, 246, ${opacity})`;
  };

  return (
    <div className="mt-6">
      <div className="grid grid-cols-17 gap-1 text-xs">
        {/* Empty cell for top-left corner */}
        <div></div>
        
        {/* Hour headers */}
        {hours.map((hour, index) => (
          <div key={index} className="text-center font-medium text-gray-600 p-1">
            {hour}
          </div>
        ))}

        {/* Days and data */}
        {days.map((day, dayIndex) => (
          <React.Fragment key={dayIndex}>
            <div className="font-medium text-gray-600 p-2 text-right">
              {day}
            </div>
            {heatmapData[dayIndex].map((intensity, hourIndex) => (
              <div
                key={`${dayIndex}-${hourIndex}`}
                className="aspect-square rounded border border-gray-200 flex items-center justify-center text-xs font-medium"
                style={{ backgroundColor: getIntensityColor(intensity) }}
                title={`${day} ${hours[hourIndex]}: ${intensity}% utilization`}
              >
                {intensity > 50 ? (
                  <span className="text-white">{intensity}</span>
                ) : (
                  <span className="text-gray-700">{intensity}</span>
                )}
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>
      
      <div className="mt-4 flex items-center justify-center space-x-4 text-sm text-gray-600">
        <span>Low</span>
        <div className="flex space-x-1">
          {[0.2, 0.4, 0.6, 0.8, 1.0].map((opacity, index) => (
            <div 
              key={index}
              className="w-4 h-4 rounded border border-gray-300"
              style={{ backgroundColor: `rgba(59, 130, 246, ${opacity})` }}
            />
          ))}
        </div>
        <span>High</span>
      </div>
    </div>
  );
};
