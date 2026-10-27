import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ArrowDownToLine, ArrowUpFromLine, ChevronLeft, ChevronRight, FileClock, Filter, LoaderCircle, RefreshCw, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getMyTransactions, getWalletSummary } from '../../lib/api'
import { AccountBalanceGrid, EmptyState, Notice, PageHeading, Panel } from '../../components/dashboard/DashboardPageUI'

const formatMoney = (amount, currency = 'USD', type = '') => {
  try {
    const formatted = new Intl.NumberFormat(undefined, { style: 'currency', currency, minimumFractionDigits: 2 }).format(Number(amount) || 0)
    return ['withdrawal', 'investment'].includes(type) ? `−${formatted}` : ['deposit', 'bonus'].includes(type) ? `+${formatted}` : formatted
  } catch {
    return `${currency} ${Number(amount || 0).toFixed(2)}`
  }
}

const formatDate = (value) => {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString()
}

const statusClass = (status) => status === 'approved'
  ? 'bg-[#eaf7ec] text-[#16852d]'
  : status === 'rejected'
    ? 'bg-[#fff0f0] text-[#c43b3b]'
    : 'bg-[#fff6e7] text-[#a86b0a]'

const transactionTitle = (transaction) => {
  if (transaction.description) return transaction.description
  if (transaction.paymentMethod) return transaction.paymentMethod
  return transaction.type?.replaceAll('_', ' ') || 'Account activity'
}

const Transactions = () => {
  const [search, setSearch] = useState('')
  const [type, setType] = useState('')
  const [page, setPage] = useState(1)
  const walletQuery = useQuery({ queryKey: ['walletSummary'], queryFn: getWalletSummary })
  const transactionsQuery = useQuery({
    queryKey: ['myTransactions', page, type, search],
    queryFn: () => getMyTransactions({ page, limit: 20, type, search }),
    placeholderData: (previousData) => previousData,
  })
  const transactions = transactionsQuery.data?.transactions || []
  const pagination = transactionsQuery.data?.pagination || { page: 1, pages: 1, total: 0 }
  const currency = walletQuery.data?.wallet?.currency || 'USD'

  return (
    <div className="mx-auto max-w-[1200px]">
      <PageHeading eyebrow="Activity" title="Transactions" description="Review deposits, withdrawals, investments, and other account activity." action={<div className="flex flex-wrap gap-2"><Link className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#1caf35] px-3.5 text-[13px] font-semibold text-white hover:bg-[#15952b]" to="/dashboard/deposit"><ArrowDownToLine className="h-4 w-4" />Deposit</Link><Link className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#e5e9e7] bg-white px-3.5 text-[13px] font-semibold text-[#465058] hover:bg-[#f7f8f7]" to="/dashboard/withdrawal"><ArrowUpFromLine className="h-4 w-4" />Withdraw</Link></div>} />
      <AccountBalanceGrid currency={currency} wallet={walletQuery.data?.wallet} />
      <Panel className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-[#edf0ef] p-4 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1"><Search aria-hidden="true" className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9aa39e]" /><input aria-label="Search transactions" className="h-10 w-full rounded-xl border border-[#e5e9e7] bg-white pl-10 pr-4 text-sm outline-none focus:border-[#1caf35]" onChange={(event) => { setSearch(event.target.value); setPage(1) }} placeholder="Search transactions" value={search} /></div>
          <label className="relative inline-flex h-10 items-center gap-2 rounded-xl border border-[#e5e9e7] px-3 text-sm text-[#586168]"><Filter aria-hidden="true" className="h-4 w-4 shrink-0" /><select aria-label="Filter transaction type" className="h-full min-w-[150px] appearance-none bg-transparent pr-2 text-sm outline-none" onChange={(event) => { setType(event.target.value); setPage(1) }} value={type}><option value="">All activity</option><option value="deposit">Deposits</option><option value="withdrawal">Withdrawals</option><option value="investment">Investments</option><option value="bonus">Bonuses</option><option value="transfer">Transfers</option><option value="admin_adjustment">Balance adjustments</option></select></label>
        </div>
        {transactionsQuery.isPending ? <div className="flex min-h-[220px] items-center justify-center gap-2 text-sm text-[#748087]"><LoaderCircle className="h-4 w-4 animate-spin" />Loading transactions…</div> : transactionsQuery.isError ? <div className="p-5"><Notice tone="error">{transactionsQuery.error.response?.data?.message || 'Could not load your transactions.'}</Notice><button className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#16852d]" onClick={() => transactionsQuery.refetch()} type="button"><RefreshCw className="h-4 w-4" />Try again</button></div> : transactions.length === 0 ? <EmptyState icon={FileClock} title={search || type ? 'No matching transactions' : 'No transactions yet'} description={search || type ? 'Try another search or activity filter.' : 'Your deposits, withdrawals, and investments will appear here.'} /> : <>
          <div className="overflow-x-auto"><table className="w-full min-w-[760px] border-collapse text-left text-sm"><thead><tr className="border-b border-[#e7ebe9] text-[12px] font-semibold uppercase tracking-wide text-[#7a858b]"><th className="px-5 py-3">Activity</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Amount</th><th className="px-5 py-3">Status</th></tr></thead><tbody>{transactions.map((transaction) => <tr className="border-b border-[#f0f2f1] last:border-0" key={transaction._id}><td className="max-w-[360px] px-5 py-4"><p className="truncate font-semibold text-[#252d31]" title={transactionTitle(transaction)}>{transactionTitle(transaction)}</p>{(transaction.payoutDestination || transaction.reference) && <p className="mt-1 truncate text-xs text-[#858e94]" title={transaction.payoutDestination || transaction.reference}>{transaction.payoutDestination ? `To ${transaction.payoutDestination}` : `Ref: ${transaction.reference}`}</p>}</td><td className="whitespace-nowrap px-4 py-4 capitalize text-[#586168]">{transaction.type?.replaceAll('_', ' ') || '—'}</td><td className="whitespace-nowrap px-4 py-4 text-[#586168]">{formatDate(transaction.createdAt)}</td><td className={`whitespace-nowrap px-4 py-4 font-semibold ${['deposit', 'bonus'].includes(transaction.type) ? 'text-[#16852d]' : ['withdrawal', 'investment'].includes(transaction.type) ? 'text-[#c43b3b]' : 'text-[#252d31]'}`}>{formatMoney(transaction.amount, transaction.currency || currency, transaction.type)}</td><td className="px-5 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusClass(transaction.status)}`}>{transaction.status || 'pending'}</span></td></tr>)}</tbody></table></div>
          <div className="flex flex-col gap-3 border-t border-[#edf0ef] px-5 py-3 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs text-[#858e94]">{pagination.total} transaction{pagination.total === 1 ? '' : 's'} · Page {pagination.page} of {Math.max(pagination.pages, 1)}</p><div className="flex justify-end gap-2"><button aria-label="Previous page" className="inline-flex h-9 items-center gap-1 rounded-lg border border-[#e5e9e7] px-3 text-xs font-semibold text-[#465058] hover:bg-[#f7f8f7] disabled:cursor-not-allowed disabled:opacity-50" disabled={page <= 1 || transactionsQuery.isFetching} onClick={() => setPage((current) => current - 1)} type="button"><ChevronLeft className="h-4 w-4" />Previous</button><button aria-label="Next page" className="inline-flex h-9 items-center gap-1 rounded-lg border border-[#e5e9e7] px-3 text-xs font-semibold text-[#465058] hover:bg-[#f7f8f7] disabled:cursor-not-allowed disabled:opacity-50" disabled={page >= pagination.pages || transactionsQuery.isFetching} onClick={() => setPage((current) => current + 1)} type="button">Next<ChevronRight className="h-4 w-4" /></button></div></div>
        </>}
      </Panel>
    </div>
  )
}

export default Transactions
