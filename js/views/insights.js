/* ═══════════════════════════════════════════════════════════
   EcoTrace — Insights View
   Personalized insights, what-if simulator, weekly summary
   ═══════════════════════════════════════════════════════════ */

const InsightsView = (() => {
  let activeScenario = 'vegetarian';

  function render() {
    const baseline = UserProfile.getBaseline();
    const topActions = Calculator.getTopActions(baseline);
    const weeklySummary = Calculator.calculateWeeklySummary(ActivityLog);
    const scenarios = Calculator.getAllScenarios();
    const whatIfResult = Calculator.whatIf(baseline, activeScenario);
    const totalSavings = ActivityLog.getTotalSavings();

    const view = document.getElementById('view-content');
    view.innerHTML = `
      <div class="insights">
        <div class="view-header">
          <h1 class="view-header__title">Insights</h1>
        </div>

        <!-- Weekly Summary -->
        <div class="card insights__weekly animate-fade-in-up">
          <div class="card__header">
            <span class="card__title">This Week</span>
            ${weeklySummary.change !== 0 ? `
              <span class="dashboard__hero-trend ${weeklySummary.change <= 0 ? 'dashboard__hero-trend--good' : 'dashboard__hero-trend--bad'}">
                ${weeklySummary.change <= 0 ? '↓' : '↑'} ${Math.abs(weeklySummary.change)}%
              </span>
            ` : ''}
          </div>
          
          <div class="insights__weekly-hero">
            <div class="counter counter--lg">${weeklySummary.thisWeekTotal.toFixed(1)}</div>
            <span class="counter__unit">kg CO₂ this week</span>
            
            ${weeklySummary.lastWeekTotal > 0 ? `
              <p class="text-sm text-muted mt-2">
                vs ${weeklySummary.lastWeekTotal.toFixed(1)} kg last week
              </p>
            ` : ''}
          </div>

          ${weeklySummary.thisWeekTotal > 0 ? `
            <div class="insights__weekly-equiv mt-3">
              🌳 That's equivalent to ${Formatter.equivalency(weeklySummary.thisWeekTotal)}
            </div>
          ` : `
            <p class="text-sm text-muted text-center">Log activities to see weekly insights</p>
          `}

          ${weeklySummary.bestCategory && weeklySummary.thisWeekTotal > 0 ? `
            <div class="flex gap-4 mt-4">
              <div class="flex-1 p-3" style="background: rgba(52, 211, 153, 0.06); border-radius: var(--radius-md);">
                <div class="text-xs text-muted fw-semibold mb-1">Best Category</div>
                <div class="text-sm fw-semibold text-accent">${_categoryLabel(weeklySummary.bestCategory)}</div>
              </div>
              <div class="flex-1 p-3" style="background: rgba(244, 63, 94, 0.06); border-radius: var(--radius-md);">
                <div class="text-xs text-muted fw-semibold mb-1">Most Impact</div>
                <div class="text-sm fw-semibold text-coral">${_categoryLabel(weeklySummary.worstCategory)}</div>
              </div>
            </div>
          ` : ''}

          <!-- Weekly trend chart -->
          <div class="mt-4">
            <canvas id="insights-weekly-chart"></canvas>
          </div>
        </div>

        <!-- Top 3 Impact Actions -->
        <div class="animate-fade-in-up delay-1">
          <div class="dashboard__section-title">Your Highest-Impact Changes</div>
          
          ${topActions.map((action, i) => `
            <div class="card insights__impact-card mb-4 animate-fade-in-up" style="animation-delay: ${(i + 2) * 80}ms;">
              <div class="insights__impact-rank">#${i + 1} Biggest Impact</div>
              <div class="insights__impact-action">${action.action}</div>
              
              <div class="insights__impact-stats">
                <div class="insights__impact-stat">
                  <span class="insights__impact-stat-value">${Formatter.co2Short(action.savingKg)}</span>
                  <span class="insights__impact-stat-label">saved/year</span>
                </div>
                <div class="insights__impact-stat">
                  <span class="insights__impact-stat-label">Effort</span>
                  <div class="insights__effort-dots">
                    ${[1,2,3,4,5].map(n => `
                      <div class="insights__effort-dot ${n <= action.effort ? 'insights__effort-dot--filled' : ''}"></div>
                    `).join('')}
                  </div>
                </div>
              </div>
              
              <div class="insights__impact-equiv">
                💡 ${action.description}
              </div>
            </div>
          `).join('')}
        </div>

        <!-- What If Simulator -->
        <div class="card insights__whatif animate-fade-in-up delay-4">
          <div class="insights__whatif-title">
            🔮 What If Simulator
          </div>
          <p class="text-sm text-muted mb-4">See how changes could reduce your annual footprint</p>
          
          <div class="flex flex-wrap gap-2 mb-4">
            ${scenarios.map(s => `
              <button class="chip ${s.id === activeScenario ? 'chip--active' : ''}" data-scenario="${s.id}">
                <span class="chip__emoji">${s.emoji}</span>
                ${s.label}
              </button>
            `).join('')}
          </div>

          ${whatIfResult ? `
            <div class="insights__whatif-result">
              <div class="text-sm text-muted mb-2">"${whatIfResult.label}"</div>
              <div class="insights__whatif-reduction">-${whatIfResult.reductionPercent}%</div>
              <div class="insights__whatif-label">
                ${Formatter.co2Short(whatIfResult.reduction)} less CO₂ per year
              </div>
              
              <div class="comparison-bar mt-4" style="text-align: left;">
                <div class="comparison-bar__row">
                  <span class="comparison-bar__label" style="width: 60px;">Current</span>
                  <div class="comparison-bar__track">
                    <div class="comparison-bar__fill comparison-bar__fill--global" 
                      style="width: 100%; background: linear-gradient(90deg, rgba(107,143,126,0.5), rgba(107,143,126,0.3));">
                      ${Formatter.co2Short(baseline.total)}
                    </div>
                  </div>
                </div>
                <div class="comparison-bar__row">
                  <span class="comparison-bar__label" style="width: 60px;">After</span>
                  <div class="comparison-bar__track">
                    <div class="comparison-bar__fill comparison-bar__fill--you" 
                      style="width: ${(whatIfResult.newTotal / baseline.total * 100)}%;">
                      ${Formatter.co2Short(whatIfResult.newTotal)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ` : ''}
        </div>

        <!-- Annual Baseline Breakdown -->
        <div class="card animate-fade-in-up delay-5">
          <div class="card__header">
            <span class="card__title">Your Annual Baseline</span>
            <span class="counter counter--md text-accent">${Formatter.co2Short(baseline.total)}</span>
          </div>
          
          <div class="results__chart-container" style="max-width: 200px; margin: 0 auto;">
            <canvas id="insights-baseline-donut" width="200" height="200"></canvas>
          </div>

          <div class="flex flex-wrap justify-center gap-4 mt-4">
            ${['transport', 'food', 'home', 'lifestyle'].map(cat => `
              <div class="flex items-center gap-2">
                <div class="cat-dot cat-dot--${cat}"></div>
                <div>
                  <span class="text-sm fw-medium">${_categoryLabel(cat)}</span>
                  <span class="text-xs text-muted"> ${Formatter.co2Short(baseline[cat])}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        ${totalSavings > 0 ? `
          <div class="card card--accent animate-fade-in-up delay-6" style="text-align: center; padding: var(--space-5);">
            <div class="text-xs uppercase text-muted fw-semibold mb-2">Lifetime Savings</div>
            <div class="counter counter--hero">${Formatter.co2Value(totalSavings)}</div>
            <span class="counter__unit">${Formatter.co2Unit(totalSavings)}</span>
            <p class="text-sm text-muted mt-2">🌳 ≈ planting ${Formatter.treeEquiv(totalSavings)} tree${Formatter.treeEquiv(totalSavings) !== 1 ? 's' : ''}</p>
          </div>
        ` : ''}
      </div>
    `;

    // Render charts
    setTimeout(() => {
      Charts.barChart('insights-weekly-chart', weeklySummary.dailyTotals, { height: 60 });
    }, 200);

    setTimeout(() => {
      Charts.donut('insights-baseline-donut', [
        { value: baseline.transport, color: '#38bdf8', category: 'transport' },
        { value: baseline.food, color: '#34d399', category: 'food' },
        { value: baseline.home, color: '#fbbf24', category: 'home' },
        { value: baseline.lifestyle, color: '#c084fc', category: 'lifestyle' },
      ], { size: 200 });
    }, 400);

    // Bind scenario clicks
    document.querySelectorAll('[data-scenario]').forEach(chip => {
      chip.addEventListener('click', () => {
        activeScenario = chip.dataset.scenario;
        render();
      });
    });
  }

  function _categoryLabel(key) {
    const labels = { transport: '🚗 Transport', food: '🍽️ Food', home: '🏠 Home', lifestyle: '🛍️ Lifestyle' };
    return labels[key] || key;
  }

  return { render };
})();
