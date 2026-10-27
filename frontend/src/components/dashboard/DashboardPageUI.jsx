import { useQuery } from '@tanstack/react-query'
import BalanceCard from '../BalanceCard'
import { ArrowDownToLine, BriefcaseBusiness, Gift, Wallet } from 'lucide-react'
import { getWalletSummary } from '../../lib/api'

export const Panel = ({ children, className = '' }) => (
  <section className={`rounded-2xl border border-[#e7ebe9] bg-white shadow-[0_2px_10px_rgba(24,35,30,0.025)] ${className}`}>{children}</section>
)

export const AccountBalanceGrid = ({ currency = 'USD', wallet: suppliedWallet }) => {
  const walletQuery = useQuery({ queryKey: ['walletSummary'], queryFn: getWalletSummary })
  const wallet = suppliedWallet || walletQuery.data?.wallet
  const displayCurrency = wallet?.currency || currency
  const amounts = [wallet?.walletBalance, wallet?.portfolioBalance, wallet?.totalBonus, wallet?.totalWithdrawals]
  const cards = [
    { title: 'Wallet Balance', icon: Wallet, iconClassName: 'bg-[#eaf7ec] text-[#1caf35]' },
    { title: 'Portfolio Balance', icon: BriefcaseBusiness, iconClassName: 'bg-[#fff0f0] text-[#ff1018]' },
    { title: 'Total Bonus', icon: Gift, iconClassName: 'bg-[#fff5e8] text-[#d58a19]' },
    { title: 'Total Withdrawals', icon: ArrowDownToLine, iconClassName: 'bg-[#eef3ff] text-[#4268ca]' },
  ]

  return (
    <section aria-label="Account balances" className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((balance, index) => <BalanceCard amount={amounts[index] ?? 0} currency={displayCurrency} key={balance.title} loading={!wallet && walletQuery.isPending} unavailable={!wallet && walletQuery.isError} {...balance} />)}
    </section>
  )
}

export const PageHeading = ({ eyebrow = 'Workspace', title, description, action }) => (
  <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#1caf35]">{eyebrow}</p>
      <h1 className="mt-2 text-[26px] font-semibold tracking-[-0.04em] text-[#171c1f] sm:text-[30px]">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-[#727b82]">{description}</p>
    </div>
    {action}
  </div>
)

export const Notice = ({ children, tone = 'neutral' }) => (
  <p aria-live="polite" className={`rounded-xl border px-4 py-3 text-[13px] leading-5 ${tone === 'success' ? 'border-[#ccebd2] bg-[#f1faf3] text-[#16852d]' : tone === 'error' ? 'border-[#f0cccc] bg-[#fff6f6] text-[#b33b3b]' : 'border-[#e7ebe9] bg-[#f8faf8] text-[#586168]'}`}>{children}</p>
)

export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex min-h-[220px] flex-col items-center justify-center px-6 py-10 text-center">
    <span aria-hidden="true" className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f1f7f2] text-[#1caf35]"><Icon className="h-6 w-6" strokeWidth={1.8} /></span>
    <h3 className="mt-4 text-base font-semibold text-[#252d31]">{title}</h3>
    <p className="mt-2 max-w-md text-[13px] leading-5 text-[#727b82]">{description}</p>
    {action && <div className="mt-5">{action}</div>}
  </div>
)
