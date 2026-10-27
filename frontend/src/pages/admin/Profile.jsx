import { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Camera, Check, ShieldCheck, UserRound } from 'lucide-react'
import Loading from '../../components/Loading'
import { getProfile, updateProfile } from '../../lib/api'
import { Heading, Panel } from '../../components/admin/AdminUI'

const inputClass = 'mt-2 h-11 w-full rounded-xl border border-[#e5e9e7] bg-white px-3.5 text-sm text-[#20262a] outline-none transition placeholder:text-[#a0a7ac] focus:border-[#1caf35] focus:ring-4 focus:ring-[#1caf35]/[0.08]'
const labelClass = 'block text-sm font-medium text-[#505a60]'

const AdminProfile = () => {
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
    state: '',
    profilePhotoUrl: '',
  })
  const [notice, setNotice] = useState(null)
  const photoInput = useRef(null)
  const queryClient = useQueryClient()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['adminProfile'],
    queryFn: getProfile,
  })

  useEffect(() => {
    if (data?.user) setProfile((current) => ({ ...current, ...data.user }))
  }, [data])

  const { mutate: saveProfile, isPending: isSaving } = useMutation({
    mutationFn: updateProfile,
    onSuccess: (result) => {
      setProfile((current) => ({ ...current, ...result.user }))
      queryClient.setQueryData(['adminProfile'], result)
      queryClient.setQueryData(['authUser'], result.user)
      setNotice({ type: 'success', message: 'Your admin profile has been updated.' })
    },
    onError: (error) => {
      setNotice({
        type: 'error',
        message: error?.response?.data?.message || 'Unable to save your profile right now.',
      })
    },
  })

  const updateField = (event) => {
    const { name, value } = event.target
    setProfile((current) => ({ ...current, [name]: value }))
    setNotice(null)
  }

  const submit = (event) => {
    event.preventDefault()
    saveProfile({
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      phone: profile.phone,
      country: profile.country,
      state: profile.state,
    })
  }

  const uploadPhoto = (event) => {
    const input = event.currentTarget
    const image = input.files?.[0]
    if (!image) return

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(image.type)) {
      setNotice({ type: 'error', message: 'Choose a JPG, PNG, or WebP image.' })
      input.value = ''
      return
    }

    if (image.size > 5 * 1024 * 1024) {
      setNotice({ type: 'error', message: 'Your image must be 5 MB or smaller.' })
      input.value = ''
      return
    }

    const formData = new FormData()
    formData.append('profilePhoto', image)
    saveProfile(formData)
    input.value = ''
  }

  return (
    <div>
      <Heading eyebrow="Admin account" title="Admin profile" description="Manage the personal and contact details for your platform management account." />

      {isLoading && <Panel><Loading label="Loading your profile..." /></Panel>}
      {isError && <p aria-live="polite" className="mb-5 rounded-xl border border-[#f0d8c2] bg-[#fff8f0] px-4 py-3 text-sm text-[#7e4b20]">Unable to load your profile. Refresh the page and try again.</p>}
      {notice && <p aria-live="polite" className={`mb-5 rounded-xl border px-4 py-3 text-sm ${notice.type === 'success' ? 'border-[#ccebd2] bg-[#f1faf3] text-[#16852d]' : 'border-[#f0d8c2] bg-[#fff8f0] text-[#7e4b20]'}`}>{notice.message}</p>}

      {!isLoading && !isError && <form className="space-y-5" onSubmit={submit}>
        <Panel className="overflow-hidden">
          <div className="flex items-center gap-3 border-b border-[#edf0ef] px-5 py-5 sm:px-7">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff0f0] text-[#ed161f]"><UserRound aria-hidden="true" className="h-5 w-5" /></span>
            <div><h2 className="text-base font-semibold text-[#252d31]">Personal information</h2><p className="mt-1 text-[13px] text-[#727b82]">Update your contact details and profile photo.</p></div>
          </div>

          <div className="grid gap-6 p-5 sm:p-7 md:grid-cols-[minmax(0,1fr)_minmax(0,2.2fr)]">
            <div className="flex items-start gap-4 md:flex-col">
              <div className="flex h-[68px] w-[68px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#fff0f0] text-[#d80f18]">
                {profile.profilePhotoUrl ? <img alt="Admin profile" className="h-full w-full object-cover" src={profile.profilePhotoUrl} /> : <UserRound aria-hidden="true" className="h-7 w-7" strokeWidth={1.6} />}
              </div>
              <div>
                <p className="text-sm font-semibold text-[#384147]">Profile photo</p>
                <p className="mt-1 max-w-[210px] text-[13px] leading-5 text-[#858e94]">JPG, PNG, or WebP. Up to 5 MB.</p>
                <input accept="image/jpeg,image/png,image/webp" aria-label="Choose a profile photo" className="sr-only" onChange={uploadPhoto} ref={photoInput} type="file" />
                <button className="mt-3 inline-flex h-10 items-center gap-2 rounded-lg border border-[#e5e9e7] px-3.5 text-[13px] font-semibold text-[#465058] transition hover:bg-[#f7f8f7] disabled:cursor-wait disabled:opacity-60" disabled={isSaving} onClick={() => photoInput.current?.click()} type="button">
                  <Camera aria-hidden="true" className="h-4 w-4" />{isSaving ? 'Saving…' : 'Change photo'}
                </button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className={labelClass}>First name<input autoComplete="given-name" className={inputClass} maxLength={80} name="firstName" onChange={updateField} required value={profile.firstName} /></label>
              <label className={labelClass}>Last name<input autoComplete="family-name" className={inputClass} maxLength={80} name="lastName" onChange={updateField} required value={profile.lastName} /></label>
              <label className={labelClass}>Email address<input autoComplete="email" className={inputClass} maxLength={254} name="email" onChange={updateField} required type="email" value={profile.email} /></label>
              <label className={labelClass}>Phone number<input autoComplete="tel" className={inputClass} maxLength={32} name="phone" onChange={updateField} type="tel" value={profile.phone} /></label>
              <label className={labelClass}>Country or region<input autoComplete="country-name" className={inputClass} maxLength={100} name="country" onChange={updateField} value={profile.country} /></label>
              <label className={labelClass}>State / Province<input autoComplete="address-level1" className={inputClass} maxLength={100} name="state" onChange={updateField} value={profile.state} /></label>
              <div className="rounded-xl border border-[#edf0ef] bg-[#fafbfa] p-4 sm:col-span-2">
                <p className="text-[13px] font-medium text-[#858e94]">Account role</p>
                <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-[#313a40]"><ShieldCheck aria-hidden="true" className="h-4 w-4 text-[#1caf35]" />Administrator</p>
                <p className="mt-1 text-xs text-[#858e94]">Your role can only be changed by a superadmin.</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse justify-end gap-3 border-t border-[#edf0ef] px-5 py-4 sm:flex-row sm:items-center sm:px-7">
            {notice?.type === 'success' && <p aria-live="polite" className="mr-auto inline-flex items-center gap-2 text-[13px] font-medium text-[#16852d]"><Check aria-hidden="true" className="h-4 w-4" />Saved</p>}
            <button className="h-11 rounded-xl bg-[#1caf35] px-5 text-sm font-semibold text-white hover:bg-[#15952b] disabled:cursor-wait disabled:opacity-60" disabled={isSaving} type="submit">{isSaving ? 'Saving…' : 'Save profile'}</button>
          </div>
        </Panel>
      </form>}
    </div>
  )
}

export default AdminProfile
