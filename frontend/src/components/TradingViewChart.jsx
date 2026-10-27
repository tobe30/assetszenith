import { useEffect, useRef, useState } from 'react'
import { useDashboardTheme } from './DashboardThemeContext'

const tradingViewScript = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js'

const chartConfig = {
  autosize: true,
  symbol: 'BITSTAMP:BTCUSD',
  interval: 'D',
  timezone: 'Etc/UTC',
  theme: 'light',
  style: '1',
  locale: 'en',
  withdateranges: true,
  hide_side_toolbar: false,
  hide_top_toolbar: false,
  hide_legend: false,
  hide_volume: false,
  allow_symbol_change: true,
  save_image: true,
  calendar: false,
  support_host: 'https://www.tradingview.com',
  backgroundColor: '#ffffff',
  gridColor: 'rgba(46, 46, 46, 0.06)',
  studies: ['Volume@tv-basicstudies'],
}

const TradingViewChart = () => {
  const theme = useDashboardTheme()
  const containerRef = useRef(null)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    setStatus('loading')
    const container = containerRef.current
    if (!container) return

    let timeoutId
    container.replaceChildren()
    const widget = document.createElement('div')
    widget.className = 'tradingview-widget-container__widget h-full w-full'
    widget.style.height = '100%'
    widget.style.width = '100%'

    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = tradingViewScript
    script.async = true
    script.textContent = JSON.stringify({ ...chartConfig, theme: theme === 'dark' ? 'dark' : 'light', backgroundColor: theme === 'dark' ? '#111416' : '#ffffff', gridColor: theme === 'dark' ? 'rgba(220, 230, 235, 0.08)' : 'rgba(46, 46, 46, 0.06)' })
    script.onload = () => {
      window.clearTimeout(timeoutId)
      setStatus('loaded')
    }
    script.onerror = () => {
      window.clearTimeout(timeoutId)
      setStatus('error')
    }
    timeoutId = window.setTimeout(() => setStatus((current) => current === 'loading' ? 'error' : current), 15000)

    container.append(widget, script)
    return () => window.clearTimeout(timeoutId)
  }, [theme])

  return (
    <section aria-label="Bitcoin to U.S. dollar market chart" className="relative h-[min(70vh,640px)] min-h-[420px] w-full overflow-hidden rounded-2xl border border-[#dfe4e6] bg-white shadow-[0_2px_12px_rgba(20,30,25,0.04)] sm:h-[min(72vh,720px)]">
      <div className="tradingview-widget-container h-full w-full" ref={containerRef} />
      {status !== 'loaded' && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white px-5 text-center text-base text-[#687179]">
          {status === 'loading' ? 'Loading TradingView chart…' : 'TradingView chart is unavailable right now.'}
        </div>
      )}
    </section>
  )
}

export default TradingViewChart
