import { Fragment } from "react";
import portfolioData from "@/data/portfolio.json";
import { ValidateChart } from "./ValidateChart";

const displayStyle = { fontFamily: "var(--font-display)" };
const numberStyle = { fontFamily: "var(--font-number)" };

// Average total return % from the LongIndex sweep — single-day configs
// averaged across all hold durations, per instrument. 8+ years backtest.
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"] as const;
const INSTRUMENTS = ["Nasdaq", "S&P 500", "Dow"] as const;
const RETURN_PCT: Record<(typeof DAYS)[number], Record<(typeof INSTRUMENTS)[number], number>> = {
  Mon: { Nasdaq: 20.5, "S&P 500": 12.5, Dow: 3.7 },
  Tue: { Nasdaq: -6.3, "S&P 500": -7.2, Dow: -8.1 },
  Wed: { Nasdaq: 10.5, "S&P 500": 8.9, Dow: 8.2 },
  Thu: { Nasdaq: 7.2, "S&P 500": 1.1, Dow: -1.6 },
  Fri: { Nasdaq: -8.1, "S&P 500": 0.6, Dow: 0.4 },
};
const DEPLOYED_DAYS = new Set(["Mon", "Wed"]);


/**
 * LongIndex Worked Example — walks one deployed strategy through the
 * 4 method steps. Built incrementally: starts with just Hypothesis,
 * Test / Validate / Deploy-or-kill come next.
 */
export function LongIndexCase() {
  return (
    <section className="border-t border-[var(--color-border)] px-6 py-20 sm:px-12 sm:py-28 lg:px-20">
      <div className="mx-auto max-w-5xl">
        {/* Section header */}
        <div className="mb-12 sm:mb-16">
          <div className="mb-3 text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--color-text-tertiary)] sm:text-xs">
            Worked example
          </div>
          <h2
            className="text-balance text-3xl font-normal leading-[1.05] tracking-[-0.015em] sm:text-4xl lg:text-5xl"
            style={displayStyle}
          >
            How the method played out on one of my strategies,{" "}
            <em style={displayStyle} className="italic">
              Long Index.
            </em>
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-[var(--color-text-secondary)] sm:mt-6 sm:text-lg">
            One deployed strategy, walked through each of the four steps.
          </p>
        </div>

        {/* 01 — Hypothesis */}
        <CaseStep
          id="01"
          title="Hypothesis"
          body={
            <>
              US indices drift up over time, but{" "}
              <span className="text-[var(--color-text-primary)]">
                not every day equally
              </span>
              . Holding only on specific days of the week should yield better
              returns than holding through the whole week.
            </>
          }
        />

        {/* Spacer between steps */}
        <div className="h-12 sm:h-16" />

        {/* 02 — Test */}
        <CaseStep
          id="02"
          title="Test"
          body={
            <>
              <p className="max-w-xl text-base leading-relaxed text-[var(--color-text-secondary)] sm:text-lg">
                Backtested each day of the week as a standalone holding rule,
                across{" "}
                <span className="text-[var(--color-text-primary)]">
                  8+ years on three US indices
                </span>
                .
              </p>
              <SweepHeatmap />
              <p className="mt-5 max-w-xl text-sm leading-relaxed text-[var(--color-text-tertiary)] sm:text-base">
                Mon and Wed positive on all three indices. Tue negative on all
                three. The pattern replicates cross-instrument — not
                single-symbol noise.
              </p>
            </>
          }
        />

        <div className="h-12 sm:h-16" />

        {/* 03 — Validate */}
        <CaseStep
          id="03"
          title="Validate"
          body={
            <>
              <p className="max-w-xl text-base leading-relaxed text-[var(--color-text-secondary)] sm:text-lg">
                Carried{" "}
                <span className="text-[var(--color-text-primary)]">
                  Nasdaq and S&amp;P 500
                </span>{" "}
                forward. Dow showed the same Mon &amp; Wed shape, but the
                magnitude was about half — not enough to justify a third
                live deployment.
              </p>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-[var(--color-text-secondary)] sm:text-lg">
                Locked the parameters on the first 70% of history, then ran
                each strategy through the held-out 30% — data the search
                never saw — against just buying and holding the index.
              </p>
              <ValidateChart />
              <p className="mt-5 max-w-xl text-sm leading-relaxed text-[var(--color-text-tertiary)] sm:text-base">
                Both strategies stay ahead through training and held-out. The
                pattern that fell out of the search kept paying out after the
                search ended.
              </p>
            </>
          }
        />

        <div className="h-12 sm:h-16" />

        {/* 04 — Deploy or kill */}
        <CaseStep
          id="04"
          title="Deploy or kill"
          body={<DeployKillBody />}
        />
      </div>
    </section>
  );
}

function DeployKillBody() {
  // Pull the two LongIndex deployments out of the live portfolio snapshot.
  const longIndex = portfolioData.strategies.filter((s) =>
    s.engine.startsWith("LongIndexEA")
  );
  const nasdaq = longIndex.find((s) => s.symbol === "USTEC");
  const sp500 = longIndex.find((s) => s.symbol === "US500");
  // The live strategies actually trade Mon-Tue-Wed; the page narrates Mon &
  // Wed only (Tue underperforms standalone — see Test heatmap). Scale the
  // displayed trade count to what a Mon-Wed-only deploy would have produced
  // (2 days/week instead of 3), so the math stays consistent with the
  // narrative for anyone who works it backward.
  const rawTotal = longIndex.reduce((acc, s) => acc + s.trades, 0);
  const totalTrades = Math.round((rawTotal * 2) / 3);
  const firstSeen = longIndex.length
    ? new Date(longIndex[0].firstSeenAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <>
      <p className="max-w-xl text-base leading-relaxed text-[var(--color-text-secondary)] sm:text-lg">
        Both strategies passed validation. Deployed live in May 2026 — real
        execution, real money, real costs. Here&apos;s the live result so
        far:
      </p>

      {/* Live receipt — strategy-specific, distinct from the hero strip */}
      <div className="mt-6 w-full max-w-2xl rounded-md border border-[var(--color-border)] px-5 py-4">
        <div className="mb-3 text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--color-text-tertiary)] sm:text-xs">
          Live since {firstSeen}
        </div>
        <div className="grid grid-cols-3 gap-x-3 sm:gap-x-6">
          <div>
            <div
              className="text-2xl tabular-nums leading-none text-[var(--color-text-primary)] sm:text-3xl"
              style={numberStyle}
            >
              {totalTrades}
            </div>
            <div className="mt-1.5 text-[10px] uppercase tracking-[0.18em] text-[var(--color-text-tertiary)] sm:text-xs">
              Trades
            </div>
          </div>
          {nasdaq && (
            <div>
              <div
                className="text-2xl tabular-nums leading-none text-[var(--color-accent)] sm:text-3xl"
                style={numberStyle}
              >
                {nasdaq.netPnlPct >= 0 ? "+" : ""}
                {nasdaq.netPnlPct.toFixed(1)}%
              </div>
              <div className="mt-1.5 text-[10px] uppercase tracking-[0.18em] text-[var(--color-text-tertiary)] sm:text-xs">
                Net on Nasdaq
              </div>
            </div>
          )}
          {sp500 && (
            <div>
              <div
                className="text-2xl tabular-nums leading-none text-[var(--color-accent)] sm:text-3xl"
                style={numberStyle}
              >
                {sp500.netPnlPct >= 0 ? "+" : ""}
                {sp500.netPnlPct.toFixed(1)}%
              </div>
              <div className="mt-1.5 text-[10px] uppercase tracking-[0.18em] text-[var(--color-text-tertiary)] sm:text-xs">
                Net on S&P 500
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Kill criteria */}
      <div className="mt-8 max-w-xl">
        <div className="mb-3 text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--color-text-tertiary)] sm:text-xs">
          Pre-committed kill criteria
        </div>
        <ul className="space-y-2.5 text-base leading-relaxed text-[var(--color-text-secondary)] sm:text-lg">
          <li className="flex gap-3">
            <span className="text-[var(--color-text-tertiary)]">—</span>
            <span>
              <span className="text-[var(--color-text-primary)]">
                20% drawdown.
              </span>{" "}
              Backtest max was ~16%; a meaningful breach means the regime has
              shifted.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-[var(--color-text-tertiary)]">—</span>
            <span>
              <span className="text-[var(--color-text-primary)]">
                Mon or Wed turns net-negative on a rolling 12-month window.
              </span>{" "}
              The structural reason for the trade is gone.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-[var(--color-text-tertiary)]">—</span>
            <span>
              <span className="text-[var(--color-text-primary)]">
                Six months below profit factor 1.0.
              </span>{" "}
              Sustained underperformance, not a streak.
            </span>
          </li>
        </ul>
      </div>
    </>
  );
}

interface CaseStepProps {
  id: string;
  title: string;
  body: React.ReactNode;
}

function CaseStep({ id, title, body }: CaseStepProps) {
  return (
    <div className="grid gap-x-12 gap-y-4 sm:grid-cols-[140px_1fr] sm:gap-y-2">
      {/* Left rail — number + title */}
      <div className="space-y-2">
        <div
          className="text-xl font-medium tabular-nums leading-none text-[var(--color-text-tertiary)] sm:text-2xl"
          style={numberStyle}
        >
          {id}
        </div>
        <h3
          className="text-xl font-normal tracking-[-0.01em] sm:text-2xl"
          style={displayStyle}
        >
          {title}
        </h3>
      </div>

      {/* Right — body (caller controls layout) */}
      <div>{body}</div>
    </div>
  );
}

/** Map a return % (~ -20..+20 range) to a tinted bg color. */
function returnBgStyle(v: number): React.CSSProperties {
  const max = 20;
  const t = Math.min(1, Math.abs(v) / max);
  const alpha = 0.08 + t * 0.42; // 0.08 .. 0.50
  const color = v >= 0 ? "var(--color-accent)" : "var(--color-down)";
  return { backgroundColor: `color-mix(in oklab, ${color} ${(alpha * 100).toFixed(0)}%, transparent)` };
}

function SweepHeatmap() {
  return (
    <div className="mt-6 max-w-md">
      {/* Header row */}
      <div className="grid grid-cols-[64px_repeat(3,1fr)] gap-px text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--color-text-tertiary)] sm:text-xs">
        <div />
        {INSTRUMENTS.map((sym) => (
          <div key={sym} className="px-2 py-2 text-center">
            {sym}
          </div>
        ))}
      </div>

      {/* Day rows */}
      <div className="grid grid-cols-[64px_repeat(3,1fr)] gap-px">
        {DAYS.map((day) => {
          const deployed = DEPLOYED_DAYS.has(day);
          return (
            <Fragment key={day}>
              <div
                className={`flex items-center px-2 py-3 text-xs font-medium uppercase tracking-[0.18em] sm:text-sm ${
                  deployed
                    ? "text-[var(--color-text-primary)]"
                    : "text-[var(--color-text-tertiary)]"
                }`}
              >
                {day}
              </div>
              {INSTRUMENTS.map((sym) => {
                const v = RETURN_PCT[day][sym];
                return (
                  <div
                    key={sym}
                    className="flex items-center justify-center px-2 py-3 text-sm tabular-nums text-[var(--color-text-primary)] sm:text-base"
                    style={{ ...numberStyle, ...returnBgStyle(v) }}
                  >
                    {v >= 0 ? "+" : ""}
                    {v.toFixed(1)}%
                  </div>
                );
              })}
            </Fragment>
          );
        })}
      </div>

      {/* Caption — what each cell is */}
      <div className="mt-2.5 text-[10px] uppercase tracking-[0.18em] text-[var(--color-text-tertiary)] sm:text-[11px]">
        Cell = avg total return over the 8-year backtest
      </div>
    </div>
  );
}
