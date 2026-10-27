import { Link } from 'react-router-dom'

const BrandMark = () => (
  <svg aria-hidden="true" className="h-10 w-10 shrink-0" fill="none" viewBox="0 0 40 40">
    <path d="M20 2.5 37.5 12.6v14.8L20 37.5 2.5 27.4V12.6L20 2.5Z" stroke="#ff1018" strokeWidth="2" />
    <path d="m10.5 25.5 9.5-15 9.5 15h-4.4l-5.1-8.2-5.1 8.2h-4.4Z" fill="#ff1018" />
    <path d="M14.5 29h11" stroke="white" strokeLinecap="round" strokeWidth="2" />
  </svg>
)

const AuthLayout = ({ eyebrow, title, description, children, footer }) => (
  <main className="grid min-h-screen bg-[#f7f8f7] text-[#101416] lg:grid-cols-[minmax(0,1fr)_minmax(440px,0.9fr)]">
    <section className="relative isolate hidden overflow-hidden bg-[#111416] px-10 py-9 text-white lg:flex lg:flex-col lg:justify-between xl:px-16 xl:py-12">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_75%_28%,rgba(255,16,24,0.2),transparent_38%),linear-gradient(145deg,#111416_25%,#202629_100%)]" />
      <Link aria-label="Assets Zenith home" className="inline-flex w-fit items-center gap-3" to="/">
        <BrandMark />
        <span className="text-xl font-semibold tracking-[-0.035em]">Assets Zenith</span>
      </Link>

      <div className="mx-auto w-full max-w-[560px] py-12">
        <span className="inline-flex rounded-full border border-white/15 bg-white/[0.07] px-3 py-1.5 text-xs font-semibold text-white/75">Invest with clarity</span>
        <h1 className="mt-6 text-5xl font-semibold leading-[1.02] tracking-[-0.06em] xl:text-6xl">A clearer view of your next move.</h1>
        <p className="mt-5 max-w-[450px] text-base leading-7 text-white/65">Explore stocks, ETFs, and crypto with the tools and market information to make more informed decisions.</p>

        <div aria-label="Market trend illustration" className="mt-10 rounded-3xl border border-white/10 bg-white/[0.045] p-5 shadow-2xl backdrop-blur sm:p-7">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.15em] text-white/45">Market overview</p>
              <p className="mt-2 text-lg font-semibold">Build your market perspective</p>
            </div>
            <span aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1caf35]/15 text-[#48d466]">↗</span>
          </div>
          <svg aria-hidden="true" className="mt-7 h-36 w-full" fill="none" preserveAspectRatio="none" viewBox="0 0 520 144">
            <path d="M0 118H520M0 75H520M0 32H520" stroke="white" strokeOpacity=".09" />
            <path d="M0 116C43 112 47 95 92 101s53 20 91-4 51 3 91-24 52 11 91-13 62-7 85-30 43-4 70-20" stroke="#31c451" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
            <circle cx="520" cy="10" r="5" fill="#31c451" />
          </svg>
          <div className="mt-3 flex justify-between text-[11px] text-white/40"><span>Stocks</span><span>ETFs</span><span>Crypto</span><span>Markets</span></div>
        </div>
      </div>

      <p className="text-xs text-white/40">Investing involves risk, including possible loss of capital.</p>
    </section>

    <section className="flex min-h-screen flex-col px-5 py-6 sm:px-10 lg:justify-center lg:px-12 xl:px-20">
      <div className="mx-auto flex w-full max-w-[440px] flex-1 flex-col lg:flex-none">
        <div className="flex items-center justify-between lg:hidden">
          <Link aria-label="Assets Zenith home" className="inline-flex items-center gap-2.5" to="/">
            <BrandMark />
            <span className="text-lg font-semibold tracking-[-0.035em]">Assets Zenith</span>
          </Link>
          <Link className="text-sm font-semibold text-[#59616b] transition-colors hover:text-[#101416]" to="/">Home</Link>
        </div>

        <div className="my-auto py-12 lg:my-0 lg:py-0">
          <Link className="hidden text-sm font-medium text-[#68717a] transition-colors hover:text-[#101416] lg:inline-flex" to="/">← Back to Assets Zenith</Link>
          <div className="mt-8 lg:mt-12">
            <span className="inline-flex rounded-full bg-[#eaf6ec] px-3 py-1 text-xs font-semibold text-[#16852d]">{eyebrow}</span>
            <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.055em] sm:text-[2.75rem]">{title}</h2>
            <p className="mt-3 text-sm leading-6 text-[#68717a] sm:text-base">{description}</p>
          </div>

          {children}
          {footer}
        </div>

        <p className="mt-auto pt-8 text-center text-[11px] leading-5 text-[#8a9299] lg:mt-10">Assets Zenith provides general market information. Investing involves risk, including possible loss of capital.</p>
      </div>
    </section>
  </main>
)

export default AuthLayout
