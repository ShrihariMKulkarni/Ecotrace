/* ═══════════════════════════════════════════════════════════
   EcoTrace — Onboarding View
   6-step wizard for baseline footprint calculation
   ═══════════════════════════════════════════════════════════ */

const OnboardingView = (() => {
  let currentStep = 0;
  const answers = {
    name: '',
    transport: [],
    diet: '',
    householdSize: 3,
    energySource: 'grid',
    lpgCylinders: 10,
    flights: 0,
    shopping: 'moderate',
  };

  const steps = [
    // Step 0: Welcome
    {
      emoji: '🌍',
      question: 'Welcome to EcoTrace!',
      description: 'Let\'s understand your carbon footprint. It only takes 2 minutes — and the insights might surprise you.',
      type: 'name',
    },
    // Step 1: Transport
    {
      emoji: '🚗',
      question: 'How do you usually commute?',
      description: 'Select all modes you use regularly. Pick your most frequent ones first.',
      type: 'multi-select',
      options: [
        { id: 'car', emoji: '🚗', label: 'Car (Petrol/Diesel)', desc: 'Personal car' },
        { id: 'two_wheeler', emoji: '🛵', label: 'Two Wheeler', desc: 'Motorcycle or scooter' },
        { id: 'bus', emoji: '🚌', label: 'Bus', desc: 'Public bus' },
        { id: 'metro', emoji: '🚇', label: 'Metro / Rail', desc: 'Metro or suburban rail' },
        { id: 'auto', emoji: '🛺', label: 'Auto Rickshaw', desc: 'Shared or private auto' },
        { id: 'cycle', emoji: '🚲', label: 'Bicycle', desc: 'Zero emissions!' },
        { id: 'walk', emoji: '🚶', label: 'Walking', desc: 'The greenest choice' },
        { id: 'wfh', emoji: '🏠', label: 'Work from Home', desc: 'No commute needed' },
      ],
    },
    // Step 2: Diet
    {
      emoji: '🍽️',
      question: 'What does your diet look like?',
      description: 'Food is often 20-30% of your footprint. Be honest — no judgment!',
      type: 'single-select',
      options: [
        { id: 'vegan', emoji: '🌱', label: 'Vegan', desc: 'No animal products at all' },
        { id: 'vegetarian', emoji: '🥗', label: 'Vegetarian', desc: 'Dairy & eggs, no meat' },
        { id: 'pescatarian', emoji: '🐟', label: 'Pescatarian', desc: 'Fish but no meat' },
        { id: 'moderate_meat', emoji: '🍗', label: 'Non-veg (moderate)', desc: 'Meat a few times a week' },
        { id: 'heavy_meat', emoji: '🥩', label: 'Non-veg (daily)', desc: 'Meat with most meals' },
      ],
    },
    // Step 3: Home Energy
    {
      emoji: '🏠',
      question: 'Tell us about your home',
      description: 'Your household energy use is a big part of your footprint.',
      type: 'home',
    },
    // Step 4: Flights
    {
      emoji: '✈️',
      question: 'How often do you fly?',
      description: 'Flying is one of the highest-impact activities. Even 1 flight matters.',
      type: 'slider',
      min: 0,
      max: 10,
      step: 1,
      labels: ['Never', '10+ flights/year'],
      valueLabels: {
        0: 'Never fly ✨',
        1: '1 flight/year',
        2: '2 flights/year',
        3: '3 flights/year',
        5: '5 flights/year',
        10: '10+ flights/year',
      },
    },
    // Step 5: Shopping & Lifestyle
    {
      emoji: '🛍️',
      question: 'Your shopping habits?',
      description: 'Fast fashion, electronics, deliveries — they all add up.',
      type: 'single-select',
      options: [
        { id: 'minimal', emoji: '🌿', label: 'Minimal', desc: 'Buy very few new things' },
        { id: 'moderate', emoji: '🛒', label: 'Moderate', desc: 'Average shopping habits' },
        { id: 'frequent', emoji: '📦', label: 'Frequent', desc: 'Shop online often, new clothes monthly' },
        { id: 'heavy', emoji: '🛍️', label: 'Heavy', desc: 'Love shopping, lots of deliveries' },
      ],
    },
  ];

  function render() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="onboarding view--no-nav" id="onboarding-container">
        <div class="onboarding__progress" id="onboarding-progress">
          ${steps.map((_, i) => `
            <div class="onboarding__progress-dot ${i < currentStep ? 'onboarding__progress-dot--done' : i === currentStep ? 'onboarding__progress-dot--active' : ''}" data-step="${i}"></div>
          `).join('')}
        </div>
        <div class="onboarding__step" id="onboarding-step">
          ${renderStep(currentStep)}
        </div>
        <div class="onboarding__actions">
          ${currentStep > 0 ? '<button class="btn btn-ghost" id="onboarding-back">← Back</button>' : '<div></div>'}
          <button class="btn btn-primary btn--lg" id="onboarding-next" ${!canProceed() ? 'disabled' : ''}>
            ${currentStep === steps.length - 1 ? 'See My Footprint 🌱' : 'Continue →'}
          </button>
        </div>
      </div>
    `;

    bindEvents();
  }

  function renderStep(stepIndex) {
    const step = steps[stepIndex];

    switch (step.type) {
      case 'name':
        return `
          <div class="onboarding__emoji">${step.emoji}</div>
          <h1 class="onboarding__question">${step.question}</h1>
          <p class="onboarding__description">${step.description}</p>
          <div class="input-group mt-8">
            <label class="input-group__label" for="user-name">Your first name</label>
            <input class="input-group__input" type="text" id="user-name" placeholder="What should we call you?" 
              value="${answers.name}" autocomplete="given-name" maxlength="30">
          </div>
        `;

      case 'multi-select':
        return `
          <div class="onboarding__emoji">${step.emoji}</div>
          <h2 class="onboarding__question">${step.question}</h2>
          <p class="onboarding__description">${step.description}</p>
          <div class="onboarding__options">
            ${step.options.map(opt => `
              <div class="onboarding__option ${answers.transport.includes(opt.id) ? 'onboarding__option--selected' : ''}" 
                data-value="${opt.id}" data-type="multi">
                <span class="onboarding__option-emoji">${opt.emoji}</span>
                <div class="onboarding__option-text">
                  <span class="onboarding__option-label">${opt.label}</span>
                  <span class="onboarding__option-desc">${opt.desc}</span>
                </div>
              </div>
            `).join('')}
          </div>
        `;

      case 'single-select':
        const answerKey = stepIndex === 2 ? 'diet' : 'shopping';
        return `
          <div class="onboarding__emoji">${step.emoji}</div>
          <h2 class="onboarding__question">${step.question}</h2>
          <p class="onboarding__description">${step.description}</p>
          <div class="onboarding__options">
            ${step.options.map(opt => `
              <div class="onboarding__option ${answers[answerKey] === opt.id ? 'onboarding__option--selected' : ''}" 
                data-value="${opt.id}" data-type="single" data-answer="${answerKey}">
                <span class="onboarding__option-emoji">${opt.emoji}</span>
                <div class="onboarding__option-text">
                  <span class="onboarding__option-label">${opt.label}</span>
                  <span class="onboarding__option-desc">${opt.desc}</span>
                </div>
              </div>
            `).join('')}
          </div>
        `;

      case 'home':
        return `
          <div class="onboarding__emoji">${step.emoji}</div>
          <h2 class="onboarding__question">${step.question}</h2>
          <p class="onboarding__description">${step.description}</p>
          
          <div class="range-slider mt-6">
            <div class="flex justify-between items-center mb-2">
              <span class="text-sm text-muted">People in household</span>
              <span class="range-slider__value" id="household-value">${answers.householdSize}</span>
            </div>
            <input type="range" class="range-slider__track" id="household-slider" 
              min="1" max="6" value="${answers.householdSize}" step="1">
            <div class="range-slider__labels">
              <span>1 person</span>
              <span>6+ people</span>
            </div>
          </div>

          <div class="mt-6">
            <span class="text-sm text-muted mb-3" style="display:block;">Primary energy source</span>
            <div class="flex gap-2 flex-wrap">
              ${['grid', 'solar', 'mix'].map(src => `
                <button class="chip ${answers.energySource === src ? 'chip--active' : ''}" 
                  data-energy="${src}">
                  ${src === 'grid' ? '⚡ Grid Power' : src === 'solar' ? '☀️ Solar' : '🔄 Mix'}
                </button>
              `).join('')}
            </div>
          </div>
        `;

      case 'slider':
        const sliderVal = answers.flights;
        return `
          <div class="onboarding__emoji">${step.emoji}</div>
          <h2 class="onboarding__question">${step.question}</h2>
          <p class="onboarding__description">${step.description}</p>
          
          <div class="range-slider mt-8">
            <div class="range-slider__value" id="flights-display">
              ${step.valueLabels[sliderVal] || sliderVal + ' flights/year'}
            </div>
            <input type="range" class="range-slider__track" id="flights-slider" 
              min="${step.min}" max="${step.max}" value="${sliderVal}" step="${step.step}">
            <div class="range-slider__labels">
              <span>${step.labels[0]}</span>
              <span>${step.labels[1]}</span>
            </div>
          </div>

          <div class="card card--accent mt-6" style="padding: var(--space-4);">
            <p class="text-sm" style="color: var(--text-secondary);">
              💡 <strong>Did you know?</strong> A single domestic return flight ≈ 250 kg CO₂ — that's like driving 1,300 km!
            </p>
          </div>
        `;
    }
  }

  function canProceed() {
    switch (currentStep) {
      case 0: return answers.name.trim().length > 0;
      case 1: return answers.transport.length > 0;
      case 2: return answers.diet !== '';
      case 3: return true;
      case 4: return true;
      case 5: return answers.shopping !== '';
      default: return true;
    }
  }

  function bindEvents() {
    // Name input
    const nameInput = document.getElementById('user-name');
    if (nameInput) {
      nameInput.addEventListener('input', (e) => {
        answers.name = e.target.value;
        updateNextButton();
      });
      nameInput.focus();
    }

    // Multi-select options
    document.querySelectorAll('[data-type="multi"]').forEach(opt => {
      opt.addEventListener('click', () => {
        const val = opt.dataset.value;
        const idx = answers.transport.indexOf(val);
        if (idx >= 0) {
          answers.transport.splice(idx, 1);
          opt.classList.remove('onboarding__option--selected');
        } else {
          answers.transport.push(val);
          opt.classList.add('onboarding__option--selected');
        }
        updateNextButton();
      });
    });

    // Single-select options
    document.querySelectorAll('[data-type="single"]').forEach(opt => {
      opt.addEventListener('click', () => {
        const key = opt.dataset.answer;
        const val = opt.dataset.value;
        answers[key] = val;
        
        document.querySelectorAll(`[data-answer="${key}"]`).forEach(o => 
          o.classList.remove('onboarding__option--selected')
        );
        opt.classList.add('onboarding__option--selected');
        updateNextButton();
      });
    });

    // Household slider
    const householdSlider = document.getElementById('household-slider');
    if (householdSlider) {
      householdSlider.addEventListener('input', (e) => {
        answers.householdSize = parseInt(e.target.value);
        document.getElementById('household-value').textContent = answers.householdSize;
      });
    }

    // Energy source chips
    document.querySelectorAll('[data-energy]').forEach(chip => {
      chip.addEventListener('click', () => {
        answers.energySource = chip.dataset.energy;
        document.querySelectorAll('[data-energy]').forEach(c => c.classList.remove('chip--active'));
        chip.classList.add('chip--active');
      });
    });

    // Flights slider
    const flightsSlider = document.getElementById('flights-slider');
    if (flightsSlider) {
      flightsSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        answers.flights = val;
        const step = steps[4];
        document.getElementById('flights-display').textContent = 
          step.valueLabels[val] || val + ' flights/year';
      });
    }

    // Navigation buttons
    const nextBtn = document.getElementById('onboarding-next');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (!canProceed()) return;
        
        if (currentStep === steps.length - 1) {
          showResults();
        } else {
          currentStep++;
          render();
        }
      });
    }

    const backBtn = document.getElementById('onboarding-back');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        if (currentStep > 0) {
          currentStep--;
          render();
        }
      });
    }
  }

  function updateNextButton() {
    const btn = document.getElementById('onboarding-next');
    if (btn) btn.disabled = !canProceed();
  }

  function showResults() {
    const baseline = UserProfile.completeOnboarding(answers.name, answers);
    
    const app = document.getElementById('app');
    const maxCO2 = Math.max(baseline.total, EmissionFactors.averages.global, EmissionFactors.averages.us);
    
    const categories = [
      { key: 'transport', label: 'Transport', color: '#38bdf8', emoji: '🚗' },
      { key: 'food', label: 'Food', color: '#34d399', emoji: '🍽️' },
      { key: 'home', label: 'Home', color: '#fbbf24', emoji: '🏠' },
      { key: 'lifestyle', label: 'Lifestyle', color: '#c084fc', emoji: '🛍️' },
    ];

    app.innerHTML = `
      <div class="results view--no-nav" id="results-container">
        <span class="results__label">Your estimated annual carbon footprint</span>
        
        <div class="results__co2" id="results-co2">0</div>
        <span class="results__co2-unit" style="font-size: var(--text-lg); color: var(--text-tertiary);">kg CO₂ per year</span>
        
        <p class="results__subtitle mt-2">That's ${Formatter.co2(baseline.total)} of CO₂ — equivalent to ${Formatter.equivalency(baseline.total)}</p>

        <div class="results__chart-container mt-6">
          <canvas id="results-donut" width="220" height="220"></canvas>
          <div class="flex flex-wrap justify-center gap-4 mt-4">
            ${categories.map(cat => `
              <div class="flex items-center gap-2">
                <div class="cat-dot cat-dot--${cat.key}"></div>
                <span class="text-sm text-muted">${cat.label} ${Formatter.percent(baseline[cat.key], baseline.total)}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="results__comparison w-full mt-4">
          <div class="results__comparison-title">How you compare</div>
          <div class="comparison-bar">
            <div class="comparison-bar__row">
              <span class="comparison-bar__label">You</span>
              <div class="comparison-bar__track">
                <div class="comparison-bar__fill comparison-bar__fill--you" id="bar-you" style="width: 0%;">
                  ${Formatter.co2Short(baseline.total)}
                </div>
              </div>
            </div>
            <div class="comparison-bar__row">
              <span class="comparison-bar__label">🇮🇳 India avg</span>
              <div class="comparison-bar__track">
                <div class="comparison-bar__fill comparison-bar__fill--avg" id="bar-india" style="width: 0%;">
                  ${Formatter.co2Short(EmissionFactors.averages.india)}
                </div>
              </div>
            </div>
            <div class="comparison-bar__row">
              <span class="comparison-bar__label">🌍 Global avg</span>
              <div class="comparison-bar__track">
                <div class="comparison-bar__fill comparison-bar__fill--global" id="bar-global" style="width: 0%;">
                  ${Formatter.co2Short(EmissionFactors.averages.global)}
                </div>
              </div>
            </div>
            <div class="comparison-bar__row">
              <span class="comparison-bar__label">🎯 Paris target</span>
              <div class="comparison-bar__track">
                <div class="comparison-bar__fill comparison-bar__fill--target" id="bar-target" style="width: 0%;">
                  ${Formatter.co2Short(EmissionFactors.averages.paris_target)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="w-full mt-8">
          <button class="btn btn-primary btn--lg btn--full" id="results-continue">
            Let's reduce this together 🌱
          </button>
        </div>
      </div>
    `;

    // Animate counter
    setTimeout(() => {
      Animations.animateCounter('results-co2', baseline.total, { decimals: 0, duration: 1800 });
    }, 300);

    // Animate donut chart
    setTimeout(() => {
      Charts.donut('results-donut', categories.map(cat => ({
        value: baseline[cat.key],
        color: cat.color,
        category: cat.key,
      })));
    }, 500);

    // Animate comparison bars
    setTimeout(() => {
      const scale = 85; // max bar width percentage
      document.getElementById('bar-you').style.width = (baseline.total / maxCO2 * scale) + '%';
      document.getElementById('bar-india').style.width = (EmissionFactors.averages.india / maxCO2 * scale) + '%';
      document.getElementById('bar-global').style.width = (EmissionFactors.averages.global / maxCO2 * scale) + '%';
      document.getElementById('bar-target').style.width = (EmissionFactors.averages.paris_target / maxCO2 * scale) + '%';
    }, 800);

    // Continue button
    document.getElementById('results-continue').addEventListener('click', () => {
      App.navigate('dashboard');
    });
  }

  function reset() {
    currentStep = 0;
    answers.name = '';
    answers.transport = [];
    answers.diet = '';
    answers.householdSize = 3;
    answers.energySource = 'grid';
    answers.flights = 0;
    answers.shopping = 'moderate';
  }

  return { render, reset };
})();
