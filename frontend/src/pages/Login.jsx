import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import { login as loginUserRequest, verifyTwoFactorLogin } from '../lib/api'

const inputClass = 'mt-2 h-12 w-full rounded-xl border border-[#dfe2e4] bg-white px-4 font-normal outline-none transition focus:border-[#1caf35] focus:ring-4 focus:ring-[#1caf35]/10'

const Login = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [challenge, setChallenge] = useState(null)
  const [verificationCode, setVerificationCode] = useState('')
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { mutate: loginUser, isPending, error: loginError } = useMutation({
    mutationFn: loginUserRequest,
    onSuccess: (data) => {
      if (data.requiresTwoFactor) {
        setChallenge(data)
        return
      }
      queryClient.setQueryData(['authUser'], data.user)
      navigate(data.user?.role === 'admin' ? '/admin' : '/dashboard', { replace: true })
    },
  })

  const { mutate: verifyCode, isPending: isVerifying, error: verificationError } = useMutation({
    mutationFn: verifyTwoFactorLogin,
    onSuccess: (data) => {
      queryClient.setQueryData(['authUser'], data.user)
      navigate(data.user?.role === 'admin' ? '/admin' : '/dashboard', { replace: true })
    },
  })

  const handleSubmit = (event) => {
    event.preventDefault()
    if (challenge) {
      verifyCode({ challengeToken: challenge.challengeToken, code: verificationCode.trim() })
      return
    }
    const form = event.currentTarget
    loginUser({
      email: form.elements.email.value.trim(),
      password: form.elements.password.value,
    })
  }

  const error = challenge ? verificationError : loginError
  const errorMessage = error?.response?.data?.message || error?.message || 'Unable to connect to the server.'

  return (
    <AuthLayout
      description={challenge ? `Enter the six-digit code sent to ${challenge.emailHint}.` : "Enter your details to continue to Assets Zenith."}
      eyebrow={challenge ? "Verify your sign-in" : "Welcome back"}
      footer={<p className="mt-7 text-center text-sm text-[#68717a]">New to Assets Zenith? <Link className="font-semibold text-[#16852d] hover:text-[#116d25]" to="/register">Create an account</Link></p>}
      title={challenge ? "Check your email" : "Log in to your account"}
    >
      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        {challenge ? <>
        <label className="block text-sm font-semibold" htmlFor="verificationCode">
          Email verification code
          <input autoComplete="one-time-code" autoFocus className={inputClass} id="verificationCode" inputMode="numeric" maxLength={6} name="verificationCode" onChange={(event) => setVerificationCode(event.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="Enter 6-digit code" required type="text" value={verificationCode} />
        </label>
        <p className="text-sm leading-5 text-[#68717a]">The code expires in 10 minutes. You have up to 5 attempts.</p>
        <button className="flex min-h-12 w-full items-center justify-center rounded-xl bg-[#1caf35] px-5 text-sm font-bold text-white shadow-[0_6px_16px_rgba(28,175,53,0.18)] transition hover:bg-[#15952b] disabled:cursor-wait disabled:opacity-70" disabled={isVerifying || verificationCode.length !== 6} type="submit">
          {isVerifying ? 'Verifying…' : 'Verify and log in'}
        </button>
        <button className="w-full text-sm font-semibold text-[#16852d] hover:text-[#116d25]" onClick={() => { setChallenge(null); setVerificationCode('') }} type="button">Use a different sign-in</button>
        </> : <>
        <label className="block text-sm font-semibold" htmlFor="email">
          Email address
          <input autoComplete="email" className={inputClass} id="email" name="email" placeholder="you@example.com" required type="email" />
        </label>
        <label className="block text-sm font-semibold" htmlFor="password">
          Password
          <span className="relative mt-2 block">
            <input autoComplete="current-password" className={`${inputClass} mt-0 pr-16`} id="password" name="password" placeholder="Enter your password" required type={showPassword ? 'text' : 'password'} />
            <button className="absolute inset-y-0 right-3 my-auto h-9 rounded-md px-2 text-xs font-semibold text-[#68717a] hover:text-[#101416]" onClick={() => setShowPassword((visible) => !visible)} type="button">{showPassword ? 'Hide' : 'Show'}</button>
          </span>
        </label>

        <div className="flex items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-sm text-[#59616b]"><input className="accent-[#1caf35]" type="checkbox" />Remember me</label>
          <Link className="text-sm font-semibold text-[#16852d] transition hover:text-[#116d25]" to="/reset-password">Forgot password?</Link>
        </div>

        <button className="flex min-h-12 w-full items-center justify-center rounded-xl bg-[#1caf35] px-5 text-sm font-bold text-white shadow-[0_6px_16px_rgba(28,175,53,0.18)] transition hover:bg-[#15952b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#15952b] disabled:cursor-wait disabled:opacity-70" disabled={isPending} type="submit">
          {isPending ? 'Logging in…' : 'Log in'}
        </button>
        </>}
        {error && <p aria-live="polite" className="rounded-xl border border-[#f0d8c2] bg-[#fff8f0] px-4 py-3 text-sm leading-5 text-[#7e4b20]">{errorMessage}</p>}
      </form>
    </AuthLayout>
  )
}

export default Login
