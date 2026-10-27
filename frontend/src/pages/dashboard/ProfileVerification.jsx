import { useState } from 'react'
import { BadgeCheck, CalendarDays, FileCheck2, MapPin, ShieldCheck } from 'lucide-react'
import { Notice, PageHeading, Panel } from '../../components/dashboard/DashboardPageUI'

const tabs = [
  { id: 'identity', label: 'ID Verification', icon: BadgeCheck },
  { id: 'address', label: 'Address Verification', icon: MapPin },
]

const ProfileVerification = () => {
  const [activeTab, setActiveTab] = useState('identity')
  const tab = tabs.find(({ id }) => id === activeTab)
  const Icon = tab.icon

  return (
    <div className="mx-auto max-w-[1100px]">
      <PageHeading eyebrow="My account" title="Profile verification" description="Review your identity and address verification status." />
      <Panel className="overflow-hidden p-5 sm:p-7">
        <div aria-label="Verification type" className="flex gap-1 overflow-x-auto border-b border-[#dfe4e6]" role="tablist">
          {tabs.map(({ id, label }) => <button aria-selected={activeTab === id} className={`-mb-px shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition ${activeTab === id ? 'border-[#1caf35] text-[#20262a]' : 'border-transparent text-[#748087] hover:text-[#20262a]'}`} key={id} onClick={() => setActiveTab(id)} role="tab" type="button">{label}</button>)}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#edf0ef] py-5">
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f1f7f2] text-[#1caf35]"><Icon className="h-5 w-5" /></span>
            <div><h2 className="text-base font-semibold text-[#252d31]">{tab.label}</h2><p className="mt-1 text-[13px] text-[#727b82]">Verification status</p></div>
          </div>
          <span className="rounded-full bg-[#fff5e8] px-3 py-1.5 text-[13px] font-medium text-[#9a6518]">Not submitted</span>
        </div>

        <div className="grid gap-5 py-6 sm:grid-cols-2">
          {activeTab === 'identity' ? <>
            <label className="block text-[13px] font-medium text-[#748087]">ID type<select className="mt-2 h-11 w-full rounded-xl border border-[#dfe4e6] bg-white px-3 text-sm text-[#384147] outline-none focus:border-[#1caf35] focus:ring-4 focus:ring-[#1caf35]/[0.08]" defaultValue=""><option disabled value="">Select ID type</option><option>Passport</option><option>National identity card</option><option>Driver's licence</option></select></label>
            <label className="block text-[13px] font-medium text-[#748087]">ID number<input className="mt-2 h-11 w-full rounded-xl border border-[#dfe4e6] px-3 text-sm outline-none focus:border-[#1caf35] focus:ring-4 focus:ring-[#1caf35]/[0.08]" placeholder="Enter ID number" /></label>
            <label className="block text-[13px] font-medium text-[#748087]">Issue date<span className="relative mt-2 block"><CalendarDays aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7c858b]" /><input className="h-11 w-full rounded-xl border border-[#dfe4e6] px-3 pl-10 text-sm outline-none focus:border-[#1caf35]" type="date" /></span></label>
            <label className="block text-[13px] font-medium text-[#748087]">Expiry date<span className="relative mt-2 block"><CalendarDays aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7c858b]" /><input className="h-11 w-full rounded-xl border border-[#dfe4e6] px-3 pl-10 text-sm outline-none focus:border-[#1caf35]" type="date" /></span></label>
          </> : <>
            <label className="block text-[13px] font-medium text-[#748087] sm:col-span-2">Residential address<input className="mt-2 h-11 w-full rounded-xl border border-[#dfe4e6] px-3 text-sm outline-none focus:border-[#1caf35]" placeholder="Street address" /></label>
            <label className="block text-[13px] font-medium text-[#748087]">City<input className="mt-2 h-11 w-full rounded-xl border border-[#dfe4e6] px-3 text-sm outline-none focus:border-[#1caf35]" placeholder="City" /></label>
            <label className="block text-[13px] font-medium text-[#748087]">Postal code<input className="mt-2 h-11 w-full rounded-xl border border-[#dfe4e6] px-3 text-sm outline-none focus:border-[#1caf35]" placeholder="Postal code" /></label>
          </>}
        </div>

        <div className="mb-5 rounded-xl border border-dashed border-[#dfe5e2] bg-[#fafbfa] p-5 text-center">
          <FileCheck2 aria-hidden="true" className="mx-auto h-6 w-6 text-[#1caf35]" />
          <p className="mt-2 text-sm font-semibold text-[#384147]">Upload supporting document</p>
          <p className="mt-1 text-[13px] leading-5 text-[#727b82]">Secure document upload becomes available when a verified storage service is connected.</p>
          <button className="mt-4 h-10 cursor-not-allowed rounded-xl border border-[#e5e9e7] bg-white px-4 text-[13px] font-semibold text-[#8b9499]" disabled type="button">Choose file</button>
        </div>
        <Notice><span className="inline-flex items-center gap-2"><ShieldCheck aria-hidden="true" className="h-4 w-4 shrink-0" />Your documents and verification details are not sent or stored from this preview.</span></Notice>
      </Panel>
    </div>
  )
}

export default ProfileVerification
