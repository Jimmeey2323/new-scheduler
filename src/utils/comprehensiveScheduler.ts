import { ClassData, ScheduledClass } from '../types';
import { 
  getTopPerformingClasses, 
  getClassDuration, 
  getBestTeacherForClass, 
  isClassAllowedAtLocation, 
  isTimeRestricted, 
  isMorningSlot, 
  isEveningSlot,
  maintainsShiftBalance,
  hasMinimumDaysOff,
  getTeacherDaysOff,
  getTeacherSpecialties,
  isHostedClass
} from './classUtils';

// Comprehensive scheduler implementing all PRD rules
export const generateComprehensiveSchedule = async (
  csvData: ClassData[],
  customTeachers: any[] = [],
  options: {
    prioritizeTopPerformers?: boolean;
    balanceShifts?: boolean;
    optimizeTeacherHours?: boolean;
    respectTimeRestrictions?: boolean;
    minimizeTrainersPerShift?: boolean;
    targetDay?: string;
    iteration?: number;
  } = {}
): Promise<ScheduledClass[]> => {
  const optimizedClasses: ScheduledClass[] = [];
  const teacherHoursTracker: Record<string, number> = {};
  const teacherDailyHours: Record<string, Record<string, number>> = {};
  const teacherDailyLocations: Record<string, Record<string, string>> = {};
  const shiftTeachers: Record<string, Record<string, Record<string, Set<string>>>> = {};
  
  // Core constants
  const locations = ['Kwality House, Kemps Corner', 'Supreme HQ, Bandra', 'Kenkere House'];
  const days = options.targetDay ? [options.targetDay] : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const priorityTeachers = ['Anisha', 'Vivaran', 'Mrigakshi', 'Pranjali', 'Atulan', 'Cauveri', 'Rohan'];
  const newTrainers = ['Kabir', 'Simonelle'];
  const beginnerFormats = ['Studio Barre 57', 'Studio Foundations', 'Studio Recovery', 'Studio powerCycle'];
  
  // Initialize shift tracking
  locations.forEach(loc => {
    shiftTeachers[loc] = {};
    days.forEach(day => {
      shiftTeachers[loc][day] = { morning: new Set(), evening: new Set() };
    });
  });
  
  // Enhanced time slots with non-standard intervals
  const enhancedTimeSlots = [
    '07:30', '07:45', '08:00', '08:15', '08:30', '08:45', 
    '09:00', '09:15', '09:30', '09:45', '10:00', '10:15', '10:30', '10:45',
    '11:00', '11:15', '11:30', '11:45', '12:00',
    '17:30', '17:45', '18:00', '18:15', '18:30', '18:45',
    '19:00', '19:15', '19:30', '19:45', '20:00'
  ];
  
  // Helper functions
  const canScheduleClass = (classFormat: string, day: string, time: string, location: string): boolean => {
    if (isTimeRestricted(time, day)) return false;
    if (!isClassAllowedAtLocation(classFormat, location)) return false;
    
    const existingClasses = optimizedClasses.filter(cls => 
      cls.location === location && cls.day === day && cls.time === time
    );
    
    const maxParallel = location === 'Supreme HQ, Bandra' ? 3 : 2;
    if (existingClasses.length >= maxParallel) return false;
    
    // No same format in same slot
    if (existingClasses.some(cls => cls.classFormat === classFormat)) return false;
    
    // Supreme HQ: Need powercycle if 3 classes
    if (location === 'Supreme HQ, Bandra' && existingClasses.length === 2) {
      const hasPowerCycle = existingClasses.some(cls => cls.classFormat.toLowerCase().includes('powercycle'));
      if (!hasPowerCycle && !classFormat.toLowerCase().includes('powercycle')) {
        return false;
      }
    }
    
    return true;
  };
  
  const canAddTeacherToShift = (teacherName: string, location: string, day: string, time: string): boolean => {
    const shift = isMorningSlot(time) ? 'morning' : 'evening';
    const currentShiftSize = shiftTeachers[location][day][shift].size;
    const maxTrainers = day === 'Sunday' ? 1 : 3; // Sunday max 1, others max 3
    
    if (shiftTeachers[location][day][shift].has(teacherName)) {
      return true; // Teacher already in this shift
    }
    
    return currentShiftSize < maxTrainers;
  };
  
  const addTeacherToShift = (teacherName: string, location: string, day: string, time: string): void => {
    const shift = isMorningSlot(time) ? 'morning' : 'evening';
    shiftTeachers[location][day][shift].add(teacherName);
  };
  
  const canAssignTeacher = (teacherName: string, day: string, time: string, location: string, duration: string): boolean => {
    const weeklyHours = teacherHoursTracker[teacherName] || 0;
    const dailyHours = teacherDailyHours[teacherName]?.[day] || 0;
    const classDuration = parseFloat(duration);
    
    // New trainer restrictions
    const isNewTrainer = newTrainers.some(name => teacherName.includes(name));
    const maxWeeklyHours = isNewTrainer ? 10 : 15;
    
    // Basic hour checks
    if (weeklyHours + classDuration > maxWeeklyHours || dailyHours + classDuration > 4) {
      return false;
    }
    
    // 1 location per day constraint
    const currentDayLocation = teacherDailyLocations[teacherName]?.[day];
    if (currentDayLocation && currentDayLocation !== location) {
      return false;
    }
    
    // 1 shift per day constraint
    const teacherDayClasses = optimizedClasses.filter(cls => 
      `${cls.teacherFirstName} ${cls.teacherLastName}` === teacherName && cls.day === day
    );
    
    const hasEveningClasses = teacherDayClasses.some(cls => isEveningSlot(cls.time));
    const hasMorningClasses = teacherDayClasses.some(cls => isMorningSlot(cls.time));
    const isNewSlotMorning = isMorningSlot(time);
    
    if ((isNewSlotMorning && hasEveningClasses) || (!isNewSlotMorning && hasMorningClasses)) {
      return false;
    }
    
    // Max 2 consecutive classes constraint
    const timeInMinutes = parseInt(time.split(':')[0]) * 60 + parseInt(time.split(':')[1]);
    const consecutiveClasses = teacherDayClasses.filter(cls => {
      const clsTimeInMinutes = parseInt(cls.time.split(':')[0]) * 60 + parseInt(cls.time.split(':')[1]);
      return Math.abs(clsTimeInMinutes - timeInMinutes) <= 90; // Within 1.5 hours
    }).length;
    
    if (consecutiveClasses >= 2) {
      return false;
    }
    
    return true;
  };
  
  const assignClass = (classData: any, teacher: string): void => {
    const duration = getClassDuration(classData.classFormat);
    
    const scheduledClass: ScheduledClass = {
      id: `comprehensive-${classData.location}-${classData.day}-${classData.time}-${Date.now()}-${Math.random()}`,
      day: classData.day,
      time: classData.time,
      location: classData.location,
      classFormat: classData.classFormat,
      teacherFirstName: teacher.split(' ')[0],
      teacherLastName: teacher.split(' ').slice(1).join(' '),
      duration: duration,
      participants: classData.avgParticipants,
      revenue: classData.avgRevenue,
      isTopPerformer: (classData.avgParticipants || 0) > 5
    };
    
    optimizedClasses.push(scheduledClass);
    
    // Update tracking
    teacherHoursTracker[teacher] = parseFloat(((teacherHoursTracker[teacher] || 0) + parseFloat(duration)).toFixed(1));
    
    if (!teacherDailyHours[teacher]) teacherDailyHours[teacher] = {};
    teacherDailyHours[teacher][classData.day] = parseFloat(((teacherDailyHours[teacher][classData.day] || 0) + parseFloat(duration)).toFixed(1));
    
    if (!teacherDailyLocations[teacher]) teacherDailyLocations[teacher] = {};
    teacherDailyLocations[teacher][classData.day] = classData.location;
    
    addTeacherToShift(teacher, classData.location, classData.day, classData.time);
  };
  
  // Phase 1: Mandatory 7:30am classes at Kwality House on weekdays
  const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  for (const day of weekdays) {
    if (options.targetDay && options.targetDay !== day) continue;
    
    const earlyClasses = csvData.filter(item => 
      item.location === 'Kwality House, Kemps Corner' &&
      item.dayOfWeek === day &&
      item.classTime.includes('07:30') &&
      item.participants > 5
    );
    
    if (earlyClasses.length > 0) {
      const bestEarlyClass = earlyClasses.sort((a, b) => b.participants - a.participants)[0];
      const bestTeacher = getBestTeacherForClass(csvData, bestEarlyClass.cleanedClass, 'Kwality House, Kemps Corner', day, '07:30');
      
      if (bestTeacher && canAssignTeacher(bestTeacher, day, '07:30', 'Kwality House, Kemps Corner', getClassDuration(bestEarlyClass.cleanedClass))) {
        assignClass({
          classFormat: bestEarlyClass.cleanedClass,
          location: 'Kwality House, Kemps Corner',
          day: day,
          time: '07:30',
          avgParticipants: bestEarlyClass.participants,
          avgRevenue: bestEarlyClass.totalRevenue
        }, bestTeacher);
      }
    }
  }
  
  // Phase 2: Schedule top performing classes (>5.0 avg)
  const topClasses = getTopPerformingClasses(csvData, 5.0).sort((a, b) => b.avgParticipants - a.avgParticipants);
  
  for (const topClass of topClasses) {
    if (options.targetDay && topClass.day !== options.targetDay) continue;
    
    let classScheduled = false;
    
    // Try enhanced time slots for better scheduling
    for (const timeSlot of enhancedTimeSlots) {
      if (classScheduled) break;
      
      if (!canScheduleClass(topClass.classFormat, topClass.day, timeSlot, topClass.location)) {
        continue;
      }
      
      const bestTeacher = getBestTeacherForClass(csvData, topClass.classFormat, topClass.location, topClass.day, timeSlot);
      
      if (!bestTeacher) continue;
      
      if (!canAssignTeacher(bestTeacher, topClass.day, timeSlot, topClass.location, getClassDuration(topClass.classFormat))) {
        continue;
      }
      
      if (!canAddTeacherToShift(bestTeacher, topClass.location, topClass.day, timeSlot)) {
        continue;
      }
      
      // New trainer restrictions
      const isNewTrainer = newTrainers.some(name => bestTeacher.includes(name));
      if (isNewTrainer && !beginnerFormats.includes(topClass.classFormat)) {
        continue;
      }
      
      // Check consecutive class formats constraint
      const adjacentClasses = optimizedClasses.filter(cls => {
        if (cls.location !== topClass.location || cls.day !== topClass.day) return false;
        const clsTime = parseInt(cls.time.split(':')[0]) * 60 + parseInt(cls.time.split(':')[1]);
        const newTime = parseInt(timeSlot.split(':')[0]) * 60 + parseInt(timeSlot.split(':')[1]);
        return Math.abs(clsTime - newTime) === 30 || Math.abs(clsTime - newTime) === 60; // Adjacent slots
      });
      
      if (adjacentClasses.some(cls => cls.classFormat === topClass.classFormat)) {
        continue; // No consecutive same formats
      }
      
      assignClass({
        ...topClass,
        time: timeSlot
      }, bestTeacher);
      
      classScheduled = true;
    }
  }
  
  // Phase 3: Fill remaining high-value slots
  for (const location of locations) {
    for (const day of days) {
      if (options.targetDay && options.targetDay !== day) continue;
      
      for (const timeSlot of enhancedTimeSlots) {
        if (isTimeRestricted(timeSlot, day)) continue;
        
        const existingClasses = optimizedClasses.filter(cls => 
          cls.location === location && cls.day === day && cls.time === timeSlot
        );
        
        const maxParallel = location === 'Supreme HQ, Bandra' ? 3 : 2;
        if (existingClasses.length >= maxParallel) continue;
        
        // Find best remaining class for this slot
        const availableClasses = csvData.filter(item => 
          item.location === location &&
          item.dayOfWeek === day &&
          item.participants > 5 &&
          !isHostedClass(item.cleanedClass) &&
          isClassAllowedAtLocation(item.cleanedClass, location) &&
          !existingClasses.some(cls => cls.classFormat === item.cleanedClass)
        );
        
        if (availableClasses.length === 0) continue;
        
        const bestClass = availableClasses.sort((a, b) => b.participants - a.participants)[0];
        const bestTeacher = getBestTeacherForClass(csvData, bestClass.cleanedClass, location, day, timeSlot);
        
        if (!bestTeacher) continue;
        
        if (!canAssignTeacher(bestTeacher, day, timeSlot, location, getClassDuration(bestClass.cleanedClass))) {
          continue;
        }
        
        if (!canAddTeacherToShift(bestTeacher, location, day, timeSlot)) {
          continue;
        }
        
        // New trainer restrictions
        const isNewTrainer = newTrainers.some(name => bestTeacher.includes(name));
        if (isNewTrainer && !beginnerFormats.includes(bestClass.cleanedClass)) {
          continue;
        }
        
        assignClass({
          classFormat: bestClass.cleanedClass,
          location: location,
          day: day,
          time: timeSlot,
          avgParticipants: bestClass.participants,
          avgRevenue: bestClass.totalRevenue
        }, bestTeacher);
      }
    }
  }
  
  // Phase 4: Ensure all teachers have minimum 2 days off
  for (const teacher of Object.keys(teacherHoursTracker)) {
    const daysOff = getTeacherDaysOff(optimizedClasses, teacher);
    if (daysOff.length < 2) {
      // Remove classes to ensure 2 days off
      const teacherClasses = optimizedClasses.filter(cls => 
        `${cls.teacherFirstName} ${cls.teacherLastName}` === teacher
      );
      
      const dayClassCounts = teacherClasses.reduce((acc, cls) => {
        acc[cls.day] = (acc[cls.day] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const dayToRemove = Object.entries(dayClassCounts)
        .sort((a, b) => a[1] - b[1])[0]?.[0];
      
      if (dayToRemove) {
        const classesToRemove = teacherClasses.filter(cls => cls.day === dayToRemove);
        classesToRemove.forEach(cls => {
          const index = optimizedClasses.findIndex(c => c.id === cls.id);
          if (index > -1) {
            optimizedClasses.splice(index, 1);
            teacherHoursTracker[teacher] -= parseFloat(cls.duration);
          }
        });
      }
    }
  }
  
  return optimizedClasses;
};