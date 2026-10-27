import { useEffect, useRef, useState } from 'react'

const TradingViewMarketPanel = ({ title, description, scriptSrc, config, height = 460 }) => {
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
    script.src = scriptSrc
    script.async = true
    script.textContent = JSON.stringify(config)
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
  }, [config, scriptSrc])

  return (
    <article className="min-w-0 overflow-hidden rounded-2xl border border-[#dfe4e6] bg-white shadow-[0_2px_12px_rgba(20,30,25,0.04)]">
      <div className="flex min-h-[68px] items-center justify-between gap-3 border-b border-[#edf0f1] px-4 py-3.5 sm:px-5">
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold text-[#273036] sm:text-[17px]">{title}</h2>
          {description && <p className="mt-1 truncate text-xs text-[#899197] sm:text-[13px]">{description}</p>}
        </div>
        <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-[#1caf35]" />
      </div>
      <div className="relative min-w-0 overflow-hidden bg-white" style={{ height }}>
        <div className="tradingview-widget-container h-full w-full min-w-0 overflow-hidden" ref={containerRef} />
        {status !== 'loaded' && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white px-5 text-center text-sm text-[#687179]">
            {status === 'loading' ? `Loading ${title.toLowerCase()}…` : `${title} is unavailable right now.`}
          </div>
        )}
      </div>
    </article>
  )
}

export default TradingViewMarketPanel
