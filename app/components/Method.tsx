const displayStyle = { fontFamily: "var(--font-display)" };
const numberStyle = { fontFamily: "var(--font-number)" };

interface MethodStep {
  id: string;
  title: string;
  body: string;
  /** Concrete moment that demonstrates this step in practice. */
  inPractice?: string;
}

const STEPS: MethodStep[] = [
  {
    id: "01",
    title: "Hypothesis",
    body:
      "Every strategy starts with a structural reason it should work: " +
      "a behavioral pattern, a calendar effect, a news event.",
  },
  {
    id: "02",
    title: "Test",
    body:
      "Millions of configurations across 8+ years of historical data. " +
      "Realistic costs baked in from day one.",
  },
  {
    id: "03",
    title: "Validate",
    body:
      "70/30 train/test split. Walk-forward verification. Cross-instrument " +
      "check. Stable parameters matter more than peak metrics.",
  },
  {
    id: "04",
    title: "Deploy or kill",
    body:
      "If it survives every check, it goes live. If it doesn't, the " +
      "analysis still shaped the next hypothesis.",
  },
];

export function Method() {
  return (
    <section
      id="method"
      className="border-t border-[var(--color-border)] px-6 py-20 sm:px-12 sm:py-28 lg:px-20"
    >
      <div className="mx-auto max-w-5xl">
        {/* Section title */}
        <div className="mb-12 sm:mb-16">
          <div className="mb-3 text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--color-text-tertiary)] sm:text-xs">
            Method
          </div>
          <h2
            className="text-balance text-3xl font-normal leading-[1.05] tracking-[-0.015em] sm:text-4xl lg:text-5xl"
            style={displayStyle}
          >
            From hypothesis to{" "}
            <em style={displayStyle} className="italic">
              deployment or kill.
            </em>
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-[var(--color-text-secondary)] sm:mt-6 sm:text-lg">
            Four steps.{" "}
            <span className="text-[var(--color-text-primary)]">
              Most don&apos;t make it through.
            </span>
          </p>
        </div>

        {/* The 4 steps — each with an optional "in practice" callout */}
        <div className="grid gap-x-12 gap-y-12 sm:grid-cols-2 sm:gap-y-14">
          {STEPS.map((step) => (
            <div key={step.id} className="space-y-3">
              <div
                className="text-2xl font-medium tabular-nums leading-none text-[var(--color-text-tertiary)] sm:text-3xl"
                style={numberStyle}
              >
                {step.id}
              </div>
              <h3
                className="text-2xl font-normal tracking-[-0.01em] sm:text-3xl"
                style={displayStyle}
              >
                {step.title}
              </h3>
              <p className="max-w-md text-sm leading-relaxed text-[var(--color-text-secondary)] sm:text-base">
                {step.body}
              </p>
              {step.inPractice && (
                <p
                  className="mt-3 max-w-md border-l-2 border-[var(--color-accent-dim)] pl-4 text-sm italic leading-relaxed text-[var(--color-text-secondary)] sm:mt-4 sm:text-base"
                  style={displayStyle}
                >
                  {step.inPractice}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
