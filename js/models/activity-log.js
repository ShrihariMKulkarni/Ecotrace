/* ═══════════════════════════════════════════════════════════
   EcoTrace — Activity Log Model
   Daily activity tracking with date-indexed storage
   ═══════════════════════════════════════════════════════════ */

const ActivityLog = (() => {
  const STORE_KEY = 'activity_log';

  function _getAll() {
    return Storage.get(STORE_KEY, []);
  }

  function _saveAll(logs) {
    Storage.set(STORE_KEY, logs);
  }

  /**
   * Add a new activity log entry
   */
  function add(category, activityId, label, emoji, co2kg) {
    const entry = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      date: Formatter.dateKey(),
      category,
      activityId,
      label,
      emoji,
      co2kg,
      timestamp: new Date().toISOString(),
    };
    
    const logs = _getAll();
    logs.push(entry);
    _saveAll(logs);
    
    // Check achievements after logging
    Achievements.checkAndUpdate();
    
    return entry;
  }

  /**
   * Remove a log entry by ID
   */
  function remove(id) {
    const logs = _getAll().filter(l => l.id !== id);
    _saveAll(logs);
    return logs;
  }

  /**
   * Get logs for a specific date (YYYY-MM-DD)
   */
  function getByDate(dateStr) {
    const date = dateStr || Formatter.dateKey();
    return _getAll().filter(l => l.date === date);
  }

  /**
   * Get today's logs
   */
  function getToday() {
    return getByDate(Formatter.dateKey());
  }

  /**
   * Get logs for last N days
   */
  function getLastNDays(n) {
    const dates = [];
    for (let i = 0; i < n; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(Formatter.dateKey(d));
    }
    return _getAll().filter(l => dates.includes(l.date));
  }

  /**
   * Get total CO₂ for today
   */
  function getTodayTotal() {
    const today = getToday();
    return today.reduce((sum, l) => sum + l.co2kg, 0);
  }

  /**
   * Get daily totals for last N days
   */
  function getDailyTotals(n = 7) {
    const totals = [];
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = Formatter.dateKey(d);
      const dayLogs = getByDate(dateStr);
      const total = dayLogs.reduce((sum, l) => sum + Math.abs(l.co2kg), 0);
      totals.push({ date: dateStr, total, count: dayLogs.length });
    }
    return totals;
  }

  /**
   * Get most frequent activities (for smart suggestions)
   */
  function getFrequentActivities(limit = 4) {
    const logs = _getAll();
    const freq = {};
    logs.forEach(l => {
      const key = l.category + ':' + l.activityId;
      freq[key] = (freq[key] || 0) + 1;
    });

    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([key]) => {
        const [category, activityId] = key.split(':');
        const activities = EmissionFactors.activities[category] || [];
        return activities.find(a => a.id === activityId);
      })
      .filter(Boolean);
  }

  /**
   * Get total number of logs
   */
  function getTotalCount() {
    return _getAll().length;
  }

  /**
   * Get unique days logged
   */
  function getUniqueDays() {
    const logs = _getAll();
    const days = new Set(logs.map(l => l.date));
    return days.size;
  }

  /**
   * Get current streak (consecutive days)
   */
  function getCurrentStreak() {
    const logs = _getAll();
    if (logs.length === 0) return 0;

    const days = new Set(logs.map(l => l.date));
    let streak = 0;
    const today = new Date();

    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = Formatter.dateKey(d);
      
      if (days.has(dateStr)) {
        streak++;
      } else {
        // Allow skipping today if it's still early
        if (i === 0) continue;
        break;
      }
    }

    return streak;
  }

  /**
   * Check if user has logged today
   */
  function hasLoggedToday() {
    return getToday().length > 0;
  }

  /**
   * Get total savings (CO₂ saved from lower-carbon choices)
   */
  function getTotalSavings() {
    const logs = _getAll();
    let savings = 0;
    logs.forEach(l => {
      if (l.co2kg < 0) {
        savings += Math.abs(l.co2kg);
      } else {
        // For activities with a default comparison, calculate saving
        const activities = EmissionFactors.activities[l.category] || [];
        const act = activities.find(a => a.id === l.activityId);
        if (act && act.saving && act.defaultCO2) {
          savings += Math.max(0, act.defaultCO2 - act.co2);
        }
      }
    });
    return Math.round(savings * 10) / 10;
  }

  /**
   * Get logs by category count (for badges)
   */
  function getCategoryCounts() {
    const logs = _getAll();
    const counts = { transport: 0, food: 0, home: 0, lifestyle: 0 };
    logs.forEach(l => {
      const act = (EmissionFactors.activities[l.category] || []).find(a => a.id === l.activityId);
      if (act && act.saving) {
        counts[l.category] = (counts[l.category] || 0) + 1;
      }
    });
    return counts;
  }

  return {
    add, remove, getByDate, getToday, getLastNDays,
    getTodayTotal, getDailyTotals, getFrequentActivities,
    getTotalCount, getUniqueDays, getCurrentStreak,
    hasLoggedToday, getTotalSavings, getCategoryCounts
  };
})();
