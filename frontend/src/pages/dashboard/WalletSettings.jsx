import { ArrowDownToLine, Wallet } from 'lucide-react'
import { EmptyState, PageHeading, Panel } from '../../components/dashboard/DashboardPageUI'

const WalletSettings = () => (
  <div className="mx-auto max-w-[1000px]">
    <PageHeading eyebrow="My account" title="Wallet settings" description="Manage the payout destination associated with your account." />
    <Panel className="p-5 sm:p-7">
      <div className="flex items-start gap-4"><span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f1f7f2] text-[#1caf35]"><Wallet className="h-5 w-5" /></span><div><h2 className="text-base font-semibold text-[#252d31]">Withdrawal methods</h2><p className="mt-1 text-[13px] leading-5 text-[#727b82]">Add and manage a verified destination for future withdrawals.</p></div></div>
      <div className="mt-5"><EmptyState icon={ArrowDownToLine} title="No payout method connected" description="Connect account verification and secure payment storage to add a withdrawal method." /></div>
    </Panel>
    <p className="mt-4 text-[13px] leading-5 text-[#858e94]">For your security, payout details should only be added through a verified, encrypted account service.</p>
  </div>
)

export default WalletSettings
