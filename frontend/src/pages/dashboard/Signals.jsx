import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { EmptyState, PageHeading, Panel } from '../../components/dashboard/DashboardPageUI'

const Signals = () => {
  const [activeTab, setActiveTab] = useState('signals')
  return (
    <div className="mx-auto max-w-[1100px]">
      <PageHeading eyebrow="Trade signals" title="Signals" description="View market signal updates and manage your signal subscription." />
      <Panel className="overflow-hidden p-5 sm:p-7">
        <div aria-label="Signal sections" className="flex gap-1 overflow-x-auto border-b border-[#dfe4e6]" role="tablist">{[['signals', 'View signals'], ['subscription', 'Signal subscription']].map(([id, label]) => <button aria-selected={activeTab === id} className={`-mb-px shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition ${activeTab === id ? 'border-[#1caf35] text-[#20262a]' : 'border-transparent text-[#748087] hover:text-[#20262a]'}`} key={id} onClick={() => setActiveTab(id)} role="tab" type="button">{label}</button>)}</div>
        {activeTab === 'signals' ? <EmptyState icon={Sparkles} title="No signals found" description="When a verified signal feed is connected, market signals will be listed here." action={<button className="text-[13px] font-semibold text-[#16852d] hover:text-[#116d25]" onClick={() => setActiveTab('subscription')} type="button">Review signal plans →</button>} /> : <div className="py-2"><div className="mb-5 flex items-center justify-between gap-3"><div><h2 className="text-base font-semibold text-[#252d31]">Signal plans</h2><p className="mt-1 text-[13px] text-[#727b82]">Available plans and your subscription status.</p></div><Link className="text-[13px] font-semibold text-[#16852d] hover:text-[#116d25]" to="/dashboard/signals/subscribe">Manage subscriptions</Link></div><EmptyState icon={Sparkles} title="No signal plans found" description="Signal plans will appear here once the service is configured." /></div>}
      </Panel>
    </div>
  )
}

export default Signals
