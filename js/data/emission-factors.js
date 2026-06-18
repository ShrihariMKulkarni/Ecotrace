/* ═══════════════════════════════════════════════════════════
   EcoTrace — Emission Factors Database
   India-specific CO₂ emission factors
   Sources: IPCC AR6, India GHG Platform, CEA, Carbon Trust
   ═══════════════════════════════════════════════════════════ */

const EmissionFactors = (() => {

  // ── Transport (kg CO₂ per km per person) ──────────────
  const transport = {
    car_petrol:     0.192,   // Average petrol car India
    car_diesel:     0.171,   // Average diesel car India
    car_cng:        0.130,   // CNG car
    car_ev:         0.050,   // EV (India grid avg)
    carpool:        0.064,   // Car with 3 people
    bus:            0.030,   // Public bus per passenger
    metro:          0.025,   // Metro rail per passenger
    train:          0.020,   // Indian Railways per passenger
    auto_rickshaw:  0.080,   // Auto rickshaw
    two_wheeler:    0.060,   // Motorcycle/scooter
    ev_two_wheeler: 0.015,   // Electric two-wheeler
    bicycle:        0.000,
    walking:        0.000,
    domestic_flight: 0.255,  // Per km domestic flight
    intl_flight:     0.195,  // Per km international flight
  };

  // Average commute distances (km one-way) for India
  const avgCommuteKm = {
    short: 5,
    medium: 15,
    long: 30,
  };

  // ── Food (kg CO₂ per meal) ────────────────────────────
  const food = {
    vegan:        0.30,
    vegetarian:   0.45,
    pescatarian:  0.65,
    poultry:      0.85,   // Chicken/egg-based
    moderate_meat: 1.20,  // Mixed with some red meat
    heavy_meat:    2.50,  // Red meat dominant
    skipped:       0.00,
  };

  // Annual food footprint by diet type (kg CO₂/year, 3 meals/day)
  const annualFood = {
    vegan:         329,
    vegetarian:    493,
    pescatarian:   712,
    moderate_meat: 1314,
    heavy_meat:    2738,
  };

  // ── Home Energy (kg CO₂ per unit) ─────────────────────
  const energy = {
    electricity_kwh:  0.82,   // India grid avg (CEA 2023)
    solar_kwh:        0.04,   // Rooftop solar lifecycle
    lpg_cylinder:    42.50,   // Per 14.2kg cylinder
    piped_gas_m3:     2.00,   // Per cubic meter
    firewood_kg:      1.80,   // Per kg
  };

  // Average monthly electricity by household size (kWh)
  const avgMonthlyElectricity = {
    1: 80,
    2: 130,
    3: 180,
    4: 240,
    5: 300,
    6: 350,
  };

  // ── Lifestyle (kg CO₂ per item/event) ─────────────────
  const lifestyle = {
    new_clothing_item:   10,    // Average garment
    fast_fashion_item:   15,    // Fast fashion piece
    secondhand_clothing:  1,    // Thrift/secondhand
    smartphone:         70,     // Manufacturing + shipping
    laptop:            300,     // Manufacturing + shipping  
    online_delivery:     0.5,   // Per delivery (packaging + last mile)
    streaming_hour:      0.036, // Per hour of video streaming
    laundry_load:        0.6,   // Per machine wash + dry
    ac_hour:             0.82,  // Per hour of AC (1.5 ton)
    short_shower:        0.42,  // 5 min hot water (gas)
    long_shower:         1.00,  // 15 min hot water
    line_dry:           -0.3,   // Savings vs. dryer
    led_vs_incandescent: -0.05, // Per hour savings
    repair_item:        -5,     // Avg savings vs. new purchase
  };

  // ── Averages for Comparison ───────────────────────────
  const averages = {
    india:  1900,      // kg CO₂/year per capita
    global: 4700,      // kg CO₂/year per capita
    us:     14700,     // kg CO₂/year per capita  
    eu:     6500,      // kg CO₂/year per capita
    paris_target: 2100, // Per capita target for 2°C
    ideal:  2000,      // Sustainable living target
  };

  // ── Daily Activities (for tracker) ────────────────────
  // Returns kg CO₂ for a single occurrence
  const activities = {
    transport: [
      { id: 'walked',        label: 'Walked',          emoji: '🚶', co2: 0,     saving: true, defaultCO2: 2.88 },
      { id: 'cycled',        label: 'Cycled',           emoji: '🚲', co2: 0,     saving: true, defaultCO2: 2.88 },
      { id: 'bus',           label: 'Took Bus',         emoji: '🚌', co2: 0.45,  saving: true, defaultCO2: 2.88 },
      { id: 'metro',         label: 'Took Metro',       emoji: '🚇', co2: 0.38,  saving: true, defaultCO2: 2.88 },
      { id: 'train',         label: 'Took Train',       emoji: '🚂', co2: 0.30,  saving: true, defaultCO2: 2.88 },
      { id: 'auto',          label: 'Auto Rickshaw',    emoji: '🛺', co2: 1.20,  saving: false },
      { id: 'two_wheeler',   label: 'Two Wheeler',      emoji: '🛵', co2: 0.90,  saving: false },
      { id: 'car',           label: 'Drove Car',        emoji: '🚗', co2: 2.88,  saving: false },
      { id: 'carpool',       label: 'Carpooled',        emoji: '🚙', co2: 0.96,  saving: true, defaultCO2: 2.88 },
      { id: 'ev',            label: 'EV / E-Rickshaw',  emoji: '⚡', co2: 0.75,  saving: true, defaultCO2: 2.88 },
    ],
    food: [
      { id: 'vegan_meal',    label: 'Vegan Meal',       emoji: '🌱', co2: 0.30,  saving: true, defaultCO2: 1.20 },
      { id: 'veg_meal',      label: 'Vegetarian',       emoji: '🥗', co2: 0.45,  saving: true, defaultCO2: 1.20 },
      { id: 'fish_meal',     label: 'Fish/Seafood',     emoji: '🐟', co2: 0.65,  saving: true, defaultCO2: 1.20 },
      { id: 'chicken_meal',  label: 'Chicken/Egg',      emoji: '🍗', co2: 0.85,  saving: false },
      { id: 'red_meat',      label: 'Red Meat',         emoji: '🥩', co2: 2.50,  saving: false },
      { id: 'home_cooked',   label: 'Home Cooked',      emoji: '🏠', co2: 0.35,  saving: true, defaultCO2: 0.85 },
    ],
    home: [
      { id: 'ac_off',        label: 'AC Off Today',      emoji: '❄️', co2: -3.28, saving: true },
      { id: 'short_shower',  label: 'Short Shower',      emoji: '🚿', co2: 0.42,  saving: true, defaultCO2: 1.00 },
      { id: 'line_dry',      label: 'Line Dried',        emoji: '👕', co2: -0.30, saving: true },
      { id: 'lights_off',    label: 'Lights Off Early',  emoji: '💡', co2: -0.20, saving: true },
      { id: 'no_geyser',     label: 'No Geyser/Heater',  emoji: '🔥', co2: -1.50, saving: true },
      { id: 'fan_only',      label: 'Fan Only (No AC)',   emoji: '🌀', co2: -2.50, saving: true },
    ],
    lifestyle: [
      { id: 'no_delivery',   label: 'No Deliveries',    emoji: '📦', co2: -0.50, saving: true },
      { id: 'secondhand',    label: 'Bought Used',      emoji: '♻️', co2: -9.00, saving: true },
      { id: 'repaired',      label: 'Repaired Item',    emoji: '🔧', co2: -5.00, saving: true },
      { id: 'reusable_bag',  label: 'Reusable Bag',     emoji: '🛍️', co2: -0.03, saving: true },
      { id: 'less_screen',   label: 'Less Screen Time',  emoji: '📱', co2: -0.10, saving: true },
      { id: 'local_food',    label: 'Bought Local',      emoji: '🌾', co2: -0.30, saving: true },
    ]
  };

  // Onboarding question mappings
  const onboardingTransport = {
    car:          { annual: 365 * 2.88 },       // Daily car commute
    two_wheeler:  { annual: 365 * 0.90 },
    bus:          { annual: 365 * 0.45 },
    metro:        { annual: 365 * 0.38 },
    train:        { annual: 300 * 0.30 },       // ~300 working days
    auto:         { annual: 300 * 1.20 },
    cycle:        { annual: 0 },
    walk:         { annual: 0 },
    wfh:          { annual: 0 },
  };

  const onboardingFlights = {
    0:  0,
    1:  125 * 2,    // 1 domestic round trip
    2:  125 * 4,    // 2 domestic round trips
    3:  125 * 6,
    5:  125 * 10,
    10: 125 * 14 + 600 * 2,  // Mix of domestic + 1 international
  };

  const onboardingShopping = {
    minimal:   50,     // Very few purchases
    moderate:  200,    // Average shopping
    frequent:  500,    // Frequent shopping
    heavy:     1000,   // Heavy consumer
  };

  return {
    transport, food, energy, lifestyle, averages,
    activities, avgCommuteKm, avgMonthlyElectricity,
    annualFood, onboardingTransport, onboardingFlights, onboardingShopping
  };
})();
