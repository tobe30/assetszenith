import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { BadgeCheck, Check, ExternalLink, FileCheck2, LoaderCircle, X } from 'lucide-react'
import Loading from '../../components/Loading'
import { getPendingIdentityVerifications, reviewIdentityVerification } from '../../lib/api'
import { ActionNotice, Heading, Panel } from '../../components/admin/AdminUI'

const formatDate = (value) => {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString()
}

const IdentityVerificationApprovals = () => {
  const [notice, setNotice] = useState('')
  const [reviewNotes, setReviewNotes] = useState({})
  const queryClient = useQueryClient()
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['pendingIdentityVerifications'],
    queryFn: getPendingIdentityVerifications,
  })

  const reviewMutation = useMutation({
    mutationFn: reviewIdentityVerification,
    onSuccess: async (result, variables) => {
      setNotice(result.message || 'Identity verification reviewed.')
      setReviewNotes((current) => {
        const next = { ...current }
        delete next[variables.userId]
        return next
      })
      await queryClient.invalidateQueries({ queryKey: ['pendingIdentityVerifications'] })
    },
  })

  const verifications = data?.verifications || []
  const submittingUser = reviewMutation.variables?.userId
  const errorMessage = error?.response?.data?.message || 'Unable to load pending verification requests.'
  const reviewErrorMessage = reviewMutation.error?.response?.data?.message || reviewMutation.error?.message || ''

  return <div className="w-full min-w-0">
    <Heading eyebrow="Identity review" title="Identity verification" description="Review private identity documents and approve or reject account verification requests." action={<span className="rounded-xl border border-[#e7ebe9] bg-white px-3.5 py-2.5 text-[13px] font-medium text-[#687179]">{data?.total || 0} pending</span>} />
    {notice && <ActionNotice notice={notice} onClose={() => setNotice('')} />}
    {reviewErrorMessage && <p aria-live="polite" className="mb-5 rounded-xl border border-[#f0d8c2] bg-[#fff8f0] px-4 py-3 text-sm text-[#7e4b20]">{reviewErrorMessage}</p>}

    {isLoading ? <Panel><Loading label="Loading identity verification requests..." /></Panel> : isError ? <Panel className="px-5 py-12 text-center"><p className="text-sm font-medium text-[#b4232d]">{errorMessage}</p><button className="mt-3 rounded-lg border border-[#e5e9e7] px-3 py-2 text-sm font-semibold text-[#465058] hover:bg-[#f7f8f7]" onClick={() => refetch()} type="button">Try again</button></Panel> : (
      <div className="space-y-4">
        {isFetching && <p aria-live="polite" className="text-xs text-[#858e94]">Refreshing verification requests…</p>}
        {verifications.map((item) => {
          const isReviewing = reviewMutation.isPending && submittingUser === item._id
          const fullName = `${item.firstName || ''} ${item.lastName || ''}`.trim() || 'Unnamed user'
          return <Panel className="w-full min-w-0 overflow-hidden p-4 sm:p-6" key={item._id}>
            <div className="flex min-w-0 flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-start gap-3">
                  <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eef3ff] text-[#4268ca]"><BadgeCheck className="h-5 w-5" /></span>
                  <div className="min-w-0"><h2 className="truncate text-base font-semibold text-[#252d31]">{fullName}</h2><p className="mt-1 break-all text-[13px] text-[#727b82]">{item.email}</p><p className="mt-1 text-xs text-[#92999e]">Submitted {formatDate(item.verificationSubmittedAt)}</p></div>
                </div>
                <div className="mt-5 grid min-w-0 grid-cols-1 gap-3 rounded-xl border border-[#edf0ef] bg-[#fafbfa] p-3 text-[13px] sm:grid-cols-2 sm:p-4">
                  <div className="min-w-0"><p className="text-[11px] font-semibold uppercase tracking-wide text-[#92999e]">Document type</p><p className="mt-1 break-words font-medium text-[#384147]">{item.verificationIdType || '—'}</p></div>
                  <div className="min-w-0"><p className="text-[11px] font-semibold uppercase tracking-wide text-[#92999e]">ID number</p><p className="mt-1 break-words font-medium text-[#384147]">{item.verificationIdNumber || '—'}</p></div>
                  <div className="min-w-0"><p className="text-[11px] font-semibold uppercase tracking-wide text-[#92999e]">Issue date</p><p className="mt-1 break-words font-medium text-[#384147]">{formatDate(item.verificationIssueDate)}</p></div>
                  <div className="min-w-0"><p className="text-[11px] font-semibold uppercase tracking-wide text-[#92999e]">Expiry date</p><p className="mt-1 break-words font-medium text-[#384147]">{formatDate(item.verificationExpiryDate)}</p></div>
                </div>
                {item.documentUrl ? <a className="mt-4 inline-flex max-w-full items-center gap-2 break-words text-[13px] font-semibold text-[#16852d] hover:text-[#116d25]" href={item.documentUrl} rel="noreferrer" target="_blank"><FileCheck2 aria-hidden="true" className="h-4 w-4 shrink-0" /><span>Open private ID document</span><ExternalLink aria-hidden="true" className="h-3.5 w-3.5 shrink-0" /></a> : <p className="mt-4 break-words text-[13px] text-[#b4232d]">No document is attached to this request.</p>}
              </div>
              <div className="flex w-full min-w-0 flex-col gap-3 xl:w-[280px] xl:shrink-0">
                <label className="block min-w-0 text-[12px] font-medium text-[#687179]">Review note <span className="font-normal text-[#92999e]">(optional)</span><textarea className="mt-1.5 block min-h-[82px] w-full max-w-full resize-y rounded-xl border border-[#dfe4e6] px-3 py-2 text-[13px] outline-none focus:border-[#1caf35]" disabled={isReviewing} maxLength={500} onChange={(event) => setReviewNotes((current) => ({ ...current, [item._id]: event.target.value }))} placeholder="Add a note for the user" value={reviewNotes[item._id] || ''} /></label>
                <div className="flex gap-2">
                  <button className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#1caf35] px-3 text-[13px] font-semibold text-white hover:bg-[#15952b] disabled:cursor-wait disabled:opacity-60" disabled={reviewMutation.isPending || !item.documentUrl} onClick={() => reviewMutation.mutate({ userId: item._id, decision: 'approve', reviewNote: reviewNotes[item._id] || '' })} type="button">{isReviewing && reviewMutation.variables?.decision === 'approve' ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}{isReviewing && reviewMutation.variables?.decision === 'approve' ? 'Approving…' : 'Approve'}</button>
                  <button className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#f0d6d8] px-3 text-[13px] font-semibold text-[#b4232d] hover:bg-[#fff6f6] disabled:cursor-wait disabled:opacity-60" disabled={reviewMutation.isPending} onClick={() => reviewMutation.mutate({ userId: item._id, decision: 'reject', reviewNote: reviewNotes[item._id] || '' })} type="button"><X className="h-4 w-4" />Reject</button>
                </div>
              </div>
            </div>
          </Panel>
        })}
        {verifications.length === 0 && <Panel><div className="flex min-h-[240px] flex-col items-center justify-center px-6 text-center"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eaf7ec] text-[#1caf35]"><BadgeCheck className="h-6 w-6" /></span><h2 className="mt-4 text-base font-semibold text-[#252d31]">No pending verifications</h2><p className="mt-2 max-w-md text-[13px] leading-5 text-[#727b82]">New identity submissions will appear here for review.</p></div></Panel>}
      </div>
    )}
  </div>
}

export default IdentityVerificationApprovals
