import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Footer from '../components/Footer'
import Investment from '../components/Investment'
import MarketLogo from '../components/MarketLogo'
import MarketsSection from '../components/MarketsSection'
import Navbar from '../components/Navbar'
import RatesSection from '../components/RatesSection'

const featuredSymbols = [
  { symbol: 'BTC', name: 'Bitcoin', fallbackPrice: '—' },
  { symbol: 'TSLA', name: 'Tesla', fallbackPrice: '—' },
  { symbol: 'GOOGL', name: 'Alphabet', fallbackPrice: '—' },
]

const formatPrice = (value) => {
  const price = Number(value)
  if (!Number.isFinite(price)) return '—'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: price < 1 ? 5 : 2 }).format(price)
}

const InvestMarketVisual = () => {
  const [quotes, setQuotes] = useState({})

  useEffect(() => {
    let mounted = true
    const loadQuotes = async () => {
      try {
        const response = await fetch('/api/markets')
        if (!response.ok) return
        const result = await response.json()
        if (!mounted) return
        setQuotes(Object.fromEntries(result.items.map((item) => [item.symbol.toUpperCase(), item])))
      } catch {
        // The visual remains useful when market data is temporarily unavailable.
      }
    }

    loadQuotes()
    return () => {
      mounted = false
    }
  }, [])

  return (
    <div aria-label="Featured market assets" className="invest-visual relative mx-auto h-[350px] w-full max-w-[540px] sm:h-[410px] lg:h-[440px]">
      <div className="absolute inset-x-4 top-8 bottom-8 rounded-[2rem] border border-white/10 bg-white/[0.04]" />
      <div className="invest-chart-card absolute inset-x-0 top-14 mx-auto max-w-[430px] rounded-3xl border border-white/10 bg-[#1b2023]/95 p-5 shadow-[0_28px_80px_rgba(0,0,0,0.4)] backdrop-blur-xl sm:p-7">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/45">Market overview</p>
            <p className="mt-2 text-lg font-semibold text-white">Assets in focus</p>
          </div>
          <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ff1018]/15 text-[#ff5e63]">
            <svg fill="none" height="18" viewBox="0 0 24 24" width="18">
              <path d="M4 17 9 12l3 3 8-9" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              <path d="M15 6h5v5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </span>
        </div>
        <div aria-hidden="true" className="mt-6 h-[145px] overflow-hidden rounded-2xl bg-gradient-to-b from-[#1caf35]/10 to-transparent sm:h-[175px]">
          <svg className="h-full w-full" fill="none" preserveAspectRatio="none" viewBox="0 0 420 175">
            <defs>
              <linearGradient id="market-line" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="#42d768" stopOpacity=".28" />
                <stop offset="1" stopColor="#42d768" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0 135H420M0 88H420M0 42H420" stroke="white" strokeOpacity=".07" />
            <path d="M0 139C31 134 35 111 69 117S106 133 139 105 181 108 210 82 248 94 281 65 318 75 343 51 382 61 420 25V175H0V139Z" fill="url(#market-line)" />
            <path className="invest-chart-line" d="M0 139C31 134 35 111 69 117S106 133 139 105 181 108 210 82 248 94 281 65 318 75 343 51 382 61 420 25" stroke="#42d768" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
          </svg>
        </div>
        <div className="mt-4 flex items-center justify-between text-[11px] text-white/40">
          <span>Stocks</span><span>Crypto</span><span>ETFs</span><span>Forex</span>
        </div>
      </div>

      {featuredSymbols.map((asset, index) => {
        const quote = quotes[asset.symbol]
        return (
          <div className={`invest-asset-card invest-asset-card-${index + 1} absolute flex items-center gap-3 rounded-2xl border border-white/10 bg-[#f8f8f7] px-3 py-3 text-[#151719] shadow-[0_18px_45px_rgba(0,0,0,0.32)] sm:px-4`} key={asset.symbol}>
            <MarketLogo symbol={asset.symbol} />
            <div className="min-w-[90px]">
              <p className="text-xs font-semibold">{asset.name}</p>
              <p className="mt-1 text-[11px] text-[#707780]">{quote ? formatPrice(quote.price) : asset.fallbackPrice}</p>
            </div>
            {quote && Number.isFinite(Number(quote.change24h)) && (
              <span className={`text-[11px] font-semibold ${Number(quote.change24h) >= 0 ? 'text-[#14843a]' : 'text-[#c5343b]'}`}>
                {Number(quote.change24h) >= 0 ? '+' : ''}{Number(quote.change24h).toFixed(2)}%
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

const Invest = () => (
  <div>
    <section className="relative isolate overflow-hidden bg-[#111416] text-white">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_80%_20%,rgba(255,16,24,0.2),transparent_38%),linear-gradient(135deg,#111416_20%,#202629_100%)]" />
      <Navbar />
      <div className="mx-auto grid max-w-[1440px] items-center gap-8 px-6 pb-16 pt-8 sm:px-10 sm:pb-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-4 lg:px-12 lg:pb-20 lg:pt-8">
        <div className="max-w-[690px]">
          <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/85">Invest</span>
          <h1 className="mt-6 text-[clamp(3rem,6vw,5.25rem)] font-semibold leading-[0.98] tracking-[-0.065em]">
            Make your next move with clarity.
          </h1>
          <p className="mt-6 max-w-[620px] text-base leading-7 text-white/75 sm:text-lg sm:leading-8">
            Explore stocks, ETFs, crypto, and investment plans. Compare market information and find an approach that fits your goals and risk tolerance.
          </p>
          <Link className="mt-8 inline-flex min-h-12 items-center gap-3 rounded-lg bg-[#1caf35] px-6 text-sm font-bold text-white transition-colors hover:bg-[#15952b]" to="/markets">
            Explore live markets <span aria-hidden="true" className="text-lg leading-none">→</span>
          </Link>
        </div>
        <InvestMarketVisual />
      </div>
    </section>

    <main>
      <Investment />
      <MarketsSection />
      <RatesSection />
    </main>

    <Footer />
  </div>
)

export default Invest
