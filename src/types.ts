export type BranchStatus = 'observed_currently_listed' | 'candidate_needs_official_validation' | 'confirmed_closed'

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

export interface NetworkMetrics {
  model_id: string
  input_snapshot_id: string
  primary_radius_km: number
  radius_bands_km: number[]
  interpretation: string
  assumptions: string[]
  branch_metrics: BranchNetworkMetric[]
}
