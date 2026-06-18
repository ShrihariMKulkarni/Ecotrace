/* ═══════════════════════════════════════════════════════════
   EcoTrace — Achievements Model
   Badges, streaks, challenges, and milestone tracking
   ═══════════════════════════════════════════════════════════ */

const Achievements = (() => {
  const STORE_KEY = 'achievements';
  const CHALLENGES_KEY = 'active_challenges';

  function _getState() {
    return Storage.get(STORE_KEY, {
      earnedBadges: [],       // Array of { id, earnedAt }
      completedChallenges: [], // Array of { id, completedAt }
      totalPoints: 0,
    });
  }

  function _saveState(state) {
    Storage.set(STORE_KEY, state);
  }

  /**
   * Get active challenges
   */
  function getActiveChallenges() {
    return Storage.get(CHALLENGES_KEY, []);
  }

  /**
   * Accept a challenge
   */
  function acceptChallenge(challengeId) {
    const challenge = ChallengeData.challenges.find(c => c.id === challengeId);
    if (!challenge) return;

    const active = getActiveChallenges();
    if (active.find(c => c.id === challengeId)) return;

    active.push({
      id: challengeId,
      startedAt: new Date().toISOString(),
      progress: 0,
    });

    Storage.set(CHALLENGES_KEY, active);
    return active;
  }

  /**
   * Update challenge progress
   */
  function updateChallengeProgress() {
    const active = getActiveChallenges();
    const weekLogs = ActivityLog.getLastNDays(7);

    active.forEach(ac => {
      const challenge = ChallengeData.challenges.find(c => c.id === ac.id);
      if (!challenge) return;

      // Count matching logs since challenge started
      const startDate = ac.startedAt.split('T')[0];
      const matchingLogs = weekLogs.filter(l => 
        l.date >= startDate && challenge.trackActivity.includes(l.activityId)
      );
      ac.progress = Math.min(matchingLogs.length, challenge.target);
    });

    Storage.set(CHALLENGES_KEY, active);
    return active;
  }

  /**
   * Complete a challenge
   */
  function completeChallenge(challengeId) {
    const state = _getState();
    const challenge = ChallengeData.challenges.find(c => c.id === challengeId);
    if (!challenge) return;

    // Add to completed
    state.completedChallenges.push({
      id: challengeId,
      completedAt: new Date().toISOString(),
    });
    state.totalPoints += challenge.rewardPoints;

    // Remove from active
    const active = getActiveChallenges().filter(c => c.id !== challengeId);
    Storage.set(CHALLENGES_KEY, active);

    _saveState(state);
    
    // Check for challenge-related badges
    checkAndUpdate();
    
    return state;
  }

  /**
   * Check if any new badges should be earned
   */
  function checkAndUpdate() {
    const state = _getState();
    const earnedIds = new Set(state.earnedBadges.map(b => b.id));
    const newBadges = [];

    const totalLogs = ActivityLog.getTotalCount();
    const streak = ActivityLog.getCurrentStreak();
    const totalSaved = ActivityLog.getTotalSavings();
    const challengesCompleted = state.completedChallenges.length;
    const categoryCounts = ActivityLog.getCategoryCounts();

    ChallengeData.badges.forEach(badge => {
      if (earnedIds.has(badge.id)) return;

      let earned = false;

      // Parse condition
      if (badge.condition.startsWith('logs >=')) {
        earned = totalLogs >= parseInt(badge.condition.split('>= ')[1]);
      } else if (badge.condition.startsWith('totalLogs >=')) {
        earned = totalLogs >= parseInt(badge.condition.split('>= ')[1]);
      } else if (badge.condition.startsWith('streak >=')) {
        earned = streak >= parseInt(badge.condition.split('>= ')[1]);
      } else if (badge.condition.startsWith('saved >=')) {
        earned = totalSaved >= parseInt(badge.condition.split('>= ')[1]);
      } else if (badge.condition.startsWith('challenges >=')) {
        earned = challengesCompleted >= parseInt(badge.condition.split('>= ')[1]);
      } else if (badge.condition.startsWith('transportLogs >=')) {
        earned = (categoryCounts.transport || 0) >= parseInt(badge.condition.split('>= ')[1]);
      } else if (badge.condition.startsWith('foodLogs >=')) {
        earned = (categoryCounts.food || 0) >= parseInt(badge.condition.split('>= ')[1]);
      } else if (badge.condition.startsWith('homeLogs >=')) {
        earned = (categoryCounts.home || 0) >= parseInt(badge.condition.split('>= ')[1]);
      } else if (badge.condition.startsWith('lifestyleLogs >=')) {
        earned = (categoryCounts.lifestyle || 0) >= parseInt(badge.condition.split('>= ')[1]);
      }

      if (earned) {
        state.earnedBadges.push({ id: badge.id, earnedAt: new Date().toISOString() });
        newBadges.push(badge);
      }
    });

    if (newBadges.length > 0) {
      _saveState(state);
    }

    return newBadges;
  }

  /**
   * Get all earned badges
   */
  function getEarnedBadges() {
    return _getState().earnedBadges;
  }

  /**
   * Check if a badge is earned
   */
  function hasBadge(badgeId) {
    return _getState().earnedBadges.some(b => b.id === badgeId);
  }

  /**
   * Get total points
   */
  function getTotalPoints() {
    return _getState().totalPoints;
  }

  /**
   * Get completed challenge count
   */
  function getCompletedCount() {
    return _getState().completedChallenges.length;
  }

  /**
   * Reset all achievement data
   */
  function reset() {
    Storage.remove(STORE_KEY);
    Storage.remove(CHALLENGES_KEY);
  }

  return {
    getActiveChallenges, acceptChallenge, updateChallengeProgress,
    completeChallenge, checkAndUpdate, getEarnedBadges, hasBadge,
    getTotalPoints, getCompletedCount, reset
  };
})();
