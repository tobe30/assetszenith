import { Link } from 'react-router-dom'

const Footer = () => (
  <footer className="bg-[#111416] px-6 pb-7 pt-12 text-white sm:px-10 sm:pt-16 lg:px-12">
    <div className="mx-auto max-w-[1152px]">
      <div className="grid gap-10 border-b border-white/15 pb-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr] lg:gap-12 lg:pb-12">
        <div className="max-w-[330px]">
          <Link aria-label="Assets Zenith home" className="inline-flex items-center gap-3" to="/">
            <svg aria-hidden="true" className="h-10 w-10 shrink-0" fill="none" viewBox="0 0 40 40">
              <path d="M20 2.5 37.5 12.6v14.8L20 37.5 2.5 27.4V12.6L20 2.5Z" stroke="#ff1018" strokeWidth="2" />
              <path d="m10.5 25.5 9.5-15 9.5 15h-4.4l-5.1-8.2-5.1 8.2h-4.4Z" fill="#ff1018" />
              <path d="M14.5 29h11" stroke="white" strokeLinecap="round" strokeWidth="2" />
            </svg>
            <span className="text-xl font-semibold tracking-[-0.035em]">Assets Zenith</span>
          </Link>
          <p className="mt-5 text-sm leading-6 text-white/65">
            Explore stocks, ETFs, crypto, and investment plans in one place.
          </p>
          <Link className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#aab0b5] transition-colors hover:text-white" to="/markets">
            Explore markets <span aria-hidden="true" className="text-lg leading-none text-[#ff1018]">→</span>
          </Link>
        </div>

        <nav aria-label="Explore Assets Zenith">
          <h2 className="text-sm font-semibold">Explore</h2>
          <ul className="mt-4 space-y-3 text-sm text-white/65">
            <li><Link className="transition-colors hover:text-white" to="/invest#invest-options">Stocks &amp; ETFs</Link></li>
            <li><Link className="transition-colors hover:text-white" to="/markets">Live markets</Link></li>
            <li><Link className="transition-colors hover:text-white" to="/#pricing">Pricing information</Link></li>
            <li><Link className="transition-colors hover:text-white" to="/invest#invest-options">Investment plans</Link></li>
          </ul>
        </nav>

        <nav aria-label="Company information">
          <h2 className="text-sm font-semibold">About</h2>
          <ul className="mt-4 space-y-3 text-sm text-white/65">
            <li><Link className="transition-colors hover:text-white" to="/#trust-heading">Our approach</Link></li>
            <li><Link className="transition-colors hover:text-white" to="/#security">Account security</Link></li>
            <li><Link className="transition-colors hover:text-white" to="/markets">Market data</Link></li>
          </ul>
        </nav>

        <div>
          <h2 className="text-sm font-semibold">Stay informed</h2>
          <p className="mt-4 text-sm leading-6 text-white/65">
            Market prices shown on this site are for general information and may be delayed.
          </p>
          <Link className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white/75 transition-colors hover:text-white" to="/markets">
            View market data <span aria-hidden="true" className="text-lg leading-none text-[#ff1018]">→</span>
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-4 pt-6 text-xs leading-5 text-white/50 sm:flex-row sm:items-start sm:justify-between">
        <p className="max-w-[820px]" id="risk-notice">
          Investing involves risk, including the possible loss of capital. Information on this site is general and does not constitute investment advice or a recommendation to buy or sell any financial instrument.
        </p>
        <p className="shrink-0">© {new Date().getFullYear()} Assets Zenith</p>
            {/* <span>Marizu Inc.</span> */}
      </div>
    </div>
  </footer>
)

export default Footer
