import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { BadgeCheck, CalendarDays, Clock3, Mail, MapPin, Phone, ShieldCheck, UserRound, WalletCards, X } from 'lucide-react'
import Loading from '../Loading'
import { getAdminUserDetails, updateAdminUserStatus } from '../../lib/api'
import { Status } from './AdminUI'

const dateLabel = (value) => value ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value)) : 'Not provided'
const dateTimeLabel = (value) => value ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : 'Not available'
const money = (amount, currency) => {
  try { return new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 2 }).format(amount || 0) }
  catch { return `${currency} ${(amount || 0).toLocaleString()}` }
}
const titleCase = (value = '') => value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
const Info = ({ icon: Icon, label, value }) => <div className="flex min-w-0 gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f3f6f4] text-[#687179]"><Icon aria-hidden="true" className="h-4 w-4" /></span><div className="min-w-0"><p className="text-xs text-[#858e94]">{label}</p><p className="mt-1 break-words text-sm font-medium text-[#313a40]">{value || 'Not provided'}</p></div></div>

const AdminUserDetails = ({ userId, onClose, onFundWallet, onCreateInvestment, onCloseAccount }) => {
  const queryClient = useQueryClient()
  const { data: user, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['adminUserDetails', userId],
    queryFn: () => getAdminUserDetails(userId),
    enabled: Boolean(userId),
  })
  const { mutate: changeStatus, isPending, error: statusError } = useMutation({
    mutationFn: (status) => updateAdminUserStatus({ userId, status }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['adminUserDetails', userId] }),
        queryClient.invalidateQueries({ queryKey: ['adminUsers'] }),
        queryClient.invalidateQueries({ queryKey: ['adminDashboardSummary'] }),
      ])
    },
  })

  const fullName = user ? [user.firstName, user.lastName].filter(Boolean).join(' ') : ''
  const currency = user?.wallet?.currency || user?.currency || 'USD'
  const actionUser = user ? {
    id: user._id,
    name: fullName || 'Unnamed user',
    email: user.email,
    currency,
    wallet: user.wallet?.walletBalance || 0,
  } : null
  const statusErrorMessage = statusError?.response?.data?.message || statusError?.message || ''

  return <div className="fixed inset-0 z-[60] flex items-end justify-center bg-[#111416]/50 p-0 backdrop-blur-[2px] sm:items-center sm:p-4" onClick={() => !isPending && onClose()}>
    <section aria-labelledby="admin-user-details-title" aria-modal="true" className="flex max-h-[94dvh] w-full max-w-5xl flex-col overflow-hidden rounded-t-2xl border border-[#e7ebe9] bg-[#f8faf8] shadow-2xl sm:max-h-[90vh] sm:rounded-2xl" onClick={(event) => event.stopPropagation()} role="dialog">
      <header className="flex items-center justify-between gap-3 border-b border-[#e7ebe9] bg-white px-4 py-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          {user?.profilePhotoUrl ? <img alt="" className="h-11 w-11 shrink-0 rounded-full object-cover" src={user.profilePhotoUrl} /> : <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#eaf7ec] text-sm font-semibold text-[#16852d]">{fullName.split(' ').map((part) => part[0]).join('').slice(0, 2) || <UserRound className="h-5 w-5" />}</span>}
          <div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#1caf35]">User account</p><h2 className="truncate text-lg font-semibold text-[#20262a] sm:text-xl" id="admin-user-details-title">{isLoading ? 'Loading account…' : fullName || user?.email || 'Account details'}</h2></div>
        </div>
        <button aria-label="Close user details" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[#687179] hover:bg-[#f2f4f3]" onClick={onClose} type="button"><X className="h-5 w-5" /></button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
        {isLoading ? <Loading label="Loading user account details..." /> : isError ? <div className="rounded-xl border border-[#f1d5d5] bg-white p-6 text-center"><p className="text-sm text-[#b4232d]">{error?.response?.data?.message || 'Unable to load this user.'}</p><button className="mt-3 rounded-lg border border-[#e5e9e7] px-4 py-2 text-sm font-semibold text-[#465058]" onClick={() => refetch()} type="button">Try again</button></div> : user && <div className="space-y-5">
          <section className="rounded-2xl border border-[#e7ebe9] bg-white p-4 sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-2"><Status>{titleCase(user.status)}</Status><span className="rounded-full bg-[#f3f5f4] px-2.5 py-1 text-xs font-medium text-[#687179]">{currency} account</span><span className="text-xs text-[#858e94]">ID: {user._id}</span></div>
              <div className="flex flex-wrap gap-2">
                <button className="rounded-lg border border-[#e5e9e7] px-3 py-2 text-xs font-semibold text-[#465058] hover:bg-[#f7f8f7]" onClick={() => onFundWallet(actionUser)} type="button">Fund wallet</button>
                <button className="rounded-lg bg-[#1caf35] px-3 py-2 text-xs font-semibold text-white hover:bg-[#15952b]" onClick={() => onCreateInvestment(actionUser)} type="button">Create investment</button>
                {user.status === 'active' ? <button className="rounded-lg border border-[#f1d5d5] px-3 py-2 text-xs font-semibold text-[#b4232d] hover:bg-[#fff5f5]" disabled={isPending} onClick={() => changeStatus('suspended')} type="button">{isPending ? 'Updating…' : 'Suspend account'}</button> : user.status === 'suspended' || user.status === 'pending' ? <button className="rounded-lg border border-[#ccebd2] bg-[#f1faf3] px-3 py-2 text-xs font-semibold text-[#16852d] hover:bg-[#eaf7ec]" disabled={isPending} onClick={() => changeStatus('active')} type="button">{isPending ? 'Updating…' : 'Reactivate account'}</button> : null}
                {user.status !== 'closed' && <button className="rounded-lg border border-[#f1d5d5] px-3 py-2 text-xs font-semibold text-[#b4232d] hover:bg-[#fff5f5]" onClick={() => onCloseAccount(actionUser)} type="button">Close account</button>}
              </div>
            </div>
            {statusErrorMessage && <p aria-live="polite" className="mt-3 rounded-lg border border-[#f0d8c2] bg-[#fff8f0] px-3 py-2 text-[13px] text-[#7e4b20]">{statusErrorMessage}</p>}
          </section>

          <section aria-label="Wallet balances" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ['Wallet balance', user.wallet?.walletBalance],
              ['Portfolio balance', user.wallet?.portfolioBalance],
              ['Total bonus', user.wallet?.totalBonus],
              ['Total withdrawals', user.wallet?.totalWithdrawals],
            ].map(([label, amount]) => <article className="rounded-2xl border border-[#e7ebe9] bg-white p-4" key={label}><p className="text-[13px] text-[#727b82]">{label}</p><p className="mt-2 break-words text-xl font-semibold tracking-tight text-[#20262a]">{money(amount, currency)}</p></article>)}
          </section>

          <div className="grid gap-5 xl:grid-cols-2">
            <section className="rounded-2xl border border-[#e7ebe9] bg-white p-4 sm:p-5">
              <h3 className="text-base font-semibold text-[#252d31]">Profile information</h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Info icon={Mail} label="Email" value={user.email} />
                <Info icon={Phone} label="Phone" value={user.phone} />
                <Info icon={UserRound} label="Username" value={user.username} />
                <Info icon={MapPin} label="Location" value={[user.state, user.country].filter(Boolean).join(', ')} />
                <Info icon={CalendarDays} label="Joined" value={dateLabel(user.createdAt)} />
                <Info icon={Clock3} label="Last sign in" value={dateTimeLabel(user.lastLoginAt)} />
                <Info icon={ShieldCheck} label="Identity verification" value={titleCase(user.verificationStatus || 'not_started')} />
                <Info icon={BadgeCheck} label="Two-factor authentication" value={user.twoFactorEnabled ? 'Enabled' : 'Disabled'} />
              </div>
              {user.verificationStatus === 'pending' && <p className="mt-4 rounded-xl bg-[#fff8eb] px-3.5 py-3 text-[13px] leading-5 text-[#855b1c]">Identity documents are awaiting review. Open the Verification page to review the submitted documents.</p>}
            </section>

            <section className="rounded-2xl border border-[#e7ebe9] bg-white p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3"><h3 className="text-base font-semibold text-[#252d31]">Investments</h3><span className="text-xs text-[#858e94]">Latest 10</span></div>
              {user.investments?.length ? <div className="mt-3 divide-y divide-[#edf0ef]">{user.investments.map((investment) => <div className="flex flex-wrap items-center justify-between gap-2 py-3" key={investment._id}><div className="min-w-0"><p className="font-semibold text-[#313a40]">{investment.planName}</p><p className="mt-1 text-xs text-[#858e94]">{investment.roiPercent}% · {investment.intervalLabel} · Started {dateLabel(investment.startedAt)}</p></div><div className="text-right"><p className="font-semibold text-[#313a40]">{money(investment.amount, investment.currency)}</p><p className="mt-1 text-xs text-[#687179]">{titleCase(investment.status)}</p></div></div>)}</div> : <p className="mt-4 rounded-xl bg-[#fafbfa] p-4 text-sm text-[#727b82]">No investments recorded.</p>}
            </section>
          </div>

          <section className="rounded-2xl border border-[#e7ebe9] bg-white p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3"><div><h3 className="text-base font-semibold text-[#252d31]">Recent account activity</h3><p className="mt-1 text-xs text-[#858e94]">Latest 10 transactions</p></div><WalletCards aria-hidden="true" className="h-5 w-5 text-[#1caf35]" /></div>
            {user.transactions?.length ? <div className="mt-3 overflow-x-auto"><table className="w-full min-w-[620px] text-left text-[13px]"><thead className="text-xs uppercase tracking-wide text-[#858e94]"><tr><th className="py-2 pr-4">Activity</th><th className="py-2 pr-4">Method</th><th className="py-2 pr-4">Amount</th><th className="py-2 pr-4">Status</th><th className="py-2">Date</th></tr></thead><tbody className="divide-y divide-[#edf0ef]">{user.transactions.map((transaction) => <tr key={transaction._id}><td className="py-3 pr-4 font-medium text-[#313a40]">{titleCase(transaction.type)}</td><td className="py-3 pr-4 text-[#687179]">{transaction.paymentMethod}</td><td className="py-3 pr-4 font-semibold text-[#313a40]">{money(transaction.amount, transaction.currency)}</td><td className="py-3 pr-4"><Status>{titleCase(transaction.status)}</Status></td><td className="py-3 text-[#687179]">{dateTimeLabel(transaction.createdAt)}</td></tr>)}</tbody></table></div> : <p className="mt-4 rounded-xl bg-[#fafbfa] p-4 text-sm text-[#727b82]">No transactions recorded.</p>}
          </section>
        </div>}
      </div>
    </section>
  </div>
}

export default AdminUserDetails
