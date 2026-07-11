import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Loader2, AlertCircle, CheckCircle, Sparkles } from 'lucide-react'

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      return
    }

    setLoading(true)

    try {
      await register(formData.username, formData.email, formData.password, formData.fullName)
      setSuccess(true)
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(err.response?.data?.detail || "Erreur lors de l'inscription")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'transparent', padding: 24
      }}>
        <div className="glass-card" style={{ padding: 48, textAlign: 'center', maxWidth: 400 }}>
          <div style={{
            width: 72, height: 72,
            background: 'rgba(16,185,129,0.15)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
            border: '1px solid rgba(16,185,129,0.3)'
          }}>
            <CheckCircle className="h-9 w-9" style={{ color: 'var(--green)' }} />
          </div>
          <h3 style={{ fontFamily: '"Playfair Display", serif', fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
            Compte créé avec succès !
          </h3>
          <p style={{ color: 'var(--text-sub)', fontSize: 14 }}>
            Redirection vers la page de connexion...
          </p>
        </div>
      </div>
    )
  }

  const labelStyle = {
    display: 'block', fontSize: 13, fontWeight: 600,
    color: 'var(--text-sub)', marginBottom: 6
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
        position: 'absolute', top: '15%', left: '50%',
        transform: 'translateX(-50%)',
        width: 500, height: 300,
        background: 'radial-gradient(ellipse, rgba(127,119,221,0.1) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <div style={{ width: '100%', maxWidth: 460, position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <img 
              src={`${import.meta.env.BASE_URL}logo.png?v=2`} 
              alt="SEO Logo" 
              className="h-16 w-auto object-contain" 
              style={{ margin: '0 auto' }} 
            />
          </div>
          <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: 32, fontWeight: 700, marginBottom: 8 }}>
            Créer un compte
          </h1>
          <p style={{ color: 'var(--text-sub)', fontSize: 14 }}>
            Déjà inscrit ?{' '}
            <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Se connecter
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
              <div>
                <label htmlFor="username" style={labelStyle}>
                  Nom d'utilisateur *
                </label>
                <input
                  id="username" name="username" type="text" required
                  value={formData.username} onChange={handleChange}
                  className="dark-input" placeholder="votre_nom"
                />
              </div>

              <div>
                <label htmlFor="fullName" style={labelStyle}>Nom complet</label>
                <input
                  id="fullName" name="fullName" type="text"
                  value={formData.fullName} onChange={handleChange}
                  className="dark-input" placeholder="Votre nom"
                />
              </div>

              <div>
                <label htmlFor="email" style={labelStyle}>Email *</label>
                <input
                  id="email" name="email" type="email" required
                  value={formData.email} onChange={handleChange}
                  className="dark-input" placeholder="vous@exemple.com"
                />
              </div>

              <div>
                <label htmlFor="password" style={labelStyle}>Mot de passe *</label>
                <input
                  id="password" name="password" type="password" required
                  value={formData.password} onChange={handleChange}
                  className="dark-input" placeholder="••••••••"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" style={labelStyle}>
                  Confirmer le mot de passe *
                </label>
                <input
                  id="confirmPassword" name="confirmPassword" type="password" required
                  value={formData.confirmPassword} onChange={handleChange}
                  className="dark-input" placeholder="••••••••"
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
                  Inscription en cours...
                </>
              ) : (
                'Créer mon compte'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
