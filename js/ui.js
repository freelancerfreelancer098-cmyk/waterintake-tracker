// ========================================
// WATER INTAKE TRACKER - UI MODULE
// Handles rendering and animations
// ========================================

import { getProgressPercentage, getRemainingAmount } from './tracker.js';

/**
 * Show the onboarding screen
 */
export function showOnboarding() {
  const onboarding = document.getElementById('onboarding');
  const tracker = document.getElementById('tracker');
  
  if (onboarding && tracker) {
    onboarding.classList.remove('hidden');
    tracker.classList.add('hidden');
  }
}

/**
 * Show the tracker screen
 */
export function showTracker() {
  const onboarding = document.getElementById('onboarding');
  const tracker = document.getElementById('tracker');
  
  if (onboarding && tracker) {
    onboarding.classList.add('hidden');
    tracker.classList.remove('hidden');
    tracker.classList.add('fade-in');
  }
}

/**
 * Render the bottle water level based on remaining amount
 * @param {number} remaining - Remaining ML in bottle
 * @param {number} total - Total daily goal in ML
 */
export function renderBottleWater(remaining, total) {
  const bottleWater = document.getElementById('bottle-water');
  const bottleAmount = document.getElementById('bottle-amount');
  
  if (bottleWater) {
    const percentage = (remaining / total) * 100;
    bottleWater.style.height = `${percentage}%`;
  }
  
  if (bottleAmount) {
    // Convert ML to Liters for display
    const liters = (remaining / 1000).toFixed(1);
    bottleAmount.textContent = liters;
  }
}

/**
 * Render the glass water level
 * @param {number} amount - Current amount in glass (ML)
 * @param {number} glassSize - Full glass size (ML)
 */
export function renderGlassWater(amount, glassSize) {
  const glassWater = document.getElementById('glass-water');
  const glassAmount = document.getElementById('glass-amount');
  
  if (glassWater) {
    const percentage = (amount / glassSize) * 100;
    glassWater.style.height = `${percentage}%`;
    
    // Store the current height for animation
    glassWater.style.setProperty('--drink-height', `${percentage}%`);
  }
  
  if (glassAmount) {
    glassAmount.textContent = Math.round(amount);
  }
}

/**
 * Render progress information
 * @param {object} data - App data from storage
 */
export function renderProgress(data) {
  const consumedEl = document.getElementById('consumed-amount');
  const goalEl = document.getElementById('goal-amount');
  const percentEl = document.getElementById('progress-percent');
  
  if (consumedEl) {
    // Convert ML to Liters for display
    const consumedL = (data.today.consumed / 1000).toFixed(1);
    consumedEl.textContent = `${consumedL} L`;
  }
  
  if (goalEl) {
    // Convert ML to Liters for display
    const goalL = (data.settings.dailyGoal / 1000).toFixed(1);
    goalEl.textContent = `${goalL} L`;
  }
  
  if (percentEl) {
    const percentage = getProgressPercentage(data);
    percentEl.textContent = `${Math.round(percentage)}%`;
    
    // Add celebration class if goal reached
    if (percentage >= 100) {
      percentEl.classList.add('goal-reached');
    } else {
      percentEl.classList.remove('goal-reached');
    }
  }
}

/**
 * Render notification status
 * @param {number} minutes - Minutes until next reminder
 */
export function renderNotificationStatus(minutes) {
  const nextReminderEl = document.getElementById('next-reminder');
  const notificationStatus = document.getElementById('notification-status');
  
  if (nextReminderEl) {
    nextReminderEl.textContent = `Next reminder in ${minutes} minutes`;
  }
  
  if (notificationStatus) {
    notificationStatus.classList.remove('reminder-due');
  }
}

/**
 * Trigger pour animation
 * @param {number} glassSize - Size of glass being poured
 */
export function animatePour(glassSize) {
  const bottle = document.querySelector('.bottle-3d');
  
  // Tilt bottle
  if (bottle) {
    bottle.classList.add('pouring');
  }
  
  // Fill glass directly
  renderGlassWater(glassSize, glassSize);
  
  // Clean up bottle animation
  setTimeout(() => {
    if (bottle) bottle.classList.remove('pouring');
  }, 1200);
}

/**
 * Trigger drink animation (water disappears from glass)
 */
export function animateDrink() {
  const glass = document.querySelector('.glass-3d');
  const glassWater = document.getElementById('glass-water');
  const glassWaterSurface = document.querySelector('.glass-water-surface');
  
  if (glass) {
    glass.classList.add('drinking');
  }
  
  if (glassWater) {
    glassWater.classList.add('drinking');
  }
  
  if (glassWaterSurface) {
    glassWaterSurface.classList.add('drinking');
  }
  
  // Empty the glass after animation
  setTimeout(() => {
    renderGlassWater(0, 250); // Reset to empty
  }, 2000);
  
  // Clean up animations
  setTimeout(() => {
    if (glass) glass.classList.remove('drinking');
    if (glassWater) glassWater.classList.remove('drinking');
    if (glassWaterSurface) glassWaterSurface.classList.remove('drinking');
  }, 2000);
}

/**
 * Show pour button, hide drank button
 */
export function showPourButton() {
  const pourBtn = document.getElementById('pour-btn');
  const drankBtn = document.getElementById('drank-btn');
  
  if (pourBtn) pourBtn.classList.remove('hidden');
  if (drankBtn) drankBtn.classList.add('hidden');
}

/**
 * Hide drank button
 */
export function hideDrankButton() {
  const drankBtn = document.getElementById('drank-btn');
  if (drankBtn) drankBtn.classList.add('hidden');
}

/**
 * Show error message
 */
export function showError(message) {
  const errorEl = document.getElementById('error-message');
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.add('show');
    setTimeout(() => {
      errorEl.classList.remove('show');
    }, 2500);
  }
}

/**
 * Show confirmation popup
 * @param {string} title - Popup title
 * @param {string} message - Popup message
 * @returns {Promise<boolean>} - Promise that resolves to true if confirmed, false otherwise
 */
export function showConfirm(title, message) {
  return new Promise((resolve) => {
    const overlay = document.getElementById('popup-overlay');
    const popup = document.getElementById('confirm-popup');
    const titleEl = document.getElementById('confirm-title');
    const messageEl = document.getElementById('confirm-message');
    const cancelBtn = document.getElementById('confirm-cancel');
    const okBtn = document.getElementById('confirm-ok');
    
    if (!overlay || !popup || !titleEl || !messageEl || !cancelBtn || !okBtn) {
      resolve(false);
      return;
    }
    
    titleEl.textContent = title;
    messageEl.textContent = message;
    
    overlay.classList.add('show');
    popup.classList.add('show');
    
    const cleanup = () => {
      overlay.classList.remove('show');
      popup.classList.remove('show');
      cancelBtn.removeEventListener('click', onCancel);
      okBtn.removeEventListener('click', onConfirm);
    };
    
    const onCancel = () => {
      cleanup();
      resolve(false);
    };
    
    const onConfirm = () => {
      cleanup();
      resolve(true);
    };
    
    cancelBtn.addEventListener('click', onCancel);
    okBtn.addEventListener('click', onConfirm);
  });
}

/**
 * Show drank button, hide pour button
 */
export function showDrankButton() {
  const pourBtn = document.getElementById('pour-btn');
  const drankBtn = document.getElementById('drank-btn');
  
  if (pourBtn) pourBtn.classList.add('hidden');
  if (drankBtn) drankBtn.classList.remove('hidden');
}

/**
 * Trigger celebration animation
 */
export function triggerCelebration() {
  const trackerContainer = document.querySelector('.tracker-container');
  
  if (trackerContainer) {
    trackerContainer.classList.add('celebration');
    setTimeout(() => {
      trackerContainer.classList.remove('celebration');
    }, 600);
  }
}

/**
 * Update all UI elements with current data
 * @param {object} data - App data from storage
 */
export function updateAllUI(data) {
  const remaining = getRemainingAmount(data);
  renderBottleWater(remaining, data.settings.dailyGoal);
  
  // Render glass water based on glassFilled state
  if (data.today.glassFilled) {
    renderGlassWater(data.settings.glassSize, data.settings.glassSize);
  } else {
    renderGlassWater(0, data.settings.glassSize);
  }
  
  renderProgress(data);
  renderNotificationStatus(data.settings.reminderInterval);
  showPourButton();
}

/**
 * Reset UI to initial state
 * @param {object} data - App data from storage
 */
export function resetUI(data) {
  updateAllUI(data);
}
