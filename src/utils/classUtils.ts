import { ClassData, ScheduledClass, CustomTeacher, TopPerformingClass } from '../types';

export interface LocationClassCounts {
  [location: string]: {
    [day: string]: {
      [classFormat: string]: number;
    };
  };
}

export const generateIntelligentSchedule = (
  historicData: ClassData[],
  customTeachers: CustomTeacher[],
  options: any = {}
): ScheduledClass[] => {
  const {
    prioritizeTopPerformers = true,
    balanceShifts = true,
    optimizeTeacherHours = true,
    respectTimeRestrictions = true,
    minimizeTrainersPerShift = true,
    iteration = 0
  } = options;

  const locations = ['Kwality House, Kemps Corner', 'Supreme HQ, Bandra', 'Kenkere House'];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const timeSlots = [
    '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '17:30', '18:00', '18:30', '19:00', '19:30', '20:00'
  ];

  const generatedSchedule: ScheduledClass[] = [];
  const classCounts: { [key: string]: number } = {};
  const teacherHours: { [key: string]: number } = {};
  const locationTrainers: { [key: string]: { morning: Set<string>; evening: Set<string> } } = {};

  // Initialize location trainers
  locations.forEach(location => {
    locationTrainers[location] = { morning: new Set(), evening: new Set() };
  });

  // Helper function to check time restrictions
  const isTimeRestricted = (time: string): boolean => {
    const hour = parseInt(time.split(':')[0]);
    return hour >= 12 && hour < 16;
  };

  // Helper function to get top performing class for a given time slot
  const getTopClass = (location: string, day: string, time: string): ClassData | undefined => {
    const relevantData = historicData.filter(
      item =>
        item.location === location &&
        item.dayOfWeek === day &&
        item.classTime.includes(time.slice(0, 5)) &&
        item.participants > 5
    );

    if (relevantData.length === 0) return undefined;

    const sortedData = relevantData.sort((a, b) => b.participants - a.participants);
    return sortedData[0];
  };

  // Main scheduling logic
  for (const location of locations) {
    for (const day of days) {
      for (const time of timeSlots) {
        if (respectTimeRestrictions && isTimeRestricted(time)) {
          continue; // Skip restricted time slots
        }

        const classKey = `${location}-${day}-${time}`;
        if (classCounts[classKey] && classCounts[classKey] >= 2) {
          continue; // Limit 2 classes per time slot
        }

        const topClass = getTopClass(location, day, time);
        if (topClass) {
          const teacherName = topClass.teacherName;

          // Check if teacher is already teaching at this time
          if (generatedSchedule.find(cls => cls.day === day && cls.time === time && cls.teacherFirstName === teacherName.split(' ')[0])) {
            continue;
          }

          // Check if teacher has reached max hours
          if (optimizeTeacherHours && teacherHours[teacherName] && teacherHours[teacherName] >= 15) {
            continue;
          }

          // Check if minimizing trainers per shift
          const shift = parseInt(time.split(':')[0]) < 12 ? 'morning' : 'evening';
          if (minimizeTrainersPerShift && locationTrainers[location][shift].size >= 3 && !locationTrainers[location][shift].has(teacherName)) {
            continue;
          }

          const newClass: ScheduledClass = {
            id: `generated-${location}-${day}-${time}-${iteration}`,
            day,
            time,
            location,
            classFormat: topClass.cleanedClass,
            teacherFirstName: topClass.teacherFirstName,
            teacherLastName: topClass.teacherLastName,
            duration: '1',
            participants: topClass.participants,
            revenue: topClass.totalRevenue,
            isTopPerformer: topClass.participants > 8
          };

          generatedSchedule.push(newClass);

          // Update class counts, teacher hours, and location trainers
          classCounts[classKey] = (classCounts[classKey] || 0) + 1;
          teacherHours[teacherName] = (teacherHours[teacherName] || 0) + 1;
          locationTrainers[location][shift].add(teacherName);
        }
      }
    }
  }

  return generatedSchedule;
};

export const getClassCountsByLocation = (data: ClassData[]): LocationClassCounts => {
  return data.reduce((acc: LocationClassCounts, item: ClassData) => {
    const { location, dayOfWeek, cleanedClass } = item;

    if (!acc[location]) {
      acc[location] = {};
    }

    if (!acc[location][dayOfWeek]) {
      acc[location][dayOfWeek] = {};
    }

    if (!acc[location][dayOfWeek][cleanedClass]) {
      acc[location][dayOfWeek][cleanedClass] = 0;
    }

    acc[location][dayOfWeek][cleanedClass]++;

    return acc;
  }, {});
};

export const getTopPerformingClasses = (data: ClassData[], location?: string): TopPerformingClass[] => {
  const filteredData = location ? data.filter(item => item.location === location) : data;
  
  // Group by class format, location, day, time, and teacher
  const classGroups = filteredData.reduce((acc, item) => {
    const key = `${item.cleanedClass}_${item.location}_${item.dayOfWeek}_${item.classTime}_${item.teacherName}`;
    
    if (!acc[key]) {
      acc[key] = {
        classFormat: item.cleanedClass,
        location: item.location,
        day: item.dayOfWeek,
        time: item.classTime,
        teacher: item.teacherName,
        participants: [],
        revenues: []
      };
    }
    
    acc[key].participants.push(item.participants);
    acc[key].revenues.push(item.totalRevenue);
    return acc;
  }, {} as any);

  // Calculate averages and filter by >5.0 attendance
  const topClasses = Object.values(classGroups)
    .map((group: any) => {
      const avgParticipants = group.participants.reduce((sum: number, p: number) => sum + p, 0) / group.participants.length;
      const avgRevenue = group.revenues.reduce((sum: number, r: number) => sum + r, 0) / group.revenues.length;
      
      return {
        classFormat: group.classFormat,
        location: group.location,
        day: group.day,
        time: group.time.slice(0, 5), // Format time
        teacher: group.teacher,
        avgParticipants: Math.round(avgParticipants * 10) / 10,
        avgRevenue: Math.round(avgRevenue),
        frequency: group.participants.length
      };
    })
    .filter(cls => cls.avgParticipants > 5.0) // Only classes with >5.0 average attendance
    .sort((a, b) => b.avgParticipants - a.avgParticipants);

  return topClasses;
};

// Additional utility functions needed by components
export const getClassDuration = (classFormat: string): number => {
  // Most classes are 1 hour, some specific formats might be different
  const longClasses = ['Workshop', 'Masterclass'];
  return longClasses.some(format => classFormat.includes(format)) ? 1.5 : 1;
};

export const validateTeacherHours = (teacherName: string, scheduledClasses: ScheduledClass[]): number => {
  return scheduledClasses
    .filter(cls => `${cls.teacherFirstName} ${cls.teacherLastName}` === teacherName)
    .reduce((total, cls) => total + parseFloat(cls.duration), 0);
};

export const getClassAverageForSlot = (
  data: ClassData[], 
  location: string, 
  day: string, 
  time: string, 
  classFormat: string
): number => {
  const relevantClasses = data.filter(item => 
    item.location === location && 
    item.dayOfWeek === day && 
    item.classTime.includes(time.slice(0, 5)) &&
    item.cleanedClass === classFormat
  );
  
  if (relevantClasses.length === 0) return 0;
  
  const totalParticipants = relevantClasses.reduce((sum, cls) => sum + cls.participants, 0);
  return totalParticipants / relevantClasses.length;
};

export const getBestTeacherForClass = (
  data: ClassData[], 
  classFormat: string, 
  location: string
): string => {
  const relevantData = data.filter(item => 
    item.cleanedClass === classFormat && 
    item.location === location
  );
  
  if (relevantData.length === 0) return 'Best Available';
  
  const teacherStats = relevantData.reduce((acc, item) => {
    if (!acc[item.teacherName]) {
      acc[item.teacherName] = { participants: 0, count: 0 };
    }
    acc[item.teacherName].participants += item.participants;
    acc[item.teacherName].count += 1;
    return acc;
  }, {} as any);
  
  const bestTeacher = Object.entries(teacherStats)
    .map(([teacher, stats]: [string, any]) => ({
      teacher,
      avgParticipants: stats.participants / stats.count
    }))
    .sort((a, b) => b.avgParticipants - a.avgParticipants)[0];
  
  return bestTeacher?.teacher || 'Best Available';
};

export const getUniqueTeachers = (data: ClassData[]): string[] => {
  const teachers = new Set(data.map(item => item.teacherName));
  return Array.from(teachers);
};

export const getClassFormatsForDay = (data: ClassData[], day: string, location: string): string[] => {
  const formats = new Set(
    data
      .filter(item => item.dayOfWeek === day && item.location === location)
      .map(item => item.cleanedClass)
  );
  return Array.from(formats);
};

export const isClassAllowedAtLocation = (classFormat: string, location: string): boolean => {
  // Supreme HQ Bandra only allows PowerCycle
  if (location === 'Supreme HQ, Bandra') {
    return classFormat.toLowerCase().includes('powercycle') || classFormat.toLowerCase().includes('cycle');
  }
  
  // Other locations don't allow PowerCycle
  return !classFormat.toLowerCase().includes('powercycle') && !classFormat.toLowerCase().includes('cycle');
};

export const getTimeSlotsWithData = (data: ClassData[]): string[] => {
  const timeSlots = new Set(data.map(item => item.classTime.slice(0, 5)));
  return Array.from(timeSlots).sort();
};

export const getClassesAtTimeSlot = (
  data: ClassData[], 
  location: string, 
  day: string, 
  time: string
): ClassData[] => {
  return data.filter(item => 
    item.location === location && 
    item.dayOfWeek === day && 
    item.classTime.includes(time)
  );
};

export const getAvailableTimeSlots = (): string[] => {
  return [
    '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '17:30', '18:00', '18:30', '19:00', '19:30', '20:00'
  ];
};

export const getRestrictedTimeSlots = (): string[] => {
  const restricted = [];
  for (let hour = 12; hour < 16; hour++) {
    for (let min = 0; min < 60; min += 30) {
      restricted.push(`${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`);
    }
  }
  return restricted;
};

export const isTimeRestricted = (time: string): boolean => {
  const hour = parseInt(time.split(':')[0]);
  return hour >= 12 && hour < 16;
};
