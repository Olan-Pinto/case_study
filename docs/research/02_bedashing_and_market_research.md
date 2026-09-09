# Bedashing and market research

## Confirmed current facts

| Finding | Evidence | Confidence |
|---|---|---|
| Official site states “24 lounges in the UAE.” | [Bedashing home](https://bedashingbeauty.com/), accessed 2026-09-08 | High for claimed count; individual list needs extraction |
| Site provides an official lounges locator and links to official Zenoti booking. Its server-rendered page exposes no usable lounge list. | [Lounges](https://bedashingbeauty.com/lounges/), accessed 2026-09-08 | High |
| Brand describes a premium, contemporary, women-focused, full-service beauty proposition. | [Home](https://bedashingbeauty.com/), [Who We Are](https://bedashingbeauty.com/who-we-are/), [How We Do It](https://bedashingbeauty.com/how-we-do-it/), accessed 2026-09-08 | High |
| It reports 2008 founding, Emirati identity, and Noor Al Tamimi as CEO/founder. | [Who We Are](https://bedashingbeauty.com/who-we-are/), accessed 2026-09-08 | High |

The official locator currently renders “Number Of Shops: 0” in accessible HTML, while the home page states 24 lounges. This is not a confirmed closure signal—it is a client-side/accessibility limitation. **VALIDATION NEEDED:** Phase 1 must collect the official booking/locator response or manual source evidence for each branch, retain raw source URLs, and reconcile its observed count with 24.

## Competitor taxonomy

1. Direct: premium full-service women’s beauty lounges/chains (weight 1.0).
2. Near-direct: premium nail/beauty lounges with adjacent services (0.7).
3. Local full-service women’s salons (0.45; quality/reputation can raise review priority).
4. Specialist/adjacent (hair-only, lash, spa; 0.2–0.35).
5. Low-relevance kiosks/barbers (0–0.1).

**ASSUMPTION:** named candidates—including Tips & Toes, Sisters Beauty Lounge, Pastels Salon, NStyle Beauty Lounge, and 1847 (adjacent/men’s)—are a *research seed list*, not verified competitors nor a scoring input until their current branch data and positioning are sourced. Do not use a raw salon count.

## Ratings

Do not scrape Google Maps. Phase 1 should use ratings only where terms and collection method permit, capture source/date/count, and calculate a Bayesian-adjusted score:

`adjusted = (n/(n+m))*rating + (m/(n+m))*peer_prior`

where `m` is a disclosed stabilizer chosen from peer review counts. Review volume is a confidence input; no review recency/velocity is inferred without a legally obtained timestamped feed.

## Visual direction

Use the warmth, editorial restraint, and premium-service confidence suggested by Bedashing—not the consumer marketing site. The internal workspace should favor map clarity, high information density, durable typography, and restrained brand-adjacent neutrals. It must not copy consumer assets or make unverified brand claims.
