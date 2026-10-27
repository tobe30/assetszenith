import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Check, Eye, EyeOff, LockKeyhole } from 'lucide-react'
import { changeUserPassword } from '../../lib/api'

const fields = [
  { name: 'currentPassword', label: 'Current password', autoComplete: 'current-password' },
  { name: 'newPassword', label: 'New password', autoComplete: 'new-password' },
  { name: 'confirmPassword', label: 'Confirm new password', autoComplete: 'new-password' },
]

const ChangePassword = () => {
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [visible, setVisible] = useState({})
  const [message, setMessage] = useState('')
  const [saved, setSaved] = useState(false)
  const { mutate: updatePassword, isPending } = useMutation({
    mutationFn: changeUserPassword,
    onSuccess: (result) => {
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setSaved(true)
      setMessage(result.message || 'Password changed successfully.')
    },
    onError: (error) => {
      setSaved(false)
      setMessage(error?.response?.data?.message || 'Unable to update your password. Please try again.')
    },
  })

  const updateField = (event) => {
    const { name, value } = event.target
    setPasswords((current) => ({ ...current, [name]: value }))
    setMessage('')
    setSaved(false)
  }

  const submit = (event) => {
    event.preventDefault()
    if (passwords.newPassword !== passwords.confirmPassword) {
      setMessage('The new passwords do not match.')
      return
    }
    if (passwords.newPassword === passwords.currentPassword) {
      setMessage('Choose a new password that differs from your current password.')
      return
    }
    updatePassword(passwords)
  }

  return (
    <div className="mx-auto max-w-[900px]">
      <div className="mb-7">
        <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#1caf35]">My account</p>
        <h1 className="mt-2 text-[26px] font-semibold tracking-[-0.04em] text-[#171c1f] sm:text-[30px]">Change password</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#727b82]">Choose a strong password to help keep your Assets Zenith account secure.</p>
      </div>

      <form className="overflow-hidden rounded-2xl border border-[#e7ebe9] bg-white shadow-[0_2px_10px_rgba(24,35,30,0.025)]" onSubmit={submit}>
        <div className="border-b border-[#edf0ef] px-5 py-5 sm:px-7">
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaf7ec] text-[#1caf35]"><LockKeyhole className="h-5 w-5" /></span>
            <div>
              <h2 className="text-base font-semibold text-[#252d31]">Password details</h2>
              <p className="mt-1 text-[13px] leading-5 text-[#858e94]">Enter your current password, then choose a new one.</p>
            </div>
          </div>
        </div>

        <div className="space-y-5 px-5 py-6 sm:px-7">
          {fields.map(({ name, label, autoComplete }) => (
            <label className="block text-sm font-medium text-[#505a60]" htmlFor={name} key={name}>
              {label}
              <span className="relative mt-2 block">
                <input
                  autoComplete={autoComplete}
                  className="h-12 w-full rounded-xl border border-[#e5e9e7] bg-white px-4 pr-12 text-sm text-[#20262a] outline-none transition placeholder:text-[#a0a7ac] focus:border-[#1caf35] focus:ring-4 focus:ring-[#1caf35]/[0.08]"
                  id={name}
                  minLength={name === 'currentPassword' ? undefined : 8}
                  maxLength={128}
                  name={name}
                  onChange={updateField}
                  placeholder={name === 'currentPassword' ? 'Enter current password' : 'At least 8 characters'}
                  required
                  type={visible[name] ? 'text' : 'password'}
                  value={passwords[name]}
                />
                <button
                  aria-label={`${visible[name] ? 'Hide' : 'Show'} ${label.toLowerCase()}`}
                  className="absolute inset-y-0 right-3 my-auto flex h-9 w-9 items-center justify-center rounded-lg text-[#7b858b] transition hover:bg-[#f5f7f6] hover:text-[#20262a]"
                  onClick={() => setVisible((current) => ({ ...current, [name]: !current[name] }))}
                  type="button"
                >
                  {visible[name] ? <EyeOff aria-hidden="true" className="h-[18px] w-[18px]" /> : <Eye aria-hidden="true" className="h-[18px] w-[18px]" />}
                </button>
              </span>
            </label>
          ))}
          <p className="rounded-xl bg-[#f7f8f7] px-4 py-3 text-[13px] leading-5 text-[#687179]">Use at least 8 characters. A mix of letters, numbers, and symbols can make your password stronger.</p>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-[#edf0ef] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          {message ? <p aria-live="polite" className={`inline-flex items-center gap-2 text-[13px] leading-5 ${saved ? 'text-[#168d2a]' : 'text-[#b4232d]'}`}>{saved && <Check aria-hidden="true" className="h-4 w-4 shrink-0" />}{message}</p> : <span />}
          <button className="inline-flex h-11 items-center justify-center rounded-xl bg-[#1caf35] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#15952b] focus:outline-none focus:ring-4 focus:ring-[#1caf35]/20 disabled:cursor-wait disabled:opacity-60" disabled={isPending} type="submit">{isPending ? 'Updating…' : 'Update password'}</button>
        </div>
      </form>
    </div>
  )
}

export default ChangePassword
