/* ═══════════════════════════════════════════════════════════
   EcoTrace — Learn View
   Education: explainers, myth-busting, action links
   ═══════════════════════════════════════════════════════════ */

const LearnView = (() => {

  const explainers = [
    {
      id: 'beef-footprint',
      emoji: '🐄',
      title: 'Why does beef have such a high footprint?',
      content: `Beef production requires massive amounts of land, water, and feed. Cows produce methane (CH₄), a greenhouse gas 80× more potent than CO₂ over 20 years. One kilogram of beef produces about 27 kg of CO₂e — compared to just 0.9 kg for lentils. The land used for cattle ranching is often deforested, releasing stored carbon.\n\n<strong>Key fact:</strong> If cattle were a country, they'd be the world's 3rd largest greenhouse gas emitter.`,
    },
    {
      id: 'electricity-calc',
      emoji: '⚡',
      title: 'How is your electricity footprint calculated?',
      content: `India's power grid produces about <strong>0.82 kg CO₂ per kWh</strong> (CEA 2023). This is because ~70% of India's electricity comes from coal-fired power plants. Your electricity footprint = monthly kWh usage × 0.82 × 12 months.\n\n<strong>Solar panels</strong> reduce this to ~0.04 kg CO₂/kWh (lifecycle emissions from manufacturing). Switching to solar can cut your home energy footprint by <strong>95%</strong>.`,
    },
    {
      id: 'flight-impact',
      emoji: '✈️',
      title: 'Why is flying so bad for the climate?',
      content: `Aviation accounts for about 2.5% of global CO₂ emissions, but its total climate impact is 2-4× larger due to contrails, nitrogen oxides, and high-altitude effects.\n\nA single <strong>Delhi-Mumbai return flight ≈ 250 kg CO₂</strong> — that's equal to 3 months of vegetarian meals or driving 1,300 km. There's currently no scalable green alternative to kerosene jet fuel.\n\n<strong>Tip:</strong> If you must fly, choose direct flights (takeoff/landing use the most fuel) and economy class (more passengers per plane = lower per-person emissions).`,
    },
    {
      id: 'fast-fashion',
      emoji: '👗',
      title: 'The hidden cost of fast fashion',
      content: `The fashion industry produces <strong>10% of global carbon emissions</strong> — more than aviation and shipping combined. A single cotton t-shirt requires 2,700 liters of water to make.\n\nFast fashion items are designed to be worn ~7 times before being discarded. In India, textile waste is growing at <strong>5% annually</strong>.\n\n<strong>What helps:</strong> Buy less, buy better quality, shop secondhand, and repair before replacing. Each garment kept for 9 extra months reduces its carbon footprint by ~30%.`,
    },
    {
      id: 'ac-impact',
      emoji: '❄️',
      title: 'Air conditioning & the cooling paradox',
      content: `AC is one of the largest single-appliance energy consumers. A typical 1.5-ton AC running 8 hours uses ~6.5 kWh/day = <strong>5.3 kg CO₂/day</strong>.\n\nAs India heats up due to climate change, AC demand is projected to grow 15× by 2050 — creating a vicious cycle where cooling accelerates warming.\n\n<strong>Tips:</strong> Use 5-star rated ACs, set temperature to 24-26°C, use fans to circulate air, shade your windows, and switch off when leaving.`,
    },
    {
      id: 'food-waste',
      emoji: '🍎',
      title: 'Food waste: the invisible emission',
      content: `India wastes about <strong>68.7 million tonnes</strong> of food annually. When food decomposes in landfills, it produces methane — a potent greenhouse gas.\n\nGlobally, food waste accounts for 8-10% of all greenhouse gas emissions. If food waste were a country, it would be the 3rd largest emitter after China and the US.\n\n<strong>Tips:</strong> Plan meals, use leftovers creatively, compost organic waste, and understand that "best before" ≠ "unsafe after."`,
    },
    {
      id: 'ev-comparison',
      emoji: '🔋',
      title: 'Are electric vehicles really greener?',
      content: `Yes — even with India's coal-heavy grid. An EV in India produces about <strong>50-60% less CO₂</strong> per km than a petrol car over its lifetime.\n\n<strong>The math:</strong> Petrol car ≈ 0.19 kg CO₂/km. EV on India grid ≈ 0.05 kg CO₂/km. As India's grid gets cleaner (40% renewables target by 2030), EVs get even greener.\n\nBattery production has a one-time carbon cost (~6-8 tonnes), but this is offset within 2-3 years of driving.`,
    },
    {
      id: 'streaming',
      emoji: '📱',
      title: 'Does Netflix really hurt the planet?',
      content: `Video streaming produces about <strong>36g CO₂ per hour</strong> — much less than people think. That's equivalent to driving 150 meters in a car.\n\nHowever, the total impact of digital infrastructure (data centers, networks, devices) accounts for about 3.7% of global emissions — similar to aviation.\n\n<strong>Context:</strong> One hour of streaming = 36g CO₂. One hour of AC = 820g CO₂. Driving 10 km = 1,920g CO₂. So digital habits matter, but transport and energy matter much more.`,
    },
  ];

  const myths = [
    {
      statement: 'Recycling is the most impactful thing I can do for the planet.',
      isTrue: false,
      explanation: 'While recycling helps, its impact is relatively small compared to reducing consumption, changing diet, or switching transport. Skipping one flight saves more CO₂ than recycling for 3 years. The priority order is: Refuse → Reduce → Reuse → Recycle.',
    },
    {
      statement: 'Electric cars are worse for the environment than petrol cars.',
      isTrue: false,
      explanation: 'Even accounting for battery production and India\'s coal-heavy grid, EVs produce 50-60% less lifecycle emissions than petrol cars. As the grid gets cleaner, this gap widens further.',
    },
    {
      statement: 'Individual actions don\'t matter — it\'s all about corporations.',
      isTrue: false,
      explanation: 'While systemic change is crucial, individual choices create market demand. When millions choose plant-based meals, companies change their offerings. Consumer choices drive 60-70% of global emissions when traced to final demand.',
    },
    {
      statement: 'A vegetarian diet in India has a significantly lower footprint than a meat-heavy diet.',
      isTrue: true,
      explanation: 'A vegetarian diet produces about 493 kg CO₂/year from food alone vs. 2,738 kg for a heavy meat diet — that\'s a 5.5× difference. India\'s traditional vegetarian cuisine is actually one of the most climate-friendly diets globally.',
    },
    {
      statement: 'Planting trees is enough to solve climate change.',
      isTrue: false,
      explanation: 'Trees are important but not sufficient. The world would need to plant 1 trillion trees to offset current emissions — and they take decades to grow. We also need to reduce emissions at source. Tree planting is a complement, not a replacement.',
    },
    {
      statement: 'Taking a train in India is 10× less carbon-intensive than flying.',
      isTrue: true,
      explanation: 'Indian Railways produces about 0.02 kg CO₂/km per passenger, compared to ~0.25 kg CO₂/km for domestic flights. That\'s actually 12.5× less carbon-intensive. Trains are one of the greenest long-distance options.',
    },
    {
      statement: 'Paper bags are always better for the environment than plastic bags.',
      isTrue: false,
      explanation: 'Paper bags require 4× more energy to manufacture and produce 70% more air pollution. They need to be reused 3-4 times to beat plastic. The best option is a reusable cloth bag used 100+ times.',
    },
    {
      statement: 'Buying local food always means lower emissions.',
      isTrue: false,
      explanation: 'Transportation accounts for only ~6% of food emissions. What you eat matters far more than where it comes from. A locally-produced beef steak has a much higher footprint than lentils shipped from another continent.',
    },
  ];

  const actionLinks = [
    {
      emoji: '☀️',
      title: 'Switch to Solar Energy',
      desc: 'Government subsidies available under PM Surya Ghar Yojana',
      url: 'https://www.pmsuryaghar.gov.in/',
    },
    {
      emoji: '🚌',
      title: 'Find Public Transit Routes',
      desc: 'Use Google Maps for metro, bus & train routes in your city',
      url: 'https://maps.google.com/',
    },
    {
      emoji: '🌱',
      title: 'Carbon Offset Projects',
      desc: 'Verified offsets through Gold Standard certified projects',
      url: 'https://www.goldstandard.org/',
    },
    {
      emoji: '⚡',
      title: 'EV Charging Stations',
      desc: 'Find nearest EV charging points across India',
      url: 'https://chargezone.in/',
    },
    {
      emoji: '🛒',
      title: 'Shop Sustainable Brands',
      desc: 'Directory of eco-friendly Indian brands',
      url: 'https://www.thebetterindia.com/',
    },
    {
      emoji: '🌳',
      title: 'Plant Trees with Grow-Trees',
      desc: 'Plant trees across India starting from ₹75',
      url: 'https://www.grow-trees.com/',
    },
  ];

  let openExplainer = null;
  let revealedMyths = new Set();

  function render() {
    const view = document.getElementById('view-content');
    view.innerHTML = `
      <div class="learn">
        <div class="view-header">
          <h1 class="view-header__title">Learn</h1>
        </div>

        <!-- Explainers -->
        <div class="animate-fade-in-up">
          <div class="learn__section-title mb-4">🧠 Understanding Your Impact</div>
          ${explainers.map(exp => `
            <div class="card explainer-card mb-3 ${openExplainer === exp.id ? 'explainer-card--open' : ''}" data-explainer="${exp.id}">
              <div class="explainer-card__header">
                <span class="explainer-card__icon">${exp.emoji}</span>
                <span class="explainer-card__title">${exp.title}</span>
                <span class="explainer-card__toggle">▼</span>
              </div>
              <div class="explainer-card__body">
                <div class="explainer-card__content">${exp.content}</div>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Myth Busters -->
        <div class="animate-fade-in-up delay-2">
          <div class="learn__section-title mb-4">🔍 Myth or Fact?</div>
          ${myths.map((myth, i) => `
            <div class="card myth-card mb-3 ${revealedMyths.has(i) ? 'myth-card--revealed' : ''}" data-myth="${i}">
              <div class="myth-card__statement">"${myth.statement}"</div>
              <div class="myth-card__buttons">
                <button class="btn btn-secondary btn--sm" data-answer="true" data-myth-idx="${i}">✅ True</button>
                <button class="btn btn-secondary btn--sm" data-answer="false" data-myth-idx="${i}">❌ False</button>
              </div>
              <div class="myth-card__verdict myth-card__verdict--${myth.isTrue ? 'true' : 'false'}">
                <div class="myth-card__verdict-label" style="color: ${myth.isTrue ? 'var(--accent-400)' : 'var(--coral-400)'}">
                  ${myth.isTrue ? '✅ TRUE' : '❌ FALSE'}
                </div>
                <div class="myth-card__explanation">${myth.explanation}</div>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Action Links -->
        <div class="animate-fade-in-up delay-3">
          <div class="learn__section-title mb-4">🚀 Take Action</div>
          <div class="flex flex-col gap-3">
            ${actionLinks.map(link => `
              <a class="action-link" href="${link.url}" target="_blank" rel="noopener noreferrer">
                <div class="action-link__icon">${link.emoji}</div>
                <div class="action-link__info">
                  <div class="action-link__title">${link.title}</div>
                  <div class="action-link__desc">${link.desc}</div>
                </div>
                <span class="action-link__arrow">→</span>
              </a>
            `).join('')}
          </div>
        </div>

        <!-- Data Transparency -->
        <div class="card animate-fade-in-up delay-4" style="padding: var(--space-5);">
          <div class="card__title mb-3">📊 Our Data Sources</div>
          <p class="text-sm text-secondary" style="line-height: 1.7;">
            EcoTrace uses emission factors from:
          </p>
          <ul style="list-style: none; padding: 0; margin-top: var(--space-3);">
            <li class="text-sm text-secondary mb-2">🔬 <strong>IPCC AR6</strong> — Intergovernmental Panel on Climate Change</li>
            <li class="text-sm text-secondary mb-2">🇮🇳 <strong>CEA India</strong> — Central Electricity Authority grid emission factors</li>
            <li class="text-sm text-secondary mb-2">📊 <strong>Carbon Trust</strong> — Product and activity lifecycle assessments</li>
            <li class="text-sm text-secondary mb-2">🌾 <strong>India GHG Programme</strong> — India-specific emission data</li>
          </ul>
          <p class="text-xs text-muted mt-3">
            All calculations are estimates based on averages. Individual footprints may vary based on specific circumstances, location, and behavior patterns.
          </p>
        </div>
      </div>
    `;

    bindEvents();
  }

  function bindEvents() {
    // Explainer toggles
    document.querySelectorAll('[data-explainer]').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.explainer;
        openExplainer = openExplainer === id ? null : id;
        render();
      });
    });

    // Myth busters
    document.querySelectorAll('[data-myth-idx]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.dataset.mythIdx);
        const userAnswer = btn.dataset.answer === 'true';
        const correct = myths[idx].isTrue === userAnswer;
        
        revealedMyths.add(idx);
        
        if (correct) {
          Animations.toast('Correct! 🎉', { type: 'success' });
        } else {
          Animations.toast('Not quite — read the explanation below!', { type: 'warning', emoji: '🤔' });
        }
        
        render();
      });
    });
  }

  return { render };
})();
