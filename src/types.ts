export type BranchStatus = 'observed_currently_listed' | 'candidate_needs_official_validation' | 'confirmed_closed' | 'user_confirmed_permanently_closed'

export interface Branch {
  branch_id: string
  name: string
  emirate: string
  community: string
  address: string
  status: BranchStatus
  latitude: number | null
  longitude: number | null
  coordinate_confidence: string
  source_ids: string[]
  source_urls: string[]
  validation_needed: string[]
}

export interface Snapshot {
  snapshot_id: string
  generated_at: string
  purpose: string
  official_claimed_uae_lounges: number
  records: Branch[]
}

export interface ServiceRadiusMetric {
  radius_km: number
  overlapping_branch_count: number
  sum_pairwise_intersection_area_km2: number
  maximum_pairwise_overlap_coefficient: number
}

export interface BranchNetworkMetric {
  branch_id: string
  nearest_own_branch_id: string
  nearest_own_branch_distance_km: number
  service_radius_metrics: ServiceRadiusMetric[]
}

export interface PairwiseOverlap {
  branch_a_id: string
  branch_b_id: string
  radius_km: number
  distance_km: number
  intersection_area_km2: number
  overlap_coefficient: number
}

export interface NetworkMetrics {
  model_id: string
  input_snapshot_id: string
  primary_radius_km: number
  radius_bands_km: number[]
  interpretation: string
  assumptions: string[]
  branch_metrics: BranchNetworkMetric[]
  pairwise_overlaps: PairwiseOverlap[]
}

export interface Competitor {
  competitor_id: string
  brand: string
  name: string
  taxonomy_class: string
  emirate: string
  community: string
  address: string
  latitude: number | null
  longitude: number | null
  coordinate_confidence: string
  status: string
  source_ids: string[]
  source_urls: string[]
  limitations: string[]
}

export interface CompetitorSnapshot {
  snapshot_id: string
  records: Competitor[]
}

export interface CompetitorContribution {
  competitor_id: string
  distance_km: number
  similarity_weight: number
  contribution: number
}

export interface BranchCompetitorPressure {
  branch_id: string
  verified_competitor_pressure_lower_bound: number
  contributions: CompetitorContribution[]
  coverage_status: string
}

export interface CompetitorPressureSnapshot {
  model_id: string
  interpretation: string
  competitor_geo_coverage: { officially_listed_candidate_count: number; geocoded_verified_record_count: number }
  branch_pressure: BranchCompetitorPressure[]
}
