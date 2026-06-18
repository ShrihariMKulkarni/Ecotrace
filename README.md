# Ecotrace
I built an AI-powered carbon footprint tracker — and here's everything I learned 🌿

Meet EcoTrace.

The problem: Most people care about the environment but have zero idea how their daily choices translate into actual CO₂. Ordering food, taking an Uber, skipping the gym cycle — it all adds up, invisibly.

So I built something that makes it visible.

━━━━━━━━━━━━━━━
🔍 WHAT IT DOES
━━━━━━━━━━━━━━━

→ Asks 7 onboarding questions and instantly estimates your annual carbon footprint
→ Lets you log daily activities with one tap (commute, meals, energy use)
→ Uses AI to generate a personalized weekly "carbon story" — a narrative of your impact
→ Shows you an effort vs. impact matrix: which changes actually move the needle
→ Runs locally on India-specific emission factors (not US/EU averages)

━━━━━━━━━━━━━━━
⚙️ HOW I BUILT IT
━━━━━━━━━━━━━━━

I used Google Antigravity + Claude API for the AI personalization layer. The entire UI was prompted — animated CO₂ gauge ring, swipeable insight cards, streak challenges — no manual pixel pushing.

The wildest part? The "what-if simulator" ("if I stop flying for 1 year, my footprint drops by X%") took me 20 minutes to build with the right prompt.

Hardest challenge: Getting India-specific carbon emission factors right. Most open datasets are built for Western consumption patterns. I had to cross-reference IPCC + MoEFCC data manually.

━━━━━━━━━━━━━━━
💡 WHAT I LEARNED
━━━━━━━━━━━━━━━

1. Prompting is a design skill, not just a tech skill
2. The best AI products are invisible — the user should feel the insight, not the model
3. India-specific context changes everything. Generic ≠ useful.

━━━━━━━━━━━━━━━

This project showed me that the future of building isn't about writing more code — it's about asking better questions.

If you're building for sustainability, AI, or just love seeing ideas ship fast — let's connect 🙌

🔗 Live demo:https://ecotrace12.netlify.app/
