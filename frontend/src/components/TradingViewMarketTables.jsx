import { useDashboardTheme } from './DashboardThemeContext'
import TradingViewMarketPanel from './TradingViewMarketPanel'

const cryptoMarketConfig = {
  defaultColumn: 'overview',
  screener_type: 'crypto_mkt',
  displayCurrency: 'USD',
  colorTheme: 'light',
  isTransparent: false,
  locale: 'en',
  width: '100%',
  height: '100%',
}

const stockMarketConfig = {
  title: 'Stock Market Data',
  width: '100%',
  height: '100%',
  locale: 'en',
  showSymbolLogo: true,
  symbolsGroups: [
    {
      name: 'Stocks',
      symbols: [
        { name: 'NASDAQ:AAPL', displayName: 'Apple' },
        { name: 'NASDAQ:GOOGL', displayName: 'Alphabet' },
        { name: 'NASDAQ:NVDA', displayName: 'NVIDIA' },
        { name: 'NASDAQ:AMZN', displayName: 'Amazon' },
        { name: 'NASDAQ:TSLA', displayName: 'Tesla' },
        { name: 'NASDAQ:META', displayName: 'Meta Platforms' },
      ],
    },
  ],
  colorTheme: 'light',
}

const TradingViewMarketTables = () => {
  const theme = useDashboardTheme()
  return (
  <section aria-label="Markets overview" className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-2">
    <TradingViewMarketPanel
      config={{ ...cryptoMarketConfig, colorTheme: theme }}
      description="Top crypto assets by market capitalization"
      height={480}
      scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-screener.js"
      title="Cryptocurrency Market"
    />
    <TradingViewMarketPanel
      config={{ ...stockMarketConfig, colorTheme: theme }}
      description="Selected stocks with current market prices"
      height={480}
      scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-market-quotes.js"
      title="Stock Market Data"
    />
  </section>
  )
}

export default TradingViewMarketTables
