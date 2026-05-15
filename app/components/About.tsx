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
            I&apos;m at my best when the problem is fuzzy and the data is
            messy. The pattern across my work is consistent:{" "}
            <span className="text-[var(--color-text-primary)]">
              find the friction, diagnose the root cause, design a scalable
              solution.
            </span>{" "}
            I think hypothesis-first — every analysis starts with a
            structural reason, not a number — and I lean on unit economics
            when the answer needs to scale.
          </p>
          <p>
            Identifying the right abstraction is usually more valuable than
            running another query. The trading edge on this page didn&apos;t
            come from a smarter model — it came from asking{" "}
            <em style={displayStyle} className="italic">
              which days of the week actually pay out
            </em>
            , then killing the strategies that didn&apos;t survive the
            question. That&apos;s the instinct I bring everywhere: separate
            the question from the noise, then have the discipline to act on
            the answer.
          </p>
          <p>
            Comfortable across SQL, Python, experiment design, and
            dashboarding. Most at home in the part of analytics where the
            spreadsheet ends and the decision begins.
          </p>
        </div>
      </div>
    </section>
  );
}
