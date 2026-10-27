import { useState } from 'react'
import { ArrowDownToLine, ArrowUpFromLine, Check, X } from 'lucide-react'

export const Panel = ({ children, className = '' }) => <section className={`rounded-2xl border border-[#e7ebe9] bg-white shadow-[0_2px_10px_rgba(24,35,30,0.025)] ${className}`}>{children}</section>

export const Heading = ({ eyebrow = 'Management', title, description, action }) => <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#1caf35]">{eyebrow}</p><h1 className="mt-2 text-[26px] font-semibold tracking-[-0.04em] text-[#171c1f] sm:text-[30px]">{title}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-[#727b82]">{description}</p></div>{action}</div>

export const MetricGrid = ({ metrics = [] }) => <section aria-label="Platform summary" className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(({ title, amount, change, icon: Icon, color }) => <article className="rounded-2xl border border-[#dfe4e6] bg-white p-4 sm:p-5" key={title}><div className="flex items-center justify-between gap-3"><p className="text-sm font-medium text-[#687179]">{title}</p><span className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}><Icon className="h-[18px] w-[18px]" /></span></div><p className="mt-3 break-words text-[25px] font-semibold tracking-tight text-[#15191c]">{amount}</p><p className="mt-1 text-[13px] text-[#858e94]">{change}</p></article>)}</section>

export const Status = ({ children }) => <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${children === 'Active' || children === 'Approved' ? 'bg-[#eaf7ec] text-[#16852d]' : children === 'Review' || children === 'Pending' ? 'bg-[#fff5e8] text-[#9a6518]' : 'bg-[#f3f5f4] text-[#687179]'}`}>{children}</span>

export const ActionNotice = ({ notice, onClose }) => notice ? <div aria-live="polite" className="mb-5 flex items-start justify-between gap-4 rounded-xl border border-[#ccebd2] bg-[#f1faf3] px-4 py-3 text-[13px] leading-5 text-[#16852d]"><span className="inline-flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0" />{notice}</span><button aria-label="Dismiss notice" className="text-[#16852d]" onClick={onClose} type="button"><X className="h-4 w-4" /></button></div> : null

export const QueueSummary = ({ deposits = 0, withdrawals = 0 }) => <div className="grid gap-3 sm:grid-cols-2"><div className="flex items-center gap-3 rounded-xl border border-[#edf0ef] p-4"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaf7ec] text-[#1caf35]"><ArrowDownToLine className="h-5 w-5" /></span><div><p className="text-sm font-semibold text-[#313a40]">Deposit requests</p><p className="mt-1 text-[13px] text-[#727b82]">{deposits} awaiting review</p></div></div><div className="flex items-center gap-3 rounded-xl border border-[#edf0ef] p-4"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff0f0] text-[#ed161f]"><ArrowUpFromLine className="h-5 w-5" /></span><div><p className="text-sm font-semibold text-[#313a40]">Withdrawal requests</p><p className="mt-1 text-[13px] text-[#727b82]">{withdrawals} awaiting review</p></div></div></div>

export const AmountModal = ({ user, mode, onClose, onApply, isPending = false, errorMessage = '', plans = [], plansLoading = false }) => {
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')
  const isInvestment = mode === 'investment'
  const [planCode, setPlanCode] = useState('')
  const selectedPlan = plans.find((plan) => plan.code === planCode)
  const title = isInvestment ? 'Create investment' : 'Fund wallet'
  const submit = (event) => { event.preventDefault(); if (Number(amount) > 0 && (!isInvestment || selectedPlan)) onApply(Number(amount), reason, planCode); }
  const formatPlanAmount = (value) => new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111416]/45 p-4" onClick={() => !isPending && onClose()}>
    <section aria-labelledby="amount-modal-title" aria-modal="true" className="w-full max-w-md rounded-2xl border border-[#e7ebe9] bg-white p-5 shadow-2xl sm:p-6" onClick={(event) => event.stopPropagation()} role="dialog">
      <div className="mb-5 flex items-start justify-between gap-3"><div><p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-[#1caf35]">{user.name}</p><h2 className="mt-1 text-xl font-semibold text-[#20262a]" id="amount-modal-title">{title}</h2><p className="mt-1 text-[13px] text-[#727b82]">This adjustment will be recorded in the account transaction history.</p></div><button aria-label="Close" className="rounded-lg p-2 text-[#687179] hover:bg-[#f5f7f6] disabled:opacity-50" disabled={isPending} onClick={onClose} type="button"><X className="h-5 w-5" /></button></div>
      <form className="space-y-4" onSubmit={submit}>
        {isInvestment && <>
          <div className="rounded-xl border border-[#edf0ef] bg-[#fafbfa] px-3.5 py-3 text-[13px] text-[#586168]">Available wallet balance: <strong className="text-[#313a40]">{user.currency || 'USD'} {formatPlanAmount(user.wallet || 0)}</strong></div>
          <label className="block text-[13px] font-medium text-[#505a60]">Investment plan<select className="mt-2 h-11 w-full rounded-xl border border-[#dfe4e6] bg-white px-3 text-sm outline-none focus:border-[#1caf35]" disabled={isPending || plansLoading} onChange={(event) => { setPlanCode(event.target.value); setAmount('') }} required value={planCode}><option value="">{plansLoading ? 'Loading plans…' : 'Select a plan'}</option>{plans.map((plan) => <option key={plan.code} value={plan.code}>{plan.name} · {plan.roiPercent}% {plan.intervalLabel}</option>)}</select></label>
          {selectedPlan && <p className="rounded-xl border border-[#edf0ef] bg-[#fafbfa] px-3.5 py-3 text-[13px] leading-5 text-[#586168]">{selectedPlan.name}: minimum {selectedPlan.currency} {formatPlanAmount(selectedPlan.minimum)}{selectedPlan.maximum === null ? ', no maximum' : ` · maximum ${selectedPlan.currency} ${formatPlanAmount(selectedPlan.maximum)}`} · {selectedPlan.roiPercent}% {selectedPlan.intervalLabel.toLowerCase()}.</p>}
        </>}
        <label className="block text-[13px] font-medium text-[#505a60]">{isInvestment ? 'Investment amount' : 'Amount to add'}<span className="mt-2 flex h-11 overflow-hidden rounded-xl border border-[#dfe4e6] focus-within:border-[#1caf35]"><span className="flex items-center bg-[#f1f3f5] px-3 text-[13px] text-[#586168]">{user.currency || 'USD'}</span><input autoFocus className="min-w-0 flex-1 px-3 text-sm outline-none" disabled={isPending} max={selectedPlan?.maximum ?? undefined} min={isInvestment ? (selectedPlan?.minimum ?? 0.01) : 0.01} placeholder="0.00" required step="0.01" type="number" value={amount} onChange={(event) => setAmount(event.target.value)} /></span></label>
        <label className="block text-[13px] font-medium text-[#505a60]">Admin note <span className="font-normal text-[#858e94]">(optional)</span><textarea className="mt-2 min-h-[84px] w-full rounded-xl border border-[#dfe4e6] px-3 py-2 text-sm outline-none focus:border-[#1caf35]" disabled={isPending} maxLength={500} onChange={(event) => setReason(event.target.value)} placeholder="Reason for this adjustment" value={reason} /></label>
        {errorMessage && <p aria-live="polite" className="rounded-lg border border-[#f0d8c2] bg-[#fff8f0] px-3 py-2 text-[13px] leading-5 text-[#7e4b20]">{errorMessage}</p>}
        <div className="flex justify-end gap-2 pt-1"><button className="h-10 rounded-xl border border-[#e5e9e7] px-4 text-[13px] font-semibold text-[#465058] disabled:opacity-50" disabled={isPending} onClick={onClose} type="button">Cancel</button><button className="h-10 rounded-xl bg-[#1caf35] px-4 text-[13px] font-semibold text-white hover:bg-[#15952b] disabled:cursor-wait disabled:opacity-60" disabled={isPending || (isInvestment && (!selectedPlan || plansLoading))} type="submit">{isPending ? 'Submitting…' : title}</button></div>
      </form>
    </section>
  </div>
}
