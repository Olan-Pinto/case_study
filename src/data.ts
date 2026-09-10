import rawSnapshot from '../data/processed/branches_snapshot_v1.json'
import rawNetworkMetrics from '../data/processed/network_metrics_v1.json'
import rawCompetitors from '../data/processed/competitors_snapshot_v1.json'
import rawCompetitorPressure from '../data/processed/competitor_pressure_v1.json'
import type { CompetitorPressureSnapshot, CompetitorSnapshot, NetworkMetrics, Snapshot } from './types'

export const snapshot = rawSnapshot as Snapshot
export const branches = snapshot.records
export const networkMetrics = rawNetworkMetrics as NetworkMetrics
export const competitorSnapshot = rawCompetitors as CompetitorSnapshot
export const activeCompetitors = competitorSnapshot.records.filter((record) => record.latitude !== null && record.longitude !== null && !record.status.includes('permanently_closed'))
export const competitorPressure = rawCompetitorPressure as CompetitorPressureSnapshot
