/* ═══════════════════════════════════════════════════════════
   EcoTrace — Dashboard View
   Main home screen with daily overview
   ═══════════════════════════════════════════════════════════ */

const DashboardView = (() => {

  function render() {
    const name = UserProfile.getName();
    const baseline = UserProfile.getBaseline();
    const todayTotal = ActivityLog.getTodayTotal();
    const todayLogs = ActivityLog.getToday();
    const streak = ActivityLog.getCurrentStreak();
    const dailyTotals = ActivityLog.getDailyTotals(7);
    const totalSavings = ActivityLog.getTotalSavings();
    const frequentActivities = ActivityLog.getFrequentActivities(4);
    const activeChallenges = Achievements.getActiveChallenges();

    // Calculate daily baseline average (annual / 365)
    const dailyBaseline = baseline.total / 365;
    const todayAbsTotal = todayLogs.reduce((sum, l) => sum + Math.abs(l.co2kg), 0);
    const trendPercent = dailyBaseline > 0 
      ? Math.round(((todayAbsTotal - dailyBaseline) / dailyBaseline) * 100) 
      : 0;

    // Get top insight
    const topActions = Calculator.getTopActions(baseline);
    const topAction = topActions[0];

    // Today's breakdown by category
    const todayByCategory = { transport: 0, food: 0, home: 0, lifestyle: 0 };
    todayLogs.forEach(l => {
      if (todayByCategory[l.category] !== undefined) {
        todayByCategory[l.category] += Math.abs(l.co2kg);
      }
    });

    const categories = [
      { key: 'transport', label: 'Transport', emoji: '🚗', color: 'var(--cat-transport)' },
      { key: 'food', label: 'Food', emoji: '🍽️', color: 'var(--cat-food)' },
      { key: 'home', label: 'Home', emoji: '🏠', color: 'var(--cat-home)' },
      { key: 'lifestyle', label: 'Lifestyle', emoji: '🛍️', color: 'var(--cat-lifestyle)' },
    ];

    // Default quick actions for new users
    const quickActions = frequentActivities.length >= 4 ? frequentActivities : [
      { id: 'walked', emoji: '🚶', label: 'Walked', co2: 0, saving: true, defaultCO2: 2.88, _cat: 'transport' },
      { id: 'veg_meal', emoji: '🥗', label: 'Veg Meal', co2: 0.45, saving: true, defaultCO2: 1.20, _cat: 'food' },
      { id: 'bus', emoji: '🚌', label: 'Bus', co2: 0.45, saving: true, defaultCO2: 2.88, _cat: 'transport' },
      { id: 'ac_off', emoji: '❄️', label: 'AC Off', co2: -3.28, saving: true, _cat: 'home' },
    ];

    const view = document.getElementById('view-content');
    view.innerHTML = `
      <div class="dashboard">
        <!-- Greeting -->
        <div class="dashboard__greeting animate-fade-in">
          <div class="flex justify-between items-start">
            <div>
              <h1 class="dashboard__name">${Formatter.greeting()}, ${name} 👋</h1>
              <p class="dashboard__date">${Formatter.dateFull(new Date())}</p>
            </div>
            ${streak > 0 ? `
              <div class="streak">
                <span class="streak__flame">🔥</span>
                <span class="streak__count">${streak}</span>
                <span class="streak__label">day${streak !== 1 ? 's' : ''}</span>
              </div>
            ` : ''}
          </div>
        </div>

        <!-- Today's CO₂ Hero Card -->
        <div class="card dashboard__hero-card animate-fade-in-up delay-1">
          <div class="dashboard__hero-label">Today's Footprint</div>
          <div class="counter counter--hero" id="dashboard-counter">${todayAbsTotal.toFixed(1)}</div>
          <span class="counter__unit">kg CO₂</span>
          ${todayLogs.length > 0 ? `
            <div class="dashboard__hero-trend ${trendPercent <= 0 ? 'dashboard__hero-trend--good' : 'dashboard__hero-trend--bad'}">
              ${trendPercent <= 0 ? '↓' : '↑'} ${Math.abs(trendPercent)}% vs daily average
            </div>
          ` : `
            <p class="text-sm text-muted mt-2">Start logging to see your impact</p>
          `}
        </div>

        <!-- Weekly Sparkline -->
        <div class="card animate-fade-in-up delay-2">
          <div class="card__header">
            <span class="card__title">This Week</span>
            <span class="text-sm text-muted">${dailyTotals.reduce((s, d) => s + d.total, 0).toFixed(1)} kg total</span>
          </div>
          <div class="dashboard__sparkline">
            <canvas id="dashboard-sparkline"></canvas>
          </div>
        </div>

        <!-- Quick Log -->
        <div class="animate-fade-in-up delay-3">
          <div class="dashboard__section-title">Quick Log</div>
          <div class="dashboard__quick-actions">
            ${quickActions.map(act => {
              const cat = act._cat || _findCategory(act.id);
              return `
                <div class="quick-tap" data-activity="${act.id}" data-category="${cat}">
                  <span class="quick-tap__icon">${act.emoji}</span>
                  <span class="quick-tap__label">${act.label}</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Today's Categories -->
        ${todayLogs.length > 0 ? `
          <div class="animate-fade-in-up delay-4">
            <div class="dashboard__section-title">Today's Breakdown</div>
            <div class="dashboard__category-grid">
              ${categories.map(cat => `
                <div class="card dashboard__category-card" style="padding: var(--space-4);">
                  <div class="dashboard__category-label">
                    <div class="cat-dot cat-dot--${cat.key}"></div>
                    ${cat.label}
                  </div>
                  <div class="dashboard__category-value">
                    ${todayByCategory[cat.key].toFixed(1)}
                    <span class="dashboard__category-unit">kg</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Active Challenge -->
        ${activeChallenges.length > 0 ? (() => {
          const ac = activeChallenges[0];
          const challenge = ChallengeData.challenges.find(c => c.id === ac.id);
          if (!challenge) return '';
          return `
            <div class="animate-fade-in-up delay-5">
              <div class="dashboard__section-title">Active Challenge</div>
              <div class="card card--interactive" onclick="App.navigate('challenges')">
                <div class="flex items-center gap-3">
                  <span style="font-size: 2rem;">${challenge.badgeEmoji}</span>
                  <div class="flex-1">
                    <div class="card__title">${challenge.title}</div>
                    <div class="text-sm text-muted mt-1">${ac.progress}/${challenge.target} completed</div>
                  </div>
                </div>
                <div class="progress-bar mt-3">
                  <div class="progress-bar__fill" style="width: ${(ac.progress / challenge.target * 100)}%;"></div>
                </div>
              </div>
            </div>
          `;
        })() : ''}

        <!-- Top Insight -->
        ${topAction ? `
          <div class="animate-fade-in-up delay-6">
            <div class="dashboard__section-title">Top Insight</div>
            <div class="card card--interactive card--accent" onclick="App.navigate('insights')">
              <div class="text-xs uppercase text-accent fw-semibold mb-2">Highest Impact Action</div>
              <div class="card__title mb-2">${topAction.action}</div>
              <p class="text-sm text-muted">${topAction.description}</p>
              <div class="flex items-center gap-2 mt-3">
                <span class="text-accent fw-bold">${Formatter.co2Short(topAction.savingKg)}</span>
                <span class="text-sm text-muted">saved per year</span>
              </div>
            </div>
          </div>
        ` : ''}

        <!-- Total Savings -->
        ${totalSavings > 0 ? `
          <div class="card animate-fade-in-up delay-7" style="text-align: center; padding: var(--space-5);">
            <div class="text-xs uppercase text-muted fw-semibold mb-2">Total CO₂ Saved</div>
            <div class="counter counter--lg text-accent">${Formatter.co2Short(totalSavings)}</div>
            <p class="text-sm text-muted mt-1">≈ ${Formatter.equivalency(totalSavings)}</p>
          </div>
        ` : ''}
      </div>
    `;

    // Render sparkline chart
    setTimeout(() => {
      Charts.barChart('dashboard-sparkline', dailyTotals, { height: 70 });
    }, 300);

    // Bind quick-tap events
    document.querySelectorAll('.quick-tap').forEach(tap => {
      tap.addEventListener('click', () => {
        const activityId = tap.dataset.activity;
        const category = tap.dataset.category;
        _quickLog(activityId, category);
      });
    });
  }

  function _findCategory(activityId) {
    for (const [cat, activities] of Object.entries(EmissionFactors.activities)) {
      if (activities.find(a => a.id === activityId)) return cat;
    }
    return 'lifestyle';
  }

  function _quickLog(activityId, category) {
    const activities = EmissionFactors.activities[category] || [];
    const activity = activities.find(a => a.id === activityId);
    if (!activity) return;

    ActivityLog.add(category, activityId, activity.label, activity.emoji, activity.co2);
    Achievements.updateChallengeProgress();
    
    Animations.toast(`${activity.emoji} ${activity.label} logged! (${activity.co2 >= 0 ? '+' : ''}${activity.co2.toFixed(1)}kg CO₂)`, {
      type: activity.co2 <= 0 ? 'success' : 'warning',
      emoji: activity.co2 <= 0 ? '🌱' : '📊',
    });

    // Check for new badges
    const newBadges = Achievements.checkAndUpdate();
    if (newBadges.length > 0) {
      setTimeout(() => {
        Animations.confetti();
        Animations.toast(`🏆 Badge earned: ${newBadges[0].name}!`, { type: 'success', duration: 4000 });
      }, 500);
    }

    // Refresh
    render();
  }

  return { render };
})();
