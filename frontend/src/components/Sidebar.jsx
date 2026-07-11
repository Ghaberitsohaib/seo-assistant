import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, Zap, History,
  LogOut, Menu, X, Sparkles, Users, Coins
} from 'lucide-react'
import { useState } from 'react'

export default function Sidebar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
    { to: '/analyze',   icon: Zap,             label: 'Analyser'         },
    { to: '/history',   icon: History,          label: 'Historique'       },
    { to: '/pricing',   icon: Coins,           label: 'Acheter jetons'   },
  ]

  if (user?.role === 'admin') {
    navItems.push({ to: '/clients', icon: Users, label: 'Clients' })
  }

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : '??'

  return (
    <>
      {/* Mobile Top Bar (Clean obsidian glass bar at the top of viewport) */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-[#030712]/80 backdrop-blur-xl flex items-center justify-between px-4 z-[140]" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-xl btn-ghost flex items-center justify-center"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" style={{ color: 'var(--accent)' }} />
          </button>
          <Link to="/" className="flex items-center gap-2 text-decoration-none">
            <img 
              src={`${import.meta.env.BASE_URL}logo.png?v=2`} 
              alt="SEO Logo" 
              className="h-8 w-auto object-contain" 
            />
            <span style={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.5px' }}>
              Assistant
            </span>
          </Link>
        </div>
      </div>

      {/* Backdrop */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`} style={{ zIndex: 160 }}>
        {/* Sidebar Header with Logo & Close button in a Flex Row */}
        <div className="flex items-center justify-between mb-8 px-1">
          <Link to="/" className="flex items-center gap-2.5 text-decoration-none" onClick={() => setMobileOpen(false)}>
            <div className="flex items-center gap-2">
              <img 
                src={`${import.meta.env.BASE_URL}logo.png?v=2`} 
                alt="SEO Logo" 
                className="h-10 w-auto object-contain" 
              />
              <span className="sidebar-logo-text" style={{ fontFamily: '"Space Grotesk", sans-serif', letterSpacing: '0.5px' }}>
                Assistant
              </span>
            </div>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-2 rounded-xl btn-ghost flex items-center justify-center"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" style={{ color: 'var(--accent)' }} />
          </button>
        </div>

        {/* Nav Section Label */}
        <div className="mb-2">
          <p className="sidebar-section-label">Navigation</p>
        </div>
        
        {/* Nav Links */}
        <nav className="sidebar-nav">
          {navItems.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={`sidebar-link ${location.pathname === to ? 'active' : ''}`}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Footer section inside Sidebar */}
        <div className="sidebar-footer">
          {user ? (
            <>
              <div className="sidebar-user">
                <div className="sidebar-avatar">{initials}</div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="sidebar-username truncate leading-tight">{user.username}</span>
                  <span className="text-[11px] font-bold mt-0.5 tracking-wide" style={{ color: 'var(--accent)' }}>
                    {user.role === 'admin' ? 'Illimité' : (user.credits !== undefined ? `${user.credits} jeton(s)` : '0 jeton')}
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="sidebar-link w-full text-left"
                style={{ color: '#F87171' }}
              >
                <LogOut className="h-4 w-4 flex-shrink-0" />
                Déconnexion
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-2">
              <Link to="/login" className="btn-ghost w-full justify-center" onClick={() => setMobileOpen(false)}>
                Connexion
              </Link>
              <Link to="/register" className="btn-primary w-full justify-center" onClick={() => setMobileOpen(false)}>
                Inscription
              </Link>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
