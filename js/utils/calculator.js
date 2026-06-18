/* ═══════════════════════════════════════════════════════════
   EcoTrace — CO₂ Calculator Engine
   Core calculation logic for baseline and daily tracking
   ═══════════════════════════════════════════════════════════ */

const Calculator = (() => {

  /**
   * Calculate annual baseline from onboarding answers
   * @param {Object} answers - Onboarding responses
   * @returns {Object} { total, transport, food, home, lifestyle }
   */
  function calculateBaseline(answers) {
    const breakdown = {
      transport: 0,
      food: 0,
      home: 0,
      lifestyle: 0,
    };

    // Transport
    if (answers.transport && answers.transport.length > 0) {
      answers.transport.forEach(mode => {
        const factor = EmissionFactors.onboardingTransport[mode];
        if (factor) {
          breakdown.transport += factor.annual;
        }
      });
      // If multiple modes, take weighted average (assume primary is first)
      if (answers.transport.length > 1) {
        breakdown.transport = breakdown.transport / answers.transport.length * 1.2;
      }
    }

    // Flights
    if (answers.flights !== undefined) {
      breakdown.transport += EmissionFactors.onboardingFlights[answers.flights] || 0;
    }

    // Food
    if (answers.diet) {
      breakdown.food = EmissionFactors.annualFood[answers.diet] || 493;
    }

    // Home energy
    const householdSize = answers.householdSize || 3;
    const monthlyKwh = EmissionFactors.avgMonthlyElectricity[householdSize] || 180;
    const energySource = answers.energySource || 'grid';
    const emissionPerKwh = energySource === 'solar' 
      ? EmissionFactors.energy.solar_kwh 
      : EmissionFactors.energy.electricity_kwh;
    
    breakdown.home = monthlyKwh * 12 * emissionPerKwh;
    
    // LPG usage (assume 1 cylinder/month for average household)
    const lpgCylinders = answers.lpgCylinders || (householdSize <= 2 ? 8 : 12);
    breakdown.home += lpgCylinders * EmissionFactors.energy.lpg_cylinder;

    // Lifestyle / Shopping
    if (answers.shopping) {
      breakdown.lifestyle = EmissionFactors.onboardingShopping[answers.shopping] || 200;
    }

    // Streaming / digital
    breakdown.lifestyle += 365 * 3 * EmissionFactors.lifestyle.streaming_hour; // 3hrs/day avg

    const total = Object.values(breakdown).reduce((sum, v) => sum + v, 0);

    return {
      total: Math.round(total),
      transport: Math.round(breakdown.transport),
      food: Math.round(breakdown.food),
      home: Math.round(breakdown.home),
      lifestyle: Math.round(breakdown.lifestyle),
    };
  }

  /**
   * Calculate CO₂ for a single logged activity
   * @param {string} category - transport, food, home, lifestyle
   * @param {string} activityId - Activity identifier
   * @param {number} quantity - Number of occurrences
   * @returns {number} kg CO₂
   */
  function calculateActivity(category, activityId, quantity = 1) {
    const categoryActivities = EmissionFactors.activities[category];
    if (!categoryActivities) return 0;
    
    const activity = categoryActivities.find(a => a.id === activityId);
    if (!activity) return 0;

    return activity.co2 * quantity;
  }

  /**
   * Calculate daily CO₂ total from activity logs
   * @param {Array} logs - Array of activity log entries for a day
   * @returns {Object} { total, byCategory }
   */
  function calculateDailyTotal(logs) {
    const byCategory = { transport: 0, food: 0, home: 0, lifestyle: 0 };
    
    logs.forEach(log => {
      if (byCategory[log.category] !== undefined) {
        byCategory[log.category] += log.co2kg;
      }
    });

    const total = Object.values(byCategory).reduce((sum, v) => sum + v, 0);
    return { total, byCategory };
  }

  /**
   * Calculate weekly CO₂ summary
   * @param {Object} activityLog - ActivityLog model instance
   * @returns {Object} Weekly stats
   */
  function calculateWeeklySummary(activityLog) {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const twoWeeksAgo = new Date(today);
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    let thisWeekTotal = 0;
    let lastWeekTotal = 0;
    const dailyTotals = [];
    const byCategory = { transport: 0, food: 0, home: 0, lifestyle: 0 };

    // This week
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = Formatter.dateKey(d);
      const logs = activityLog.getByDate(key);
      const dayTotal = logs.reduce((sum, l) => sum + Math.abs(l.co2kg), 0);
      thisWeekTotal += dayTotal;
      dailyTotals.push({ date: key, total: dayTotal });
      
      logs.forEach(l => {
        if (byCategory[l.category] !== undefined) {
          byCategory[l.category] += Math.abs(l.co2kg);
        }
      });
    }

    // Last week
    for (let i = 13; i >= 7; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = Formatter.dateKey(d);
      const logs = activityLog.getByDate(key);
      lastWeekTotal += logs.reduce((sum, l) => sum + Math.abs(l.co2kg), 0);
    }

    const change = lastWeekTotal > 0 
      ? ((thisWeekTotal - lastWeekTotal) / lastWeekTotal * 100)
      : 0;

    // Find best and worst categories
    const catEntries = Object.entries(byCategory).filter(([, v]) => v > 0);
    catEntries.sort((a, b) => a[1] - b[1]);
    const bestCategory = catEntries.length > 0 ? catEntries[0][0] : null;
    const worstCategory = catEntries.length > 0 ? catEntries[catEntries.length - 1][0] : null;

    return {
      thisWeekTotal: Math.round(thisWeekTotal * 10) / 10,
      lastWeekTotal: Math.round(lastWeekTotal * 10) / 10,
      change: Math.round(change),
      dailyTotals,
      byCategory,
      bestCategory,
      worstCategory,
    };
  }

  /**
   * Get top 3 highest-impact changes for user
   * @param {Object} baseline - User's baseline footprint
   * @returns {Array} Top 3 recommended actions
   */
  function getTopActions(baseline) {
    const actions = [];

    // Transport actions
    if (baseline.transport > 500) {
      actions.push({
        id: 'switch-to-public',
        action: 'Switch to public transport',
        category: 'transport',
        savingKg: Math.round(baseline.transport * 0.65),
        effort: 3,
        description: 'Taking bus or metro instead of driving cuts transport emissions by ~65%',
      });
    }

    if (baseline.transport > 200) {
      actions.push({
        id: 'carpool',
        action: 'Carpool to work',
        category: 'transport',
        savingKg: Math.round(baseline.transport * 0.45),
        effort: 2,
        description: 'Sharing rides with 2+ people nearly halves your commute emissions',
      });
    }

    actions.push({
      id: 'wfh-2days',
      action: 'Work from home 2 days/week',
      category: 'transport',
      savingKg: Math.round(baseline.transport * 0.28),
      effort: 2,
      description: 'Two fewer commute days per week saves significant transport CO₂',
    });

    // Food actions
    if (baseline.food > 700) {
      actions.push({
        id: 'reduce-meat',
        action: 'Go meat-free 3 days a week',
        category: 'food',
        savingKg: Math.round(baseline.food * 0.35),
        effort: 2,
        description: 'Replacing meat with plant-based meals 3 days/week substantially reduces food emissions',
      });
    }

    if (baseline.food > 1000) {
      actions.push({
        id: 'go-vegetarian',
        action: 'Switch to vegetarian diet',
        category: 'food',
        savingKg: Math.round(baseline.food - EmissionFactors.annualFood.vegetarian),
        effort: 4,
        description: 'A vegetarian diet has about 60% lower food emissions than a heavy meat diet',
      });
    }

    // Home actions
    if (baseline.home > 1500) {
      actions.push({
        id: 'solar-panels',
        action: 'Switch to solar energy',
        category: 'home',
        savingKg: Math.round(baseline.home * 0.7),
        effort: 5,
        description: 'Rooftop solar can eliminate up to 95% of electricity-related emissions',
      });
    }

    actions.push({
      id: 'reduce-ac',
      action: 'Reduce AC usage by 2 hours/day',
      category: 'home',
      savingKg: Math.round(2 * EmissionFactors.lifestyle.ac_hour * 200),
      effort: 2,
      description: 'Using fans more and AC less during moderate weather makes a big difference',
    });

    // Lifestyle actions  
    if (baseline.lifestyle > 300) {
      actions.push({
        id: 'buy-less',
        action: 'Buy 50% less new clothing',
        category: 'lifestyle',
        savingKg: Math.round(baseline.lifestyle * 0.3),
        effort: 2,
        description: 'Buying fewer, higher-quality items or shopping secondhand significantly cuts lifecycle emissions',
      });
    }

    actions.push({
      id: 'skip-flight',
      action: 'Skip one flight this year',
      category: 'transport',
      savingKg: 250,
      effort: 3,
      description: 'One domestic return flight ≈ 250kg CO₂ — equivalent to 3 months of vegetarian meals',
    });

    // Sort by saving and take top 3
    actions.sort((a, b) => b.savingKg - a.savingKg);
    return actions.slice(0, 3);
  }

  /**
   * "What if" simulator
   * @param {Object} baseline - Current baseline
   * @param {string} scenarioId - Scenario to simulate
   * @returns {Object} { newTotal, reduction, reductionPercent }
   */
  function whatIf(baseline, scenarioId) {
    const scenarios = {
      'no-car': {
        label: 'I stop driving entirely',
        calculate: (b) => ({ ...b, transport: Math.round(b.transport * 0.2) })
      },
      'public-transport': {
        label: 'I switch to public transport',
        calculate: (b) => ({ ...b, transport: Math.round(b.transport * 0.35) })
      },
      'vegetarian': {
        label: 'I go fully vegetarian',
        calculate: (b) => ({ ...b, food: EmissionFactors.annualFood.vegetarian })
      },
      'vegan': {
        label: 'I go fully vegan',
        calculate: (b) => ({ ...b, food: EmissionFactors.annualFood.vegan })
      },
      'solar': {
        label: 'I install solar panels',
        calculate: (b) => ({ ...b, home: Math.round(b.home * 0.3) })
      },
      'no-flights': {
        label: 'I stop flying for a year',
        calculate: (b) => {
          const flightReduction = Math.min(b.transport * 0.4, 500);
          return { ...b, transport: Math.round(b.transport - flightReduction) };
        }
      },
      'minimal-shopping': {
        label: 'I minimize shopping',
        calculate: (b) => ({ ...b, lifestyle: Math.round(b.lifestyle * 0.4) })
      },
    };

    const scenario = scenarios[scenarioId];
    if (!scenario) return null;

    const newBaseline = scenario.calculate(baseline);
    const newTotal = newBaseline.transport + newBaseline.food + newBaseline.home + newBaseline.lifestyle;
    const reduction = baseline.total - newTotal;

    return {
      label: scenario.label,
      newTotal,
      reduction,
      reductionPercent: Math.round((reduction / baseline.total) * 100),
      newBaseline,
    };
  }

  /**
   * Get all what-if scenarios
   */
  function getAllScenarios() {
    return [
      { id: 'no-car', label: 'Stop driving', emoji: '🚗' },
      { id: 'public-transport', label: 'Public transport only', emoji: '🚌' },
      { id: 'vegetarian', label: 'Go vegetarian', emoji: '🥗' },
      { id: 'vegan', label: 'Go vegan', emoji: '🌱' },
      { id: 'solar', label: 'Install solar', emoji: '☀️' },
      { id: 'no-flights', label: 'No flights', emoji: '✈️' },
      { id: 'minimal-shopping', label: 'Buy less stuff', emoji: '🛍️' },
    ];
  }

  return {
    calculateBaseline, calculateActivity, calculateDailyTotal,
    calculateWeeklySummary, getTopActions, whatIf, getAllScenarios
  };
})();
