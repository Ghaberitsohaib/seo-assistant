import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import {
  FileText, TrendingUp, Clock, Bookmark, Loader2,
  Zap, ArrowRight, BarChart2, Star, Target, ChevronRight, Sparkles, ShieldCheck
} from 'lucide-react'

function ScoreBadge({ score }) {
  const cls = score >= 75 ? 'high' : score >= 50 ? 'mid' : 'low'
  return (
    <span className={`score-badge ${cls}`} style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
      {Math.round(score)}/100
    </span>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [recentAnalyses, setRecentAnalyses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      const [historyRes] = await Promise.all([
        api.get('/seo/history?page_size=5')
      ])

      const analyses = historyRes.data.analyses || []
      setRecentAnalyses(analyses)

      const totalAnalyses = historyRes.data.total || 0
      const avgScore = analyses.length > 0
        ? Math.round(analyses.reduce((acc, a) => acc + (a.seo_score || 0), 0) / analyses.length)
        : 0

      setStats({
        totalAnalyses,
        avgScore,
        bookmarked: analyses.filter(a => a.is_bookmarked).length
      })
    } catch (err) {
      console.error('Erreur:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <Loader2 className="h-10 w-10 animate-spin" style={{ color: 'var(--accent)' }} />
        <p style={{ color: 'var(--text-sub)', fontWeight: 500 }}>
          Chargement de votre tableau de bord...
        </p>
      </div>
    )
  }

  const avgScoreColor =
    (stats?.avgScore || 0) >= 75 ? 'var(--green)' :
    (stats?.avgScore || 0) >= 50 ? 'var(--yellow)' :
    'var(--red)'

  return (
    <div className="p-8 animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Page Header / Welcome Desk */}
      <div className="page-header mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 12px', borderRadius: 99,
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            fontSize: 11, fontWeight: 600,
            color: 'var(--accent)',
            letterSpacing: '0.8px',
            textTransform: 'uppercase',
            marginBottom: 12
          }}>
            <Sparkles className="h-3 w-3" />
            Système Sémantique Élite Actif
          </div>
          <h1 className="page-title text-4xl" style={{ fontFamily: '"Playfair Display", serif', color: 'var(--accent-light)', fontWeight: 700 }}>
            Bonjour,&nbsp;
            <span className="gradient-text">{user?.username}</span>
          </h1>
          <p className="page-subtitle text-sm" style={{ color: 'var(--text-sub)' }}>
            Voici un aperçu de vos performances et analyses sémantiques IA.
          </p>
        </div>
        <Link to="/analyze" className="btn-primary" style={{ padding: '12px 26px', borderRadius: 12, boxShadow: '0 4px 20px rgba(255,255,255,0.1)' }}>
          <Zap className="h-4 w-4" style={{ strokeWidth: 2.5 }} />
          Nouvelle Analyse
        </Link>
      </div>

      {/* Stat Cards (Sleek Handcrafted Medallions) */}
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        {/* Analyses card */}
        <div className="stat-card p-6" style={{ 
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.03), rgba(0, 0, 0, 0.4))', 
          border: '1px solid var(--border)',
          borderRadius: '20px'
        }}>
          <div>
            <p className="stat-card-label" style={{ letterSpacing: '1px', color: 'var(--text-muted)' }}>Analyses Effectuées</p>
            <div className="flex items-baseline gap-2">
              <p className="stat-card-value" style={{ color: 'var(--text-primary)', fontSize: 36 }}>{stats?.totalAnalyses || 0}</p>
              <span style={{ color: 'var(--green)', fontSize: 12, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                <TrendingUp className="h-3 w-3" /> Actif
              </span>
            </div>
          </div>
          <div className="stat-medallion" style={{ 
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.06) 0%, transparent 80%)',
            color: 'var(--accent)'
          }}>
            <BarChart2 className="h-5 w-5" />
          </div>
        </div>

        {/* Score Moyen card */}
        <div className="stat-card p-6" style={{ 
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.03), rgba(0, 0, 0, 0.4))', 
          border: '1px solid var(--border)',
          borderRadius: '20px'
        }}>
          <div>
            <p className="stat-card-label" style={{ letterSpacing: '1px', color: 'var(--text-muted)' }}>Score Moyen SEO</p>
            <div className="flex items-baseline gap-1">
              <p className="stat-card-value" style={{ color: avgScoreColor, fontSize: 36 }}>
                {stats?.avgScore || 0}
              </p>
              <span style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: 13 }}>/100</span>
            </div>
          </div>
          <div className="stat-medallion" style={{ 
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 80%)',
            color: 'var(--green)'
          }}>
            <Target className="h-5 w-5" />
          </div>
        </div>

        {/* Favoris card */}
        <div className="stat-card p-6" style={{ 
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.03), rgba(0, 0, 0, 0.4))', 
          border: '1px solid var(--border)',
          borderRadius: '20px'
        }}>
          <div>
            <p className="stat-card-label" style={{ letterSpacing: '1px', color: 'var(--text-muted)' }}>Rapports Favoris</p>
            <p className="stat-card-value" style={{ color: 'var(--text-primary)', fontSize: 36 }}>{stats?.bookmarked || 0}</p>
          </div>
          <div className="stat-medallion" style={{ 
            background: 'radial-gradient(circle, rgba(245, 158, 11, 0.1) 0%, transparent 80%)',
            color: 'var(--yellow)'
          }}>
            <Star className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Recent Analyses List */}
      <div className="glass-card mb-10 overflow-hidden" style={{ borderRadius: '20px', border: '1px solid var(--border)' }}>
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <h2 className="section-title text-base" style={{ fontFamily: '"Space Grotesk", sans-serif', color: 'var(--accent-light)', fontWeight: 600 }}>
            <Clock className="h-4.5 w-4.5" style={{ color: 'var(--accent)' }} />
            Analyses Récentes
          </h2>
          <Link
            to="/history"
            style={{
              color: 'var(--accent)',
              fontSize: 13,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              textDecoration: 'none',
              transition: 'color 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-light)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--accent)'}
          >
            Voir l'historique <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {recentAnalyses.length === 0 ? (
          <div style={{ padding: '64px 24px', textAlign: 'center' }}>
            <div style={{
              width: 72, height: 72,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              <FileText className="h-7 w-7" style={{ color: 'var(--accent)' }} />
            </div>
            <p style={{ fontWeight: 700, fontSize: 17, marginBottom: 8, color: 'var(--text-primary)' }}>
              Aucun rapport disponible
            </p>
            <p style={{ color: 'var(--text-sub)', fontSize: 14, marginBottom: 24, maxWidth: 360, margin: '0 auto 24px', lineHeight: 1.6 }}>
              Vous n'avez pas encore effectué d'analyse SEO. Commencez dès maintenant pour optimiser votre contenu.
            </p>
            <Link to="/analyze" className="btn-primary" style={{ display: 'inline-flex', padding: '12px 24px' }}>
              Lancer ma première analyse
            </Link>
          </div>
        ) : (
          <div style={{ background: 'rgba(3,7,18,0.2)' }}>
            {recentAnalyses.map((analysis) => (
              <Link
                key={analysis.id}
                to={`/analysis/${analysis.id}`}
                className="list-row"
                style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1, minWidth: 0 }}>
                  <div style={{
                    padding: '10px',
                    borderRadius: '10px',
                    background: analysis.content_type === 'url'
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(255, 255, 255, 0.05)',
                    border: analysis.content_type === 'url'
                      ? '1px solid rgba(255, 255, 255, 0.1)'
                      : '1px solid rgba(255, 255, 255, 0.1)',
                    flexShrink: 0
                  }}>
                    {analysis.content_type === 'url' ? (
                      <Zap className="h-4 w-4" style={{ color: 'var(--accent)' }} />
                    ) : (
                      <FileText className="h-4 w-4" style={{ color: '#999999' }} />
                    )}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: 14.5, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {analysis.title || 'Analyse sans titre'}
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        padding: '1px 7px',
                        borderRadius: '4px',
                        background: analysis.content_type === 'url'
                          ? 'rgba(255,255,255,0.06)'
                          : 'rgba(255,255,255,0.06)',
                        color: analysis.content_type === 'url' ? 'var(--accent)' : '#bbbbbb',
                        fontWeight: 700,
                        fontSize: 10,
                        letterSpacing: '0.5px',
                        textTransform: 'uppercase',
                        border: analysis.content_type === 'url'
                          ? '1px solid rgba(255,255,255,0.1)'
                          : '1px solid rgba(255,255,255,0.1)'
                      }}>
                        {analysis.content_type === 'url' ? 'URL' : 'TEXTE'}
                      </span>
                      •
                      <span>
                        {new Date(analysis.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </span>
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
                  {analysis.seo_score !== null && (
                    <ScoreBadge score={analysis.seo_score} />
                  )}
                  {analysis.is_bookmarked ? (
                    <Star className="h-4 w-4" style={{ color: 'var(--yellow)', fill: 'var(--yellow)' }} />
                  ) : (
                    <ChevronRight className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Bespoke CTA Banner */}
      <div className="cta-banner" style={{ 
        padding: '40px 44px', 
        borderRadius: '24px', 
        border: '1px solid rgba(255,255,255,0.1)',
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.01))'
      }}>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 600 }}>
          <h3 style={{ 
            fontFamily: '"Playfair Display", serif', 
            fontSize: '24px', 
            fontWeight: 700, 
            marginBottom: 12, 
            display: 'flex', 
            alignItems: 'center', 
            gap: 10,
            color: 'var(--accent-light)'
          }}>
            <Sparkles className="h-5.5 w-5.5" style={{ color: 'var(--accent)' }} />
            Prêt à optimiser un nouveau contenu ?
          </h3>
          <p style={{ color: 'var(--text-sub)', fontSize: 14.5, lineHeight: 1.8, marginBottom: 24 }}>
            Obtenez instantanément des recommandations SEO actionnables et laissez notre IA sémantique reformuler vos paragraphes pour un impact maximal sur les moteurs de recherche.
          </p>
          <Link to="/analyze" className="btn-primary" style={{ padding: '12px 28px', borderRadius: 12 }}>
            Commencer l'Analyse <ArrowRight className="h-4 w-4" style={{ strokeWidth: 2.5 }} />
          </Link>
        </div>
      </div>
    </div>
  )
}
