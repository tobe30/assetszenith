import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowDownToLine, CalendarDays, Check, FileClock, Info, LoaderCircle, RefreshCw } from 'lucide-react'
import { createDepositRequest, getDepositHistory, getDepositPaymentInstructions } from '../../lib/api'
import { EmptyState, Notice, PageHeading, Panel } from '../../components/dashboard/DashboardPageUI'

const paymentMethods = ['Bitcoin', 'Litecoin', 'Ethereum', 'Bitcoin Cash', 'DASH', 'Dogecoin', 'Perfect Money', 'Bank Transfer', 'Western Union', 'Moneygram', 'Credit Card', 'Payeer', 'VeChain', 'Verus Coin', 'Tether (USDT) TRC-20']
const fieldClass = 'h-11 w-full rounded-xl border border-[#dfe4e6] bg-white px-3 text-sm text-[#384147] outline-none transition placeholder:text-[#a0a7ac] focus:border-[#1caf35] focus:ring-4 focus:ring-[#1caf35]/[0.08]'
const labelClass = 'block text-[13px] font-medium text-[#748087]'
const initialForm = { amount: '', paymentMethod: '', paymentStatus: 'not_sent', paymentDate: '', reference: '', description: '' }

const getPaymentDetails = (method, instructions) => {
  if (!instructions) return []
  if (method === 'Bank Transfer') return [
    ['Account name', instructions.accountName],
    ['Bank name', instructions.bankName],
    ['Account number', instructions.accountNumber],
    ['SWIFT / BIC', instructions.swiftCode],
  ].filter(([, value]) => value)
  if (method === 'Credit Card') return instructions.paymentUrl ? [['Secure payment link', instructions.paymentUrl]] : []
  if (['Perfect Money', 'Payeer'].includes(method)) return [
    ['Payment account', instructions.paymentAccount],
    ['Recipient name', instructions.recipientName],
  ].filter(([, value]) => value)
  if (['Western Union', 'Moneygram'].includes(method)) return [
    ['Recipient name', instructions.recipientName],
    ['Recipient country', instructions.recipientCountry],
  ].filter(([, value]) => value)
  return [
    ['Network', instructions.network],
    ['Wallet address', instructions.address],
  ].filter(([, value]) => value)
}

const hasPaymentDestination = (method, instructions) => {
  if (method === 'Bank Transfer') return Boolean(instructions?.accountName && instructions?.bankName && instructions?.accountNumber)
  if (['Perfect Money', 'Payeer'].includes(method)) return Boolean(instructions?.paymentAccount)
  if (['Western Union', 'Moneygram'].includes(method)) return Boolean(instructions?.recipientName && instructions?.recipientCountry)
  if (method === 'Credit Card') return Boolean(instructions?.paymentUrl)
  return Boolean(instructions?.address && instructions?.network)
}

const formatMoney = (amount, currency = 'USD') => {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency, minimumFractionDigits: 2 }).format(Number(amount) || 0)
  } catch {
    return `${currency} ${Number(amount || 0).toFixed(2)}`
  }
}

const formatDate = (value) => {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString()
}

const statusClass = (status) => {
  if (status === 'approved') return 'bg-[#eaf7ec] text-[#16852d]'
  if (status === 'rejected') return 'bg-[#fff0f0] text-[#c43b3b]'
  return 'bg-[#fff6e7] text-[#a86b0a]'
}

const Deposit = () => {
  const [activeTab, setActiveTab] = useState('deposit')
  const [notice, setNotice] = useState(null)
  const [form, setForm] = useState(initialForm)
  const queryClient = useQueryClient()
  const { data: authUser } = useQuery({ queryKey: ['authUser'] })
  const currency = authUser?.currency || 'USD'
  const instructionsQuery = useQuery({
    queryKey: ['depositPaymentInstructions'],
    queryFn: getDepositPaymentInstructions,
  })
  const selectedInstructions = instructionsQuery.data?.methods?.[form.paymentMethod]
  const paymentDetails = getPaymentDetails(form.paymentMethod, selectedInstructions)
  const paymentDestinationConfigured = hasPaymentDestination(form.paymentMethod, selectedInstructions)
  const historyQuery = useQuery({
    queryKey: ['depositHistory'],
    queryFn: () => getDepositHistory({ page: 1, limit: 50 }),
    enabled: activeTab === 'history',
  })

  const depositMutation = useMutation({
    mutationFn: createDepositRequest,
    onSuccess: async (result) => {
      setNotice({ type: 'success', text: result.message || 'Your deposit request was submitted for review.' })
      setForm(initialForm)
      await queryClient.invalidateQueries({ queryKey: ['depositHistory'] })
      setActiveTab('history')
    },
    onError: (error) => {
      setNotice({ type: 'error', text: error.response?.data?.message || 'Could not submit your deposit request. Please try again.' })
    },
  })
  const handleSubmit = (event) => {
    event.preventDefault()
    setNotice(null)
    const paymentDate = form.paymentDate ? new Date(form.paymentDate).toISOString() : undefined
    depositMutation.mutate({
      amount: form.amount,
      paymentMethod: form.paymentMethod,
      paymentStatus: 'sent',
      ...(paymentDate ? { paymentDate } : {}),
      reference: form.reference.trim(),
      description: form.description.trim(),
    })
  }

  const updateField = (event) => {
    const { name, value } = event.target
    setForm((current) => ({
      ...current,
      [name]: value,
      ...(name === 'paymentMethod' || name === 'amount' ? { paymentStatus: 'not_sent', paymentDate: '', reference: '' } : {}),
    }))
  }

  return (
    <div className="mx-auto max-w-[1100px]">
      <PageHeading eyebrow="Money" title="Fund deposit" description="Submit deposit details and review the status of previous requests." />
      <Panel className="overflow-hidden p-5 sm:p-7">
        <div aria-label="Deposit sections" className="flex gap-1 overflow-x-auto border-b border-[#dfe4e6]" role="tablist">
          {[['deposit', 'Deposit Fund'], ['history', 'Deposit History']].map(([id, title]) => <button aria-selected={activeTab === id} className={`shrink-0 rounded-t-xl border px-4 py-3 text-sm font-medium transition ${activeTab === id ? 'border-[#dfe4e6] border-b-white bg-white text-[#20262a]' : 'border-transparent text-[#748087] hover:text-[#20262a]'}`} key={id} onClick={() => { setActiveTab(id); setNotice(null) }} role="tab" type="button">{title}</button>)}
        </div>

        {activeTab === 'deposit' ? (
          <form className="grid gap-x-6 gap-y-5 pt-6 md:grid-cols-2" onSubmit={handleSubmit}>
            <label className={`${labelClass} md:col-span-2`}>Deposit Amount <span className="font-normal">(Amount you will send) *</span>
              <span className="mt-2 flex h-11 overflow-hidden rounded-xl border border-[#dfe4e6] focus-within:border-[#1caf35] focus-within:ring-4 focus-within:ring-[#1caf35]/[0.08]"><span className="flex items-center bg-[#f1f3f5] px-3.5 text-[13px] font-medium text-[#586168]">{currency}</span><input className="min-w-0 flex-1 border-0 px-3 text-sm text-[#384147] outline-none placeholder:text-[#a0a7ac]" min="0.01" name="amount" onChange={updateField} placeholder="0.00" required step="0.01" type="number" value={form.amount} /></span>
            </label>
            <label className={labelClass}>Payment Method <span className="font-normal">(How you intend to make payment) *</span><select className={`${fieldClass} mt-2`} name="paymentMethod" onChange={updateField} required value={form.paymentMethod}><option disabled value="">Select a payment method</option>{paymentMethods.map((method) => <option key={method} value={method}>{method}</option>)}</select></label>
            {form.paymentMethod && <div className="space-y-4 md:col-span-2">
              <section aria-label="Payment instructions" className="payment-instructions-card rounded-2xl border border-[#e4ebe5] bg-[#f8fbf8] p-4 sm:p-5">
                <div className="flex items-start gap-3"><span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#eaf7ec] text-[#1caf35]"><Info className="h-[18px] w-[18px]" /></span><div className="min-w-0"><h2 className="text-sm font-semibold text-[#273036]">{selectedInstructions?.title || 'Payment instructions'}</h2><p className="mt-1 text-[13px] leading-5 text-[#687179]">{selectedInstructions?.instructions}</p></div></div>
                {instructionsQuery.isPending ? <p className="mt-4 text-[13px] text-[#687179]">Loading payment instructions…</p> : instructionsQuery.isError ? <p className="payment-instructions-alert mt-4 rounded-xl border border-[#f0d8c2] bg-[#fff8f0] px-3.5 py-3 text-[13px] leading-5 text-[#7e4b20]">Could not load payment instructions. Please try again later.</p> : paymentDetails.length > 0 && <dl className="mt-4 grid gap-2 sm:grid-cols-2">{paymentDetails.map(([label, value]) => <div className="payment-instructions-detail min-w-0 rounded-xl border border-[#e7ebe9] bg-white px-3.5 py-3" key={label}><dt className="text-[11px] font-semibold uppercase tracking-wide text-[#858e94]">{label}</dt><dd className="mt-1 break-all text-sm font-semibold text-[#273036]">{label === 'Secure payment link' ? <a className="text-[#16852d] underline underline-offset-2" href={value} rel="noreferrer" target="_blank">Open secure payment page</a> : value}</dd></div>)}</dl>}
                {!paymentDestinationConfigured && !instructionsQuery.isPending && <p className="payment-instructions-alert mt-4 rounded-xl border border-[#f0d8c2] bg-[#fff8f0] px-3.5 py-3 text-[13px] leading-5 text-[#7e4b20]">Payment details for this method have not been set up yet. Please contact support before sending money.</p>}
                {paymentDestinationConfigured && form.amount && <p className="mt-3 text-[13px] font-medium text-[#384147]">Send exactly <span className="font-bold">{formatMoney(form.amount, currency)}</span>, then enter the transfer or blockchain reference below.</p>}
              </section>
              {form.paymentStatus !== 'sent' ? <button className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#cfe8d3] bg-white px-4 text-[13px] font-semibold text-[#16852d] transition hover:bg-[#f1faf3] disabled:cursor-not-allowed disabled:opacity-50" disabled={!paymentDestinationConfigured} onClick={() => setForm((current) => ({ ...current, paymentStatus: 'sent' }))} type="button"><Check className="h-4 w-4" />I’ve sent the payment</button> : <div className="grid gap-x-6 gap-y-5 md:grid-cols-2">
                <label className={labelClass}>Payment Date <span className="font-normal">(optional)</span><span className="relative mt-2 block"><CalendarDays aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7c858b]" /><input className={`${fieldClass} pl-10`} name="paymentDate" onChange={updateField} type="datetime-local" value={form.paymentDate} /></span></label>
                <label className={labelClass}>Transaction / Memo ID *<input className={`${fieldClass} mt-2`} maxLength={120} name="reference" onChange={updateField} placeholder="Enter the transfer reference or transaction ID" required value={form.reference} /></label>
                <label className={`${labelClass} md:col-span-2`}>Additional details <span className="font-normal">(optional)</span><textarea className="mt-2 min-h-[56px] w-full resize-y rounded-xl border border-[#dfe4e6] bg-white px-3 py-2.5 text-sm text-[#384147] outline-none transition placeholder:text-[#a0a7ac] focus:border-[#1caf35] focus:ring-4 focus:ring-[#1caf35]/[0.08]" maxLength={1000} name="description" onChange={updateField} placeholder="Add any details that will help us verify the payment" value={form.description} /></label>
                <button className="justify-self-start text-left text-xs font-semibold text-[#748087] underline decoration-[#cbd2ce] underline-offset-4 hover:text-[#384147] md:col-span-2" onClick={() => setForm((current) => ({ ...current, paymentStatus: 'not_sent', paymentDate: '', reference: '' }))} type="button">I haven’t sent it yet</button>
              </div>}
            </div>}
            {notice && <div className="md:col-span-2"><Notice tone={notice.type}>{notice.text}</Notice></div>}
            {form.paymentStatus === 'sent' && <div className="md:col-span-2"><button className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#1caf35] px-5 text-sm font-semibold text-white transition hover:bg-[#15952b] disabled:cursor-not-allowed disabled:opacity-60" disabled={depositMutation.isPending || !paymentDestinationConfigured} type="submit">{depositMutation.isPending ? <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" /> : <ArrowDownToLine aria-hidden="true" className="h-4 w-4" />}{depositMutation.isPending ? 'Submitting request…' : 'Submit for payment review'}</button><p className="mt-3 text-xs leading-5 text-[#858e94]">Your request stays pending while we verify the payment. Your wallet is credited only after approval.</p></div>}
          </form>
        ) : (
          <div className="pt-5">
            {historyQuery.isPending ? <div className="flex min-h-[180px] items-center justify-center gap-2 text-sm text-[#748087]"><LoaderCircle className="h-4 w-4 animate-spin" />Loading deposit history…</div> : historyQuery.isError ? <div className="space-y-4"><Notice>{historyQuery.error.response?.data?.message || 'Could not load your deposit history.'}</Notice><button className="inline-flex items-center gap-2 text-sm font-semibold text-[#16852d]" onClick={() => historyQuery.refetch()} type="button"><RefreshCw className="h-4 w-4" />Try again</button></div> : (historyQuery.data?.transactions || []).length === 0 ? <EmptyState icon={FileClock} title="No deposit history yet" description="Your submitted deposit requests will appear here." /> : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                  <thead><tr className="border-b border-[#e7ebe9] text-[12px] font-semibold uppercase tracking-wide text-[#7a858b]"><th className="px-3 py-3">Date submitted</th><th className="px-3 py-3">Amount</th><th className="px-3 py-3">Payment method</th><th className="px-3 py-3">Payment status</th><th className="px-3 py-3">Request status</th><th className="px-3 py-3">Reference</th></tr></thead>
                  <tbody>{historyQuery.data.transactions.map((transaction) => <tr className="border-b border-[#f0f2f1] last:border-0" key={transaction._id}><td className="whitespace-nowrap px-3 py-4 text-[#586168]">{formatDate(transaction.createdAt)}</td><td className="whitespace-nowrap px-3 py-4 font-semibold text-[#252d31]">{formatMoney(transaction.amount, transaction.currency || currency)}</td><td className="px-3 py-4 text-[#586168]">{transaction.paymentMethod || '—'}</td><td className="px-3 py-4 text-[#586168]">{transaction.paymentStatus === 'sent' ? 'Payment made' : 'Yet to make payment'}</td><td className="px-3 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusClass(transaction.status)}`}>{transaction.status || 'pending'}</span></td><td className="max-w-[180px] truncate px-3 py-4 text-[#586168]" title={transaction.reference}>{transaction.reference || '—'}</td></tr>)}</tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </Panel>
    </div>
  )
}

export default Deposit
