import { useState } from 'react'
import { FileClock, Sparkles } from 'lucide-react'
import { EmptyState, PageHeading, Panel } from '../../components/dashboard/DashboardPageUI'

const SignalSubscription = () => {
  const [activeTab, setActiveTab] = useState('my-subscriptions')
  return (
    <div className="mx-auto max-w-[1100px]">
      <PageHeading eyebrow="Trade signals" title="Signal plans" description="Review available signal plans and any active subscriptions." />
      <Panel className="overflow-hidden p-5 sm:p-7">
        <div className="mb-5"><h2 className="text-base font-semibold text-[#252d31]">Available plans</h2><p className="mt-1 text-[13px] text-[#727b82]">Signal feed and subscription options.</p></div>
        <div aria-label="Subscription sections" className="flex gap-1 overflow-x-auto border-b border-[#dfe4e6]" role="tablist">{[['my-subscriptions', 'My subscriptions'], ['available', 'Add subscription']].map(([id, label]) => <button aria-selected={activeTab === id} className={`-mb-px shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition ${activeTab === id ? 'border-[#1caf35] text-[#20262a]' : 'border-transparent text-[#748087] hover:text-[#20262a]'}`} key={id} onClick={() => setActiveTab(id)} role="tab" type="button">{label}</button>)}</div>
        {activeTab === 'my-subscriptions' ? <EmptyState icon={FileClock} title="No signal subscriptions" description="Your active signal subscriptions will appear here when subscription services are connected." /> : <EmptyState icon={Sparkles} title="No signal plans available" description="Signal subscription plans will be listed here when plan details and billing are configured." />}
        <p className="mt-2 border-t border-[#edf0ef] pt-4 text-xs leading-5 text-[#858e94]">Subscription and payment actions are not enabled on this preview page.</p>
      </Panel>
    </div>
  )
}

export default SignalSubscription
