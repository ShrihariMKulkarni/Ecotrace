/* ═══════════════════════════════════════════════════════════
   EcoTrace — Challenge & Badge Definitions
   Weekly challenges and achievement badges data
   ═══════════════════════════════════════════════════════════ */

const ChallengeData = (() => {

  // ── Weekly Challenges ─────────────────────────────────
  const challenges = [
    // Transport
    {
      id: 'meat-free-3',
      title: 'Meat-Free Explorer',
      description: 'Log 3 vegetarian or vegan meals this week',
      category: 'food',
      difficulty: 'easy',
      target: 3,
      trackActivity: ['vegan_meal', 'veg_meal'],
      badgeEmoji: '🥗',
      rewardPoints: 50,
      co2Saving: 5.1,
    },
    {
      id: 'public-transport-5',
      title: 'Metro Master',
      description: 'Use public transport 5 times this week',
      category: 'transport',
      difficulty: 'medium',
      target: 5,
      trackActivity: ['bus', 'metro', 'train'],
      badgeEmoji: '🚇',
      rewardPoints: 75,
      co2Saving: 12.2,
    },
    {
      id: 'walk-cycle-4',
      title: 'Green Commuter',
      description: 'Walk or cycle to your destination 4 times',
      category: 'transport',
      difficulty: 'medium',
      target: 4,
      trackActivity: ['walked', 'cycled'],
      badgeEmoji: '🚲',
      rewardPoints: 75,
      co2Saving: 11.5,
    },
    {
      id: 'zero-delivery',
      title: 'Zero Delivery Week',
      description: 'Go 7 days without any online deliveries',
      category: 'lifestyle',
      difficulty: 'medium',
      target: 7,
      trackActivity: ['no_delivery'],
      badgeEmoji: '📦',
      rewardPoints: 60,
      co2Saving: 3.5,
    },
    {
      id: 'ac-free-5',
      title: 'Cool Without AC',
      description: 'Skip AC for 5 days this week',
      category: 'home',
      difficulty: 'hard',
      target: 5,
      trackActivity: ['ac_off', 'fan_only'],
      badgeEmoji: '🌀',
      rewardPoints: 100,
      co2Saving: 16.4,
    },
    {
      id: 'home-cook-5',
      title: 'Home Chef',
      description: 'Cook at home for 5 meals this week',
      category: 'food',
      difficulty: 'easy',
      target: 5,
      trackActivity: ['home_cooked'],
      badgeEmoji: '👨‍🍳',
      rewardPoints: 50,
      co2Saving: 2.5,
    },
    {
      id: 'short-shower-7',
      title: 'Quick Rinse Champion',
      description: 'Take short showers all 7 days',
      category: 'home',
      difficulty: 'easy',
      target: 7,
      trackActivity: ['short_shower'],
      badgeEmoji: '🚿',
      rewardPoints: 40,
      co2Saving: 4.1,
    },
    {
      id: 'repair-reuse',
      title: 'Repair Hero',
      description: 'Repair or reuse 2 items instead of buying new',
      category: 'lifestyle',
      difficulty: 'medium',
      target: 2,
      trackActivity: ['repaired', 'secondhand'],
      badgeEmoji: '🔧',
      rewardPoints: 70,
      co2Saving: 14.0,
    },
    {
      id: 'vegan-week',
      title: 'Plant Power Week',
      description: 'Eat only vegan meals for 5 consecutive days',
      category: 'food',
      difficulty: 'hard',
      target: 15, // 5 days × 3 meals
      trackActivity: ['vegan_meal'],
      badgeEmoji: '🌱',
      rewardPoints: 120,
      co2Saving: 13.5,
    },
    {
      id: 'local-food-5',
      title: 'Local Champion',
      description: 'Buy local produce 5 times this week',
      category: 'lifestyle',
      difficulty: 'easy',
      target: 5,
      trackActivity: ['local_food'],
      badgeEmoji: '🌾',
      rewardPoints: 45,
      co2Saving: 1.5,
    },
    {
      id: 'carpool-3',
      title: 'Share the Ride',
      description: 'Carpool 3 times this week',
      category: 'transport',
      difficulty: 'easy',
      target: 3,
      trackActivity: ['carpool'],
      badgeEmoji: '🚙',
      rewardPoints: 55,
      co2Saving: 5.8,
    },
    {
      id: 'reusable-bag-7',
      title: 'Bag-Free Week',
      description: 'Use reusable bags every day for a week',
      category: 'lifestyle',
      difficulty: 'easy',
      target: 7,
      trackActivity: ['reusable_bag'],
      badgeEmoji: '🛍️',
      rewardPoints: 35,
      co2Saving: 0.2,
    },
    {
      id: 'lights-off-7',
      title: 'Dark Hour Hero',
      description: 'Turn off unnecessary lights early for 7 days',
      category: 'home',
      difficulty: 'easy',
      target: 7,
      trackActivity: ['lights_off'],
      badgeEmoji: '💡',
      rewardPoints: 30,
      co2Saving: 1.4,
    },
    {
      id: 'no-screen-5',
      title: 'Digital Detox',
      description: 'Reduce screen time for 5 days this week',
      category: 'lifestyle',
      difficulty: 'medium',
      target: 5,
      trackActivity: ['less_screen'],
      badgeEmoji: '📱',
      rewardPoints: 50,
      co2Saving: 0.5,
    },
    {
      id: 'ev-rides-3',
      title: 'Electric Explorer',
      description: 'Use EV or electric transport 3 times',
      category: 'transport',
      difficulty: 'medium',
      target: 3,
      trackActivity: ['ev'],
      badgeEmoji: '⚡',
      rewardPoints: 65,
      co2Saving: 6.4,
    },
  ];

  // ── Achievement Badges ────────────────────────────────
  const badges = [
    // Milestone badges
    { id: 'first-log',       name: 'First Step',        emoji: '👣', description: 'Log your first activity', condition: 'logs >= 1' },
    { id: 'streak-3',        name: '3-Day Streak',      emoji: '🔥', description: 'Log activities 3 days in a row', condition: 'streak >= 3' },
    { id: 'streak-7',        name: 'Week Warrior',      emoji: '⚡', description: '7-day logging streak', condition: 'streak >= 7' },
    { id: 'streak-14',       name: 'Fortnight Force',   emoji: '💪', description: '14-day logging streak', condition: 'streak >= 14' },
    { id: 'streak-30',       name: 'Monthly Master',    emoji: '🏆', description: '30-day logging streak', condition: 'streak >= 30' },
    { id: 'logs-10',         name: 'Getting Started',   emoji: '🌱', description: 'Log 10 activities total', condition: 'totalLogs >= 10' },
    { id: 'logs-50',         name: 'Habit Forming',     emoji: '🌿', description: 'Log 50 activities total', condition: 'totalLogs >= 50' },
    { id: 'logs-100',        name: 'Century Club',      emoji: '🌳', description: 'Log 100 activities total', condition: 'totalLogs >= 100' },
    { id: 'logs-500',        name: 'Eco Champion',      emoji: '🏅', description: 'Log 500 activities total', condition: 'totalLogs >= 500' },
    
    // CO₂ saving badges
    { id: 'saved-10kg',      name: 'First 10kg',        emoji: '💨', description: 'Save 10kg CO₂ from defaults', condition: 'saved >= 10' },
    { id: 'saved-50kg',      name: 'Half Century',      emoji: '🌤️', description: 'Save 50kg CO₂', condition: 'saved >= 50' },
    { id: 'saved-100kg',     name: 'Century Saver',     emoji: '☀️', description: 'Save 100kg CO₂', condition: 'saved >= 100' },
    { id: 'saved-500kg',     name: 'Planet Guardian',   emoji: '🌍', description: 'Save 500kg CO₂', condition: 'saved >= 500' },
    { id: 'saved-1000kg',    name: 'Climate Hero',      emoji: '🦸', description: 'Save 1 tonne CO₂', condition: 'saved >= 1000' },
    
    // Challenge badges
    { id: 'challenge-1',     name: 'Challenger',        emoji: '🎯', description: 'Complete your first challenge', condition: 'challenges >= 1' },
    { id: 'challenge-5',     name: 'Challenge Seeker',  emoji: '🎪', description: 'Complete 5 challenges', condition: 'challenges >= 5' },
    { id: 'challenge-10',    name: 'Challenge Master',  emoji: '👑', description: 'Complete 10 challenges', condition: 'challenges >= 10' },
    
    // Category specialist badges
    { id: 'transport-pro',   name: 'Green Commuter',    emoji: '🚲', description: 'Log 20 green transport activities', condition: 'transportLogs >= 20' },
    { id: 'food-pro',        name: 'Eco Foodie',        emoji: '🥬', description: 'Log 20 low-carbon meals', condition: 'foodLogs >= 20' },
    { id: 'home-pro',        name: 'Energy Saver',      emoji: '⚡', description: 'Log 20 home energy savings', condition: 'homeLogs >= 20' },
    { id: 'lifestyle-pro',   name: 'Mindful Consumer',  emoji: '♻️', description: 'Log 20 sustainable choices', condition: 'lifestyleLogs >= 20' },
  ];

  // ── Milestones ────────────────────────────────────────
  const milestones = [
    { kg: 10,   name: 'Seedling',       emoji: '🌱', description: 'Like letting a small tree grow for a month' },
    { kg: 25,   name: 'Sapling',        emoji: '🌿', description: 'Equivalent to planting 1 tree' },
    { kg: 50,   name: 'Young Tree',     emoji: '🌲', description: 'Like taking 2 cars off the road for a week' },
    { kg: 100,  name: 'Forest Start',   emoji: '🌳', description: 'Equivalent to planting 4-5 trees' },
    { kg: 250,  name: 'Green Grove',    emoji: '🏕️', description: 'Like saving one domestic flight' },
    { kg: 500,  name: 'Eco Forest',     emoji: '🌴', description: 'Half a tonne — significant impact!' },
    { kg: 1000, name: 'Tonne Hero',     emoji: '🏔️', description: 'One full tonne saved! That\'s huge!' },
    { kg: 2000, name: 'Climate Legend',  emoji: '🌍', description: 'More than the avg Indian annual footprint saved' },
  ];

  /**
   * Get 3 random challenges not currently active
   */
  function getAvailableChallenges(activeChallengeIds = []) {
    const available = challenges.filter(c => !activeChallengeIds.includes(c.id));
    // Shuffle and pick 3
    const shuffled = [...available].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  }

  /**
   * Check challenge progress
   */
  function checkChallengeProgress(challenge, logs) {
    const matchingLogs = logs.filter(l => challenge.trackActivity.includes(l.activityId));
    return Math.min(matchingLogs.length, challenge.target);
  }

  /**
   * Get next milestone
   */
  function getNextMilestone(totalSavedKg) {
    return milestones.find(m => totalSavedKg < m.kg) || milestones[milestones.length - 1];
  }

  /**
   * Get reached milestones
   */
  function getReachedMilestones(totalSavedKg) {
    return milestones.filter(m => totalSavedKg >= m.kg);
  }

  return {
    challenges, badges, milestones,
    getAvailableChallenges, checkChallengeProgress,
    getNextMilestone, getReachedMilestones
  };
})();
