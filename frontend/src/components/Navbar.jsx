import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Search, Menu, X, User, LogOut, History, LayoutDashboard } from 'lucide-react'
import { useState } from 'react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Search className="h-8 w-8 text-primary-600" />
              <span className="font-bold text-xl text-gray-900">SEO Assistant</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-600 hover:text-primary-600 transition">
              Accueil
            </Link>
            <Link to="/analyze" className="text-gray-600 hover:text-primary-600 transition">
              Analyser
            </Link>
            
            {user ? (
              <>
                <Link to="/history" className="text-gray-600 hover:text-primary-600 transition">
                  <History className="h-5 w-5" />
                </Link>
                <div className="flex items-center space-x-4">
                  <Link to="/dashboard" className="flex items-center space-x-2 text-gray-600 hover:text-primary-600">
                    <User className="h-5 w-5" />
                    <span>{user.username}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-primary-600 transition"
                >
                  Connexion
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
                >
                  Inscription
                </Link>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="text-gray-600"
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 py-4 space-y-3">
            <Link to="/" className="block text-gray-600 hover:text-primary-600">
              Accueil
            </Link>
            <Link to="/analyze" className="block text-gray-600 hover:text-primary-600">
              Analyser
            </Link>
            {user ? (
              <>
                <Link to="/dashboard" className="block text-gray-600 hover:text-primary-600">
                  Tableau de bord
                </Link>
                <Link to="/history" className="block text-gray-600 hover:text-primary-600">
                  Historique
                </Link>
                <button onClick={handleLogout} className="text-red-600">
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block text-gray-600">
                  Connexion
                </Link>
                <Link to="/register" className="block text-primary-600 font-medium">
                  Inscription
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
