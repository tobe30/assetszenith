import { useQuery } from '@tanstack/react-query'
import { ArrowDownToLine, BriefcaseBusiness, Gift, Wallet } from 'lucide-react'
import BalanceCard from '../../components/BalanceCard'
import { Notice } from '../../components/dashboard/DashboardPageUI'
import { getWalletSummary } from '../../lib/api'
import TradingViewChart from '../../components/TradingViewChart'
import TradingViewMarketTables from '../../components/TradingViewMarketTables'
import TradingViewTicker from '../../components/TradingViewTicker'

const Dashboard = () => {
  const walletQuery = useQuery({ queryKey: ['walletSummary'], queryFn: getWalletSummary })
  const wallet = walletQuery.data?.wallet
  const currency = wallet?.currency || 'USD'
  const balances = [
    { title: 'Wallet Balance', amount: wallet?.walletBalance, currency, icon: Wallet, iconClassName: 'bg-[#eaf7ec] text-[#1caf35]' },
    { title: 'Portfolio Balance', amount: wallet?.portfolioBalance, currency, icon: BriefcaseBusiness, iconClassName: 'bg-[#fff0f0] text-[#ff1018]' },
    { title: 'Total Bonus', amount: wallet?.totalBonus, currency, icon: Gift, iconClassName: 'bg-[#fff5e8] text-[#d58a19]' },
    { title: 'Total Withdrawals', amount: wallet?.totalWithdrawals, currency, icon: ArrowDownToLine, iconClassName: 'bg-[#eef3ff] text-[#4268ca]' },
  ]

  return (
    <div className="space-y-5 sm:space-y-6">
      <TradingViewTicker />
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-[-0.04em] text-[#15191c] sm:text-3xl">Dashboard</h1>
          <p className="mt-1.5 text-base leading-6 text-[#687179]">A quick overview of your account balances.</p>
        </div>
        <span className="text-sm font-medium text-[#8a9298]">All amounts shown in {currency}</span>
      </div>
      {walletQuery.isError && <Notice tone="error">{walletQuery.error.response?.data?.message || 'Could not load your account balances.'}</Notice>}
      <section aria-label="Account balances" className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 xl:grid-cols-4 xl:gap-4">
        {balances.map((balance) => <BalanceCard key={balance.title} loading={walletQuery.isPending} unavailable={walletQuery.isError} {...balance} />)}
      </section>
      <div className="pt-1 sm:pt-2">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold tracking-[-0.035em] text-[#15191c] sm:text-xl">Market chart</h2>
            <p className="mt-1 text-sm text-[#7c858b]">Bitcoin / U.S. Dollar · daily candles</p>
          </div>
          <span className="rounded-full bg-white px-3 py-1.5 text-sm font-medium text-[#7c858b] ring-1 ring-[#e5e9e7]">TradingView</span>
        </div>
        <TradingViewChart />
      </div>
      <div className="pt-1 sm:pt-2">
        <div className="mb-3">
          <h2 className="text-lg font-semibold tracking-[-0.035em] text-[#15191c] sm:text-xl">Market data</h2>
          <p className="mt-1 text-sm text-[#7c858b]">Explore crypto and selected stock prices.</p>
        </div>
        <TradingViewMarketTables />
      </div>
    </div>
  )
}

export default Dashboard
