/** "Nice" axis ticks from 0 up to at least `max` (about `count` intervals). */
export function niceTicks(max: number, count = 4): number[] {
  if (max <= 0) return [0, 1];
  const raw = max / count;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => s >= raw) ?? raw;
  const ticks: number[] = [];
  for (let v = 0; v < max + step * 0.999; v += step) ticks.push(Math.round(v * 100) / 100);
  return ticks;
}

const r1 = (v: number) => Math.round(v * 10) / 10;

/** Bar with 4px rounded top corners, square at the baseline. */
export function barPath(x: number, y: number, w: number, h: number, radius = 4): string {
  if (h <= 0 || w <= 0) return "";
  const r = Math.min(radius, h, w / 2);
  return (
    `M${r1(x)},${r1(y + h)}V${r1(y + r)}Q${r1(x)},${r1(y)} ${r1(x + r)},${r1(y)}` +
    `H${r1(x + w - r)}Q${r1(x + w)},${r1(y)} ${r1(x + w)},${r1(y + r)}V${r1(y + h)}Z`
  );
}

export function rectPath(x: number, y: number, w: number, h: number): string {
  if (h <= 0 || w <= 0) return "";
  return `M${r1(x)},${r1(y)}h${r1(w)}v${r1(h)}h${r1(-w)}Z`;
}

export function circlePath(cx: number, cy: number, r: number): string {
  return `M${r1(cx - r)},${r1(cy)}a${r1(r)},${r1(r)} 0 1,0 ${r1(2 * r)},0a${r1(r)},${r1(r)} 0 1,0 ${r1(-2 * r)},0`;
}

export function polyline(points: [number, number][]): string {
  return points.length > 0 ? `M${points.map(([x, y]) => `${r1(x)},${r1(y)}`).join("L")}` : "";
}

export function hLines(values: number[], y: (v: number) => number, x0: number, x1: number): string {
  return values.map((v) => `M${r1(x0)},${r1(y(v))}H${r1(x1)}`).join("");
}
