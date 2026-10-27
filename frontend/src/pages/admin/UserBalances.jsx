import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { BriefcaseBusiness, ChevronLeft, ChevronRight, Search, Wallet } from 'lucide-react'
import Loading from '../../components/Loading'
import { createAdminUserInvestment, fundAdminUserWallet, getAdminInvestmentPlans, getAdminUsers } from '../../lib/api'
import { ActionNotice, AmountModal, Heading, Panel, Status } from '../../components/admin/AdminUI'

const formatCurrency = (amount, currency = 'USD') => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(amount || 0)
  } catch {
    return `${currency} ${(amount || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })}`
  }
}

const AdminUsers = () => {
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [rows, setRows] = useState([])
  const [selected, setSelected] = useState(null)
  const [notice, setNotice] = useState('')
  const queryClient = useQueryClient()

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['adminUsers', query, page],
    queryFn: () => getAdminUsers({ search: query, page, limit: 20 }),
    placeholderData: (previousData) => previousData,
  })

  const { data: planData, isLoading: isLoadingPlans, error: plansError } = useQuery({
    queryKey: ['adminInvestmentPlans', selected?.user.id],
    queryFn: () => getAdminInvestmentPlans(selected.user.id),
    enabled: selected?.mode === 'investment',
  })

  const users = useMemo(() => (data?.users || []).map((user) => ({
    id: user._id,
    name: [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Unnamed user',
    email: user.email,
    status: user.status ? user.status[0].toUpperCase() + user.status.slice(1) : 'Unknown',
    currency: user.wallet?.currency || user.currency || 'USD',
    wallet: user.wallet?.walletBalance ?? 0,
    portfolio: user.wallet?.portfolioBalance ?? 0,
    bonus: user.wallet?.totalBonus ?? 0,
  })), [data?.users])

  useEffect(() => {
    setRows(users)
  }, [users])

  const visibleRows = useMemo(() => rows.filter((user) =>
    `${user.name} ${user.email} ${user.id}`.toLowerCase().includes(query.toLowerCase()),
  ), [query, rows])

  const pagination = data?.pagination || { page: 1, pages: 1, total: 0 }

  const { mutate: applyAdjustment, isPending: isAdjusting, error: adjustmentError } = useMutation({
    mutationFn: ({ user, mode, amount, note, planCode }) => {
      const idempotencyKey = globalThis.crypto?.randomUUID?.() || `admin-${Date.now()}-${Math.random().toString(36).slice(2)}`
      const adjustment = { userId: user.id, amount, note, idempotencyKey, planCode }
      return mode === 'wallet'
        ? fundAdminUserWallet(adjustment)
        : createAdminUserInvestment(adjustment)
    },
    onSuccess: async (result, { user, mode, amount }) => {
      setSelected(null)
      setNotice(`${result.message || 'Action completed.'} ${formatCurrency(amount, user.currency)} ${mode === 'wallet' ? 'to wallet' : 'invested for'} ${user.name}.`)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['adminUsers'] }),
        queryClient.invalidateQueries({ queryKey: ['adminDashboardSummary'] }),
        queryClient.invalidateQueries({ queryKey: ['adminTransactions'] }),
      ])
    },
  })

  const submitAdjustment = (amount, note, planCode) => {
    if (!selected) return
    setNotice('')
    applyAdjustment({ user: selected.user, mode: selected.mode, amount, note, planCode })
  }

  const adjustmentErrorMessage = adjustmentError?.response?.data?.message || adjustmentError?.message || plansError?.response?.data?.message || ''

  return <div>
    <Heading eyebrow="Accounts" title="Users & balances" description="Review registered users and their account balances." action={<span className="rounded-xl border border-[#e7ebe9] bg-white px-3.5 py-2.5 text-[13px] font-medium text-[#687179]">{pagination.total} users</span>} />
    <ActionNotice notice={notice} onClose={() => setNotice('')} />

    <Panel className="overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-[#edf0ef] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div><h2 className="text-base font-semibold text-[#252d31]">All users</h2><p className="mt-1 text-[13px] text-[#727b82]">Search by name, email, or account ID.</p></div>
        <label className="relative block w-full sm:max-w-[300px]">
          <Search aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#92999e]" />
          <input aria-label="Search users" className="h-10 w-full rounded-xl border border-[#e5e9e7] pl-9 pr-3 text-sm outline-none focus:border-[#1caf35]" onChange={(event) => { setQuery(event.target.value); setPage(1) }} placeholder="Search users" value={query} />
        </label>
      </div>

      {isLoading ? <Loading label="Loading users..." /> : isError ? (
        <div className="px-5 py-12 text-center">
          <p className="text-sm font-medium text-[#b4232d]">{error?.response?.data?.message || 'Unable to load users.'}</p>
          <button className="mt-3 rounded-lg border border-[#e5e9e7] px-3 py-2 text-sm font-semibold text-[#465058] hover:bg-[#f7f8f7]" onClick={() => refetch()} type="button">Try again</button>
        </div>
      ) : (
        <>
          {isFetching && <p aria-live="polite" className="border-b border-[#edf0ef] px-5 py-2 text-xs text-[#858e94]">Updating users…</p>}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-[13px]">
              <thead className="bg-[#fafbfa] text-xs font-medium uppercase tracking-wide text-[#858e94]"><tr><th className="px-5 py-3">User</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Wallet</th><th className="px-4 py-3">Portfolio</th><th className="px-4 py-3">Bonus</th><th className="px-5 py-3 text-right">Account actions</th></tr></thead>
              <tbody className="divide-y divide-[#edf0ef]">
                {visibleRows.map((user) => <tr key={user.id}>
                  <td className="px-5 py-4"><div className="flex items-center gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f1f3f5] text-xs font-semibold text-[#586168]">{user.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</span><div><p className="font-semibold text-[#313a40]">{user.name}</p><p className="mt-0.5 text-xs text-[#858e94]">{user.email} · {user.id}</p></div></div></td>
                  <td className="px-4 py-4"><Status>{user.status}</Status></td>
                  <td className="px-4 py-4 font-semibold text-[#313a40]">{formatCurrency(user.wallet, user.currency)}</td>
                  <td className="px-4 py-4 font-semibold text-[#313a40]">{formatCurrency(user.portfolio, user.currency)}</td>
                  <td className="px-4 py-4 text-[#586168]">{formatCurrency(user.bonus, user.currency)}</td>
                  <td className="px-5 py-4"><div className="flex justify-end gap-2"><button className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#e5e9e7] px-3 text-xs font-semibold text-[#465058] hover:bg-[#f7f8f7]" onClick={() => setSelected({ user, mode: 'wallet' })} type="button"><Wallet aria-hidden="true" className="h-3.5 w-3.5" />Fund wallet</button><button className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#1caf35] px-3 text-xs font-semibold text-white hover:bg-[#15952b]" onClick={() => setSelected({ user, mode: 'investment' })} type="button"><BriefcaseBusiness aria-hidden="true" className="h-3.5 w-3.5" />Create investment</button></div></td>
                </tr>)}
                {visibleRows.length === 0 && <tr><td className="px-5 py-12 text-center text-sm text-[#727b82]" colSpan="6">{query ? `No users match “${query}”.` : 'No users found.'}</td></tr>}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-[#edf0ef] px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-[#858e94]">Page {pagination.page} of {Math.max(pagination.pages, 1)} · {pagination.total} total users</p>
            <div className="flex justify-end gap-2">
              <button aria-label="Previous page" className="inline-flex h-9 items-center gap-1 rounded-lg border border-[#e5e9e7] px-3 text-xs font-semibold text-[#465058] hover:bg-[#f7f8f7] disabled:cursor-not-allowed disabled:opacity-50" disabled={page <= 1 || isFetching} onClick={() => setPage((current) => current - 1)} type="button"><ChevronLeft className="h-4 w-4" />Previous</button>
              <button aria-label="Next page" className="inline-flex h-9 items-center gap-1 rounded-lg border border-[#e5e9e7] px-3 text-xs font-semibold text-[#465058] hover:bg-[#f7f8f7] disabled:cursor-not-allowed disabled:opacity-50" disabled={page >= pagination.pages || isFetching} onClick={() => setPage((current) => current + 1)} type="button">Next<ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="border-t border-[#edf0ef] px-5 py-3 text-xs leading-5 text-[#858e94]">User details and balances are loaded from your backend. Wallet and portfolio adjustments are saved with an admin transaction record.</div>
        </>
      )}
    </Panel>

    {selected && <AmountModal errorMessage={adjustmentErrorMessage} isPending={isAdjusting} mode={selected.mode} onApply={submitAdjustment} onClose={() => setSelected(null)} plans={planData?.plans || []} plansLoading={isLoadingPlans} user={selected.user} />}
  </div>
}

export default AdminUsers
