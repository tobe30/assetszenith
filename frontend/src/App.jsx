import { useQuery } from '@tanstack/react-query'
import { Navigate, Route, Routes } from 'react-router-dom'
import DashboardLayout from './components/DashboardLayout'
import Loading from './components/Loading'
import ProtectedRoute from './components/ProtectedRoute'
import About from './pages/About'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import Invest from './pages/Invest'
import Markets from './pages/Markets'
import ResetPassword from './pages/ResetPassword'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminMarketData from './pages/admin/MarketData'
import AdminProfile from './pages/admin/Profile'
import AdminSettings from './pages/admin/Settings'
import AdminTransactions from './pages/admin/Transactions'
import AdminUsers from './pages/admin/UserBalances'
import DepositApprovals from './pages/admin/DepositApprovals'
import WithdrawalApprovals from './pages/admin/WithdrawalApprovals'
import ChangePassword from './pages/dashboard/ChangePassword'
import Dashboard from './pages/dashboard/Dashboard'
import Deposit from './pages/dashboard/Deposit'
import LiveTrading from './pages/dashboard/LiveTrading'
import MyInvestments from './pages/dashboard/MyInvestments'
import NewInvestment from './pages/dashboard/NewInvestment'
import ProfileSettings from './pages/dashboard/ProfileSettings'
import ProfileVerification from './pages/dashboard/ProfileVerification'
import Security from './pages/dashboard/Security'
import Signals from './pages/dashboard/Signals'
import SignalSubscription from './pages/dashboard/SignalSubscription'
import Transactions from './pages/dashboard/Transactions'
import Transfer from './pages/dashboard/Transfer'
import WalletSettings from './pages/dashboard/WalletSettings'
import Withdrawal from './pages/dashboard/Withdrawal'
import { getAuthuser } from './lib/api'

const App = () => {
  const { data: authUser, isLoading } = useQuery({
    queryKey: ['authUser'],
    queryFn: getAuthuser,
    retry: false,
  })

  const homeForRole = authUser?.role === 'admin' ? '/admin' : '/dashboard'
  const authPage = (page) => {
    if (isLoading) return <Loading fullScreen label="Checking your session..." />
    return authUser ? <Navigate to={homeForRole} replace /> : page
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/invest" element={<Invest />} />
      <Route path="/markets" element={<Markets />} />
      <Route path="/login" element={authPage(<Login />)} />
      <Route path="/register" element={authPage(<Register />)} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route element={<ProtectedRoute authUser={authUser} isLoading={isLoading} requiredRole={['admin']} />}>
        <Route path="/admin" element={<DashboardLayout adminMode />}>
          <Route index element={<AdminDashboard />} />
          <Route path="market-data" element={<AdminMarketData />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="deposits" element={<DepositApprovals />} />
          <Route path="withdrawals" element={<WithdrawalApprovals />} />
          <Route path="transactions" element={<AdminTransactions />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute authUser={authUser} isLoading={isLoading} requiredRole={['user']} />}>
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="profile" element={<ProfileSettings />} />
          <Route path="change-password" element={<ChangePassword />} />
          <Route path="security" element={<Security />} />
          <Route path="wallet-settings" element={<WalletSettings />} />
          <Route path="verification" element={<ProfileVerification />} />
          <Route path="deposit" element={<Deposit />} />
          <Route path="withdrawal" element={<Withdrawal />} />
          <Route path="transfer" element={<Transfer />} />
          <Route path="investments/new" element={<NewInvestment />} />
          <Route path="investments" element={<MyInvestments />} />
          <Route path="live-trading" element={<LiveTrading />} />
          <Route path="signals" element={<Signals />} />
          <Route path="signals/subscribe" element={<SignalSubscription />} />
          <Route path="transactions" element={<Transactions />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
