import type { EquityPoint } from "@/data/portfolio";

interface Props {
  points: EquityPoint[];
  /** Height of the chart in viewport units. Width = 100%. */
  heightVh?: number;
}

export function EquityCurve({ points, heightVh = 38 }: Props) {
  if (points.length < 2) return null;

  const W = 1000; // viewBox width — scales to container
  const H = 300;  // viewBox height
  const padX = 20;
  const padY = 30;

  const values = points.map((p) => p.returnPct);
  const minV = Math.min(...values, 0);
  const maxV = Math.max(...values, 0);
  const span = Math.max(maxV - minV, 0.001);

  const xAt = (i: number) =>
    padX + (i / (points.length - 1)) * (W - padX * 2);
  const yAt = (v: number) =>
    padY + (1 - (v - minV) / span) * (H - padY * 2);

  // Path for the line itself.
  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${xAt(i).toFixed(2)} ${yAt(p.returnPct).toFixed(2)}`)
    .join(" ");

  // Path for the area fill under the line (drops down to current zero baseline,
  // but only if zero is on-canvas — otherwise drops to bottom edge).
  const baselineY = minV <= 0 && maxV >= 0 ? yAt(0) : H - padY;
  const areaPath =
    `M ${xAt(0).toFixed(2)} ${baselineY.toFixed(2)} ` +
    points.map((p, i) => `L ${xAt(i).toFixed(2)} ${yAt(p.returnPct).toFixed(2)}`).join(" ") +
    ` L ${xAt(points.length - 1).toFixed(2)} ${baselineY.toFixed(2)} Z`;

  const lastReturn = points[points.length - 1].returnPct;
  const isUp = lastReturn >= 0;
  // Hero is supposed to feel quietly truthful — slight green even on a drawdown
  // is misleading. Use red-tinted ink when underwater, green when up.
  const inkColor = isUp ? "#22c55e" : "#ef4444";

  return (
    <div
      className="relative w-full"
      style={{ height: `${heightVh}vh` }}
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        <defs>
          <linearGradient id="curve-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={inkColor} stopOpacity="0.18" />
            <stop offset="100%" stopColor={inkColor} stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Zero baseline reference — only if zero is in the visible range. */}
        {minV <= 0 && maxV >= 0 && (
          <line
            x1={padX}
            x2={W - padX}
            y1={yAt(0)}
            y2={yAt(0)}
            stroke="#222"
            strokeWidth="1"
            strokeDasharray="3 4"
            vectorEffect="non-scaling-stroke"
          />
        )}
        <path d={areaPath} fill="url(#curve-fill)" />
        <path
          d={linePath}
          fill="none"
          stroke={inkColor}
          strokeWidth="2.2"
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}
