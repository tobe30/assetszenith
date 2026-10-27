import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { ArrowLeft, CheckCircle2, KeyRound, LoaderCircle, Mail } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { forgotPassword, resetPassword } from '../lib/api'

const inputClass = 'mt-2 h-12 w-full rounded-xl border border-[#dfe4e6] bg-white px-4 font-normal outline-none transition placeholder:text-[#a0a7ac] focus:border-[#1caf35] focus:ring-4 focus:ring-[#1caf35]/10'

const ResetPassword = () => {
  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState('')
  const resetToken = searchParams.get('token') || ''
  const forgotMutation = useMutation({ mutationFn: forgotPassword })
  const resetMutation = useMutation({ mutationFn: resetPassword })

  const handleForgotSubmit = (event) => {
    event.preventDefault()
    forgotMutation.mutate(email.trim())
  }

  const handleResetSubmit = (event) => {
    event.preventDefault()
    const form = event.currentTarget
    resetMutation.mutate({
      token: resetToken,
      newPassword: form.elements.newPassword.value,
      confirmPassword: form.elements.confirmPassword.value,
    })
  }

  const forgotError = forgotMutation.error?.response?.data?.message || 'Unable to send reset instructions right now.'
  const resetError = resetMutation.error?.response?.data?.message || 'Unable to reset your password right now.'

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f7f6] px-4 py-10 text-[#15191c] sm:px-6">
      <div className="w-full max-w-[480px]">
        <Link aria-label="Assets Zenith home" className="mb-8 inline-flex items-center gap-3" to="/">
          <svg aria-hidden="true" className="h-10 w-10 shrink-0" fill="none" viewBox="0 0 40 40">
            <path d="M20 2.5 37.5 12.6v14.8L20 37.5 2.5 27.4V12.6L20 2.5Z" stroke="#ff1018" strokeWidth="2" />
            <path d="m10.5 25.5 9.5-15 9.5 15h-4.4l-5.1-8.2-5.1 8.2h-4.4Z" fill="#ff1018" />
            <path d="M14.5 29h11" stroke="#121619" strokeLinecap="round" strokeWidth="2" />
          </svg>
          <span className="text-xl font-semibold tracking-[-0.04em]">Assets Zenith</span>
        </Link>

        <section className="rounded-3xl border border-[#e5e9e7] bg-white p-6 shadow-[0_12px_40px_rgba(20,30,25,0.06)] sm:p-9">
          <div aria-hidden="true" className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eaf7ec] text-[#1caf35]">
            {resetToken ? <KeyRound className="h-6 w-6" /> : forgotMutation.isSuccess ? <CheckCircle2 className="h-6 w-6" /> : <Mail className="h-6 w-6" />}
          </div>

          {resetToken && resetMutation.isSuccess ? (
            <div aria-live="polite">
              <p className="text-[13px] font-semibold uppercase tracking-[0.13em] text-[#1caf35]">Password updated</p>
              <h1 className="mt-2 text-2xl font-semibold tracking-[-0.04em] sm:text-[28px]">You’re all set</h1>
              <p className="mt-3 text-sm leading-6 text-[#687179]">{resetMutation.data?.message || 'Your password has been reset. You can now log in with your new password.'}</p>
              <Link className="mt-6 flex min-h-12 w-full items-center justify-center rounded-xl bg-[#1caf35] px-5 text-sm font-semibold text-white transition hover:bg-[#15952b]" to="/login">Go to log in</Link>
            </div>
          ) : resetToken ? (
            <>
              <p className="text-[13px] font-semibold uppercase tracking-[0.13em] text-[#1caf35]">Account recovery</p>
              <h1 className="mt-2 text-2xl font-semibold tracking-[-0.04em] sm:text-[28px]">Create a new password</h1>
              <p className="mt-3 text-sm leading-6 text-[#687179]">Choose a new password for your Assets Zenith account.</p>
              <form className="mt-7 space-y-5" onSubmit={handleResetSubmit}>
                <label className="block text-sm font-semibold" htmlFor="new-password">New password<input autoComplete="new-password" className={inputClass} id="new-password" maxLength={128} minLength={8} name="newPassword" placeholder="At least 8 characters" required type="password" /></label>
                <label className="block text-sm font-semibold" htmlFor="confirm-password">Confirm new password<input autoComplete="new-password" className={inputClass} id="confirm-password" maxLength={128} minLength={8} name="confirmPassword" placeholder="Enter your new password again" required type="password" /></label>
                {resetMutation.isError && <p aria-live="polite" className="rounded-xl border border-[#f0d8c2] bg-[#fff8f0] px-4 py-3 text-sm leading-5 text-[#7e4b20]">{resetError}</p>}
                <button className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#1caf35] px-5 text-sm font-semibold text-white shadow-[0_6px_16px_rgba(28,175,53,0.18)] transition hover:bg-[#15952b] disabled:cursor-wait disabled:opacity-70" disabled={resetMutation.isPending} type="submit">{resetMutation.isPending && <LoaderCircle className="h-4 w-4 animate-spin" />}{resetMutation.isPending ? 'Updating password…' : 'Reset password'}</button>
              </form>
              <Link className="mt-5 inline-flex text-sm font-semibold text-[#16852d] hover:text-[#116d25]" to="/reset-password">Request a new reset link</Link>
            </>
          ) : forgotMutation.isSuccess ? (
            <div aria-live="polite">
              <p className="text-[13px] font-semibold uppercase tracking-[0.13em] text-[#1caf35]">Account recovery</p>
              <h1 className="mt-2 text-2xl font-semibold tracking-[-0.04em] sm:text-[28px]">Check your email</h1>
              <p className="mt-3 text-sm leading-6 text-[#687179]">{forgotMutation.data?.message || 'If an account exists for that email, password reset instructions will be sent shortly.'}</p>
              <p className="mt-4 break-all rounded-xl bg-[#f7f8f7] px-4 py-3 text-sm text-[#465058]">{email}</p>
              <button className="mt-5 text-sm font-semibold text-[#16852d] transition hover:text-[#116d25]" onClick={() => forgotMutation.reset()} type="button">Try another email</button>
            </div>
          ) : (
            <>
              <p className="text-[13px] font-semibold uppercase tracking-[0.13em] text-[#1caf35]">Account recovery</p>
              <h1 className="mt-2 text-2xl font-semibold tracking-[-0.04em] sm:text-[28px]">Reset your password</h1>
              <p className="mt-3 text-sm leading-6 text-[#687179]">Enter the email address associated with your account and we’ll send you a secure reset link.</p>
              <form className="mt-7 space-y-5" onSubmit={handleForgotSubmit}>
                <label className="block text-sm font-semibold" htmlFor="reset-email">Email address<input autoComplete="email" className={inputClass} id="reset-email" maxLength={254} name="email" onChange={(event) => { setEmail(event.target.value); if (forgotMutation.isError) forgotMutation.reset() }} placeholder="you@example.com" required type="email" value={email} /></label>
                {forgotMutation.isError && <p aria-live="polite" className="rounded-xl border border-[#f0d8c2] bg-[#fff8f0] px-4 py-3 text-sm leading-5 text-[#7e4b20]">{forgotError}</p>}
                <button className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#1caf35] px-5 text-sm font-semibold text-white shadow-[0_6px_16px_rgba(28,175,53,0.18)] transition hover:bg-[#15952b] disabled:cursor-wait disabled:opacity-70" disabled={forgotMutation.isPending} type="submit">{forgotMutation.isPending && <LoaderCircle className="h-4 w-4 animate-spin" />}{forgotMutation.isPending ? 'Sending instructions…' : 'Send reset instructions'}</button>
              </form>
            </>
          )}

          <Link className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-[#586168] transition hover:text-[#15191c]" to="/login"><ArrowLeft aria-hidden="true" className="h-4 w-4" />Back to log in</Link>
        </section>
        <p className="mt-6 text-center text-xs leading-5 text-[#8a9299]">Assets Zenith provides general market information. Investing involves risk.</p>
      </div>
    </main>
  )
}

export default ResetPassword
