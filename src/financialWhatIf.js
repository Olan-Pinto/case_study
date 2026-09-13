// @ts-check

/**
 * @typedef {{
 *   weights: { assumed_cash_flow_percentile: number, selected_public_proxy_score: number },
 *   labels: { protect_review_min: number, shrink_review_max_exclusive: number }
 * }} FinancialWhatIfConfig
 */

/** @param {number} score @param {FinancialWhatIfConfig['labels']} labels */
export function financialReviewLabel(score, labels) {
  const displayedScore = Number(score.toFixed(2))
  if (displayedScore >= labels.protect_review_min) return 'PROTECT_REVIEW'
  if (displayedScore < labels.shrink_review_max_exclusive) return 'SHRINK_REVIEW'
  return 'HOLD_REVIEW'
}

/**
 * Calculate a non-persistent financial sensitivity result. The caller's baseline
 * record is never mutated and the assumed percentile is never treated as evidence.
 * @param {number} publicProxyScore
 * @param {string} publicProxyLabel
 * @param {number} assumedCashFlowPercentile
 * @param {FinancialWhatIfConfig} config
 */
export function calculateFinancialWhatIf(publicProxyScore, publicProxyLabel, assumedCashFlowPercentile, config) {
  if (![publicProxyScore, assumedCashFlowPercentile].every(Number.isFinite)) throw new TypeError('Scores must be finite numbers.')
  if (publicProxyScore < 0 || publicProxyScore > 100) throw new RangeError('Public-proxy score must be between 0 and 100.')
  if (assumedCashFlowPercentile < 0 || assumedCashFlowPercentile > 100) throw new RangeError('Assumed cash-flow percentile must be between 0 and 100.')
  const weightTotal = config.weights.assumed_cash_flow_percentile + config.weights.selected_public_proxy_score
  if (Math.abs(weightTotal - 1) > 1e-9) throw new RangeError('Financial what-if weights must sum to 1.')

  const cashFlowContribution = assumedCashFlowPercentile * config.weights.assumed_cash_flow_percentile
  const publicProxyContribution = publicProxyScore * config.weights.selected_public_proxy_score
  const score = Number((cashFlowContribution + publicProxyContribution).toFixed(2))
  const reviewLabel = financialReviewLabel(score, config.labels)
  return {
    assumed_cash_flow_percentile: assumedCashFlowPercentile,
    selected_public_proxy_score: publicProxyScore,
    what_if_score: score,
    score_delta: Number((score - publicProxyScore).toFixed(2)),
    review_label: reviewLabel,
    label_changed: reviewLabel !== publicProxyLabel,
    contributions: {
      assumed_cash_flow: Number(cashFlowContribution.toFixed(2)),
      selected_public_proxy: Number(publicProxyContribution.toFixed(2)),
    },
  }
}
