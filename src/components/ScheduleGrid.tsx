
import { Card, CardContent } from '@/components/ui/card';

export const ScheduleGrid = () => {
  const timeSlots = [
    '6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
    '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
    '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM'
  ];

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const sampleClasses = [
    { day: 0, time: 6, name: 'Morning Yoga', instructor: 'Sarah J.', attendance: 15, capacity: 20 },
    { day: 0, time: 8, name: 'HIIT Training', instructor: 'Mike R.', attendance: 18, capacity: 20 },
    { day: 1, time: 7, name: 'Pilates', instructor: 'Emma L.', attendance: 12, capacity: 15 },
    { day: 2, time: 10, name: 'Spin Class', instructor: 'David K.', attendance: 22, capacity: 25 },
    { day: 3, time: 14, name: 'Yoga Flow', instructor: 'Sarah J.', attendance: 16, capacity: 20 },
    { day: 4, time: 12, name: 'Strength Training', instructor: 'Mike R.', attendance: 8, capacity: 12 },
  ];

  const getUtilizationColor = (attendance: number, capacity: number) => {
    const rate = attendance / capacity;
    if (rate >= 0.9) return 'from-red-500 to-red-600';
    if (rate >= 0.7) return 'from-yellow-500 to-yellow-600';
    return 'from-green-500 to-green-600';
  };

  return (
    <div className="mt-6">
      <div className="grid grid-cols-8 gap-2">
        {/* Header */}
        <div className="font-semibold text-gray-700 p-2">Time</div>
        {days.map((day, index) => (
          <div key={index} className="font-semibold text-gray-700 p-2 text-center">
            {day.slice(0, 3)}
          </div>
        ))}

        {/* Time slots and classes */}
        {timeSlots.map((time, timeIndex) => (
          <React.Fragment key={timeIndex}>
            <div className="p-2 text-sm text-gray-600 font-medium">
              {time}
            </div>
            {days.map((_, dayIndex) => {
              const classData = sampleClasses.find(
                c => c.day === dayIndex && c.time === timeIndex
              );
              
              return (
                <div key={`${dayIndex}-${timeIndex}`} className="p-1">
                  {classData ? (
                    <Card className={`shadow-sm border-0 bg-gradient-to-r ${getUtilizationColor(classData.attendance, classData.capacity)} text-white`}>
                      <CardContent className="p-2">
                        <div className="text-xs font-medium">{classData.name}</div>
                        <div className="text-xs opacity-90">{classData.instructor}</div>
                        <div className="text-xs opacity-75">
                          {classData.attendance}/{classData.capacity}
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="h-16 border border-gray-100 rounded"></div>
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
