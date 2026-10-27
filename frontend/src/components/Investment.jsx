const investmentOptions = [
  {
    title: 'Actions',
    image: '/images/invest-actions.png',
    imageAlt: 'Tesla, Amazon, and other company logos',
    description: 'More than 6,900 assets in Europe and the United States',
    href: '#actions',
  },
  {
    title: 'ETFs',
    image: '/images/invest-etfs.png',
    imageAlt: 'Vanguard, iShares, and SPDR fund logos',
    description: 'More than 2,300 American and European ETFs',
    href: '#etfs',
  },
  {
    title: 'CFDs',
    image: '/images/invest-cfds.png',
    imageAlt: 'Gold coin, S&P 500, and AU asset illustration',
    description: 'Over 2,600 leveraged instruments — currencies, commodities, and indices',
    href: '#cfds',
  },
]

const Investment = () => (
  <section aria-labelledby="invest-heading" className="bg-[#fafafa] px-6 py-14 text-[#101114] sm:px-10 sm:py-16 lg:px-12 lg:py-20" id="invest-options">
    <div className="mx-auto max-w-[1152px]">
      <span className="inline-flex rounded-full bg-[#f0f1f2] px-3 py-1 text-xs font-semibold">Offer</span>
      <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.055em] sm:text-5xl" id="invest-heading">
        Invest your way
      </h2>

      <div className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-x-8 lg:mt-16 lg:grid-cols-3 lg:gap-x-12">
        {investmentOptions.map((option) => (
          <article className="flex flex-col items-start" key={option.title}>
            <div className="mb-5 flex h-[150px] w-full items-center justify-start sm:h-[160px]">
              <img alt={option.imageAlt} className="h-full max-w-[230px] object-contain object-left" loading="lazy" src={option.image} />
            </div>
            <h3 className="text-[28px] font-semibold leading-tight tracking-[-0.04em]">{option.title}</h3>
            <p className="mt-4 max-w-[310px] text-base leading-6 text-[#59616b]">{option.description}</p>
            <a className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#12a538] transition-colors hover:text-[#087b27]" href={option.href}>
              Learn more <span aria-hidden="true" className="text-lg leading-none">→</span>
            </a>
          </article>
        ))}
      </div>
    </div>
  </section>
)

export default Investment
