#!/usr/bin/env node
/**
 * One-command portfolio refresh.
 *
 * Run via `npm run snapshot`. Pipeline:
 *   1. Snapshot the BEFORE content of data/portfolio.json
 *   2. Run `python scripts/export.py` — pulls fresh numbers from MT5
 *   3. Compare BEFORE vs AFTER content
 *      - if identical: log "no change", exit 0, no commit
 *      - if changed: git add + commit + push
 *   4. Done. Vercel auto-deploys on push (~30s).
 *
 * Safety:
 *   - If export.py fails (MT5 not running, etc.) the script bails before
 *     touching git. No half-broken commits.
 *   - The "did anything change?" check is content-diff, not mtime. So if
 *     numbers genuinely haven't moved, no spam commit hits the history.
 */
import { execSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const JSON_PATH = resolve("data/portfolio.json");

function exec(cmd, opts = {}) {
  return execSync(cmd, { stdio: "inherit", ...opts });
}

function readJsonOrEmpty(path) {
  if (!existsSync(path)) return "";
  return readFileSync(path, "utf8");
}

// --- 1. snapshot BEFORE ----------------------------------------------------
const before = readJsonOrEmpty(JSON_PATH);

// --- 2. run python export --------------------------------------------------
console.log("→ python scripts/export.py");
try {
  exec("python scripts/export.py");
} catch {
  console.error(
    "\n✗ Python export failed. Likely causes:\n" +
      "  • MT5 terminal is not running on this PC — open it and try again.\n" +
      "  • MT5 not logged in — log into the live account first.\n" +
      "  • Python or MetaTrader5 package missing — run `pip install MetaTrader5`.\n"
  );
  process.exit(1);
}

// --- 3. compare BEFORE vs AFTER --------------------------------------------
const after = readJsonOrEmpty(JSON_PATH);
if (before === after) {
  console.log(
    "\n✓ No data changes since last snapshot. Skipping commit.\n" +
      "  (Numbers might've moved at MT5 but the rounded values are identical.)"
  );
  process.exit(0);
}

// --- 4. commit + push ------------------------------------------------------
const today = new Date().toISOString().slice(0, 10);
console.log("\n→ git commit + push");
try {
  exec("git add data/portfolio.json");
  exec(`git commit -m "refresh portfolio snapshot ${today}"`);
  exec("git push");
  console.log(
    "\n✓ Pushed. Vercel will rebuild + redeploy within ~30 seconds.\n" +
      "  Check https://vercel.com/dashboard for build status."
  );
} catch (e) {
  console.error("\n✗ Git push failed. Run the commands manually:");
  console.error("    git add data/portfolio.json");
  console.error("    git commit -m \"refresh portfolio snapshot " + today + "\"");
  console.error("    git push");
  process.exit(1);
}
