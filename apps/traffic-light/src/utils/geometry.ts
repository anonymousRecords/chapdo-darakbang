type GridOpts = {
  rows: number;
  cols: number;
  start: [number, number]; // [x0, y0]
  step: [number, number]; // [dx, dy]
};

export function makeGrid({
  rows,
  cols,
  start: [x0, y0],
  step: [dx, dy],
}: GridOpts) {
  const pts: Array<{ cx: number; cy: number; key: string }> = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cx = x0 + c * dx;
      const cy = y0 + r * dy;
      pts.push({ cx, cy, key: `${r}-${c}-${cx}-${cy}` });
    }
  }
  return pts;
}
