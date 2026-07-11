import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Loader2, AlertCircle, Sparkles } from 'lucide-react'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(username, password)
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'transparent',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute', top: '20%', left: '50%',
        transform: 'translateX(-50%)',
        width: 500, height: 300,
        background: 'radial-gradient(ellipse, rgba(127,119,221,0.1) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <img 
              src={`${import.meta.env.BASE_URL}logo.png?v=2`} 
              alt="SEO Logo" 
              className="h-16 w-auto object-contain" 
              style={{ margin: '0 auto' }} 
            />
          </div>
          <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: 32, fontWeight: 700, marginBottom: 8 }}>
            Connexion
          </h1>
          <p style={{ color: 'var(--text-sub)', fontSize: 14 }}>
            Pas encore de compte ?{' '}
            <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              S'inscrire
            </Link>
          </p>
        </div>

        <div className="glass-card" style={{ padding: '32px' }}>
          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: 10, padding: '10px 14px',
                marginBottom: 20,
                color: '#F87171', fontSize: 13
              }}>
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
              <div>
                <label style={{
                  display: 'block', fontSize: 13, fontWeight: 600,
                  color: 'var(--text-secondary)', marginBottom: 6
                }}>
                  Nom d'utilisateur
                </label>
                <input
                  id="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="dark-input"
                  placeholder="Votre nom d'utilisateur"
                />
              </div>

              <div>
                <label style={{
                  display: 'block', fontSize: 13, fontWeight: 600,
                  color: 'var(--text-secondary)', marginBottom: 6
                }}>
                  Mot de passe
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="dark-input"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '13px' }}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4" />
                  Connexion en cours...
                </>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
