import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowRight, Clock3, KeyRound, LockKeyhole, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AccountBalanceGrid, PageHeading } from '../../components/dashboard/DashboardPageUI'
import { disableTwoFactor, enableTwoFactor, startTwoFactorDisable, startTwoFactorSetup } from '../../lib/api'

const Security = () => {
  const [notice, setNotice] = useState('')
  const [code, setCode] = useState('')
  const [setupStarted, setSetupStarted] = useState(false)
  const [disableStarted, setDisableStarted] = useState(false)
  const [disableCodeSent, setDisableCodeSent] = useState(false)
  const [disablePassword, setDisablePassword] = useState('')
  const [disableCode, setDisableCode] = useState('')
  const queryClient = useQueryClient()
  const authUser = queryClient.getQueryData(['authUser'])

  const setupMutation = useMutation({
    mutationFn: startTwoFactorSetup,
    onSuccess: (data) => { setSetupStarted(true); setNotice(data.message) },
    onError: (error) => setNotice(error?.response?.data?.message || 'Unable to send a setup code right now.'),
  })

  const enableMutation = useMutation({
    mutationFn: enableTwoFactor,
    onSuccess: (data) => {
      queryClient.setQueryData(['authUser'], data.user)
      setSetupStarted(false)
      setCode('')
      setNotice(data.message)
    },
    onError: (error) => setNotice(error?.response?.data?.message || 'Unable to verify the code right now.'),
  })

  const disableRequestMutation = useMutation({
    mutationFn: startTwoFactorDisable,
    onSuccess: (data) => {
      setDisablePassword('')
      setDisableCodeSent(true)
      setNotice(data.message)
    },
    onError: (error) => setNotice(error?.response?.data?.message || 'Unable to send a confirmation code right now.'),
  })

  const disableMutation = useMutation({
    mutationFn: disableTwoFactor,
    onSuccess: (data) => {
      queryClient.setQueryData(['authUser'], data.user)
      setDisableStarted(false)
      setDisableCodeSent(false)
      setDisableCode('')
      setNotice(data.message)
    },
    onError: (error) => setNotice(error?.response?.data?.message || 'Unable to verify the code right now.'),
  })

  return (
    <div className="mx-auto max-w-[1000px]">
      <PageHeading eyebrow="My account" title="Security" description="Review the ways you protect your Assets Zenith account." />
      <AccountBalanceGrid />

      {notice && <p aria-live="polite" className="mb-5 rounded-xl border border-[#e7ebe9] bg-white px-4 py-3 text-[13px] leading-5 text-[#586168]">{notice}</p>}

      <div className="space-y-4">
        <section aria-labelledby="password-security-heading" className="rounded-2xl border border-[#e7ebe9] bg-white p-5 shadow-[0_2px_10px_rgba(24,35,30,0.025)] sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f1f7f2] text-[#1caf35]"><KeyRound className="h-5 w-5" strokeWidth={1.8} /></span>
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-semibold text-[#252d31]" id="password-security-heading">Password</h2>
              <p className="mt-1 text-[13px] leading-5 text-[#727b82]">Change your password regularly and keep it private.</p>
            </div>
            <Link className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-[#e5e9e7] px-4 text-[13px] font-semibold text-[#384147] transition hover:bg-[#f7f8f7]" to="/dashboard/change-password">Change password<ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
          </div>
        </section>

        <section aria-labelledby="two-factor-heading" className="rounded-2xl border border-[#e7ebe9] bg-white p-5 shadow-[0_2px_10px_rgba(24,35,30,0.025)] sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#fff4e5] text-[#c58219]"><ShieldCheck className="h-5 w-5" strokeWidth={1.8} /></span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-base font-semibold text-[#252d31]" id="two-factor-heading">Two-factor authentication</h2>
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${authUser?.twoFactorEnabled ? 'bg-[#eaf7ec] text-[#16852d]' : 'bg-[#f5f7f6] text-[#727b82]'}`}>{authUser?.twoFactorEnabled ? 'Enabled' : 'Not set up'}</span>
              </div>
              <p className="mt-1 text-[13px] leading-5 text-[#727b82]">{authUser?.twoFactorEnabled ? 'A one-time email code is required each time you sign in.' : 'Add an email verification code as another step when signing in.'}</p>
            </div>
            {!authUser?.twoFactorEnabled && !setupStarted && <button className="h-10 shrink-0 rounded-xl bg-[#1caf35] px-4 text-[13px] font-semibold text-white transition hover:bg-[#15952b] disabled:opacity-60" disabled={setupMutation.isPending} onClick={() => setupMutation.mutate()} type="button">{setupMutation.isPending ? 'Sending code…' : 'Set up 2FA'}</button>}
            {authUser?.twoFactorEnabled && !disableStarted && <button className="h-10 shrink-0 rounded-xl border border-[#e5e9e7] px-4 text-[13px] font-semibold text-[#384147] transition hover:bg-[#f7f8f7]" onClick={() => { setDisableStarted(true); setNotice('') }} type="button">Turn off 2FA</button>}
          </div>
          {setupStarted && !authUser?.twoFactorEnabled && <form className="mt-5 flex flex-col gap-3 border-t border-[#edf0ee] pt-5 sm:flex-row" onSubmit={(event) => { event.preventDefault(); enableMutation.mutate(code) }}>
            <label className="min-w-0 flex-1 text-sm font-medium text-[#384147]" htmlFor="two-factor-code">Enter the six-digit code emailed to you
              <input autoComplete="one-time-code" className="mt-2 h-11 w-full rounded-xl border border-[#dfe4e1] bg-white px-3 text-sm tracking-[0.25em] outline-none focus:border-[#1caf35]" id="two-factor-code" inputMode="numeric" maxLength={6} onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))} value={code} />
            </label>
            <button className="h-11 self-end rounded-xl bg-[#1caf35] px-5 text-sm font-semibold text-white hover:bg-[#15952b] disabled:opacity-60" disabled={enableMutation.isPending || code.length !== 6} type="submit">{enableMutation.isPending ? 'Verifying…' : 'Enable 2FA'}</button>
          </form>}
          {disableStarted && authUser?.twoFactorEnabled && !disableCodeSent && <form className="mt-5 flex flex-col gap-3 border-t border-[#edf0ee] pt-5 sm:flex-row sm:items-end" onSubmit={(event) => { event.preventDefault(); disableRequestMutation.mutate(disablePassword) }}>
            <label className="min-w-0 flex-1 text-sm font-medium text-[#384147]" htmlFor="two-factor-current-password">Enter your current password to confirm
              <input autoComplete="current-password" className="mt-2 h-11 w-full rounded-xl border border-[#dfe4e1] bg-white px-3 text-sm outline-none focus:border-[#1caf35]" id="two-factor-current-password" onChange={(event) => setDisablePassword(event.target.value)} required type="password" value={disablePassword} />
            </label>
            <button className="h-11 rounded-xl bg-[#1caf35] px-5 text-sm font-semibold text-white hover:bg-[#15952b] disabled:opacity-60" disabled={disableRequestMutation.isPending} type="submit">{disableRequestMutation.isPending ? 'Sending code…' : 'Continue'}</button>
            <button className="h-11 rounded-xl px-4 text-sm font-semibold text-[#68717a] hover:bg-[#f7f8f7]" onClick={() => { setDisableStarted(false); setNotice('') }} type="button">Cancel</button>
          </form>}
          {disableStarted && authUser?.twoFactorEnabled && disableCodeSent && <form className="mt-5 flex flex-col gap-3 border-t border-[#edf0ee] pt-5 sm:flex-row sm:items-end" onSubmit={(event) => { event.preventDefault(); disableMutation.mutate(disableCode) }}>
            <label className="min-w-0 flex-1 text-sm font-medium text-[#384147]" htmlFor="two-factor-disable-code">Enter the six-digit code emailed to you
              <input autoComplete="one-time-code" className="mt-2 h-11 w-full rounded-xl border border-[#dfe4e1] bg-white px-3 text-sm tracking-[0.25em] outline-none focus:border-[#1caf35]" id="two-factor-disable-code" inputMode="numeric" maxLength={6} onChange={(event) => setDisableCode(event.target.value.replace(/\D/g, '').slice(0, 6))} value={disableCode} />
            </label>
            <button className="h-11 rounded-xl bg-[#1caf35] px-5 text-sm font-semibold text-white hover:bg-[#15952b] disabled:opacity-60" disabled={disableMutation.isPending || disableCode.length !== 6} type="submit">{disableMutation.isPending ? 'Verifying…' : 'Confirm and turn off'}</button>
            <button className="h-11 rounded-xl px-4 text-sm font-semibold text-[#68717a] hover:bg-[#f7f8f7]" onClick={() => { setDisableStarted(false); setDisableCodeSent(false); setDisableCode(''); setNotice('') }} type="button">Cancel</button>
          </form>}
        </section>

        <section aria-labelledby="sessions-heading" className="rounded-2xl border border-[#e7ebe9] bg-white p-5 shadow-[0_2px_10px_rgba(24,35,30,0.025)] sm:p-6">
          <div className="flex items-start gap-4">
            <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f1f7f2] text-[#1caf35]"><Clock3 className="h-5 w-5" strokeWidth={1.8} /></span>
            <div>
              <h2 className="text-base font-semibold text-[#252d31]" id="sessions-heading">Active sessions</h2>
              <p className="mt-1 text-[13px] leading-5 text-[#727b82]">Devices signed in to your account will be listed here. Session management becomes available when authentication is connected.</p>
            </div>
          </div>
        </section>

        <div className="flex items-start gap-3 rounded-xl border border-[#e8ece9] bg-[#fafbfa] px-4 py-4">
          <LockKeyhole aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-[#69736d]" />
          <p className="text-[13px] leading-5 text-[#69736d]">Never share your password or verification codes. Assets Zenith will not ask you to send them by email or message.</p>
        </div>
      </div>
    </div>
  )
}

export default Security
