/** Shared win-animation phase timings (JS + CSS). */
export const WIN_ANIMATION_TIMING = {
  /** Grid removed; empty white box appears. */
  stripMs: 300,
  stripDurationS: 0.3,
  /** Brief hold on empty white box at puzzle size. */
  holdMs: 200,
  /** Resize white box to fit win content. */
  resizeMs: 2000,
  resizeDurationS: 2,
  /** Win copy fade-in (overlaps end of resize). */
  contentFadeMs: 600,
  contentFadeDelayMs: 1400,
  contentFadeDurationS: 0.6,
  contentFadeDelayS: 1.4,
  templateHideDurationS: 0.9
} as const;
