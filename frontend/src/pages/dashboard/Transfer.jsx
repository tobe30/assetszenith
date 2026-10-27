import { useState } from 'react'
import { ArrowLeftRight, ArrowRight, FileClock } from 'lucide-react'
import { AccountBalanceGrid, EmptyState, PageHeading, Panel } from '../../components/dashboard/DashboardPageUI'

const tabs = [
  { id: 'portfolio-account', label: 'From Investment To Account', from: 'Investment balance', to: 'Wallet balance' },
  { id: 'account-portfolio', label: 'From Account To Investment', from: 'Wallet balance', to: 'Investment balance' },
  { id: 'commission-account', label: 'Transfer Commission To Account', from: 'Referral commission', to: 'Wallet balance' },
]

const Transfer = () => {
  const [activeTab, setActiveTab] = useState(tabs[0].id)
  const [notice, setNotice] = useState('')
  const tab = tabs.find(({ id }) => id === activeTab)

  return (
    <div className="mx-auto max-w-[1100px]">
      <PageHeading eyebrow="Money" title="Internal fund transfer" description="Move funds between your wallet, investment balance, and referral commission." />
      <AccountBalanceGrid />
      <Panel className="overflow-hidden p-5 sm:p-7">
        <div className="mb-5"><h2 className="text-base font-semibold text-[#252d31]">Transfer funds</h2><p className="mt-1 text-[13px] text-[#727b82]">Select the direction of your transfer.</p></div>
        <div aria-label="Transfer type" className="flex gap-1 overflow-x-auto border-b border-[#dfe4e6]" role="tablist">{tabs.map(({ id, label }) => <button aria-selected={activeTab === id} className={`-mb-px shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition ${activeTab === id ? 'border-[#1caf35] text-[#20262a]' : 'border-transparent text-[#748087] hover:text-[#20262a]'}`} key={id} onClick={() => { setActiveTab(id); setNotice('') }} role="tab" type="button">{label}</button>)}</div>
        <div className="grid gap-5 pt-6 md:grid-cols-[1fr_auto_1fr] md:items-end">
          <div className="rounded-xl border border-[#e7ebe9] bg-[#fafbfa] p-4"><p className="text-xs font-medium uppercase tracking-[0.08em] text-[#858e94]">Transfer from</p><p className="mt-2 text-base font-semibold text-[#252d31]">{tab.from}</p><p className="mt-1 text-[13px] text-[#727b82]">Available balance · GBP 0.00</p></div>
          <span aria-hidden="true" className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#eaf7ec] text-[#1caf35]"><ArrowRight className="h-5 w-5" /></span>
          <div className="rounded-xl border border-[#e7ebe9] bg-[#fafbfa] p-4"><p className="text-xs font-medium uppercase tracking-[0.08em] text-[#858e94]">Transfer to</p><p className="mt-2 text-base font-semibold text-[#252d31]">{tab.to}</p><p className="mt-1 text-[13px] text-[#727b82]">Destination balance</p></div>
        </div>
        <div className="mt-5 max-w-[520px]">
          <label className="block text-sm font-medium text-[#505a60]">Transfer amount<input className="mt-2 h-11 w-full rounded-xl border border-[#dfe4e6] px-3 text-sm outline-none focus:border-[#1caf35] focus:ring-4 focus:ring-[#1caf35]/[0.08]" min="1" placeholder="GBP 0.00" step="0.01" type="number" /></label>
          {notice && <div className="mt-4"><p aria-live="polite" className="rounded-xl border border-[#e7ebe9] bg-[#f8faf8] px-4 py-3 text-[13px] leading-5 text-[#586168]">{notice}</p></div>}
          <button className="mt-4 inline-flex h-11 items-center gap-2 rounded-xl bg-[#1caf35] px-5 text-sm font-semibold text-white transition hover:bg-[#15952b]" onClick={() => setNotice('Internal transfers are not connected yet. No funds were moved.')} type="button"><ArrowLeftRight aria-hidden="true" className="h-4 w-4" />Review transfer</button>
        </div>
        <div className="mt-5 border-t border-[#edf0ef] pt-4"><EmptyState icon={FileClock} title="Transfer history" description="Your completed internal transfers will be listed here when transaction records are connected." /></div>
      </Panel>
    </div>
  )
}

export default Transfer
