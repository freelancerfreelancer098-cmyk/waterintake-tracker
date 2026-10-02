// ========================================
// WATER INTAKE TRACKER - STORAGE MODULE
// Handles localStorage operations
// ========================================

const STORAGE_KEY = 'water-tracker-data';
const LAST_VISIT_KEY = 'water-tracker-last-visit';

/**
 * Get today's date as a string in YYYY-MM-DD format
 * This is used as the key for storing daily data
 */
export function getTodayKey() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Load all data from localStorage
 * Returns default data if nothing exists yet
 */
export function loadData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  
  if (!raw) {
    // Return default structure for first-time users
    return {
      settings: {
        dailyGoal: 2,           // Liters
        glassSize: 250,         // ML per glass
        reminderInterval: 60,   // minutes (auto-calculated)
        remindersEnabled: false
      },
      today: {
        date: getTodayKey(),
        consumed: 0,            // ML consumed today
        glasses: 0,             // number of glasses
        glassFilled: false      // whether current glass is filled
      },
      createdAt: new Date().toISOString()
    };
  }
  
  const data = JSON.parse(raw);
  
  // Check if it's a new day - reset today's data if needed
  const today = getTodayKey();
  if (data.today.date !== today) {
    data.today = {
      date: today,
      consumed: 0,
      glasses: 0,
      glassFilled: false
    };
    saveData(data);
  }
  
  return data;
}

/**
 * Save all data to localStorage
 * Converts the data object to JSON string before storing
 */
export function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/**
 * Update today's consumption
 * @param {number} amount - Amount in ML to add
 */
export function addConsumption(amount) {
  const data = loadData();
  data.today.consumed += amount;
  data.today.glasses += 1;
  saveData(data);
  return data;
}

/**
 * Remove the last glass consumption
 */
export function undoLastGlass() {
  const data = loadData();
  if (data.today.glasses > 0) {
    data.today.consumed -= data.settings.glassSize;
    data.today.glasses -= 1;
    // Ensure we don't go negative
    if (data.today.consumed < 0) {
      data.today.consumed = 0;
    }
    saveData(data);
  }
  return data;
}

/**
 * Reset today's data (start fresh)
 */
export function resetToday() {
  const data = loadData();
  data.today.consumed = 0;
  data.today.glasses = 0;
  saveData(data);
  return data;
}

/**
 * Update user settings
 * @param {object} newSettings - Settings object to update
 */
export function updateSettings(newSettings) {
  const data = loadData();
  data.settings = { ...data.settings, ...newSettings };
  saveData(data);
  return data;
}

/**
 * Calculate reminder interval based on glass size
 * Larger glass = longer interval between reminders
 * @param {number} glassSize - Glass size in ML
 * @returns {number} - Reminder interval in minutes
 */
export function calculateReminderInterval(glassSize) {
  // Base formula: glass size (ML) / 4 = minutes
  // 250ml glass = ~62 minutes
  // 500ml glass = ~125 minutes
  const interval = Math.round(glassSize / 4);
  // Ensure minimum 30 minutes, maximum 180 minutes
  return Math.max(30, Math.min(180, interval));
}

/**
 * Save initial settings (called during onboarding)
 * @param {object} settings - User's initial settings
 */
export function saveInitialSettings(settings) {
  // Auto-calculate reminder interval based on glass size
  const reminderInterval = calculateReminderInterval(settings.glassSize);
  
  const data = {
    settings: {
      ...settings,
      reminderInterval: reminderInterval,
      remindersEnabled: true
    },
    today: {
      date: getTodayKey(),
      consumed: 0,
      glasses: 0,
      glassFilled: false
    },
    createdAt: new Date().toISOString()
  };
  saveData(data);
  return data;
}

/**
 * Check if user has completed onboarding
 */
export function hasCompletedOnboarding() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw !== null;
}

/**
 * Get the last visit date
 */
export function getLastVisit() {
  return localStorage.getItem(LAST_VISIT_KEY);
}

/**
 * Update the last visit date to today
 */
export function updateLastVisit() {
  localStorage.setItem(LAST_VISIT_KEY, getTodayKey());
}

/**
 * Clear all data (for testing or reset)
 */
export function clearAllData() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(LAST_VISIT_KEY);
}
