import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { Loader2, CheckCircle2, ArrowRight, Sparkles, AlertTriangle } from 'lucide-react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { refreshUser } = useAuth()
  const [status, setStatus] = useState('verifying') // verifying, success, error
  const [errorMsg, setErrorMsg] = useState('')
  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    if (!sessionId) {
      setStatus('error')
      setErrorMsg('ID de session de paiement introuvable.')
      return
    }

    const verifyPayment = async () => {
      try {
        const res = await api.post('/payment/verify-checkout-session', { session_id: sessionId })
        if (res.data.success) {
          await refreshUser()
          setStatus('success')
        } else {
          setStatus('error')
          setErrorMsg('La vérification du paiement a échoué.')
        }
      } catch (err) {
        console.error(err)
        setStatus('error')
        setErrorMsg(err.response?.data?.detail || 'Une erreur est survenue lors de la vérification du paiement.')
      }
    }

    verifyPayment()
  }, [sessionId, refreshUser])

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden" style={{ background: 'transparent' }}>
      {/* Background radial gradient */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 600, height: 600,
        background: 'radial-gradient(ellipse at center, rgba(127,119,221,0.08) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0
      }} />

      <div className="glass-card max-w-md w-full p-8 text-center relative z-10 animate-fade-in" style={{ border: '1px solid rgba(127, 119, 221, 0.22)' }}>
        {status === 'verifying' && (
          <div className="flex flex-col items-center py-6">
            <Loader2 className="h-12 w-12 animate-spin mb-4" style={{ color: 'var(--accent)' }} />
            <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: '"Space Grotesk", sans-serif', color: 'var(--accent-light)' }}>Vérification du paiement...</h2>
            <p className="text-sm" style={{ color: 'var(--text-sub)' }}>Veuillez patienter pendant que nous validons votre transaction auprès de Stripe.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center py-4">
            <div className="p-3 rounded-full mb-5 shadow-lg relative" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              <CheckCircle2 className="h-14 w-14 text-green-400" />
              <div className="absolute -right-1 -top-1">
                <Sparkles className="h-5 w-5 animate-pulse text-amber-400" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold mb-3" style={{ fontFamily: '"Playfair Display", serif', color: 'var(--accent-light)' }}>
              Achat Réussi !
            </h2>
            <p className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--accent)' }}>
              Jetons Crédités
            </p>
            <p className="text-sm leading-relaxed mb-8" style={{ color: 'var(--text-sub)' }}>
              Votre paiement a été traité avec succès. Les jetons correspondants ont été crédités sur votre compte et sont prêts à être utilisés.
            </p>

            <Link to="/analyze" className="btn-primary w-full py-3.5 justify-center rounded-xl flex items-center gap-2">
              Lancer une Analyse SEO
              <ArrowRight className="h-4.5 w-4.5" />
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center py-4">
            <div className="p-3 rounded-full mb-5" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              <AlertTriangle className="h-14 w-14 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold mb-3" style={{ fontFamily: '"Space Grotesk", sans-serif', color: 'var(--accent-light)' }}>Vérification échouée</h2>
            <p className="text-sm leading-relaxed mb-8" style={{ color: 'var(--text-sub)' }}>
              {errorMsg}
            </p>

            <Link to="/analyze" className="btn-ghost w-full py-3.5 justify-center rounded-xl">
              Retourner à l'application
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
