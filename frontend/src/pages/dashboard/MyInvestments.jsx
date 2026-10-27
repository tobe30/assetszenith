import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BarChart3, ChevronRight, FileClock, LoaderCircle, RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getMyInvestments, getWalletSummary } from '../../lib/api'
import { AccountBalanceGrid, EmptyState, Notice, PageHeading, Panel } from '../../components/dashboard/DashboardPageUI'

const tabs = ['My investments', 'Add new investment', 'Deposit funds', 'Deposit history']

const formatMoney = (amount, currency = 'USD') => {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency, minimumFractionDigits: 2 }).format(Number(amount) || 0)
  } catch {
    return `${currency} ${Number(amount || 0).toFixed(2)}`
  }
}

const formatDate = (value) => {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString()
}

const MyInvestments = () => {
  const [activeTab, setActiveTab] = useState(tabs[0])
  const tabIndex = tabs.indexOf(activeTab)
  const walletQuery = useQuery({ queryKey: ['walletSummary'], queryFn: getWalletSummary })
  const investmentsQuery = useQuery({ queryKey: ['myInvestments'], queryFn: () => getMyInvestments({ page: 1, limit: 50 }) })
  const wallet = walletQuery.data?.wallet
  const currency = wallet?.currency || 'USD'
  const investments = investmentsQuery.data?.investments || []
  const activeTotal = investments.filter((item) => item.status === 'active').reduce((sum, item) => sum + Number(item.amount || 0), 0)

  return (
    <div className="mx-auto max-w-[1100px]">
      <PageHeading eyebrow="Trading" title="My investments" description="Track your investment plans, amounts, and status." />
      <AccountBalanceGrid currency={currency} wallet={wallet} />
      <Panel className="overflow-hidden p-5 sm:p-7">
        <div aria-label="Investment sections" className="flex gap-1 overflow-x-auto border-b border-[#dfe4e6]" role="tablist">{tabs.map((tab) => <button aria-selected={activeTab === tab} className={`-mb-px shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition ${activeTab === tab ? 'border-[#1caf35] text-[#20262a]' : 'border-transparent text-[#748087] hover:text-[#20262a]'}`} key={tab} onClick={() => setActiveTab(tab)} role="tab" type="button">{tab}</button>)}</div>
        {tabIndex === 0 ? <div className="pt-5">
          {walletQuery.isError && <div className="mb-4"><Notice tone="error">Could not load your wallet summary.</Notice></div>}
          {investmentsQuery.isPending ? <div className="flex min-h-[180px] items-center justify-center gap-2 text-sm text-[#748087]"><LoaderCircle className="h-4 w-4 animate-spin" />Loading your investments…</div> : investmentsQuery.isError ? <div className="space-y-4"><Notice tone="error">{investmentsQuery.error.response?.data?.message || 'Could not load your investments.'}</Notice><button className="inline-flex items-center gap-2 text-sm font-semibold text-[#16852d]" onClick={() => investmentsQuery.refetch()} type="button"><RefreshCw className="h-4 w-4" />Try again</button></div> : investments.length === 0 ? <EmptyState icon={BarChart3} title="No investments found" description="Your investments will appear here after you start a plan." action={<Link className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#1caf35] px-4 text-[13px] font-semibold text-white hover:bg-[#15952b]" to="/dashboard/investments/new">Explore investment plans<ChevronRight className="h-4 w-4" /></Link>} /> : <>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#e7ebe9] bg-[#f8faf8] px-4 py-3"><div><p className="text-[12px] font-medium text-[#748087]">Active investment principal</p><p className="mt-1 text-lg font-semibold text-[#252d31]">{formatMoney(activeTotal, currency)}</p></div><p className="text-[13px] text-[#727b82]">{investments.filter((item) => item.status === 'active').length} active · {investments.length} total</p></div>
            <div className="overflow-x-auto"><table className="w-full min-w-[760px] border-collapse text-left text-sm"><thead><tr className="border-b border-[#e7ebe9] text-[12px] font-semibold uppercase tracking-wide text-[#7a858b]"><th className="px-3 py-3">Investment plan</th><th className="px-3 py-3">Amount</th><th className="px-3 py-3">ROI schedule</th><th className="px-3 py-3">Started</th><th className="px-3 py-3">Status</th></tr></thead><tbody>{investments.map((investment) => <tr className="border-b border-[#f0f2f1] last:border-0" key={investment._id}><td className="px-3 py-4 font-semibold text-[#252d31]">{investment.planName}</td><td className="whitespace-nowrap px-3 py-4 font-semibold text-[#252d31]">{formatMoney(investment.amount, investment.currency || currency)}</td><td className="px-3 py-4 text-[#586168]">{investment.roiPercent}% {investment.intervalLabel}</td><td className="whitespace-nowrap px-3 py-4 text-[#586168]">{formatDate(investment.startedAt)}</td><td className="px-3 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${investment.status === 'active' ? 'bg-[#eaf7ec] text-[#16852d]' : 'bg-[#f1f3f5] text-[#586168]'}`}>{investment.status}</span></td></tr>)}</tbody></table></div>
          </>}
        </div> : null}
        {tabIndex === 1 ? <EmptyState icon={BarChart3} title="Choose an investment plan" description="Review available plans and invest from your wallet balance." action={<Link className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#1caf35] px-4 text-[13px] font-semibold text-white hover:bg-[#15952b]" to="/dashboard/investments/new">View plans<ChevronRight className="h-4 w-4" /></Link>} /> : null}
        {tabIndex === 2 ? <EmptyState icon={ChevronRight} title="Add funds before investing" description="Deposit funds to your wallet to prepare for an investment." action={<Link className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#1caf35] px-4 text-[13px] font-semibold text-white hover:bg-[#15952b]" to="/dashboard/deposit">Go to deposit<ChevronRight className="h-4 w-4" /></Link>} /> : null}
        {tabIndex === 3 ? <EmptyState icon={FileClock} title="Deposit history" description="Review deposits from the deposit page." action={<Link className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#e5e9e7] bg-white px-4 text-[13px] font-semibold text-[#465058] hover:bg-[#f7f8f7]" to="/dashboard/deposit">Open deposits<ChevronRight className="h-4 w-4" /></Link>} /> : null}
      </Panel>
    </div>
  )
}

export default MyInvestments
