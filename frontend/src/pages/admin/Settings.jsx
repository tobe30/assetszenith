import { useState } from 'react'
import { Check, Coins, Bell, ShieldCheck } from 'lucide-react'
import { Heading, Panel } from '../../components/admin/AdminUI'
import DepositPaymentSettings from '../../components/admin/DepositPaymentSettings'

const supportedCurrencies = [
  ['USD', 'US Dollar'],
  ['EUR', 'Euro'],
  ['CNY', 'Chinese Yuan'],
  ['JPY', 'Japanese Yen'],
  ['GBP', 'British Pound'],
  ['AUD', 'Australian Dollar'],
  ['TRY', 'Turkish Lira'],
]

const AdminSettings = () => {
  const [settings, setSettings] = useState({ reviewAlerts: true, marketAlerts: false })
  const [saved, setSaved] = useState(false)
  const setField = (event) => { const { name, value, checked, type } = event.target; setSettings((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value })); setSaved(false) }
  const submit = (event) => { event.preventDefault(); setSaved(true) }
  return <div>
    <Heading eyebrow="Admin" title="Settings" description="Set display and notification preferences for the management workspace." />
    <DepositPaymentSettings />
    <form className="space-y-5" onSubmit={submit}>
      <Panel className="overflow-hidden">
        <div className="flex items-center gap-3 border-b border-[#edf0ef] px-5 py-5 sm:px-7"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#eef3ff] text-[#4268ca]"><Coins className="h-5 w-5" /></span><div><h2 className="text-base font-semibold text-[#252d31]">Account currencies</h2><p className="mt-1 text-[13px] text-[#727b82]">Currencies available to customer accounts.</p></div></div>
        <div className="p-5 sm:p-7"><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{supportedCurrencies.map(([code, name]) => <div className="flex items-center gap-3 rounded-xl border border-[#edf0ef] bg-white px-4 py-3" key={code}><span className="flex h-10 min-w-12 items-center justify-center rounded-lg bg-[#f1f3f5] px-2 text-xs font-bold tracking-wide text-[#465058]">{code}</span><span className="text-sm font-medium text-[#384147]">{name}</span></div>)}</div><p className="mt-4 text-[13px] leading-5 text-[#727b82]">Each customer balance stays in the currency selected for their account. Different currencies are shown separately and are not converted into a single total.</p></div>
      </Panel>
      <Panel className="overflow-hidden">
        <div className="flex items-center gap-3 border-b border-[#edf0ef] px-5 py-5 sm:px-7"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#eaf7ec] text-[#1caf35]"><Bell className="h-5 w-5" /></span><div><h2 className="text-base font-semibold text-[#252d31]">Notifications</h2><p className="mt-1 text-[13px] text-[#727b82]">Select the updates to show in this workspace.</p></div></div>
        <div className="divide-y divide-[#edf0ef] px-5 sm:px-7">{[['reviewAlerts', 'Deposit and withdrawal reviews', 'Get a reminder when payment requests need review.'], ['marketAlerts', 'Market data updates', 'Show notices about market data availability.']].map(([name, title, description]) => <label className="flex cursor-pointer items-center justify-between gap-4 py-4" key={name}><span><span className="block text-sm font-semibold text-[#313a40]">{title}</span><span className="mt-1 block text-[13px] text-[#727b82]">{description}</span></span><input checked={settings[name]} className="h-4 w-4 accent-[#1caf35]" name={name} onChange={setField} type="checkbox" /></label>)}</div>
      </Panel>
      <div className="flex flex-col-reverse items-stretch justify-end gap-3 sm:flex-row sm:items-center">{saved && <p aria-live="polite" className="mr-auto inline-flex items-center gap-2 text-[13px] font-medium text-[#16852d]"><Check className="h-4 w-4" />Preferences saved for this session</p>}<button className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#1caf35] px-5 text-sm font-semibold text-white hover:bg-[#15952b]" type="submit"><ShieldCheck className="h-4 w-4" />Save settings</button></div>
    </form>
  </div>
}

export default AdminSettings
