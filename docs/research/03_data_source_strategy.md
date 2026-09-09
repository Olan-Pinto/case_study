# Data source and provenance strategy

## Source order and collection policy

Use official Bedashing pages/booking/venue directories first for branches; official competitor locators next; then Overture Places and OpenStreetMap as discovery/reconciliation candidates. Preserve raw downloaded inputs outside Git, normalize deterministically, and commit only a small reviewer-safe processed snapshot whose license permits it. Never scrape Google Maps.

**Project rule:** every external factual input used in the product must have a durable entry in `docs/research/source_registry.csv` before it appears in a processed snapshot. The entry must record a stable source ID, exact URL, publisher, access date, fields used, collection method, reliability tier, freshness, license/usage consideration, limitation, and transformation note. Derived records must retain the relevant source IDs; snapshot manifests retain the source and transformation versions. This registry is the future README and evidence-surface source of truth.

Overture publishes monthly GeoParquet and explicitly warns that Places can contain duplicates, junk, and incomplete properties; its source/confidence fields must therefore be retained and filtered. [Overture Places guide](https://docs.overturemaps.org/guides/places/), [data access guide](https://docs.overturemaps.org/getting-data/), accessed 2026-09-08. OSM is ODbL and requires attribution/license review. [OSM copyright](https://www.openstreetmap.org/copyright/), accessed 2026-09-08.

## Proposed source-to-field mapping

| Dataset | Primary source | Fields | Limitation / treatment |
|---|---|---|---|
| Branches | Bedashing locator/Zenoti; venue pages | name, address, status, hours, services | Official locator needs Phase 1 extraction; maintain alternatives |
| Coordinates | Official address geocoded/reconciled against OSM/Overture | lat/lon, coordinate certainty | Manual review when disagreement >100m |
| Competitors | Official locator; Overture/OSM candidates | entity, location, category | Discovery results are not truth; de-duplicate and classify |
| Built environment | Overture Places/Buildings and OSM context | POI mix, urban context, roads | Coverage/completeness differs by area |
| Public reputation | Permitted public source or manually evidenced record | rating, count, observed date | Not financial health; no prohibited scraping |
| UAE public statistics | Government portal by available geography | population/context variable | Must be geographically compatible and license-checked |

Live source check: Statistics Centre – Abu Dhabi publishes a Statistical Yearbook with regional population-density tables, but the discovered table is historical (through 2016) and is not yet an H3/community-ready demand input. [SCAD yearbook](https://scad.gov.ae/documents/20122/1043412/Statistical%2520Yearbook%2520of%2520Abu%2520Dhabi_2020_Annual_Yearly_en.pdf/68b923b8-e4f2-3fe5-f922-11f60f9ddff4?t=1677214811571), accessed 2026-09-08. **LIMITATION:** do not use it as a current fine-grained demand score without a compatible current boundary/data release. Start with carefully disclosed built-environment proxies instead.

## Confidence contract

Each source record has `source_id`, tier (1–5), accessed/updated dates, license note, extraction method, field coverage, and evidence URL. Entity confidence combines reliability, freshness, corroboration, completeness, and coordinate certainty. Never average incompatible facts: record `preferred_value`, alternates, reconciliation rationale, and confidence.

## Snapshot structure (later)

`data/raw/` and `data/interim/` are ignored; `data/reference/` is small, licensed static reference data; `data/processed/` is versioned only when intentionally required by the reviewer experience. `snapshot_manifest.json` will capture source registry IDs, code/model versions, row counts, checksum, generated date, and license attribution.
