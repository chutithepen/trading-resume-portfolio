"""Build strategy + buy-and-hold equity curves for the Validate step of the
LongIndex case study. Emits curves for each deployed instrument (Nasdaq +
S&P 500) so the chart can toggle between them.
"""

from __future__ import annotations

import json
import sys
from dataclasses import fields
from pathlib import Path

import pandas as pd

LAB = Path(r"d:/01.Documents/11.Trading Career/Strategy Lab")
sys.path.insert(0, str(LAB / "data" / "py"))

ENGINE_VERSION = "LongIndexEA_v4.0"
DATE_FROM = "2018-01-30"
DATE_TO = "2026-04-28"
OOS_CUTOFF = "2024-01-01"
STARTING_BALANCE = 5000.0

OUT_PATH = Path(__file__).resolve().parent.parent / "data" / "validate-curves.json"

INSTRUMENTS = [
    {"key": "nasdaq", "label": "Nasdaq", "symbol": "USTEC",
     "parquet": LAB / "data" / "raw" / "USTEC.parquet"},
    {"key": "sp500", "label": "S&P 500", "symbol": "US500",
     "parquet": LAB / "data" / "raw" / "US500.parquet"},
]


def _import_engine():
    import importlib
    import importlib.util

    engine_dir = LAB / "data" / "py" / ENGINE_VERSION
    file_path = engine_dir / "engine_fast.py"

    own_str = str(engine_dir)
    parent_str = str(engine_dir.parent)
    if parent_str not in sys.path:
        sys.path.insert(0, parent_str)
    while own_str in sys.path:
        sys.path.remove(own_str)
    sys.path.insert(0, own_str)

    for shared in ("engine", "engine_costs", "engine_fast",
                   "sweep_grid", "timeframe_utils"):
        sys.modules.pop(shared, None)
    importlib.invalidate_caches()

    safe = ENGINE_VERSION.replace(".", "_").replace("-", "_")
    mod_name = f"_engine_fast_{safe}"
    spec = importlib.util.spec_from_file_location(mod_name, file_path)
    mod = importlib.util.module_from_spec(spec)
    sys.modules[mod_name] = mod
    sys.modules["engine_fast"] = mod
    spec.loader.exec_module(mod)
    return mod


def deployed_params_dict() -> dict:
    return dict(
        trade_mon=True, trade_tue=True, trade_wed=True,
        trade_thu=False, trade_fri=False,
        exit_min=1320,
        equity_notional_pct=150,
        balance_add=5000,
        risk_pct=1,
        fixed_usd_amount=100,
        reference_sl_pct=2,
        enable_sma_filter=False,
        sma_period=200,
    )


def build_buy_and_hold(parquet_path: Path) -> pd.Series:
    df = pd.read_parquet(parquet_path, columns=["close"])
    start = pd.Timestamp(DATE_FROM, tz="UTC")
    end = pd.Timestamp(DATE_TO, tz="UTC")
    df = df[(df.index >= start) & (df.index <= end)]
    buy_price = float(df["close"].iloc[0])
    daily = df["close"].resample("D").last().dropna()
    eq = STARTING_BALANCE * (daily / buy_price)
    eq_w = eq.resample("W-FRI").last().ffill()
    eq_w.index = eq_w.index.tz_localize(None) if eq_w.index.tz is not None else eq_w.index
    return eq_w


def build_strategy(engine_fast, symbol: str, params: dict) -> tuple[pd.Series, dict]:
    FastParams = engine_fast.FastParams
    fp_fields = {f.name for f in fields(FastParams)}
    kwargs = {k: v for k, v in params.items() if k in fp_fields}
    fp = FastParams(**kwargs)

    trades = engine_fast.run_backtest_fast(symbol, fp, date_from=DATE_FROM, date_to=DATE_TO)
    if trades.empty:
        return pd.Series(dtype=float), {}

    trades = trades.sort_values("exit_time").reset_index(drop=True)
    eq = STARTING_BALANCE + trades["pnl"].cumsum()
    eq.index = pd.to_datetime(trades["exit_time"])
    eq_w = eq.resample("W-FRI").last().ffill()
    eq_w.index = eq_w.index.tz_localize(None) if eq_w.index.tz is not None else eq_w.index

    info = dict(
        exit_min=int(params.get("exit_min", 0)),
        n_trades=int(len(trades)),
        final_equity=float(eq.iloc[-1]),
    )
    return eq_w, info


def main():
    params = deployed_params_dict()
    print(f"[validate-curves] loading engine {ENGINE_VERSION}…")
    engine_fast = _import_engine()

    results = {}
    common_index = None

    for inst in INSTRUMENTS:
        print(f"[validate-curves] running strategy on {inst['symbol']}…")
        strat_eq, strat_info = build_strategy(engine_fast, inst["symbol"], params)
        if strat_eq.empty:
            raise RuntimeError(f"no equity for {inst['symbol']}")

        print(f"[validate-curves] loading {inst['symbol']} price data…")
        bnh_eq = build_buy_and_hold(inst["parquet"])

        common_index = strat_eq.index.union(bnh_eq.index) if common_index is None \
            else common_index.union(strat_eq.index).union(bnh_eq.index)

        results[inst["key"]] = {
            "label": inst["label"],
            "strategy_eq": strat_eq,
            "strategy_info": strat_info,
            "bnh_eq": bnh_eq,
        }

    common_index = common_index.sort_values()

    instances = {}
    for key, r in results.items():
        strat = r["strategy_eq"].reindex(common_index).ffill().fillna(STARTING_BALANCE)
        bnh = r["bnh_eq"].reindex(common_index).ffill().fillna(STARTING_BALANCE)
        instances[key] = {
            "label": r["label"],
            "strategy": {
                "info": r["strategy_info"],
                "values": [round(float(v), 2) for v in strat.values],
            },
            "buy_and_hold": {
                "values": [round(float(v), 2) for v in bnh.values],
                "final_equity": float(bnh.iloc[-1]),
            },
        }
        print(f"    {r['label']:>8}  strategy: ${strat.iloc[-1]:.0f}  ({(strat.iloc[-1]/STARTING_BALANCE-1)*100:+.1f}%)  "
              f"buy&hold: ${bnh.iloc[-1]:.0f}  ({(bnh.iloc[-1]/STARTING_BALANCE-1)*100:+.1f}%)")

    payload = {
        "date_from": DATE_FROM,
        "date_to": DATE_TO,
        "oos_cutoff": OOS_CUTOFF,
        "starting_balance": STARTING_BALANCE,
        "dates": [d.strftime("%Y-%m-%d") for d in common_index],
        "instances": instances,
    }

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(json.dumps(payload), encoding="utf-8")
    print(f"[validate-curves] wrote {OUT_PATH}")


if __name__ == "__main__":
    main()
