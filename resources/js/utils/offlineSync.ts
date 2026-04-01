// This utility handles the offline storage and synchronization of attendance data

interface AttendanceRecord {
  id?: number;
  employeeId: string;
  employeeName: string;
  type: 'checkin' | 'checkout';
  timestamp: string;
  method: 'face' | 'manual';
  projectId: string;
  location: {
    latitude: number | null;
    longitude: number | null;
  };
  comment?: string;
  synced: boolean;
}

// Store for offline attendance records
const STORAGE_KEY = 'proscape-offline-attendance';

/**
 * Save attendance record to local storage when offline
 */
export const saveOfflineAttendance = (record: Omit<AttendanceRecord, 'synced'>) => {
  try {
    // Get existing records
    const existingRecords = getOfflineAttendance();
    
    // Add new record with synced status set to false
    const newRecord: AttendanceRecord = {
      ...record,
      id: Date.now(), // Generate a temporary ID
      synced: false
    };
    
    const updatedRecords = [...existingRecords, newRecord];
    
    // Save back to storage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRecords));
    
    return true;
  } catch (error) {
    console.error('Error saving offline attendance:', error);
    return false;
  }
};

/**
 * Get all offline attendance records
 */
export const getOfflineAttendance = (): AttendanceRecord[] => {
  try {
    const records = localStorage.getItem(STORAGE_KEY);
    return records ? JSON.parse(records) : [];
  } catch (error) {
    console.error('Error retrieving offline attendance:', error);
    return [];
  }
};

/**
 * Get count of unsynchronized records
 */
export const getUnsyncedCount = (): number => {
  const records = getOfflineAttendance();
  return records.filter(record => !record.synced).length;
};

/**
 * Synchronize offline records with server when back online
 */
export const syncOfflineAttendance = async (): Promise<{success: boolean, syncedCount: number}> => {
  try {
    const records = getOfflineAttendance();
    const unsyncedRecords = records.filter(record => !record.synced);
    
    if (unsyncedRecords.length === 0) {
      return { success: true, syncedCount: 0 };
    }
    
    // In a real implementation, this would send the records to the server
    // For this prototype, we'll just mark them as synced
    
    // Mock API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Update records to mark as synced
    const updatedRecords = records.map(record => ({
      ...record,
      synced: true
    }));
    
    // Save back to storage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRecords));
    
    return {
      success: true,
      syncedCount: unsyncedRecords.length
    };
  } catch (error) {
    console.error('Error syncing offline attendance:', error);
    return {
      success: false,
      syncedCount: 0
    };
  }
};

/**
 * Clear all synchronized records to free up storage
 */
export const clearSyncedRecords = (): boolean => {
  try {
    const records = getOfflineAttendance();
    const unsyncedRecords = records.filter(record => !record.synced);
    
    // Only keep unsynced records
    localStorage.setItem(STORAGE_KEY, JSON.stringify(unsyncedRecords));
    
    return true;
  } catch (error) {
    console.error('Error clearing synced records:', error);
    return false;
  }
};

/**
 * Check if device is online
 */
export const isOnline = (): boolean => {
  return navigator.onLine;
};

/**
 * Listen for online/offline status changes
 */
export const setupNetworkListeners = (
  onOffline: () => void,
  onOnline: () => void
) => {
  window.addEventListener('offline', onOffline);
  window.addEventListener('online', onOnline);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('offline', onOffline);
    window.removeEventListener('online', onOnline);
  };
};
