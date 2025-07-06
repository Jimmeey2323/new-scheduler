
import { ScheduledClass } from '../types';

export interface StudioCapacity {
  [location: string]: {
    [studioName: string]: number;
  };
}

export const STUDIO_CAPACITIES: StudioCapacity = {
  'Kwality House, Kemps Corner': {
    'Studio 1': 20,
    'Studio 2': 12,
    'Mat Studio': 13,
    'Fit Studio': 14
  },
  'Supreme HQ, Bandra': {
    'Main Studio': 14,
    'Cycle Studio': 14,
    'Secondary Studio': 12
  },
  'Kenkere House': {
    'Main Studio': 12,
    'Secondary Studio': 10
  }
};

export interface TimeSlot {
  startTime: string;
  endTime: string;
}

export const getClassEndTime = (startTime: string, duration: string): string => {
  const [hours, minutes] = startTime.split(':').map(Number);
  const durationHours = parseFloat(duration);
  const totalMinutes = hours * 60 + minutes + (durationHours * 60);
  const endHours = Math.floor(totalMinutes / 60);
  const endMins = totalMinutes % 60;
  return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
};

export const isStudioAvailable = (
  location: string,
  day: string,
  startTime: string,
  duration: string,
  existingSchedule: ScheduledClass[],
  excludeClassId?: string
): { available: boolean; suggestedStudio?: string } => {
  const studios = Object.keys(STUDIO_CAPACITIES[location] || {});
  const classEndTime = getClassEndTime(startTime, duration);
  
  // Get all classes at this location on this day
  const locationClasses = existingSchedule.filter(cls => 
    cls.location === location && 
    cls.day === day &&
    cls.id !== excludeClassId
  );

  // Check each studio for availability
  for (const studio of studios) {
    let studioOccupied = false;
    
    for (const existingClass of locationClasses) {
      const existingEndTime = getClassEndTime(existingClass.time, existingClass.duration);
      
      // Check if times overlap
      if (timesOverlap(startTime, classEndTime, existingClass.time, existingEndTime)) {
        studioOccupied = true;
        break;
      }
    }
    
    if (!studioOccupied) {
      return { available: true, suggestedStudio: studio };
    }
  }
  
  return { available: false };
};

export const timesOverlap = (start1: string, end1: string, start2: string, end2: string): boolean => {
  const start1Minutes = timeToMinutes(start1);
  const end1Minutes = timeToMinutes(end1);
  const start2Minutes = timeToMinutes(start2);
  const end2Minutes = timeToMinutes(end2);
  
  return start1Minutes < end2Minutes && end1Minutes > start2Minutes;
};

export const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

export const getNextAvailableTime = (
  location: string,
  day: string,
  preferredTime: string,
  duration: string,
  existingSchedule: ScheduledClass[]
): string | null => {
  const maxStudios = Object.keys(STUDIO_CAPACITIES[location] || {}).length;
  let currentTime = preferredTime;
  
  // Try times in 15-minute increments for up to 3 hours
  for (let i = 0; i < 12; i++) {
    const availability = isStudioAvailable(location, day, currentTime, duration, existingSchedule);
    if (availability.available) {
      return currentTime;
    }
    
    // Move to next 15-minute slot
    const minutes = timeToMinutes(currentTime) + 15;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    currentTime = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    
    // Don't go past 21:00
    if (hours >= 21) break;
  }
  
  return null;
};

export const validateScheduleConflicts = (schedule: ScheduledClass[]): {
  conflicts: string[];
  suggestions: string[];
} => {
  const conflicts: string[] = [];
  const suggestions: string[] = [];
  
  // Group by location and day
  const locationDayGroups = schedule.reduce((acc, cls) => {
    const key = `${cls.location}_${cls.day}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(cls);
    return acc;
  }, {} as Record<string, ScheduledClass[]>);
  
  // Check each location-day combination
  Object.entries(locationDayGroups).forEach(([key, classes]) => {
    const [location, day] = key.split('_');
    const maxStudios = Object.keys(STUDIO_CAPACITIES[location] || {}).length;
    
    // Sort classes by time
    const sortedClasses = classes.sort((a, b) => a.time.localeCompare(b.time));
    
    // Check for overlapping classes
    const overlappingGroups: ScheduledClass[][] = [];
    
    sortedClasses.forEach(cls => {
      const classEndTime = getClassEndTime(cls.time, cls.duration);
      const overlapping = [cls];
      
      sortedClasses.forEach(otherCls => {
        if (cls.id !== otherCls.id) {
          const otherEndTime = getClassEndTime(otherCls.time, otherCls.duration);
          if (timesOverlap(cls.time, classEndTime, otherCls.time, otherEndTime)) {
            overlapping.push(otherCls);
          }
        }
      });
      
      if (overlapping.length > maxStudios) {
        conflicts.push(`${location} on ${day}: ${overlapping.length} overlapping classes exceed ${maxStudios} studio capacity`);
        overlappingGroups.push(overlapping);
      }
    });
  });
  
  return { conflicts, suggestions };
};
