import { Link } from 'react-router-dom'

const highlights = [
  { title: 'Stocks & ETFs', detail: 'Explore investments across major markets' },
  { title: 'Investment plans', detail: 'Build a long-term approach that fits you' },
  { title: '24/5 support', detail: 'Get help during the trading week' },
  { title: 'Flexible choices', detail: 'Choose how you want to invest' },
  { title: 'Market insights', detail: 'Make informed decisions with useful context' },
  { title: 'One clear view', detail: 'Keep your investments together in one place' },
]

const CredibilitySection = () => (
  <section aria-labelledby="credibility-heading" className="bg-[#fafafa] px-6 py-14 text-[#101114] sm:px-10 sm:py-16 lg:px-12 lg:py-20">
    <div className="mx-auto max-w-[1152px]">
      <span className="inline-flex rounded-full bg-[#f0f1f2] px-3 py-1 text-xs font-semibold">Trust</span>

      <div className="mt-4 max-w-[620px]">
        <h2 className="text-4xl font-semibold leading-[1.06] tracking-[-0.055em] sm:text-5xl" id="credibility-heading">
          Invest with confidence <span aria-label="trophy" role="img">🏆</span>
        </h2>
        <p className="mt-5 max-w-[560px] text-base leading-6 text-[#59616b] sm:text-lg sm:leading-7">
          Discover investment options designed to help you take the next step toward your financial goals.
        </p>
        <Link className="mt-6 inline-flex min-h-12 items-center gap-3 rounded-lg bg-[#1caf35] px-6 text-sm font-bold !text-white shadow-[0_5px_14px_rgba(28,175,53,0.2)] transition-all hover:-translate-y-0.5 hover:bg-[#15952b] hover:shadow-[0_7px_18px_rgba(28,175,53,0.28)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#15952b]" to="/register">
          Start investing
          <span aria-hidden="true" className="text-lg leading-none">→</span>
        </Link>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-x-10 gap-y-9 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3 lg:gap-y-12">
        {highlights.map((highlight) => (
          <div key={highlight.title}>
            <h3 className="text-2xl font-semibold leading-tight tracking-[-0.04em] sm:text-[28px]">{highlight.title}</h3>
            <p className="mt-3 text-base leading-6 text-[#59616b]">{highlight.detail}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
)

export default CredibilitySection
