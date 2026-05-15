const displayStyle = { fontFamily: "var(--font-display)" };

export function About() {
  return (
    <section className="border-t border-[var(--color-border)] px-6 py-20 sm:px-12 sm:py-28 lg:px-20">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 sm:mb-16">
          <div className="mb-3 text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--color-text-tertiary)] sm:text-xs">
            About
          </div>
          <h2
            className="text-balance text-3xl font-normal leading-[1.05] tracking-[-0.015em] sm:text-4xl lg:text-5xl"
            style={displayStyle}
          >
            Built by{" "}
            <em style={displayStyle} className="italic">
              Chutithep.
            </em>
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-[var(--color-text-secondary)] sm:mt-6 sm:text-lg">
            Senior data analyst, 7+ years across e-commerce platforms.
          </p>
        </div>

        <div className="max-w-2xl space-y-5 text-base leading-relaxed text-[var(--color-text-secondary)] sm:text-lg">
          <p>
            I work the same way on every problem:{" "}
            <span className="text-[var(--color-text-primary)]">
              find the friction, diagnose the root cause, design a
              data-driven solution.
            </span>
          </p>
          <p>
            Every analysis starts with a hypothesis, not mindless
            exploration. And I try not to mistake a dashboard for a
            decision.
          </p>
          <p>
            What I think I&apos;m best at is{" "}
            <em style={displayStyle} className="italic">
              knowing when to kill an idea
            </em>
            . Half the strategies above didn&apos;t survive the test, and
            choosing not to deploy them was as analytical as choosing what
            to keep.
          </p>
        </div>
      </div>
    </section>
  );
}
