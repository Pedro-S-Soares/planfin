export type Rect = { x: number; y: number; w: number; h: number };

/** Worst aspect ratio of a row laid along a side of length `side` (Bruls et al.). */
function worst(row: number[], side: number): number {
  const s = row.reduce((a, b) => a + b, 0);
  const max = Math.max(...row);
  const min = Math.min(...row);
  return Math.max((side * side * max) / (s * s), (s * s) / (side * side * min));
}

/**
 * Squarified treemap: places items (sorted by value, largest first) in `rect`
 * so each tile's area is proportional to its value and tiles stay close to square.
 */
export function squarify<T>(items: { value: number; item: T }[], rect: Rect): (Rect & { item: T })[] {
  const positive = items.filter((i) => i.value > 0).sort((a, b) => b.value - a.value);
  const total = positive.reduce((a, i) => a + i.value, 0);
  if (total === 0 || rect.w <= 0 || rect.h <= 0) return [];

  const scale = (rect.w * rect.h) / total;
  const areas = positive.map((i) => i.value * scale);
  const out: (Rect & { item: T })[] = [];
  let free = { ...rect };
  let start = 0;

  while (start < areas.length) {
    const side = Math.min(free.w, free.h);
    let end = start + 1;
    while (
      end < areas.length &&
      worst(areas.slice(start, end + 1), side) <= worst(areas.slice(start, end), side)
    ) {
      end += 1;
    }

    const row = areas.slice(start, end);
    const rowArea = row.reduce((a, b) => a + b, 0);
    if (free.w >= free.h) {
      const width = rowArea / free.h;
      let y = free.y;
      row.forEach((a, i) => {
        const h = a / width;
        out.push({ x: free.x, y, w: width, h, item: positive[start + i].item });
        y += h;
      });
      free = { x: free.x + width, y: free.y, w: free.w - width, h: free.h };
    } else {
      const height = rowArea / free.w;
      let x = free.x;
      row.forEach((a, i) => {
        const w = a / height;
        out.push({ x, y: free.y, w, h: height, item: positive[start + i].item });
        x += w;
      });
      free = { x: free.x, y: free.y + height, w: free.w, h: free.h - height };
    }
    start = end;
  }

  return out;
}

/** Shrinks a rect by `gap / 2` on every side so neighbours get a `gap` px gutter. */
export function inset(r: Rect, gap: number): Rect {
  const g = gap / 2;
  return { x: r.x + g, y: r.y + g, w: Math.max(0, r.w - gap), h: Math.max(0, r.h - gap) };
}
