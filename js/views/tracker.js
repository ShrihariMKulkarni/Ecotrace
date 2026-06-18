/* ═══════════════════════════════════════════════════════════
   EcoTrace — Tracker View
   Daily activity logging with quick-tap inputs
   ═══════════════════════════════════════════════════════════ */

const TrackerView = (() => {
  let activeCategory = 'transport';

  const categoryMeta = {
    transport: { label: 'Transport', emoji: '🚗', color: 'transport' },
    food: { label: 'Food', emoji: '🍽️', color: 'food' },
    home: { label: 'Home', emoji: '🏠', color: 'home' },
    lifestyle: { label: 'Lifestyle', emoji: '🛍️', color: 'lifestyle' },
  };

  function render() {
    const todayLogs = ActivityLog.getToday();
    const todayTotal = todayLogs.reduce((sum, l) => sum + Math.abs(l.co2kg), 0);
    const todaySavings = todayLogs.reduce((sum, l) => {
      if (l.co2kg < 0) return sum + Math.abs(l.co2kg);
      const acts = EmissionFactors.activities[l.category] || [];
      const act = acts.find(a => a.id === l.activityId);
      if (act && act.saving && act.defaultCO2) return sum + Math.max(0, act.defaultCO2 - act.co2);
      return sum;
    }, 0);
    const activities = EmissionFactors.activities[activeCategory] || [];
    const loggedToday = new Set(todayLogs.map(l => l.activityId));

    // Smart suggestions (after 3 days of use)
    const uniqueDays = ActivityLog.getUniqueDays();
    const frequentActivities = uniqueDays >= 3 ? ActivityLog.getFrequentActivities(4) : [];

    const view = document.getElementById('view-content');
    view.innerHTML = `
      <div class="tracker">
        <div class="view-header">
          <h1 class="view-header__title">Track Activity</h1>
          <span class="text-sm text-muted">${Formatter.relativeDay(Formatter.dateKey())}</span>
        </div>

        <!-- Today's Counter -->
        <div class="card tracker__counter-card animate-fade-in-up">
          <div class="tracker__counter-label">Today's Footprint</div>
          <div class="counter counter--hero" id="tracker-counter">${todayTotal.toFixed(1)}</div>
          <span class="counter__unit">kg CO₂</span>
          ${todaySavings > 0 ? `
            <div class="mt-2">
              <span class="text-sm text-accent fw-semibold">🌱 ${todaySavings.toFixed(1)} kg saved from green choices</span>
            </div>
          ` : ''}
        </div>

        ${frequentActivities.length > 0 ? `
          <!-- Smart Suggestions -->
          <div class="animate-fade-in-up delay-1">
            <div class="dashboard__section-title">⚡ Quick — Your Frequent Activities</div>
            <div class="grid grid-4 gap-3">
              ${frequentActivities.map(act => {
                const cat = _findCategory(act.id);
                return `
                  <div class="quick-tap ${loggedToday.has(act.id) ? 'quick-tap--logged' : ''}" 
                    data-activity="${act.id}" data-category="${cat}">
                    <span class="quick-tap__icon">${act.emoji}</span>
                    <span class="quick-tap__label">${act.label}</span>
                    <span class="quick-tap__co2">${act.co2 >= 0 ? act.co2.toFixed(1) : act.co2.toFixed(1)} kg</span>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Category Tabs -->
        <div class="tracker__category-tabs animate-fade-in-up delay-2">
          ${Object.entries(categoryMeta).map(([key, meta]) => `
            <button class="chip chip--${meta.color} ${key === activeCategory ? 'chip--active' : ''}" 
              data-tab="${key}">
              <span class="chip__emoji">${meta.emoji}</span>
              ${meta.label}
            </button>
          `).join('')}
        </div>

        <!-- Activity Grid -->
        <div class="tracker__activities animate-fade-in-up delay-3" id="activity-grid">
          ${activities.map(act => `
            <div class="quick-tap ${loggedToday.has(act.id) ? 'quick-tap--logged' : ''}" 
              data-activity="${act.id}" data-category="${activeCategory}">
              <span class="quick-tap__icon">${act.emoji}</span>
              <span class="quick-tap__label">${act.label}</span>
              <span class="quick-tap__co2">${act.co2 >= 0 ? '+' + act.co2.toFixed(1) : act.co2.toFixed(1)} kg</span>
            </div>
          `).join('')}
        </div>

        <!-- Today's Log -->
        ${todayLogs.length > 0 ? `
          <div class="animate-fade-in-up delay-4">
            <div class="flex justify-between items-center mb-3 mt-2">
              <div class="dashboard__section-title" style="margin:0;">Today's Log</div>
              <span class="text-sm text-muted">${todayLogs.length} ${todayLogs.length === 1 ? 'activity' : 'activities'}</span>
            </div>
            <div class="tracker__log-list" id="today-log-list">
              ${todayLogs.slice().reverse().map((log, i) => `
                <div class="tracker__log-item" style="animation-delay: ${i * 40}ms;">
                  <span class="tracker__log-icon">${log.emoji}</span>
                  <div class="tracker__log-info">
                    <div class="tracker__log-name">${log.label}</div>
                    <div class="tracker__log-time">${Formatter.timeShort(log.timestamp)} · ${log.category}</div>
                  </div>
                  <span class="tracker__log-co2">${log.co2kg >= 0 ? '+' : ''}${log.co2kg.toFixed(1)} kg</span>
                  <button class="tracker__log-delete" data-delete="${log.id}" title="Remove">✕</button>
                </div>
              `).join('')}
            </div>
          </div>
        ` : `
          <div class="empty-state animate-fade-in delay-4">
            <div class="empty-state__icon">📊</div>
            <div class="empty-state__title">No activities logged yet</div>
            <div class="empty-state__text">Tap on activities above to start tracking your carbon footprint today</div>
          </div>
        `}
      </div>
    `;

    bindEvents();
  }

  function _findCategory(activityId) {
    for (const [cat, activities] of Object.entries(EmissionFactors.activities)) {
      if (activities.find(a => a.id === activityId)) return cat;
    }
    return 'lifestyle';
  }

  function bindEvents() {
    // Category tabs
    document.querySelectorAll('[data-tab]').forEach(tab => {
      tab.addEventListener('click', () => {
        activeCategory = tab.dataset.tab;
        render();
      });
    });

    // Activity quick-taps
    document.querySelectorAll('.quick-tap').forEach(tap => {
      tap.addEventListener('click', () => {
        const activityId = tap.dataset.activity;
        const category = tap.dataset.category;
        logActivity(activityId, category);
      });
    });

    // Delete log entries
    document.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.delete;
        ActivityLog.remove(id);
        Animations.toast('Activity removed', { type: 'warning', emoji: '🗑️' });
        render();
      });
    });
  }

  function logActivity(activityId, category) {
    const activities = EmissionFactors.activities[category] || [];
    const activity = activities.find(a => a.id === activityId);
    if (!activity) return;

    ActivityLog.add(category, activityId, activity.label, activity.emoji, activity.co2);
    Achievements.updateChallengeProgress();

    const isSaving = activity.co2 <= 0 || activity.saving;
    Animations.toast(
      `${activity.emoji} ${activity.label} logged! (${activity.co2 >= 0 ? '+' : ''}${activity.co2.toFixed(1)}kg)`,
      { type: isSaving ? 'success' : 'warning', emoji: isSaving ? '🌱' : '📊' }
    );

    // Check for new badges
    const newBadges = Achievements.checkAndUpdate();
    if (newBadges.length > 0) {
      setTimeout(() => {
        Animations.confetti();
        Animations.toast(`🏆 Badge earned: ${newBadges[0].name}!`, { type: 'success', duration: 4000 });
      }, 500);
    }

    render();
  }

  return { render };
})();
