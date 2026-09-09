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
