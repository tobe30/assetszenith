import { useState } from 'react'
import { Activity, ArrowDownRight, ArrowUpRight, FileClock } from 'lucide-react'
import TradingViewTicker from '../../components/TradingViewTicker'
import TradingViewChart from '../../components/TradingViewChart'
import { AccountBalanceGrid, EmptyState, PageHeading, Panel } from '../../components/dashboard/DashboardPageUI'

const instruments = ['Bitcoin (BTC/USD)', 'Ethereum (ETH/USD)', 'Tesla (TSLA)', 'Amazon (AMZN)', 'Alphabet (GOOGL)', 'Apple (AAPL)']
const fieldClass = 'mt-2 h-11 w-full rounded-xl border border-[#dfe4e6] bg-white px-3 text-sm text-[#384147] outline-none focus:border-[#1caf35] focus:ring-4 focus:ring-[#1caf35]/[0.08]'

const LiveTrading = () => {
  const [activeTab, setActiveTab] = useState('live')
  const [notice, setNotice] = useState('')
  return (
    <div className="mx-auto max-w-[1250px]">
      <PageHeading eyebrow="Trading" title="Live trading" description="Follow live market charts and prepare an order. Review the risks before trading." />
      <AccountBalanceGrid />
      <Panel className="overflow-hidden p-5 sm:p-7">
        <div aria-label="Trading sections" className="flex gap-1 overflow-x-auto border-b border-[#dfe4e6]" role="tablist">{[['live', 'Real-time trading'], ['history', 'Trade history']].map(([id, label]) => <button aria-selected={activeTab === id} className={`-mb-px shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition ${activeTab === id ? 'border-[#1caf35] text-[#20262a]' : 'border-transparent text-[#748087] hover:text-[#20262a]'}`} key={id} onClick={() => { setActiveTab(id); setNotice('') }} role="tab" type="button">{label}</button>)}</div>
        {activeTab === 'history' ? <EmptyState icon={FileClock} title="No trades yet" description="Trade activity will appear here when order execution and account history are connected." /> : <div className="pt-5">
          <TradingViewTicker />
          <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(290px,0.8fr)]">
          <div className="min-w-0"><div className="mb-3 flex items-center gap-2"><Activity aria-hidden="true" className="h-4 w-4 text-[#1caf35]" /><span className="text-sm font-semibold text-[#384147]">BTC / USD</span><span className="text-[13px] text-[#858e94]">Market chart</span></div><TradingViewChart /></div>
          <div className="rounded-2xl border border-[#e7ebe9] bg-[#fafbfa] p-4 sm:p-5">
            <h2 className="text-base font-semibold text-[#252d31]">Order details</h2>
            <p className="mt-1 text-[13px] leading-5 text-[#727b82]">Prepare an order using your selected instrument and risk limits.</p>
            <div className="mt-4 rounded-xl border border-[#e7ebe9] bg-white p-3.5"><p className="text-xs text-[#858e94]">Available balance</p><p className="mt-1 text-lg font-semibold text-[#252d31]">GBP 0.00</p></div>
            <div className="mt-4 space-y-4">
              <label className="block text-[13px] font-medium text-[#748087]">Trading instrument<select className={fieldClass} defaultValue={instruments[0]}>{instruments.map((item) => <option key={item}>{item}</option>)}</select></label>
              <label className="block text-[13px] font-medium text-[#748087]">Trade volume (lot size)<input className={fieldClass} defaultValue="0.1" min="0.01" step="0.01" type="number" /></label>
              <div className="grid grid-cols-2 gap-3"><label className="block text-[13px] font-medium text-[#748087]">Stop loss<input className={fieldClass} min="0" placeholder="Optional" type="number" /></label><label className="block text-[13px] font-medium text-[#748087]">Take profit<input className={fieldClass} min="0" placeholder="Optional" type="number" /></label></div>
              <div className="grid grid-cols-2 gap-3"><button className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border border-[#dfe4e6] bg-white text-sm font-semibold text-[#d14a50] transition hover:bg-[#fff5f5]" onClick={() => setNotice('Order execution is not connected. No sell order was placed.')} type="button"><ArrowDownRight aria-hidden="true" className="h-4 w-4" />Sell</button><button className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-[#1caf35] text-sm font-semibold text-white transition hover:bg-[#15952b]" onClick={() => setNotice('Order execution is not connected. No buy order was placed.')} type="button"><ArrowUpRight aria-hidden="true" className="h-4 w-4" />Buy</button></div>
              {notice && <p aria-live="polite" className="rounded-xl border border-[#e7ebe9] bg-white px-3.5 py-3 text-[13px] leading-5 text-[#586168]">{notice}</p>}
              <p className="text-xs leading-5 text-[#858e94]">Trading involves risk. These controls are a UI preview and will not execute orders.</p>
            </div>
          </div>
          </div>
        </div>}
      </Panel>
    </div>
  )
}

export default LiveTrading
