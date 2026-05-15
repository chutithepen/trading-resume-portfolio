import { portfolio } from "@/data/portfolio";
import { EquityCurve } from "./EquityCurve";
import { StatStrip } from "./StatStrip";

function formatDateLong(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

const displayStyle = { fontFamily: "var(--font-display)" };
const numberStyle = { fontFamily: "var(--font-number)" };

export function Hero() {
  const {
    totalReturnPct,
    strategiesResearched,
    strategiesDeployed,
    strategiesKilled,
    equityCurve,
    startDate,
  } = portfolio;

  const isUp = totalReturnPct >= 0;
  const sign = isUp ? "+" : "";
  const returnColor = isUp ? "text-[var(--color-accent)]" : "text-[var(--color-down)]";

  return (
    <section className="relative flex min-h-screen flex-col justify-between px-6 pt-12 pb-8 sm:px-12 sm:pt-16 sm:pb-10 lg:px-20">
      {/* Top — headline + editorial subhead + stat row */}
      <div className="mx-auto w-full max-w-6xl">
        <h1
          className="text-balance text-center text-5xl font-normal leading-[0.95] tracking-[-0.02em] sm:text-6xl lg:text-7xl xl:text-[5.5rem]"
          style={displayStyle}
        >
          Analytical skill meets{" "}
          <em style={displayStyle} className="italic">
            AI&nbsp;fluency.
          </em>
        </h1>

        <p
          className="mx-auto mt-6 max-w-2xl text-balance text-center text-lg italic leading-snug text-[var(--color-text-secondary)] sm:mt-7 sm:text-xl"
          style={displayStyle}
        >
          A live quantitative trading system I built during my{" "}
          <span className="text-[var(--color-text-primary)]">career gap</span>{" "}
          using{" "}
          <span className="text-[var(--color-text-primary)]">Claude</span>.
        </p>

        <div className="mt-5 flex items-center justify-center gap-x-5 gap-y-2 text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--color-text-secondary)] sm:mt-6 sm:gap-x-8 sm:text-xs">
          <span>
            <span
              className="text-base font-semibold tabular-nums text-[var(--color-text-primary)] sm:text-lg"
              style={numberStyle}
            >
              {strategiesResearched}
            </span>{" "}
            researched
          </span>
          <span className="text-[var(--color-text-tertiary)]">·</span>
          <span>
            <span
              className="text-base font-semibold tabular-nums text-[var(--color-accent)] sm:text-lg"
              style={numberStyle}
            >
              {strategiesDeployed}
            </span>{" "}
            deployed
          </span>
          <span className="text-[var(--color-text-tertiary)]">·</span>
          <span>
            <span
              className="text-base font-semibold tabular-nums text-[var(--color-down)] sm:text-lg"
              style={numberStyle}
            >
              {strategiesKilled}
            </span>{" "}
            killed
          </span>
        </div>
      </div>

      {/* Middle — equity curve with floating headline number + stat strip */}
      <div className="mx-auto mt-8 w-full max-w-7xl sm:mt-10">
        <div className="mb-4 text-center text-[10px] font-medium uppercase tracking-[0.25em] text-[var(--color-text-tertiary)] sm:mb-5 sm:text-xs">
          Live Performance
        </div>
        <div className="mb-3 flex items-end justify-between px-1 sm:mb-4 sm:px-2">
          <div className="space-y-1">
            <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--color-text-tertiary)] sm:text-xs">
              Since
            </div>
            <div className="text-sm font-medium text-[var(--color-text-secondary)] sm:text-base">
              {formatDateLong(startDate)}
            </div>
          </div>
          <div className="text-right">
            <div
              className={`text-4xl font-medium leading-[0.95] tracking-[-0.025em] tabular-nums sm:text-5xl ${returnColor}`}
              style={numberStyle}
            >
              {sign}
              {totalReturnPct.toFixed(2)}%
            </div>
            <div className="mt-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--color-text-tertiary)] sm:text-xs">
              Total return
            </div>
          </div>
        </div>

        <EquityCurve points={equityCurve} heightVh={24} />
        <StatStrip />
      </div>

      {/* Bottom — scroll affordance */}
      <div className="mt-8 flex flex-col items-center gap-2 sm:mt-10">
        <a
          href="#method"
          className="group flex flex-col items-center text-sm text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)]"
        >
          <span>How I beat S&amp;P 500 using Data Analytics</span>
          <span className="mt-1.5 inline-block animate-bounce text-lg">
            ↓
          </span>
        </a>
      </div>
    </section>
  );
}
