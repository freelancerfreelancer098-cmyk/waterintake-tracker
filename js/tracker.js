// ========================================
// WATER INTAKE TRACKER - TRACKER MODULE
// Handles pour and drank logic
// ========================================

import { 
  loadData, 
  addConsumption, 
  resetToday,
  updateSettings,
  saveData
} from './storage.js';

/**
 * Pour a glass of water
 * @returns {object} Result with success status and data
 */
export function pourGlass() {
  const data = loadData();
  
  // Check if glass is already filled
  if (data.today.glassFilled) {
    return {
      success: false,
      message: 'Glass is already filled',
      data: data
    };
  }
  
  // Check if there's enough water remaining
  const remaining = data.settings.dailyGoal - data.today.consumed;
  if (remaining < data.settings.glassSize) {
    return {
      success: false,
      message: 'Not enough water remaining in bottle',
      data: data
    };
  }
  
  // Add to consumed
  data.today.consumed += data.settings.glassSize;
  data.today.glasses += 1;
  data.today.glassFilled = true;
  
  saveData(data);
  
  return {
    success: true,
    data: data
  };
}

/**
 * Mark a glass as drank
 * @returns {object} Result with success status and data
 */
export function drankGlass() {
  const data = loadData();
  
  // Check if glass is filled
  if (!data.today.glassFilled) {
    return {
      success: false,
      message: 'Glass is empty',
      data: data
    };
  }
  
  // Mark glass as empty (consumed was already counted when poured)
  data.today.glassFilled = false;
  
  saveData(data);
  
  return {
    success: true,
    data: data
  };
}

/**
 * Reset today's progress
 */
export function resetProgress() {
  const data = resetToday();
  return { 
    success: true, 
    message: 'Today\'s progress has been reset',
    data: data 
  };
}

/**
 * Get current progress percentage
 */
export function getProgressPercentage(data) {
  const percentage = (data.today.consumed / data.settings.dailyGoal) * 100;
  return Math.min(100, Math.max(0, percentage));
}

/**
 * Get remaining water amount
 */
export function getRemainingAmount(data) {
  const remaining = data.settings.dailyGoal - data.today.consumed;
  return Math.max(0, remaining);
}

/**
 * Check if daily goal is reached
 */
export function isGoalReached(data) {
  return data.today.consumed >= data.settings.dailyGoal;
}
