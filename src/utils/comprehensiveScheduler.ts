
import { ClassData, ScheduledClass, CustomTeacher } from '../types';
import { STUDIO_CAPACITIES, isStudioAvailable, getClassEndTime, timeToMinutes } from './studioAvailability';

interface SchedulerOptions {
  prioritizeTopPerformers?: boolean;
  balanceShifts?: boolean;
  optimizeTeacherHours?: boolean;
  respectTimeRestrictions?: boolean;
  minimizeTrainersPerShift?: boolean;
  iteration?: number;
}

export const generateComprehensiveSchedule = (
  historicData: ClassData[],
  customTeachers: CustomTeacher[] = [],
  options: SchedulerOptions = {}
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
  
  // Flexible time slots including non-standard times
  const timeSlots = [
    '07:15', '07:30', '07:45', '08:00', '08:15', '08:30', '08:45', '09:00', '09:15', '09:30', 
    '09:45', '10:00', '10:15', '10:30', '10:45', '11:00', '11:15', '11:30',
    '17:00', '17:15', '17:30', '17:45', '18:00', '18:15', '18:30', '18:45', 
    '19:00', '19:15', '19:30', '19:45', '20:00', '20:15', '20:30'
  ];

  const generatedSchedule: ScheduledClass[] = [];
  const teacherHours: { [key: string]: number } = {};
  const teacherDayLocation: { [key: string]: { [day: string]: string } } = {};
  const teacherDayShift: { [key: string]: { [day: string]: 'morning' | 'evening' } } = {};
  const locationShiftTrainers: { [key: string]: { [shift: string]: Set<string> } } = {};

  // Initialize location shift trainers tracking
  locations.forEach(location => {
    locationShiftTrainers[location] = { morning: new Set(), evening: new Set() };
    days.forEach(day => {
      locationShiftTrainers[`${location}_${day}_morning`] = new Set();
      locationShiftTrainers[`${location}_${day}_evening`] = new Set();
    });
  });

  // Helper functions
  const isTimeRestricted = (time: string): boolean => {
    const hour = parseInt(time.split(':')[0]);
    const minutes = parseInt(time.split(':')[1]);
    const totalMinutes = hour * 60 + minutes;
    return totalMinutes >= 12 * 60 && totalMinutes < 16 * 60; // 12:00 PM to 4:00 PM
  };

  const getShift = (time: string): 'morning' | 'evening' => {
    const hour = parseInt(time.split(':')[0]);
    return hour < 14 ? 'morning' : 'evening';
  };

  const canAssignTrainer = (teacher: string, location: string, day: string, time: string): boolean => {
    const shift = getShift(time);
    const locationDayShiftKey = `${location}_${day}_${shift}`;
    
    // Check if trainer already assigned to different location same day
    if (teacherDayLocation[teacher] && teacherDayLocation[teacher][day] && 
        teacherDayLocation[teacher][day] !== location) {
      return false;
    }
    
    // Check if trainer already assigned to different shift same day
    if (teacherDayShift[teacher] && teacherDayShift[teacher][day] && 
        teacherDayShift[teacher][day] !== shift) {
      return false;
    }
    
    // Check trainer count per shift per location (max 2-3)
    const currentTrainerCount = locationShiftTrainers[locationDayShiftKey]?.size || 0;
    const maxTrainers = location === 'Supreme HQ, Bandra' ? 3 : 2;
    
    if (currentTrainerCount >= maxTrainers && !locationShiftTrainers[locationDayShiftKey]?.has(teacher)) {
      return false;
    }
    
    return true;
  };

  const assignTrainer = (teacher: string, location: string, day: string, time: string) => {
    const shift = getShift(time);
    const locationDayShiftKey = `${location}_${day}_${shift}`;
    
    if (!teacherDayLocation[teacher]) teacherDayLocation[teacher] = {};
    if (!teacherDayShift[teacher]) teacherDayShift[teacher] = {};
    
    teacherDayLocation[teacher][day] = location;
    teacherDayShift[teacher][day] = shift;
    
    if (!locationShiftTrainers[locationDayShiftKey]) {
      locationShiftTrainers[locationDayShiftKey] = new Set();
    }
    locationShiftTrainers[locationDayShiftKey].add(teacher);
  };

  // Get top performing classes for scheduling priority
  const getTopPerformingClasses = (location: string, day: string, time: string) => {
    return historicData
      .filter(item => 
        item.location === location && 
        item.dayOfWeek === day && 
        item.classTime.includes(time.slice(0, 5)) &&
        item.participants > 5
      )
      .sort((a, b) => b.participants - a.participants);
  };

  // Main scheduling logic
  for (const location of locations) {
    for (const day of days) {
      // Mandatory 7:30 AM class at Kwality House on weekdays
      if (location === 'Kwality House, Kemps Corner' && 
          ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].includes(day)) {
        
        const mandatoryTime = '07:30';
        const topClasses = getTopPerformingClasses(location, day, mandatoryTime);
        
        if (topClasses.length > 0) {
          const bestClass = topClasses[0];
          const teacherName = bestClass.teacherName;
          
          if (canAssignTrainer(teacherName, location, day, mandatoryTime) &&
              (!teacherHours[teacherName] || teacherHours[teacherName] < 15)) {
            
            const availability = isStudioAvailable(location, day, mandatoryTime, '1', generatedSchedule);
            
            if (availability.available) {
              const newClass: ScheduledClass = {
                id: `mandatory-${location}-${day}-${mandatoryTime}-${iteration}`,
                day,
                time: mandatoryTime,
                location,
                classFormat: bestClass.cleanedClass,
                teacherFirstName: bestClass.teacherFirstName,
                teacherLastName: bestClass.teacherLastName,
                duration: '1',
                participants: bestClass.participants,
                revenue: bestClass.totalRevenue,
                isTopPerformer: bestClass.participants > 8,
                studioAssigned: availability.suggestedStudio
              };
              
              generatedSchedule.push(newClass);
              teacherHours[teacherName] = (teacherHours[teacherName] || 0) + 1;
              assignTrainer(teacherName, location, day, mandatoryTime);
            }
          }
        }
      }
      
      // Schedule other time slots
      for (const time of timeSlots) {
        if (respectTimeRestrictions && isTimeRestricted(time)) {
          continue; // Skip restricted hours
        }
        
        // Skip if already scheduled mandatory class
        if (location === 'Kwality House, Kemps Corner' && time === '07:30' &&
            ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].includes(day)) {
          continue;
        }
        
        const topClasses = getTopPerformingClasses(location, day, time);
        
        for (const classData of topClasses.slice(0, 3)) { // Try top 3 classes
          const teacherName = classData.teacherName;
          
          // Check all constraints
          if (!canAssignTrainer(teacherName, location, day, time)) continue;
          if (teacherHours[teacherName] && teacherHours[teacherName] >= 15) continue;
          
          // Check for consecutive classes same format
          const hasConsecutiveSameFormat = generatedSchedule.some(cls => {
            if (cls.day !== day || cls.location !== location) return false;
            const classTime = timeToMinutes(cls.time);
            const currentTime = timeToMinutes(time);
            const timeDiff = Math.abs(classTime - currentTime);
            return timeDiff <= 60 && cls.classFormat === classData.cleanedClass;
          });
          
          if (hasConsecutiveSameFormat) continue;
          
          // Check for consecutive classes same trainer (max 2)
          const trainerConsecutiveCount = generatedSchedule.filter(cls => {
            if (cls.day !== day || `${cls.teacherFirstName} ${cls.teacherLastName}` !== teacherName) return false;
            const classTime = timeToMinutes(cls.time);
            const currentTime = timeToMinutes(time);
            const timeDiff = Math.abs(classTime - currentTime);
            return timeDiff <= 120; // Within 2 hours
          }).length;
          
          if (trainerConsecutiveCount >= 2) continue;
          
          // Check studio availability
          const availability = isStudioAvailable(location, day, time, '1', generatedSchedule);
          
          if (availability.available) {
            const newClass: ScheduledClass = {
              id: `optimized-${location}-${day}-${time}-${classData.cleanedClass}-${iteration}`,
              day,
              time,
              location,
              classFormat: classData.cleanedClass,
              teacherFirstName: classData.teacherFirstName,
              teacherLastName: classData.teacherLastName,
              duration: '1',
              participants: classData.participants,
              revenue: classData.totalRevenue,
              isTopPerformer: classData.participants > 8,
              studioAssigned: availability.suggestedStudio
            };
            
            generatedSchedule.push(newClass);
            teacherHours[teacherName] = (teacherHours[teacherName] || 0) + 1;
            assignTrainer(teacherName, location, day, time);
            break; // Move to next time slot
          }
        }
      }
    }
  }

  // Balance morning and evening classes
  if (balanceShifts) {
    const morningClasses = generatedSchedule.filter(cls => getShift(cls.time) === 'morning').length;
    const eveningClasses = generatedSchedule.filter(cls => getShift(cls.time) === 'evening').length;
    
    console.log(`Schedule balance: ${morningClasses} morning, ${eveningClasses} evening classes`);
  }

  // Log trainer utilization
  console.log('Trainer Hours:', Object.entries(teacherHours).map(([teacher, hours]) => 
    `${teacher}: ${hours}h`).join(', '));

  return generatedSchedule;
};
