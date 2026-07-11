import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Coins, Check, Loader2, Sparkles, Zap, ArrowLeft } from 'lucide-react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Pricing() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loadingPlan, setLoadingPlan] = useState(null)
  const [error, setError] = useState('')

  const handlePurchase = async (planId) => {
    setLoadingPlan(planId)
    setError('')
    try {
      const res = await api.post('/payment/create-checkout-session', { plan_id: planId })
      if (res.data.url) {
        window.location.href = res.data.url
      } else {
        setError("Impossible de rediriger vers Stripe. Veuillez réessayer.")
        setLoadingPlan(null)
      }
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.detail || "Une erreur est survenue lors de la connexion à Stripe.")
      setLoadingPlan(null)
    }
  }

  const plans = [
    {
      id: '1_token',
      name: 'Essai Unique',
      tokens: 1,
      price: '5$',
      description: 'Idéal pour tester les capacités de notre IA sur une page ou un texte.',
      features: [
        '1 Analyse SEO complète (Texte ou URL)',
        'Score de lisibilité détaillé',
        'Densité de mots-clés',
        'Suggestions de métadonnées IA',
        'Assistant de rédaction IA'
      ],
      popular: false,
      color: 'var(--text-muted)'
    },
    {
      id: '3_tokens',
      name: 'Pack Recommandé',
      tokens: 3,
      price: '10$',
      description: 'Le meilleur choix pour optimiser un ensemble de contenus clés.',
      features: [
        '3 Analyses SEO complètes',
        'Score de lisibilité détaillé',
        'Densité de mots-clés',
        'Suggestions de métadonnées IA',
        'Assistant de rédaction IA',
        'Sauvegarde dans l\'historique'
      ],
      popular: true,
      color: 'var(--accent)'
    },
    {
      id: '10_tokens',
      name: 'Pack Professionnel',
      tokens: 10,
      price: '20$',
      description: 'Conçu pour les créateurs de contenu réguliers et agences.',
      features: [
        '10 Analyses SEO complètes',
        'Score de lisibilité détaillé',
        'Densité de mots-clés',
        'Suggestions de métadonnées IA',
        'Assistant de rédaction IA',
        'Sauvegarde dans l\'historique',
        'Support client prioritaire'
      ],
      popular: false,
      color: 'var(--accent-cyan)'
    }
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <button 
            onClick={() => navigate('/analyze')}
            className="btn-ghost px-4 py-2 flex items-center gap-2 mb-4 text-xs font-semibold"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux analyses
          </button>
          <h1 className="text-3xl font-extrabold tracking-tight" style={{ fontFamily: '"Playfair Display", serif', color: 'var(--accent-light)' }}>
            Acheter des Jetons
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-sub)' }}>
            Choisissez l'offre qui vous convient. Pas d'abonnement, payez uniquement ce que vous utilisez.
          </p>
        </div>
        
        {user && (
          <div className="glass-card px-5 py-3 flex items-center gap-3" style={{ border: '1px solid rgba(127, 119, 221, 0.2)' }}>
            <div className="p-2 rounded-lg" style={{ background: 'rgba(127, 119, 221, 0.08)' }}>
              <Coins className="h-5 w-5" style={{ color: 'var(--accent)' }} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider" style={{ color: 'var(--text-muted)' }}>Votre Solde actuel</p>
              <p className="text-lg font-extrabold" style={{ color: 'var(--text-primary)' }}>{user.role === 'admin' ? 'Illimité' : `${user.credits ?? 0} Jetons`}</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl border mb-8 text-sm text-red-400 bg-red-500/5 border-red-500/20">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch mt-6">
        {plans.map((plan, index) => {
          const cardClass = `card-${index + 1}`
          return (
            <div 
              key={plan.id} 
              className={`glass-card flex flex-col justify-between p-8 relative overflow-hidden transition-all ${cardClass}`}
              style={{ 
                border: plan.popular ? '2px solid var(--accent)' : '1px solid var(--border)',
                boxShadow: plan.popular ? '0 20px 45px rgba(127, 119, 221, 0.15)' : 'none',
                transform: plan.popular ? 'scale(1.02)' : 'none'
              }}
            >
              {plan.popular && (
                <div 
                  className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1"
                  style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-cyan))', color: '#030712' }}
                >
                  <Sparkles className="h-3 w-3" />
                  Populaire
                </div>
              )}

              <div>
                <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--accent-light)', fontFamily: '"Space Grotesk", sans-serif' }}>
                  {plan.name}
                </h3>
                
                <p className="text-xs mb-6 min-h-[40px]" style={{ color: 'var(--text-sub)' }}>
                  {plan.description}
                </p>

                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-5xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
                    {plan.price}
                  </span>
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    / {plan.tokens} {plan.tokens === 1 ? 'jeton' : 'jetons'}
                  </span>
                </div>

                <div className="w-full border-t mb-6" style={{ borderColor: 'var(--border)' }}></div>

                <ul className="space-y-3.5 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm" style={{ color: 'var(--text-primary)' }}>
                      <Check className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => handlePurchase(plan.id)}
                disabled={loadingPlan !== null}
                className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 text-sm transition-all ${
                  plan.popular ? 'btn-primary' : 'btn-ghost'
                }`}
                style={plan.popular ? { borderRadius: '12px' } : { borderRadius: '12px', border: '1px solid var(--border)' }}
              >
                {loadingPlan === plan.id ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Connexion Stripe...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    Acheter {plan.tokens} {plan.tokens === 1 ? 'Jeton' : 'Jetons'}
                  </>
                )}
              </button>
            </div>
          )
        })}
      </div>
      
      <div className="mt-12 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
        <p>Les paiements sont sécurisés par Stripe. Les crédits achetés n'expirent jamais.</p>
      </div>
    </div>
  )
}
