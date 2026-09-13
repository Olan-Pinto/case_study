import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { calculateFinancialWhatIf, financialReviewLabel } from '../src/financialWhatIf.js'

const config = JSON.parse(readFileSync(new URL('../config/financial_what_if_v1.json', import.meta.url), 'utf8'))

test('the assumed percentile is explicitly scoped to the active Bedashing portfolio', () => {
  assert.match(config.input.unit, /active Bedashing branches/)
  assert.match(config.input.comparison_scope, /Bedashing portfolio only/)
})

test('future operational and customer signals are declared but cannot affect the score', () => {
  const signals = new Map(config.future_internal_signals.map((signal) => [signal.signal_id, signal]))
  assert.deepEqual([...signals.keys()], [
    'bookings_capacity_utilization',
    'repeat_customer_rate',
    'customer_home_area_cross_branch_behavior',
  ])
  for (const signal of signals.values()) assert.equal(signal.status, 'NOT_AVAILABLE')
  assert.deepEqual(Object.keys(config.weights).sort(), ['assumed_cash_flow_percentile', 'selected_public_proxy_score'])
})

test('a strong assumed cash-flow percentile changes 35 to 57.5 without crossing HOLD', () => {
  const result = calculateFinancialWhatIf(35, 'HOLD_REVIEW', 80, config)
  assert.equal(result.what_if_score, 57.5)
  assert.equal(result.review_label, 'HOLD_REVIEW')
  assert.deepEqual(result.contributions, { assumed_cash_flow: 40, selected_public_proxy: 17.5 })
})

test('a weak assumed cash-flow percentile can move the same proxy into SHRINK review', () => {
  const result = calculateFinancialWhatIf(35, 'HOLD_REVIEW', 10, config)
  assert.equal(result.what_if_score, 22.5)
  assert.equal(result.review_label, 'SHRINK_REVIEW')
  assert.equal(result.label_changed, true)
})

test('displayed score boundaries match the existing branch-health labels', () => {
  assert.equal(financialReviewLabel(64.999, config.labels), 'PROTECT_REVIEW')
  assert.equal(financialReviewLabel(35, config.labels), 'HOLD_REVIEW')
  assert.equal(financialReviewLabel(34.994, config.labels), 'SHRINK_REVIEW')
})

test('invalid assumptions are rejected and the input score is not mutated', () => {
  assert.throws(() => calculateFinancialWhatIf(45, 'HOLD_REVIEW', 101, config), RangeError)
  const baseline = { score: 45 }
  calculateFinancialWhatIf(baseline.score, 'HOLD_REVIEW', 75, config)
  assert.deepEqual(baseline, { score: 45 })
})
