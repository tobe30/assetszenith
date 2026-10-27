import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowDownToLine, ArrowUpFromLine, FileClock, LoaderCircle, RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'
import { createWithdrawalRequest, getWalletSummary, getWithdrawalHistory } from '../../lib/api'
import { AccountBalanceGrid, EmptyState, Notice, PageHeading, Panel } from '../../components/dashboard/DashboardPageUI'

const withdrawalMethods = ['Bitcoin', 'Litecoin', 'Ethereum', 'Bitcoin Cash', 'Bank transfer', 'Payeer', 'USDT']
const fieldClass = 'mt-2 h-11 w-full rounded-xl border border-[#dfe4e6] bg-white px-3 text-sm text-[#384147] outline-none transition placeholder:text-[#a0a7ac] focus:border-[#1caf35] focus:ring-4 focus:ring-[#1caf35]/[0.08]'
const initialForm = {
  amount: '', paymentMethod: '', payoutDestination: '', payoutEmail: '',
  beneficiaryAccountNumber: '', beneficiaryAccountName: '', beneficiaryEmail: '',
  beneficiaryPhoneNumber: '', beneficiaryBankName: '', bankSwiftCode: '', bankIBAN: '',
  routingNumber: '', bankAddress: '', bankStateProvince: '', bankCity: '',
  bankPostZipCode: '', bankCountry: '',
}
const bankFields = [
  { name: 'beneficiaryAccountNumber', label: 'Beneficiary Account Number', required: true, maxLength: 100 },
  { name: 'beneficiaryAccountName', label: 'Beneficiary Account Name', required: true, maxLength: 150 },
  { name: 'beneficiaryEmail', label: 'Beneficiary Email', required: true, type: 'email', maxLength: 254 },
  { name: 'beneficiaryPhoneNumber', label: 'Beneficiary Phone Number', required: true, type: 'tel', maxLength: 40 },
  { name: 'beneficiaryBankName', label: 'Beneficiary Bank Name', required: true, maxLength: 150 },
  { name: 'bankSwiftCode', label: 'Bank Swift Code', maxLength: 30 },
  { name: 'bankIBAN', label: 'Bank IBAN', maxLength: 34 },
  { name: 'routingNumber', label: 'Routing Number', maxLength: 50 },
  { name: 'bankAddress', label: 'Bank Address', maxLength: 255 },
  { name: 'bankStateProvince', label: 'State / Province', maxLength: 100 },
  { name: 'bankCity', label: 'City', maxLength: 100 },
  { name: 'bankPostZipCode', label: 'Post / Zip Code', maxLength: 30 },
  { name: 'bankCountry', label: 'Bank Country', required: true, maxLength: 100 },
]

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

const statusClass = (status) => status === 'approved'
  ? 'bg-[#eaf7ec] text-[#16852d]'
  : status === 'rejected'
    ? 'bg-[#fff0f0] text-[#c43b3b]'
    : 'bg-[#fff6e7] text-[#a86b0a]'

const Withdrawal = () => {
  const [activeTab, setActiveTab] = useState('withdraw')
  const [form, setForm] = useState(initialForm)
  const [notice, setNotice] = useState(null)
  const queryClient = useQueryClient()
  const { data: authUser } = useQuery({ queryKey: ['authUser'] })
  const walletQuery = useQuery({ queryKey: ['walletSummary'], queryFn: getWalletSummary })
  const wallet = walletQuery.data?.wallet
  const currency = wallet?.currency || authUser?.currency || 'USD'
  const availableBalance = Number(wallet?.walletBalance) || 0
  const isBankTransfer = form.paymentMethod === 'Bank transfer'

  const historyQuery = useQuery({
    queryKey: ['withdrawalHistory'],
    queryFn: () => getWithdrawalHistory({ page: 1, limit: 50 }),
    enabled: activeTab === 'history',
  })

  const withdrawalMutation = useMutation({
    mutationFn: createWithdrawalRequest,
    onSuccess: async (result) => {
      setNotice({ type: 'success', text: result.message || 'Your withdrawal request was submitted for review.' })
      setForm(initialForm)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['walletSummary'] }),
        queryClient.invalidateQueries({ queryKey: ['withdrawalHistory'] }),
      ])
      setActiveTab('history')
    },
    onError: (error) => setNotice({
      type: 'error',
      text: error.response?.data?.message || 'Could not submit your withdrawal request. Please try again.',
    }),
  })

  const updateField = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setNotice(null)
    withdrawalMutation.mutate({
      amount: form.amount,
      paymentMethod: form.paymentMethod,
      ...(isBankTransfer
        ? Object.fromEntries(bankFields.map(({ name }) => [name, form[name].trim()]))
        : { payoutDestination: form.payoutDestination.trim(), payoutEmail: form.payoutEmail.trim() }),
    })
  }

  return (
    <div className="mx-auto max-w-[1100px]">
      <PageHeading eyebrow="Money" title="Fund withdrawal" description="Request a withdrawal to a payout method connected to your account." action={<Link className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#e5e9e7] bg-white px-4 text-[13px] font-semibold text-[#465058] hover:bg-[#f7f8f7]" to="/dashboard/deposit"><ArrowDownToLine aria-hidden="true" className="h-4 w-4" />Deposit funds</Link>} />
      <AccountBalanceGrid currency={currency} wallet={wallet} />
      <Panel className="overflow-hidden p-5 sm:p-7">
        <div className="mb-5 flex items-center gap-3"><span aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f1f7f2] text-[#1caf35]"><ArrowUpFromLine className="h-5 w-5" /></span><div><h2 className="text-base font-semibold text-[#252d31]">Withdrawal request</h2><p className="mt-1 text-[13px] text-[#727b82]">Choose a payout method and enter the requested details.</p></div></div>
        <div aria-label="Withdrawal sections" className="flex gap-1 overflow-x-auto border-b border-[#dfe4e6]" role="tablist">{[['withdraw', 'Withdraw funds'], ['history', 'Withdrawal history']].map(([id, label]) => <button aria-selected={activeTab === id} className={`-mb-px shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition ${activeTab === id ? 'border-[#1caf35] text-[#20262a]' : 'border-transparent text-[#748087] hover:text-[#20262a]'}`} key={id} onClick={() => { setActiveTab(id); setNotice(null) }} role="tab" type="button">{label}</button>)}</div>
        {notice && <div className="pt-4"><Notice tone={notice.type}>{notice.text}</Notice></div>}
        {activeTab === 'withdraw' ? <form className="grid gap-x-6 gap-y-5 pt-6 md:grid-cols-2" onSubmit={handleSubmit}>
          <label className="block text-[13px] font-medium text-[#748087]">Available balance<span className="mt-2 flex h-11 overflow-hidden rounded-xl border border-[#dfe4e6] bg-[#f7f8f7]"><span className="flex items-center bg-[#f1f3f5] px-3.5 text-[13px] font-medium text-[#586168]">{currency}</span><input aria-label="Available balance" className="min-w-0 flex-1 bg-transparent px-3 text-sm text-[#586168] outline-none" readOnly value={walletQuery.isPending ? 'Loading…' : availableBalance.toFixed(2)} /></span></label>
          <label className="block text-[13px] font-medium text-[#748087]">Amount to withdraw *<span className="mt-2 flex h-11 overflow-hidden rounded-xl border border-[#dfe4e6] focus-within:border-[#1caf35] focus-within:ring-4 focus-within:ring-[#1caf35]/[0.08]"><span className="flex items-center bg-[#f1f3f5] px-3.5 text-[13px] font-medium text-[#586168]">{currency}</span><input className="min-w-0 flex-1 bg-transparent px-3 text-sm text-[#384147] outline-none" max={availableBalance || undefined} min="0.01" name="amount" onChange={updateField} placeholder="0.00" required step="0.01" type="number" value={form.amount} /></span></label>
          <label className="block text-[13px] font-medium text-[#748087] md:col-span-2">Withdrawal method<select className={fieldClass} name="paymentMethod" onChange={updateField} required value={form.paymentMethod}><option disabled value="">Select a withdrawal method</option>{withdrawalMethods.map((method) => <option key={method} value={method}>{method}</option>)}</select></label>
          {isBankTransfer ? <>
            <div className="md:col-span-2"><h3 className="text-sm font-semibold text-[#384147]">Bank beneficiary details</h3><p className="mt-1 text-[13px] text-[#858e94]">Please enter details of where you want us to send this payment below.</p></div>
            {bankFields.map(({ name, label, required = false, type = 'text', maxLength }) => <label className="block text-[13px] font-medium text-[#748087]" key={name}>{label}{required && ' *'}<input autoComplete="off" className={fieldClass} maxLength={maxLength} name={name} onChange={updateField} required={required} type={type} value={form[name]} /></label>)}
          </> : <>
            <div className="md:col-span-2"><h3 className="text-sm font-semibold text-[#384147]">Payout destination</h3><p className="mt-1 text-[13px] text-[#858e94]">Enter the destination details that match your selected method.</p></div>
            <label className="block text-[13px] font-medium text-[#748087]">Account or wallet address<input className={fieldClass} maxLength={255} name="payoutDestination" onChange={updateField} placeholder="Enter payout destination" required value={form.payoutDestination} /></label>
            <label className="block text-[13px] font-medium text-[#748087]">Account email <span className="font-normal">(optional)</span><input className={fieldClass} name="payoutEmail" onChange={updateField} placeholder="name@example.com" type="email" value={form.payoutEmail} /></label>
          </>}
          {walletQuery.isError && <div className="md:col-span-2"><Notice tone="error">Could not load your wallet balance. Refresh the page before submitting a withdrawal.</Notice></div>}
          <div className="md:col-span-2"><button className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#1caf35] px-5 text-sm font-semibold text-white transition hover:bg-[#15952b] disabled:cursor-not-allowed disabled:opacity-60" disabled={withdrawalMutation.isPending || walletQuery.isPending || walletQuery.isError || !form.amount || Number(form.amount) > availableBalance} type="submit">{withdrawalMutation.isPending ? <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" /> : <ArrowUpFromLine aria-hidden="true" className="h-4 w-4" />}{withdrawalMutation.isPending ? 'Submitting request…' : 'Request withdrawal'}</button><p className="mt-3 text-xs leading-5 text-[#858e94]">Your requested amount is reserved while an administrator reviews the withdrawal.</p></div>
        </form> : <div className="pt-5">
          {historyQuery.isPending ? <div className="flex min-h-[180px] items-center justify-center gap-2 text-sm text-[#748087]"><LoaderCircle className="h-4 w-4 animate-spin" />Loading withdrawal history…</div> : historyQuery.isError ? <div className="space-y-4"><Notice tone="error">{historyQuery.error.response?.data?.message || 'Could not load your withdrawal history.'}</Notice><button className="inline-flex items-center gap-2 text-sm font-semibold text-[#16852d]" onClick={() => historyQuery.refetch()} type="button"><RefreshCw className="h-4 w-4" />Try again</button></div> : (historyQuery.data?.transactions || []).length === 0 ? <EmptyState icon={FileClock} title="No withdrawal history yet" description="Your submitted withdrawal requests will appear here." /> : <div className="overflow-x-auto"><table className="w-full min-w-[720px] border-collapse text-left text-sm"><thead><tr className="border-b border-[#e7ebe9] text-[12px] font-semibold uppercase tracking-wide text-[#7a858b]"><th className="px-3 py-3">Date submitted</th><th className="px-3 py-3">Amount</th><th className="px-3 py-3">Method</th><th className="px-3 py-3">Destination</th><th className="px-3 py-3">Status</th></tr></thead><tbody>{historyQuery.data.transactions.map((transaction) => <tr className="border-b border-[#f0f2f1] last:border-0" key={transaction._id}><td className="whitespace-nowrap px-3 py-4 text-[#586168]">{formatDate(transaction.createdAt)}</td><td className="whitespace-nowrap px-3 py-4 font-semibold text-[#252d31]">{formatMoney(transaction.amount, transaction.currency || currency)}</td><td className="px-3 py-4 text-[#586168]">{transaction.paymentMethod || '—'}</td><td className="max-w-[220px] truncate px-3 py-4 text-[#586168]" title={transaction.payoutDestination}>{transaction.payoutDestination || '—'}</td><td className="px-3 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusClass(transaction.status)}`}>{transaction.status || 'pending'}</span></td></tr>)}</tbody></table></div>}
        </div>}
      </Panel>
    </div>
  )
}

export default Withdrawal
