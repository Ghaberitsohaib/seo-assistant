import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Sidebar from './components/Sidebar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Analysis from './pages/Analysis'
import History from './pages/History'
import Clients from './pages/Clients'
import ProtectedRoute from './components/ProtectedRoute'
import PaymentSuccess from './pages/PaymentSuccess'
import Pricing from './pages/Pricing'
import CustomCursor from './components/CustomCursor'

const PUBLIC_ROUTES = ['/', '/login', '/register']

function AppLayout() {
  const location = useLocation()
  const { user } = useAuth()
  const isPublic = PUBLIC_ROUTES.includes(location.pathname)
  const showSidebar = user && !isPublic

  return (
    <div className="app-shell">
      <CustomCursor />
      {showSidebar && <Sidebar />}
      <main className={showSidebar ? 'main-content' : 'public-layout w-full'}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/analyze" element={<ProtectedRoute><Analysis /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
          <Route path="/pricing" element={<ProtectedRoute><Pricing /></ProtectedRoute>} />
          <Route path="/payment/success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
          <Route path="/analysis/:id" element={<ProtectedRoute><Analysis /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter basename="/opencode/seo-assistant/frontend">
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
