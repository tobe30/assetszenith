import { useEffect, useRef, useState } from 'react'
import { useDashboardTheme } from './DashboardThemeContext'

const tradingViewScript = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js'

const widgetConfig = {
  symbols: [
    { proName: 'FOREXCOM:SPXUSD', title: 'S&P 500' },
    { proName: 'FOREXCOM:NSXUSD', title: 'Nasdaq 100' },
    { proName: 'FX_IDC:EURUSD', title: 'EUR/USD' },
    { proName: 'BITSTAMP:BTCUSD', title: 'BTC/USD' },
    { proName: 'BITSTAMP:ETHUSD', title: 'ETH/USD' },
  ],
  colorTheme: 'light',
  locale: 'en',
  largeChartUrl: '',
  isTransparent: false,
  showSymbolLogo: true,
  // Keep the full price/change layout on narrow screens; the widget scrolls to fit.
  displayMode: 'regular',
}

const TradingViewTicker = () => {
  const theme = useDashboardTheme()
  const widgetRef = useRef(null)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    setStatus('loading')
    const container = widgetRef.current
    if (!container) return

    let timeoutId
    container.replaceChildren()
    const widget = document.createElement('div')
    widget.className = 'tradingview-widget-container__widget h-11 w-full min-w-0 overflow-hidden'
    widget.style.width = '100%'

    const fitWidgetFrame = () => {
      const frame = widget.querySelector('iframe')
      if (!frame) return false
      frame.style.display = 'block'
      frame.style.width = '100%'
      frame.style.maxWidth = '100%'
      frame.style.minWidth = '0'
      frame.style.height = '44px'
      frame.style.border = '0'
      frame.style.outline = 'none'
      return true
    }

    const observer = new MutationObserver(() => {
      if (fitWidgetFrame()) observer.disconnect()
    })
    observer.observe(widget, { childList: true, subtree: true })

    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = tradingViewScript
    script.async = true
    script.textContent = JSON.stringify({ ...widgetConfig, colorTheme: theme })
    script.onload = () => {
      window.clearTimeout(timeoutId)
      fitWidgetFrame()
      setStatus('loaded')
    }
    script.onerror = () => {
      window.clearTimeout(timeoutId)
      setStatus('error')
    }
    timeoutId = window.setTimeout(() => setStatus((current) => current === 'loading' ? 'error' : current), 12000)

    container.append(widget, script)
    return () => {
      window.clearTimeout(timeoutId)
      observer.disconnect()
    }
  }, [theme])

  return (
    <section aria-label="Live market ticker" className="overflow-hidden rounded-xl border border-[#cbd1d4] bg-white shadow-[0_3px_14px_rgba(20,30,25,0.05)]">
      <div className="relative h-11 w-full min-w-0 overflow-hidden">
        <div className="tradingview-widget-container h-11 w-full min-w-0 overflow-hidden" ref={widgetRef} />
        {status !== 'loaded' && (
          <div className="absolute inset-0 z-10 flex items-center gap-2 bg-white px-4 text-sm text-[#687179]">
            {status === 'loading'
              ? <><span aria-hidden="true" className="h-2 w-2 animate-pulse rounded-full bg-[#1caf35]" /> Loading TradingView market data…</>
              : <span>TradingView market data is unavailable right now.</span>}
          </div>
        )}
      </div>
    </section>
  )
}

export default TradingViewTicker
