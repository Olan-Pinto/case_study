# Phase 5C — Manual public-reputation collection

Use Google Maps manually for each Bedashing branch below. This is a user-validation worksheet, not an instruction to scrape Google Maps or use an API.

For each result, capture only:

1. Rating (for example, `4.6`)
2. Review count (for example, `798`)
3. The Google Maps place URL
4. The date checked (`YYYY-MM-DD`; use `2026-09-09` if checked today)

If the result is ambiguous, duplicated, missing, or appears closed, write `AMBIGUOUS`, `DUPLICATE`, `NOT_FOUND`, or `CLOSED` instead of guessing. A Maps place must match the branch address/community—not merely the Bedashing brand name.

Paste your completed rows back in this format:

```text
branch_id | rating | review_count | google_maps_url | observed_at | note
```

| branch_id | branch / matching address | rating | review_count | Google Maps URL | observed_at | note |
|---|---|---:|---:|---|---|---|
| pinnacle_building | Pinnacle Building, Al Barsha 1, Dubai |  |  |  |  |  |
| golden_mile_galleria | Golden Mile Galleria, Palm Jumeirah, Dubai |  |  |  |  |  |
| indigo_central_5 | Indigo Central 5, Al Safa 2, Dubai |  |  |  |  |  |
| city_walk_building_18a | City Walk, Building 18A, Dubai |  |  |  |  |  |
| nad_al_sheba_mall | Nad Al Sheba Mall, Dubai |  |  |  |  |  |
| mirdif_35 | Mirdif 35, Mirdif, Dubai |  |  |  |  |  |
| al_husna_street | Al Husna Street, Al Falah, Abu Dhabi |  |  |  |  |  |
| zawaya_walk | Zawaya Walk, University City, Sharjah |  |  |  |  |  |
| misk_2 | Misk 2, Muwaileh Commercial, Sharjah |  |  |  |  |  |
| deerfields_mall | Deerfields Mall, Al Bahyah, Abu Dhabi |  |  |  |  |  |
| noya_plaza_mall | Noya Plaza Mall, Yas Island, Abu Dhabi |  |  |  |  |  |
| west_yas_plaza | West Yas Plaza, Yas Island, Abu Dhabi |  |  |  |  |  |
| khalifa_city_al_mireef | Al Mireef Street, Khalifa City, Abu Dhabi |  |  |  |  |  |
| zayed_international_airport | Zayed International Airport, Abu Dhabi |  |  |  |  |  |
| ict_c29_khalifa_park | ICT C-29 Khalifa Park Building, Abu Dhabi |  |  |  |  |  |
| abu_dhabi_unresolved | Shakhbout City, Abu Dhabi |  |  |  |  |  |
| nassib_bin_ahmed_al_humairi | Mohamed Bin Zayed City, Abu Dhabi |  |  |  |  |  |
| al_dhait_north | Al Dhait North, Ras Al Khaimah |  |  |  |  |  |
| al_taif_mall | Al Taif Mall, Fujairah |  |  |  |  |  |
| hamad_mohamed_thani_al_rumaithi | Rabdan, Abu Dhabi |  |  |  |  |  |
| al_rakb_street | Bani Yas, Abu Dhabi |  |  |  |  |  |
| saeed_bin_saif_al_falahi | Al Nahyan, Abu Dhabi |  |  |  |  |  |
| al_khaleej_al_arabi | Al Khaleej Al Arabi Street, Al Khalidiyah, Abu Dhabi |  |  |  |  |  |
| madinat_zayed_block_10 | Block 10, Madinat Zayed, Al Dhafra |  |  |  |  |  |

## Handling and limitations

- The subsequent snapshot will retain the provided Maps URL, observation date, and the `user_validated_google_maps` source ID for every usable record.
- Values are public-reputation signals only. They are not financial health, demand, revenue, or a closure decision.
- A value absent or ambiguous after manual validation stays absent; the health contract will withhold the branch score rather than impute it.
- Ratings can change. The model will expose its snapshot date and confidence rather than claim live status.
- `pinnacle_building` is a documented exception: the user confirmed the listing identity from its text, but its Google place pin is displaced and must not replace the user-validated branch coordinate. `zawaya_walk` is also user-confirmed from address and coordinate because its submitted URL has no embedded place coordinate.
