"""Export a portfolio snapshot from MT5 to data/portfolio.json.

Includes ONLY Strategy Lab deployment magics — manual/legacy trades are
excluded so the hero stats reconcile cleanly with the per-card case-study
metrics (every card's trade count + P&L sums to the hero totals).

Run when you want the resume page to reflect fresh numbers:
    python scripts/export.py

Pipeline:
  1. Connect to MT5.
  2. Read the Strategy Lab magic-numbers roster from lab.sqlite.
  3. deploy_date = earliest magic_numbers.first_seen_at (= when systematic
     deployment began).
  4. Pull every deal on a Strategy Lab magic since deploy_date.
  5. Build daily cumulative-P&L curve, max DD, win rate, profit factor.
  6. Group by magic for per-strategy aggregates.
  7. Write data/portfolio.json as percentages of a fixed $5k baseline.
"""
from __future__ import annotations

import datetime as dt
import json
import sqlite3
from dataclasses import dataclass
from pathlib import Path

import MetaTrader5 as mt5


# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

REPO_ROOT = Path(__file__).resolve().parents[1]
OUT_PATH = REPO_ROOT / "data" / "portfolio.json"

LAB_SQLITE = Path("d:/01.Documents/11.Trading Career/Strategy Lab/data/lab.sqlite")
# US500 M1 parquet for the SPX benchmark comparison. Strategy Lab's M1
# file is fresh (rebuilt daily by MT5 connection). The top-level
# data/raw/D1/US500.parquet was 2 months stale — don't use it.
SPX_PARQUET = Path("d:/01.Documents/11.Trading Career/Strategy Lab/data/raw/US500.parquet")

# All three counts derive from lab.sqlite:
#   researched = total sweep runs
#   deployed   = active (non-retired) deployments
#   killed     = researched - deployed (sweeps that didn't make it live)

# Resume narrative anchor — "I deployed $5k of working capital and ran
# strategies on it". Used as the % denominator regardless of when capital
# was actually deposited. Matches the user's stated mental model.
STARTING_CAPITAL_USD = 5000.0

DEAL_TYPE_BALANCE = 2  # mt5.DEAL_TYPE_BALANCE — deposits/withdrawals


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

@dataclass
class Deal:
    ticket: int
    time: dt.datetime
    symbol: str
    magic: int
    type: int     # 0=buy, 1=sell, 2=balance op
    entry: int    # 0=in (opening), 1=out (closing), 2=inout, 3=out_by
    profit: float
    commission: float
    swap: float
    volume: float

    @property
    def net_pnl(self) -> float:
        return self.profit + self.commission + self.swap

    @property
    def is_close(self) -> bool:
        """True if this deal closed a position (carries the realized P&L).
        Round-turn trade count = number of close deals, NOT total deal count.
        """
        return self.entry == 1


def compute_spx_benchmark(start_date: dt.date, end_date: dt.date) -> dict | None:
    """Buy-and-hold S&P 500 return over [start_date, end_date], in %.
    Reads Strategy Lab's US500 M1 parquet (kept fresh via MT5 pull).
    Picks the FIRST and LAST close in window — open of period vs close
    of period. Returns None if parquet missing.
    """
    if not SPX_PARQUET.exists():
        print(f"  (SPX benchmark: parquet missing at {SPX_PARQUET})")
        return None
    try:
        import pandas as pd
    except ImportError:
        return None
    df = pd.read_parquet(SPX_PARQUET)
    df.index = pd.to_datetime(df.index, utc=True)
    in_window = df.loc[
        pd.Timestamp(start_date, tz="UTC"):pd.Timestamp(end_date + dt.timedelta(days=1), tz="UTC")
    ]
    if len(in_window) < 2:
        print(f"  (SPX benchmark: only {len(in_window)} bars in window)")
        return None
    start_close = float(in_window["close"].iloc[0])
    end_close = float(in_window["close"].iloc[-1])
    ret_pct = (end_close - start_close) / start_close * 100.0
    return {
        "returnPct":    round(ret_pct, 3),
        "windowStart":  in_window.index[0].date().isoformat(),
        "windowEnd":    in_window.index[-1].date().isoformat(),
        "startClose":   round(start_close, 2),
        "endClose":     round(end_close, 2),
    }


def derive_counts_from_db() -> dict:
    """Pull researched + deployed counts from lab.sqlite.
       researched = total rows in `sweeps` (every distinct sweep run)
       deployed   = rows in `deployment_log` where retired_at IS NULL
    """
    if not LAB_SQLITE.exists():
        return {"researched": 0, "deployed": 0}
    con = sqlite3.connect(str(LAB_SQLITE))
    cur = con.cursor()
    cur.execute("SELECT COUNT(*) FROM sweeps")
    researched = int(cur.fetchone()[0])
    cur.execute("SELECT COUNT(*) FROM deployment_log WHERE retired_at IS NULL")
    deployed = int(cur.fetchone()[0])
    con.close()
    return {"researched": researched, "deployed": deployed}


def load_strategy_lab_magics() -> tuple[dict[int, dict], dt.datetime | None]:
    """Read Strategy Lab magics from lab.sqlite (required for Option A —
    overall stats are filtered to these magics). Returns ({magic: meta},
    earliest deploy datetime). meta has name/engine/symbol/firstSeenAt.
    Raises if DB missing — we can't run without it under Option A.
    """
    if not LAB_SQLITE.exists():
        raise FileNotFoundError(f"lab.sqlite not at {LAB_SQLITE}")
    con = sqlite3.connect(str(LAB_SQLITE))
    cur = con.cursor()
    cur.execute("""
        SELECT m.magic, m.first_seen_at, sp.display_name, sp.ea_version, sp.symbol
        FROM magic_numbers m
        LEFT JOIN strategy_profiles sp ON sp.id = m.profile_id
        WHERE m.origin = 'deployment'
        ORDER BY m.first_seen_at
    """)
    magics: dict[int, dict] = {}
    earliest: dt.datetime | None = None
    for magic, first_seen, name, engine, symbol in cur.fetchall():
        ts = dt.datetime.fromisoformat(first_seen.replace("Z", "+00:00"))
        ts_naive = ts.replace(tzinfo=None)
        if earliest is None or ts_naive < earliest:
            earliest = ts_naive
        magics[int(magic)] = {
            "name":        name or f"Magic {magic}",
            "engine":      engine or "",
            "symbol":      symbol or "",
            "firstSeenAt": first_seen,
        }
    con.close()
    return magics, earliest


def fetch_all_deals() -> list[Deal]:
    now = dt.datetime.now()
    start = now - dt.timedelta(days=5 * 365)
    raw = mt5.history_deals_get(start, now)
    if raw is None:
        return []
    deals = [
        Deal(
            ticket=d.ticket,
            time=dt.datetime.fromtimestamp(d.time),
            symbol=d.symbol,
            magic=d.magic,
            type=d.type,
            entry=d.entry,
            profit=d.profit,
            commission=d.commission,
            swap=d.swap,
            volume=d.volume,
        )
        for d in raw
    ]
    deals.sort(key=lambda x: x.time)
    return deals


def reconstruct_balance_at(target: dt.datetime, current_balance: float, deals: list[Deal]) -> float:
    """Walk back from current_balance, subtracting every deal AFTER target.
    Includes trade deals (net_pnl) AND balance ops (profit field is the
    deposit/withdrawal amount).
    """
    delta_after = 0.0
    for d in deals:
        if d.time > target:
            if d.type == DEAL_TYPE_BALANCE:
                delta_after += d.profit
            else:
                delta_after += d.net_pnl
    return current_balance - delta_after


def build_equity_curve_pct(
    trade_deals: list[Deal], baseline: float, deploy_date: dt.datetime
) -> tuple[list[dict], float]:
    """Daily cumulative-P&L curve, expressed as % of a fixed baseline.
    Also returns the max drawdown observed on the curve, in percentage
    points (e.g. -8.5 means equity dropped 8.5pp below its running peak)."""
    end_day = dt.datetime.now().date()
    cur_day = deploy_date.date()
    cum_pnl = 0.0
    deal_iter = iter(trade_deals)
    next_deal = next(deal_iter, None)

    curve: list[dict] = []
    peak = 0.0
    max_dd = 0.0   # most-negative running gap below peak (in pct points)
    while cur_day <= end_day:
        eod = dt.datetime.combine(cur_day, dt.time(23, 59, 59))
        while next_deal is not None and next_deal.time <= eod:
            cum_pnl += next_deal.net_pnl
            next_deal = next(deal_iter, None)
        ret_pct = cum_pnl / baseline * 100.0
        if ret_pct > peak:
            peak = ret_pct
        dd = ret_pct - peak    # negative or zero
        if dd < max_dd:
            max_dd = dd
        curve.append({"date": cur_day.isoformat(), "returnPct": round(ret_pct, 3)})
        cur_day += dt.timedelta(days=1)
    return curve, round(max_dd, 3)


def per_strategy_stats(trade_deals: list[Deal], magic_map: dict[int, dict], denom: float) -> list[dict]:
    """Group all trade deals by magic, return per-strategy stats. Magics
    found in lab.sqlite use the stored display name; others use defaults.

    `trades` counts CLOSE deals only — each open/close pair is one round-turn
    trade. Sum of per-strategy trades equals the hero `totalTrades`.
    """
    by_magic: dict[int, list[Deal]] = {}
    for d in trade_deals:
        by_magic.setdefault(d.magic, []).append(d)
    rows = []
    for magic in sorted(by_magic.keys()):
        ds = by_magic[magic]
        close_deals = [d for d in ds if d.is_close]
        wins = sum(1 for d in close_deals if d.net_pnl > 0)
        total = len(close_deals)
        net = sum(d.net_pnl for d in ds)  # all deals — entry commissions matter
        meta = magic_map.get(magic, {})
        # Default name: "Manual" for magic 0, "Magic <N>" otherwise
        default_name = "Manual" if magic == 0 else f"Magic {magic}"
        rows.append({
            "magic":       magic,
            "name":        meta.get("name") or default_name,
            "engine":      meta.get("engine", ""),
            "symbol":      meta.get("symbol", ""),
            "firstSeenAt": meta.get("firstSeenAt", ""),
            "trades":      total,
            "wins":        wins,
            "winRatePct":  round(wins / total * 100, 1) if total else 0.0,
            "netPnlPct":   round(net / denom * 100, 3),
            "fromStrategyLab": magic in magic_map,
        })
    return rows


def fetch_open_positions() -> list[dict]:
    raw = mt5.positions_get()
    if raw is None:
        return []
    return [
        {
            "ticket":    p.ticket,
            "symbol":    p.symbol,
            "magic":     p.magic,
            "volume":    p.volume,
            "openTime":  dt.datetime.fromtimestamp(p.time).isoformat(),
            "priceOpen": p.price_open,
            "profit":    round(p.profit, 2),
        }
        for p in raw
    ]


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    print("Connecting to MT5…")
    if not mt5.initialize():
        print(f"FAIL initialize: {mt5.last_error()}")
        raise SystemExit(1)

    info = mt5.account_info()
    if info is None:
        print(f"FAIL account_info: {mt5.last_error()}")
        raise SystemExit(1)
    print(f"  account {info.login} on {info.server} ({info.currency})")
    print(f"  current balance ${info.balance:.2f}  equity ${info.equity:.2f}")

    magic_map, deploy_date = load_strategy_lab_magics()
    if deploy_date is None:
        print("FAIL: no Strategy Lab deployments found in lab.sqlite")
        raise SystemExit(1)
    sl_magics = set(magic_map.keys())
    print(f"  {len(magic_map)} Strategy Lab magics; earliest deploy {deploy_date}")

    all_deals = fetch_all_deals()
    print(f"  {len(all_deals)} total deals fetched")

    # OPTION A: filter to Strategy Lab magics only, only since deploy_date.
    trade_deals = [
        d for d in all_deals
        if d.magic in sl_magics
        and d.time >= deploy_date
        and d.type != DEAL_TYPE_BALANCE
    ]
    if not trade_deals:
        print("FAIL: no Strategy Lab trades since deploy_date")
        raise SystemExit(1)
    print(f"  {len(trade_deals)} Strategy Lab trades since deploy")

    # Open positions floating P&L — Strategy Lab magics only.
    all_positions = fetch_open_positions()
    positions = [p for p in all_positions if p["magic"] in sl_magics]
    open_pnl = sum(p["profit"] for p in positions)
    print(f"  open positions on SL magics: {len(positions)}")

    # Start balance reconstruction not strictly needed under Option A —
    # we always use the fixed $5k baseline for returns. Still print for
    # debugging / sanity.
    start_balance = reconstruct_balance_at(deploy_date, info.balance, all_deals)
    print(f"  reconstructed balance at first SL deploy: ${start_balance:.2f}")

    realized_pnl = sum(d.net_pnl for d in trade_deals)
    total_pnl = realized_pnl + open_pnl
    # Resume narrative uses fixed $5k baseline (user's stated working capital).
    denom = STARTING_CAPITAL_USD
    total_return_pct = total_pnl / denom * 100.0

    print(f"  realized P&L:  ${realized_pnl:+.2f}")
    print(f"  floating P&L:  ${open_pnl:+.2f}")
    print(f"  TOTAL profit:  ${total_pnl:+.2f}")
    print(f"  return (vs ${denom:.0f} baseline): {total_return_pct:+.2f}%")

    # Equity curve: cumulative realized P&L as % of $5k baseline.
    curve, max_dd_pct = build_equity_curve_pct(trade_deals, denom, deploy_date)
    strategies = per_strategy_stats(trade_deals, magic_map, denom)

    # Aggregate stats for the hero stat-strip.
    # Count CLOSE deals only — each open/close pair is one "trade".
    close_deals = [d for d in trade_deals if d.is_close]
    total_trades = len(close_deals)
    total_wins = sum(1 for d in close_deals if d.net_pnl > 0)
    win_rate_pct = round(total_wins / total_trades * 100, 1) if total_trades else 0.0
    # Profit factor — gross_profit / abs(gross_loss). For low-win-rate
    # systems this is a more meaningful "is it working" signal than WR.
    gross_profit = sum(d.net_pnl for d in close_deals if d.net_pnl > 0)
    gross_loss = sum(d.net_pnl for d in close_deals if d.net_pnl < 0)
    profit_factor = round(abs(gross_profit / gross_loss), 2) if gross_loss < 0 else 0.0

    counts = derive_counts_from_db()
    killed = max(counts["researched"] - counts["deployed"], 0)
    print(f"  derived counts: researched={counts['researched']}  deployed={counts['deployed']}  killed={killed}")
    print(f"  totals: trades={total_trades}  win_rate={win_rate_pct}%  PF={profit_factor}  max_dd={max_dd_pct:.2f}%")

    # S&P 500 benchmark over the same period
    spx = compute_spx_benchmark(deploy_date.date(), dt.datetime.now().date())
    if spx:
        spx_ret = spx["returnPct"]
        multiplier = total_return_pct / spx_ret if abs(spx_ret) > 0.01 else None
        print(f"  S&P 500 over same period: {spx_ret:+.2f}%  "
              f"(multiplier: {multiplier:.2f}x)" if multiplier else
              f"  S&P 500 over same period: {spx_ret:+.2f}%")
    else:
        print("  (S&P 500 benchmark unavailable — US500 parquet not found)")

    # NOTE: `lastUpdatedAt` is deliberately NOT written. Including it would
    # mean every snapshot run produces a non-trivial JSON diff (timestamp
    # changes), making the npm-run-snapshot wrapper unable to detect
    # "nothing meaningful changed → skip the commit".
    snapshot = {
        "startDate":             deploy_date.date().isoformat(),
        "totalReturnPct":        round(total_return_pct, 3),
        "totalTrades":           total_trades,
        "winRatePct":            win_rate_pct,
        "profitFactor":          profit_factor,
        "maxDrawdownPct":        max_dd_pct,
        "benchmark": spx if spx else None,
        "strategiesResearched":  counts["researched"],
        "strategiesDeployed":    counts["deployed"],
        "strategiesKilled":      killed,
        "equityCurve":           curve,
        "strategies":            strategies,
        "openPositions":         positions,
    }

    OUT_PATH.parent.mkdir(exist_ok=True)
    OUT_PATH.write_text(json.dumps(snapshot, indent=2))
    print(f"\nWrote {OUT_PATH}")
    print(f"  curve points: {len(curve)}  strategies: {len(strategies)}  open positions: {len(positions)}")

    mt5.shutdown()


if __name__ == "__main__":
    main()
