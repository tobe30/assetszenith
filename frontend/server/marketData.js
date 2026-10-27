const cryptoIds = 'bitcoin,ethereum,solana,dogecoin'
const twelveDataInstruments = [
  { symbol: 'TSLA', name: 'Tesla', category: 'stocks', typeLabel: 'Stock', currency: 'USD' },
  { symbol: 'AMZN', name: 'Amazon', category: 'stocks', typeLabel: 'Stock', currency: 'USD' },
  { symbol: 'GOOGL', name: 'Alphabet', category: 'stocks', typeLabel: 'Stock', currency: 'USD' },
  { symbol: 'SPY', name: 'S&P 500 ETF', category: 'indexes', typeLabel: 'Index ETF', currency: 'USD' },
  { symbol: 'QQQ', name: 'Nasdaq-100 ETF', category: 'indexes', typeLabel: 'Index ETF', currency: 'USD' },
  { symbol: 'DIA', name: 'Dow Jones ETF', category: 'indexes', typeLabel: 'Index ETF', currency: 'USD' },
  { symbol: 'EUR/USD', name: 'Euro / US Dollar', category: 'forex', typeLabel: 'Forex', currency: 'RATE' },
  { symbol: 'GBP/USD', name: 'British Pound / US Dollar', category: 'forex', typeLabel: 'Forex', currency: 'RATE' },
]

let cachedPayload
let cacheExpiresAt = 0
let pendingRequest

const getCryptoMarkets = async (apiKey) => {
  const query = new URLSearchParams({
    vs_currency: 'usd',
    ids: cryptoIds,
    price_change_percentage: '24h',
  })
  const response = await fetch(`https://api.coingecko.com/api/v3/coins/markets?${query}`, {
    headers: { 'x-cg-demo-api-key': apiKey },
    signal: AbortSignal.timeout(8_000),
  })
  if (!response.ok) throw new Error(`CoinGecko returned HTTP ${response.status}.`)
  const markets = await response.json()
  if (!Array.isArray(markets)) throw new Error('CoinGecko returned an unexpected response.')

  return markets.map((coin) => ({
    symbol: coin.symbol.toUpperCase(),
    name: coin.name,
    category: 'crypto',
    typeLabel: 'Crypto',
    currency: 'USD',
    price: coin.current_price,
    change24h: coin.price_change_percentage_24h,
    image: coin.image,
  }))
}

const getTwelveDataQuote = async (instrument, apiKey) => {
  const query = new URLSearchParams({ symbol: instrument.symbol, apikey: apiKey })
  const response = await fetch(`https://api.twelvedata.com/quote?${query}`, {
    signal: AbortSignal.timeout(8_000),
  })
  if (!response.ok) throw new Error(`Twelve Data returned HTTP ${response.status} for ${instrument.symbol}.`)
  const quote = await response.json()
  if (quote.status === 'error' || quote.code) throw new Error(quote.message || `Twelve Data could not load ${instrument.symbol}.`)

  const close = Number(quote.close)
  const percentChange = Number(quote.percent_change)
  const price = Number.isFinite(close) ? close : Number(quote.price)
  if (!Number.isFinite(price)) throw new Error(`Twelve Data returned no usable price for ${instrument.symbol}.`)

  return {
    ...instrument,
    price,
    change24h: Number.isFinite(percentChange) ? percentChange : null,
  }
}

const collectMarkets = async () => {
  const coinGeckoKey = process.env.COINGECKO_API_KEY
  const twelveDataKey = process.env.TWELVE_DATA_API_KEY
  const missingProviders = []
  const warnings = []
  const items = []

  const cryptoRequest = coinGeckoKey
    ? getCryptoMarkets(coinGeckoKey).then((markets) => items.push(...markets)).catch((error) => warnings.push(error.message))
    : Promise.resolve(missingProviders.push('coingecko'))

  const stocksRequest = twelveDataKey
    ? Promise.allSettled(twelveDataInstruments.map((instrument) => getTwelveDataQuote(instrument, twelveDataKey))).then((results) => {
      for (const result of results) {
        if (result.status === 'fulfilled') items.push(result.value)
        else warnings.push(result.reason.message)
      }
    })
    : Promise.resolve(missingProviders.push('twelvedata'))

  await Promise.all([cryptoRequest, stocksRequest])
  return { items, missingProviders, warnings, updatedAt: new Date().toISOString() }
}

export const getMarketData = async () => {
  if (cachedPayload && Date.now() < cacheExpiresAt) return cachedPayload
  if (pendingRequest) return pendingRequest

  pendingRequest = collectMarkets()
  try {
    cachedPayload = await pendingRequest
    cacheExpiresAt = Date.now() + 60_000
    return cachedPayload
  } finally {
    pendingRequest = undefined
  }
}
