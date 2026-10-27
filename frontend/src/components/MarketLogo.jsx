const MarketLogo = ({ symbol }) => {
  const normalizedSymbol = symbol.toUpperCase()

  if (normalizedSymbol === 'TSLA') {
    return (
      <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#ececef] bg-white">
        <svg fill="#e82127" height="23" viewBox="0 0 24 24" width="23">
          <path d="M2 5.2c6.2-2.1 13.8-2.1 20 0l-1.1 2.1c-2.8-.8-5.7-1.2-8-1.3l-1 13.4-1.8-13.4c-2.3.1-5.2.5-8 1.3L2 5.2Z" />
        </svg>
      </span>
    )
  }

  if (normalizedSymbol === 'AMZN') {
    return (
      <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#ececef] bg-white">
        <svg fill="none" height="25" viewBox="0 0 32 32" width="25">
          <path d="M9 18.8V12c0-3 2.1-4.8 5.9-4.8 2 0 3.9.4 5.5 1v8.5c-1.5 1.1-3.1 1.6-4.9 1.6-3 0-4.8-1.5-4.8-4 0-2.6 2-4 5.3-4h1.2V9.7c-.7-.3-1.5-.4-2.3-.4-2.2 0-3.5.9-3.5 2.7H9Zm4.6-4.1c0 1.3.9 2 2.5 2 1 0 2-.3 3-.9v-3.1h-1.2c-2.8 0-4.3.7-4.3 2Z" fill="#232f3e" />
          <path d="M5 22c6.4 3.9 15.9 3.8 22-.3" stroke="#ff9900" strokeLinecap="round" strokeWidth="2" />
          <path d="m23.4 20.3 3.8 1.1-1.3 3.4" stroke="#ff9900" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </svg>
      </span>
    )
  }

  if (normalizedSymbol === 'GOOGL') {
    return (
      <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#ececef] bg-white">
        <svg height="21" viewBox="0 0 48 48" width="21">
          <path fill="#4285F4" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.6c3.9-3.6 6.1-8.8 6.1-15Z" />
          <path fill="#34A853" d="M24 44c5.5 0 10.2-1.8 13.5-4.9l-6.6-5.1c-1.8 1.2-4 1.9-6.9 1.9-5.3 0-9.8-3.6-11.4-8.4H5.8v5.3A20 20 0 0 0 24 44Z" />
          <path fill="#FBBC05" d="M12.6 27.5a12 12 0 0 1 0-7v-5.3H5.8a20 20 0 0 0 0 17.6l6.8-5.3Z" />
          <path fill="#EA4335" d="M24 12.1c3 0 5.7 1 7.8 3.1l5.9-5.9C34.1 6.1 29.5 4 24 4A20 20 0 0 0 5.8 15.2l6.8 5.3c1.6-4.8 6.1-8.4 11.4-8.4Z" />
        </svg>
      </span>
    )
  }

  if (normalizedSymbol === 'BTC') {
    return (
      <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f7931a] text-lg font-bold text-white">₿</span>
    )
  }

  if (normalizedSymbol === 'ETH') {
    return (
      <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#e7e8ef] bg-[#f5f6fb]">
        <svg fill="none" height="22" viewBox="0 0 24 24" width="22">
          <path d="m12 2.5-6.1 10L12 16l6.1-3.5L12 2.5Z" fill="#627EEA" />
          <path d="m5.9 13.7 6.1 7.8 6.1-7.8L12 17.2l-6.1-3.5Z" fill="#8A9FF0" />
        </svg>
      </span>
    )
  }

  if (normalizedSymbol === 'SOL') {
    return (
      <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#111416]">
        <svg fill="none" height="18" viewBox="0 0 24 18" width="22">
          <path d="M4 2h17l-3 3H1l3-3Z" fill="#80F4B2" />
          <path d="M4 7.5h17l-3 3H1l3-3Z" fill="#54D5A4" />
          <path d="M4 13h17l-3 3H1l3-3Z" fill="#9945FF" />
        </svg>
      </span>
    )
  }

  const indexStyles = {
    SPY: 'text-[#0b3b70]',
    QQQ: 'text-[#1673b8]',
    DIA: 'text-[#26334a]',
  }

  return (
    <span aria-hidden="true" className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#ececef] bg-white text-[10px] font-extrabold tracking-[-0.06em] ${indexStyles[normalizedSymbol] || 'text-[#4b535c]'}`}>
      {['SPY', 'QQQ', 'DIA'].includes(normalizedSymbol) ? normalizedSymbol : normalizedSymbol.slice(0, 2)}
    </span>
  )
}

export default MarketLogo
