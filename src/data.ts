import rawSnapshot from '../data/processed/branches_snapshot_v1.json'
import type { Snapshot } from './types'

export const snapshot = rawSnapshot as Snapshot
export const branches = snapshot.records
