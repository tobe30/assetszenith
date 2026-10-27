import { Activity } from 'lucide-react'
import TradingViewChart from '../../components/TradingViewChart'
import TradingViewMarketTables from '../../components/TradingViewMarketTables'
import TradingViewTicker from '../../components/TradingViewTicker'
import { Heading } from '../../components/admin/AdminUI'

const AdminMarketData = () => <div>
  <TradingViewTicker />
  <div className="mt-6"><Heading eyebrow="Admin" title="Market data" description="Follow live market movement, price charts, crypto assets, and selected stocks." action={<span className="inline-flex items-center gap-2 rounded-full bg-[#eaf7ec] px-3 py-1.5 text-xs font-semibold text-[#16852d]"><Activity className="h-3.5 w-3.5" />TradingView</span>} /></div>
  <section className="mb-6"><div className="mb-3"><h2 className="text-lg font-semibold text-[#252d31]">Bitcoin / U.S. Dollar</h2><p className="mt-1 text-sm text-[#727b82]">Daily chart · USD</p></div><TradingViewChart /></section>
  <section><div className="mb-3"><h2 className="text-lg font-semibold text-[#252d31]">Market watch</h2><p className="mt-1 text-sm text-[#727b82]">Crypto and selected stock prices.</p></div><TradingViewMarketTables /></section>
</div>

export default AdminMarketData
