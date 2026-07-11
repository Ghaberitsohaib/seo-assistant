import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { createPortal } from 'react-dom'
import api from '../services/api'
import ScoreCircle from '../components/ScoreCircle'
import { useAuth } from '../context/AuthContext'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Loader2, FileText, Link as LinkIcon, Copy, Check, AlertTriangle, Info, Zap, Clock, AlignLeft, Type, Heading1, Heading2, Heading3, BarChart2, BookOpen, Target, CheckCircle2, Sparkles, ChevronRight, Search, Coins } from 'lucide-react'

function AISuggestions({ analysisId }) {
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchSuggestions = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/seo/suggestions/${analysisId}`)
      setSuggestions(res.data.suggestions)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass-card p-6 mt-8 relative overflow-hidden" style={{ border: '1px solid rgba(127, 119, 221, 0.18)' }}>
      <div className="absolute -right-4 -top-4 opacity-5">
        <Zap className="w-32 h-32" style={{ color: 'var(--accent)' }} />
      </div>
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl shadow-md" style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-cyan))' }}>
            <Sparkles className="h-5 w-5" style={{ color: '#030712' }} />
          </div>
          <div>
             <h3 className="text-lg font-bold" style={{ color: 'var(--accent-light)', fontFamily: '"Space Grotesk", sans-serif' }}>Assistant Rédactionnel IA</h3>
             <p className="text-xs font-semibold mt-0.5" style={{ color: 'var(--accent)' }}>Reformulez votre contenu pour plus d'impact</p>
          </div>
        </div>
        {suggestions.length === 0 && !loading && (
          <button
            onClick={fetchSuggestions}
            className="btn-ghost text-sm px-5 py-2.5 flex items-center gap-2"
          >
            <Zap className="h-4 w-4" />
            Générer des idées
          </button>
        )}
      </div>

      <div className="relative z-10">
         {loading ? (
           <div className="flex flex-col items-center justify-center py-10 rounded-xl border" style={{ background: 'rgba(255, 255, 255, 0.02)', borderColor: 'var(--border)' }}>
             <Loader2 className="h-8 w-8 animate-spin mb-3" style={{ color: 'var(--accent)' }} />
             <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>L'IA analyse votre texte...</span>
             <span className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Cela peut prendre quelques secondes.</span>
           </div>
         ) : suggestions.length > 0 ? (
           <div className="space-y-4">
             {suggestions.map((s, i) => (
               <div key={i} className="p-5 rounded-xl border text-sm leading-relaxed relative group hover:bg-white/5 transition-all" style={{ background: 'rgba(255, 255, 255, 0.02)', borderColor: 'var(--border)', color: 'var(--text-sub)' }}>
                 <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl" style={{ background: 'var(--accent)' }}></div>
                 <p className="pl-2">{s}</p>
                 <button 
                   onClick={() => navigator.clipboard.writeText(s)}
                   className="absolute top-2 right-2 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg btn-ghost"
                   title="Copier la suggestion"
                 >
                   <Copy className="h-4 w-4" />
                 </button>
               </div>
             ))}
             <div className="flex justify-center mt-6 pt-2">
                <button 
                  onClick={fetchSuggestions}
                  className="text-sm font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2 btn-ghost"
                >
                  <Zap className="h-4 w-4" />
                  Régénérer de nouvelles suggestions
                </button>
             </div>
           </div>
         ) : (
           <div className="p-6 rounded-xl text-center border" style={{ background: 'rgba(255, 255, 255, 0.02)', borderColor: 'var(--border)' }}>
             <BookOpen className="h-10 w-10 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
             <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
               Besoin d'inspiration ?
             </p>
             <p className="text-xs mt-1 max-w-sm mx-auto" style={{ color: 'var(--text-sub)' }}>
               L'IA peut vous proposer des reformulations de vos phrases clés pour améliorer l'engagement et le SEO de votre contenu.
             </p>
           </div>
         )}
      </div>
    </div>
  )
}

export default function Analysis() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [mode, setMode] = useState('text')
  const [content, setContent] = useState('')
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState(null)
  const [copied, setCopied] = useState({ title: false, meta: false })
  const [copiedKeywordIdx, setCopiedKeywordIdx] = useState(null)
  const [error, setError] = useState('')
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [redirectingToStripe, setRedirectingToStripe] = useState(false)

  useEffect(() => {
    if (id) {
      loadAnalysis()
    }
  }, [id])

  const loadAnalysis = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/seo/analysis/${id}`)
      setAnalysis(res.data)
    } catch (err) {
      console.error('Erreur:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async () => {
    setRedirectingToStripe(true)
    try {
      const res = await api.post('/payment/create-checkout-session')
      if (res.data.url) {
        window.location.href = res.data.url
      } else {
        setError("Erreur lors de la création de la session Stripe")
        setRedirectingToStripe(false)
      }
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.detail || "Erreur de connexion à Stripe")
      setRedirectingToStripe(false)
    }
  }

  const handleAnalyze = async () => {
    setError('')
    if (mode === 'text' && content.length < 50) {
      setError('Le contenu doit contenir au moins 50 caractères')
      return
    }
    if (mode === 'url' && !url) {
      setError('Veuillez entrer une URL')
      return
    }

    setLoading(true)
    try {
      let res
      if (mode === 'text') {
        res = await api.post('/seo/analyze-text', { content, title })
      } else {
        res = await api.post('/seo/analyze-url', { url })
      }
      setAnalysis(res.data)
      navigate(`/analysis/${res.data.id}`)
    } catch (err) {
      if (err.response?.status === 402) {
        setShowUpgradeModal(true)
      } else {
        setError(err.response?.data?.detail || 'Erreur lors de l\'analyse')
      }
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text)
    setCopied({ ...copied, [field]: true })
    setTimeout(() => setCopied({ ...copied, [field]: false }), 2000)
  }

  const copyKeyword = (keyword, idx) => {
    navigator.clipboard.writeText(keyword)
    setCopiedKeywordIdx(idx)
    setTimeout(() => setCopiedKeywordIdx(null), 2000)
  }

  if (loading && !analysis) {
    return (
      <div className="loading-screen">
        <Loader2 className="h-10 w-10 animate-spin" style={{ color: 'var(--accent)' }} />
        <p style={{ color: 'var(--text-sub)', fontWeight: 500 }}>
          Analyse en cours...
        </p>
      </div>
    )
  }

  if (analysis) {
    let aiData = null;
    try {
      if (analysis.ai_analysis) {
        aiData = typeof analysis.ai_analysis === 'string'
          ? JSON.parse(analysis.ai_analysis)
          : analysis.ai_analysis;
      }
    } catch (e) {
      console.error("Erreur parsing ai_analysis:", e);
    }

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight" style={{ fontFamily: '"Playfair Display", serif', color: 'var(--accent-light)' }}>Rapport d'Analyse SEO</h1>
            <p className="mt-1 flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
              <Clock className="h-4 w-4" />
              {new Date(analysis.created_at).toLocaleDateString('fr-FR', { 
                year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
              })}
            </p>
          </div>
          <button
            onClick={() => { setAnalysis(null); navigate('/analyze') }}
            className="btn-ghost px-5 py-2.5 flex items-center gap-2"
          >
            <Sparkles className="h-4 w-4" style={{ color: 'var(--accent)' }} />
            Nouvelle analyse
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Score Global, Detailed Structure, Keywords */}
          <div className="lg:col-span-1 space-y-8">
            {/* Global Score Card */}
            <div className="glass-card p-6 relative overflow-hidden" style={{ border: '1px solid rgba(127, 119, 221, 0.22)' }}>
              <div className="absolute -right-6 -top-6 opacity-10">
                <Target className="w-32 h-32" style={{ color: 'var(--accent)' }} />
              </div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--accent)', fontFamily: '"Space Grotesk", sans-serif' }}>
                <Target className="h-5 w-5" /> Score SEO Global
              </h3>
              <div className="flex items-center gap-6 relative z-10">
                <div className="rounded-full p-2" style={{ background: 'rgba(255, 255, 255, 0.03)' }}>
                   <ScoreCircle score={analysis.seo_score} size={100} strokeWidth={8} />
                </div>
                <div>
                  <p className="text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>{Math.round(analysis.seo_score)}<span className="text-xl" style={{ color: 'var(--text-muted)' }}>/100</span></p>
                  <p className="mt-1 text-sm font-semibold" style={{ color: 'var(--accent-light)' }}>
                    {analysis.seo_score >= 80 ? 'Excellent résultat !' : analysis.seo_score >= 60 ? 'Peut être amélioré.' : 'Nécessite votre attention.'}
                  </p>
                </div>
              </div>
              <div className="mt-6 rounded-xl p-5 border text-left" style={{ background: 'rgba(255, 255, 255, 0.02)', borderColor: 'var(--border)' }}>
                {aiData ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs uppercase font-bold tracking-wider mb-1.5" style={{ color: 'var(--accent)' }}>Analyse Synthétique</h4>
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-sub)' }}>{aiData.summary}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 py-3 border-y animate-fade-in" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                      <div>
                        <span className="text-[11px] font-semibold text-gray-400 block mb-0.5">Ton de la marque</span>
                        <span className="text-xs font-bold text-gray-200">{aiData.tone}</span>
                      </div>
                      <div>
                        <span className="text-[11px] font-semibold text-gray-400 block mb-0.5">Public Cible</span>
                        <span className="text-xs font-bold text-gray-200">{aiData.target_audience}</span>
                      </div>
                    </div>

                    {aiData.strengths && aiData.strengths.length > 0 && (
                      <div className="animate-fade-in">
                        <h5 className="text-[11px] uppercase font-bold tracking-wider mb-2 text-green-400">Points Forts</h5>
                        <ul className="space-y-1.5">
                          {aiData.strengths.map((st, idx) => (
                            <li key={idx} className="text-xs flex items-start gap-2" style={{ color: 'var(--text-sub)' }}>
                              <CheckCircle2 className="h-3.5 w-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>{st}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {aiData.weaknesses && aiData.weaknesses.length > 0 && (
                      <div className="pt-2 animate-fade-in">
                        <h5 className="text-[11px] uppercase font-bold tracking-wider mb-2 text-red-400">Points Faibles</h5>
                        <ul className="space-y-1.5">
                          {aiData.weaknesses.map((wk, idx) => (
                            <li key={idx} className="text-xs flex items-start gap-2" style={{ color: 'var(--text-sub)' }}>
                              <AlertTriangle className="h-3.5 w-3.5 text-red-500 mt-0.5 flex-shrink-0" />
                              <span>{wk}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-sub)' }}>{analysis.ai_analysis}</p>
                )}
              </div>
            </div>

            {/* Detailed Structure */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2" style={{ color: 'var(--accent-light)', fontFamily: '"Space Grotesk", sans-serif' }}>
                <AlignLeft className="h-5 w-5" style={{ color: 'var(--accent)' }} /> Structure Détaillée
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b" style={{ borderColor: 'var(--border)' }}>
                  <span className="flex items-center gap-2" style={{ color: 'var(--text-sub)' }}><AlignLeft className="h-4 w-4" /> Paragraphes</span>
                  <span className="font-semibold px-3 py-1 rounded-lg text-sm" style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-primary)' }}>{analysis.content_structure.paragraph_count}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b" style={{ borderColor: 'var(--border)' }}>
                  <span className="flex items-center gap-2" style={{ color: 'var(--text-sub)' }}><Type className="h-4 w-4" /> Phrases</span>
                  <span className="font-semibold px-3 py-1 rounded-lg text-sm" style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-primary)' }}>{analysis.content_structure.sentence_count}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b" style={{ borderColor: 'var(--border)' }}>
                  <span className="flex items-center gap-2" style={{ color: 'var(--text-sub)' }}><Heading1 className="h-4 w-4" /> Titres H1</span>
                  <span className={`font-semibold px-3 py-1 rounded-lg text-sm ${analysis.content_structure.h1_count === 1 ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                    {analysis.content_structure.h1_count}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b" style={{ borderColor: 'var(--border)' }}>
                  <span className="flex items-center gap-2" style={{ color: 'var(--text-sub)' }}><Heading2 className="h-4 w-4" /> Titres H2</span>
                  <span className="font-semibold px-3 py-1 rounded-lg text-sm" style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-primary)' }}>{analysis.content_structure.h2_count}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2" style={{ color: 'var(--text-sub)' }}><Heading3 className="h-4 w-4" /> Titres H3</span>
                  <span className="font-semibold px-3 py-1 rounded-lg text-sm" style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-primary)' }}>{analysis.content_structure.h3_count}</span>
                </div>
              </div>
            </div>

            {/* Keyword Density List */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--accent-light)', fontFamily: '"Space Grotesk", sans-serif' }}>
                <BarChart2 className="h-5 w-5" style={{ color: 'var(--accent)' }} /> Densité des Mots-Clés
              </h3>
              <p className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>Les termes les plus fréquents dans votre contenu.</p>
              
              {analysis.keywords.length > 0 ? (
                <div className="space-y-4">
                  {analysis.keywords.slice(0, 8).map((kw, i) => (
                    <div key={i} className="group">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold transition-colors" style={{ color: 'var(--text-sub)' }}>{kw.keyword}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-gray-500">{kw.density}%</span>
                          <span className="text-[10px] text-gray-400">({kw.count}x)</span>
                        </div>
                      </div>
                      <div className="w-full h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <div 
                          className="h-1.5 rounded-full"
                          style={{ 
                            width: `${Math.min(kw.density * 5, 100)}%`,
                            background: kw.is_stuffed ? 'linear-gradient(90deg, #EF4444, #F87171)' : 'linear-gradient(90deg, var(--accent), var(--accent-cyan))'
                          }}
                        ></div>
                      </div>
                      {kw.is_stuffed && (
                        <p className="text-[10px] text-red-400 mt-1.5 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" /> Keyword Stuffing détecté
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 rounded-xl border border-dashed" style={{ borderColor: 'var(--border)' }}>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Aucun mot-clé détecté</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Overview cards, Metadata, Recommendations, AISuggestions */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview cards side-by-side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Readability Card */}
              <div className="glass-card p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-1 flex items-center gap-2" style={{ color: 'var(--accent-light)', fontFamily: '"Space Grotesk", sans-serif' }}>
                    <BookOpen className="h-5 w-5" style={{ color: 'var(--accent)' }} /> Lisibilité
                  </h3>
                  <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>La facilité de lecture de votre contenu.</p>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl font-bold" style={{
                      color: analysis.readability_score >= 80 ? '#10B981' : analysis.readability_score >= 60 ? '#F59E0B' : '#EF4444'
                    }}>
                      {analysis.readability_score}
                    </span>
                    <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>/100</span>
                  </div>
                  
                  <div className="w-full rounded-full h-2.5 mb-4 overflow-hidden" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                    <div 
                      className="h-2.5 rounded-full"
                      style={{ 
                        width: `${analysis.readability_score}%`,
                        background: analysis.readability_score >= 80 ? 'linear-gradient(90deg, #10B981, #34D399)' : analysis.readability_score >= 60 ? 'linear-gradient(90deg, #F59E0B, #FCD34D)' : 'linear-gradient(90deg, #EF4444, #F87171)'
                      }}
                    ></div>
                  </div>
                </div>
                <div className="rounded-xl p-3 flex items-start gap-3 border" style={{ background: 'rgba(255, 255, 255, 0.02)', borderColor: 'var(--border)' }}>
                  <Info className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--text-muted)' }} />
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-sub)' }}>
                    Un score de 60 ou plus indique que votre texte est facile à comprendre par le grand public.
                  </p>
                </div>
              </div>

              {/* Time & Quick Stats Card */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--accent-light)', fontFamily: '"Space Grotesk", sans-serif' }}>
                  <Zap className="h-5 w-5" style={{ color: 'var(--accent)' }} /> Aperçu rapide
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border animate-fade-in" style={{ background: 'rgba(127, 119, 221, 0.04)', borderColor: 'rgba(127, 119, 221, 0.15)' }}>
                    <Clock className="h-5 w-5 mb-2" style={{ color: 'var(--accent)' }} />
                    <p className="text-xs font-semibold mb-1" style={{ color: 'var(--accent-light)' }}>Temps de lecture</p>
                    <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>~{Math.max(1, Math.ceil(analysis.content_structure.word_count / 200))} min</p>
                  </div>
                  <div className="p-4 rounded-xl border animate-fade-in" style={{ background: 'rgba(99, 102, 241, 0.04)', borderColor: 'rgba(99, 102, 241, 0.15)' }}>
                    <Type className="h-5 w-5 mb-2" style={{ color: '#8B5CF6' }} />
                    <p className="text-xs font-semibold mb-1" style={{ color: '#A78BFA' }}>Total des mots</p>
                    <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{analysis.content_structure.word_count}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4" style={{ borderColor: 'var(--border)' }}>
                   <div>
                      <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Mots / Phrase</p>
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{analysis.content_structure.average_words_per_sentence?.toFixed(1) || 0}</p>
                   </div>
                   <div>
                      <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Phrases / Paragraphe</p>
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{analysis.content_structure.average_sentences_per_paragraph?.toFixed(1) || 0}</p>
                   </div>
                </div>
              </div>
            </div>

            {/* Metadatas */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2" style={{ color: 'var(--accent-light)', fontFamily: '"Space Grotesk", sans-serif' }}>
                <Search className="h-5 w-5" style={{ color: 'var(--accent)' }} /> Métadonnées Suggérées
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="rounded-xl p-4 border flex items-start gap-4 animate-fade-in" style={{ background: 'rgba(99, 102, 241, 0.05)', borderColor: 'rgba(99, 102, 241, 0.15)' }}>
                  <div className="p-2 rounded-lg shadow-sm" style={{ background: 'rgba(255, 255, 255, 0.03)' }}>
                    <Target className="h-6 w-6" style={{ color: '#8B5CF6' }} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#A78BFA' }}>Mot-clé Principal Cible</p>
                    <p className="text-lg font-bold animate-fade-in" style={{ color: 'var(--text-primary)' }}>{analysis.focus_keyword || analysis.metadata_suggestions?.focus_keyword || 'Non détecté'}</p>
                  </div>
                </div>

                {analysis.metadata_suggestions?.domain_identified && (
                  <div className="rounded-xl p-4 border flex items-start gap-4 shadow-sm animate-fade-in" style={{ background: 'rgba(16, 185, 129, 0.05)', borderColor: 'rgba(16, 185, 129, 0.15)' }}>
                    <div className="p-2 rounded-lg shadow-sm" style={{ background: 'rgba(255, 255, 255, 0.03)' }}>
                      <Sparkles className="h-6 w-6" style={{ color: '#10B981' }} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#34D399' }}>Secteur / Domaine d'Activité</p>
                      <p className="text-lg font-bold animate-fade-in" style={{ color: 'var(--text-primary)' }}>{analysis.metadata_suggestions.domain_identified}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <label className="text-sm font-semibold" style={{ color: 'var(--text-sub)' }}>Balise Title</label>
                    <span className="text-xs px-2 py-1 rounded-md font-medium" style={{ background: 'rgba(255,255,255,0.04)', color: analysis.metadata_suggestions.title.length > 60 ? '#EF4444' : 'var(--text-sub)' }}>
                      {analysis.metadata_suggestions.title.length} / 60
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={analysis.metadata_suggestions.title}
                      readOnly
                      className="dark-input"
                      style={{ paddingRight: 48 }}
                    />
                    <button
                      onClick={() => copyToClipboard(analysis.metadata_suggestions.title, 'title')}
                      className="absolute right-2 top-2 p-1.5 shadow-sm rounded-lg btn-ghost"
                      title="Copier"
                    >
                      {copied.title ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                  {analysis.metadata_suggestions.title.length > 60 && (
                     <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Le titre est trop long. Il risque d'être coupé par Google.</p>
                  )}
                </div>
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <label className="text-sm font-semibold" style={{ color: 'var(--text-sub)' }}>Meta Description</label>
                    <span className="text-xs px-2 py-1 rounded-md font-medium" style={{ background: 'rgba(255,255,255,0.04)', color: analysis.metadata_suggestions.meta_description.length > 160 ? '#EF4444' : 'var(--text-sub)' }}>
                      {analysis.metadata_suggestions.meta_description.length} / 160
                    </span>
                  </div>
                  <div className="relative">
                    <textarea
                      value={analysis.metadata_suggestions.meta_description}
                      readOnly
                      rows={3}
                      className="dark-input resize-none"
                      style={{ paddingRight: 48, minHeight: '80px', lineHeight: 1.6 }}
                    />
                    <button
                      onClick={() => copyToClipboard(analysis.metadata_suggestions.meta_description, 'meta')}
                      className="absolute right-2 top-2 p-1.5 shadow-sm rounded-lg btn-ghost"
                      title="Copier"
                    >
                      {copied.meta ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {analysis.metadata_suggestions?.recommended_keywords && analysis.metadata_suggestions.recommended_keywords.length > 0 && (
                <div className="mt-8 pt-6 border-t animate-fade-in" style={{ borderColor: 'var(--border)' }}>
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-4.5 w-4.5" style={{ color: 'var(--accent)' }} />
                    <h4 className="text-sm font-bold" style={{ color: 'var(--accent-light)', fontFamily: '"Space Grotesk", sans-serif' }}>
                      Suggestions de Mots-Clés Professionnels
                    </h4>
                  </div>
                  <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
                    Mots-clés de domaine recommandés par l'IA à fort volume de recherche pour optimiser votre contenu :
                  </p>
                  
                  <div className="overflow-x-auto rounded-xl border border-white/5" style={{ background: 'rgba(255, 255, 255, 0.01)' }}>
                    <table className="w-full text-left border-collapse text-[13px]">
                      <thead>
                        <tr className="border-b" style={{ borderColor: 'rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}>
                          <th className="py-2.5 px-4 font-semibold text-gray-400">Mot-clé</th>
                          <th className="py-2.5 px-4 font-semibold text-gray-400">Volume de rech.</th>
                          <th className="py-2.5 px-4 font-semibold text-gray-400">Compétition</th>
                          <th className="py-2.5 px-4 font-semibold text-gray-400">Pertinence</th>
                          <th className="py-2.5 px-4 font-semibold text-gray-400 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {analysis.metadata_suggestions.recommended_keywords.map((item, idx) => (
                          <tr key={idx} className="group hover:bg-white/[0.02] transition-colors">
                            <td className="py-3 px-4 font-bold text-gray-200">{item.keyword}</td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded-md text-gray-300 font-semibold text-[11px]" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                {item.volume}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase" style={{
                                background: item.competition === 'Faible' ? 'rgba(16, 185, 129, 0.12)' : item.competition === 'Moyenne' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                                color: item.competition === 'Faible' ? '#34D399' : item.competition === 'Moyenne' ? '#FBB224' : '#F87171',
                                border: item.competition === 'Faible' ? '1px solid rgba(16, 185, 129, 0.2)' : item.competition === 'Moyenne' ? '1px solid rgba(245, 158, 11, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)'
                              }}>
                                {item.competition}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <div className="w-16 bg-white/5 h-1.5 rounded-full overflow-hidden">
                                  <div className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-1.5 rounded-full" style={{ width: `${item.relevance}%` }}></div>
                                </div>
                                <span className="font-semibold text-[11px]" style={{ color: 'var(--text-sub)' }}>{item.relevance}%</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => copyKeyword(item.keyword, idx)}
                                className="p-1.5 rounded-lg btn-ghost hover:bg-white/5 transition-all text-gray-400 hover:text-white"
                                title="Copier le mot-clé"
                              >
                                {copiedKeywordIdx === idx ? (
                                  <Check className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Recommendations */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2" style={{ color: 'var(--accent-light)', fontFamily: '"Space Grotesk", sans-serif' }}>
                <CheckCircle2 className="h-5 w-5 text-green-500" /> Recommandations d'Amélioration
              </h3>
              
              {analysis.recommendations.length > 0 ? (
                <div className="space-y-4">
                  {analysis.recommendations.map((rec, i) => (
                    <div key={i} className="p-5 rounded-xl border relative overflow-hidden group hover:shadow-md transition-all" style={{ 
                      background: rec.priority === 'high' ? 'rgba(239, 68, 68, 0.04)' :
                                  rec.priority === 'medium' ? 'rgba(245, 158, 11, 0.04)' :
                                  'rgba(59, 130, 246, 0.04)',
                      borderColor: rec.priority === 'high' ? 'rgba(239, 68, 68, 0.15)' :
                                   rec.priority === 'medium' ? 'rgba(245, 158, 11, 0.15)' :
                                   'rgba(59, 130, 246, 0.15)'
                    }}>
                      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl" style={{ 
                        background: rec.priority === 'high' ? '#EF4444' :
                                    rec.priority === 'medium' ? '#F59E0B' :
                                    '#3B82F6'
                      }}></div>
                      
                      <div className="flex items-start gap-4">
                        <div className="mt-1 p-2 rounded-full flex-shrink-0" style={{ 
                          background: rec.priority === 'high' ? 'rgba(239, 68, 68, 0.12)' :
                                      rec.priority === 'medium' ? 'rgba(245, 158, 11, 0.12)' :
                                      'rgba(59, 130, 246, 0.12)',
                          color: rec.priority === 'high' ? '#F87171' :
                                 rec.priority === 'medium' ? '#FBB224' :
                                 '#60A5FA'
                        }}>
                          {rec.priority === 'high' ? <AlertTriangle className="h-5 w-5" /> : 
                           rec.priority === 'medium' ? <Info className="h-5 w-5" /> : 
                           <Check className="h-5 w-5" />}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold" style={{ color: 'var(--accent-light)' }}>{rec.title}</h4>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ 
                              background: rec.priority === 'high' ? 'rgba(239, 68, 68, 0.15)' :
                                          rec.priority === 'medium' ? 'rgba(245, 158, 11, 0.15)' :
                                          'rgba(59, 130, 246, 0.15)',
                              color: rec.priority === 'high' ? '#F87171' :
                                     rec.priority === 'medium' ? '#FBB224' :
                                     '#60A5FA'
                            }}>
                              {rec.priority === 'high' ? 'Critique' : rec.priority === 'medium' ? 'Modérée' : 'Mineure'}
                            </span>
                          </div>
                          <p className="text-sm mb-3" style={{ color: 'var(--text-sub)' }}>{rec.description}</p>
                          
                          {rec.suggestion && (
                            <div className="p-3 rounded-lg border text-sm" style={{ background: 'rgba(255, 255, 255, 0.02)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                              <span className="font-semibold flex items-center gap-1.5 mb-1" style={{ color: 'var(--accent)' }}>
                                <Zap className="h-3.5 w-3.5" /> Solution suggérée
                              </span>
                              <span>{rec.suggestion}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 rounded-xl border border-green-500/20" style={{ background: 'rgba(16, 185, 129, 0.04)' }}>
                  <CheckCircle2 className="h-12 w-12 text-green-400 mx-auto mb-3" />
                  <p className="font-semibold text-green-400 text-lg">Excellent !</p>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-sub)' }}>Aucun problème majeur détecté sur votre contenu.</p>
                </div>
              )}
            </div>

            <AISuggestions analysisId={analysis.id} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: '"Playfair Display", serif', color: 'var(--accent-light)' }}>Analyse SEO</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-sub)' }}>Analysez votre contenu pour améliorer son référencement</p>
        </div>
        {user && (
          <div className="flex items-center gap-2 self-start sm:self-center">
            <span className="px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border" style={{ background: 'rgba(127, 119, 221, 0.08)', borderColor: 'rgba(127, 119, 221, 0.3)', color: 'var(--accent)' }}>
              <Coins className="h-3.5 w-3.5 animate-pulse" /> Solde : {user.role === 'admin' ? 'Illimité' : `${user.credits ?? 0} jeton(s)`}
            </span>
          </div>
        )}
      </div>

      <div className="glass-card p-8 max-w-3xl mx-auto" style={{ border: '1px solid rgba(127, 119, 221, 0.18)' }}>
        {error && (
          <div className="animate-fade-in p-5 rounded-xl border mb-6" style={{ background: 'rgba(239, 68, 68, 0.04)', borderColor: 'rgba(239, 68, 68, 0.25)', color: '#F87171' }}>
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-bold mb-1">
                  {error === "Contenu insuffisant pour l'analyse" 
                    ? "Contenu insuffisant ou protégé pour l'analyse" 
                    : error.includes("Erreur HTTP") 
                    ? "Accès au site bloqué (Protection anti-robot)" 
                    : "Erreur d'analyse"}
                </p>
                <p className="text-xs leading-relaxed opacity-90">
                  {error === "Contenu insuffisant pour l'analyse" 
                    ? "L'analyseur n'a pas pu extraire de texte lisible de cette URL. Cela se produit généralement si le site cible bloque l'accès automatique (comme Cloudflare, etc.) ou s'il contient trop peu de texte." 
                    : error.includes("Erreur HTTP")
                    ? "Le serveur cible a bloqué la requête automatique du système de référencement (Code d'erreur HTTP retourné)." 
                    : error}
                </p>
                
                {(error === "Contenu insuffisant pour l'analyse" || error.includes("Erreur HTTP") || error.includes("scraping")) && (
                  <div className="mt-3 pt-3 border-t border-red-500/10 text-xs">
                    <p className="font-bold flex items-center gap-1.5" style={{ color: 'var(--accent)' }}>
                      <Zap className="h-3.5 w-3.5" /> Solution simple et rapide :
                    </p>
                    <p className="mt-1 opacity-90 leading-relaxed">
                      Sélectionnez et copiez manuellement le texte principal depuis le site d'origine, puis collez-le directement dans l'onglet <strong>"Saisie de Texte"</strong> ci-dessus. Cela fonctionnera à coup sûr !
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        <div className="tab-switcher mb-8">
          <button
            onClick={() => setMode('text')}
            className={`tab-btn ${mode === 'text' ? 'active' : ''}`}
          >
            <FileText className="h-4.5 w-4.5" />
            Saisie de Texte
          </button>
          <button
            onClick={() => setMode('url')}
            className={`tab-btn ${mode === 'url' ? 'active' : ''}`}
          >
            <LinkIcon className="h-4.5 w-4.5" />
            Analyse par URL
          </button>
        </div>

        {mode === 'text' ? (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-sub)' }}>
                Titre du contenu (Optionnel)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Les meilleures pratiques SEO en 2024..."
                className="dark-input"
              />
            </div>
            <div>
              <div className="flex justify-between items-end mb-2">
                <label className="block text-sm font-semibold" style={{ color: 'var(--text-sub)' }}>
                   Contenu à analyser <span className="text-red-500">*</span>
                </label>
                <span className="text-xs font-semibold px-2 py-1 rounded-md" style={{ 
                  background: 'rgba(255, 255, 255, 0.04)',
                  color: content.length < 50 ? 'var(--text-muted)' : '#10B981'
                }}>
                  {content.length} / 50 min.
                </span>
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Collez votre article, blog post, ou page de destination ici..."
                rows={10}
                className="dark-input resize-y leading-relaxed"
                style={{ minHeight: '220px' }}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-sub)' }}>
                Adresse URL à analyser <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <LinkIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://votre-site.com/article"
                  className="dark-input text-lg"
                  style={{ paddingLeft: 44, paddingRight: 16 }}
                />
              </div>
              <div className="mt-4 p-4 rounded-xl border flex items-start gap-3" style={{ background: 'rgba(59, 130, 246, 0.04)', borderColor: 'rgba(59, 130, 246, 0.15)' }}>
                <Info className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-sub)' }}>
                  L'analyseur récupérera le texte principal de la page. Assurez-vous que le lien est accessible publiquement et contient suffisamment de texte pour une analyse pertinente.
                </p>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleAnalyze}
          disabled={loading || (mode === 'text' && content.length < 50) || (mode === 'url' && !url)}
          className="btn-primary w-full mt-8 py-4 justify-center"
          style={{ fontSize: 16, borderRadius: 14 }}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin h-5 w-5" />
              Analyse en cours...
            </>
          ) : (
            <>
              <Zap className="h-5 w-5" />
              Lancer l'Analyse Complète
            </>
          )}
        </button>
      </div>

      {showUpgradeModal && createPortal(
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(3, 7, 18, 0.85)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: 20,
          animation: 'fade-in 0.3s ease-out'
        }}>
          <div className="glass-card max-w-lg w-full p-8 relative overflow-hidden" style={{ border: '1px solid rgba(127, 119, 221, 0.25)', boxShadow: '0 25px 50px -12px rgba(127,119,221,0.15)' }}>
            {/* Glowing circle in background of modal */}
            <div style={{
              position: 'absolute', top: '-10%', right: '-10%',
              width: 200, height: 200,
              background: 'radial-gradient(circle, rgba(127,119,221,0.15) 0%, transparent 70%)',
              pointerEvents: 'none'
            }} />

            <div className="text-center">
              <div className="mx-auto w-12 h-12 rounded-xl flex items-center justify-center mb-6" style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-cyan))' }}>
                <Coins className="h-6 w-6" style={{ color: '#030712' }} />
              </div>
              
              <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: '"Playfair Display", serif', color: 'var(--accent-light)' }}>
                Solde de jetons épuisé
              </h2>
              <p className="text-sm mb-6" style={{ color: 'var(--accent)' }}>Rechargez votre compte pour continuer</p>
              
              <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-sub)' }}>
                Vous n'avez plus de jetons disponibles pour lancer de nouvelles analyses SEO. Choisissez parmi nos offres de jetons sans engagement.
              </p>
              
              {/* Features list */}
              <div className="text-left space-y-3 mb-8 max-w-sm mx-auto">
                <div className="flex items-center gap-3 text-sm" style={{ color: 'var(--text-primary)' }}>
                  <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />
                  <span>Analyses complètes de vos textes & URL</span>
                </div>
                <div className="flex items-center gap-3 text-sm" style={{ color: 'var(--text-primary)' }}>
                  <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />
                  <span>Recommandations détaillées et Assistant IA</span>
                </div>
                <div className="flex items-center gap-3 text-sm" style={{ color: 'var(--text-primary)' }}>
                  <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />
                  <span>Crédits valables à vie et sans expiration</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="btn-ghost py-3.5 px-6 rounded-xl order-2 sm:order-1 flex-1 text-sm font-semibold"
                >
                  Plus tard
                </button>
                <button
                  onClick={() => { setShowUpgradeModal(false); navigate('/pricing') }}
                  className="btn-primary py-3.5 px-6 rounded-xl order-1 sm:order-2 flex-1 text-sm font-semibold justify-center flex items-center gap-2"
                >
                  <Coins className="h-4 w-4" />
                  Acheter des Jetons
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
