import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'
import Loading from '../../components/Loading'
import { getAdminTransactions } from '../../lib/api'
import { Heading, Panel, Status } from '../../components/admin/AdminUI'

const formatCurrency = (amount, currency = 'USD') => {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 2 }).format(amount || 0)
  } catch {
    return `${currency} ${(amount || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })}`
  }
}

const formatDate = (value) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString()
}

const AdminTransactions = () => {
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({ type: '', status: '', adjustmentTarget: '', from: '', to: '' })

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['adminTransactions', page, filters],
    queryFn: () => getAdminTransactions({
      page,
      limit: 20,
      ...filters,
      to: filters.to ? `${filters.to}T23:59:59.999Z` : '',
    }),
    placeholderData: (previousData) => previousData,
  })

  const updateFilter = (event) => {
    setFilters((current) => ({ ...current, [event.target.name]: event.target.value }))
    setPage(1)
  }

  const clearFilters = () => {
    setFilters({ type: '', status: '', adjustmentTarget: '', from: '', to: '' })
    setPage(1)
  }

  const transactions = data?.transactions || []
  const pagination = data?.pagination || { page: 1, pages: 1, total: 0 }

  return <div>
    <Heading eyebrow="Account activity" title="Transactions" description="Review transaction history across user accounts, including deposits, withdrawals, investments, and balance adjustments." action={<span className="rounded-xl border border-[#e7ebe9] bg-white px-3.5 py-2.5 text-[13px] font-medium text-[#687179]">{pagination.total} records</span>} />

    <Panel className="mb-5 p-4 sm:p-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <label className="block text-xs font-medium text-[#687179]">Transaction type<select className="mt-1.5 h-10 w-full rounded-xl border border-[#e5e9e7] bg-white px-3 text-sm text-[#313a40] outline-none focus:border-[#1caf35]" name="type" onChange={updateFilter} value={filters.type}><option value="">All types</option><option value="deposit">Deposit</option><option value="withdrawal">Withdrawal</option><option value="investment">Investment</option><option value="bonus">Bonus</option><option value="transfer">Transfer</option><option value="admin_adjustment">Admin adjustment</option></select></label>
        <label className="block text-xs font-medium text-[#687179]">Status<select className="mt-1.5 h-10 w-full rounded-xl border border-[#e5e9e7] bg-white px-3 text-sm text-[#313a40] outline-none focus:border-[#1caf35]" name="status" onChange={updateFilter} value={filters.status}><option value="">All statuses</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option></select></label>
        <label className="block text-xs font-medium text-[#687179]">Adjustment target<select className="mt-1.5 h-10 w-full rounded-xl border border-[#e5e9e7] bg-white px-3 text-sm text-[#313a40] outline-none focus:border-[#1caf35]" name="adjustmentTarget" onChange={updateFilter} value={filters.adjustmentTarget}><option value="">All targets</option><option value="wallet">Wallet</option><option value="portfolio">Portfolio</option></select></label>
        <label className="block text-xs font-medium text-[#687179]">From date<input className="mt-1.5 h-10 w-full rounded-xl border border-[#e5e9e7] bg-white px-3 text-sm text-[#313a40] outline-none focus:border-[#1caf35]" name="from" onChange={updateFilter} type="date" value={filters.from} /></label>
        <label className="block text-xs font-medium text-[#687179]">To date<input className="mt-1.5 h-10 w-full rounded-xl border border-[#e5e9e7] bg-white px-3 text-sm text-[#313a40] outline-none focus:border-[#1caf35]" name="to" onChange={updateFilter} type="date" value={filters.to} /></label>
      </div>
      <button className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#16852d] hover:text-[#116d25]" onClick={clearFilters} type="button"><RotateCcw aria-hidden="true" className="h-3.5 w-3.5" />Clear filters</button>
    </Panel>

    <Panel className="overflow-hidden">
      <div className="border-b border-[#edf0ef] px-5 py-4 sm:px-6"><h2 className="text-base font-semibold text-[#252d31]">All transactions</h2><p className="mt-1 text-[13px] text-[#727b82]">Newest activity appears first.</p></div>
      {isLoading ? <Loading label="Loading transactions..." /> : isError ? (
        <div className="px-5 py-12 text-center">
          <p className="text-sm font-medium text-[#b4232d]">{error?.response?.data?.message || 'Unable to load transactions.'}</p>
          <button className="mt-3 rounded-lg border border-[#e5e9e7] px-3 py-2 text-sm font-semibold text-[#465058] hover:bg-[#f7f8f7]" onClick={() => refetch()} type="button">Try again</button>
        </div>
      ) : <>
        {isFetching && <p aria-live="polite" className="border-b border-[#edf0ef] px-5 py-2 text-xs text-[#858e94]">Updating transactions…</p>}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left text-[13px]">
            <thead className="bg-[#fafbfa] text-xs font-medium uppercase tracking-wide text-[#858e94]"><tr><th className="px-5 py-3">Transaction</th><th className="px-4 py-3">User</th><th className="px-4 py-3">Type / details</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Status</th><th className="px-5 py-3">Reviewed by</th></tr></thead>
            <tbody className="divide-y divide-[#edf0ef]">
              {transactions.map((transaction) => {
                const adjustmentLabel = transaction.adjustmentTarget === 'wallet' ? 'Wallet adjustment' : transaction.adjustmentTarget === 'portfolio' ? 'Portfolio adjustment' : ''
                const userName = transaction.user ? `${transaction.user.firstName || ''} ${transaction.user.lastName || ''}`.trim() : 'User unavailable'
                const reviewerName = transaction.reviewedBy ? `${transaction.reviewedBy.firstName || ''} ${transaction.reviewedBy.lastName || ''}`.trim() || transaction.reviewedBy.email : '—'
                return <tr key={transaction._id}>
                  <td className="px-5 py-4"><p className="font-semibold text-[#313a40]">{transaction._id}</p><p className="mt-1 text-xs text-[#858e94]">{transaction.paymentMethod}</p></td>
                  <td className="px-4 py-4"><p className="font-medium text-[#465058]">{userName}</p><p className="mt-1 text-xs text-[#858e94]">{transaction.user?.email || '—'}</p></td>
                  <td className="px-4 py-4"><p className="font-medium capitalize text-[#465058]">{adjustmentLabel || transaction.type.replaceAll('_', ' ')}</p><p className="mt-1 max-w-[240px] truncate text-xs text-[#858e94]" title={transaction.reviewNote || transaction.description}>{transaction.reviewNote || transaction.description || '—'}</p></td>
                  <td className="px-4 py-4 text-[#687179]">{formatDate(transaction.createdAt)}</td>
                  <td className="px-4 py-4 font-semibold text-[#313a40]">{formatCurrency(transaction.amount, transaction.currency)}</td>
                  <td className="px-4 py-4"><Status>{transaction.status[0].toUpperCase() + transaction.status.slice(1)}</Status></td>
                  <td className="px-5 py-4 text-[#586168]">{reviewerName}</td>
                </tr>
              })}
              {transactions.length === 0 && <tr><td className="px-5 py-12 text-center text-sm text-[#727b82]" colSpan="7">No transactions match these filters.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col gap-3 border-t border-[#edf0ef] px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[#858e94]">Page {pagination.page} of {Math.max(pagination.pages, 1)} · {pagination.total} total records</p>
          <div className="flex justify-end gap-2">
            <button aria-label="Previous page" className="inline-flex h-9 items-center gap-1 rounded-lg border border-[#e5e9e7] px-3 text-xs font-semibold text-[#465058] hover:bg-[#f7f8f7] disabled:cursor-not-allowed disabled:opacity-50" disabled={page <= 1 || isFetching} onClick={() => setPage((current) => current - 1)} type="button"><ChevronLeft className="h-4 w-4" />Previous</button>
            <button aria-label="Next page" className="inline-flex h-9 items-center gap-1 rounded-lg border border-[#e5e9e7] px-3 text-xs font-semibold text-[#465058] hover:bg-[#f7f8f7] disabled:cursor-not-allowed disabled:opacity-50" disabled={page >= pagination.pages || isFetching} onClick={() => setPage((current) => current + 1)} type="button">Next<ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
      </>}
    </Panel>
  </div>
}

export default AdminTransactions
