/* ═══════════════════════════════════════════════════════════
   EcoTrace — User Profile Model
   Manages user data, onboarding state, and preferences
   ═══════════════════════════════════════════════════════════ */

const UserProfile = (() => {
  const STORE_KEY = 'user_profile';

  const defaultProfile = {
    name: '',
    onboardingComplete: false,
    onboardingAnswers: {},
    baseline: { total: 0, transport: 0, food: 0, home: 0, lifestyle: 0 },
    createdAt: null,
    region: 'india',
  };

  function get() {
    return Storage.get(STORE_KEY, { ...defaultProfile });
  }

  function set(profile) {
    Storage.set(STORE_KEY, profile);
  }

  function update(partial) {
    const current = get();
    const updated = { ...current, ...partial };
    set(updated);
    return updated;
  }

  function isOnboarded() {
    return get().onboardingComplete;
  }

  function getName() {
    return get().name || 'Friend';
  }

  function getBaseline() {
    return get().baseline;
  }

  function completeOnboarding(name, answers) {
    const baseline = Calculator.calculateBaseline(answers);
    update({
      name,
      onboardingComplete: true,
      onboardingAnswers: answers,
      baseline,
      createdAt: new Date().toISOString(),
    });
    return baseline;
  }

  function reset() {
    Storage.remove(STORE_KEY);
  }

  return { get, set, update, isOnboarded, getName, getBaseline, completeOnboarding, reset };
})();
