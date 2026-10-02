// ========================================
// WATER INTAKE TRACKER - REMINDERS MODULE
// Handles browser notifications
// ========================================

let reminderTimeout = null;

/**
 * Check if browser supports notifications
 */
export function isNotificationSupported() {
  return 'Notification' in window;
}

/**
 * Request notification permission from user
 * Returns true if permission is granted
 */
export async function requestNotificationPermission() {
  if (!isNotificationSupported()) {
    console.warn('Notifications not supported in this browser');
    return false;
  }
  
  if (Notification.permission === 'granted') {
    return true;
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  
  return false;
}

/**
 * Show a notification immediately
 * @param {string} title - Notification title
 * @param {string} body - Notification body text
 */
export function showNotification(title, body) {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return;
  }
  
  new Notification(title, {
    body: body,
    icon: '/assets/icon-192.png',
    badge: '/assets/icon-192.png',
    tag: 'water-reminder',
    requireInteraction: false
  });
}

/**
 * Schedule a reminder notification
 * @param {number} minutes - Minutes until reminder
 * @param {function} onReminder - Callback when reminder fires
 */
export function scheduleReminder(minutes, onReminder) {
  // Clear any existing reminder
  if (reminderTimeout) {
    clearTimeout(reminderTimeout);
  }
  
  const milliseconds = minutes * 60 * 1000;
  
  reminderTimeout = setTimeout(() => {
    showNotification(
      'Time to drink water!',
      'Stay hydrated! Click to log your water intake.'
    );
    // Call callback to auto-pour
    if (onReminder) {
      onReminder();
    }
  }, milliseconds);
  
  return reminderTimeout;
}

/**
 * Cancel the scheduled reminder
 */
export function cancelReminder() {
  if (reminderTimeout) {
    clearTimeout(reminderTimeout);
    reminderTimeout = null;
  }
}

/**
 * Enable reminders with custom interval
 * @param {number} minutes - Reminder interval in minutes
 * @param {function} onReminder - Callback when reminder fires
 */
export async function enableReminders(minutes, onReminder) {
  const hasPermission = await requestNotificationPermission();
  
  if (hasPermission) {
    scheduleReminder(minutes, onReminder);
    return true;
  }
  
  return false;
}

/**
 * Disable reminders
 */
export function disableReminders() {
  cancelReminder();
}

/**
 * Get the next reminder time as a formatted string
 * @param {number} minutes - Minutes until reminder
 */
export function getNextReminderTime(minutes) {
  const now = new Date();
  const nextTime = new Date(now.getTime() + minutes * 60 * 1000);
  
  const hours = nextTime.getHours();
  const minutesStr = nextTime.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  
  return `${displayHours}:${minutesStr} ${ampm}`;
}

/**
 * Format time remaining until next reminder
 * @param {number} minutes - Minutes until reminder
 */
export function formatTimeRemaining(minutes) {
  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }
  
  return `${hours} hour${hours !== 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
}
