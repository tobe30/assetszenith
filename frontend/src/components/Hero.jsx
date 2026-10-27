import Navbar from './Navbar'
import { Link } from 'react-router-dom'

const Hero = () => {
  return (
    <section
      aria-labelledby="hero-heading"
      className="hero-stage relative isolate flex min-h-[720px] flex-col overflow-hidden bg-[#111416] text-white lg:h-[min(100svh,920px)]"
      id="home"
    >
      <img
        alt="Financial advisors discussing an investment plan"
        className="hero-image absolute inset-0 -z-20 h-full w-full object-cover object-center"
        fetchPriority="high"
        src="/images/advisor-hero.jpg"
      />
      <div aria-hidden="true" className="hero-scrim absolute inset-0 -z-10" />

      <Navbar />

      <main className="relative z-[1] mx-auto flex w-full max-w-[1440px] flex-1 flex-col items-start justify-center gap-10 px-5 pb-12 pt-8 sm:px-8 lg:gap-12 lg:px-12 lg:pb-14 lg:pt-0">
        <div className="max-w-[570px]">
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="badge badge-soft border-0 bg-white/15 px-3 py-3 text-xs font-semibold text-white backdrop-blur-sm">
              24/5 support
            </span>
            <span className="badge badge-soft border-0 bg-white/15 px-3 py-3 text-xs font-semibold text-white backdrop-blur-sm">
              +2.9 million investors
            </span>
          </div>

          <h1
            className="max-w-[600px] text-[clamp(3.5rem,7.8vw,6.9rem)] font-semibold leading-[0.98] tracking-[-0.065em]"
            id="hero-heading"
          >
            Where your
            <br />
            money works
          </h1>

          <p className="mt-7 max-w-[440px] text-base leading-7 text-white/90 sm:text-lg">
            Investment, trading and savings solutions — all in one intuitive app.
          </p>

          <Link className="btn mt-8 min-h-12 rounded-lg border-0 bg-[#1caf35] px-6 text-base font-bold text-white shadow-none hover:bg-[#15952b]" to="/register">
            Become a Customer
          </Link>
        </div>

        <nav aria-label="Explore investments" className="asset-carousel flex w-full flex-nowrap items-center justify-start gap-3 overflow-x-auto sm:flex-wrap sm:justify-center sm:overflow-visible sm:gap-4">
          <a className="asset-pill" href="#tesla">
            <span aria-hidden="true" className="asset-icon bg-[#e82127] text-white">
              <svg fill="currentColor" height="21" viewBox="0 0 24 24" width="21">
                <path d="M12 4.2c-3.6 0-7.1.5-10 1.4l1.1 2.1c2.5-.7 5.1-1.1 7.7-1.2l1.2 13.3 1.2-13.3c2.6.1 5.2.5 7.7 1.2L22 5.6c-2.9-.9-6.4-1.4-10-1.4ZM4.1 9.1l2.1 1.1 1.4-2.2-2.2-.7-1.3 1.8Zm11.1-1.1 1.4 2.2 2.1-1.1-1.3-1.8-2.2.7Z" />
              </svg>
            </span>
            <span>Tesla</span>
          </a>
          <a className="asset-pill" href="#crypto-cfd">
            <span aria-hidden="true" className="asset-icon bg-[#ff9d18] text-white">₿</span>
            <span>Crypto CFD</span>
          </a>
          <a aria-label="Amazon" className="asset-pill" href="#amazon">
            <span aria-hidden="true" className="asset-icon bg-white text-[#232f3e]">
              <svg fill="none" height="25" viewBox="0 0 32 32" width="25">
                <path d="M8.5 11.3c0-3.1 2.4-5 6.5-5 2.1 0 4.1.4 5.8 1v9.1c-1.6 1.2-3.4 1.8-5.3 1.8-3.3 0-5.3-1.7-5.3-4.4 0-2.8 2.2-4.4 5.8-4.4h1.3V8.8c-.8-.3-1.6-.5-2.5-.5-2.5 0-3.8 1-3.8 3h-2.5Zm5 2.4c0 1.4 1 2.2 2.7 2.2 1.1 0 2.2-.3 3.3-1v-3.4h-1.3c-3.1 0-4.7.7-4.7 2.2Z" fill="#232f3e" />
                <path d="M5 21.1c6.5 4.2 15.7 4.1 22-.3" stroke="#ff9900" strokeLinecap="round" strokeWidth="2" />
                <path d="m23.7 19.5 3.8 1.1-1.3 3.5" stroke="#ff9900" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </span>
            <span>Amazon</span>
          </a>
          <a aria-label="Google" className="asset-pill" href="#google">
            <span aria-hidden="true" className="asset-icon bg-white">
              <svg height="21" viewBox="0 0 48 48" width="21">
                <path fill="#4285F4" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.6c3.9-3.6 6.1-8.8 6.1-15Z" />
                <path fill="#34A853" d="M24 44c5.5 0 10.2-1.8 13.5-4.9l-6.6-5.1c-1.8 1.2-4 1.9-6.9 1.9-5.3 0-9.8-3.6-11.4-8.4H5.8v5.3A20 20 0 0 0 24 44Z" />
                <path fill="#FBBC05" d="M12.6 27.5a12 12 0 0 1 0-7v-5.3H5.8a20 20 0 0 0 0 17.6l6.8-5.3Z" />
                <path fill="#EA4335" d="M24 12.1c3 0 5.7 1 7.8 3.1l5.9-5.9C34.1 6.1 29.5 4 24 4A20 20 0 0 0 5.8 15.2l6.8 5.3c1.6-4.8 6.1-8.4 11.4-8.4Z" />
              </svg>
            </span>
            <span>Google</span>
          </a>
        </nav>
      </main>

    </section>
  )
}

export default Hero
