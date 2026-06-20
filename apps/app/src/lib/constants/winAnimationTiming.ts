/** Shared win-animation timings (JS phases + CSS transitions). */
export const WIN_ANIMATION_TIMING = {
  /** When the white box begins centering. */
  centerPhaseMs: 1700,
  /** When the victory overlay fades in. */
  revealPhaseMs: 2400,
  /** Per-cell ripple stagger (multiplied by Manhattan distance from center). */
  cellStaggerMs: 120,
  collapseDurationS: 1.6,
  centerSettleDurationS: 0.45,
  revealFadeDurationS: 1.2,
  expandDurationS: 0.55,
  templateHideDurationS: 0.9,
  cellDurationS: 1.2,
  lineFadeDurationS: 0.6
} as const;
