import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import {
  Users, BarChart2, Target, Zap, FileText, Search, Star, Trash2,
  ArrowLeft, ArrowRight, ShieldAlert, ShieldCheck, Loader2,
  ChevronRight, ChevronLeft, Calendar, Mail, CheckCircle2, AlertTriangle, Shield
} from 'lucide-react'

function ScoreBadge({ score }) {
  const cls = score >= 75 ? 'high' : score >= 50 ? 'mid' : 'low'
  return (
    <span className={`score-badge ${cls}`} style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
      {Math.round(score)}/100
    </span>
  )
}

export default function Clients() {
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [analyses, setAnalyses] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [analysisSearchTerm, setAnalysisSearchTerm] = useState('')
  const [analysesPage, setAnalysesPage] = useState(1)
  const [analysesPerPage] = useState(5)
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [statsRes, usersRes, analysesRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/analyses?page_size=1000') // fetch large list to filter client side for specific users
      ])

      setStats(statsRes.data)
      setUsers(usersRes.data)
      setAnalyses(analysesRes.data)
    } catch (err) {
      console.error('Erreur lors du chargement des données admin:', err)
    } finally {
      setLoading(false)
    }
  }

  // Toggle user active status
  const toggleUserActive = async (userId, currentStatus) => {
    setActionLoading(`active-${userId}`)
    try {
      await api.patch(`/admin/users/${userId}/toggle-active`)
      setUsers(users.map(u => u.id === userId ? { ...u, is_active: !currentStatus } : u))
      // Reload stats
      const statsRes = await api.get('/admin/stats')
      setStats(statsRes.data)
    } catch (err) {
      alert(err.response?.data?.detail || "Erreur lors de la modification de l'activation.")
    } finally {
      setActionLoading(null)
    }
  }

  // Toggle user role between user and admin
  const toggleUserRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin'
    if (!confirm(`Voulez-vous vraiment changer le rôle de cet utilisateur en ${newRole.toUpperCase()} ?`)) return

    setActionLoading(`role-${userId}`)
    try {
      await api.patch(`/admin/users/${userId}/role?new_role=${newRole}`)
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u))
    } catch (err) {
      alert(err.response?.data?.detail || "Erreur lors du changement de rôle.")
    } finally {
      setActionLoading(null)
    }
  }

  // Delete user analysis
  const deleteUserAnalysis = async (analysisId) => {
    if (!confirm("Voulez-vous vraiment supprimer cette analyse ? Cette action est irréversible.")) return

    try {
      await api.delete(`/admin/analyses/${analysisId}`)
      setAnalyses(analyses.filter(a => a.id !== analysisId))
    } catch (err) {
      alert("Erreur lors de la suppression de l'analyse.")
    }
  }

  // Filter clients/users
  const filteredUsers = users.filter(u =>
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.full_name && u.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // Get specific selected user data
  const selectedUserAnalyses = selectedUser
    ? analyses.filter(a => a.user.id === selectedUser.id)
    : []

  const selectedUserFilteredAnalyses = selectedUserAnalyses.filter(a =>
    a.title.toLowerCase().includes(analysisSearchTerm.toLowerCase())
  )

  // Pagination for selected user analyses
  const indexOfLastAnalysis = analysesPage * analysesPerPage
  const indexOfFirstAnalysis = indexOfLastAnalysis - analysesPerPage
  const currentAnalyses = selectedUserFilteredAnalyses.slice(indexOfFirstAnalysis, indexOfLastAnalysis)
  const totalAnalysesPages = Math.ceil(selectedUserFilteredAnalyses.length / analysesPerPage) || 1

  // Selected User Specific stats
  const selectedUserStats = selectedUser ? {
    total: selectedUserAnalyses.length,
    avgScore: selectedUserAnalyses.length > 0
      ? Math.round(selectedUserAnalyses.reduce((acc, a) => acc + (a.seo_score || 0), 0) / selectedUserAnalyses.length)
      : 0,
    textCount: selectedUserAnalyses.filter(a => a.content_type === 'text').length,
    urlCount: selectedUserAnalyses.filter(a => a.content_type === 'url').length
  } : null

  if (loading) {
    return (
      <div className="loading-screen">
        <Loader2 className="h-10 w-10 animate-spin" style={{ color: 'var(--accent)' }} />
        <p style={{ color: 'var(--text-sub)', fontWeight: 500 }}>
          Chargement de l'espace administration...
        </p>
      </div>
    )
  }

  return (
    <div className="p-8 animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Drill-down User View */}
      {selectedUser ? (
        <div className="space-y-8">
          {/* Back button & Page title */}
          <div className="flex items-center justify-between">
            <button 
              onClick={() => { setSelectedUser(null); setAnalysisSearchTerm(''); setAnalysesPage(1); }}
              className="btn-ghost"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px' }}
            >
              <ArrowLeft className="h-4 w-4" /> Retour aux clients
            </button>
            
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '4px 12px', borderRadius: 99,
              background: 'rgba(127, 119, 221, 0.04)',
              border: '1px solid rgba(127, 119, 221, 0.15)',
              fontSize: 11, fontWeight: 600,
              color: 'var(--accent)',
              letterSpacing: '0.8px',
              textTransform: 'uppercase'
            }}>
              <Shield className="h-3 w-3" /> Espace Inspection Admin
            </div>
          </div>

          <div className="page-header flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="page-title text-4xl" style={{ fontFamily: '"Playfair Display", serif', color: 'var(--accent-light)', fontWeight: 700 }}>
                Espace Client : <span className="gradient-text">{selectedUser.username}</span>
              </h1>
              <p className="page-subtitle text-sm mt-1" style={{ color: 'var(--text-sub)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Mail className="h-3.5 w-3.5" /> {selectedUser.email}
                <span>•</span>
                <Calendar className="h-3.5 w-3.5" /> Inscrit le {new Date(selectedUser.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => toggleUserActive(selectedUser.id, selectedUser.is_active)}
                disabled={actionLoading !== null}
                className="btn-ghost"
                style={{
                  padding: '10px 18px',
                  borderRadius: 12,
                  borderColor: selectedUser.is_active ? 'var(--red)' : 'var(--green)',
                  color: selectedUser.is_active ? 'var(--red)' : 'var(--green)',
                  background: selectedUser.is_active ? 'rgba(239, 68, 68, 0.05)' : 'rgba(16, 185, 129, 0.05)'
                }}
              >
                {actionLoading === `active-${selectedUser.id}` ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : selectedUser.is_active ? 'Suspendre le client' : 'Activer le client'}
              </button>
            </div>
          </div>

          {/* Individual Client Stats Medallions */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Analyses Card */}
            <div className="stat-card p-6" style={{ 
              background: 'linear-gradient(135deg, rgba(127, 119, 221, 0.05), rgba(15, 23, 42, 0.4))', 
              border: '1px solid var(--border)',
              borderRadius: '20px'
            }}>
              <div>
                <p className="stat-card-label" style={{ letterSpacing: '1px', color: 'var(--text-muted)' }}>Analyses du client</p>
                <p className="stat-card-value" style={{ color: 'var(--text-primary)', fontSize: 36 }}>{selectedUserStats.total}</p>
              </div>
              <div className="stat-medallion" style={{ 
                background: 'radial-gradient(circle, rgba(127, 119, 221, 0.12) 0%, transparent 80%)',
                color: 'var(--accent)'
              }}>
                <BarChart2 className="h-5 w-5" />
              </div>
            </div>

            {/* Score Moyen Card */}
            <div className="stat-card p-6" style={{ 
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.03), rgba(15, 23, 42, 0.4))', 
              border: '1px solid var(--border)',
              borderRadius: '20px'
            }}>
              <div>
                <p className="stat-card-label" style={{ letterSpacing: '1px', color: 'var(--text-muted)' }}>Score SEO Moyen</p>
                <div className="flex items-baseline gap-1">
                  <p className="stat-card-value" style={{ 
                    color: selectedUserStats.avgScore >= 75 ? 'var(--green)' : selectedUserStats.avgScore >= 50 ? 'var(--yellow)' : 'var(--red)', 
                    fontSize: 36 
                  }}>
                    {selectedUserStats.avgScore}
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

            {/* Content Breakdown Card */}
            <div className="stat-card p-6" style={{ 
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.03), rgba(15, 23, 42, 0.4))', 
              border: '1px solid var(--border)',
              borderRadius: '20px'
            }}>
              <div>
                <p className="stat-card-label" style={{ letterSpacing: '1px', color: 'var(--text-muted)' }}>Type de Contenu</p>
                <p style={{ color: 'var(--text-primary)', fontSize: 14, fontWeight: 600, marginTop: 4 }}>
                  {selectedUserStats.urlCount} URL{selectedUserStats.urlCount > 1 ? 's' : ''} • {selectedUserStats.textCount} Texte{selectedUserStats.textCount > 1 ? 's' : ''}
                </p>
              </div>
              <div className="stat-medallion" style={{ 
                background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 80%)',
                color: '#A78BFA'
              }}>
                <Zap className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Client's Analyses List (The "Page Client" data) */}
          <div className="glass-card overflow-hidden" style={{ borderRadius: '20px', border: '1px solid var(--border)' }}>
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 12,
              flexWrap: 'wrap'
            }}>
              <h2 className="section-title text-base" style={{ fontFamily: '"Space Grotesk", sans-serif', color: 'var(--accent-light)', fontWeight: 600 }}>
                <FileText className="h-4.5 w-4.5" style={{ color: 'var(--accent)' }} />
                Rapports et analyses du client
              </h2>
              
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
                  placeholder="Rechercher une analyse..."
                  value={analysisSearchTerm}
                  onChange={(e) => { setAnalysisSearchTerm(e.target.value); setAnalysesPage(1); }}
                  className="dark-input"
                  style={{ paddingLeft: 36, width: 250 }}
                />
              </div>
            </div>

            {currentAnalyses.length === 0 ? (
              <div style={{ padding: '64px 24px', textAlign: 'center' }}>
                <FileText className="h-12 w-12 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
                <p style={{ color: 'var(--text-sub)', fontSize: 15 }}>
                  Aucun rapport disponible pour ce client ou ne correspond à la recherche.
                </p>
              </div>
            ) : (
              <div>
                {currentAnalyses.map((analysis) => (
                  <div
                    key={analysis.id}
                    className="list-row"
                    style={{ padding: '16px 24px', borderBottom: '1px solid rgba(127, 119, 221, 0.04)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                  >
                    <Link
                      to={`/analysis/${analysis.id}`}
                      style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1, minWidth: 0, textDecoration: 'none', color: 'inherit' }}
                    >
                      <div style={{
                        padding: '10px',
                        borderRadius: '10px',
                        background: analysis.content_type === 'url' ? 'rgba(127, 119, 221, 0.06)' : 'rgba(139, 92, 246, 0.06)',
                        border: analysis.content_type === 'url' ? '1px solid rgba(127, 119, 221, 0.15)' : '1px solid rgba(139, 92, 246, 0.15)',
                        flexShrink: 0
                      }}>
                        {analysis.content_type === 'url' ? <Zap className="h-4 w-4" style={{ color: 'var(--accent)' }} /> : <FileText className="h-4 w-4" style={{ color: '#A78BFA' }} />}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontWeight: 600, fontSize: 14.5, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {analysis.title || 'Analyse sans titre'}
                        </p>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                          {analysis.content_type === 'url' ? 'URL' : 'TEXTE'} • {new Date(analysis.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </Link>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      {analysis.seo_score !== null && <ScoreBadge score={analysis.seo_score} />}
                      
                      <button
                        onClick={() => deleteUserAnalysis(analysis.id)}
                        className="btn-ghost"
                        style={{ padding: '6px', color: 'var(--text-muted)', borderColor: 'transparent', background: 'transparent' }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                        title="Supprimer le rapport"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {totalAnalysesPages > 1 && (
              <div style={{
                padding: '14px 20px',
                borderTop: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <button
                  onClick={() => setAnalysesPage(Math.max(1, analysesPage - 1))}
                  disabled={analysesPage === 1}
                  className="btn-ghost"
                  style={{ padding: '7px 10px' }}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span style={{ fontSize: 13, color: 'var(--text-sub)' }}>
                  Page {analysesPage} sur {totalAnalysesPages}
                </span>
                <button
                  onClick={() => setAnalysesPage(Math.min(totalAnalysesPages, analysesPage + 1))}
                  disabled={analysesPage === totalAnalysesPages}
                  className="btn-ghost"
                  style={{ padding: '7px 10px' }}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        // Main Admin Dashboard & Clients List View
        <div className="space-y-10">
          
          {/* Header */}
          <div className="page-header flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '4px 12px', borderRadius: 99,
                background: 'rgba(127, 119, 221, 0.04)',
                border: '1px solid rgba(127, 119, 221, 0.15)',
                fontSize: 11, fontWeight: 600,
                color: 'var(--accent)',
                letterSpacing: '0.8px',
                textTransform: 'uppercase',
                marginBottom: 12
              }}>
                <Shield className="h-3 w-3" /> Console d'administration
              </div>
              <h1 className="page-title text-4xl" style={{ fontFamily: '"Playfair Display", serif', color: 'var(--accent-light)', fontWeight: 700 }}>
                Gestion de la <span className="gradient-text">Clientèle</span>
              </h1>
              <p className="page-subtitle text-sm" style={{ color: 'var(--text-sub)' }}>
                Pilotez et analysez les performances de vos clients en temps réel.
              </p>
            </div>
            <button
              onClick={loadData}
              className="btn-ghost"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 12 }}
            >
              <Loader2 className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} style={{ color: 'var(--accent)' }} />
              Rafraîchir les données
            </button>
          </div>

          {/* Admin Stats Panel (Bespoke Bespoke Purple Medallions) */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Total Users Card */}
            <div className="stat-card p-6" style={{ 
              background: 'linear-gradient(135deg, rgba(127, 119, 221, 0.05), rgba(15, 23, 42, 0.4))', 
              border: '1px solid var(--border)',
              borderRadius: '20px'
            }}>
              <div>
                <p className="stat-card-label" style={{ letterSpacing: '1px', color: 'var(--text-muted)' }}>Clients Inscrits</p>
                <p className="stat-card-value" style={{ color: 'var(--text-primary)', fontSize: 36 }}>{stats?.total_users || 0}</p>
              </div>
              <div className="stat-medallion" style={{ 
                background: 'radial-gradient(circle, rgba(127, 119, 221, 0.12) 0%, transparent 80%)',
                color: 'var(--accent)'
              }}>
                <Users className="h-5 w-5" />
              </div>
            </div>

            {/* Total Analyses Card */}
            <div className="stat-card p-6" style={{ 
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.03), rgba(15, 23, 42, 0.4))', 
              border: '1px solid var(--border)',
              borderRadius: '20px'
            }}>
              <div>
                <p className="stat-card-label" style={{ letterSpacing: '1px', color: 'var(--text-muted)' }}>Analyses Totales</p>
                <p className="stat-card-value" style={{ color: 'var(--text-primary)', fontSize: 36 }}>{stats?.total_analyses || 0}</p>
              </div>
              <div className="stat-medallion" style={{ 
                background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 80%)',
                color: 'var(--green)'
              }}>
                <BarChart2 className="h-5 w-5" />
              </div>
            </div>

            {/* SEO Average Score Card */}
            <div className="stat-card p-6" style={{ 
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.03), rgba(15, 23, 42, 0.4))', 
              border: '1px solid var(--border)',
              borderRadius: '20px'
            }}>
              <div>
                <p className="stat-card-label" style={{ letterSpacing: '1px', color: 'var(--text-muted)' }}>Score SEO Général</p>
                <div className="flex items-baseline gap-1">
                  <p className="stat-card-value" style={{ 
                    color: (stats?.average_seo_score || 0) >= 75 ? 'var(--green)' : (stats?.average_seo_score || 0) >= 50 ? 'var(--yellow)' : 'var(--red)', 
                    fontSize: 36 
                  }}>
                    {stats?.average_seo_score || 0}
                  </p>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: 13 }}>/100</span>
                </div>
              </div>
              <div className="stat-medallion" style={{ 
                background: 'radial-gradient(circle, rgba(245, 158, 11, 0.1) 0%, transparent 80%)',
                color: 'var(--yellow)'
              }}>
                <Target className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Breakdown progress bar */}
          {stats?.breakdown && (
            <div className="glass-card p-6" style={{ borderRadius: '20px', border: '1px solid var(--border)' }}>
              <div className="flex justify-between items-center mb-3">
                <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>
                  Répartition des analyses : {stats.breakdown.url} URL ({Math.round(stats.breakdown.url / (stats.total_analyses || 1) * 100)}%) vs {stats.breakdown.text} TEXTE ({Math.round(stats.breakdown.text / (stats.total_analyses || 1) * 100)}%)
                </span>
                <span className="tag">Breakdown</span>
              </div>
              <div className="progress-bar-track">
                <div 
                  className="progress-bar-fill" 
                  style={{ width: `${(stats.breakdown.url / (stats.total_analyses || 1)) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Clients List Panel */}
          <div className="glass-card overflow-hidden" style={{ borderRadius: '20px', border: '1px solid var(--border)' }}>
            
            {/* Toolbar */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 12,
              flexWrap: 'wrap'
            }}>
              <h2 className="section-title text-base" style={{ fontFamily: '"Space Grotesk", sans-serif', color: 'var(--accent-light)', fontWeight: 600 }}>
                <Users className="h-4.5 w-4.5" style={{ color: 'var(--accent)' }} />
                Liste des clients
              </h2>
              
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
                  placeholder="Rechercher par nom, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="dark-input"
                  style={{ paddingLeft: 36, width: 280 }}
                />
              </div>
            </div>

            {/* Table */}
            {filteredUsers.length === 0 ? (
              <div style={{ padding: '64px 24px', textAlign: 'center' }}>
                <Users className="h-12 w-12 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
                <p style={{ color: 'var(--text-sub)', fontSize: 15 }}>
                  Aucun client ne correspond à votre recherche.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255, 255, 255, 0.01)' }}>
                      <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Client</th>
                      <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Inscrit le</th>
                      <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Rôle</th>
                      <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Statut</th>
                      <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((userObj) => {
                      const userInitials = userObj.username.slice(0, 2).toUpperCase()
                      return (
                        <tr 
                          key={userObj.id} 
                          style={{ borderBottom: '1px solid rgba(127, 119, 221, 0.04)', transition: 'background 0.2s' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.01)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          {/* Client details */}
                          <td style={{ padding: '16px 24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <div style={{
                                width: 34, height: 34, borderRadius: '50%',
                                background: userObj.role === 'admin' 
                                  ? 'linear-gradient(135deg, var(--accent), var(--accent-cyan))' 
                                  : 'linear-gradient(135deg, #4F46E5, #818CF8)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 12, fontWeight: 700, color: '#030712',
                                boxShadow: userObj.role === 'admin' ? '0 0 10px rgba(127, 119, 221, 0.25)' : 'none'
                              }}>
                                {userInitials}
                              </div>
                              <div>
                                <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{userObj.username}</p>
                                <p style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{userObj.email}</p>
                              </div>
                            </div>
                          </td>

                          {/* Joined Date */}
                          <td style={{ padding: '16px 24px', fontSize: 13.5, color: 'var(--text-sub)' }}>
                            {new Date(userObj.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>

                          {/* Role with Toggle */}
                          <td style={{ padding: '16px 24px' }}>
                            <button
                              onClick={() => toggleUserRole(userObj.id, userObj.role)}
                              disabled={actionLoading !== null}
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                padding: '4px 10px', borderRadius: 8,
                                fontSize: 11, fontWeight: 700,
                                border: '1px solid',
                                cursor: 'pointer',
                                background: userObj.role === 'admin' ? 'rgba(127, 119, 221, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                                borderColor: userObj.role === 'admin' ? 'rgba(127, 119, 221, 0.25)' : 'var(--border)',
                                color: userObj.role === 'admin' ? 'var(--accent)' : 'var(--text-sub)',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                              onMouseLeave={e => e.currentTarget.style.borderColor = userObj.role === 'admin' ? 'rgba(127, 119, 221, 0.25)' : 'var(--border)'}
                            >
                              <Shield className="h-3 w-3" />
                              {userObj.role.toUpperCase()}
                            </button>
                          </td>

                          {/* Active Status with Toggle */}
                          <td style={{ padding: '16px 24px' }}>
                            <button
                              onClick={() => toggleUserActive(userObj.id, userObj.is_active)}
                              disabled={actionLoading !== null}
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                padding: '4px 10px', borderRadius: 8,
                                fontSize: 11, fontWeight: 700,
                                border: '1px solid',
                                cursor: 'pointer',
                                background: userObj.is_active ? 'rgba(16, 185, 129, 0.06)' : 'rgba(239, 68, 68, 0.06)',
                                borderColor: userObj.is_active ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                color: userObj.is_active ? 'var(--green)' : 'var(--red)',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={e => e.currentTarget.style.borderColor = userObj.is_active ? 'var(--red)' : 'var(--green)'}
                              onMouseLeave={e => e.currentTarget.style.borderColor = userObj.is_active ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}
                            >
                              {userObj.is_active ? (
                                <>
                                  <CheckCircle2 className="h-3 w-3" />
                                  ACTIF
                                </>
                              ) : (
                                <>
                                  <AlertTriangle className="h-3 w-3" />
                                  SUSPENDU
                                </>
                              )}
                            </button>
                          </td>

                          {/* Inspect button */}
                          <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                            <button
                              onClick={() => setSelectedUser(userObj)}
                              className="btn-primary"
                              style={{ 
                                padding: '7px 14px', 
                                borderRadius: 10, 
                                fontSize: 12.5, 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: 6,
                                boxShadow: 'none'
                              }}
                            >
                              Inspecter <ArrowRight className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
