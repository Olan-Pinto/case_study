import rawSnapshot from '../data/processed/branches_snapshot_v1.json'
import rawNetworkMetrics from '../data/processed/network_metrics_v1.json'
import type { NetworkMetrics, Snapshot } from './types'

export const snapshot = rawSnapshot as Snapshot
export const branches = snapshot.records
export const networkMetrics = rawNetworkMetrics as NetworkMetrics
