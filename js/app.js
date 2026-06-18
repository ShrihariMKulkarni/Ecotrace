/* ═══════════════════════════════════════════════════════════
   EcoTrace — App Controller
   Router, initialization, view lifecycle management
   ═══════════════════════════════════════════════════════════ */

const App = (() => {
  let currentView = null;

  const views = {
    dashboard: { render: () => DashboardView.render(), label: 'Home', icon: '🏠' },
    track:     { render: () => TrackerView.render(),   label: 'Track', icon: '📊' },
    insights:  { render: () => InsightsView.render(),  label: 'Insights', icon: '💡' },
    challenges:{ render: () => ChallengesView.render(), label: 'Challenges', icon: '🏆' },
    learn:     { render: () => LearnView.render(),     label: 'Learn', icon: '📚' },
  };

  function init() {
    // Initialize ripple effects
    Animations.initRipples();

    // Check if onboarded
    if (!UserProfile.isOnboarded()) {
      showOnboarding();
      return;
    }

    // Build app shell
    renderShell();

    // Handle initial route
    const hash = window.location.hash.replace('#', '') || 'dashboard';
    navigate(hash, false);

    // Listen for hash changes
    window.addEventListener('hashchange', () => {
      const newView = window.location.hash.replace('#', '') || 'dashboard';
      navigate(newView, false);
    });
  }

  function showOnboarding() {
    document.getElementById('app').innerHTML = '';
    OnboardingView.render();
  }

  function renderShell() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <main id="view-content" class="view"></main>
      <nav class="tab-bar" id="tab-bar">
        ${Object.entries(views).map(([key, v]) => `
          <button class="tab-bar__item ${key === currentView ? 'tab-bar__item--active' : ''}" 
            data-view="${key}" id="tab-${key}">
            <span class="tab-bar__icon">${v.icon}</span>
            <span class="tab-bar__label">${v.label}</span>
          </button>
        `).join('')}
      </nav>
    `;

    // Tab bar click handlers
    document.querySelectorAll('.tab-bar__item').forEach(tab => {
      tab.addEventListener('click', () => {
        navigate(tab.dataset.view);
      });
    });
  }

  function navigate(viewName, updateHash = true) {
    if (!views[viewName]) viewName = 'dashboard';

    // If we need the shell and don't have it
    if (!document.getElementById('view-content')) {
      renderShell();
    }

    currentView = viewName;

    // Update tab bar
    document.querySelectorAll('.tab-bar__item').forEach(tab => {
      tab.classList.toggle('tab-bar__item--active', tab.dataset.view === viewName);
    });

    // Render view
    views[viewName].render();

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Update hash
    if (updateHash) {
      window.location.hash = viewName;
    }
  }

  function getCurrentView() {
    return currentView;
  }

  // Reset everything (for debugging)
  function resetAll() {
    Storage.clear();
    UserProfile.reset();
    Achievements.reset();
    OnboardingView.reset();
    window.location.hash = '';
    init();
  }

  // Auto-init on DOM ready
  document.addEventListener('DOMContentLoaded', init);

  return { init, navigate, getCurrentView, resetAll };
})();
