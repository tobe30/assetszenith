import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import MarketLogo from './MarketLogo'

const tabs = [
  { id: 'all', label: 'All' },
  { id: 'crypto', label: 'Crypto' },
  { id: 'indexes', label: 'Indexes' },
  { id: 'stocks', label: 'Stocks' },
  { id: 'forex', label: 'Forex' },
]

const formatPrice = (value, currency = 'USD') => {
  const number = Number(value)
  if (!Number.isFinite(number)) return '—'
  if (currency === 'RATE') return number.toFixed(5)
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: number < 1 ? 5 : 2,
  }).format(number)
}

const MarketsSection = ({ showIntro = true, initialTab = 'all' }) => {
  const [searchParams] = useSearchParams()
  const searchFromUrl = searchParams.get('search') || ''
  const [activeTab, setActiveTab] = useState(initialTab)
  const [search, setSearch] = useState(searchFromUrl)
  const [marketData, setMarketData] = useState({ items: [], missingProviders: [], updatedAt: null })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setSearch(searchFromUrl)
  }, [searchFromUrl])

  useEffect(() => {
    let active = true
    const loadMarkets = async () => {
      try {
        const response = await fetch('/api/markets')
        const body = await response.text()
        let result
        try {
          result = JSON.parse(body)
        } catch {
          throw new Error(response.ok
            ? 'The market API returned an empty or invalid response.'
            : 'The market API is unavailable. Restart the development server and try again.')
        }
        if (!response.ok) throw new Error(result.error || 'Market data is unavailable right now.')
        if (active) {
          setMarketData(result)
          setError('')
        }
      } catch (fetchError) {
        if (active) setError(fetchError.message)
      } finally {
        if (active) setLoading(false)
      }
    }

    loadMarkets()
    return () => {
      active = false
    }
  }, [])

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase()
    return marketData.items.filter((item) => {
      const matchesTab = activeTab === 'all' || item.category === activeTab
      const matchesSearch = !query || `${item.name} ${item.symbol}`.toLowerCase().includes(query)
      return matchesTab && matchesSearch
    })
  }, [activeTab, marketData.items, search])

  const needsCryptoKey = marketData.missingProviders.includes('coingecko')
  const needsStocksKey = marketData.missingProviders.includes('twelvedata')
  const hasConfiguredProvider = marketData.missingProviders.length < 2

  return (
    <section aria-label={showIntro ? undefined : 'Market prices'} aria-labelledby={showIntro ? 'markets-heading' : undefined} className="bg-[#fafafa] px-5 py-16 text-[#101114] sm:px-8 sm:py-20 lg:px-12 lg:py-24" id="markets">
      {showIntro && <div className="mx-auto max-w-[1152px] text-center">
        <span className="inline-flex rounded-full bg-[#f0f1f2] px-3 py-1 text-xs font-semibold">Markets</span>
        <h2 className="mx-auto mt-4 max-w-[760px] text-4xl font-semibold leading-[1.06] tracking-[-0.055em] sm:text-5xl">
          Discover market opportunities
        </h2>
        <p className="mx-auto mt-4 max-w-[600px] text-base leading-6 text-[#59616b]">
          Explore current crypto, stock, index ETF, and currency prices in one place.
        </p>
      </div>}

      <div className="mx-auto mt-10 max-w-[900px] overflow-hidden rounded-2xl border border-[#e7e8ea] bg-white shadow-[0_8px_28px_rgba(16,17,20,0.06)] sm:mt-14">
        <label className="mx-4 mt-4 flex h-14 items-center gap-3 rounded-xl border border-[#d8dadd] px-4 text-[#8a9098] shadow-sm sm:mx-5 sm:mt-5">
          <svg aria-hidden="true" fill="none" height="20" viewBox="0 0 24 24" width="20">
            <circle cx="10.8" cy="10.8" r="6.8" stroke="currentColor" strokeWidth="1.7" />
            <path d="m16 16 4.2 4.2" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" />
          </svg>
          <span className="sr-only">Search markets</span>
          <input
            className="min-w-0 flex-1 bg-transparent text-sm text-[#101114] outline-none placeholder:text-[#8a9098] sm:text-base"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search markets"
            type="search"
            value={search}
          />
        </label>

        <div aria-label="Market categories" className="mt-2 flex gap-1 overflow-x-auto border-b border-[#e7e8ea] px-3 sm:px-5" role="tablist">
          {tabs.map((tab) => (
            <button
              aria-selected={activeTab === tab.id}
              className={`shrink-0 border-b-2 px-3 py-4 text-sm transition-colors sm:px-4 ${activeTab === tab.id ? 'border-[#ff1018] font-semibold text-[#101114]' : 'border-transparent text-[#59616b] hover:text-[#101114]'}`}
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              role="tab"
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)_110px] gap-3 px-4 py-4 text-xs font-medium text-[#7c838c] sm:grid-cols-[minmax(220px,1fr)_130px_140px] sm:px-6">
          <span>Instrument</span>
          <span className="text-right sm:hidden">Price · 24h</span>
          <span className="hidden text-right sm:block">24h change</span>
          <span className="hidden text-right sm:block">Price</span>
        </div>

        <div aria-live="polite" className="min-h-36">
          {loading && <p className="px-6 py-10 text-center text-sm text-[#59616b]">Loading market data…</p>}
          {!loading && error && <p className="px-6 py-10 text-center text-sm text-[#9c3434]">{error}</p>}
          {!loading && !error && filteredItems.map((item) => {
            const change = item.change24h == null ? Number.NaN : Number(item.change24h)
            return (
              <div className="grid grid-cols-[minmax(0,1fr)_110px] items-center gap-3 border-t border-[#f0f1f2] px-4 py-4 text-sm sm:grid-cols-[minmax(220px,1fr)_130px_140px] sm:px-6" key={`${item.category}-${item.symbol}`}>
                <div className="flex min-w-0 items-center gap-3">
                  {item.image
                    ? <img alt="" className="h-9 w-9 rounded-full bg-[#f0f1f2] object-cover" src={item.image} />
                    : <MarketLogo symbol={item.symbol} />}
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-[#101114]">{item.name}</p>
                    <p className="truncate text-xs text-[#7c838c]">{item.symbol} · {item.typeLabel}</p>
                  </div>
                </div>
                <span className={`hidden text-right text-xs font-medium sm:block sm:text-sm ${change >= 0 ? 'text-[#159b42]' : 'text-[#d64141]'}`}>
                  {Number.isFinite(change) ? `${change >= 0 ? '+' : ''}${change.toFixed(2)}%` : '—'}
                </span>
                <div className="text-right">
                  <span className="block font-medium text-[#101114]">{formatPrice(item.price, item.currency)}</span>
                  <span className={`mt-1 block text-xs font-medium sm:hidden ${change >= 0 ? 'text-[#159b42]' : 'text-[#d64141]'}`}>
                    {Number.isFinite(change) ? `${change >= 0 ? '+' : ''}${change.toFixed(2)}%` : '—'}
                  </span>
                </div>
              </div>
            )
          })}
          {!loading && !error && filteredItems.length === 0 && (
            <div className="px-6 py-8 text-center text-sm text-[#59616b]">
              {!hasConfiguredProvider ? 'Add API keys to the server environment to load live market data.' : 'No market data found for this category yet.'}
            </div>
          )}
        </div>

        {!loading && marketData.warnings?.length > 0 && (
          <p className="border-t border-[#e7e8ea] px-5 py-3 text-xs leading-5 text-[#9c6334]">
            Some quotes could not be loaded. Check provider access and try again.
          </p>
        )}

        {(needsCryptoKey || needsStocksKey) && !error && (
          <p className="border-t border-[#e7e8ea] px-5 py-3 text-xs leading-5 text-[#7c838c]">
            {needsCryptoKey && 'Crypto data needs a CoinGecko API key. '}
            {needsStocksKey && 'Stocks, index ETFs, and forex need a Twelve Data API key.'}
          </p>
        )}
      </div>

      <p className="mx-auto mt-4 max-w-[900px] text-center text-xs leading-5 text-[#7c838c]">
        Prices refresh every minute. Index exposure is shown through index-tracking ETFs. Data provided by <a className="font-medium underline underline-offset-2" href="https://www.coingecko.com/en/api" rel="noreferrer" target="_blank">CoinGecko</a>.
        {marketData.updatedAt && ` Last updated ${new Date(marketData.updatedAt).toLocaleTimeString()}.`}
      </p>
    </section>
  )
}

export default MarketsSection
