/** Base-4 spacing scale: 4 · 8 · 12 · 16 · 24 · 32. */
export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

/** Layout constants of the "extrato da casa" direction. */
export const layout = {
  /** Side margin of every screen. */
  gutter: 16,
  /** Gap between blocks. */
  blockGap: 16,
  /** Padding inside a block. */
  blockPadding: 16,
  /** Minimum height of a list row. */
  rowHeight: 56,
  /** Width of the app column and of the sheet on a wide screen. */
  maxContentWidth: 560,
  /** Smallest comfortable touch target. */
  touchTarget: 44,
} as const;
