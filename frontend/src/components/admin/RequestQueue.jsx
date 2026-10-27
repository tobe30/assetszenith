import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, ChevronLeft, ChevronRight, X } from 'lucide-react'
import Loading from '../Loading'
import {
  getPendingDeposits,
  getPendingWithdrawals,
  reviewAdminDeposit,
  reviewAdminWithdrawal,
} from '../../lib/api'
import { ActionNotice, Heading, Panel, Status } from './AdminUI'

const formatCurrency = (amount, currency = 'USD') => {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 2 }).format(amount || 0)
  } catch {
    return `${currency} ${(amount || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })}`
  }
}

const formatDate = (value) => {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString()
}

const RequestQueue = ({ kind }) => {
  const deposit = kind === 'deposit'
  const noun = deposit ? 'deposit' : 'withdrawal'
  const title = deposit ? 'Deposit approvals' : 'Withdrawal approvals'
  const [notice, setNotice] = useState('')
  const [page, setPage] = useState(1)
  const queryClient = useQueryClient()

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['pendingRequests', kind, page],
    queryFn: () => deposit
      ? getPendingDeposits({ page, limit: 20 })
      : getPendingWithdrawals({ page, limit: 20 }),
    placeholderData: (previousData) => previousData,
  })

  const requests = useMemo(() => (data?.transactions || []).map((transaction) => ({
    id: transaction._id,
    user: transaction.user
      ? `${transaction.user.firstName || ''} ${transaction.user.lastName || ''}`.trim() || transaction.user.email
      : 'User unavailable',
    method: transaction.paymentMethod,
    paymentStatus: transaction.paymentStatus === 'sent' ? 'Payment reported sent' : 'Awaiting payment',
    paymentDate: formatDate(transaction.paymentDate),
    reference: transaction.reference || transaction.description || '—',
    destination: transaction.paymentMethod === 'Bank transfer'
      ? [
          ['Beneficiary', transaction.beneficiaryAccountName],
          ['Account number', transaction.beneficiaryAccountNumber],
          ['Beneficiary email', transaction.beneficiaryEmail],
          ['Phone', transaction.beneficiaryPhoneNumber],
          ['Bank', transaction.beneficiaryBankName],
          ['SWIFT', transaction.bankSwiftCode],
          ['IBAN', transaction.bankIBAN],
          ['Routing', transaction.routingNumber],
          ['Bank address', transaction.bankAddress],
          ['State / province', transaction.bankStateProvince],
          ['City', transaction.bankCity],
          ['Post / zip', transaction.bankPostZipCode],
          ['Country', transaction.bankCountry],
        ].filter(([, value]) => value).map(([label, value]) => `${label}: ${value}`).join('\n')
      : [transaction.payoutDestination, transaction.payoutEmail].filter(Boolean).join('\n') || '—',
    date: formatDate(transaction.createdAt),
    amount: transaction.amount,
    currency: transaction.currency || 'USD',
    status: transaction.status[0].toUpperCase() + transaction.status.slice(1),
  })), [data?.transactions])

  const pagination = data?.pagination || { page: 1, pages: 1, total: 0 }

  const { mutate: reviewRequest, isPending: isReviewing, variables: reviewingVariables, error: reviewError } = useMutation({
    mutationFn: (variables) => deposit ? reviewAdminDeposit(variables) : reviewAdminWithdrawal(variables),
    onSuccess: async (result) => {
      setNotice(result.message || 'Request reviewed successfully.')
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['pendingRequests', kind] }),
        queryClient.invalidateQueries({ queryKey: ['adminUsers'] }),
        queryClient.invalidateQueries({ queryKey: ['adminTransactions'] }),
      ])
    },
  })

  const review = (transactionId, decision) => {
    setNotice('')
    reviewRequest({ transactionId, decision, reviewNote: '' })
  }

  const pendingCount = pagination.total
  const errorMessage = error?.response?.data?.message || `Unable to load pending ${noun}s.`
  const reviewErrorMessage = reviewError?.response?.data?.message || reviewError?.message || `Unable to review this ${noun}.`

  return <div>
    <Heading eyebrow="Transaction review" title={title} description={`Check ${noun} details before approving or rejecting a request.`} action={<span className="rounded-xl border border-[#e7ebe9] bg-white px-3.5 py-2.5 text-[13px] font-medium text-[#687179]">{pendingCount} pending</span>} />
    {notice && <ActionNotice notice={notice} onClose={() => setNotice('')} />}
    {reviewError && <p aria-live="polite" className="mb-5 rounded-xl border border-[#f0d8c2] bg-[#fff8f0] px-4 py-3 text-sm text-[#7e4b20]">{reviewErrorMessage}</p>}

    <Panel className="overflow-hidden">
      <div className="border-b border-[#edf0ef] px-5 py-4 sm:px-6"><h2 className="text-base font-semibold text-[#252d31]">{deposit ? 'Incoming payments' : 'Payout requests'}</h2><p className="mt-1 text-[13px] text-[#727b82]">{deposit ? 'Confirm payment references and selected payment methods.' : 'Review the requested amount and payout destination.'}</p></div>

      {isLoading ? <Loading label={`Loading pending ${noun}s...`} /> : isError ? (
        <div className="px-5 py-12 text-center">
          <p className="text-sm font-medium text-[#b4232d]">{errorMessage}</p>
          <button className="mt-3 rounded-lg border border-[#e5e9e7] px-3 py-2 text-sm font-semibold text-[#465058] hover:bg-[#f7f8f7]" onClick={() => refetch()} type="button">Try again</button>
        </div>
      ) : (
        <>
          {isFetching && <p aria-live="polite" className="border-b border-[#edf0ef] px-5 py-2 text-xs text-[#858e94]">Updating requests…</p>}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[940px] text-left text-[13px]">
              <thead className="bg-[#fafbfa] text-xs font-medium uppercase tracking-wide text-[#858e94]"><tr><th className="px-5 py-3">Request</th><th className="px-4 py-3">User</th><th className="px-4 py-3">Method</th><th className="px-4 py-3">{deposit ? 'Reference' : 'Destination'}</th><th className="px-4 py-3">Submitted</th><th className="px-4 py-3">Amount</th><th className="px-5 py-3">Review</th></tr></thead>
              <tbody className="divide-y divide-[#edf0ef]">
                {requests.map((request) => {
                  const isThisRequestReviewing = isReviewing && reviewingVariables?.transactionId === request.id
                  return <tr key={request.id}>
                    <td className="px-5 py-4 font-semibold text-[#313a40]">{request.id}</td>
                    <td className="px-4 py-4 text-[#465058]">{request.user}</td>
                    <td className="px-4 py-4 text-[#586168]">{request.method}{deposit && <span className={`mt-1 block text-[11px] font-medium ${request.paymentStatus === 'Payment reported sent' ? 'text-[#16852d]' : 'text-[#a86b0a]'}`}>{request.paymentStatus}{request.paymentDate !== '—' ? ` · ${request.paymentDate}` : ''}</span>}</td>
                    <td className="max-w-[320px] whitespace-pre-line break-words px-4 py-4 font-mono text-xs leading-5 text-[#687179]">{deposit ? request.reference : request.destination}</td>
                    <td className="px-4 py-4 text-[#687179]">{request.date}</td>
                    <td className="px-4 py-4 font-semibold text-[#313a40]">{formatCurrency(request.amount, request.currency)}</td>
                    <td className="px-5 py-4"><div className="flex gap-2">
                      <button aria-label={`Approve ${noun} ${request.id}`} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#1caf35] px-3 text-xs font-semibold text-white hover:bg-[#15952b] disabled:cursor-wait disabled:opacity-60" disabled={isReviewing} onClick={() => review(request.id, 'approve')} type="button"><Check className="h-3.5 w-3.5" />{isThisRequestReviewing && reviewingVariables?.decision === 'approve' ? 'Approving…' : 'Approve'}</button>
                      <button aria-label={`Reject ${noun} ${request.id}`} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#f0d6d8] px-3 text-xs font-semibold text-[#b4232d] hover:bg-[#fff6f6] disabled:cursor-wait disabled:opacity-60" disabled={isReviewing} onClick={() => review(request.id, 'reject')} type="button"><X className="h-3.5 w-3.5" />{isThisRequestReviewing && reviewingVariables?.decision === 'reject' ? 'Rejecting…' : 'Reject'}</button>
                    </div></td>
                  </tr>
                })}
                {requests.length === 0 && <tr><td className="px-5 py-12 text-center text-sm text-[#727b82]" colSpan="7">There are no pending {noun} requests.</td></tr>}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-[#edf0ef] px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-[#858e94]">Page {pagination.page} of {Math.max(pagination.pages, 1)} · {pagination.total} pending {noun}s</p>
            <div className="flex justify-end gap-2">
              <button aria-label="Previous page" className="inline-flex h-9 items-center gap-1 rounded-lg border border-[#e5e9e7] px-3 text-xs font-semibold text-[#465058] hover:bg-[#f7f8f7] disabled:cursor-not-allowed disabled:opacity-50" disabled={page <= 1 || isFetching || isReviewing} onClick={() => setPage((current) => current - 1)} type="button"><ChevronLeft className="h-4 w-4" />Previous</button>
              <button aria-label="Next page" className="inline-flex h-9 items-center gap-1 rounded-lg border border-[#e5e9e7] px-3 text-xs font-semibold text-[#465058] hover:bg-[#f7f8f7] disabled:cursor-not-allowed disabled:opacity-50" disabled={page >= pagination.pages || isFetching || isReviewing} onClick={() => setPage((current) => current + 1)} type="button">Next<ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="border-t border-[#edf0ef] px-5 py-3 text-xs leading-5 text-[#858e94]">{deposit ? 'Approving credits the user’s wallet. Rejecting records the decision without crediting funds.' : 'Withdrawal funds are reserved when requested. Approval records the withdrawal; rejection returns reserved funds to the user’s wallet.'}</div>
        </>
      )}
    </Panel>
  </div>
}

export default RequestQueue
