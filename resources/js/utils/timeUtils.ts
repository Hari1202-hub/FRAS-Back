
/**
 * Calculates working hours between check-in and check-out times
 * @param checkInTime Check-in time string (format: "HH:MM AM/PM")
 * @param checkOutTime Check-out time string (format: "HH:MM AM/PM") 
 * @returns Formatted working hours string (e.g., "08h 15m")
 */
export const calculateWorkingHours = (checkInTime: string, checkOutTime: string): string => {
  try {
    if (!checkInTime || !checkOutTime) return "N/A";
    
    // Parse times assuming they are in format like "08:30 AM"
    const [inHour, inMinute] = checkInTime.split(':');
    const inHourNum = parseInt(inHour);
    const inMinuteNum = parseInt(inMinute.split(' ')[0]);
    const inIsAM = checkInTime.includes('AM');
    
    const [outHour, outMinute] = checkOutTime.split(':');
    const outHourNum = parseInt(outHour);
    const outMinuteNum = parseInt(outMinute.split(' ')[0]);
    const outIsAM = checkOutTime.includes('AM');
    
    // Convert to 24 hour format
    let inHour24 = inHourNum;
    if (inIsAM && inHourNum === 12) inHour24 = 0;
    if (!inIsAM && inHourNum !== 12) inHour24 = inHourNum + 12;
    
    let outHour24 = outHourNum;
    if (outIsAM && outHourNum === 12) outHour24 = 0;
    if (!outIsAM && outHourNum !== 12) outHour24 = outHourNum + 12;
    
    // Calculate difference in minutes
    const inTotalMinutes = inHour24 * 60 + inMinuteNum;
    const outTotalMinutes = outHour24 * 60 + outMinuteNum;
    
    // Handle case where checkout is next day
    let diffMinutes = outTotalMinutes - inTotalMinutes;
    if (diffMinutes < 0) {
      diffMinutes += 24 * 60; // Add 24 hours worth of minutes
    }
    
    // Convert to hours and minutes
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    
    return `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m`;
  } catch (error) {
    return "N/A";
  }
};

/**
 * Checks if working hours exceed the standard 9-hour workday
 * @param workingHoursString Formatted working hours string (e.g., "08h 15m")
 * @returns Boolean indicating if hours exceed 9 hours
 */
export const isOvertimeWorked = (workingHoursString: string): boolean => {
  if (workingHoursString === "N/A") return false;
  
  try {
    // Extract hours from string format "08h 15m"
    const hoursMatch = workingHoursString.match(/(\d+)h/);
    if (!hoursMatch) return false;
    
    const hours = parseInt(hoursMatch[1]);
    return hours >= 9;
  } catch (error) {
    return false;
  }
};

/**
 * Converts a working hours string to minutes
 * @param workingHoursString Formatted working hours string (e.g., "08h 15m")
 * @returns Total minutes
 */
export const hoursToMinutes = (workingHoursString: string): number => {
  if (workingHoursString === "N/A") return 0;
  
  try {
    const hoursMatch = workingHoursString.match(/(\d+)h/);
    const minutesMatch = workingHoursString.match(/(\d+)m/);
    
    const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
    const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;
    
    return hours * 60 + minutes;
  } catch (error) {
    return 0;
  }
};

/**
 * Converts minutes to working hours string format
 * @param totalMinutes Total minutes
 * @returns Formatted working hours string (e.g., "08h 15m")
 */
export const minutesToHours = (totalMinutes: number): string => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  return `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m`;
};

/**
 * Sums multiple working hours strings
 * @param hoursArray Array of working hours strings (e.g., ["08h 15m", "04h 30m"])
 * @returns Formatted total working hours string
 */
export const sumWorkingHours = (hoursArray: string[]): string => {
  // Convert all hour strings to minutes
  const totalMinutes = hoursArray.reduce((sum, hourString) => {
    return sum + hoursToMinutes(hourString);
  }, 0);
  
  // Convert back to hours format
  return minutesToHours(totalMinutes);
};
