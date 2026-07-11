import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import {
  Loader2, Search, Bookmark, Trash2,
  ChevronLeft, ChevronRight, FileText, Link as LinkIcon
} from 'lucide-react'

function ScoreBadge({ score }) {
  const cls = score >= 75 ? 'high' : score >= 50 ? 'mid' : 'low'
  return <span className={`score-badge ${cls}`}>{Math.round(score)}/100</span>
}

export default function History() {
  const [analyses, setAnalyses] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadHistory()
  }, [page, filter])

  const loadHistory = async () => {
    setLoading(true)
    try {
      const bookmarkedOnly = filter === 'bookmarked'
      const res = await api.get(`/seo/history?page=${page}&page_size=10&bookmarked_only=${bookmarkedOnly}`)
      setAnalyses(res.data.analyses || [])
      setTotalPages(Math.ceil(res.data.total / 10) || 1)
    } catch (err) {
      console.error('Erreur:', err)
    } finally {
      setLoading(false)
    }
  }

  const toggleBookmark = async (id, currentState) => {
    try {
      await api.patch(`/seo/analysis/${id}/bookmark`, { is_bookmarked: !currentState })
      setAnalyses(analyses.map(a =>
        a.id === id ? { ...a, is_bookmarked: !currentState } : a
      ))
    } catch (err) {
      console.error('Erreur:', err)
    }
  }

  const deleteAnalysis = async (id) => {
    if (!confirm('Voulez-vous vraiment supprimer cette analyse ?')) return
    try {
      await api.delete(`/seo/analysis/${id}`)
      setAnalyses(analyses.filter(a => a.id !== id))
    } catch (err) {
      console.error('Erreur:', err)
    }
  }

  const filteredAnalyses = analyses.filter(a =>
    !searchTerm ||
    (a.title && a.title.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="p-8 animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Historique des Analyses</h1>
          <p className="page-subtitle">Consultez et gérez vos analyses SEO passées</p>
        </div>
      </div>

      {/* Card */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        {/* Toolbar */}
        <div style={{
          padding: '14px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap'
        }}>
          {/* Filter buttons */}
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => setFilter('all')}
              style={{
                padding: '7px 14px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                border: '1px solid',
                cursor: 'pointer',
                transition: 'all 0.15s',
                background: filter === 'all' ? 'rgba(127,119,221,0.15)' : 'transparent',
                borderColor: filter === 'all' ? 'rgba(127,119,221,0.4)' : 'var(--border)',
                color: filter === 'all' ? 'var(--accent-light)' : 'var(--text-sub)'
              }}
            >
              Toutes
            </button>
            <button
              onClick={() => setFilter('bookmarked')}
              style={{
                padding: '7px 14px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                border: '1px solid',
                cursor: 'pointer',
                transition: 'all 0.15s',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: filter === 'bookmarked' ? 'rgba(245,158,11,0.12)' : 'transparent',
                borderColor: filter === 'bookmarked' ? 'rgba(245,158,11,0.35)' : 'var(--border)',
                color: filter === 'bookmarked' ? '#FBB224' : 'var(--text-secondary)'
              }}
            >
              <Bookmark className="h-3.5 w-3.5" />
              Favoris
            </button>
          </div>

          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search
              className="h-4 w-4"
              style={{
                position: 'absolute', left: 12,
                top: '50%', transform: 'translateY(-50%)',
                color: 'var(--text-muted)', pointerEvents: 'none'
              }}
            />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="dark-input"
              style={{ paddingLeft: 36, width: 220 }}
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ padding: 48, display: 'flex', justifyContent: 'center' }}>
            <Loader2 className="h-7 w-7 animate-spin" style={{ color: 'var(--accent)' }} />
          </div>
        ) : filteredAnalyses.length === 0 ? (
          <div style={{ padding: '56px 24px', textAlign: 'center' }}>
            <FileText className="h-12 w-12 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
            <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>
              {filter === 'bookmarked' ? 'Aucun favori' : 'Aucune analyse'}
            </p>
            {filter === 'all' && (
              <Link to="/analyze" className="btn-primary" style={{ display: 'inline-flex' }}>
                Créer une analyse
              </Link>
            )}
          </div>
        ) : (
          <>
            <div>
              {filteredAnalyses.map((analysis) => (
                <div
                  key={analysis.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 20px',
                    borderBottom: '1px solid var(--border)',
                    transition: 'background 0.15s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <Link
                    to={`/analysis/${analysis.id}`}
                    style={{ flex: 1, minWidth: 0, textDecoration: 'none', color: 'inherit' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {analysis.content_type === 'url' ? (
                        <LinkIcon className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                      ) : (
                        <FileText className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                      )}
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {analysis.title || 'Sans titre'}
                        </p>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                          {analysis.content_type === 'url' ? 'URL' : 'Texte'} •{' '}
                          {new Date(analysis.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                  </Link>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 16, flexShrink: 0 }}>
                    {analysis.seo_score !== null && (
                      <ScoreBadge score={analysis.seo_score} />
                    )}

                    <button
                      onClick={() => toggleBookmark(analysis.id, analysis.is_bookmarked)}
                      style={{
                        padding: '6px',
                        borderRadius: 8,
                        border: 'none',
                        cursor: 'pointer',
                        background: analysis.is_bookmarked ? 'rgba(245,158,11,0.12)' : 'transparent',
                        color: analysis.is_bookmarked ? 'var(--yellow)' : 'var(--text-muted)',
                        transition: 'all 0.15s'
                      }}
                    >
                      <Bookmark
                        className="h-4 w-4"
                        style={{ fill: analysis.is_bookmarked ? 'var(--yellow)' : 'none' }}
                      />
                    </button>

                    <button
                      onClick={() => deleteAnalysis(analysis.id)}
                      style={{
                        padding: '6px',
                        borderRadius: 8,
                        border: 'none',
                        cursor: 'pointer',
                        background: 'transparent',
                        color: 'var(--text-muted)',
                        transition: 'all 0.15s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div style={{
                padding: '14px 20px',
                borderTop: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="btn-ghost"
                  style={{ padding: '7px 10px' }}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  Page {page} sur {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="btn-ghost"
                  style={{ padding: '7px 10px' }}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
