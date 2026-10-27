import { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, ClipboardCopy, Camera, UserRound } from 'lucide-react'
import Loading from '../../components/Loading'
import { getProfile, updateProfile } from '../../lib/api'

const inputClass = 'mt-2 h-11 w-full rounded-xl border border-[#e5e9e7] bg-white px-3.5 text-sm text-[#20262a] outline-none transition placeholder:text-[#a0a7ac] focus:border-[#1caf35] focus:ring-4 focus:ring-[#1caf35]/[0.08]'
const labelClass = 'block text-sm font-medium text-[#505a60]'

const ProfileSettings = () => {
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
    state: '',
    profilePhotoUrl: '',
  })
  const [saved, setSaved] = useState(false)
  const [photoNotice, setPhotoNotice] = useState(null)
  const [saveNotice, setSaveNotice] = useState(null)
  const [copied, setCopied] = useState(false)
  const [copyError, setCopyError] = useState(false)
  const photoInput = useRef(null)
  const queryClient = useQueryClient()
  const referralLink = `${window.location.origin}/register?ref=AZ-INVESTOR`

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['userProfile'],
    queryFn: getProfile,
  })

  useEffect(() => {
    if (data?.user) setProfile((current) => ({ ...current, ...data.user }))
  }, [data])

  const applyProfileResult = (result) => {
    if (!result?.user) return
    setProfile((current) => ({ ...current, ...result.user }))
    queryClient.setQueryData(['userProfile'], result)
    queryClient.setQueryData(['authUser'], result.user)
  }

  const profileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (result) => {
      applyProfileResult(result)
      setSaved(true)
      setSaveNotice({ type: 'success', message: result.message || 'Profile details saved.' })
    },
    onError: (error) => {
      setSaved(false)
      setSaveNotice({ type: 'error', message: error?.response?.data?.message || 'Unable to save your profile. Please try again.' })
    },
  })

  const photoMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (result) => {
      applyProfileResult(result)
      setPhotoNotice({ type: 'success', message: 'Profile photo updated.' })
    },
    onError: (error) => {
      setPhotoNotice({ type: 'error', message: error?.response?.data?.message || 'Unable to upload your photo. Please try again.' })
    },
  })

  const updateField = (event) => {
    const { name, value } = event.target
    setProfile((current) => ({ ...current, [name]: value }))
    setSaved(false)
    setSaveNotice(null)
  }

  const submit = (event) => {
    event.preventDefault()
    setSaved(false)
    setSaveNotice(null)
    profileMutation.mutate({
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      phone: profile.phone,
      country: profile.country,
      state: profile.state,
    })
  }

  const uploadProfilePhoto = async (event) => {
    const input = event.currentTarget
    const image = input.files?.[0]
    if (!image) return

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(image.type)) {
      setPhotoNotice({ type: 'error', message: 'Choose a JPG, PNG, or WebP image.' })
      input.value = ''
      return
    }

    if (image.size > 5 * 1024 * 1024) {
      setPhotoNotice({ type: 'error', message: 'Your image must be 5 MB or smaller.' })
      input.value = ''
      return
    }

    setPhotoNotice(null)
    const formData = new FormData()
    formData.append('profilePhoto', image)
    photoMutation.mutate(formData)
    input.value = ''
  }

  const copyReferralLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopied(true)
      setCopyError(false)
    } catch {
      setCopied(false)
      setCopyError(true)
    }
  }

  if (isLoading) return <div className="mx-auto max-w-[1100px]"><Loading label="Loading your profile..." /></div>
  if (isError) return <div className="mx-auto max-w-[1100px]"><p className="mb-4 text-[13px] font-semibold uppercase tracking-[0.14em] text-[#1caf35]">My account</p><h1 className="mb-5 text-[26px] font-semibold text-[#171c1f] sm:text-[30px]">Profile settings</h1><div className="rounded-xl border border-[#f0d8c2] bg-[#fff8f0] p-4"><p className="text-sm text-[#7e4b20]">Unable to load your profile right now.</p><button className="mt-3 rounded-lg border border-[#e5e9e7] bg-white px-3 py-2 text-sm font-semibold text-[#465058]" onClick={() => refetch()} type="button">Try again</button></div></div>

  return (
    <div className="mx-auto max-w-[1100px]">
      <div className="mb-7">
        <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#1caf35]">My account</p>
        <h1 className="mt-2 text-[26px] font-semibold tracking-[-0.04em] text-[#171c1f] sm:text-[30px]">Profile settings</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#727b82]">Manage the personal details and preferences associated with your Assets Zenith account.</p>
      </div>

      <form className="space-y-5" onSubmit={submit}>
        <section aria-labelledby="profile-details-heading" className="overflow-hidden rounded-2xl border border-[#e7ebe9] bg-white shadow-[0_2px_10px_rgba(24,35,30,0.025)]">
          <div className="border-b border-[#edf0ef] px-5 py-5 sm:px-7">
            <h2 className="text-base font-semibold text-[#252d31]" id="profile-details-heading">Personal information</h2>
            <p className="mt-1 text-[13px] leading-5 text-[#858e94]">Update the name and contact details shown on your account.</p>
          </div>

          <div className="grid gap-6 px-5 py-6 sm:px-7 md:grid-cols-[minmax(0,1fr)_minmax(0,2.2fr)]">
            <div className="flex items-start gap-4 md:flex-col">
              <div className="flex h-[68px] w-[68px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#fff0f0] text-[#d80f18]">
                {profile.profilePhotoUrl
                  ? <img alt="" className="h-full w-full object-cover" src={profile.profilePhotoUrl} />
                  : <UserRound aria-hidden="true" className="h-7 w-7" strokeWidth={1.6} />}
              </div>
              <div>
                <p className="text-sm font-semibold text-[#384147]">Profile photo</p>
                <p className="mt-1 max-w-[210px] text-[13px] leading-5 text-[#858e94]">JPG, PNG, or WebP. Up to 5 MB.</p>
                <input accept="image/jpeg,image/png,image/webp" aria-label="Choose a profile photo" className="sr-only" onChange={uploadProfilePhoto} ref={photoInput} type="file" />
                <button className="mt-3 inline-flex h-10 items-center gap-2 rounded-lg border border-[#e5e9e7] px-3.5 text-[13px] font-semibold text-[#465058] transition hover:bg-[#f7f8f7] disabled:cursor-wait disabled:opacity-60" disabled={photoMutation.isPending} onClick={() => photoInput.current?.click()} type="button">
                  <Camera aria-hidden="true" className="h-4 w-4" />
                  {photoMutation.isPending ? 'Uploading…' : 'Change photo'}
                </button>
                {photoNotice && <p aria-live="polite" className={`mt-2 text-xs ${photoNotice.type === 'success' ? 'text-[#168d2a]' : 'text-[#b4232d]'}`}>{photoNotice.message}</p>}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className={labelClass}>
                First name
                <input autoComplete="given-name" className={inputClass} name="firstName" onChange={updateField} placeholder="First name" value={profile.firstName} />
              </label>
              <label className={labelClass}>
                Last name
                <input autoComplete="family-name" className={inputClass} name="lastName" onChange={updateField} placeholder="Last name" value={profile.lastName} />
              </label>
              <label className={labelClass}>
                Email address
                <input autoComplete="email" className={inputClass} name="email" onChange={updateField} placeholder="you@example.com" type="email" value={profile.email} />
              </label>
              <label className={labelClass}>
                Phone number <span className="font-normal text-[#92999e]">(optional)</span>
                <input autoComplete="tel" className={inputClass} name="phone" onChange={updateField} placeholder="Add a phone number" type="tel" value={profile.phone} />
              </label>
              <label className={labelClass}>
                Country or region
                <input autoComplete="country-name" className={inputClass} name="country" onChange={updateField} placeholder="Select or enter your country" value={profile.country} />
              </label>
              <label className={labelClass}>
                State / Province
                <input autoComplete="address-level1" className={inputClass} name="state" onChange={updateField} placeholder="State, province, or region" value={profile.state} />
              </label>
            </div>
          </div>
        </section>

        <section aria-labelledby="referral-heading" className="rounded-2xl border border-[#e7ebe9] bg-white shadow-[0_2px_10px_rgba(24,35,30,0.025)]">
          <div className="border-b border-[#edf0ef] px-5 py-5 sm:px-7">
            <h2 className="text-base font-semibold text-[#252d31]" id="referral-heading">Referral link</h2>
            <p className="mt-1 text-[13px] leading-5 text-[#858e94]">Share your link with someone who may be interested in Assets Zenith.</p>
          </div>
          <div className="px-5 py-6 sm:px-7">
            <div className="flex flex-col gap-3 sm:flex-row">
              <input aria-label="Your referral link" className={`${inputClass} mt-0 min-w-0 flex-1 bg-[#f7f8f7]`} readOnly value={referralLink} />
              <button className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-[#e5e9e7] bg-white px-4 text-sm font-semibold text-[#384147] transition hover:bg-[#f7f8f7] focus:outline-none focus:ring-4 focus:ring-[#1caf35]/10" onClick={copyReferralLink} type="button">
                {copied ? <Check aria-hidden="true" className="h-4 w-4 text-[#1caf35]" /> : <ClipboardCopy aria-hidden="true" className="h-4 w-4" />}
                {copied ? 'Copied' : 'Copy link'}
              </button>
            </div>
            {copyError && <p aria-live="polite" className="mt-3 text-[13px] text-[#b4232d]">Could not copy automatically. Select the link and copy it manually.</p>}
            <p className="mt-3 text-[13px] leading-5 text-[#727b82]">Referral tracking needs to be connected to your account system before referrals can be attributed.</p>
          </div>
        </section>

        <div className="flex flex-col-reverse items-stretch justify-end gap-3 sm:flex-row sm:items-center">
          {saveNotice && <p aria-live="polite" className={`mr-auto inline-flex items-center gap-2 text-[13px] font-medium ${saveNotice.type === 'success' ? 'text-[#168d2a]' : 'text-[#b4232d]'}`}>{saveNotice.type === 'success' && <Check aria-hidden="true" className="h-4 w-4" />}{saveNotice.message}</p>}
          {saved && !saveNotice && <p aria-live="polite" className="mr-auto inline-flex items-center gap-2 text-[13px] font-medium text-[#168d2a]"><Check aria-hidden="true" className="h-4 w-4" /> Profile saved.</p>}
          <button className="inline-flex h-11 items-center justify-center rounded-xl bg-[#1caf35] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#15952b] focus:outline-none focus:ring-4 focus:ring-[#1caf35]/20 disabled:cursor-wait disabled:opacity-60" disabled={profileMutation.isPending || photoMutation.isPending} type="submit">{profileMutation.isPending ? 'Saving…' : 'Save profile'}</button>
        </div>
      </form>
    </div>
  )
}

export default ProfileSettings
