import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Activity,
  Bell,
  ChevronDown,
  CircleHelp,
  FileClock,
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowUpFromLine,
  LayoutDashboard,
  LineChart,
  ListChecks,
  LockKeyhole,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  ShieldCheck,
  Sun,
  UserRound,
  Users,
  Wallet,
  X,
} from 'lucide-react'
import DashboardThemeContext from './DashboardThemeContext'

const navigation = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Market data', icon: Activity, path: '/markets' },
]

const adminModeNavigation = [
  { label: 'Admin dashboard', icon: LayoutDashboard, path: '/admin' },
  { label: 'Market data', icon: Activity, path: '/admin/market-data' },
  { label: 'Users & balances', icon: Users, path: '/admin/users' },
  { label: 'Deposit approvals', icon: ArrowDownToLine, path: '/admin/deposits' },
  { label: 'Withdrawal approvals', icon: ArrowUpFromLine, path: '/admin/withdrawals' },
  { label: 'Transactions', icon: FileClock, path: '/admin/transactions' },
  { label: 'Profile', icon: UserRound, path: '/admin/profile' },
  { label: 'Settings', icon: Settings, path: '/admin/settings' },
]

const accountNavigation = [
  { label: 'Profile settings', path: '/dashboard/profile', icon: Settings },
  { label: 'Security', path: '/dashboard/security', icon: ShieldCheck },
  { label: 'Wallet settings', path: '/dashboard/wallet-settings', icon: Wallet },
  { label: 'Profile verification', path: '/dashboard/verification', icon: UserRound },
  { label: 'Reset password', path: '/reset-password', icon: LockKeyhole },
  { label: 'Change password', path: '/dashboard/change-password', icon: LockKeyhole },
]

const navigationGroups = [
  { label: 'Money', icon: Wallet, children: [
    { label: 'Fund deposit', path: '/dashboard/deposit', icon: ArrowDownToLine },
    { label: 'Fund withdrawal', path: '/dashboard/withdrawal', icon: ArrowUpFromLine },
    { label: 'Internal transfer', path: '/dashboard/transfer', icon: ArrowLeftRight },
  ] },
  { label: 'Trading', icon: LineChart, children: [
    { label: 'Explore investments', path: '/dashboard/investments/new', icon: LineChart },
    { label: 'My investments', path: '/dashboard/investments', icon: ListChecks },
    // Temporarily hidden until simulated trading is ready.
    // { label: 'Live trading', path: '/dashboard/live-trading', icon: Activity },
  ] },
  // Temporarily hidden until signal management and a signal source are ready.
  // { label: 'Trade signals', icon: Activity, children: [
  //   { label: 'View signals', path: '/dashboard/signals', icon: Activity },
  //   { label: 'Signal subscriptions', path: '/dashboard/signals/subscribe', icon: FileText },
  // ] },
]

const accountNotifications = [
  { id: 1, title: 'Market data is ready', description: 'The latest available quotes have loaded.', time: 'Recently', unread: true },
  { id: 2, title: 'Welcome to your investment account', description: 'Your Assets Zenith account is ready.', time: 'Today', unread: true },
]

const adminModeNotifications = [
  { id: 1, title: 'Deposit requests need review', description: 'Review incoming payment requests in the management area.', time: 'Recently', unread: true },
  { id: 2, title: 'Withdrawal requests need review', description: 'Check payout requests before approving them.', time: 'Today', unread: true },
]

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/markets': 'Markets',
  '/dashboard/profile': 'Profile settings',
  '/dashboard/change-password': 'Change password',
  '/dashboard/security': 'Security',
  '/dashboard/wallet-settings': 'Wallet settings',
  '/dashboard/verification': 'Profile verification',
  '/dashboard/deposit': 'Fund deposit',
  '/dashboard/withdrawal': 'Fund withdrawal',
  '/dashboard/transfer': 'Internal transfer',
  '/dashboard/investments/new': 'Explore investments',
  '/dashboard/investments': 'My investments',
  '/dashboard/live-trading': 'Live trading',
  '/dashboard/signals': 'View signals',
  '/dashboard/signals/subscribe': 'Signal subscriptions',
  '/dashboard/transactions': 'Transactions',
  '/admin': 'Admin dashboard',
  '/admin/users': 'Users & balances',
  '/admin/deposits': 'Deposit approvals',
  '/admin/withdrawals': 'Withdrawal approvals',
  '/admin/market-data': 'Market data',
  '/admin/profile': 'Profile',
  '/admin/settings': 'Settings',
}

const Brand = ({ adminMode = false }) => (
  <Link aria-label={adminMode ? 'Assets Zenith admin dashboard' : 'Assets Zenith account dashboard'} className="flex min-w-0 items-center gap-3" to={adminMode ? '/admin' : '/dashboard'}>
    <svg aria-hidden="true" className="h-9 w-9 shrink-0" fill="none" viewBox="0 0 40 40">
      <path d="M20 2.5 37.5 12.6v14.8L20 37.5 2.5 27.4V12.6L20 2.5Z" stroke="#ff1018" strokeWidth="2" />
      <path d="m10.5 25.5 9.5-15 9.5 15h-4.4l-5.1-8.2-5.1 8.2h-4.4Z" fill="#ff1018" />
      <path d="M14.5 29h11" stroke="#121619" strokeLinecap="round" strokeWidth="2" />
    </svg>
    <span className="truncate text-[17px] font-semibold tracking-[-0.04em] text-[#15191c]">Assets Zenith</span>
  </Link>
)

const SidebarContent = ({ onNavigate, adminMode = false }) => {
  const location = useLocation()
  const accountRoutes = accountNavigation.map(({ path }) => path)
  const [accountOpen, setAccountOpen] = useState(accountRoutes.includes(location.pathname))
  const [openGroups, setOpenGroups] = useState(() => Object.fromEntries(navigationGroups.map(({ label, children }) => [label, children.some(({ path }) => path === location.pathname)])))
  const accountActive = accountRoutes.includes(location.pathname)

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <div className="flex h-[76px] shrink-0 items-center border-b border-[#edf0f1] px-5 sm:px-6">
        <Brand adminMode={adminMode} />
      </div>

      <div className="px-5 pb-2 pt-7 text-[13px] font-semibold uppercase tracking-[0.16em] text-[#92999e]">{adminMode ? 'Management' : 'Workspace'}</div>
      <nav aria-label={adminMode ? 'Admin navigation' : 'Account navigation'} className="flex-1 space-y-1 overflow-y-auto px-3 pb-4 sm:px-4">
        {adminMode ? adminModeNavigation.map(({ label, icon: Icon, path }) => {
          const isActive = location.pathname === path
          return <Link aria-current={isActive ? 'page' : undefined} className={`group flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors ${isActive ? 'bg-[#fff0f0] text-[#d80f18]' : 'text-[#586168] hover:bg-[#f5f7f6] hover:text-[#161b1e]'}`} key={path} onClick={onNavigate} to={path}><Icon aria-hidden="true" className={`h-[18px] w-[18px] shrink-0 ${isActive ? 'text-[#ff1018]' : 'text-[#899198] group-hover:text-[#465058]'}`} strokeWidth={1.8} /><span className="flex-1">{label}</span>{isActive && <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#ff1018]" />}</Link>
        }) : <>
        {navigation.map(({ label, icon: Icon, path }) => {
          const isActive = path === '/dashboard'
            ? location.pathname === '/dashboard'
            : location.pathname === path || location.pathname.startsWith(`${path}/`)

          return (
            <Link
              aria-current={isActive ? 'page' : undefined}
              className={`group flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors ${isActive ? 'bg-[#fff0f0] text-[#d80f18]' : 'text-[#586168] hover:bg-[#f5f7f6] hover:text-[#161b1e]'}`}
              key={path}
              onClick={onNavigate}
              to={path}
            >
              <Icon aria-hidden="true" className={`h-[18px] w-[18px] shrink-0 ${isActive ? 'text-[#ff1018]' : 'text-[#899198] group-hover:text-[#465058]'}`} strokeWidth={1.8} />
              <span className="flex-1">{label}</span>
              {isActive && <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#ff1018]" />}
            </Link>
          )
        })}

        <div className="my-3 border-t border-[#edf0f1]" />
        <button
          aria-expanded={accountOpen}
          className={`group flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-medium transition-colors ${accountActive ? 'bg-[#fff0f0] text-[#d80f18]' : 'text-[#586168] hover:bg-[#f5f7f6] hover:text-[#161b1e]'}`}
          onClick={() => setAccountOpen((open) => !open)}
          type="button"
        >
          <UserRound aria-hidden="true" className={`h-[18px] w-[18px] shrink-0 ${accountActive ? 'text-[#ff1018]' : 'text-[#899198] group-hover:text-[#465058]'}`} strokeWidth={1.8} />
          <span className="flex-1">My account</span>
          <ChevronDown aria-hidden="true" className={`h-4 w-4 text-[#92999e] transition-transform ${accountOpen ? 'rotate-180' : ''}`} />
        </button>
        {accountOpen && (
          <div className="ml-4 border-l border-[#e9edeb] pl-4">
            {accountNavigation.map(({ label, path, icon: Icon }) => {
              const isActive = location.pathname === path
              return <Link aria-current={isActive ? 'page' : undefined} className={`flex min-h-10 items-center gap-3 text-sm font-medium transition-colors ${isActive ? 'text-[#d80f18]' : 'text-[#727b82] hover:text-[#20262a]'}`} key={path} onClick={onNavigate} to={path}><Icon aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} /><span>{label}</span></Link>
            })}
          </div>
        )}

        {navigationGroups.map(({ label, icon: Icon, children }) => {
          const isActive = children.some(({ path }) => path === location.pathname)
          const isOpen = openGroups[label]
          return (
            <div key={label}>
              <button aria-expanded={Boolean(isOpen)} className={`group flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-medium transition-colors ${isActive ? 'text-[#d80f18]' : 'text-[#586168] hover:bg-[#f5f7f6] hover:text-[#161b1e]'}`} onClick={() => setOpenGroups((current) => ({ ...current, [label]: !current[label] }))} type="button">
                <Icon aria-hidden="true" className={`h-[18px] w-[18px] shrink-0 ${isActive ? 'text-[#ff1018]' : 'text-[#899198] group-hover:text-[#465058]'}`} strokeWidth={1.8} />
                <span className="flex-1">{label}</span>
                <ChevronDown aria-hidden="true" className={`h-4 w-4 text-[#92999e] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>
              {isOpen && <div className="ml-4 border-l border-[#e9edeb] pl-4">{children.map(({ label: childLabel, path, icon: ChildIcon }) => {
                const childActive = location.pathname === path
                return <Link aria-current={childActive ? 'page' : undefined} className={`flex min-h-10 items-center gap-3 text-sm font-medium transition-colors ${childActive ? 'text-[#d80f18]' : 'text-[#727b82] hover:text-[#20262a]'}`} key={path} onClick={onNavigate} to={path}><ChildIcon aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} /><span>{childLabel}</span></Link>
              })}</div>}
            </div>
          )
        })}

        <Link aria-current={location.pathname === '/dashboard/transactions' ? 'page' : undefined} className={`group flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors ${location.pathname === '/dashboard/transactions' ? 'bg-[#fff0f0] text-[#d80f18]' : 'text-[#586168] hover:bg-[#f5f7f6] hover:text-[#161b1e]'}`} onClick={onNavigate} to="/dashboard/transactions"><FileClock aria-hidden="true" className="h-[18px] w-[18px] shrink-0" strokeWidth={1.8} /><span className="flex-1">Transactions</span></Link>
        </>}
      </nav>

      <div className="shrink-0 border-t border-[#edf0f1] p-3 sm:p-4">
        <div className="flex items-center gap-3 rounded-xl bg-[#f7f8f7] p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fff0f0] text-[#e51720]">
            <ShieldCheck aria-hidden="true" className="h-[18px] w-[18px]" strokeWidth={1.8} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[#20262a]">{adminMode ? 'Admin' : 'Investment account'}</p>
            <p className="mt-0.5 truncate text-sm text-[#838b91]">{adminMode ? 'Platform operations' : 'Personal account'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

const DashboardLayout = ({ adminMode = false }) => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [logoutError, setLogoutError] = useState('')
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [search, setSearch] = useState('')
  const [darkMode, setDarkMode] = useState(() => {
    try { return window.localStorage.getItem('assets-zenith-dashboard-theme') === 'dark' } catch { return false }
  })
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const activeNotifications = adminMode ? adminModeNotifications : accountNotifications
  const unreadCount = activeNotifications.filter(({ unread }) => unread).length
  const toggleTheme = () => setDarkMode((current) => {
    const next = !current
    try { window.localStorage.setItem('assets-zenith-dashboard-theme', next ? 'dark' : 'light') } catch { /* Keep the theme for this session if storage is unavailable. */ }
    return next
  })

  const submitSearch = (event) => {
    event.preventDefault()
    const query = search.trim()
    navigate(query ? `/markets?search=${encodeURIComponent(query)}` : '/markets')
    setSearch('')
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    setLogoutError('')
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
      if (!response.ok) throw new Error('Logout failed')
      queryClient.setQueryData(['authUser'], null)
      navigate('/login')
    } catch {
      setLogoutError('Could not log out. Please try again.')
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <DashboardThemeContext.Provider value={darkMode ? 'dark' : 'light'}>
    <div className={`min-h-screen bg-[#f5f7f6] text-[#15191c] ${darkMode ? 'dashboard-dark' : ''}`}>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] border-r border-[#e9edeb] bg-white lg:block xl:w-[264px]">
        <SidebarContent adminMode={adminMode} />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button aria-label="Close navigation menu" className="absolute inset-0 h-full w-full cursor-default bg-[#111416]/45 backdrop-blur-[2px]" onClick={() => setMobileOpen(false)} type="button" />
          <aside aria-label="Mobile account navigation" className="absolute inset-y-0 left-0 w-[min(84vw,300px)] bg-white shadow-2xl">
            <div className="absolute right-3 top-5 z-10">
              <button aria-label="Close navigation menu" className="flex h-9 w-9 items-center justify-center rounded-lg text-[#687179] transition hover:bg-[#f2f4f3] hover:text-[#15191c]" onClick={() => setMobileOpen(false)} type="button">
                <X aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>
            <SidebarContent onNavigate={() => setMobileOpen(false)} adminMode={adminMode} />
          </aside>
        </div>
      )}

      <div className="min-h-screen lg:pl-[248px] xl:pl-[264px]">
        <header className="sticky top-0 z-20 border-b border-[#e9edeb] bg-white/95 backdrop-blur-xl">
          <div className="mx-auto flex h-[68px] max-w-[1600px] items-center gap-3 px-4 sm:h-[72px] sm:gap-5 sm:px-6 lg:px-8">
            <button aria-label="Open navigation menu" aria-expanded={mobileOpen} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#e9edeb] text-[#465058] transition hover:bg-[#f5f7f6] lg:hidden" onClick={() => setMobileOpen(true)} type="button">
              <Menu aria-hidden="true" className="h-5 w-5" />
            </button>

              {!adminMode && <form className="relative min-w-0 max-w-[440px] flex-1" onSubmit={submitSearch} role="search">
              <Search aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-[#92999e]" strokeWidth={1.8} />
              <input
                aria-label="Search stocks and crypto markets"
                className="h-10 w-full rounded-xl border border-transparent bg-[#f5f7f6] pl-10 pr-4 text-sm text-[#20262a] outline-none transition placeholder:text-[#92999e] focus:border-[#dbe7dd] focus:bg-white focus:ring-4 focus:ring-[#1caf35]/[0.08] sm:h-11"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search assets or symbols"
                type="search"
                value={search}
              />
              </form>}

            <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
              {!adminMode && <Link aria-label="Open public markets" className="hidden items-center gap-2 rounded-xl px-3 py-2 text-[13px] font-medium text-[#687179] transition hover:bg-[#f5f7f6] hover:text-[#15191c] sm:inline-flex" to="/markets">
                <Activity aria-hidden="true" className="h-4 w-4" />
                <span className="hidden xl:inline">Markets</span>
              </Link>}

              <button aria-label={`Switch to ${darkMode ? 'light' : 'dark'} mode`} className="flex h-10 w-10 items-center justify-center rounded-xl text-[#687179] transition hover:bg-[#f5f7f6] hover:text-[#15191c]" onClick={toggleTheme} title={`Switch to ${darkMode ? 'light' : 'dark'} mode`} type="button">{darkMode ? <Sun aria-hidden="true" className="h-[18px] w-[18px]" /> : <Moon aria-hidden="true" className="h-[18px] w-[18px]" />}</button>

              <div className="relative">
                <button
                  aria-expanded={notifOpen}
                  aria-label={`Notifications, ${unreadCount} unread`}
                  className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition ${notifOpen ? 'bg-[#f5f7f6] text-[#15191c]' : 'text-[#687179] hover:bg-[#f5f7f6] hover:text-[#15191c]'}`}
                  onClick={() => { setNotifOpen((open) => !open); setProfileOpen(false) }}
                  type="button"
                >
                  <Bell aria-hidden="true" className="h-[18px] w-[18px]" strokeWidth={1.8} />
                  {unreadCount > 0 && <span aria-hidden="true" className="absolute right-[9px] top-[8px] h-2 w-2 rounded-full border-2 border-white bg-[#ff1018]" />}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 top-[calc(100%+12px)] z-50 w-[min(88vw,360px)] overflow-hidden rounded-2xl border border-[#e9edeb] bg-white shadow-[0_18px_55px_rgba(21,25,28,0.14)]">
                    <div className="flex items-center justify-between border-b border-[#edf0f1] px-4 py-3.5">
                      <div>
                        <h2 className="text-base font-semibold text-[#20262a]">Notifications</h2>
                        <p className="mt-0.5 text-[13px] text-[#858e94]">Updates for your workspace</p>
                      </div>
                      {unreadCount > 0 && <span className="rounded-full bg-[#fff0f0] px-2.5 py-1 text-xs font-semibold text-[#d80f18]">{unreadCount} new</span>}
                    </div>
                    <div className="divide-y divide-[#f0f2f1]">
                      {activeNotifications.map((notification) => (
                        <div className="flex gap-3 px-4 py-3.5" key={notification.id}>
                          <span aria-hidden="true" className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${notification.unread ? 'bg-[#1caf35]' : 'bg-transparent'}`} />
                          <div className="min-w-0 flex-1">
                            <p className="text-[13px] font-semibold text-[#283036]">{notification.title}</p>
                            <p className="mt-1 text-[13px] leading-5 text-[#687179]">{notification.description}</p>
                            <p className="mt-1.5 text-[13px] text-[#92999e]">{notification.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div aria-hidden="true" className="mx-0.5 hidden h-8 w-px bg-[#e9edeb] sm:block" />

              <div className="relative">
                <button
                  aria-expanded={profileOpen}
                  aria-label="Open account menu"
                  className="flex h-10 items-center gap-2 rounded-xl px-1.5 transition hover:bg-[#f5f7f6] sm:gap-2.5 sm:px-2"
                  onClick={() => { setProfileOpen((open) => !open); setNotifOpen(false) }}
                  type="button"
                >
                  <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-full bg-[#171b1e] text-xs font-semibold text-white">AZ</span>
                  <span className="hidden text-left sm:block">
                <span className="block text-[13px] font-semibold leading-5 text-[#283036]">{adminMode ? 'Admin' : 'My account'}</span>
                <span className="block text-[13px] leading-5 text-[#8a9298]">Assets Zenith</span>
                  </span>
                  <ChevronDown aria-hidden="true" className={`hidden h-3.5 w-3.5 text-[#92999e] transition-transform sm:block ${profileOpen ? 'rotate-180' : ''}`} />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-[calc(100%+12px)] z-50 w-56 overflow-hidden rounded-2xl border border-[#e9edeb] bg-white p-1.5 shadow-[0_18px_55px_rgba(21,25,28,0.14)]">
                    <div className="border-b border-[#edf0f1] px-3 py-2.5">
                      <p className="text-[13px] font-semibold text-[#283036]">{adminMode ? 'Admin' : 'My account'}</p>
                      <p className="mt-1 text-[13px] text-[#8a9298]">{adminMode ? 'Platform operations' : 'Assets Zenith workspace'}</p>
                    </div>
                    {!adminMode && <Link className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] font-medium text-[#586168] transition hover:bg-[#f5f7f6] hover:text-[#15191c]" onClick={() => setProfileOpen(false)} to="/dashboard/profile">
                      <Settings aria-hidden="true" className="h-4 w-4" />
                      Profile settings
                    </Link>}
                    {adminMode && <Link className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] font-medium text-[#586168] transition hover:bg-[#f5f7f6] hover:text-[#15191c]" onClick={() => setProfileOpen(false)} to="/admin/profile"><UserRound aria-hidden="true" className="h-4 w-4" />Admin profile</Link>}
                    {adminMode && <Link className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] font-medium text-[#586168] transition hover:bg-[#f5f7f6] hover:text-[#15191c]" onClick={() => setProfileOpen(false)} to="/admin/settings"><Settings aria-hidden="true" className="h-4 w-4" />Settings</Link>}
                    <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[13px] font-medium text-[#586168] transition hover:bg-[#f5f7f6] hover:text-[#15191c] disabled:cursor-wait disabled:opacity-60" disabled={isLoggingOut} onClick={handleLogout} type="button">
                      <LogOut aria-hidden="true" className="h-4 w-4" />
                      {isLoggingOut ? 'Logging out…' : 'Log out'}
                    </button>
                    {logoutError && <p aria-live="polite" className="px-3 py-2 text-xs text-[#b4232d]">{logoutError}</p>}
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto min-h-[calc(100vh-68px)] max-w-[1600px] px-4 py-5 sm:min-h-[calc(100vh-72px)] sm:px-6 sm:py-7 lg:px-8 lg:py-8">
          <div className="mb-5 flex items-center gap-2 text-sm font-medium text-[#8a9298]">
            <span>Assets Zenith</span><span aria-hidden="true">/</span><span className="text-[#465058]">{pageTitles[location.pathname] || 'Overview'}</span>
          </div>
          <Outlet />
          <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-[#e7ebe9] pt-4 text-[13px] leading-5 text-[#92999e]">
            <span>© {new Date().getFullYear()} Assets Zenith. All rights reserved.</span>
            {/* <span>Marizu Inc.</span> */}
            <Link className="inline-flex items-center gap-1.5 transition hover:text-[#59616b]" to="/about"><CircleHelp aria-hidden="true" className="h-3.5 w-3.5" />Help &amp; information</Link>
          </div>
        </main>
      </div>
    </div>
    </DashboardThemeContext.Provider>
  )
}

export default DashboardLayout
