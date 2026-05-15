"use client";

import { useState } from "react";
import validateCurves from "@/data/validate-curves.json";

const numberStyle = { fontFamily: "var(--font-number)" };

type InstanceKey = keyof typeof validateCurves.instances;

const TABS: { key: InstanceKey; label: string }[] = [
  { key: "nasdaq" as InstanceKey, label: "Nasdaq" },
  { key: "sp500" as InstanceKey, label: "S&P 500" },
];

export function ValidateChart() {
  const [activeKey, setActiveKey] = useState<InstanceKey>("nasdaq" as InstanceKey);
  const { dates, oos_cutoff, starting_balance, instances } = validateCurves;
  const active = instances[activeKey];

  const n = dates.length;
  const oosIdx = dates.findIndex((d) => d >= oos_cutoff);

  // Y range — fixed across both tabs so toggling doesn't make the axis jump
  let yMin = Infinity;
  let yMax = -Infinity;
  for (const key of Object.keys(instances) as InstanceKey[]) {
    const inst = instances[key];
    for (const v of inst.strategy.values) {
      if (v < yMin) yMin = v;
      if (v > yMax) yMax = v;
    }
    for (const v of inst.buy_and_hold.values) {
      if (v < yMin) yMin = v;
      if (v > yMax) yMax = v;
    }
  }
  yMin = Math.min(yMin, starting_balance) * 0.95;
  yMax = yMax * 1.05;

  const W = 640;
  const H = 220;
  const padL = 44;
  const padR = 12;
  const padT = 14;
  const padB = 28;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const x = (i: number) => padL + (i / (n - 1)) * innerW;
  const y = (v: number) => padT + (1 - (v - yMin) / (yMax - yMin)) * innerH;
  const buildPath = (values: number[]) =>
    values.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");

  // Year ticks (every other year)
  const yearTicks: { year: number; i: number }[] = [];
  let lastYear = -1;
  dates.forEach((d, i) => {
    const yr = parseInt(d.slice(0, 4), 10);
    if (yr !== lastYear) {
      yearTicks.push({ year: yr, i });
      lastYear = yr;
    }
  });
  const yearTicksToDraw = yearTicks.filter((_, i) => i % 2 === 0);

  // Y ticks
  const span = yMax - yMin;
  const yTickStep = span > 25000 ? 10000 : span > 12000 ? 5000 : 2000;
  const yTicks: number[] = [];
  for (let v = Math.ceil(yMin / yTickStep) * yTickStep; v <= yMax; v += yTickStep) {
    yTicks.push(v);
  }

  return (
    <div className="mt-6 w-full">
      {/* Toggle + legend on one row */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-y-2">
        <div className="inline-flex rounded-md border border-[var(--color-border)] p-0.5">
          {TABS.map((tab) => {
            const isActive = tab.key === activeKey;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveKey(tab.key)}
                className={`rounded-sm px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] transition-colors sm:text-xs ${
                  isActive
                    ? "bg-[var(--color-text-primary)] text-[var(--color-bg)]"
                    : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--color-text-tertiary)] sm:text-xs">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-[2px] w-5 bg-[var(--color-accent)]" />
            Strategy
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-[2px] w-5 bg-[var(--color-text-tertiary)] opacity-70" />
            {active.label} buy-and-hold
          </span>
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" preserveAspectRatio="xMidYMid meet">
        {yTicks.map((v) => (
          <g key={v}>
            <line
              x1={padL}
              x2={W - padR}
              y1={y(v)}
              y2={y(v)}
              stroke="var(--color-border)"
              strokeWidth={0.5}
              strokeDasharray={v === starting_balance ? "0" : "2 3"}
            />
            <text
              x={padL - 6}
              y={y(v) + 3}
              textAnchor="end"
              fontSize="9"
              fill="var(--color-text-tertiary)"
              style={numberStyle}
            >
              ${(v / 1000).toFixed(0)}k
            </text>
          </g>
        ))}

        {oosIdx > 0 && (
          <>
            <line
              x1={x(oosIdx)}
              x2={x(oosIdx)}
              y1={padT}
              y2={H - padB}
              stroke="var(--color-text-primary)"
              strokeWidth={0.5}
              strokeDasharray="3 3"
              opacity={0.5}
            />
            <text
              x={x(oosIdx) + 6}
              y={padT + 10}
              fontSize="9"
              fill="var(--color-text-secondary)"
              style={{ letterSpacing: "0.15em", textTransform: "uppercase" }}
            >
              ← Trained · Held-out →
            </text>
          </>
        )}

        <path
          d={buildPath(active.buy_and_hold.values)}
          fill="none"
          stroke="var(--color-text-tertiary)"
          strokeWidth={1.5}
          strokeOpacity={0.75}
          strokeLinejoin="round"
        />
        <path
          d={buildPath(active.strategy.values)}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {yearTicksToDraw.map((t) => (
          <text
            key={t.year}
            x={x(t.i)}
            y={H - padB + 14}
            textAnchor="middle"
            fontSize="9"
            fill="var(--color-text-tertiary)"
            style={numberStyle}
          >
            {t.year}
          </text>
        ))}

        <text
          x={10}
          y={padT + innerH / 2}
          textAnchor="middle"
          fontSize="9"
          fill="var(--color-text-tertiary)"
          style={{ letterSpacing: "0.18em", textTransform: "uppercase" }}
          transform={`rotate(-90 10 ${padT + innerH / 2})`}
        >
          Equity
        </text>
      </svg>
    </div>
  );
}
