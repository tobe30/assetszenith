import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const serverDirectory = dirname(fileURLToPath(import.meta.url))
const projectDirectory = resolve(serverDirectory, '..')

const loadLocalEnv = async () => {
  try {
    const contents = await readFile(resolve(projectDirectory, '.env'), 'utf8')
    for (const line of contents.split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
      if (!match || match[1] in process.env) continue
      process.env[match[1]] = match[2].replace(/^(["'])(.*)\1$/, '$2')
    }
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }
}

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

const getCryptoMarkets = async (apiKey) => {
  const query = new URLSearchParams({
    vs_currency: 'usd',
    ids: cryptoIds,
    price_change_percentage: '24h',
  })
  const response = await fetch(`https://api.coingecko.com/api/v3/coins/markets?${query}`, {
    headers: { 'x-cg-demo-api-key': apiKey },
    signal: AbortSignal.timeout(12_000),
  })
  if (!response.ok) throw new Error(`CoinGecko returned HTTP ${response.status}.`)
  const markets = await response.json()
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
    signal: AbortSignal.timeout(12_000),
  })
  if (!response.ok) throw new Error(`Twelve Data returned HTTP ${response.status} for ${instrument.symbol}.`)
  const quote = await response.json()
  if (quote.status === 'error' || quote.code) throw new Error(quote.message || `Twelve Data could not load ${instrument.symbol}.`)

  const close = Number(quote.close)
  const percentChange = Number(quote.percent_change)
  return {
    ...instrument,
    price: Number.isFinite(close) ? close : Number(quote.price),
    change24h: Number.isFinite(percentChange) ? percentChange : null,
  }
}

const collectMarkets = async () => {
  const coinGeckoKey = process.env.COINGECKO_API_KEY
  const twelveDataKey = process.env.TWELVE_DATA_API_KEY
  const missingProviders = []
  const warnings = []
  const items = []

  if (coinGeckoKey) {
    try {
      items.push(...await getCryptoMarkets(coinGeckoKey))
    } catch (error) {
      warnings.push(error.message)
    }
  } else {
    missingProviders.push('coingecko')
  }

  if (twelveDataKey) {
    const quoteResults = await Promise.allSettled(
      twelveDataInstruments.map((instrument) => getTwelveDataQuote(instrument, twelveDataKey)),
    )
    for (const result of quoteResults) {
      if (result.status === 'fulfilled') items.push(result.value)
      else warnings.push(result.reason.message)
    }
  } else {
    missingProviders.push('twelvedata')
  }

  return { items, missingProviders, warnings, updatedAt: new Date().toISOString() }
}

await loadLocalEnv()

const server = createServer(async (request, response) => {
  const requestUrl = new URL(request.url || '/', 'http://localhost')
  if (requestUrl.pathname !== '/api/markets' || request.method !== 'GET') {
    response.writeHead(404, { 'Content-Type': 'application/json' })
    response.end(JSON.stringify({ error: 'Not found' }))
    return
  }

  try {
    if (!cachedPayload || Date.now() >= cacheExpiresAt) {
      cachedPayload = await collectMarkets()
      cacheExpiresAt = Date.now() + 60_000
    }
    response.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' })
    response.end(JSON.stringify(cachedPayload))
  } catch {
    response.writeHead(500, { 'Content-Type': 'application/json' })
    response.end(JSON.stringify({ error: 'Market data could not be loaded.' }))
  }
})

const port = Number(process.env.API_PORT || 3001)
server.listen(port, '127.0.0.1', () => {
  process.stdout.write(`Assets Zenith market API listening on http://127.0.0.1:${port}\n`)
})
