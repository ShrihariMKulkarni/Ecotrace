/* ═══════════════════════════════════════════════════════════
   EcoTrace — Challenges View
   Gamification: challenges, badges, milestones
   ═══════════════════════════════════════════════════════════ */

const ChallengesView = (() => {

  function render() {
    const activeChallenges = Achievements.getActiveChallenges();
    const earnedBadges = Achievements.getEarnedBadges();
    const earnedBadgeIds = new Set(earnedBadges.map(b => b.id));
    const totalPoints = Achievements.getTotalPoints();
    const streak = ActivityLog.getCurrentStreak();
    const totalSavings = ActivityLog.getTotalSavings();
    const completedCount = Achievements.getCompletedCount();

    // Get available challenges
    const activeIds = activeChallenges.map(c => c.id);
    const available = ChallengeData.getAvailableChallenges(activeIds);

    // Update challenge progress
    Achievements.updateChallengeProgress();

    // Milestones
    const reachedMilestones = ChallengeData.getReachedMilestones(totalSavings);
    const nextMilestone = ChallengeData.getNextMilestone(totalSavings);

    const view = document.getElementById('view-content');
    view.innerHTML = `
      <div class="challenges">
        <div class="view-header">
          <h1 class="view-header__title">Challenges</h1>
          <div class="flex items-center gap-3">
            ${streak > 0 ? `
              <div class="streak">
                <span class="streak__flame">🔥</span>
                <span class="streak__count">${streak}</span>
              </div>
            ` : ''}
          </div>
        </div>

        <!-- Stats Overview -->
        <div class="grid grid-3 gap-3 animate-fade-in-up">
          <div class="card" style="text-align:center; padding: var(--space-4);">
            <div class="counter counter--md text-accent">${completedCount}</div>
            <div class="text-xs text-muted mt-1">Completed</div>
          </div>
          <div class="card" style="text-align:center; padding: var(--space-4);">
            <div class="counter counter--md text-amber">${totalPoints}</div>
            <div class="text-xs text-muted mt-1">Points</div>
          </div>
          <div class="card" style="text-align:center; padding: var(--space-4);">
            <div class="counter counter--md text-purple">${earnedBadges.length}</div>
            <div class="text-xs text-muted mt-1">Badges</div>
          </div>
        </div>

        <!-- Active Challenges -->
        ${activeChallenges.length > 0 ? `
          <div class="animate-fade-in-up delay-1">
            <div class="dashboard__section-title">Active Challenges</div>
            ${activeChallenges.map(ac => {
              const challenge = ChallengeData.challenges.find(c => c.id === ac.id);
              if (!challenge) return '';
              const isComplete = ac.progress >= challenge.target;
              return `
                <div class="card challenge-card mb-4">
                  <span class="challenge-card__badge-preview">${challenge.badgeEmoji}</span>
                  <span class="challenge-card__difficulty challenge-card__difficulty--${challenge.difficulty}">
                    ${challenge.difficulty}
                  </span>
                  <h3 class="challenge-card__title">${challenge.title}</h3>
                  <p class="challenge-card__desc">${challenge.description}</p>
                  
                  <div class="challenge-card__progress-info">
                    <span class="challenge-card__progress-text">${ac.progress}/${challenge.target}</span>
                    <span class="challenge-card__days-left">
                      🌱 Saves ${challenge.co2Saving.toFixed(1)} kg CO₂
                    </span>
                  </div>
                  <div class="progress-bar">
                    <div class="progress-bar__fill" style="width: ${(ac.progress / challenge.target * 100)}%;"></div>
                  </div>
                  
                  ${isComplete ? `
                    <div class="challenge-card__actions">
                      <button class="btn btn-primary btn--sm btn--full" data-complete="${challenge.id}">
                        🎉 Claim Badge!
                      </button>
                    </div>
                  ` : ''}
                </div>
              `;
            }).join('')}
          </div>
        ` : ''}

        <!-- Available Challenges -->
        <div class="animate-fade-in-up delay-2">
          <div class="dashboard__section-title">
            ${activeChallenges.length > 0 ? 'New Challenges' : 'Start a Challenge'}
          </div>
          ${available.map(challenge => `
            <div class="card challenge-card mb-4">
              <span class="challenge-card__badge-preview">${challenge.badgeEmoji}</span>
              <span class="challenge-card__difficulty challenge-card__difficulty--${challenge.difficulty}">
                ${challenge.difficulty}
              </span>
              <h3 class="challenge-card__title">${challenge.title}</h3>
              <p class="challenge-card__desc">${challenge.description}</p>
              <div class="flex justify-between items-center mt-3">
                <span class="text-sm text-muted">🌱 ${challenge.co2Saving.toFixed(1)} kg CO₂ · ${challenge.rewardPoints} pts</span>
              </div>
              <div class="challenge-card__actions">
                <button class="btn btn-primary btn--sm" data-accept="${challenge.id}">Accept Challenge</button>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Next Milestone -->
        ${nextMilestone ? `
          <div class="card card--accent animate-fade-in-up delay-3" style="padding: var(--space-5);">
            <div class="text-xs uppercase text-muted fw-semibold mb-3">Next Milestone</div>
            <div class="flex items-center gap-4">
              <span style="font-size: 2.5rem;">${nextMilestone.emoji}</span>
              <div class="flex-1">
                <div class="fw-semibold">${nextMilestone.name}</div>
                <div class="text-sm text-muted">${nextMilestone.description}</div>
                <div class="progress-bar mt-2">
                  <div class="progress-bar__fill" style="width: ${Math.min(totalSavings / nextMilestone.kg * 100, 100)}%;"></div>
                </div>
                <div class="text-xs text-muted mt-1">
                  ${totalSavings.toFixed(1)} / ${nextMilestone.kg} kg CO₂ saved
                </div>
              </div>
            </div>
          </div>
        ` : ''}

        <!-- Badge Collection -->
        <div class="animate-fade-in-up delay-4">
          <div class="dashboard__section-title">Badge Collection</div>
          <div class="badge-grid">
            ${ChallengeData.badges.slice(0, 16).map(badge => {
              const isEarned = earnedBadgeIds.has(badge.id);
              return `
                <div class="badge ${isEarned ? 'badge--earned' : 'badge--locked'}" title="${badge.description}">
                  <div class="badge__icon ${isEarned ? 'animate-glow' : ''}">
                    ${badge.emoji}
                  </div>
                  <span class="badge__name">${badge.name}</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Reached Milestones -->
        ${reachedMilestones.length > 0 ? `
          <div class="animate-fade-in-up delay-5">
            <div class="dashboard__section-title">Milestones Reached</div>
            <div class="milestone-list">
              ${reachedMilestones.map(m => `
                <div class="milestone">
                  <div class="milestone__icon">${m.emoji}</div>
                  <div class="milestone__info">
                    <div class="milestone__name">${m.name}</div>
                    <div class="milestone__desc">${m.description}</div>
                  </div>
                  <span class="text-accent text-sm fw-semibold">${m.kg} kg</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;

    bindEvents();
  }

  function bindEvents() {
    // Accept challenge
    document.querySelectorAll('[data-accept]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.accept;
        Achievements.acceptChallenge(id);
        Animations.toast('Challenge accepted! Good luck! 🎯', { type: 'success' });
        render();
      });
    });

    // Complete challenge
    document.querySelectorAll('[data-complete]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.complete;
        Achievements.completeChallenge(id);
        Animations.confetti();
        Animations.toast('🏆 Challenge completed! Badge earned!', { type: 'success', duration: 4000 });
        render();
      });
    });
  }

  return { render };
})();
