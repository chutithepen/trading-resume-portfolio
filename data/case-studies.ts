// Case studies — the "I'm an analyst" substance of the page.
// Each case has a HYPOTHESIS / RESEARCH / DECISION structure. For
// deployed cases, live stats pull from portfolio.json by matching the
// listed magic numbers. For killed cases, no live data — just the
// final reason it didn't make the cut.

export type CaseStudyStatus = "deployed" | "killed";

export interface CaseStudy {
  id: string;
  title: string;
  subtitle?: string;
  status: CaseStudyStatus;
  hypothesis: string;
  research: string;
  decision: string;
  /** Deployed: magics to pull live metrics for. Killed: empty. */
  magics?: number[];
  /** Killed-only one-line summary shown at the card's bottom. */
  killSummary?: string;
}

export const CASE_STUDIES: CaseStudy[] = [
  // ───────────── DEPLOYED ─────────────
  {
    id: "longindex",
    title: "LongIndex",
    subtitle: "Day-of-week effect on US equity indices",
    status: "deployed",
    magics: [20001, 20002],
    hypothesis:
      "Despite the persistent long bias in US equity indices, not every day " +
      "yields the same return. I hypothesized that day-of-week and time-of-day " +
      "effects materially shift the daily expected return — and that " +
      "systematically capturing only the favorable subset would outperform a " +
      "simple buy-and-hold.",
    research:
      "Analyzed every entry-and-exit time pair across 8 years of historical " +
      "price data on three US indices (Nasdaq, S&P 500, Dow). Split 70/30 " +
      "train/test, surfaced the winning config on the 70%, validated on the " +
      "held-out 30%. Mon-Wed showed materially stronger drift than Thu/Fri " +
      "across all three indices — and the dropout held cleanly out-of-sample.",
    decision:
      "Deployed on Nasdaq and S&P 500. Mon-Wed entries, intraday-only — no " +
      "overnight exposure. 1% risk per trade.",
  },
  {
    id: "rbo",
    title: "Range Breakout (RBO)",
    subtitle: "Continuation after overnight consolidation",
    status: "deployed",
    magics: [10001, 10002, 10003],
    hypothesis:
      "After overnight low-volatility consolidation, the breakout of that " +
      "range tends to extend rather than reverse — driven by new participants " +
      "reacting to the directional information first thing in their session. " +
      "I hypothesized the edge lives in the first hour or two after the " +
      "breakout fires, not later in the day.",
    research:
      "Ran a 25.7-million-config parameter sweep across 9 years of historical " +
      "data. Ranked surviving configs by parameter stability — only kept ones " +
      "surrounded by similarly-profitable neighbors on the heatmap, not " +
      "isolated spikes vulnerable to overfit. Cross-validated on three " +
      "different instruments to confirm the edge wasn't single-symbol noise.",
    decision:
      "Deployed three variants on complementary instruments — different " +
      "breakout windows and risk profiles. Closes intraday, no overnight " +
      "exposure. 1% risk per trade.",
  },
  {
    id: "bc",
    title: "Breakout Continuation (BC)",
    subtitle: "Momentum after a volatility extreme",
    status: "deployed",
    magics: [30002, 30003, 30004],
    hypothesis:
      "When price closes meaningfully beyond its recent volatility envelope, " +
      "short-term momentum tends to carry it further in the same direction for " +
      "a few more bars. I hypothesized a tight, time-stopped continuation " +
      "entry would capture that excess move while limiting downside from the " +
      "eventual reversal.",
    research:
      "Tested three different volatility-envelope signal families across " +
      "three indices. During parity testing between my research engine and " +
      "the live trading code, I caught a real lot-sizing bug — different " +
      "minimum-lot handling on each side was producing orphan trades on the " +
      "live side. Fixed before deploy; documented as a permanent test gate " +
      "for every future strategy.",
    decision:
      "Deployed on Nasdaq and Gold, session-restricted to the most active " +
      "hours. Hard max-hold cap so positions don't drift. 1% risk per trade.",
  },
  // ───────────── KILLED ─────────────
  {
    id: "mm",
    title: "Morning Momentum (MM)",
    subtitle: "Predict the day from its first few hours",
    status: "killed",
    hypothesis:
      "If price has already moved meaningfully in one direction by early " +
      "morning, the rest of the trading day will continue in the same " +
      "direction. I hypothesized that filtering for sufficient early-day " +
      "movement would predict the remaining session's drift.",
    research:
      "Ran a 1.4-million-config sweep across 7 indices and three direction " +
      "settings. Locked in the best train config, validated on held-out " +
      "out-of-sample data — surprisingly held BETTER than in training, which " +
      "is a textbook positive signal. Before deploying, I compared it " +
      "head-to-head against a much simpler 'always long during US session' " +
      "baseline on the same data.",
    decision:
      "KILLED. The morning-move filter added no edge beyond the simpler " +
      "baseline — same risk-adjusted return, fewer trades. The hypothesis " +
      "didn't actually exist as a separate edge from the broader day-of-week " +
      "pattern I'd already deployed elsewhere. Discipline mattered more than " +
      "the temptation to deploy another strategy.",
    killSummary: "1.4M configs swept · OOS held · killed for redundancy with an existing strategy",
  },
  {
    id: "mr",
    title: "Mean Reversion (MR)",
    subtitle: "Connors-style oversold rebound",
    status: "killed",
    hypothesis:
      "After a sharp price drop pushes an instrument beneath its recent range " +
      "while still in a longer-term uptrend, prices tend to mean-revert over " +
      "the next few days. I hypothesized capturing that bounce — with no stop " +
      "loss to cut the reversal short — would produce a high-win-rate, " +
      "low-volatility income strategy.",
    research:
      "2.9-million-config sweep on S&P 500 with cross-validation on Nasdaq. " +
      "Best configurations showed strong win rates and held out-of-sample. " +
      "Discovered an interesting nuance: removing the stop loss entirely " +
      "increased profitability because conventional stops were exiting before " +
      "the rebound could complete. Built a dedicated no-stop variant to test " +
      "this hypothesis.",
    decision:
      "KILLED. The edge was real and the win rate looked great — but the " +
      "absolute return on capital was too small to justify the operational " +
      "overhead of running it. The strategy made sense as one component in a " +
      "much larger multi-strategy portfolio; on its own it didn't clear the " +
      "bar. Documented the no-stop-loss learning for future use.",
    killSummary: "2.9M configs · edge confirmed · killed for insufficient absolute return",
  },
  {
    id: "us500-rbo",
    title: "RBO on S&P 500",
    subtitle: "Cross-instrument extension that didn't work",
    status: "killed",
    hypothesis:
      "The Range Breakout strategy worked on Nasdaq. The S&P 500 trades on " +
      "the same exchange, in the same hours, in the same asset class — so the " +
      "same edge should be available there. I wanted to confirm before adding " +
      "another live deployment.",
    research:
      "Ran the exhaustive parameter sweep on S&P 500 over the same 9-year " +
      "window I'd used for the Nasdaq version. Same anti-overfit gauntlet: " +
      "parameter stability, cross-validation, walk-forward.",
    decision:
      "KILLED. The strategy's annualized return on S&P 500 was about 3.4% — " +
      "well below the 12% you'd get from simply buying and holding the same " +
      "index over the same period. The intraday structure that creates the " +
      "Nasdaq edge doesn't survive on S&P 500. The bigger lesson banked: " +
      "cross-instrument assumptions need to be tested explicitly, not " +
      "extrapolated.",
    killSummary: "Exhaustive sweep · strategy underperformed simple buy-and-hold",
  },
];
