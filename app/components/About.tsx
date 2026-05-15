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
            I have a passion for solving problems, and my approach remains
            the same whether in business, daily life, or trading:{" "}
            <span className="text-[var(--color-text-primary)]">
              formulate hypotheses, identify root causes, and make
              data-driven decisions.
            </span>
          </p>
          <p>
            During my career gap, I turned this mindset toward quantitative
            trading. What began as curiosity grew into systematic research —{" "}
            <span className="text-[var(--color-text-primary)]">
              designing trading pipelines, building backtesting frameworks,
              and studying market behavior
            </span>{" "}
            through data-driven experimentation.
          </p>
          <p>
            My background in data analytics shaped how I approach trading —
            not as speculation, but as a continuous process of{" "}
            <span className="text-[var(--color-text-primary)]">
              research, validation, and iteration.
            </span>
          </p>
          <p>
            Trading sits close to gambling. The work above is my attempt to
            pull it away from that line — through{" "}
            <span className="text-[var(--color-text-primary)]">
              rigorous analysis, statistical discipline, and the ability to
              tell a working strategy from an overfit curve.
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
