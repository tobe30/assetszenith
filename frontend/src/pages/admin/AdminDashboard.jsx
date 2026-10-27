import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, ArrowUpRight, BriefcaseBusiness, Clock3, CircleDollarSign, RotateCw, Users, Wallet } from 'lucide-react'
import TradingViewChart from '../../components/TradingViewChart'
import TradingViewMarketTables from '../../components/TradingViewMarketTables'
import TradingViewTicker from '../../components/TradingViewTicker'
import Loading from '../../components/Loading'
import { getAdminDashboardSummary } from '../../lib/api'
import { Heading, MetricGrid, Panel, QueueSummary, Status } from '../../components/admin/AdminUI'

const formatCurrencyTotal = ({ _id: currency, total }) => {
  const value = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(total || 0)
  return `${currency} ${value}`
}

const formatDate = (value) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

const displayStatus = (status = '') => status ? status[0].toUpperCase() + status.slice(1) : 'Unknown'

const AdminDashboard = () => {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['adminDashboardSummary'],
    queryFn: getAdminDashboardSummary,
    refetchInterval: 30_000,
  })

  const summary = data?.summary
  const walletBalances = summary?.walletBalances || []
  const activeInvestments = summary?.activeInvestments || []
  const pendingDeposits = summary?.pendingDeposits || 0
  const pendingWithdrawals = summary?.pendingWithdrawals || 0
  const recentUsers = data?.recentUsers || []
  const latestDeposits = data?.latestDeposits || []
  const metrics = [
    { title: 'Registered users', amount: summary ? (summary.registeredUsers || 0).toLocaleString() : '—', change: 'Customer accounts', icon: Users, color: 'bg-[#eef3ff] text-[#4268ca]' },
    { title: 'Wallet funds', amount: walletBalances.length ? walletBalances.map(formatCurrencyTotal).join(' · ') : 'No wallet balances', change: 'Totals shown in each account currency', icon: Wallet, color: 'bg-[#eaf7ec] text-[#1caf35]' },
    { title: 'Active investments', amount: activeInvestments.length ? activeInvestments.map(formatCurrencyTotal).join(' · ') : 'No active investments', change: `${activeInvestments.reduce((count, item) => count + (item.count || 0), 0).toLocaleString()} active plans · totals by currency`, icon: BriefcaseBusiness, color: 'bg-[#fff5e8] text-[#d58a19]' },
    { title: 'Pending reviews', amount: (pendingDeposits + pendingWithdrawals).toLocaleString(), change: `${pendingDeposits} deposits · ${pendingWithdrawals} withdrawals`, icon: CircleDollarSign, color: 'bg-[#fff0f0] text-[#ed161f]' },
  ]

  return <div>
    <TradingViewTicker />
    <div className="mt-6"><Heading eyebrow="Admin" title="Admin dashboard" description="Monitor account activity and review items that need attention." action={<span className="inline-flex items-center gap-2 rounded-xl border border-[#e7ebe9] bg-white px-3.5 py-2.5 text-[13px] font-medium text-[#687179]"><span className={`h-2 w-2 rounded-full ${isError ? 'bg-[#ed161f]' : 'bg-[#1caf35]'}`} />{isFetching ? 'Updating data…' : data?.updatedAt ? `Updated ${new Date(data.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Live account data'}</span>} /></div>

    {isLoading ? <Panel className="mb-6 p-5"><Loading label="Loading live dashboard data…" /></Panel> : isError ? <Panel className="mb-6 flex flex-col items-start gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-[#b4232d]">{error?.response?.data?.message || 'Unable to load dashboard data.'}</p><button className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#e5e9e7] px-3 text-sm font-semibold text-[#465058] hover:bg-[#f7f8f7]" onClick={() => refetch()} type="button"><RotateCw className="h-4 w-4" />Try again</button></Panel> : <>
      <MetricGrid metrics={metrics} />
      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <Panel className="p-5 sm:p-6">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-base font-semibold text-[#252d31]">Review queue</h2><p className="mt-1 text-[13px] text-[#727b82]">Requests that need an administrator decision.</p></div><Clock3 className="h-5 w-5 text-[#92999e]" /></div>
          <QueueSummary deposits={pendingDeposits} withdrawals={pendingWithdrawals} />
          <div className="mt-4 grid gap-2 sm:grid-cols-2"><Link className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#1caf35] px-4 text-[13px] font-semibold text-white hover:bg-[#15952b]" to="/admin/deposits">Review deposits<ArrowRight className="h-4 w-4" /></Link><Link className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#e5e9e7] px-4 text-[13px] font-semibold text-[#465058] hover:bg-[#f7f8f7]" to="/admin/withdrawals">Review withdrawals<ArrowRight className="h-4 w-4" /></Link></div>
        </Panel>
        <Panel className="p-5 sm:p-6">
          <div className="mb-4 flex items-start justify-between gap-3"><div><h2 className="text-base font-semibold text-[#252d31]">Recently joined</h2><p className="mt-1 text-[13px] text-[#727b82]">Latest customer accounts.</p></div><Users className="h-5 w-5 text-[#92999e]" /></div>
          <div className="divide-y divide-[#edf0ef]">{recentUsers.map((user) => {
            const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email
            const initials = name.split(/[\s@]+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
            return <div className="flex items-center justify-between gap-3 py-3" key={user._id}><div className="flex min-w-0 items-center gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f1f3f5] text-xs font-semibold text-[#586168]">{initials}</span><div className="min-w-0"><p className="truncate text-sm font-semibold text-[#313a40]">{name}</p><p className="text-xs text-[#858e94]">Joined {formatDate(user.createdAt)}</p></div></div><Status>{displayStatus(user.status)}</Status></div>
          })}{recentUsers.length === 0 && <p className="py-6 text-sm text-[#727b82]">No customer accounts yet.</p>}</div>
          <Link className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#16852d] hover:text-[#116d25]" to="/admin/users">Manage users<ArrowUpRight className="h-4 w-4" /></Link>
        </Panel>
      </div>
      <Panel className="mt-5 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#edf0ef] px-5 py-4 sm:px-6"><div><h2 className="text-base font-semibold text-[#252d31]">Latest deposit requests</h2><p className="mt-1 text-[13px] text-[#727b82]">Most recent deposits recorded on the platform.</p></div><Link className="text-[13px] font-semibold text-[#16852d]" to="/admin/deposits">See all</Link></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-[13px]"><thead className="bg-[#fafbfa] text-xs font-medium uppercase tracking-wide text-[#858e94]"><tr><th className="px-5 py-3">Request</th><th className="px-5 py-3">User</th><th className="px-5 py-3">Method</th><th className="px-5 py-3">Amount</th><th className="px-5 py-3">Status</th></tr></thead><tbody className="divide-y divide-[#edf0ef]">{latestDeposits.map((row) => {
          const userName = row.user ? `${row.user.firstName || ''} ${row.user.lastName || ''}`.trim() || row.user.email : 'User unavailable'
          return <tr key={row._id}><td className="px-5 py-3.5 font-semibold text-[#313a40]" title={row._id}>{row.reference || `…${row._id.slice(-8)}`}</td><td className="px-5 py-3.5 text-[#586168]">{userName}</td><td className="px-5 py-3.5 text-[#586168]">{row.paymentMethod}</td><td className="px-5 py-3.5 font-semibold text-[#313a40]">{formatCurrencyTotal({ _id: row.currency, total: row.amount })}</td><td className="px-5 py-3.5"><Status>{displayStatus(row.status)}</Status></td></tr>
        })}{latestDeposits.length === 0 && <tr><td className="px-5 py-8 text-center text-sm text-[#727b82]" colSpan="5">No deposit records yet.</td></tr>}</tbody></table></div>
      </Panel>
    </>}

    <section className="mt-7"><div className="mb-3"><h2 className="text-lg font-semibold tracking-[-0.035em] text-[#15191c] sm:text-xl">Market chart</h2><p className="mt-1 text-sm text-[#7c858b]">Bitcoin / U.S. Dollar · daily candles</p></div><TradingViewChart /></section>
    <section className="mt-7"><div className="mb-3"><h2 className="text-lg font-semibold tracking-[-0.035em] text-[#15191c] sm:text-xl">Market data</h2><p className="mt-1 text-sm text-[#7c858b]">Live crypto and selected stock prices.</p></div><TradingViewMarketTables /></section>
  </div>
}

export default AdminDashboard
