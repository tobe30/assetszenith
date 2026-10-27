import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { signup } from '../lib/api'

const inputClass = 'mt-2 h-12 w-full rounded-xl border border-[#dfe2e4] bg-white px-4 font-normal outline-none transition focus:border-[#1caf35] focus:ring-4 focus:ring-[#1caf35]/10'

const Register = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [notice, setNotice] = useState('')
  const navigate = useNavigate();
  const queryClient = useQueryClient();


  const { mutate: registerUser, isPending, error } = useMutation({
    mutationFn: signup,
    onSuccess: (data) => {
      queryClient.setQueryData(['authUser'], data.user)
      navigate(data.user?.role === 'admin' ? '/admin' : '/dashboard', { replace: true })
    }
  })

  const handleSubmit = (event) => {
    event.preventDefault()
    const form = event.currentTarget
    if (form.elements.password.value !== form.elements.confirmPassword.value) {
      setNotice('Your passwords do not match. Please check and try again.')
      return
    }
    setNotice('')
    registerUser({
      firstName: form.elements.firstName.value.trim(),
      lastName: form.elements.lastName.value.trim(),
      username: form.elements.username.value.trim(),
      email: form.elements.email.value.trim(),
      phone: form.elements.phone.value.trim(),
      country: form.elements.country.value.trim(),
      currency: form.elements.currency.value,
      password: form.elements.password.value,
      confirmPassword: form.elements.confirmPassword.value,
      termsAccepted: true,
    })
  }

  const errorMessage =
    error?.response?.data?.message || error?.message || 'Unable to connect to the server.'


  return (
    <AuthLayout
      description="Create an account to start exploring the markets."
      eyebrow="Get started"
      footer={<p className="mt-7 text-center text-sm text-[#68717a]">Already have an account? <Link className="font-semibold text-[#16852d] hover:text-[#116d25]" to="/login">Log in</Link></p>}
      title="Create your account"
    >
      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block text-sm font-semibold" htmlFor="first-name">
            First name
            <input autoComplete="given-name" className={inputClass} id="first-name" name="firstName" placeholder="First name" required />
          </label>
          <label className="block text-sm font-semibold" htmlFor="last-name">
            Last name
            <input autoComplete="family-name" className={inputClass} id="last-name" name="lastName" placeholder="Last name" required />
          </label>
        </div>

        <label className="block text-sm font-semibold" htmlFor="username">
          Username
          <input autoComplete="username" className={inputClass} id="username" maxLength={40} minLength={3} name="username" pattern="[A-Za-z0-9._]{3,40}" placeholder="Choose a username" required title="Use 3 to 40 letters, numbers, periods, or underscores." />
          <span className="mt-1 block text-xs font-normal text-[#858e94]">Use 3–40 letters, numbers, periods, or underscores.</span>
        </label>

        <label className="block text-sm font-semibold" htmlFor="email">
          Email address
          <input autoComplete="email" className={inputClass} id="email" name="email" placeholder="you@example.com" required type="email" />
        </label>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block text-sm font-semibold" htmlFor="phone">
            Phone number <span className="font-normal text-[#8a9299]">(optional)</span>
            <input autoComplete="tel" className={inputClass} id="phone" name="phone" placeholder="Phone number" type="tel" />
          </label>
          <label className="block text-sm font-semibold" htmlFor="country">
            Country
            <input autoComplete="country-name" className={inputClass} id="country" name="country" placeholder="Your country" required />
          </label>
        </div>

        <label className="block text-sm font-semibold" htmlFor="currency">
          Account currency
          <select className={inputClass} defaultValue="USD" id="currency" name="currency" required>
            <option value="USD">USD — US Dollar</option>
            <option value="EUR">EUR — Euro</option>
            <option value="CNY">CNY — Chinese Yuan</option>
            <option value="JPY">JPY — Japanese Yen</option>
            <option value="GBP">GBP — British Pound</option>
            <option value="AUD">AUD — Australian Dollar</option>
            <option value="TRY">TRY — Turkish Lira</option>
          </select>
        </label>

        <label className="block text-sm font-semibold" htmlFor="password">
          Password
          <span className="relative mt-2 block">
            <input autoComplete="new-password" className={`${inputClass} mt-0 pr-16`} id="password" minLength={8} name="password" placeholder="At least 8 characters" required type={showPassword ? 'text' : 'password'} />
            <button className="absolute inset-y-0 right-3 my-auto h-9 rounded-md px-2 text-xs font-semibold text-[#68717a] hover:text-[#101416]" onClick={() => setShowPassword((visible) => !visible)} type="button">{showPassword ? 'Hide' : 'Show'}</button>
          </span>
        </label>

        <label className="block text-sm font-semibold" htmlFor="confirm-password">
          Confirm password
          <span className="relative mt-2 block">
            <input autoComplete="new-password" className={`${inputClass} mt-0 pr-16`} id="confirm-password" minLength={8} name="confirmPassword" placeholder="Enter your password again" required type={showConfirmPassword ? 'text' : 'password'} />
            <button aria-label={showConfirmPassword ? 'Hide confirmation password' : 'Show confirmation password'} className="absolute inset-y-0 right-3 my-auto h-9 rounded-md px-2 text-xs font-semibold text-[#68717a] hover:text-[#101416]" onClick={() => setShowConfirmPassword((visible) => !visible)} type="button">{showConfirmPassword ? 'Hide' : 'Show'}</button>
          </span>
        </label>

        <label className="flex items-start gap-3 text-xs leading-5 text-[#68717a]">
          <input className="mt-1 accent-[#1caf35]" required type="checkbox" />
          <span>I agree to the terms of service and acknowledge the privacy notice.</span>
        </label>

        <button disabled={isPending} className="flex min-h-12 w-full items-center justify-center rounded-xl bg-[#1caf35] px-5 text-sm font-bold text-white shadow-[0_6px_16px_rgba(28,175,53,0.18)] transition hover:bg-[#15952b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#15952b]" type="submit">
          {isPending ? 'Creating account…' : 'Create account'}
        </button>
        {(notice || error) && <p aria-live="polite" className="rounded-xl border border-[#f0d8c2] bg-[#fff8f0] px-4 py-3 text-sm leading-5 text-red-500">{notice || errorMessage}</p>}
      </form>
    </AuthLayout>
  )
}

export default Register
