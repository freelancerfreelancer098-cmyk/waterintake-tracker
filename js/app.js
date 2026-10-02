// ========================================
// WATER INTAKE TRACKER - MAIN APP
// Entry point and event handling
// ========================================

import { 
  hasCompletedOnboarding, 
  saveInitialSettings, 
  loadData,
  clearAllData 
} from './storage.js';

import { 
  pourGlass, 
  drankGlass, 
  resetProgress 
} from './tracker.js';

import { 
  enableReminders, 
  formatTimeRemaining 
} from './reminders.js';

import { 
  showOnboarding, 
  showTracker, 
  updateAllUI, 
  animatePour, 
  animateDrink, 
  showPourButton, 
  showDrankButton, 
  hideDrankButton,
  showError,
  showConfirm,
  triggerCelebration 
} from './ui.js';

/**
 * Initialize the application
 */
function init() {
  // Check if user has completed onboarding
  if (hasCompletedOnboarding()) {
    // Load existing data and show tracker
    const data = loadData();
    showTracker();
    updateAllUI(data);
    
    // Enable reminders if they were previously enabled
    if (data.settings.remindersEnabled) {
      enableReminders(data.settings.reminderInterval, handleAutoPour);
    }
    
    // Check if glass is filled and show appropriate button
    if (data.today.glassFilled) {
      showDrankButton();
    }
  } else {
    // Show onboarding screen
    showOnboarding();
  }
  
  // Set up event listeners
  setupEventListeners();
}

/**
 * Set up all event listeners
 */
function setupEventListeners() {
  // Onboarding form submission
  const setupForm = document.getElementById('setup-form');
  if (setupForm) {
    setupForm.addEventListener('submit', handleOnboarding);
  }
  
  // Drank button
  const drankBtn = document.getElementById('drank-btn');
  if (drankBtn) {
    drankBtn.addEventListener('click', handleDrank);
  }
  
  // Reset button
  const resetBtn = document.getElementById('reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', handleReset);
  }
  
  // Logout button
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
}

/**
 * Handle onboarding form submission
 */
function handleOnboarding(event) {
  event.preventDefault();
  
  // Get form values
  const dailyGoalInput = document.getElementById('daily-goal');
  const glassSizeInput = document.getElementById('glass-size');
  
  const dailyGoalL = parseFloat(dailyGoalInput.value);
  const glassSize = parseFloat(glassSizeInput.value);
  
  // Convert liters to ML for internal storage
  const dailyGoalML = dailyGoalL * 1000;
  
  // Save settings (reminder interval will be auto-calculated)
  const settings = {
    dailyGoal: dailyGoalML,
    glassSize: glassSize
  };
  
  const data = saveInitialSettings(settings);
  
  // Enable reminders with auto-calculated interval
  enableReminders(data.settings.reminderInterval);
  
  // Show tracker screen
  showTracker();
  updateAllUI(data);
  
  // Auto-pour on startup
  setTimeout(() => {
    handleAutoPour();
  }, 500);
}

/**
 * Auto pour water (called on startup and after reminder)
 */
function handleAutoPour() {
  const result = pourGlass();
  
  if (!result.success) {
    if (result.message === 'Not enough water remaining in bottle') {
      // Goal reached, auto-logout
      setTimeout(() => {
        clearAllData();
        showOnboarding();
      }, 2000);
    }
    return;
  }
  
  // Play pour sound
  playPourSound();
  
  // Animate the pour
  animatePour(result.data.settings.glassSize);
  
  // Update UI
  updateAllUI(result.data);
  
  // Show drank button
  setTimeout(() => {
    showDrankButton();
  }, 1500);
  
  // Schedule next reminder with auto-pour callback
  const data = loadData();
  if (data.settings.remindersEnabled) {
    enableReminders(data.settings.reminderInterval, handleAutoPour);
  }
}

/**
 * Handle drank button click
 */
function handleDrank() {
  const result = drankGlass();
  
  if (!result.success) {
    showError(result.message);
    return;
  }
  
  // Play drink sound
  playDrinkSound();
  
  // Animate the drink
  animateDrink();
  
  // Update UI
  updateAllUI(result.data);
  
  // Hide drank button
  setTimeout(() => {
    hideDrankButton();
  }, 2000);
  
  // Check if goal reached
  const data = loadData();
  const progress = (data.today.consumed / data.settings.dailyGoal) * 100;
  
  if (progress >= 100) {
    setTimeout(() => {
      triggerCelebration();
      setTimeout(() => {
        clearAllData();
        showOnboarding();
      }, 3000);
    }, 2000);
  }
}

/**
 * Handle reset button click
 */
async function handleReset() {
  const confirmed = await showConfirm('Reset Today', 'Are you sure you want to reset today\'s progress?');
  
  if (confirmed) {
    const result = resetProgress();
    updateAllUI(result.data);
    hideDrankButton();
    // Auto-pour after reset
    setTimeout(() => {
      handleAutoPour();
    }, 500);
  }
}

/**
 * Handle logout button click - clear all data
 */
async function handleLogout() {
  const confirmed = await showConfirm('Logout', 'Are you sure you want to logout? This will clear all your data and settings.');
  
  if (confirmed) {
    clearAllData();
    showOnboarding();
  }
}

/**
 * Handle visibility change (when user switches tabs)
 */
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    // User returned to the tab - refresh UI
    const data = loadData();
    updateAllUI(data);
  }
});

/**
 * Play water pouring sound using Web Audio API
 */
function playPourSound() {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Create water-like sound
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.5);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (e) {
    console.log('Audio not supported');
  }
}

/**
 * Play water drinking sound using Web Audio API
 */
function playDrinkSound() {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Create gulping sound
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(300, audioContext.currentTime + 0.3);
    
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (e) {
    console.log('Audio not supported');
  }
}

// Initialize the app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
