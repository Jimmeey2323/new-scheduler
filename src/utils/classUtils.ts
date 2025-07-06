import { ClassData, TopPerformingClass, ScheduledClass, TeacherHours } from '../types';

export const getClassDuration = (className: string): string => {
  const lowerName = className.toLowerCase();
  
  if (lowerName.includes('express')) {
    return '0.75'; // 45 minutes
  }
  
  if (lowerName.includes('recovery') || lowerName.includes('sweat in 30')) {
    return '0.5'; // 30 minutes
  }
  
  return '1'; // 60 minutes (default)
};

export const isHostedClass = (className: string): boolean => {
  return className.toLowerCase().includes('hosted');
};

// Location-specific class format rules
export const isClassAllowedAtLocation = (classFormat: string, location: string): boolean => {
  const lowerFormat = classFormat.toLowerCase();
  
  if (location === 'Supreme HQ, Bandra') {
    // Supreme HQ: Focus on Fit, PowerCycle, and Barre
    // PowerCycle and PowerCycle Express ONLY at Supreme HQ
    // NO Amped Up or HIIT
    if (lowerFormat.includes('amped up') || lowerFormat.includes('hiit')) {
      return false;
    }
    return true; // All other classes allowed
  } else {
    // Other locations: NO PowerCycle or PowerCycle Express
    if (lowerFormat.includes('powercycle') || lowerFormat.includes('power cycle')) {
      return false;
    }
    return true; // All other classes allowed
  }
};

// Enhanced time restriction checking
export const isTimeRestricted = (time: string, day: string): boolean => {
  const hour = parseInt(time.split(':')[0]);
  const minute = parseInt(time.split(':')[1]);
  const timeInMinutes = hour * 60 + minute;
  
  // General restriction: 12:30 PM to 5:00 PM (750 to 1020 minutes)
  const generalRestricted = timeInMinutes >= 750 && timeInMinutes < 1020;
  
  if (day === 'Sunday') {
    // Sunday: earliest evening class at 4:00 PM (960 minutes)
    return timeInMinutes >= 750 && timeInMinutes < 960;
  } else if (day === 'Saturday') {
    // Saturday: earliest evening class at 4:00 PM (960 minutes)
    return timeInMinutes >= 750 && timeInMinutes < 960;
  } else {
    // Weekdays: 12:30 PM to 5:00 PM restricted
    return generalRestricted;
  }
};

// Check if time slot allows for balanced morning/evening distribution
export const isMorningSlot = (time: string): boolean => {
  const hour = parseInt(time.split(':')[0]);
  return hour < 14; // Before 2 PM is considered morning
};

export const isEveningSlot = (time: string): boolean => {
  const hour = parseInt(time.split(':')[0]);
  return hour >= 15; // 3 PM and after is considered evening
};

// Get shift balance for a location and day
export const getShiftBalance = (scheduledClasses: ScheduledClass[], location: string, day: string): { morning: number; evening: number } => {
  const dayClasses = scheduledClasses.filter(cls => cls.location === location && cls.day === day);
  
  const morning = dayClasses.filter(cls => isMorningSlot(cls.time)).length;
  const evening = dayClasses.filter(cls => isEveningSlot(cls.time)).length;
  
  return { morning, evening };
};

// Check if adding a class would maintain shift balance
export const maintainsShiftBalance = (
  scheduledClasses: ScheduledClass[],
  newClass: { day: string; time: string; location: string }
): boolean => {
  const currentBalance = getShiftBalance(scheduledClasses, newClass.location, newClass.day);
  const isNewClassMorning = isMorningSlot(newClass.time);
  
  if (isNewClassMorning) {
    // Adding morning class - check if it doesn't create too much imbalance
    return (currentBalance.morning + 1) <= currentBalance.evening + 2;
  } else {
    // Adding evening class - check if it doesn't create too much imbalance
    return (currentBalance.evening + 1) <= currentBalance.morning + 2;
  }
};

// Get teacher's daily hours
export const getTeacherDailyHours = (
  scheduledClasses: ScheduledClass[],
  teacherName: string,
  day: string
): number => {
  return scheduledClasses
    .filter(cls => 
      `${cls.teacherFirstName} ${cls.teacherLastName}` === teacherName && 
      cls.day === day
    )
    .reduce((sum, cls) => sum + parseFloat(cls.duration), 0);
};

// Check if teacher can take another class (max 4 hours per day)
export const canTeacherTakeClass = (
  scheduledClasses: ScheduledClass[],
  teacherName: string,
  day: string,
  duration: string
): boolean => {
  const currentDailyHours = getTeacherDailyHours(scheduledClasses, teacherName, day);
  return currentDailyHours + parseFloat(duration) <= 4;
};

// Get teacher's days off
export const getTeacherDaysOff = (
  scheduledClasses: ScheduledClass[],
  teacherName: string
): string[] => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const workingDays = new Set(
    scheduledClasses
      .filter(cls => `${cls.teacherFirstName} ${cls.teacherLastName}` === teacherName)
      .map(cls => cls.day)
  );
  
  return days.filter(day => !workingDays.has(day));
};

// Check if teacher has at least 2 days off
export const hasMinimumDaysOff = (
  scheduledClasses: ScheduledClass[],
  teacherName: string
): boolean => {
  const daysOff = getTeacherDaysOff(scheduledClasses, teacherName);
  return daysOff.length >= 2;
};

// Get minimum trainers needed for a shift
export const getMinimumTrainersForShift = (
  scheduledClasses: ScheduledClass[],
  location: string,
  day: string,
  isMorning: boolean
): number => {
  const shiftClasses = scheduledClasses.filter(cls => 
    cls.location === location && 
    cls.day === day && 
    (isMorning ? isMorningSlot(cls.time) : isEveningSlot(cls.time))
  );
  
  const uniqueTeachers = new Set(
    shiftClasses.map(cls => `${cls.teacherFirstName} ${cls.teacherLastName}`)
  );
  
  return uniqueTeachers.size;
};

// Check if class has above average attendance for its time slot
export const hasAboveAverageAttendance = (
  csvData: ClassData[],
  classFormat: string,
  location: string,
  day: string,
  time: string
): boolean => {
  const slotData = csvData.filter(item => 
    item.location === location &&
    item.dayOfWeek === day &&
    item.classTime.includes(time.slice(0, 5))
  );
  
  if (slotData.length === 0) return false;
  
  const slotAverage = slotData.reduce((sum, item) => sum + item.participants, 0) / slotData.length;
  
  const classData = slotData.filter(item => item.cleanedClass === classFormat);
  if (classData.length === 0) return false;
  
  const classAverage = classData.reduce((sum, item) => sum + item.participants, 0) / classData.length;
  
  return classAverage > slotAverage;
};

// Generate intelligent schedule with all optimization rules
export const generateIntelligentSchedule = async (
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
  
  // Exclude inactive trainers
  const allTeachers = [...new Set(csvData.map(item => item.teacherName))]
    .filter(teacher => !teacher.includes('Nishanth') && !teacher.includes('Saniya'));
  
  const locations = ['Kwality House, Kemps Corner', 'Supreme HQ, Bandra', 'Kenkere House'];
  const days = options.targetDay ? [options.targetDay] : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  // Priority teachers who should get maximum hours
  const priorityTeachers = ['Anisha', 'Vivaran', 'Mrigakshi', 'Pranjali', 'Atulan', 'Cauveri', 'Rohan'];
  const newTrainers = ['Kabir', 'Simonelle'];
  const newTrainerFormats = ['Studio Barre 57', 'Studio Barre 57 (Express)', 'Studio powerCycle', 'Studio powerCycle (Express)', 'Studio Cardio Barre'];
  
  // Get top performing classes
  const topClasses = getTopPerformingClasses(csvData, 5); // Classes with >5 avg participants
  
  // Helper function to check if teacher can take class
  const canAssignTeacher = (teacherName: string, day: string, duration: string): boolean => {
    const weeklyHours = teacherHoursTracker[teacherName] || 0;
    const dailyHours = teacherDailyHours[teacherName]?.[day] || 0;
    const classDuration = parseFloat(duration);
    
    // Check new trainer restrictions
    const isNewTrainer = newTrainers.some(name => teacherName.includes(name));
    const maxWeeklyHours = isNewTrainer ? 10 : 15;
    
    return weeklyHours + classDuration <= maxWeeklyHours && 
           dailyHours + classDuration <= 4 &&
           weeklyHours + classDuration >= 11; // Minimum hours
  };
  
  // Helper function to assign class
  const assignClass = (classData: any, teacher: string): void => {
    const duration = getClassDuration(classData.classFormat);
    
    optimizedClasses.push({
      id: `intelligent-${classData.location}-${classData.day}-${classData.time}-${Date.now()}-${Math.random()}`,
      day: classData.day,
      time: classData.time,
      location: classData.location,
      classFormat: classData.classFormat,
      teacherFirstName: teacher.split(' ')[0],
      teacherLastName: teacher.split(' ').slice(1).join(' '),
      duration: duration,
      participants: classData.avgParticipants,
      revenue: classData.avgRevenue,
      isTopPerformer: classData.avgParticipants > 5
    });
    
    // Update tracking
    teacherHoursTracker[teacher] = parseFloat(((teacherHoursTracker[teacher] || 0) + parseFloat(duration)).toFixed(1));
    
    if (!teacherDailyHours[teacher]) teacherDailyHours[teacher] = {};
    teacherDailyHours[teacher][classData.day] = parseFloat(((teacherDailyHours[teacher][classData.day] || 0) + parseFloat(duration)).toFixed(1));
  };
  
  // Phase 1: Schedule top performing classes with their best teachers
  for (const topClass of topClasses) {
    // Skip if targeting specific day and this isn't it
    if (options.targetDay && topClass.day !== options.targetDay) continue;
    
    // Check location rules
    if (!isClassAllowedAtLocation(topClass.classFormat, topClass.location)) {
      continue;
    }
    
    // Check shift balance
    if (options.balanceShifts && !maintainsShiftBalance(optimizedClasses, topClass)) {
      continue;
    }
    
    // Check if slot has capacity
    const existingClasses = optimizedClasses.filter(cls => 
      cls.location === topClass.location && 
      cls.day === topClass.day && 
      cls.time === topClass.time
    );
    
    const maxParallel = topClass.location === 'Supreme HQ, Bandra' ? 3 : 2;
    if (existingClasses.length >= maxParallel) continue;
    
    // Ensure different class formats in same slot
    if (existingClasses.some(cls => cls.classFormat === topClass.classFormat)) continue;
    
    // Find best teacher for this class
    const bestTeacher = getBestTeacherForClass(csvData, topClass.classFormat, topClass.location, topClass.day, topClass.time);
    
    if (bestTeacher && canAssignTeacher(bestTeacher, topClass.day, getClassDuration(topClass.classFormat))) {
      // Check new trainer restrictions
      const isNewTrainer = newTrainers.some(name => bestTeacher.includes(name));
      if (isNewTrainer && !newTrainerFormats.includes(topClass.classFormat)) {
        continue;
      }
      
      assignClass(topClass, bestTeacher);
    }
  }
  
  // Phase 2: Fill remaining slots with balanced distribution
  for (const location of locations) {
    for (const day of days) {
      // Morning slots (7:30-12:00)
      const morningSlots = ['07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00'];
      // Evening slots (17:30-20:00)
      const eveningSlots = ['17:30', '18:00', '18:30', '19:00', '19:30', '20:00'];
      
      // Balance morning and evening classes
      const currentBalance = getShiftBalance(optimizedClasses, location, day);
      const slotsToFill = currentBalance.morning < currentBalance.evening ? morningSlots : eveningSlots;
      
      for (const time of slotsToFill) {
        // Check if slot has capacity
        const existingClasses = optimizedClasses.filter(cls => 
          cls.location === location && 
          cls.day === day && 
          cls.time === time
        );
        
        const maxParallel = location === 'Supreme HQ, Bandra' ? 3 : 2;
        if (existingClasses.length >= maxParallel) continue;
        
        // Find best class for this slot
        const slotClasses = csvData.filter(item => 
          item.location === location &&
          item.dayOfWeek === day &&
          item.classTime.includes(time) &&
          !isHostedClass(item.cleanedClass) &&
          isClassAllowedAtLocation(item.cleanedClass, location) &&
          item.participants > 5 && // Only classes with >5 avg participants
          !existingClasses.some(cls => cls.classFormat === item.cleanedClass) // Different formats
        );
        
        if (slotClasses.length === 0) continue;
        
        // Get class with highest average
        const bestClass = slotClasses.sort((a, b) => b.participants - a.participants)[0];
        const bestTeacher = getBestTeacherForClass(csvData, bestClass.cleanedClass, location, day, time);
        
        if (bestTeacher && canAssignTeacher(bestTeacher, day, getClassDuration(bestClass.cleanedClass))) {
          // Check new trainer restrictions
          const isNewTrainer = newTrainers.some(name => bestTeacher.includes(name));
          if (isNewTrainer && !newTrainerFormats.includes(bestClass.cleanedClass)) {
            continue;
          }
          
          assignClass({
            classFormat: bestClass.cleanedClass,
            location: location,
            day: day,
            time: time,
            avgParticipants: bestClass.participants,
            avgRevenue: bestClass.totalRevenue
          }, bestTeacher);
        }
      }
    }
  }
  
  // Phase 3: Optimize teacher hours for priority teachers
  if (options.optimizeTeacherHours) {
    for (const priorityTeacher of priorityTeachers) {
      const fullName = allTeachers.find(teacher => teacher.includes(priorityTeacher));
      if (!fullName) continue;
      
      const currentHours = teacherHoursTracker[fullName] || 0;
      if (currentHours < 12) {
        // Try to add more classes for this teacher
        const teacherSpecialties = getTeacherSpecialties(csvData)[fullName] || [];
        
        for (const specialty of teacherSpecialties.slice(0, 2)) {
          if ((teacherHoursTracker[fullName] || 0) >= 14) break;
          
          // Find available slots for this teacher's specialties
          for (const location of locations) {
            if (!isClassAllowedAtLocation(specialty.classFormat, location)) continue;
            
            for (const day of days) {
              if (!hasMinimumDaysOff(optimizedClasses, fullName) && getTeacherDaysOff(optimizedClasses, fullName).length <= 2) {
                continue;
              }
              
              const timeSlots = ['07:30', '08:00', '09:00', '18:00', '19:00', '20:00'];
              
              for (const time of timeSlots) {
                const existingClasses = optimizedClasses.filter(cls => 
                  cls.location === location && 
                  cls.day === day && 
                  cls.time === time
                );
                
                const maxParallel = location === 'Supreme HQ, Bandra' ? 3 : 2;
                if (existingClasses.length >= maxParallel) continue;
                
                // Ensure different formats
                if (existingClasses.some(cls => cls.classFormat === specialty.classFormat)) continue;
                
                if (canAssignTeacher(fullName, day, getClassDuration(specialty.classFormat))) {
                  assignClass({
                    classFormat: specialty.classFormat,
                    location: location,
                    day: day,
                    time: time,
                    avgParticipants: specialty.avgParticipants,
                    avgRevenue: 0
                  }, fullName);
                  break;
                }
              }
            }
          }
        }
      }
    }
  }
  
  // Phase 4: Ensure all teachers have 2 days off
  for (const teacher of Object.keys(teacherHoursTracker)) {
    const daysOff = getTeacherDaysOff(optimizedClasses, teacher);
    if (daysOff.length < 2) {
      // Remove some classes to ensure 2 days off
      const teacherClasses = optimizedClasses.filter(cls => 
        `${cls.teacherFirstName} ${cls.teacherLastName}` === teacher
      );
      
      // Remove classes from the day with least classes
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

// Rest of the existing utility functions remain the same...
export const getLocationAverage = (csvData: ClassData[], location: string): number => {
  const locationData = csvData.filter(item => item.location === location && !isHostedClass(item.cleanedClass));
  if (locationData.length === 0) return 0;
  
  const totalParticipants = locationData.reduce((sum, item) => sum + item.participants, 0);
  return totalParticipants / locationData.length;
};

export const getTopPerformingClasses = (csvData: ClassData[], minAverage: number = 6, includeTeacher: boolean = true): TopPerformingClass[] => {
  // Filter out hosted classes and apply location rules
  const validClasses = csvData.filter(item => 
    !isHostedClass(item.cleanedClass) && 
    isClassAllowedAtLocation(item.cleanedClass, item.location)
  );
  
  // Group by class format, location, day, time, and optionally teacher
  const classGroups = validClasses.reduce((acc, item) => {
    const key = includeTeacher 
      ? `${item.cleanedClass}-${item.location}-${item.dayOfWeek}-${item.classTime.slice(0, 5)}-${item.teacherName}`
      : `${item.cleanedClass}-${item.location}-${item.dayOfWeek}-${item.classTime.slice(0, 5)}`;
    
    if (!acc[key]) {
      acc[key] = {
        classFormat: item.cleanedClass,
        location: item.location,
        day: item.dayOfWeek,
        time: item.classTime.slice(0, 5),
        teacher: includeTeacher ? item.teacherName : '',
        totalParticipants: 0,
        totalRevenue: 0,
        count: 0
      };
    }
    
    acc[key].totalParticipants += item.participants;
    acc[key].totalRevenue += item.totalRevenue;
    acc[key].count += 1;
    
    return acc;
  }, {} as any);
  
  // Filter classes above minimum average and sort by performance
  const topClasses = Object.values(classGroups)
    .map((group: any) => ({
      classFormat: group.classFormat,
      location: group.location,
      day: group.day,
      time: group.time,
      teacher: group.teacher,
      avgParticipants: parseFloat((group.totalParticipants / group.count).toFixed(1)),
      avgRevenue: parseFloat((group.totalRevenue / group.count).toFixed(1)),
      frequency: group.count
    }))
    .filter(cls => cls.frequency >= 2 && cls.avgParticipants >= minAverage)
    .sort((a, b) => {
      // Sort by average participants first, then by frequency
      const participantDiff = b.avgParticipants - a.avgParticipants;
      if (Math.abs(participantDiff) > 1) return participantDiff;
      return b.frequency - a.frequency;
    });
  
  return topClasses;
};

export const getBestTeacherForClass = (
  csvData: ClassData[], 
  classFormat: string, 
  location: string, 
  day: string, 
  time: string
): string | null => {
  const relevantClasses = csvData.filter(item => 
    item.cleanedClass === classFormat &&
    item.location === location &&
    item.dayOfWeek === day &&
    item.classTime.includes(time) &&
    !isHostedClass(item.cleanedClass) &&
    !item.teacherName.includes('Nishanth') &&
    !item.teacherName.includes('Saniya')
  );

  if (relevantClasses.length === 0) return null;

  // Group by teacher and calculate averages
  const teacherStats = relevantClasses.reduce((acc, item) => {
    if (!acc[item.teacherName]) {
      acc[item.teacherName] = { participants: 0, count: 0 };
    }
    acc[item.teacherName].participants += item.participants;
    acc[item.teacherName].count += 1;
    return acc;
  }, {} as any);

  // Find teacher with highest average
  const bestTeacher = Object.entries(teacherStats)
    .map(([teacher, stats]: [string, any]) => ({
      teacher,
      avgParticipants: stats.participants / stats.count
    }))
    .sort((a, b) => b.avgParticipants - a.avgParticipants)[0];

  return bestTeacher?.teacher || null;
};

export const getClassAverageForSlot = (
  csvData: ClassData[],
  classFormat: string,
  location: string,
  day: string,
  time: string,
  teacherName?: string
): { average: number; count: number } => {
  let relevantClasses = csvData.filter(item => 
    item.cleanedClass === classFormat &&
    item.location === location &&
    item.dayOfWeek === day &&
    item.classTime.includes(time) &&
    !isHostedClass(item.cleanedClass)
  );

  if (teacherName) {
    relevantClasses = relevantClasses.filter(item => item.teacherName === teacherName);
  }

  if (relevantClasses.length === 0) {
    return { average: 0, count: 0 };
  }

  const totalParticipants = relevantClasses.reduce((sum, item) => sum + item.participants, 0);
  return {
    average: parseFloat((totalParticipants / relevantClasses.length).toFixed(1)),
    count: relevantClasses.length
  };
};

export const getTeacherSpecialties = (csvData: ClassData[]): Record<string, Array<{ classFormat: string; avgParticipants: number; classCount: number }>> => {
  const teacherStats: Record<string, Record<string, { participants: number; count: number }>> = {};

  csvData.forEach(item => {
    if (isHostedClass(item.cleanedClass)) return;
    if (item.teacherName.includes('Nishanth') || item.teacherName.includes('Saniya')) return;

    if (!teacherStats[item.teacherName]) {
      teacherStats[item.teacherName] = {};
    }

    if (!teacherStats[item.teacherName][item.cleanedClass]) {
      teacherStats[item.teacherName][item.cleanedClass] = { participants: 0, count: 0 };
    }

    teacherStats[item.teacherName][item.cleanedClass].participants += item.participants;
    teacherStats[item.teacherName][item.cleanedClass].count += 1;
  });

  // Convert to sorted specialties for each teacher
  const specialties: Record<string, Array<{ classFormat: string; avgParticipants: number; classCount: number }>> = {};

  Object.entries(teacherStats).forEach(([teacher, classes]) => {
    specialties[teacher] = Object.entries(classes)
      .map(([classFormat, stats]) => ({
        classFormat,
        avgParticipants: parseFloat((stats.participants / stats.count).toFixed(1)),
        classCount: stats.count
      }))
      .sort((a, b) => {
        // Sort by class count first (experience), then by average participants
        if (b.classCount !== a.classCount) {
          return b.classCount - a.classCount;
        }
        return b.avgParticipants - a.avgParticipants;
      })
      .slice(0, 5); // Top 5 specialties
  });

  return specialties;
};

export const validateTeacherHours = (
  scheduledClasses: ScheduledClass[],
  newClass: ScheduledClass
): { isValid: boolean; warning?: string; error?: string } => {
  const teacherName = `${newClass.teacherFirstName} ${newClass.teacherLastName}`;
  
  // Calculate current hours for this teacher
  const currentHours = scheduledClasses
    .filter(cls => `${cls.teacherFirstName} ${cls.teacherLastName}` === teacherName)
    .reduce((sum, cls) => sum + parseFloat(cls.duration), 0);
  
  const newTotal = currentHours + parseFloat(newClass.duration);
  
  // Check new trainer restrictions
  const newTrainers = ['Kabir', 'Simonelle'];
  const isNewTrainer = newTrainers.some(name => teacherName.includes(name));
  const maxHours = isNewTrainer ? 10 : 15;
  
  if (newTotal > maxHours) {
    return {
      isValid: false,
      error: `This would exceed ${teacherName}'s ${maxHours}-hour weekly limit (currently ${currentHours.toFixed(1)}h, would be ${newTotal.toFixed(1)}h)`
    };
  } else if (newTotal > (maxHours - 3)) {
    return {
      isValid: true,
      warning: `${teacherName} would have ${newTotal.toFixed(1)}h this week (approaching ${maxHours}h limit)`
    };
  }
  
  return { isValid: true };
};

export const calculateTeacherHours = (scheduledClasses: ScheduledClass[]): TeacherHours => {
  return scheduledClasses.reduce((acc, cls) => {
    const teacherName = `${cls.teacherFirstName} ${cls.teacherLastName}`;
    acc[teacherName] = parseFloat(((acc[teacherName] || 0) + parseFloat(cls.duration)).toFixed(1));
    return acc;
  }, {} as TeacherHours);
};

export const getClassCounts = (scheduledClasses: ScheduledClass[]) => {
  const locations = ['Kwality House, Kemps Corner', 'Supreme HQ, Bandra', 'Kenkere House'];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  const counts = locations.reduce((acc, location) => {
    acc[location] = days.reduce((dayAcc, day) => {
      const dayClasses = scheduledClasses.filter(cls => cls.location === location && cls.day === day);
      dayAcc[day] = dayClasses.reduce((classAcc, cls) => {
        classAcc[cls.classFormat] = (classAcc[cls.classFormat] || 0) + 1;
        return classAcc;
      }, {} as any);
      return dayAcc;
    }, {} as any);
    return acc;
  }, {} as any);
  
  return counts;
};

export const getUniqueTeachers = (csvData: ClassData[], customTeachers: any[] = []): string[] => {
  const csvTeachers = csvData
    .map(item => item.teacherName)
    .filter(teacher => !teacher.includes('Nishanth') && !teacher.includes('Saniya'));
  const customTeacherNames = customTeachers.map(t => `${t.firstName} ${t.lastName}`);
  
  return [...new Set([...csvTeachers, ...customTeacherNames])].sort();
};

export const getClassFormatsForDay = (scheduledClasses: ScheduledClass[], day: string): Record<string, number> => {
  const dayClasses = scheduledClasses.filter(cls => cls.day === day);
  return dayClasses.reduce((acc, cls) => {
    acc[cls.classFormat] = (acc[cls.classFormat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
};

export const getTimeSlotsWithData = (csvData: ClassData[], location: string): Set<string> => {
  const timeSlotsWithData = new Set<string>();
  
  csvData
    .filter(item => item.location === location && !isHostedClass(item.cleanedClass))
    .forEach(item => {
      const timeSlot = item.classTime.slice(0, 5); // Extract HH:MM format
      timeSlotsWithData.add(timeSlot);
    });
  
  return timeSlotsWithData;
};

export const getClassesAtTimeSlot = (
  scheduledClasses: ScheduledClass[],
  day: string,
  time: string,
  location: string
): ScheduledClass[] => {
  return scheduledClasses.filter(cls => 
    cls.day === day && cls.time === time && cls.location === location
  );
};

export const hasTimeSlotCapacity = (
  scheduledClasses: ScheduledClass[],
  day: string,
  time: string,
  location: string
): boolean => {
  const existingClasses = getClassesAtTimeSlot(scheduledClasses, day, time, location);
  const maxClasses = location === 'Supreme HQ, Bandra' ? 3 : 2;
  return existingClasses.length < maxClasses;
};