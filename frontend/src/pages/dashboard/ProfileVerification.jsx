import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { BadgeCheck, CalendarDays, FileCheck2, LoaderCircle, ShieldCheck, UploadCloud } from 'lucide-react'
import Loading from '../../components/Loading'
import { getMyVerification, submitIdentityVerification } from '../../lib/api'
import { Notice, PageHeading, Panel } from '../../components/dashboard/DashboardPageUI'

const inputClass = 'mt-2 h-11 w-full rounded-xl border border-[#dfe4e6] bg-white px-3 text-sm text-[#384147] outline-none transition focus:border-[#1caf35] focus:ring-4 focus:ring-[#1caf35]/[0.08]'

const statusStyles = {
  not_started: 'bg-[#f3f5f4] text-[#687179]',
  pending: 'bg-[#fff5e8] text-[#9a6518]',
  verified: 'bg-[#eaf7ec] text-[#16852d]',
  rejected: 'bg-[#fff0f0] text-[#b4232d]',
}

const statusLabels = {
  not_started: 'Not submitted',
  pending: 'Under review',
  verified: 'Verified',
  rejected: 'Needs resubmission',
}

const ProfileVerification = () => {
  const [notice, setNotice] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const queryClient = useQueryClient()
  const verificationQuery = useQuery({ queryKey: ['userVerification'], queryFn: getMyVerification })
  const verification = verificationQuery.data
  const isLocked = verification?.verificationStatus === 'pending' || verification?.verificationStatus === 'verified'

  const submitMutation = useMutation({
    mutationFn: submitIdentityVerification,
    onSuccess: async (result) => {
      setNotice({ tone: 'success', text: result.message || 'Identity documents submitted for review.' })
      setSelectedFile(null)
      await queryClient.invalidateQueries({ queryKey: ['userVerification'] })
    },
    onError: (error) => setNotice({ tone: 'error', text: error?.response?.data?.message || 'Unable to submit your documents. Please try again.' }),
  })

  const submit = (event) => {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData()
    data.append('idType', form.elements.idType.value)
    data.append('idNumber', form.elements.idNumber.value.trim())
    data.append('issueDate', form.elements.issueDate.value)
    data.append('expiryDate', form.elements.expiryDate.value)
    if (selectedFile) data.append('document', selectedFile)
    setNotice(null)
    submitMutation.mutate(data)
  }

  if (verificationQuery.isPending) return <Loading label="Loading verification status..." />

  const status = verification?.verificationStatus || 'not_started'

  return (
    <div className="mx-auto max-w-[1100px]">
      <PageHeading eyebrow="My account" title="Profile verification" description="Submit a current government-issued identity document to verify your account." />
      {notice && <div className="mb-5"><Notice tone={notice.tone}>{notice.text}</Notice></div>}
      {verificationQuery.isError && <div className="mb-5"><Notice tone="error">{verificationQuery.error?.response?.data?.message || 'Could not load your verification status.'}</Notice></div>}

      <Panel className="overflow-hidden p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#edf0ef] pb-5">
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f1f7f2] text-[#1caf35]"><BadgeCheck className="h-5 w-5" /></span>
            <div><h2 className="text-base font-semibold text-[#252d31]">Identity verification</h2><p className="mt-1 text-[13px] text-[#727b82]">Government-issued photo ID</p></div>
          </div>
          <span className={`rounded-full px-3 py-1.5 text-[13px] font-semibold ${statusStyles[status] || statusStyles.not_started}`}>{statusLabels[status] || 'Not submitted'}</span>
        </div>

        {verification?.verificationStatus === 'pending' && <div className="py-5"><Notice>Your identity documents were submitted{verification.verificationSubmittedAt ? ` on ${new Date(verification.verificationSubmittedAt).toLocaleDateString()}` : ''}. You can’t change them while they are under review.</Notice></div>}
        {verification?.verificationStatus === 'verified' && <div className="py-5"><Notice tone="success"><span className="inline-flex items-center gap-2"><ShieldCheck aria-hidden="true" className="h-4 w-4 shrink-0" />Your identity has been verified.</span></Notice></div>}
        {verification?.verificationStatus === 'rejected' && <div className="py-5"><Notice tone="error">{verification.verificationReviewNote || 'Your previous submission was not approved.'} You can submit a current document again below.</Notice></div>}

        {!isLocked && <form className="pt-6" onSubmit={submit}>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block text-[13px] font-medium text-[#748087]">ID type<select className={inputClass} defaultValue="" name="idType" required><option disabled value="">Select ID type</option><option>Passport</option><option>National identity card</option><option>Driver's licence</option></select></label>
            <label className="block text-[13px] font-medium text-[#748087]">ID number<input autoComplete="off" className={inputClass} maxLength={100} name="idNumber" placeholder="Enter ID number" required /></label>
            <label className="block text-[13px] font-medium text-[#748087]">Issue date <span className="font-normal">(optional)</span><span className="relative mt-2 block"><CalendarDays aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7c858b]" /><input className={`${inputClass} pl-10`} name="issueDate" type="date" /></span></label>
            <label className="block text-[13px] font-medium text-[#748087]">Expiry date <span className="font-normal">(optional)</span><span className="relative mt-2 block"><CalendarDays aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7c858b]" /><input className={`${inputClass} pl-10`} name="expiryDate" type="date" /></span></label>
          </div>

          <label className="mt-5 block cursor-pointer rounded-xl border border-dashed border-[#dfe5e2] bg-[#fafbfa] p-5 transition hover:border-[#1caf35] hover:bg-[#f7fbf7]">
            <input accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp" className="sr-only" name="document" onChange={(event) => setSelectedFile(event.target.files?.[0] || null)} required type="file" />
            <span className="flex flex-col items-center text-center"><UploadCloud aria-hidden="true" className="h-6 w-6 text-[#1caf35]" /><span className="mt-2 text-sm font-semibold text-[#384147]">{selectedFile ? selectedFile.name : 'Upload your identity document'}</span><span className="mt-1 text-[13px] leading-5 text-[#727b82]">PDF, JPEG, PNG or WEBP · Maximum 10 MB</span></span>
          </label>

          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="inline-flex max-w-2xl items-start gap-2 text-[13px] leading-5 text-[#727b82]"><ShieldCheck aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-[#1caf35]" />Your ID file is stored as a private Cloudinary asset and is shared with admins only for review.</p>
            <button className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#1caf35] px-5 text-sm font-semibold text-white transition hover:bg-[#15952b] disabled:cursor-wait disabled:opacity-60" disabled={submitMutation.isPending} type="submit">{submitMutation.isPending ? <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" /> : <FileCheck2 aria-hidden="true" className="h-4 w-4" />}{submitMutation.isPending ? 'Submitting…' : 'Submit for review'}</button>
          </div>
        </form>}
      </Panel>
    </div>
  )
}

export default ProfileVerification
