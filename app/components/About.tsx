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
              Heng.
            </em>
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-[var(--color-text-secondary)] sm:mt-6 sm:text-lg">
            Senior data analyst, 7+ years across e-commerce platforms.
          </p>
        </div>

        <div className="max-w-2xl space-y-5 text-base leading-relaxed text-[var(--color-text-secondary)] sm:text-lg">
          <p>
            Started at{" "}
            <span className="text-[var(--color-text-primary)]">
              CP Group&apos;s Future Leader Program
            </span>
            , piloting what would become 7-Eleven&apos;s delivery service —
            LINE + TrueMoney + motorbike taxis, three years before there was
            an app.
          </p>
          <p>
            At{" "}
            <span className="text-[var(--color-text-primary)]">Shopee</span>{" "}
            (Business Transformation): cut cash-on-delivery rejection from
            ~1% to ~0.2% with targeted eligibility guardrails (~50% of
            platform orders), lifted brand-intent search CTR ~4× by surfacing
            official-store entry points (no ranking changes — just better
            intent matching), and reduced return-processing costs ~19% via
            unit-economics-driven automation.
          </p>
          <p>
            At{" "}
            <span className="text-[var(--color-text-primary)]">NocNoc</span>{" "}
            (Senior Data Analyst): led the company-wide data centralization,
            built decision-focused dashboards for marketing and commercial,
            validated the cart price-drop feature via A/B testing (~85%
            confidence before rollout), shipped a Python pipeline that
            translated and approved 100k+ SKUs in a week, and designed the
            MECE intent taxonomy behind the seller-response chatbot.
          </p>
          <p>
            This site is what I built during my career gap — same instincts,
            applied to a domain (quantitative trading) where the bar for
            analytical rigor is unforgiving. The method on this page —{" "}
            <em style={displayStyle} className="italic">
              hypothesis, test, validate, deploy or kill
            </em>{" "}
            — is how I work on everything.
          </p>
        </div>
      </div>
    </section>
  );
}
