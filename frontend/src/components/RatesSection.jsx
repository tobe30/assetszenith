const rateBenefits = [
  {
    title: 'Clear pricing',
    description: 'Understand the costs associated with different investments. Review any applicable fees and charges before placing an order, so you can make informed decisions.',
    icon: (
      <svg aria-hidden="true" fill="none" height="22" viewBox="0 0 24 24" width="22">
        <path d="M12 3.5c-1.7 3-5.2 6.5-5.2 10.2a5.2 5.2 0 0 0 10.4 0C17.2 10 13.7 6.5 12 3.5Z" fill="currentColor" />
        <path d="M9.2 14.4c.2 1.3 1.1 2.1 2.3 2.3" stroke="white" strokeLinecap="round" strokeWidth="1.5" />
      </svg>
    ),
    iconClass: 'bg-[#fff0f0] text-[#e0444b]',
  },
  {
    title: 'Deposits and withdrawals',
    description: 'Explore the available ways to add or withdraw funds. Check payment method details and any processing times before making a transfer.',
    icon: (
      <svg aria-hidden="true" fill="none" height="22" viewBox="0 0 24 24" width="22">
        <path d="M4 8h15m0 0-3-3m3 3-3 3M20 16H5m0 0 3-3m-3 3 3 3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      </svg>
    ),
    iconClass: 'bg-[#edf5ff] text-[#3284df]',
  },
  {
    title: 'Straightforward setup',
    description: 'Complete the account opening process online with guided steps. We’ll explain what information is needed as you move through setup.',
    icon: (
      <svg aria-hidden="true" fill="currentColor" height="22" viewBox="0 0 24 24" width="22">
        <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-4 0-7 2-7 4.5V21h14v-2.5C19 16 16 14 12 14Z" />
      </svg>
    ),
    iconClass: 'bg-[#f0f1f2] text-[#202124]',
  },
]

const RatesSection = () => (
  <section aria-labelledby="rates-heading" className="bg-[#fafafa] px-6 py-14 text-[#101114] sm:px-10 sm:py-16 lg:px-12 lg:py-20" id="pricing">
    <div className="mx-auto max-w-[1152px]">
      <span className="inline-flex rounded-full bg-[#f0f1f2] px-3 py-1 text-xs font-semibold">Rates</span>
      <h2 className="mt-4 max-w-[620px] text-4xl font-semibold leading-[1.06] tracking-[-0.055em] sm:text-5xl" id="rates-heading">
        Lower costs, more investing
      </h2>
      <a className="mt-6 inline-flex items-center gap-2 text-sm font-semibold !text-[#1caf35] transition-colors hover:!text-[#15952b]" href="#pricing">
        View our full price list <span aria-hidden="true" className="text-lg leading-none">→</span>
      </a>

      <div className="mt-14 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12">
        {rateBenefits.map((benefit) => (
          <article key={benefit.title}>
            <div className={`mb-6 flex h-12 w-12 items-center justify-center rounded-xl ${benefit.iconClass}`}>
              {benefit.icon}
            </div>
            <h3 className="max-w-[330px] text-[26px] font-semibold leading-[1.14] tracking-[-0.04em] sm:text-[28px]">
              {benefit.title}
            </h3>
            <p className="mt-4 max-w-[340px] text-base leading-6 text-[#59616b]">{benefit.description}</p>
          </article>
        ))}
      </div>
    </div>
  </section>
)

export default RatesSection
