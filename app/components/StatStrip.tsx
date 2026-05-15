import { portfolio } from "@/data/portfolio";

const numberStyle = { fontFamily: "var(--font-number)" };

interface StatProps {
  label: string;
  value: React.ReactNode;
  caption?: string;
  toned?: "up" | "down" | "neutral";
}

function Stat({ label, value, caption, toned = "neutral" }: StatProps) {
  const valueColor =
    toned === "up"
      ? "text-[var(--color-accent)]"
      : toned === "down"
      ? "text-[var(--color-down)]"
      : "text-[var(--color-text-primary)]";
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--color-text-tertiary)] sm:text-xs">
        {label}
      </div>
      <div
        className={`text-2xl font-medium tabular-nums leading-none tracking-tight sm:text-3xl ${valueColor}`}
        style={numberStyle}
      >
        {value}
      </div>
      {caption && (
        <div className="text-xs text-[var(--color-text-secondary)]">
          {caption}
        </div>
      )}
    </div>
  );
}

export function StatStrip() {
  const { totalTrades, profitFactor, benchmark, totalReturnPct } = portfolio;

  // "Return" cell: lead with the multiplier; show the market's own
  // return as a small inline suffix.
  let benchmarkValue: React.ReactNode = "—";
  let benchmarkToned: "up" | "down" | "neutral" = "neutral";
  if (benchmark) {
    let primary: string;
    if (benchmark.returnPct > 0.5) {
      const mult = totalReturnPct / benchmark.returnPct;
      primary = `${mult.toFixed(1)}×`;
      benchmarkToned = mult >= 1 ? "up" : "down";
    } else {
      const gap = totalReturnPct - benchmark.returnPct;
      const gapSign = gap >= 0 ? "+" : "";
      primary = `${gapSign}${gap.toFixed(1)}%`;
      benchmarkToned = gap >= 0 ? "up" : "down";
    }
    benchmarkValue = (
      <>
        {primary}{" "}
        <span className="text-xs font-normal text-[var(--color-text-secondary)] sm:text-sm">
          vs S&amp;P 500
        </span>
      </>
    );
  }

  return (
    <div className="mt-5 grid grid-cols-3 gap-6 border-t border-[var(--color-border)] pt-5 sm:mt-6 sm:gap-12 sm:pt-6">
      <Stat label="Trades" value={totalTrades.toLocaleString()} />
      <Stat label="Profit factor" value={profitFactor.toFixed(2)} />
      <Stat label="Return" value={benchmarkValue} toned={benchmarkToned} />
    </div>
  );
}
