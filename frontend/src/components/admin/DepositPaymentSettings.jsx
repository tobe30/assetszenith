import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Banknote, Bitcoin, LoaderCircle, Save, ShieldCheck } from 'lucide-react'
import Loading from '../Loading'
import { getAdminDepositPaymentInstructions, updateAdminDepositPaymentInstruction } from '../../lib/api'
import { Panel } from './AdminUI'

const methods = ['Bitcoin', 'Litecoin', 'Ethereum', 'Bitcoin Cash', 'DASH', 'Dogecoin', 'Perfect Money', 'Bank Transfer', 'Western Union', 'Moneygram', 'Credit Card', 'Payeer', 'VeChain', 'Verus Coin', 'Tether (USDT) TRC-20']
const textFieldClass = 'mt-2 h-11 w-full rounded-xl border border-[#dfe4e6] bg-white px-3 text-sm text-[#384147] outline-none transition placeholder:text-[#a0a7ac] focus:border-[#1caf35] focus:ring-4 focus:ring-[#1caf35]/[0.08]'
const textareaClass = 'mt-2 min-h-[90px] w-full resize-y rounded-xl border border-[#dfe4e6] bg-white px-3 py-2.5 text-sm text-[#384147] outline-none transition placeholder:text-[#a0a7ac] focus:border-[#1caf35] focus:ring-4 focus:ring-[#1caf35]/[0.08]'
const emptyInstruction = { title: '', instructions: '', address: '', network: '', accountName: '', bankName: '', accountNumber: '', swiftCode: '' }
const fieldMaxLengths = { address: 255, network: 80, accountName: 120, bankName: 120, accountNumber: 80, swiftCode: 40, paymentAccount: 120, recipientName: 120, recipientCountry: 100, paymentUrl: 500 }

const getMethodStatus = (method, instruction) => {
  if (!instruction) return 'Incomplete'
  const configured = method === 'Bank Transfer'
    ? instruction.accountName && instruction.bankName && instruction.accountNumber
    : ['Perfect Money', 'Payeer'].includes(method)
      ? instruction.paymentAccount
      : ['Western Union', 'Moneygram'].includes(method)
        ? instruction.recipientName && instruction.recipientCountry
        : method === 'Credit Card'
          ? instruction.paymentUrl
          : instruction.address && instruction.network
  return configured ? 'Ready' : 'Incomplete'
}

const DepositPaymentSettings = () => {
  const [method, setMethod] = useState(methods[0])
  const [instruction, setInstruction] = useState(emptyInstruction)
  const [notice, setNotice] = useState('')
  const queryClient = useQueryClient()
  const settingsQuery = useQuery({
    queryKey: ['adminDepositPaymentInstructions'],
    queryFn: getAdminDepositPaymentInstructions,
  })

  useEffect(() => {
    setInstruction({ ...emptyInstruction, ...(settingsQuery.data?.methods?.[method] || {}) })
  }, [method, settingsQuery.data?.methods])

  const saveMutation = useMutation({
    mutationFn: updateAdminDepositPaymentInstruction,
    onSuccess: async (result) => {
      queryClient.setQueryData(['adminDepositPaymentInstructions'], result)
      await queryClient.invalidateQueries({ queryKey: ['depositPaymentInstructions'] })
      setNotice(result.message || 'Payment details saved.')
    },
    onError: (error) => setNotice(error.response?.data?.message || 'Could not save these payment details.'),
  })

  const fields = method === 'Bank Transfer'
    ? [['accountName', 'Account name'], ['bankName', 'Bank name'], ['accountNumber', 'Account number'], ['swiftCode', 'SWIFT / BIC (optional)']]
    : ['Perfect Money', 'Payeer'].includes(method)
      ? [['paymentAccount', 'Payment account ID'], ['recipientName', 'Recipient name (optional)']]
      : ['Western Union', 'Moneygram'].includes(method)
        ? [['recipientName', 'Recipient full name'], ['recipientCountry', 'Recipient country']]
        : method === 'Credit Card'
          ? [['paymentUrl', 'Secure payment URL']]
          : [['network', 'Network'], ['address', 'Wallet address']]

  const updateField = (event) => {
    const { name, value, checked, type } = event.target
    setInstruction((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
    setNotice('')
  }

  const submit = (event) => {
    event.preventDefault()
    setNotice('')
    saveMutation.mutate({ method, instruction })
  }

  return <Panel className="mb-5 overflow-hidden">
    <div className="flex items-center gap-3 border-b border-[#edf0ef] px-5 py-5 sm:px-7">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#eaf7ec] text-[#1caf35]">{method === 'Bank Transfer' ? <Banknote className="h-5 w-5" /> : <Bitcoin className="h-5 w-5" />}</span>
      <div><h2 className="text-base font-semibold text-[#252d31]">Deposit payment details</h2><p className="mt-1 text-[13px] text-[#727b82]">Manage the bank or wallet details users see when funding their account.</p></div>
    </div>

    {settingsQuery.isLoading ? <Loading label="Loading payment details…" /> : settingsQuery.isError ? <div className="p-5 sm:p-7"><p className="rounded-xl border border-[#f0d8c2] bg-[#fff8f0] px-4 py-3 text-[13px] text-[#7e4b20]">{settingsQuery.error.response?.data?.message || 'Could not load payment settings.'}</p><button className="mt-3 text-sm font-semibold text-[#16852d]" onClick={() => settingsQuery.refetch()} type="button">Try again</button></div> : <form className="space-y-5 p-5 sm:p-7" onSubmit={submit}>
      <div>
        <p className="mb-2 block text-[13px] font-medium text-[#505a60]">Payment methods <span className="font-normal text-[#858e94]">Select one to edit its own details.</span></p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{methods.map((item) => {
          const itemInstruction = settingsQuery.data?.methods?.[item]
          const status = getMethodStatus(item, itemInstruction)
          return <button aria-pressed={method === item} className={`flex min-h-[68px] items-center justify-between gap-3 rounded-xl border px-3.5 py-3 text-left transition ${method === item ? 'border-[#1caf35] bg-[#f1faf3] ring-2 ring-[#1caf35]/10' : 'border-[#e7ebe9] bg-white hover:border-[#b8d9bf] hover:bg-[#fafcfa]'}`} key={item} onClick={() => { setMethod(item); setNotice('') }} type="button"><span className="min-w-0"><span className="block truncate text-sm font-semibold text-[#313a40]">{item}</span><span className={`mt-1 block text-[11px] font-medium ${status === 'Ready' ? 'text-[#16852d]' : 'text-[#858e94]'}`}>{status}</span></span><span aria-hidden="true" className={`h-2.5 w-2.5 shrink-0 rounded-full ${status === 'Ready' ? 'bg-[#1caf35]' : 'bg-[#b9c0bc]'}`} /></button>
        })}</div>
      </div>
      <div className="rounded-xl border border-[#edf0ef] bg-[#fafbfa] px-4 py-3"><p className="text-[11px] font-semibold uppercase tracking-wide text-[#858e94]">Editing payment method</p><p className="mt-1 text-base font-semibold text-[#273036]">{method}</p></div>
      <label className="block text-[13px] font-medium text-[#505a60]">Instruction heading<input className={textFieldClass} maxLength={100} name="title" onChange={updateField} required value={instruction.title || ''} /></label>
      <div className="grid gap-4 sm:grid-cols-2">{fields.map(([name, label]) => <label className="block text-[13px] font-medium text-[#505a60]" key={name}>{label}<input className={textFieldClass} maxLength={fieldMaxLengths[name]} name={name} onChange={updateField} required={!label.includes('(optional)')} type={name === 'paymentUrl' ? 'url' : 'text'} value={instruction[name] || ''} /></label>)}</div>
      <label className="block text-[13px] font-medium text-[#505a60]">Instructions for the user<textarea className={textareaClass} maxLength={500} name="instructions" onChange={updateField} required value={instruction.instructions || ''} /></label>
      {notice && <p aria-live="polite" className={`rounded-xl border px-4 py-3 text-[13px] ${notice.includes('saved') ? 'border-[#ccebd2] bg-[#f1faf3] text-[#16852d]' : 'border-[#f0d8c2] bg-[#fff8f0] text-[#7e4b20]'}`}>{notice}</p>}
      <button className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#1caf35] px-5 text-sm font-semibold text-white transition hover:bg-[#15952b] disabled:cursor-wait disabled:opacity-60" disabled={saveMutation.isPending} type="submit">{saveMutation.isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{saveMutation.isPending ? 'Saving…' : 'Save payment details'}</button>
      <p className="flex items-start gap-2 text-xs leading-5 text-[#858e94]"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />Only use receiving details intended for customers. These details are shown to signed-in users on the deposit page.</p>
    </form>}
  </Panel>
}

export default DepositPaymentSettings
