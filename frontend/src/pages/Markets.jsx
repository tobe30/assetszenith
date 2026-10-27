import { useEffect, useState } from 'react'
import Footer from '../components/Footer'
import MarketLogo from '../components/MarketLogo'
import MarketsSection from '../components/MarketsSection'
import Navbar from '../components/Navbar'

const snapshotSymbols = [
  { symbol: 'BTC', label: 'Bitcoin', category: 'Crypto' },
  { symbol: 'ETH', label: 'Ethereum', category: 'Crypto' },
  { symbol: 'SOL', label: 'Solana', category: 'Crypto' },
  { symbol: 'TSLA', label: 'Tesla', category: 'Stock' },
  { symbol: 'AMZN', label: 'Amazon', category: 'Stock' },
  { symbol: 'GOOGL', label: 'Alphabet', category: 'Stock' },
]

const formatPrice = (value) => {
  const price = Number(value)
  if (!Number.isFinite(price)) return '—'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: price < 1 ? 5 : 2 }).format(price)
}

const MarketSnapshot = () => {
  const [quotes, setQuotes] = useState({})

  useEffect(() => {
    let mounted = true
    const loadMarkets = async () => {
      try {
        const response = await fetch('/api/markets')
        if (!response.ok) return
        const data = await response.json()
        if (mounted) setQuotes(Object.fromEntries(data.items.map((item) => [item.symbol.toUpperCase(), item])))
      } catch {
        // The market table below provides its own loading and error states.
      }
    }

    loadMarkets()
    return () => {
      mounted = false
    }
  }, [])

  return (
    <section aria-label="Featured market snapshot" className="bg-white px-5 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto grid max-w-[1152px] grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {snapshotSymbols.map((asset) => {
          const quote = quotes[asset.symbol]
          const change = quote?.change24h == null ? Number.NaN : Number(quote.change24h)
          return (
            <article className="flex min-w-0 items-center gap-3 rounded-2xl border border-[#e9eaec] bg-white p-4 shadow-[0_4px_18px_rgba(16,17,20,0.035)]" key={asset.symbol}>
              {quote?.image
                ? <img alt="" className="h-10 w-10 shrink-0 rounded-full bg-[#f0f1f2] object-cover" loading="lazy" src={quote.image} />
                : <MarketLogo symbol={asset.symbol} />}
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs text-[#7c838c]">{asset.category}</p>
                <p className="mt-1 truncate text-sm font-semibold text-[#101114]">{asset.label}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-[#101114]">{quote ? formatPrice(quote.price) : '—'}</p>
                <p className={`mt-1 text-xs font-medium ${Number.isFinite(change) && change < 0 ? 'text-[#d64141]' : 'text-[#159b42]'}`}>
                  {Number.isFinite(change) ? `${change >= 0 ? '+' : ''}${change.toFixed(2)}%` : '—'}
                </p>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

const Markets = () => (
  <div>
    <section className="relative isolate overflow-hidden bg-[#111416] text-white">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_78%_30%,rgba(255,16,24,0.18),transparent_35%),linear-gradient(135deg,#111416_20%,#202629_100%)]" />
      <Navbar />
      <div className="mx-auto flex max-w-[1440px] flex-col gap-8 px-6 pb-12 pt-6 sm:px-10 sm:pb-14 lg:flex-row lg:items-end lg:justify-between lg:px-12 lg:pb-16">
        <div className="max-w-[760px]">
          <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/85">Markets</span>
          <h1 className="mt-5 text-[clamp(3rem,7vw,5.25rem)] font-semibold leading-[0.98] tracking-[-0.065em]">Explore the markets</h1>
          <p className="mt-5 max-w-[650px] text-base leading-7 text-white/75 sm:text-lg sm:leading-8">
            Follow stocks, crypto, index-tracking ETFs, and forex in one clear market view.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3 rounded-full border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-white/75">
          <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-[#1caf35] shadow-[0_0_12px_rgba(28,175,53,0.8)]" />
          Latest available market data
        </div>
      </div>
    </section>

    <main>
      <MarketSnapshot />
      <MarketsSection showIntro={false} />
    </main>
    <Footer />
  </div>
)

export default Markets
