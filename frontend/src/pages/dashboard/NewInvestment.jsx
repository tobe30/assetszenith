import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, LoaderCircle, RefreshCw } from 'lucide-react'
import { createInvestment, getInvestmentPlans, getWalletSummary } from '../../lib/api'
import { AccountBalanceGrid, Notice, PageHeading, Panel } from '../../components/dashboard/DashboardPageUI'

const fieldClass = 'mt-2 h-11 w-full rounded-xl border border-[#dfe4e6] bg-white px-3 text-sm text-[#384147] outline-none transition placeholder:text-[#a0a7ac] focus:border-[#1caf35] focus:ring-4 focus:ring-[#1caf35]/[0.08]'
const labelClass = 'block text-[13px] font-medium text-[#748087]'

const formatMoney = (amount, currency = 'USD') => {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency, minimumFractionDigits: 2 }).format(Number(amount) || 0)
  } catch {
    return `${currency} ${Number(amount || 0).toFixed(2)}`
  }
}

const NewInvestment = () => {
  const [notice, setNotice] = useState(null)
  const [planCode, setPlanCode] = useState('')
  const [amount, setAmount] = useState('')
  const queryClient = useQueryClient()
  const plansQuery = useQuery({ queryKey: ['investmentPlans'], queryFn: getInvestmentPlans })
  const walletQuery = useQuery({ queryKey: ['walletSummary'], queryFn: getWalletSummary })
  const plans = plansQuery.data?.plans || []
  const wallet = walletQuery.data?.wallet
  const currency = wallet?.currency || plans[0]?.currency || 'USD'
  const availableBalance = Number(wallet?.walletBalance) || 0
  const selectedPlan = plans.find((plan) => plan.code === planCode)

  const investmentMutation = useMutation({
    mutationFn: createInvestment,
    onSuccess: async (result) => {
      setNotice({ type: 'success', text: result.message || 'Investment started successfully.' })
      setAmount('')
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['walletSummary'] }),
        queryClient.invalidateQueries({ queryKey: ['myInvestments'] }),
      ])
    },
    onError: (error) => setNotice({
      type: 'error',
      text: error.response?.data?.message || 'Could not start the investment. Please try again.',
    }),
  })

  const submit = (event) => {
    event.preventDefault()
    setNotice(null)
    investmentMutation.mutate({ planCode, amount })
  }

  const plansError = plansQuery.error?.response?.data?.message || 'Could not load investment plans.'
  const walletError = walletQuery.error?.response?.data?.message || 'Could not load your wallet balance.'

  return (
    <div className="mx-auto max-w-[1100px]">
      <PageHeading eyebrow="Trading" title="Invest fund" description="Choose a plan and invest from your available wallet balance." />
      <AccountBalanceGrid currency={currency} wallet={wallet} />
      <Panel className="mb-5 overflow-hidden">
        <div className="border-b border-[#edf0ef] px-5 py-4 sm:px-6">
          <h2 className="text-base font-semibold text-[#252d31]">Available investment plans</h2>
          <p className="mt-1 text-[13px] text-[#727b82]">Minimums and maximums use your account currency: {currency}.</p>
        </div>
        {plansQuery.isPending ? <div className="flex min-h-32 items-center justify-center gap-2 text-sm text-[#748087]"><LoaderCircle className="h-4 w-4 animate-spin" />Loading plans…</div> : plansQuery.isError ? <div className="p-5"><Notice tone="error">{plansError}</Notice><button className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#16852d]" onClick={() => plansQuery.refetch()} type="button"><RefreshCw className="h-4 w-4" />Try again</button></div> : <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] border-collapse text-left">
            <thead><tr className="border-b border-[#edf0ef] bg-[#fafbfa] text-[12px] font-semibold uppercase tracking-[0.06em] text-[#828c92]"><th className="px-5 py-3.5">Package</th><th className="px-5 py-3.5">Min. Deposit</th><th className="px-5 py-3.5">Max. Deposit</th><th className="px-5 py-3.5">ROI</th></tr></thead>
            <tbody className="divide-y divide-[#edf0ef]">{plans.map((plan) => <tr className="text-sm text-[#384147]" key={plan.code}><td className="whitespace-nowrap px-5 py-4 font-semibold">{plan.name}</td><td className="whitespace-nowrap px-5 py-4 text-[#727b82]">{formatMoney(plan.minimum, currency)}</td><td className="whitespace-nowrap px-5 py-4 text-[#727b82]">{plan.maximum === null ? 'No limit' : formatMoney(plan.maximum, currency)}</td><td className="whitespace-nowrap px-5 py-4 font-semibold text-[#16852d]">{plan.roiPercent}% {plan.intervalLabel}</td></tr>)}</tbody>
          </table>
        </div>}
      </Panel>

      <Panel className="overflow-hidden">
        <div className="border-b border-[#edf0ef] px-5 py-4 sm:px-6"><h2 className="text-base font-semibold text-[#252d31]">Investment details</h2><p className="mt-1 text-[13px] text-[#727b82]">Choose an amount within the selected plan’s limits.</p></div>
        <form className="grid gap-x-6 gap-y-5 p-5 sm:grid-cols-2 sm:p-6" onSubmit={submit}>
          <label className={labelClass}>Available balance<span className="mt-2 flex h-11 overflow-hidden rounded-xl border border-[#dfe4e6] bg-[#f7f8f7]"><span className="flex items-center bg-[#f1f3f5] px-3.5 text-[13px] font-medium text-[#586168]">{currency}</span><input aria-label="Available balance" className="min-w-0 flex-1 bg-transparent px-3 text-sm text-[#586168] outline-none" readOnly value={walletQuery.isPending ? 'Loading…' : availableBalance.toFixed(2)} /></span></label>
          <label className={labelClass}>Amount to invest *<span className="mt-2 flex h-11 overflow-hidden rounded-xl border border-[#dfe4e6] focus-within:border-[#1caf35] focus-within:ring-4 focus-within:ring-[#1caf35]/[0.08]"><span className="flex items-center bg-[#f1f3f5] px-3.5 text-[13px] font-medium text-[#586168]">{currency}</span><input className="min-w-0 flex-1 bg-transparent px-3 text-sm text-[#384147] outline-none" disabled={!selectedPlan || investmentMutation.isPending} max={selectedPlan?.maximum ?? availableBalance} min={selectedPlan?.minimum ?? '0.01'} onChange={(event) => { setAmount(event.target.value); setNotice(null) }} placeholder="0.00" required step="0.01" type="number" value={amount} /></span></label>
          <label className={labelClass}>Investment plan *<select className={fieldClass} disabled={plansQuery.isPending || plansQuery.isError || investmentMutation.isPending} onChange={(event) => { setPlanCode(event.target.value); setAmount(''); setNotice(null) }} required value={planCode}><option disabled value="">{plansQuery.isPending ? 'Loading plans…' : 'Select a plan'}</option>{plans.map((plan) => <option key={plan.code} value={plan.code}>{plan.name}</option>)}</select></label>
          <label className={labelClass}>ROI schedule<input className={`${fieldClass} bg-[#f7f8f7] text-[#586168]`} readOnly value={selectedPlan ? `${selectedPlan.roiPercent}% ${selectedPlan.intervalLabel}` : 'Select a plan'} /></label>
          {selectedPlan && <div className="rounded-xl border border-[#e7ebe9] bg-[#f8faf8] px-4 py-3 text-[13px] leading-5 text-[#586168] sm:col-span-2">{selectedPlan.name} accepts {formatMoney(selectedPlan.minimum, currency)} minimum{selectedPlan.maximum === null ? ' with no maximum' : ` and ${formatMoney(selectedPlan.maximum, currency)} maximum`}. Your available wallet balance is {formatMoney(availableBalance, currency)}.</div>}
          {notice && <div className="sm:col-span-2"><Notice tone={notice.type}>{notice.text}</Notice></div>}
          {walletQuery.isError && <div className="sm:col-span-2"><Notice tone="error">{walletError}</Notice></div>}
          <div className="sm:col-span-2"><button className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#1caf35] px-5 text-sm font-semibold text-white transition hover:bg-[#15952b] disabled:cursor-not-allowed disabled:opacity-60" disabled={!selectedPlan || !amount || Number(amount) > availableBalance || investmentMutation.isPending || walletQuery.isPending || walletQuery.isError || plansQuery.isPending || plansQuery.isError} type="submit">{investmentMutation.isPending ? <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" /> : <CheckCircle2 aria-hidden="true" className="h-4 w-4" />}{investmentMutation.isPending ? 'Starting investment…' : 'Start investment'}</button><p className="mt-3 text-xs leading-5 text-[#858e94]">Your selected amount will move from your wallet balance to your investment portfolio. Plan returns are subject to the terms shown above.</p></div>
        </form>
      </Panel>
    </div>
  )
}

export default NewInvestment
