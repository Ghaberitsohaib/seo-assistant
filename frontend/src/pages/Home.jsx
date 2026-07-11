import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BarChart3, Bot, Link2, Zap, TrendingUp, Globe2, Sparkles, Sparkle, Search, Atom, Lock, Database, Github, Twitter, Linkedin } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Home() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const videoRef = useRef(null)
  const canvasBottomRef = useRef(null)
  const canvasTopRef = useRef(null)
  const rafRef = useRef(null)
  const [openFaq, setOpenFaq] = useState(null)
  const [activeModal, setActiveModal] = useState(null)
  const [selectedPost, setSelectedPost] = useState(null)
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [contactStatus, setContactStatus] = useState('idle')
  const [activeDocTab, setActiveDocTab] = useState('start')
  const [activeGuide, setActiveGuide] = useState(null)

  useEffect(() => {
    const video = document.createElement('video')
    video.src = `${import.meta.env.BASE_URL}cercle.mp4`
    video.muted = true
    video.loop = true
    video.playsInline = true
    video.autoplay = true

    // Force browser to decode at full FPS
    video.style.position = 'absolute'
    video.style.width = '1px'
    video.style.height = '1px'
    video.style.opacity = '0.01'
    video.style.pointerEvents = 'none'
    video.style.zIndex = '-100'
    document.body.appendChild(video)
    videoRef.current = video

    const canvasBottom = canvasBottomRef.current
    const canvasTop = canvasTopRef.current
    const ctxBottom = canvasBottom.getContext('2d')
    const ctxTop = canvasTop.getContext('2d')

    function initCanvasSize() {
      canvasBottom.width = video.videoWidth
      canvasBottom.height = video.videoHeight
      canvasTop.width = video.videoWidth
      canvasTop.height = video.videoHeight
    }

    if (video.videoWidth) {
      initCanvasSize()
    } else {
      video.addEventListener('loadedmetadata', initCanvasSize)
    }

    function render() {
      if (video.readyState >= 2) {
        ctxBottom.clearRect(0, 0, canvasBottom.width, canvasBottom.height)
        ctxTop.clearRect(0, 0, canvasTop.width, canvasTop.height)

        ctxBottom.drawImage(video, 0, 0, canvasBottom.width, canvasBottom.height)
        ctxTop.drawImage(video, 0, 0, canvasTop.width, canvasTop.height)

        // Mask out sparkles in corner
        ctxBottom.fillStyle = '#000000'
        ctxBottom.fillRect(canvasBottom.width - 230, canvasBottom.height - 220, 230, 220)
        ctxTop.fillStyle = '#000000'
        ctxTop.fillRect(canvasTop.width - 230, canvasTop.height - 220, 230, 220)
      }
      rafRef.current = requestAnimationFrame(render)
    }

    const startPlayback = () => {
      video.play().then(() => {
        rafRef.current = requestAnimationFrame(render)
      }).catch(err => {
        console.log('Playback failed, waiting for user click:', err)
      })
    }

    startPlayback()
    const handleClick = () => startPlayback()
    document.addEventListener('click', handleClick)

    return () => {
      document.removeEventListener('click', handleClick)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      video.pause()
      video.src = ''
      if (video.parentNode) video.parentNode.removeChild(video)
    }
  }, [])

  // Scroll reveal
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('lp-visible')
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.12 })

    document.querySelectorAll('.lp-reveal').forEach(el => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (activeModal) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [activeModal])

  return (
    <div className="holo-home">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;900&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=Outfit:wght@300;400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=Great+Vibes&display=swap');

        .holo-home {
          margin: 0;
          padding: 0;
          width: 100%;
          background-color: #000000;
          font-family: 'Montserrat', sans-serif;
          color: #ffffff;
          position: relative;
          overflow-x: clip;
        }

        /* ═══════════════════════════════════════════════ */
        /* HERO SECTION (unchanged layout)                */
        /* ═══════════════════════════════════════════════ */
        .holo-hero-screen {
          position: relative;
          width: 100%;
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: hidden;
        }

        /* SVG Filter is rendered inline below */

        .holo-hero-container {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 2;
        }

        .holo-canvas-layer {
          position: absolute;
          top: 58%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 68vw;
          max-width: 1000px;
          height: auto;
          aspect-ratio: 16 / 9;
          pointer-events: none;
          will-change: transform;
          filter: url(#black-to-transparent);
        }

        #canvas-bottom {
          z-index: 2;
          clip-path: polygon(43% 0, 100% 0, 100% 100%, 43% 100%);
        }

        #canvas-top {
          z-index: 4;
          clip-path: polygon(0 0, 43% 0, 43% 100%, 0 100%);
        }

        .holo-text-layer {
          position: relative;
          z-index: 3;
          width: 100%;
          padding: 0 16vw;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          transform: translateY(8vh) scaleY(1.05);
        }

        .holo-text-wrapper {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          width: 100%;
          max-width: 1400px;
        }

        .holo-title {
          font-family: 'Montserrat', sans-serif;
          font-weight: 900;
          margin: 0;
          text-transform: uppercase;
          white-space: nowrap;
          text-align: left;
        }

        .holo-seo-title {
          position: absolute;
          bottom: 100%;
          left: 0;
          margin: 0;
          margin-bottom: 0.3vw;
          font-size: 8.5vw;
          line-height: 0.85;
          color: transparent;
          -webkit-text-stroke: 2.2px rgba(255, 255, 255, 0.95);
          letter-spacing: 0.05em;
        }

        .holo-improves-title {
          font-size: 8.5vw;
          line-height: 0.85;
          color: #ffffff;
          -webkit-text-stroke: 0;
          letter-spacing: -0.02em;
          margin: 0;
          width: 100%;
        }

        .holo-ranking-title {
          font-size: 8.5vw;
          line-height: 0.85;
          color: transparent;
          -webkit-text-stroke: 2.2px rgba(255, 255, 255, 0.95);
          letter-spacing: -0.02em;
          margin: 0;
          margin-top: 0.5vw;
          width: 100%;
        }

        /* Navbar */
        .holo-navbar {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 90px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 7vw;
          z-index: 10;
          background: transparent;
          pointer-events: auto;
        }

        .holo-navbar-left {
          display: flex;
          align-items: center;
        }

        .holo-logo {
          width: 140px;
          height: 35px;
        }

        .holo-navbar-right {
          display: flex;
          align-items: center;
          gap: 2.5rem;
        }

        .holo-nav-link {
          font-family: 'Montserrat', sans-serif;
          font-size: 0.95rem;
          font-weight: 500;
          color: #8c8c9e;
          text-decoration: none;
          transition: color 0.3s ease;
          letter-spacing: 0.02em;
          cursor: pointer;
          background: none;
          border: none;
          padding: 0;
        }

        .holo-nav-link:hover {
          color: #ffffff;
        }

        .holo-nav-btn {
          font-family: 'Montserrat', sans-serif;
          font-size: 0.95rem;
          font-weight: 600;
          color: #e2e2eb;
          text-decoration: none;
          padding: 0.65rem 1.6rem;
          border: 1.5px solid rgba(255, 255, 255, 0.15);
          border-radius: 50px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(10px);
        }

        .holo-nav-btn:hover {
          color: #ffffff;
          border-color: rgba(255, 255, 255, 0.6);
          background: rgba(255, 255, 255, 0.08);
          transform: scale(1.03);
          box-shadow: 0 4px 20px rgba(255, 255, 255, 0.05);
        }

        /* ═══════════════════════════════════════════════ */
        /* LANDING PAGE SECTIONS BELOW HERO               */
        /* ═══════════════════════════════════════════════ */

        .lp-sections {
          font-family: 'Outfit', sans-serif;
          font-size: 15px;
          line-height: 1.6;
          position: relative;
          z-index: 5;
          background: #000;
        }

        .lp-section {
          padding: 96px 48px;
        }

        .lp-label {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.12em;
          color: #888;
          text-transform: uppercase;
          margin-bottom: 20px;
        }
        .lp-label::before {
          content: '';
          display: inline-block;
          width: 16px;
          height: 0.5px;
          background: #888;
        }

        .lp-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(30px, 4.5vw, 44px);
          font-weight: 700;
          letter-spacing: -0.03em;
          line-height: 1.2;
          margin-bottom: 12px;
          background: linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.7) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .lp-sub {
          font-family: 'Outfit', sans-serif;
          font-size: 15px;
          color: #888;
          max-width: 520px;
          line-height: 1.75;
        }

        .lp-cursive {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          font-style: normal;
        }

        .lp-cursive-title {
          font-size: clamp(40px, 8vw, 72px);
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-style: normal;
          letter-spacing: -0.03em;
          line-height: 1.15;
          background: linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.75) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 16px;
        }

        /* STATS */
        .lp-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 0;
          border-top: 0.5px solid rgba(255,255,255,0.08);
          margin-top: 32px;
        }
        .lp-stat {
          background: transparent;
          padding: 32px 0 32px 28px;
          border-right: 0.5px solid rgba(255,255,255,0.08);
        }
        .lp-stat:last-child { border-right: none; }
        .lp-stat-num {
          font-size: 36px;
          font-weight: 500;
          letter-spacing: -0.02em;
          color: #fff;
        }
        .lp-stat-label {
          font-size: 13px;
          color: #888;
          margin-top: 4px;
        }

        /* FEATURES SPLIT */
        .lp-features-split {
          display: grid;
          grid-template-columns: 1fr 1px 1fr;
          gap: 0;
          align-items: start;
        }
        .lp-features-left {
          padding-right: 64px;
          position: relative;
          align-self: stretch;
        }
        .lp-features-left-inner {
          position: sticky;
          top: 140px;
          height: fit-content;
        }
        .lp-features-left .lp-title {
          font-size: clamp(34px, 5vw, 48px);
          line-height: 1.15;
          margin-bottom: 24px;
          font-weight: 800;
          letter-spacing: -0.03em;
        }
        .lp-features-left .lp-title span.glow {
          background: linear-gradient(135deg, #a78bfa 0%, #818cf8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .lp-features-left .lp-sub {
          font-family: 'Outfit', sans-serif;
          font-size: 16px;
          color: #8c8c9e;
          line-height: 1.8;
        }
        .lp-features-divider {
          background: linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.12) 15%, rgba(255,255,255,0.12) 85%, transparent 100%);
          width: 1px;
          align-self: stretch;
        }
        .lp-features-right {
          padding-left: 64px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .lp-feat {
          padding: 28px 24px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          display: flex;
          gap: 24px;
          align-items: flex-start;
          transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
          border-radius: 16px;
          background: transparent;
          cursor: default;
        }
        .lp-feat:last-child {
          border-bottom: none;
        }
        .lp-feat-num {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 16px;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.15);
          transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
          margin-top: 3px;
          width: 24px;
          flex-shrink: 0;
        }
        .lp-feat:hover {
          background: linear-gradient(90deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0) 100%);
          transform: translateX(8px);
          border-bottom-color: rgba(255, 255, 255, 0.1);
        }
        .lp-feat:hover .lp-feat-num {
          color: #818cf8;
          text-shadow: 0 0 8px rgba(129, 140, 248, 0.5);
          transform: scale(1.1);
        }
        .lp-feat h3 {
          font-size: 20px;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          margin-bottom: 8px;
          background: linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.85) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.015em;
          transition: all 0.4s ease;
        }
        .lp-feat:hover h3 {
          background: linear-gradient(180deg, #ffffff 0%, #ffffff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .lp-feat p {
          font-family: 'Outfit', sans-serif;
          font-size: 14px;
          color: #8c8c9e;
          line-height: 1.7;
          transition: all 0.4s ease;
        }
        .lp-feat:hover p {
          color: #d1d1db;
        }

        /* TABLE */
        .lp-table-wrap {
          margin-top: 32px;
          border: 0.5px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          overflow: hidden;
        }
        .lp-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }
        .lp-table th {
          text-align: left;
          padding: 14px 20px;
          font-size: 12px;
          font-weight: 500;
          color: #888;
          background: #111;
          border-bottom: 0.5px solid rgba(255,255,255,0.08);
        }
        .lp-table td {
          padding: 14px 20px;
          border-bottom: 0.5px solid rgba(255,255,255,0.08);
        }
        .lp-table tr:last-child td {
          border-bottom: none;
        }
        .lp-td-sans {
          color: #555;
        }
        .lp-td-check {
          color: #fff;
        }
        .lp-dot {
          display: inline-block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #fff;
          margin-right: 8px;
          vertical-align: middle;
        }

        /* STEPS */
        .lp-steps {
          display: flex;
          flex-direction: column;
          gap: 0;
          margin-top: 48px;
        }
        .lp-step-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0;
          border-top: 0.5px solid rgba(255,255,255,0.08);
          padding: 64px 0;
          align-items: center;
          position: relative;
          transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .lp-step-row:last-child {
          border-bottom: 0.5px solid rgba(255,255,255,0.08);
        }
        .lp-step-row:hover {
          background: rgba(255, 255, 255, 0.01);
        }
        .lp-step-num {
          font-size: clamp(100px, 15vw, 160px);
          font-family: 'Great Vibes', cursive;
          font-weight: 500;
          line-height: 1;
          background: linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.03) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          user-select: none;
          pointer-events: none;
          letter-spacing: normal;
          transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .lp-step-row:hover .lp-step-num {
          background: linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.06) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          transform: scale(1.04) translateX(10px);
        }
        .lp-step-content {
          padding: 0 48px;
        }
        .lp-step-label {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.12em;
          color: #888;
          text-transform: uppercase;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .lp-step-label::before {
          content: '';
          display: inline-block;
          width: 16px;
          height: 0.5px;
          background: #888;
        }
        .lp-step-content h3 {
          font-size: clamp(24px, 3vw, 32px);
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          background: linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.85) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 16px;
          line-height: 1.25;
          letter-spacing: -0.02em;
        }
        .lp-step-content p {
          font-family: 'Outfit', sans-serif;
          font-size: 14.5px;
          color: #888;
          line-height: 1.75;
          max-width: 420px;
        }

        /* MARQUEE TESTIMONIALS */
        .lp-marquee-track {
          width: 100%;
          overflow: hidden;
          padding: 20px 0;
          position: relative;
          mask-image: linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%);
          -webkit-mask-image: linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%);
        }
        .lp-marquee-inner {
          display: flex;
          gap: 24px;
          width: max-content;
          animation: lp-marquee 38s linear infinite;
        }
        .lp-marquee-inner:hover {
          animation-play-state: paused;
        }
        @keyframes lp-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .lp-testi-card {
          min-width: 340px;
          max-width: 340px;
          position: relative;
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 32px 28px 24px 28px;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          flex-shrink: 0;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.2);
          filter: grayscale(100%);
          opacity: 0.75;
        }
        .lp-testi-card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 16px;
          padding: 1px;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.02) 50%, rgba(255, 255, 255, 0) 100%);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }
        .lp-testi-card:hover {
          transform: translateY(-6px) scale(1.02);
          border-color: rgba(255, 255, 255, 0.15);
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%);
          box-shadow: 0 12px 40px rgba(255, 255, 255, 0.04), 0 0 20px rgba(255, 255, 255, 0.02);
          filter: grayscale(0%);
          opacity: 1;
        }
        .lp-testi-rating {
          display: flex;
          gap: 4px;
          margin-bottom: 16px;
        }
        .lp-testi-star {
          color: #ffb800;
          font-size: 15px;
          filter: drop-shadow(0 0 4px rgba(255, 184, 0, 0.35));
        }
        .lp-testi-text {
          font-size: 14.5px;
          color: rgba(255, 255, 255, 0.85);
          line-height: 1.7;
          margin-bottom: 24px;
          font-weight: 400;
          position: relative;
          z-index: 2;
        }
        .lp-testi-user {
          display: flex;
          align-items: center;
          gap: 12px;
          position: relative;
          z-index: 2;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          padding-top: 16px;
        }
        .lp-testi-avatar {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 14px;
          color: #fff;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .avatar-k { background: linear-gradient(135deg, #ff5e62 0%, #ff9966 100%); }
        .avatar-s { background: linear-gradient(135deg, #8a2be2 0%, #4a00e0 100%); }
        .avatar-m { background: linear-gradient(135deg, #00c6ff 0%, #0072ff 100%); }
        .avatar-i { background: linear-gradient(135deg, #f857a6 0%, #ff5858 100%); }
        .avatar-y { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); }
        
        .lp-testi-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .lp-testi-name {
          font-size: 13.5px;
          font-weight: 600;
          color: #fff;
          font-family: 'Space Grotesk', sans-serif;
        }
        .lp-testi-role {
          font-size: 11.5px;
          color: #8c8c9e;
          font-weight: 400;
        }
        .lp-testi-quote-icon {
          position: absolute;
          right: 20px;
          bottom: 12px;
          font-size: 80px;
          color: rgba(255, 255, 255, 0.02);
          font-family: 'Georgia', serif;
          line-height: 1;
          pointer-events: none;
          user-select: none;
          font-weight: 900;
          transition: all 0.4s ease;
        }
        .lp-testi-card:hover .lp-testi-quote-icon {
          color: rgba(255, 255, 255, 0.04);
          transform: translateY(-4px);
        }
        
        .lp-testimonials-container {
          position: relative;
        }
        .lp-testimonials-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(122, 74, 224, 0.08) 0%, rgba(0, 0, 0, 0) 70%);
          pointer-events: none;
          z-index: 1;
        }

        /* CTA */
        .lp-cta-section {
          text-align: center;
        }
        .lp-cta-section .lp-title {
          font-size: 32px;
          max-width: 560px;
          margin: 0 auto 16px;
        }
        .lp-cta-section .lp-sub {
          max-width: 400px;
          margin: 0 auto 36px;
        }

        /* BUTTONS */
        .lp-btn-white {
          background: #fff;
          color: #000;
          font-size: 14px;
          font-weight: 500;
          padding: 12px 24px;
          border-radius: 7px;
          border: none;
          cursor: pointer;
          transition: opacity 0.2s;
          text-decoration: none;
          display: inline-block;
          font-family: 'DM Sans', sans-serif;
        }
        .lp-btn-white:hover { opacity: 0.85; }

        /* FOOTER CTA */
        .lp-footer-cta {
          border-top: 0.5px solid rgba(255,255,255,0.08);
          padding: 32px 48px;
          background: #000;
        }
        .lp-footer-cta-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          flex-wrap: wrap;
        }
        .lp-footer-cta-text {
          font-size: 36px;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          letter-spacing: -0.02em;
          background: linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.75) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* FOOTER */
        .lp-footer {
          padding: 80px 48px 40px 48px;
          border-top: 1px solid rgba(255, 255, 255, 0.04);
          background: linear-gradient(to bottom, #000 0%, #030303 100%);
          font-family: 'Outfit', sans-serif;
          position: relative;
        }
        .lp-footer-top {
          display: flex;
          justify-content: space-between;
          gap: 64px;
          flex-wrap: wrap;
          margin-bottom: 64px;
          max-width: 1200px;
          margin-left: auto;
          margin-right: auto;
        }
        .lp-footer-brand {
          max-width: 320px;
        }
        .lp-footer-logo-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
        }
        .lp-footer-logo-spark {
          color: #818cf8;
          filter: drop-shadow(0 0 6px rgba(129, 140, 248, 0.5));
        }
        .lp-footer-logo {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: #fff;
          letter-spacing: -0.02em;
        }
        .lp-footer-tagline {
          font-size: 14px;
          color: #8c8c9e;
          line-height: 1.6;
          margin-bottom: 24px;
        }
        .lp-footer-socials {
          display: flex;
          gap: 12px;
        }
        .lp-footer-social-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          color: #8c8c9e;
          transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
        }
        .lp-footer-social-link:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.15);
          color: #fff;
          transform: translateY(-3px);
        }
        .lp-footer-links-group {
          display: flex;
          gap: 64px;
          flex-wrap: wrap;
        }
        .lp-footer-col {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .lp-footer-col-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 12px;
          font-weight: 600;
          color: #fff;
          margin-bottom: 8px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          opacity: 0.9;
        }
        .lp-footer-col a,
        .lp-footer-link-btn {
          font-family: 'Outfit', sans-serif;
          font-size: 13.5px;
          color: #8c8c9e;
          text-decoration: none;
          background: none;
          border: none;
          padding: 0;
          margin: 0;
          text-align: left;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.25, 1, 0.5, 1);
          display: inline-block;
          width: fit-content;
        }
        .lp-footer-col a:hover,
        .lp-footer-link-btn:hover {
          color: #fff;
          transform: translateX(4px);
        }
        .lp-footer-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
          padding-top: 32px;
          border-top: 1px solid rgba(255, 255, 255, 0.04);
          font-size: 13px;
          color: #555;
          max-width: 1200px;
          margin-left: auto;
          margin-right: auto;
        }

        /* ═══════════════════════════════════ */
        /* BENTO GRID                         */
        /* ═══════════════════════════════════ */
        .lp-bento-wrap {
          position: relative;
          margin-top: 48px;
          padding: 4px;
        }
        .lp-bento-wrap::before {
          content: '';
          position: absolute;
          inset: -60px -40px;
          background-image: radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px);
          background-size: 28px 28px;
          mask-image: radial-gradient(ellipse 70% 60% at 50% 50%, #000 20%, transparent 100%);
          pointer-events: none;
          opacity: 0.35;
        }
        .lp-bento {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          grid-template-rows: auto auto;
          gap: 20px;
          position: relative;
        }
        .lp-bento-card {
          --accent: #fff;
          --accent-glow: rgba(255,255,255,0.12);
          border-radius: 20px;
          padding: 28px;
          background:
            radial-gradient(ellipse 120% 80% at 100% 0%, var(--accent-glow) 0%, transparent 55%),
            linear-gradient(165deg, rgba(255,255,255,0.04) 0%, rgba(8,8,8,0.95) 45%, #050505 100%);
          position: relative;
          overflow: hidden;
          transition: transform 0.45s cubic-bezier(0.22,1,0.36,1), box-shadow 0.45s ease;
          isolation: isolate;
        }
        .lp-bento-card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 20px;
          padding: 1px;
          background: linear-gradient(145deg, rgba(255,255,255,0.18), rgba(255,255,255,0.06) 40%, rgba(255,255,255,0.02));
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }
        .lp-bento-card::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 28%);
          pointer-events: none;
        }
        .lp-bento-card:hover {
          transform: translateY(-6px);
          box-shadow:
            0 24px 70px rgba(0,0,0,0.55),
            0 0 0 1px rgba(255,255,255,0.12),
            0 0 50px rgba(255,255,255,0.04);
        }
        .lp-bento-card.wide { grid-column: span 2; }
        .lp-bento-card.tall {
          grid-row: span 2;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .lp-bento-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 18px;
        }
        .lp-bento-icon {
          width: 46px;
          height: 46px;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          background: linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02));
          color: #fff;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.08);
          transition: transform 0.35s ease, box-shadow 0.35s ease;
        }
        .lp-bento-card:hover .lp-bento-icon {
          transform: scale(1.06);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.1),
            0 0 24px rgba(255,255,255,0.08);
        }
        .lp-bento-tag {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #aaa;
          padding: 5px 10px;
          border-radius: 99px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04);
        }
        .lp-bento-card h3 {
          font-size: 20px;
          font-weight: 600;
          font-family: 'Space Grotesk', sans-serif;
          background: linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.85) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 8px;
          letter-spacing: -0.015em;
        }
        .lp-bento-card p {
          font-family: 'Outfit', sans-serif;
          font-size: 13.5px;
          color: #8a8a8a;
          line-height: 1.65;
          max-width: 38ch;
        }
        .lp-bento-body { position: relative; z-index: 1; }
        .lp-bento-widget {
          position: relative;
          z-index: 1;
          margin-top: 22px;
          padding: 16px;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.06);
          background: rgba(0,0,0,0.4);
          backdrop-filter: blur(8px);
        }
        .lp-bento-stats {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 16px;
        }
        .lp-bento-stat {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 11px;
          font-weight: 600;
          padding: 5px 10px;
          border-radius: 8px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.06);
          color: #bbb;
        }
        .lp-bento-stat.up {
          color: #34D399;
          border-color: rgba(52,211,153,0.2);
          background: rgba(52,211,153,0.06);
        }

        /* 1. Tableau de bord widget */
        .lp-bento-db-grid {
          display: grid;
          grid-template-columns: 110px 1fr;
          align-items: center;
          gap: 16px;
          min-height: 80px;
        }
        .lp-bento-db-stat {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .lp-bento-db-label {
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #666;
          font-weight: 600;
        }
        .lp-bento-db-value {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 16px;
          font-weight: 700;
          color: #fff;
        }
        .lp-bento-db-trend {
          font-size: 11px;
          font-weight: 600;
        }
        .lp-bento-db-trend.up {
          color: #34D399;
        }
        .lp-bento-db-chart-container {
          position: relative;
          width: 100%;
        }
        .lp-bento-svg-chart {
          width: 100%;
          height: 70px;
          overflow: visible;
        }
        .lp-bento-svg-chart path {
          stroke-dasharray: 400;
          stroke-dashoffset: 400;
          animation: lp-bento-draw-line 2.5s ease-out forwards;
        }
        @keyframes lp-bento-draw-line {
          to { stroke-dashoffset: 0; }
        }

        /* 2. IA prompter widget */
        .lp-bento-ai-chat {
          display: flex;
          flex-direction: column;
          gap: 10px;
          font-family: 'Outfit', sans-serif;
          font-size: 11.5px;
          min-height: 140px;
          background: rgba(0,0,0,0.4);
          border-radius: 12px;
          padding: 14px;
          border: 1px solid rgba(255,255,255,0.04);
        }
        .lp-bento-chat-header {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #888;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          padding-bottom: 8px;
          margin-bottom: 4px;
        }
        .lp-bento-chat-avatar {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #fff;
          color: #000;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .lp-bento-chat-bubble {
          padding: 8px 10px;
          border-radius: 8px;
          line-height: 1.45;
          max-width: 90%;
        }
        .lp-bento-chat-bubble.prompt {
          background: rgba(255,255,255,0.06);
          color: #fff;
          align-self: flex-start;
          border-bottom-left-radius: 2px;
        }
        .lp-bento-chat-bubble.response {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          color: rgba(255,255,255,0.85);
          align-self: flex-end;
          border-bottom-right-radius: 2px;
          position: relative;
          overflow: hidden;
          width: 90%;
        }
        .typing-text {
          display: inline-block;
          animation: lp-bento-typing 8s steps(40, end) infinite;
          white-space: nowrap;
          overflow: hidden;
          width: 0;
        }
        .typing-cursor {
          display: inline-block;
          animation: lp-bento-blink 0.8s infinite;
          font-weight: bold;
          color: #fff;
          margin-left: 2px;
        }
        @keyframes lp-bento-typing {
          0% { width: 0; }
          40%, 80% { width: 100%; }
          90%, 100% { width: 0; }
        }
        @keyframes lp-bento-blink {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
        .lp-bento-ai-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-top: 18px;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #888;
        }

        /* 3. Suivi backlinks network widget */
        .lp-bento-network {
          position: relative;
          width: 100%;
          height: 110px;
          background: rgba(0,0,0,0.25);
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.04);
          overflow: hidden;
        }
        .lp-bento-net-node {
          position: absolute;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 8px;
          font-weight: 600;
          color: #fff;
          z-index: 2;
          background: #000;
          border: 1.5px solid rgba(255,255,255,0.15);
        }
        .lp-bento-net-node.main {
          width: 48px;
          height: 48px;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          border-color: #fff;
          box-shadow: 0 0 20px rgba(255,255,255,0.15);
          font-size: 9px;
        }
        .lp-bento-net-node.client {
          width: 38px;
          height: 38px;
        }
        .lp-bento-net-node.client.c1 { top: 12%; left: 10%; }
        .lp-bento-net-node.client.c2 { top: 12%; right: 10%; }
        .lp-bento-net-node.client.c3 { bottom: 8%; left: 50%; transform: translateX(-50%); }
        .lp-bento-net-svg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
        }
        .lp-bento-pulse-dot {
          position: absolute;
          width: 5px;
          height: 5px;
          background: #fff;
          border-radius: 50%;
          box-shadow: 0 0 8px #fff;
          z-index: 3;
        }
        .lp-bento-pulse-dot.p1 {
          animation: lp-bento-flow1 3s linear infinite;
        }
        .lp-bento-pulse-dot.p2 {
          animation: lp-bento-flow2 3.5s linear infinite 1s;
        }
        .lp-bento-pulse-dot.p3 {
          animation: lp-bento-flow3 2.8s linear infinite 0.5s;
        }
        @keyframes lp-bento-flow1 {
          0% { top: 20%; left: 15%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 50%; left: 50%; opacity: 0; }
        }
        @keyframes lp-bento-flow2 {
          0% { top: 20%; right: 15%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 50%; right: 50%; opacity: 0; }
        }
        @keyframes lp-bento-flow3 {
          0% { bottom: 12%; left: 50%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { bottom: 50%; left: 50%; opacity: 0; }
        }

        /* 4. Audit technique ring widget */
        .lp-bento-audit-widget {
          display: grid;
          grid-template-columns: 80px 1fr;
          align-items: center;
          gap: 16px;
          min-height: 80px;
        }
        .lp-bento-ring-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }
        .lp-bento-ring-label {
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #666;
          font-weight: 600;
        }
        .lp-bento-ring {
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          width: 56px;
          height: 56px;
        }
        .lp-bento-ring svg { width: 100%; height: 100%; }
        .lp-bento-ring span {
          position: absolute;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 13px;
          font-weight: 700;
          color: #fff;
        }
        .lp-bento-audit-details {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .lp-bento-audit-row {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: 'Outfit', sans-serif;
          font-size: 11px;
        }
        .lp-bento-audit-row.ok { color: rgba(255,255,255,0.8); }
        .lp-bento-audit-row.ok i { color: #34D399; font-weight: bold; font-style: normal; }
        .lp-bento-audit-row.warning { color: #888; }
        .lp-bento-audit-row.warning i { color: #F59E0B; font-weight: bold; font-style: normal; }

        /* 5. Suivi de positions sparkline widget */
        .lp-bento-spark-widget {
          display: flex;
          flex-direction: column;
          gap: 12px;
          min-height: 80px;
        }
        .lp-bento-spark-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-family: 'Space Grotesk', sans-serif;
        }
        .lp-bento-spark-keyword {
          font-size: 11px;
          color: rgba(255,255,255,0.6);
        }
        .lp-bento-spark-rank-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 600;
          color: #fff;
          padding: 4px 8px;
          border-radius: 6px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
        }
        .lp-bento-spark-chart-container {
          width: 100%;
          position: relative;
        }
        .lp-bento-spark-svg {
          width: 100%;
          height: 40px;
          overflow: visible;
        }
        .lp-bento-spark-svg polyline {
          fill: none;
          stroke: #fff;
          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        /* 6. Analyse concurrentielle compare widget */
        .lp-bento-compare-widget {
          display: flex;
          flex-direction: column;
          gap: 12px;
          min-height: 80px;
          width: 100%;
        }
        .lp-bento-compare-row {
          display: grid;
          grid-template-columns: 110px 1fr 24px;
          align-items: center;
          gap: 12px;
        }
        .lp-bento-comp-name {
          font-size: 11px;
          color: #666;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .lp-bento-comp-name.active {
          color: #fff;
          font-weight: 600;
        }
        .lp-bento-comp-bar-container {
          height: 6px;
          border-radius: 99px;
          background: rgba(255,255,255,0.05);
          overflow: hidden;
        }
        .lp-bento-comp-bar {
          height: 100%;
          border-radius: 99px;
          background: rgba(255,255,255,0.15);
        }
        .lp-bento-comp-bar.active {
          background: linear-gradient(90deg, #ffffff, rgba(255,255,255,0.6));
          box-shadow: 0 0 10px rgba(255,255,255,0.2);
        }
        .lp-bento-comp-val {
          font-size: 11px;
          color: #666;
          text-align: right;
          font-family: 'Space Grotesk', sans-serif;
        }
        .lp-bento-comp-val.active {
          color: #fff;
          font-weight: 700;
        }(255,255,255,0.05);
          overflow: hidden;
        }
        .lp-bento-compare-bar div {
          height: 100%;
          border-radius: 99px;
          background: linear-gradient(90deg, #fff, rgba(255,255,255,0.45));
          animation: lp-bento-fill-bar 1.2s ease forwards;
          width: 0;
        }
        .lp-bento-compare-row.muted .lp-bento-compare-bar div {
          background: rgba(255,255,255,0.15);
        }
        @keyframes lp-bento-fill-bar {
          to { width: var(--w); }
        }

        /* ═══════════════════════════════════ */
        /* RESULTS TICKER                     */
        /* ═══════════════════════════════════ */
        .lp-ticker-track {
          width: 100%;
          overflow: hidden;
          padding: 24px 0;
          border-top: 1px solid rgba(255, 255, 255, 0.03);
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
          background: radial-gradient(80% 50% at 50% 50%, rgba(167, 139, 250, 0.04) 0%, rgba(255, 255, 255, 0.01) 60%, transparent 100%);
          mask-image: linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%);
          -webkit-mask-image: linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%);
        }
        .lp-ticker-inner {
          display: flex;
          gap: 24px;
          width: max-content;
          animation: lp-ticker 35s linear infinite;
        }
        .lp-ticker-inner:hover {
          animation-play-state: paused;
        }
        @keyframes lp-ticker {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .lp-ticker-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 6px 16px;
          border-radius: 99px;
          backdrop-filter: blur(8px);
          white-space: nowrap;
          font-family: 'Outfit', sans-serif;
          font-size: 13.5px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.82);
          flex-shrink: 0;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          line-height: 1;
        }
        
        /* Purple and White color glows mapped to centerpiece ring reflections */
        .lp-ticker-item:has(.up) {
          border: 1px solid rgba(167, 139, 250, 0.12);
          background: linear-gradient(90deg, rgba(167, 139, 250, 0.03) 0%, rgba(255, 255, 255, 0.015) 100%);
          box-shadow: 0 2px 8px rgba(167, 139, 250, 0.02);
        }
        .lp-ticker-item:has(.up):hover {
          border-color: rgba(167, 139, 250, 0.35);
          background: linear-gradient(90deg, rgba(167, 139, 250, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6), 0 0 15px rgba(167, 139, 250, 0.12);
          transform: translateY(-1.5px) scale(1.015);
        }

        .lp-ticker-item:has(.score) {
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: linear-gradient(90deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.01) 100%);
          box-shadow: 0 2px 8px rgba(255, 255, 255, 0.01);
        }
        .lp-ticker-item:has(.score):hover {
          border-color: rgba(255, 255, 255, 0.25);
          background: linear-gradient(90deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.015) 100%);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6), 0 0 15px rgba(255, 255, 255, 0.08);
          transform: translateY(-1.5px) scale(1.015);
        }

        .lp-ticker-item:has(.rank) {
          border: 1px solid rgba(167, 139, 250, 0.12);
          background: linear-gradient(90deg, rgba(167, 139, 250, 0.03) 0%, rgba(255, 255, 255, 0.015) 100%);
          box-shadow: 0 2px 8px rgba(167, 139, 250, 0.02);
        }
        .lp-ticker-item:has(.rank):hover {
          border-color: rgba(167, 139, 250, 0.35);
          background: linear-gradient(90deg, rgba(167, 139, 250, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6), 0 0 15px rgba(167, 139, 250, 0.12);
          transform: translateY(-1.5px) scale(1.015);
        }

        .lp-ticker-site {
          font-family: 'Outfit', sans-serif;
          font-size: 12.5px;
          color: rgba(255, 255, 255, 0.38);
          font-weight: 400;
          background: transparent;
          border: none;
          padding: 0;
          margin: 0;
          border-radius: 0;
          letter-spacing: 0.01em;
        }
        .lp-ticker-site::before {
          content: "•";
          margin-right: 8px;
          margin-left: 8px;
          color: rgba(255, 255, 255, 0.15);
          font-size: 8px;
          display: inline-block;
        }
        
        .lp-ticker-badge {
          font-family: 'Outfit', sans-serif;
          font-size: 12.5px;
          font-weight: 600;
          padding: 0;
          border-radius: 0;
          background: transparent !important;
          border: none !important;
          letter-spacing: -0.01em;
          display: inline-flex;
          align-items: center;
          gap: 3px;
          line-height: 1;
        }
        .lp-ticker-badge.up {
          color: #a78bfa;
        }
        .lp-ticker-badge.score {
          color: #ffffff;
        }
        .lp-ticker-badge.rank {
          color: #a78bfa;
        }

        /* ═══════════════════════════════════ */
        /* TECH STACK                         */
        /* ═══════════════════════════════════ */
        .lp-tech-section {
          padding: 120px 48px;
          background: #000;
          position: relative;
          overflow: hidden;
        }
        .lp-tech-container {
          display: grid;
          grid-template-columns: 1.3fr 1.7fr;
          gap: 80px;
          align-items: center;
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
          z-index: 2;
        }
        .lp-tech-info-side {
          text-align: left;
        }
        .lp-tech-info-side .lp-label {
          margin-bottom: 24px;
        }
        .lp-tech-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(34px, 4.5vw, 48px);
          font-weight: 700;
          line-height: 1.15;
          letter-spacing: -0.03em;
          margin-bottom: 24px;
          background: linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.7) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .lp-tech-lead {
          font-family: 'Outfit', sans-serif;
          font-size: 16px;
          color: #8c8c9e;
          line-height: 1.8;
        }
        .lp-tech-logos-side {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        .lp-tech-logo-card {
          background: rgba(255, 255, 255, 0.015);
          border: 1px solid rgba(255, 255, 255, 0.03);
          border-radius: 18px;
          padding: 32px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
          cursor: default;
          position: relative;
        }
        .lp-tech-logo-icon {
          filter: grayscale(100%);
          opacity: 0.35;
          transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .lp-tech-logo-name {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 13.5px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.3);
          transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
        }
        
        /* Hover states */
        .lp-tech-logo-card:hover {
          background: rgba(255, 255, 255, 0.03);
          transform: translateY(-5px);
        }
        .lp-tech-logo-card:hover .lp-tech-logo-icon {
          filter: grayscale(0%);
          opacity: 1;
          transform: scale(1.08);
        }
        .lp-tech-logo-card:hover .lp-tech-logo-name {
          color: #fff;
        }
        
        /* Individual Glows & Border colors on hover */
        .lp-tech-logo-card.gemini:hover {
          border-color: rgba(43, 102, 255, 0.35);
          box-shadow: 0 10px 40px rgba(43, 102, 255, 0.08);
        }
        .lp-tech-logo-card.google:hover {
          border-color: rgba(66, 133, 244, 0.35);
          box-shadow: 0 10px 40px rgba(66, 133, 244, 0.08);
        }
        .lp-tech-logo-card.fastapi:hover {
          border-color: rgba(0, 150, 136, 0.35);
          box-shadow: 0 10px 40px rgba(0, 150, 136, 0.08);
        }
        .lp-tech-logo-card.react:hover {
          border-color: rgba(97, 218, 251, 0.35);
          box-shadow: 0 10px 40px rgba(97, 218, 251, 0.08);
        }
        .lp-tech-logo-card.ssl:hover {
          border-color: rgba(255, 179, 0, 0.35);
          box-shadow: 0 10px 40px rgba(255, 179, 0, 0.08);
        }
        .lp-tech-logo-card.mongodb:hover {
          border-color: rgba(77, 179, 61, 0.35);
          box-shadow: 0 10px 40px rgba(77, 179, 61, 0.08);
        }
        
        @keyframes react-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .lp-tech-logo-card:hover .react-atom-icon {
          animation: react-spin 8s linear infinite;
        }

        /* Mobile responsiveness for tech grid */
        @media (max-width: 968px) {
          .lp-tech-container {
            grid-template-columns: 1fr;
            gap: 48px;
            text-align: center;
          }
          .lp-tech-info-side {
            text-align: center;
          }
          .lp-tech-logos-side {
            max-width: 600px;
            margin: 0 auto;
            width: 100%;
          }
        }
        @media (max-width: 580px) {
          .lp-tech-logos-side {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        /* ═══════════════════════════════════ */
        /* FAQ ACCORDION                      */
        /* ═══════════════════════════════════ */
        .lp-faq-list {
          max-width: 680px;
          margin: 48px auto 0;
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .lp-faq-item-wrap:first-child .lp-faq-item {
          border-top: 0.5px solid rgba(255,255,255,0.08);
        }
        .lp-faq-item {
          border-bottom: 0.5px solid rgba(255,255,255,0.08);
        }
        .lp-faq-q {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 22px 0;
          font-size: 15px;
          font-weight: 500;
          color: #fff;
          background: none;
          border: none;
          width: 100%;
          text-align: left;
          cursor: pointer;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 500;
          transition: color 0.2s;
        }
        .lp-faq-q:hover {
          color: #ccc;
        }
        .lp-faq-arrow {
          font-size: 18px;
          color: #555;
          transition: transform 0.3s ease;
          flex-shrink: 0;
          margin-left: 16px;
        }
        .lp-faq-item.open .lp-faq-arrow {
          transform: rotate(45deg);
        }
        .lp-faq-a {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.4s cubic-bezier(0.22,1,0.36,1), padding 0.4s;
          padding: 0 0;
        }
        .lp-faq-item.open .lp-faq-a {
          max-height: 200px;
          padding-bottom: 22px;
        }
        .lp-faq-a p {
          font-size: 14px;
          color: #888;
          line-height: 1.7;
        }

        /* REVEAL ANIMATION */
        .lp-reveal {
          opacity: 0;
          transform: translateY(32px);
          transition: opacity 0.7s cubic-bezier(0.22,1,0.36,1), transform 0.7s cubic-bezier(0.22,1,0.36,1);
        }
        .lp-reveal.lp-from-left {
          transform: translateX(-32px);
        }
        .lp-reveal.lp-from-right {
          transform: translateX(32px);
        }
        .lp-reveal.lp-visible {
          opacity: 1;
          transform: translate(0, 0);
        }
        .lp-delay-1 { transition-delay: 0.1s; }
        .lp-delay-2 { transition-delay: 0.2s; }
        .lp-delay-3 { transition-delay: 0.3s; }
        .lp-delay-4 { transition-delay: 0.4s; }

        @media (prefers-reduced-motion: reduce) {
          .lp-reveal { opacity: 1; transform: none; transition: none; }
        }

        /* RESPONSIVE */
        @media (max-width: 768px) {
          .holo-canvas-layer {
            width: 95vw;
          }
          .holo-text-layer {
            padding: 0 8vw;
          }
          .holo-seo-title {
            margin-bottom: 16vw;
            font-size: 11vw;
            -webkit-text-stroke: 1.8px rgba(255, 255, 255, 0.95);
          }
          .holo-improves-title {
            font-size: 11vw;
            -webkit-text-stroke: 1.8px rgba(255, 255, 255, 0.95);
          }
          .holo-ranking-title {
            font-size: 11vw;
            -webkit-text-stroke: 1.8px rgba(255, 255, 255, 0.95);
            margin-top: 1vw;
          }
          #canvas-bottom {
            clip-path: polygon(44% 0, 100% 0, 100% 100%, 44% 100%);
          }
          #canvas-top {
            clip-path: polygon(0 0, 44% 0, 44% 100%, 0 100%);
          }
          .holo-navbar {
            height: 70px;
            padding: 0 5vw;
          }
          .holo-navbar-right {
            gap: 1.5rem;
          }
          .holo-nav-link {
            font-size: 0.85rem;
          }
          .holo-nav-btn {
            font-size: 0.85rem;
            padding: 0.5rem 1.2rem;
          }

          .lp-section {
            padding: 64px 20px;
          }
          .lp-features-split {
            grid-template-columns: 1fr;
          }
          .lp-features-left {
            padding-right: 0;
            margin-bottom: 32px;
            align-self: auto;
          }
          .lp-features-left-inner {
            position: relative;
            top: auto;
          }
          .lp-features-divider {
            display: none;
          }
          .lp-features-right {
            padding-left: 0;
          }
          .lp-step-row {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          .lp-step-num {
            font-size: 80px;
          }
          .lp-step-content {
            padding: 0;
          }
          .lp-footer-cta,
          .lp-footer {
            padding-left: 20px;
            padding-right: 20px;
          }
          .lp-footer-links-group {
            gap: 28px;
          }
          .lp-bento {
            grid-template-columns: 1fr;
          }
          .lp-bento-card.wide,
          .lp-bento-card.tall {
            grid-column: span 1;
            grid-row: span 1;
          }
        }

        @media (max-width: 640px) {
          .holo-navbar .holo-nav-link {
            display: none;
          }
        }

        /* ═══════════════════════════════════════════════ */
        /* MODAL OVERLAYS (GLASSMORPHIC)                 */
        /* ═══════════════════════════════════════════════ */
        /* consolidated footer button style */

        .lp-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          animation: lp-fade-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .lp-modal-window {
          background: rgba(15, 15, 15, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.05);
          border-radius: 20px;
          width: 100%;
          max-width: 800px;
          max-height: 85vh;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
          animation: lp-zoom-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          color: #e5e5e5;
          font-family: 'Outfit', sans-serif;
        }

        .lp-modal-window.large {
          max-width: 950px;
        }

        .lp-modal-window.small {
          max-width: 600px;
        }

        .lp-modal-header {
          padding: 20px 28px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .lp-modal-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 20px;
          font-weight: 700;
          color: #fff;
          margin: 0;
          letter-spacing: -0.01em;
        }

        .lp-modal-close-btn {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #999;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .lp-modal-close-btn:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.15);
          color: #fff;
          transform: rotate(90deg);
        }

        .lp-modal-body {
          padding: 28px;
          overflow-y: auto;
          flex: 1;
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,0.1) transparent;
        }

        .lp-modal-body::-webkit-scrollbar {
          width: 6px;
        }
        .lp-modal-body::-webkit-scrollbar-thumb {
          background-color: rgba(255,255,255,0.1);
          border-radius: 3px;
        }

        @keyframes lp-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes lp-zoom-in {
          from { opacity: 0; transform: scale(0.96) translateY(12px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        .lp-contact-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .lp-form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        @media (max-width: 640px) {
          .lp-form-row {
            grid-template-columns: 1fr;
          }
        }

        .lp-form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .lp-form-group label {
          font-size: 13px;
          font-weight: 500;
          color: #aaa;
        }

        .lp-form-group input,
        .lp-form-group textarea {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          padding: 10px 14px;
          color: #fff;
          font-family: inherit;
          font-size: 14px;
          transition: all 0.2s ease;
          outline: none;
        }

        .lp-form-group input:focus,
        .lp-form-group textarea:focus {
          border-color: rgba(0, 230, 255, 0.5);
          box-shadow: 0 0 10px rgba(0, 230, 255, 0.15);
          background: rgba(255, 255, 255, 0.05);
        }

        .lp-contact-submit-btn {
          background: linear-gradient(135deg, #00f0ff 0%, #0072ff 100%);
          border: none;
          border-radius: 8px;
          padding: 12px;
          color: #000;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-top: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .lp-contact-submit-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 0 20px rgba(0, 240, 255, 0.4);
        }

        .lp-contact-submit-btn:disabled {
          background: rgba(255, 255, 255, 0.1);
          color: #666;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .lp-contact-loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 30px 0;
          gap: 16px;
          text-align: center;
        }

        .lp-glass-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(0, 230, 255, 0.1);
          border-radius: 50%;
          border-top-color: #00f0ff;
          animation: spin 0.8s linear infinite;
        }

        .lp-success-checkmark {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: rgba(0, 255, 136, 0.1);
          border: 1px solid rgba(0, 255, 136, 0.3);
          color: #00ff88;
          font-size: 28px;
          margin-bottom: 12px;
          animation: scale-up 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes scale-up {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        .lp-blog-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 20px;
        }

        .lp-blog-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .lp-blog-card:hover {
          transform: translateY(-4px);
          border-color: rgba(0, 230, 255, 0.3);
          background: rgba(255, 255, 255, 0.04);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.4);
        }

        .lp-blog-card-img-placeholder {
          height: 120px;
          background: linear-gradient(135deg, rgba(0, 240, 255, 0.08) 0%, rgba(0, 114, 255, 0.08) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(0, 230, 255, 0.6);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .lp-blog-card-content {
          padding: 16px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .lp-blog-card-meta {
          font-size: 11px;
          color: #666;
          margin-bottom: 6px;
        }

        .lp-blog-card-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 15px;
          font-weight: 600;
          color: #fff;
          margin: 0 0 8px 0;
          line-height: 1.4;
        }

        .lp-blog-card-excerpt {
          font-size: 12px;
          color: #aaa;
          margin: 0 0 12px 0;
          line-height: 1.5;
          flex: 1;
        }

        .lp-blog-card-link {
          font-size: 12px;
          color: #00f0ff;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .lp-blog-reader-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }

        .lp-blog-back-btn {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 6px;
          padding: 6px 12px;
          color: #fff;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .lp-blog-back-btn:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.15);
        }

        .lp-blog-post-meta {
          font-size: 12px;
          color: #777;
          margin-bottom: 12px;
        }

        .lp-blog-post-body {
          line-height: 1.7;
          font-size: 14px;
          color: #ccc;
        }

        .lp-blog-post-body h3 {
          font-family: 'Space Grotesk', sans-serif;
          color: #fff;
          font-size: 17px;
          margin-top: 24px;
          margin-bottom: 10px;
        }

        .lp-blog-post-body p {
          margin-bottom: 14px;
        }

        .lp-blog-post-body ul {
          margin-bottom: 14px;
          padding-left: 18px;
        }

        .lp-blog-post-body li {
          margin-bottom: 6px;
        }

        .lp-blog-post-body .tip-box {
          background: rgba(0, 230, 255, 0.04);
          border-left: 3px solid #00f0ff;
          padding: 14px;
          border-radius: 0 8px 8px 0;
          margin: 20px 0;
        }

        .lp-docs-layout {
          display: grid;
          grid-template-columns: 180px 1fr;
          gap: 24px;
          min-height: 350px;
        }

        @media (max-width: 640px) {
          .lp-docs-layout {
            grid-template-columns: 1fr;
            gap: 16px;
          }
        }

        .lp-docs-sidebar {
          display: flex;
          flex-direction: column;
          gap: 4px;
          border-right: 1px solid rgba(255, 255, 255, 0.06);
          padding-right: 12px;
        }

        @media (max-width: 640px) {
          .lp-docs-sidebar {
            border-right: none;
            border-bottom: 1px solid rgba(255, 255, 255, 0.06);
            padding-right: 0;
            padding-bottom: 12px;
            flex-direction: row;
            overflow-x: auto;
          }
        }

        .lp-docs-tab-btn {
          background: none;
          border: none;
          border-radius: 6px;
          padding: 8px 12px;
          text-align: left;
          color: #888;
          font-family: inherit;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .lp-docs-tab-btn:hover {
          color: #fff;
          background: rgba(255, 255, 255, 0.02);
        }

        .lp-docs-tab-btn.active {
          color: #00f0ff;
          background: rgba(0, 240, 255, 0.06);
          font-weight: 600;
        }

        .lp-docs-content {
          font-size: 13px;
          line-height: 1.6;
          color: #ccc;
        }

        .lp-docs-content h3 {
          font-family: 'Space Grotesk', sans-serif;
          color: #fff;
          font-size: 17px;
          margin-bottom: 14px;
          margin-top: 0;
        }

        .lp-docs-content h4 {
          color: #fff;
          font-size: 13px;
          margin-top: 18px;
          margin-bottom: 6px;
        }

        .lp-docs-code-block {
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 6px;
          padding: 10px;
          font-family: monospace;
          font-size: 11px;
          color: #00ff88;
          overflow-x: auto;
          margin: 10px 0;
        }

        .lp-guides-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .lp-guide-item {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 8px;
          overflow: hidden;
          transition: all 0.2s ease;
        }

        .lp-guide-item:hover {
          border-color: rgba(255, 255, 255, 0.1);
        }

        .lp-guide-header {
          padding: 14px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          user-select: none;
        }

        .lp-guide-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 14px;
          font-weight: 600;
          color: #fff;
        }

        .lp-guide-icon {
          color: #666;
          transition: transform 0.2s ease;
        }

        .lp-guide-item.open .lp-guide-icon {
          transform: rotate(180deg);
          color: #00f0ff;
        }

        .lp-guide-content {
          padding: 0 20px 20px 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.04);
          color: #ccc;
          font-size: 13px;
          line-height: 1.6;
          animation: lp-fade-in 0.2s ease forwards;
        }

        .lp-legal-text {
          font-size: 12px;
          line-height: 1.6;
          color: #aaa;
        }

        .lp-legal-text h3 {
          font-family: 'Space Grotesk', sans-serif;
          color: #fff;
          font-size: 14px;
          margin-top: 20px;
          margin-bottom: 6px;
        }

        .lp-legal-text p {
          margin-bottom: 10px;
        }
      `}</style>

      {/* SVG Filter for black-to-transparent chroma key */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <filter id="black-to-transparent" colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values="
            1 0 0 0 0
            0 1 0 0 0
            0 0 1 0 0
            3 3 3 0 -0.15
          "/>
        </filter>
      </svg>

      {/* ═══════════════════════════════════ */}
      {/* HERO SECTION (original)            */}
      {/* ═══════════════════════════════════ */}
      <div className="holo-hero-screen">
        {/* Navigation Bar */}
        <nav className="holo-navbar">
          <div className="holo-navbar-left">
            <svg className="holo-logo" viewBox="0 0 160 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <text x="0" y="30" fontFamily="'Montserrat', sans-serif" fontWeight="900" fontSize="28" fill="#ffffff">SE</text>
              <circle cx="58" cy="20" r="11" stroke="#ffffff" strokeWidth="3" fill="none"/>
              <line x1="66" y1="28" x2="75" y2="37" stroke="#ffffff" strokeWidth="3" strokeLinecap="round"/>
              <path d="M53 20.5L56.5 24L63 17" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M66 12L74 4M74 4H68M74 4V10" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="holo-navbar-right">
            <button onClick={() => navigate('/pricing')} className="holo-nav-link">Features</button>
            <button onClick={() => navigate('/pricing')} className="holo-nav-link">Pricing</button>
            {user ? (
              <Link to="/dashboard" className="holo-nav-btn">Dashboard</Link>
            ) : (
              <Link to="/login" className="holo-nav-btn">Sign in</Link>
            )}
          </div>
        </nav>

        <div className="holo-hero-container">
          {/* Bottom Canvas (Behind Text) */}
          <canvas id="canvas-bottom" className="holo-canvas-layer" ref={canvasBottomRef}></canvas>

          {/* Typography Layer (In Between) */}
          <div className="holo-text-layer">
            <div className="holo-text-wrapper">
              <h1 className="holo-title holo-seo-title">SEO</h1>
              <h1 className="holo-title holo-improves-title">IMPROVES</h1>
              <h1 className="holo-title holo-ranking-title">YOUR RANKING</h1>
            </div>
          </div>

          {/* Top Canvas (In Front of Text) */}
          <canvas id="canvas-top" className="holo-canvas-layer" ref={canvasTopRef}></canvas>
        </div>
      </div>

      {/* ═══════════════════════════════════ */}
      {/* LANDING PAGE SECTIONS              */}
      {/* ═══════════════════════════════════ */}
      <div className="lp-sections">

        {/* RESULTS TICKER */}
        <section className="lp-section" style={{ paddingLeft: 0, paddingRight: 0, paddingTop: 120, paddingBottom: 48 }}>
          <div className="lp-ticker-track">
            <div className="lp-ticker-inner">
              <div className="lp-ticker-item"><span className="lp-ticker-badge up">↑ 127%</span> Trafic organique <span className="lp-ticker-site">boutique-mode.fr</span></div>
              <div className="lp-ticker-item"><span className="lp-ticker-badge score">92/100</span> Score SEO <span className="lp-ticker-site">startup-tech.io</span></div>
              <div className="lp-ticker-item"><span className="lp-ticker-badge rank">☆ Top 3</span> Position Google <span className="lp-ticker-site">agence-immo.ma</span></div>
              <div className="lp-ticker-item"><span className="lp-ticker-badge up">↑ 340%</span> Visites mensuelles <span className="lp-ticker-site">blog-sante.com</span></div>
              <div className="lp-ticker-item"><span className="lp-ticker-badge score">88/100</span> Performance <span className="lp-ticker-site">e-learning.fr</span></div>
              <div className="lp-ticker-item"><span className="lp-ticker-badge rank">☆ Page 1</span> 14 mots-clés <span className="lp-ticker-site">coach-fitness.ma</span></div>
              <div className="lp-ticker-item"><span className="lp-ticker-badge up">↑ 89%</span> Conversions <span className="lp-ticker-site">saas-maroc.com</span></div>
              <div className="lp-ticker-item"><span className="lp-ticker-badge score">95/100</span> Accessibilité <span className="lp-ticker-site">dev-agency.io</span></div>
              {/* duplicate */}
              <div className="lp-ticker-item"><span className="lp-ticker-badge up">↑ 127%</span> Trafic organique <span className="lp-ticker-site">boutique-mode.fr</span></div>
              <div className="lp-ticker-item"><span className="lp-ticker-badge score">92/100</span> Score SEO <span className="lp-ticker-site">startup-tech.io</span></div>
              <div className="lp-ticker-item"><span className="lp-ticker-badge rank">☆ Top 3</span> Position Google <span className="lp-ticker-site">agence-immo.ma</span></div>
              <div className="lp-ticker-item"><span className="lp-ticker-badge up">↑ 340%</span> Visites mensuelles <span className="lp-ticker-site">blog-sante.com</span></div>
              <div className="lp-ticker-item"><span className="lp-ticker-badge score">88/100</span> Performance <span className="lp-ticker-site">e-learning.fr</span></div>
              <div className="lp-ticker-item"><span className="lp-ticker-badge rank">☆ Page 1</span> 14 mots-clés <span className="lp-ticker-site">coach-fitness.ma</span></div>
              <div className="lp-ticker-item"><span className="lp-ticker-badge up">↑ 89%</span> Conversions <span className="lp-ticker-site">saas-maroc.com</span></div>
              <div className="lp-ticker-item"><span className="lp-ticker-badge score">95/100</span> Accessibilité <span className="lp-ticker-site">dev-agency.io</span></div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section id="lp-features" className="lp-section">
          <div className="lp-label">Fonctionnalités principales</div>
          <div className="lp-features-split">
            <div className="lp-features-left">
              <div className="lp-features-left-inner">
                <div className="lp-title lp-reveal lp-from-left">Tout ce dont tu as besoin pour <span className="glow">dominer Google</span></div>
                <div className="lp-sub lp-reveal lp-from-left lp-delay-1">Un seul outil pour analyser, créer et optimiser — sans avoir besoin d'être expert en SEO.<br /><br />Analyse tes concurrents, génère du contenu optimisé et suis l'évolution de ton positionnement en temps réel, sans avoir besoin d'un expert.</div>
              </div>
            </div>
            <div className="lp-features-divider"></div>
            <div className="lp-features-right lp-reveal lp-from-right">
              <div className="lp-feat">
                <span className="lp-feat-num">01</span>
                <div>
                  <h3>Analyse de mots-clés</h3>
                  <p>Découvre les opportunités à fort potentiel selon ton secteur et ta concurrence.</p>
                </div>
              </div>
              <div className="lp-feat">
                <span className="lp-feat-num">02</span>
                <div>
                  <h3>Génération de contenu</h3>
                  <p>Crée des articles, méta-descriptions et titres optimisés automatiquement.</p>
                </div>
              </div>
              <div className="lp-feat">
                <span className="lp-feat-num">03</span>
                <div>
                  <h3>Audit technique SEO</h3>
                  <p>Détecte et corrige les erreurs qui bloquent ton positionnement sur les moteurs de recherche.</p>
                </div>
              </div>
              <div className="lp-feat">
                <span className="lp-feat-num">04</span>
                <div>
                  <h3>Analyse des backlinks</h3>
                  <p>Surveille tes liens entrants et identifie les opportunités de netlinking.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* COMPARE TABLE */}
        <section id="lp-compare" className="lp-section">
          <div className="lp-label lp-reveal">Comparatif</div>
          <div className="lp-title lp-reveal lp-delay-1">Avec ou sans l'assistant ?</div>
          <div className="lp-table-wrap lp-reveal lp-delay-2">
            <table className="lp-table">
              <thead>
                <tr>
                  <th>Tâche SEO</th>
                  <th>Sans l'assistant</th>
                  <th>Avec l'assistant</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Recherche de mots-clés</td>
                  <td className="lp-td-sans">2–4 heures manuellement</td>
                  <td className="lp-td-check"><span className="lp-dot"></span>30 secondes</td>
                </tr>
                <tr>
                  <td>Rédaction d'un article</td>
                  <td className="lp-td-sans">3–5 heures</td>
                  <td className="lp-td-check"><span className="lp-dot"></span>Généré en 2 minutes</td>
                </tr>
                <tr>
                  <td>Audit technique complet</td>
                  <td className="lp-td-sans">Nécessite un expert</td>
                  <td className="lp-td-check"><span className="lp-dot"></span>Automatique et instantané</td>
                </tr>
                <tr>
                  <td>Suivi des positions</td>
                  <td className="lp-td-sans">Plusieurs outils payants</td>
                  <td className="lp-td-check"><span className="lp-dot"></span>Tout en un seul tableau de bord</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="lp-how" className="lp-section">
          <div className="lp-label lp-reveal">Comment ça marche</div>
          <div className="lp-title lp-reveal lp-delay-1">Simple, rapide et efficace</div>
          <div className="lp-steps">
            <div className="lp-step-row lp-reveal">
              <div className="lp-step-num">01</div>
              <div className="lp-step-content">
                <div className="lp-step-label">Étape 01</div>
                <h3>Connecte ton site</h3>
                <p>Saisis l'URL de ton site et laisse l'assistant analyser ton état SEO actuel en quelques secondes.</p>
              </div>
            </div>
            <div className="lp-step-row lp-reveal lp-delay-1">
              <div className="lp-step-num">02</div>
              <div className="lp-step-content">
                <div className="lp-step-label">Étape 02</div>
                <h3>Reçois ton rapport</h3>
                <p>Obtiens un rapport complet avec les points à améliorer classés par priorité et impact.</p>
              </div>
            </div>
            <div className="lp-step-row lp-reveal lp-delay-2">
              <div className="lp-step-num">03</div>
              <div className="lp-step-content">
                <div className="lp-step-label">Étape 03</div>
                <h3>Applique les suggestions</h3>
                <p>Génère du contenu, corrige les erreurs et vois ton trafic augmenter progressivement.</p>
              </div>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="lp-section lp-testimonials-container" style={{ paddingLeft: 0, paddingRight: 0, overflow: 'hidden' }}>
          <div className="lp-testimonials-glow"></div>
          <div style={{ padding: '0 48px', marginBottom: 40, position: 'relative', zIndex: 2 }}>
            <div className="lp-label lp-reveal">Témoignages</div>
            <div className="lp-title lp-reveal lp-delay-1">Ce que disent nos utilisateurs</div>
          </div>
          <div className="lp-marquee-track" style={{ position: 'relative', zIndex: 2 }}>
            <div className="lp-marquee-inner">
              <div className="lp-testi-card">
                <div className="lp-testi-rating">
                  <span className="lp-testi-star">★</span>
                  <span className="lp-testi-star">★</span>
                  <span className="lp-testi-star">★</span>
                  <span className="lp-testi-star">★</span>
                  <span className="lp-testi-star">★</span>
                </div>
                <p className="lp-testi-text">"En 2 semaines, mon trafic a doublé. Je n'avais aucune connaissance en SEO avant."</p>
                <div className="lp-testi-user">
                  <div className="lp-testi-avatar avatar-k">K</div>
                  <div className="lp-testi-info">
                    <span className="lp-testi-name">Karim</span>
                    <span className="lp-testi-role">Freelance développeur web</span>
                  </div>
                </div>
                <span className="lp-testi-quote-icon">“</span>
              </div>
              <div className="lp-testi-card">
                <div className="lp-testi-rating">
                  <span className="lp-testi-star">★</span>
                  <span className="lp-testi-star">★</span>
                  <span className="lp-testi-star">★</span>
                  <span className="lp-testi-star">★</span>
                  <span className="lp-testi-star">★</span>
                </div>
                <p className="lp-testi-text">"L'audit m'a révélé des erreurs critiques que j'ignorais depuis des mois. Incroyable."</p>
                <div className="lp-testi-user">
                  <div className="lp-testi-avatar avatar-s">S</div>
                  <div className="lp-testi-info">
                    <span className="lp-testi-name">Sara</span>
                    <span className="lp-testi-role">E-commerçante</span>
                  </div>
                </div>
                <span className="lp-testi-quote-icon">“</span>
              </div>
              <div className="lp-testi-card">
                <div className="lp-testi-rating">
                  <span className="lp-testi-star">★</span>
                  <span className="lp-testi-star">★</span>
                  <span className="lp-testi-star">★</span>
                  <span className="lp-testi-star">★</span>
                  <span className="lp-testi-star">★</span>
                </div>
                <p className="lp-testi-text">"La génération de contenu m'a fait gagner des heures chaque semaine. Je recommande à 100%."</p>
                <div className="lp-testi-user">
                  <div className="lp-testi-avatar avatar-m">M</div>
                  <div className="lp-testi-info">
                    <span className="lp-testi-name">Mehdi</span>
                    <span className="lp-testi-role">Consultant digital</span>
                  </div>
                </div>
                <span className="lp-testi-quote-icon">“</span>
              </div>
              <div className="lp-testi-card">
                <div className="lp-testi-rating">
                  <span className="lp-testi-star">★</span>
                  <span className="lp-testi-star">★</span>
                  <span className="lp-testi-star">★</span>
                  <span className="lp-testi-star">★</span>
                  <span className="lp-testi-star">★</span>
                </div>
                <p className="lp-testi-text">"Mon site est passé en première page Google en moins d'un mois. Résultats bluffants."</p>
                <div className="lp-testi-user">
                  <div className="lp-testi-avatar avatar-i">I</div>
                  <div className="lp-testi-info">
                    <span className="lp-testi-name">Ines</span>
                    <span className="lp-testi-role">Blogueuse lifestyle</span>
                  </div>
                </div>
                <span className="lp-testi-quote-icon">“</span>
              </div>
              <div className="lp-testi-card">
                <div className="lp-testi-rating">
                  <span className="lp-testi-star">★</span>
                  <span className="lp-testi-star">★</span>
                  <span className="lp-testi-star">★</span>
                  <span className="lp-testi-star">★</span>
                  <span className="lp-testi-star">★</span>
                </div>
                <p className="lp-testi-text">"Interface simple, résultats concrets. Exactement ce dont j'avais besoin pour mon agence."</p>
                <div className="lp-testi-user">
                  <div className="lp-testi-avatar avatar-y">Y</div>
                  <div className="lp-testi-info">
                    <span className="lp-testi-name">Youssef</span>
                    <span className="lp-testi-role">Directeur d'agence</span>
                  </div>
                </div>
                <span className="lp-testi-quote-icon">“</span>
              </div>
              
              {/* duplicate for infinite loop */}
              <div className="lp-testi-card">
                <div className="lp-testi-rating">
                  <span className="lp-testi-star">★</span>
                  <span className="lp-testi-star">★</span>
                  <span className="lp-testi-star">★</span>
                  <span className="lp-testi-star">★</span>
                  <span className="lp-testi-star">★</span>
                </div>
                <p className="lp-testi-text">"En 2 semaines, mon trafic a doublé. Je n'avais aucune connaissance en SEO avant."</p>
                <div className="lp-testi-user">
                  <div className="lp-testi-avatar avatar-k">K</div>
                  <div className="lp-testi-info">
                    <span className="lp-testi-name">Karim</span>
                    <span className="lp-testi-role">Freelance développeur web</span>
                  </div>
                </div>
                <span className="lp-testi-quote-icon">“</span>
              </div>
              <div className="lp-testi-card">
                <div className="lp-testi-rating">
                  <span className="lp-testi-star">★</span>
                  <span className="lp-testi-star">★</span>
                  <span className="lp-testi-star">★</span>
                  <span className="lp-testi-star">★</span>
                  <span className="lp-testi-star">★</span>
                </div>
                <p className="lp-testi-text">"L'audit m'a révélé des erreurs critiques que j'ignorais depuis des mois. Incroyable."</p>
                <div className="lp-testi-user">
                  <div className="lp-testi-avatar avatar-s">S</div>
                  <div className="lp-testi-info">
                    <span className="lp-testi-name">Sara</span>
                    <span className="lp-testi-role">E-commerçante</span>
                  </div>
                </div>
                <span className="lp-testi-quote-icon">“</span>
              </div>
              <div className="lp-testi-card">
                <div className="lp-testi-rating">
                  <span className="lp-testi-star">★</span>
                  <span className="lp-testi-star">★</span>
                  <span className="lp-testi-star">★</span>
                  <span className="lp-testi-star">★</span>
                  <span className="lp-testi-star">★</span>
                </div>
                <p className="lp-testi-text">"La génération de contenu m'a fait gagner des heures chaque semaine. Je recommande à 100%."</p>
                <div className="lp-testi-user">
                  <div className="lp-testi-avatar avatar-m">M</div>
                  <div className="lp-testi-info">
                    <span className="lp-testi-name">Mehdi</span>
                    <span className="lp-testi-role">Consultant digital</span>
                  </div>
                </div>
                <span className="lp-testi-quote-icon">“</span>
              </div>
              <div className="lp-testi-card">
                <div className="lp-testi-rating">
                  <span className="lp-testi-star">★</span>
                  <span className="lp-testi-star">★</span>
                  <span className="lp-testi-star">★</span>
                  <span className="lp-testi-star">★</span>
                  <span className="lp-testi-star">★</span>
                </div>
                <p className="lp-testi-text">"Mon site est passé en première page Google en moins d'un mois. Résultats bluffants."</p>
                <div className="lp-testi-user">
                  <div className="lp-testi-avatar avatar-i">I</div>
                  <div className="lp-testi-info">
                    <span className="lp-testi-name">Ines</span>
                    <span className="lp-testi-role">Blogueuse lifestyle</span>
                  </div>
                </div>
                <span className="lp-testi-quote-icon">“</span>
              </div>
              <div className="lp-testi-card">
                <div className="lp-testi-rating">
                  <span className="lp-testi-star">★</span>
                  <span className="lp-testi-star">★</span>
                  <span className="lp-testi-star">★</span>
                  <span className="lp-testi-star">★</span>
                  <span className="lp-testi-star">★</span>
                </div>
                <p className="lp-testi-text">"Interface simple, résultats concrets. Exactement ce dont j'avais besoin pour mon agence."</p>
                <div className="lp-testi-user">
                  <div className="lp-testi-avatar avatar-y">Y</div>
                  <div className="lp-testi-info">
                    <span className="lp-testi-name">Youssef</span>
                    <span className="lp-testi-role">Directeur d'agence</span>
                  </div>
                </div>
                <span className="lp-testi-quote-icon">“</span>
              </div>
            </div>
          </div>
        </section>

        {/* BENTO GRID */}
        <section className="lp-section">
          <div className="lp-label lp-reveal">Puissance de l'outil</div>
          <div className="lp-title lp-reveal lp-delay-1">Un outil, des possibilités infinies</div>
          <p className="lp-sub lp-reveal lp-delay-2" style={{ maxWidth: 520 }}>Chaque fonctionnalité est pensée pour te donner une longueur d'avance — visuellement claire, actionnable en un clic.</p>
          <div className="lp-bento-wrap">
            <svg width="0" height="0" style={{ position: 'absolute' }}>
              <defs>
                <linearGradient id="bento-spark-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.22)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                </linearGradient>
              </defs>
            </svg>
            <div className="lp-bento">
              <div className="lp-bento-card wide lp-reveal">
                <div className="lp-bento-head">
                  <div className="lp-bento-icon"><BarChart3 size={22} strokeWidth={1.8} /></div>
                  <span className="lp-bento-tag">Temps réel</span>
                </div>
                <div className="lp-bento-body">
                  <h3>Tableau de bord intelligent</h3>
                  <p>Vue d'ensemble de toutes tes métriques SEO — positions, trafic organique, erreurs techniques et opportunités de croissance.</p>
                  <div className="lp-bento-stats">
                    <span className="lp-bento-stat up">↑ 24% trafic</span>
                    <span className="lp-bento-stat">Score 87/100</span>
                  </div>
                </div>
                <div className="lp-bento-widget">
                  <div className="lp-bento-db-grid">
                    <div className="lp-bento-db-stat">
                      <div className="lp-bento-db-label">Visites /j</div>
                      <div className="lp-bento-db-value">12,480</div>
                      <div className="lp-bento-db-trend up">↑ 28.4%</div>
                    </div>
                    <div className="lp-bento-db-chart-container">
                      <svg viewBox="0 0 160 60" className="lp-bento-svg-chart">
                        <defs>
                          <linearGradient id="db-chart-grad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="rgba(129, 140, 248, 0.22)" />
                            <stop offset="100%" stopColor="rgba(129, 140, 248, 0)" />
                          </linearGradient>
                          <linearGradient id="db-line-grad" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#818cf8" />
                            <stop offset="60%" stopColor="#c084fc" />
                            <stop offset="100%" stopColor="#ffffff" />
                          </linearGradient>
                          <filter id="chart-glow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="2.5" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                          </filter>
                        </defs>
                        {/* Background Grid */}
                        <g opacity="0.07">
                          <line x1="40" y1="0" x2="40" y2="60" stroke="#ffffff" strokeWidth="0.75" strokeDasharray="2,2" />
                          <line x1="80" y1="0" x2="80" y2="60" stroke="#ffffff" strokeWidth="0.75" strokeDasharray="2,2" />
                          <line x1="120" y1="0" x2="120" y2="60" stroke="#ffffff" strokeWidth="0.75" strokeDasharray="2,2" />
                          <line x1="0" y1="20" x2="160" y2="20" stroke="#ffffff" strokeWidth="0.75" strokeDasharray="2,2" />
                          <line x1="0" y1="40" x2="160" y2="40" stroke="#ffffff" strokeWidth="0.75" strokeDasharray="2,2" />
                        </g>
                        {/* Area Fill */}
                        <path d="M 0,45 Q 25,48 50,35 T 100,22 T 160,8 L 160,60 L 0,60 Z" fill="url(#db-chart-grad)" />
                        {/* Stroke Line */}
                        <path d="M 0,45 Q 25,48 50,35 T 100,22 T 160,8" fill="none" stroke="url(#db-line-grad)" strokeWidth="2.5" strokeLinecap="round" />
                        {/* End Point Glow */}
                        <circle cx="160" cy="8" r="6" fill="#ffffff" opacity="0.25" filter="url(#chart-glow)" />
                        <circle cx="160" cy="8" r="3.5" fill="#ffffff" />
                        {/* Intermediate Points */}
                        <circle cx="100" cy="22" r="3.5" fill="#c084fc" stroke="rgba(0,0,0,0.5)" strokeWidth="1" />
                        <circle cx="50" cy="35" r="3.5" fill="#818cf8" stroke="rgba(0,0,0,0.5)" strokeWidth="1" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lp-bento-card tall lp-reveal lp-delay-1">
                <div>
                  <div className="lp-bento-head">
                    <div className="lp-bento-icon"><Bot size={22} strokeWidth={1.8} /></div>
                    <span className="lp-bento-tag">IA</span>
                  </div>
                  <div className="lp-bento-body">
                    <h3>IA générative</h3>
                    <p>Contenu optimisé SEO — articles, méta-descriptions, titres H1 et suggestions de mots-clés.</p>
                  </div>
                </div>
                <div>
                  <div className="lp-bento-widget" style={{ padding: 0, border: 'none', background: 'none', backdropFilter: 'none' }}>
                    <div className="lp-bento-ai-chat">
                      <div className="lp-bento-chat-header">
                        <div className="lp-bento-chat-avatar"><Bot size={11} strokeWidth={2.5} /></div>
                        <span>Gemini Assistant</span>
                      </div>
                      <div className="lp-bento-chat-bubble prompt">
                        Rédiger l'intro de l'article...
                      </div>
                      <div className="lp-bento-chat-bubble response">
                        <div className="typing-text">
                          Découvre les meilleurs cafés de Casablanca où déguster un expresso...
                        </div>
                        <span className="typing-cursor">|</span>
                      </div>
                    </div>
                  </div>
                  <div className="lp-bento-ai-badge"><Sparkles size={13} /> Propulsé par Gemini AI</div>
                </div>
              </div>

              <div className="lp-bento-card lp-reveal lp-delay-2">
                <div className="lp-bento-head">
                  <div className="lp-bento-icon"><Link2 size={20} strokeWidth={1.8} /></div>
                  <span className="lp-bento-tag">Live</span>
                </div>
                <div className="lp-bento-body">
                  <h3>Suivi backlinks</h3>
                  <p>Surveille et analyse tes liens entrants en continu.</p>
                </div>
                <div className="lp-bento-widget" style={{ padding: 0, border: 'none', background: 'none', backdropFilter: 'none' }}>
                  <div className="lp-bento-network">
                    <div className="lp-bento-net-node client c1"><span>Forbes</span></div>
                    <div className="lp-bento-net-node client c2"><span>Medium</span></div>
                    <div className="lp-bento-net-node main"><span>Mon Site</span></div>
                    <div className="lp-bento-net-node client c3"><span>Dev.to</span></div>
                    <svg className="lp-bento-net-svg">
                      <line x1="15%" y1="20%" x2="50%" y2="50%" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
                      <line x1="85%" y1="20%" x2="50%" y2="50%" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
                      <line x1="50%" y1="80%" x2="50%" y2="50%" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
                    </svg>
                    <div className="lp-bento-pulse-dot p1" />
                    <div className="lp-bento-pulse-dot p2" />
                    <div className="lp-bento-pulse-dot p3" />
                  </div>
                </div>
              </div>

              <div className="lp-bento-card lp-reveal lp-delay-3">
                <div className="lp-bento-head">
                  <div className="lp-bento-icon"><Zap size={20} strokeWidth={1.8} /></div>
                  <span className="lp-bento-tag">Rapide</span>
                </div>
                <div className="lp-bento-body">
                  <h3>Audit instantané</h3>
                  <p>Détecte les problèmes techniques en quelques secondes.</p>
                </div>
                <div className="lp-bento-widget">
                  <div className="lp-bento-audit-widget">
                    <div className="lp-bento-ring-wrap">
                      <div className="lp-bento-ring">
                        <svg viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="2.5" />
                          <circle cx="18" cy="18" r="15.9" fill="none" stroke="#fff" strokeWidth="2.5" strokeDasharray="92 100" strokeLinecap="round" transform="rotate(-90 18 18)" />
                        </svg>
                        <span>92%</span>
                      </div>
                      <div className="lp-bento-ring-label">SEO</div>
                    </div>
                    <div className="lp-bento-audit-details">
                      <div className="lp-bento-audit-row ok"><i>✓</i> HTTPS Actif</div>
                      <div className="lp-bento-audit-row ok"><i>✓</i> Meta Tags OK</div>
                      <div className="lp-bento-audit-row warning"><i>!</i> Alts Manquants</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lp-bento-card lp-reveal lp-delay-2">
                <div className="lp-bento-head">
                  <div className="lp-bento-icon"><TrendingUp size={20} strokeWidth={1.8} /></div>
                  <span className="lp-bento-tag">SERP</span>
                </div>
                <div className="lp-bento-body">
                  <h3>Suivi de positions</h3>
                  <p>Suis l'évolution de ton classement Google jour après jour.</p>
                </div>
                <div className="lp-bento-widget">
                  <div className="lp-bento-spark-widget">
                    <div className="lp-bento-spark-header">
                      <span className="lp-bento-spark-keyword">"agence immo"</span>
                      <span className="lp-bento-spark-rank-badge">#8 → #3 <TrendingUp size={12} style={{ marginLeft: 4 }} /></span>
                    </div>
                    <div className="lp-bento-spark-chart-container">
                      <svg className="lp-bento-spark-svg" viewBox="0 0 160 40">
                        <defs>
                          <linearGradient id="spark-fill-grad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="rgba(255,255,255,0.15)" />
                            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                          </linearGradient>
                        </defs>
                        <polygon points="0,40 0,32 25,28 50,30 75,18 100,22 125,10 160,4 160,40" fill="url(#spark-fill-grad)" />
                        <polyline points="0,32 25,28 50,30 75,18 100,22 125,10 160,4" />
                        <line x1="160" y1="4" x2="160" y2="40" stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeDasharray="2,2" />
                        <circle cx="160" cy="4" r="3.5" fill="#ffffff" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lp-bento-card wide lp-reveal lp-delay-3">
                <div className="lp-bento-head">
                  <div className="lp-bento-icon"><Globe2 size={22} strokeWidth={1.8} /></div>
                  <span className="lp-bento-tag">Benchmark</span>
                </div>
                <div className="lp-bento-body">
                  <h3>Analyse concurrentielle</h3>
                  <p>Compare tes performances SEO avec celles de tes concurrents — mots-clés, backlinks et stratégies de contenu.</p>
                </div>
                <div className="lp-bento-widget">
                  <div className="lp-bento-compare-widget">
                    <div className="lp-bento-compare-row">
                      <div className="lp-bento-comp-name active">Toi (SEO score)</div>
                      <div className="lp-bento-comp-bar-container">
                        <div className="lp-bento-comp-bar active" style={{ width: '82%' }} />
                      </div>
                      <div className="lp-bento-comp-val active">82</div>
                    </div>
                    <div className="lp-bento-compare-row">
                      <div className="lp-bento-comp-name">concurrent-A.ma</div>
                      <div className="lp-bento-comp-bar-container">
                        <div className="lp-bento-comp-bar" style={{ width: '58%' }} />
                      </div>
                      <div className="lp-bento-comp-val">58</div>
                    </div>
                    <div className="lp-bento-compare-row">
                      <div className="lp-bento-comp-name">competiteur-B.com</div>
                      <div className="lp-bento-comp-bar-container">
                        <div className="lp-bento-comp-bar" style={{ width: '42%' }} />
                      </div>
                      <div className="lp-bento-comp-val">42</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TECH STACK */}
        <section className="lp-tech-section">
          <div className="lp-tech-container">
            <div className="lp-tech-info-side lp-reveal">
              <div className="lp-label">Technologie</div>
              <h2 className="lp-tech-title">Propulsé par les meilleures technologies</h2>
              <p className="lp-tech-lead">
                Notre assistant utilise les technologies les plus modernes et performantes pour te garantir une vitesse d'analyse instantanée, une sécurité renforcée et des suggestions SEO d'une précision inégalée.
              </p>
            </div>
            
            <div className="lp-tech-logos-side lp-reveal lp-delay-1">
              <div className="lp-tech-logo-card gemini">
                <div className="lp-tech-logo-icon">
                  <svg viewBox="0 0 24 24" fill="none" style={{ width: '32px', height: '32px' }}>
                    <path d="M12 2C12 2 12.3 8.3 13.5 9.5C14.7 10.7 21 11 21 11C21 11 14.7 11.3 13.5 12.5C12.3 13.7 12 20 12 20C12 20 11.7 13.7 10.5 12.5C9.3 11.3 3 11 3 11C3 11 9.3 10.7 10.5 9.5C11.7 8.3 12 2 12 2Z" fill="url(#gemini-grad-brand-showcase)"/>
                    <defs>
                      <linearGradient id="gemini-grad-brand-showcase" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#9bc5ff" />
                        <stop offset="35%" stopColor="#2b66ff" />
                        <stop offset="65%" stopColor="#ff7bb0" />
                        <stop offset="100%" stopColor="#ffb97b" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <span className="lp-tech-logo-name">Gemini AI</span>
              </div>

              <div className="lp-tech-logo-card google">
                <div className="lp-tech-logo-icon">
                  <svg viewBox="0 0 24 24" style={{ width: '32px', height: '32px' }}>
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                  </svg>
                </div>
                <span className="lp-tech-logo-name">Google APIs</span>
              </div>

              <div className="lp-tech-logo-card fastapi">
                <div className="lp-tech-logo-icon">
                  <svg viewBox="0 0 24 24" fill="none" style={{ width: '32px', height: '32px' }}>
                    <rect width="24" height="24" rx="12" fill="#009688" />
                    <path d="M13 5L6 14H12L11 19L18 10H12L13 5Z" fill="white" />
                  </svg>
                </div>
                <span className="lp-tech-logo-name">FastAPI</span>
              </div>

              <div className="lp-tech-logo-card react">
                <div className="lp-tech-logo-icon">
                  <svg viewBox="0 0 24 24" fill="none" className="react-atom-icon" style={{ width: '32px', height: '32px' }}>
                    <ellipse cx="12" cy="12" rx="10" ry="3.5" stroke="#61DAFB" strokeWidth="1.2" transform="rotate(0 12 12)" />
                    <ellipse cx="12" cy="12" rx="10" ry="3.5" stroke="#61DAFB" strokeWidth="1.2" transform="rotate(60 12 12)" />
                    <ellipse cx="12" cy="12" rx="10" ry="3.5" stroke="#61DAFB" strokeWidth="1.2" transform="rotate(120 12 12)" />
                    <circle cx="12" cy="12" r="1.5" fill="#61DAFB" />
                  </svg>
                </div>
                <span className="lp-tech-logo-name">React</span>
              </div>

              <div className="lp-tech-logo-card ssl">
                <div className="lp-tech-logo-icon" style={{ color: '#FFB300' }}>
                  <Lock size={26} strokeWidth={2} />
                </div>
                <span className="lp-tech-logo-name">SSL & JWT</span>
              </div>

              <div className="lp-tech-logo-card mongodb">
                <div className="lp-tech-logo-icon">
                  <svg viewBox="0 0 24 24" fill="none" style={{ width: '32px', height: '32px' }}>
                    <path d="M12 2C12 2 9 6.5 9 11.5C9 16.5 12 22 12 22C12 22 15 16.5 15 11.5C15 6.5 12 2 12 2Z" fill="#4DB33D" />
                    <path d="M12 2V22" stroke="#3F3F3F" strokeWidth="1" />
                    <path d="M12 4.5C12.7 6.5 13.5 9.5 13.5 11.5C13.5 14.5 12.7 18 12 19.5" stroke="#13AA52" strokeWidth="0.8" />
                    <path d="M12 4.5C11.3 6.5 10.5 9.5 10.5 11.5C10.5 14.5 11.3 18 12 19.5" stroke="#13AA52" strokeWidth="0.8" />
                  </svg>
                </div>
                <span className="lp-tech-logo-name">MongoDB</span>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="lp-section">
          <div className="lp-label lp-reveal" style={{ textAlign: 'center', display: 'block' }}>Questions fréquentes</div>
          <div className="lp-title lp-reveal lp-delay-1" style={{ textAlign: 'center' }}>Tu as des questions ?</div>
          <div className="lp-faq-list">
            {[
              { q: "Est-ce que l'outil est vraiment gratuit ?", a: "Oui, tu peux commencer gratuitement avec un nombre limité d'analyses par mois. Pour un accès illimité et des fonctionnalités avancées, consulte nos plans Pro et Business." },
              { q: "Comment l'IA analyse-t-elle mon site ?", a: "Notre assistant scanne ton site en profondeur — structure HTML, méta-tags, vitesse de chargement, backlinks, contenu — puis utilise Gemini AI pour générer des recommandations personnalisées." },
              { q: "Combien de temps faut-il pour voir des résultats ?", a: "Les premières améliorations techniques sont visibles immédiatement. Pour le positionnement Google, compte généralement 2 à 8 semaines selon la compétitivité de ton secteur." },
              { q: "Puis-je analyser les sites de mes concurrents ?", a: "Absolument ! Tu peux analyser n'importe quelle URL et comparer les métriques SEO avec ton propre site pour identifier les opportunités." },
              { q: "Mes données sont-elles sécurisées ?", a: "Oui, nous utilisons un chiffrement SSL de bout en bout et l'authentification JWT. Tes données ne sont jamais partagées avec des tiers." },
              { q: "L'outil fonctionne-t-il pour les sites en arabe ou en français ?", a: "Oui, notre IA supporte le contenu multilingue. L'analyse SEO fonctionne pour toutes les langues supportées par Google." },
            ].map((faq, i) => (
              <div key={i} className="lp-faq-item-wrap lp-reveal" style={{ transitionDelay: `${i * 0.05}s` }}>
                <div className={`lp-faq-item${openFaq === i ? ' open' : ''}`}>
                  <button type="button" className="lp-faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                    {faq.q}
                    <span className="lp-faq-arrow">+</span>
                  </button>
                  <div className="lp-faq-a">
                    <p>{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="lp-section lp-cta-section">
          <div className="lp-label lp-reveal">Commencer</div>
          <div className="lp-title lp-reveal lp-delay-1">Prêt à dominer les résultats de recherche ?</div>
          <p className="lp-sub lp-reveal lp-delay-2">Rejoins des milliers de créateurs et entrepreneurs qui font confiance à notre assistant pour booster leur visibilité en ligne.</p>
          <Link to={user ? "/dashboard" : "/register"} className="lp-btn-white lp-reveal lp-delay-3">Commencer gratuitement — sans carte bancaire ↗</Link>
        </section>

        {/* FOOTER CTA */}
        <div className="lp-footer-cta">
          <div className="lp-footer-cta-inner">
            <span className="lp-footer-cta-text">Prêt à commencer ?</span>
            <Link to={user ? "/dashboard" : "/register"} className="lp-btn-white">Essai gratuit ↗</Link>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="lp-footer">
          <div className="lp-footer-top">
            <div className="lp-footer-brand">
              <div className="lp-footer-logo-wrap">
                <div className="lp-footer-logo">SEO Assistant</div>
              </div>
              <div className="lp-footer-tagline">L'intelligence artificielle au service de ton référencement et de ta croissance en ligne.</div>
              <div className="lp-footer-socials">
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="lp-footer-social-link" aria-label="GitHub">
                  <Github size={16} />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="lp-footer-social-link" aria-label="Twitter">
                  <Twitter size={16} />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="lp-footer-social-link" aria-label="LinkedIn">
                  <Linkedin size={16} />
                </a>
              </div>
            </div>
            <div className="lp-footer-links-group">
              <div className="lp-footer-col">
                <div className="lp-footer-col-title">Produit</div>
                <a href="#lp-features">Fonctionnalités</a>
                <Link to="/pricing">Tarifs</Link>
                <a href="#lp-how">Comment ça marche</a>
              </div>
              <div className="lp-footer-col">
                <div className="lp-footer-col-title">Ressources</div>
                <button type="button" className="lp-footer-link-btn" onClick={() => setActiveModal('blog')}>Blog SEO</button>
                <button type="button" className="lp-footer-link-btn" onClick={() => setActiveModal('docs')}>Documentation</button>
                <button type="button" className="lp-footer-link-btn" onClick={() => setActiveModal('guides')}>Guides</button>
              </div>
              <div className="lp-footer-col">
                <div className="lp-footer-col-title">Entreprise</div>
                <button type="button" className="lp-footer-link-btn" onClick={() => setActiveModal('contact')}>Contact</button>
                <button type="button" className="lp-footer-link-btn" onClick={() => setActiveModal('privacy')}>Confidentialité</button>
                <button type="button" className="lp-footer-link-btn" onClick={() => setActiveModal('cgu')}>CGU</button>
              </div>
            </div>
          </div>
          <div className="lp-footer-bottom">
            <span>© 2026 SEO Assistant. Tous droits réservés.</span>
            <span>Fait avec soin pour les créateurs.</span>
          </div>
        </footer>

      {/* ═══════════════════════════════════════════════ */}
      {/* MODAL OVERLAYS RENDERING                        */}
      {/* ═══════════════════════════════════════════════ */}
      {activeModal && (
        <div 
          className="lp-modal-overlay" 
          onClick={() => {
            setActiveModal(null);
            setSelectedPost(null);
            setContactStatus('idle');
          }}
        >
          <div 
            className={`lp-modal-window ${
              activeModal === 'docs' || activeModal === 'blog' ? 'large' : 'small'
            }`} 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="lp-modal-header">
              <h2 className="lp-modal-title">
                {activeModal === 'blog' && "Blog SEO"}
                {activeModal === 'docs' && "Documentation"}
                {activeModal === 'guides' && "Guides d'Optimisation"}
                {activeModal === 'contact' && "Nous Contacter"}
                {activeModal === 'privacy' && "Politique de Confidentialité"}
                {activeModal === 'cgu' && "Conditions Générales"}
              </h2>
              <button 
                className="lp-modal-close-btn" 
                onClick={() => {
                  setActiveModal(null);
                  setSelectedPost(null);
                  setContactStatus('idle');
                }}
                aria-label="Fermer la modale"
              >
                ×
              </button>
            </div>
            
            <div className="lp-modal-body">
              {/* BLOG MODAL CONTENT */}
              {activeModal === 'blog' && (
                selectedPost ? (
                  <div className="lp-blog-reader">
                    <div className="lp-blog-reader-header">
                      <button className="lp-blog-back-btn" onClick={() => setSelectedPost(null)}>
                        ← Retour aux articles
                      </button>
                    </div>
                    <div className="lp-blog-post-meta">{selectedPost.meta}</div>
                    <h3 className="lp-modal-title" style={{ marginBottom: '16px', fontSize: '20px' }}>{selectedPost.title}</h3>
                    <div className="lp-blog-post-body" dangerouslySetInnerHTML={{ __html: selectedPost.content }} />
                  </div>
                ) : (
                  <div className="lp-blog-grid">
                    {[
                      {
                        id: 1,
                        title: "Comment dominer le SEO local au Maroc en 2026",
                        meta: "Publié le 15 Juin 2026 • 5 min de lecture",
                        excerpt: "Découvrez les stratégies indispensables pour positionner votre entreprise locale dans les résultats de recherche au Maroc.",
                        content: `
                          <p>Le SEO local est devenu le principal levier de croissance pour les PME au Maroc. Avec la montée des recherches géolocalisées sur Google Maps et mobiles, optimiser votre visibilité locale est incontournable.</p>
                          <h3>1. Optimiser Google My Business</h3>
                          <p>Votre fiche Google My Business (Fiche d'établissement) est le cœur de votre référencement local. Assurez-vous d'avoir :</p>
                          <ul>
                            <li>Un nom clair contenant votre métier principal (ex: "Dentiste Casablanca" ou "Hôtel Marrakech").</li>
                            <li>Des horaires d'ouverture mis à jour en temps réel.</li>
                            <li>Des photos récentes et professionnelles de vos locaux ou produits.</li>
                            <li>Des avis clients authentiques avec des réponses contenant des mots-clés locaux.</li>
                          </ul>
                          <h3>2. Le choix des mots-clés géolocalisés</h3>
                          <p>Ciblez des expressions précises au lieu de termes génériques. Par exemple, préférez "agence immobilière Marrakech" ou "cabinet dentaire Rabat Agdal" au lieu de simples mots génériques.</p>
                          <div class="tip-box">
                            <strong>Astuce Pro :</strong> Utilisez l'assistant AI SEO de notre plateforme pour générer automatiquement les variantes locales les plus recherchées par votre cible marocaine.
                          </div>
                          <h3>3. Les citations locales et annuaires</h3>
                          <p>Inscrivez votre site sur des annuaires locaux marocains réputés (Annuaire.ma, PagesJaunes, etc.) en veillant à garder exactement les mêmes informations de contact (Nom, Adresse, Téléphone) partout.</p>
                        `
                      },
                      {
                        id: 2,
                        title: "L'impact des Core Web Vitals sur votre référencement",
                        meta: "Publié le 10 Juin 2026 • 7 min de lecture",
                        excerpt: "LCP, INP, CLS : apprenez à optimiser ces trois métriques de performance cruciales imposées par Google.",
                        content: `
                          <p>Google utilise l'expérience utilisateur sur les pages (Page Experience) comme signal de positionnement clé. Les Core Web Vitals sont les trois indicateurs clés mesurant cette expérience.</p>
                          <h3>LCP (Largest Contentful Paint) : La vitesse de chargement</h3>
                          <p>Il mesure le temps nécessaire pour afficher le plus grand élément visible à l'écran (généralement une image de héros ou un gros titre). Idéalement, il doit être inférieur à 2.5 secondes. Pour l'améliorer :</p>
                          <ul>
                            <li>Compressez les images et servez-les en format WebP ou AVIF.</li>
                            <li>Supprimez le JavaScript bloquant le rendu initial.</li>
                            <li>Utilisez un hébergement de qualité avec CDN performant.</li>
                          </ul>
                          <h3>INP (Interaction to Next Paint) : La réactivité</h3>
                          <p>Remplaçant l'ancien FID, l'INP mesure le temps de réponse global du site lors de toutes les interactions de l'utilisateur sur la page. Il doit être inférieur à 200ms.</p>
                          <h3>CLS (Cumulative Layout Shift) : La stabilité visuelle</h3>
                          <p>Il mesure les déplacements inattendus des éléments de la page pendant le chargement. Il doit être inférieur à 0.1.</p>
                          <ul>
                            <li>Spécifiez toujours des dimensions de largeur et hauteur sur vos images et vos encarts publicitaires.</li>
                          </ul>
                          <div class="tip-box">
                            <strong>Important :</strong> Un bon score SEO ne sert à rien si vos visiteurs quittent le site car il met plus de 4 secondes à se charger. La vitesse est le premier critère de conversion.
                          </div>
                        `
                      },
                      {
                        id: 3,
                        title: "Rédaction IA : Menace ou Opportunité pour le SEO ?",
                        meta: "Publié le 5 Juin 2026 • 6 min de lecture",
                        excerpt: "Comment utiliser Gemini et d'autres IA pour votre rédaction web sans vous faire pénaliser par Google.",
                        content: `
                          <p>L'essor de l'intelligence artificielle générative a transformé la création de contenu. Beaucoup craignent des pénalités Google, mais la réalité est plus nuancée.</p>
                          <h3>La position officielle de Google</h3>
                          <p>Google ne pénalise pas le contenu simplement parce qu'il est généré par IA. L'algorithme se concentre sur la qualité et l'utilité du contenu (critères EEAT : Expérience, Expertise, Autorité, Fiabilité).</p>
                          <h3>Les bonnes pratiques pour utiliser l'IA en rédaction</h3>
                          <ul>
                            <li><strong>Ne faites pas de copier-coller brut :</strong> L'IA doit servir d'assistant pour structurer un plan, trouver des idées ou surmonter le syndrome de la page blanche.</li>
                            <li><strong>Ajoutez votre touche humaine :</strong> Intégrez des anecdotes réelles, des études de cas, et votre expertise propre que l'IA ne possède pas.</li>
                            <li><strong>Vérifiez les faits :</strong> Les IA peuvent halluciner des faits ou des statistiques obsolètes. Validez chaque chiffre avant publication.</li>
                          </ul>
                          <div class="tip-box">
                            <strong>Notre Approche :</strong> Notre assistant SEO intègre des suggestions intelligentes basées sur de vraies données thématiques pour guider votre écriture humaine, maximisant votre score E-E-A-T.
                          </div>
                        `
                      }
                    ].map(post => (
                      <div className="lp-blog-card" key={post.id} onClick={() => setSelectedPost(post)}>
                        <div className="lp-blog-card-img-placeholder">
                          <Sparkles size={24} />
                        </div>
                        <div className="lp-blog-card-content">
                          <span className="lp-blog-card-meta">{post.meta}</span>
                          <h4 className="lp-blog-card-title">{post.title}</h4>
                          <p className="lp-blog-card-excerpt">{post.excerpt}</p>
                          <span className="lp-blog-card-link">Lire l'article ↗</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}

              {/* DOCUMENTATION MODAL CONTENT */}
              {activeModal === 'docs' && (
                <div className="lp-docs-layout">
                  <div className="lp-docs-sidebar">
                    <button 
                      className={`lp-docs-tab-btn ${activeDocTab === 'start' ? 'active' : ''}`}
                      onClick={() => setActiveDocTab('start')}
                    >
                      Démarrage
                    </button>
                    <button 
                      className={`lp-docs-tab-btn ${activeDocTab === 'semantic' ? 'active' : ''}`}
                      onClick={() => setActiveDocTab('semantic')}
                    >
                      Analyse SEO
                    </button>
                    <button 
                      className={`lp-docs-tab-btn ${activeDocTab === 'ai' ? 'active' : ''}`}
                      onClick={() => setActiveDocTab('ai')}
                    >
                      Assistant IA
                    </button>
                  </div>
                  
                  <div className="lp-docs-content">
                    {activeDocTab === 'start' && (
                      <div>
                        <h3>Guide de démarrage rapide</h3>
                        <p>Bienvenue dans l'assistant SEO IA. Ce guide vous montre comment analyser votre première page et interpréter vos résultats en quelques minutes.</p>
                        <h4>Étape 1 : Saisir l'adresse de votre site ou votre texte</h4>
                        <p>Collez directement l'URL complète de votre page web dans la barre d'analyse principale, ou copiez-collez le texte de votre article dans l'onglet d'analyse textuelle.</p>
                        <h4>Étape 2 : Configurer les mots-clés cibles</h4>
                        <p>Spécifiez le mot-clé principal visé. L'algorithme évaluera sa densité et sa présence dans les zones clés de la page.</p>
                        <div className="lp-docs-code-block">
                          // Exemple de structure idéale de page :
                          &lt;title&gt;[Mot-clé cible] - [Nom de Marque]&lt;/title&gt;
                        </div>
                      </div>
                    )}
                    {activeDocTab === 'semantic' && (
                      <div>
                        <h3>Analyse sémantique & Technique</h3>
                        <p>Notre assistant effectue un audit de plus de 30 facteurs SEO essentiels divisés en plusieurs catégories clés.</p>
                        <h4>Balises Meta & En-têtes (H1-H6)</h4>
                        <p>L'analyse vérifie la présence, la longueur et la structure de vos balises de titres. Les en-têtes doivent suivre une hiérarchie logique sans sauter de niveau (ex: passer d'un H1 directement à un H3).</p>
                        <h4>Mots-clés et densité sémantique</h4>
                        <p>We extrayons les termes récurrents pour s'assurer que vous n'êtes pas en situation de sur-optimisation (keyword stuffing), tout en maintenant les mots-clés importants dans le premier paragraphe.</p>
                      </div>
                    )}
                    {activeDocTab === 'ai' && (
                      <div>
                        <h3>Génération de Métadonnées par l'IA</h3>
                        <p>Grâce à l'intégration de Gemini, l'assistant produit instantanément des alternatives optimisées pour maximiser votre taux de clic.</p>
                        <h4>Génération de Titre et Description</h4>
                        <p>L'IA analyse le contexte de votre texte et formule des propositions percutantes qui respectent les limites de longueur de Google.</p>
                        <h4>Sélection intelligente de mots-clés professionnels</h4>
                        <p>Le système identifie automatiquement votre secteur d'activité parmi nos 12 domaines prédéfinis et propose des mots-clés professionnels associés avec volume de recherche estimé et niveau de compétition.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* GUIDES MODAL CONTENT */}
              {activeModal === 'guides' && (
                <div className="lp-guides-list">
                  {[
                    {
                      title: "Guide 1 : Optimiser vos images pour le web (WebP, Alt, Compression)",
                      content: (
                        <div>
                          <p>L'optimisation des images est l'un des moyens les plus simples et rapides d'accélérer votre site web :</p>
                          <ul>
                            <li><strong>Privilégiez le format WebP ou AVIF :</strong> Ces formats offrent une compression supérieure de 30% à celle du JPEG pour une qualité identique.</li>
                            <li><strong>Spécifiez la largeur et la hauteur :</strong> Cela empêche les décalages de mise en page (CLS) pendant le chargement.</li>
                            <li><strong>Remplissez l'attribut Alt :</strong> Utilisez une description textuelle naturelle incluant votre mot-clé sans forcer (ex: &lt;img src="dentiste-rabat.jpg" alt="Cabinet de dentiste à Rabat Agdal" /&gt;).</li>
                          </ul>
                        </div>
                      )
                    },
                    {
                      title: "Guide 2 : Rédiger le Titre et la Meta Description parfaits",
                      content: (
                        <div>
                          <p>Votre titre et votre description sont vos premiers arguments pour convaincre les internautes de cliquer sur votre lien :</p>
                          <ul>
                            <li><strong>Longueur idéale :</strong> 50 à 60 caractères pour le titre, 120 à 150 caractères pour la description afin d'éviter qu'ils ne soient coupés par Google.</li>
                            <li><strong>Structure du titre :</strong> [Mot-clé Principal] | [Proposition de Valeur] ou [Marque].</li>
                            <li><strong>Actionnable :</strong> Utilisez des verbes d'action dans la description (ex: "Découvrez", "Profitez", "Comparez") et terminez par un appel à l'action clair.</li>
                          </ul>
                        </div>
                      )
                    },
                    {
                      title: "Guide 3 : Structurer le maillage interne de votre site",
                      content: (
                        <div>
                          <p>Le maillage interne distribue l'autorité de votre domaine (jus de lien) et aide Google à indexer vos pages :</p>
                          <ul>
                            <li><strong>Créez des cocons sémantiques :</strong> Liez uniquement les pages qui partagent un sujet connexe ou complémentaire.</li>
                            <li><strong>Soignez les ancres de lien :</strong> Évitez les "cliquez ici". Utilisez des textes ancres descriptifs (ex: "consultez notre guide SEO local").</li>
                            <li><strong>Liez vers vos pages clés :</strong> Assurez-vous que vos pages de vente ou de contact reçoivent des liens depuis vos articles de blog les plus populaires.</li>
                          </ul>
                        </div>
                      )
                    }
                  ].map((guide, idx) => (
                    <div className={`lp-guide-item ${activeGuide === idx ? 'open' : ''}`} key={idx}>
                      <div className="lp-guide-header" onClick={() => setActiveGuide(activeGuide === idx ? null : idx)}>
                        <span className="lp-guide-title">{guide.title}</span>
                        <span className="lp-guide-icon">▼</span>
                      </div>
                      {activeGuide === idx && (
                        <div className="lp-guide-content">
                          {guide.content}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* CONTACT MODAL CONTENT */}
              {activeModal === 'contact' && (
                <div>
                  {contactStatus === 'idle' && (
                    <form 
                      className="lp-contact-form" 
                      onSubmit={(e) => {
                        e.preventDefault();
                        setContactStatus('sending');
                        setTimeout(() => {
                          setContactStatus('success');
                          setContactForm({ name: '', email: '', subject: '', message: '' });
                        }, 1500);
                      }}
                    >
                      <div className="lp-form-row">
                        <div className="lp-form-group">
                          <label htmlFor="contact-name">Nom complet</label>
                          <input 
                            id="contact-name"
                            type="text" 
                            required 
                            placeholder="Votre nom"
                            value={contactForm.name}
                            onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                          />
                        </div>
                        <div className="lp-form-group">
                          <label htmlFor="contact-email">Adresse e-mail</label>
                          <input 
                            id="contact-email"
                            type="email" 
                            required 
                            placeholder="nom@exemple.com"
                            value={contactForm.email}
                            onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="lp-form-group">
                        <label htmlFor="contact-subject">Sujet</label>
                        <input 
                          id="contact-subject"
                          type="text" 
                          required 
                          placeholder="Comment pouvons-nous vous aider ?"
                          value={contactForm.subject}
                          onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                        />
                      </div>
                      <div className="lp-form-group">
                        <label htmlFor="contact-message">Message</label>
                        <textarea 
                          id="contact-message"
                          rows="4" 
                          required 
                          placeholder="Décrivez votre besoin en détail..."
                          value={contactForm.message}
                          onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                        />
                      </div>
                      <button type="submit" className="lp-contact-submit-btn">
                        Envoyer le message
                      </button>
                    </form>
                  )}
                  {contactStatus === 'sending' && (
                    <div className="lp-contact-loading-container">
                      <div className="lp-glass-spinner"></div>
                      <p style={{ color: '#aaa', fontSize: '13px' }}>Simulation d'envoi sécurisé en cours...</p>
                    </div>
                  )}
                  {contactStatus === 'success' && (
                    <div className="lp-contact-loading-container">
                      <div className="lp-success-checkmark">✓</div>
                      <h3 className="lp-modal-title" style={{ fontSize: '18px', marginBottom: '8px' }}>Message Envoyé !</h3>
                      <p style={{ color: '#aaa', fontSize: '13px', maxWidth: '350px', margin: '0 auto' }}>
                        Merci pour votre message. Notre équipe commerciale vous contactera sous 24 heures ouvrées.
                      </p>
                      <button 
                        className="lp-blog-back-btn" 
                        style={{ marginTop: '16px' }}
                        onClick={() => setContactStatus('idle')}
                      >
                        Nouveau message
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* PRIVACY POLICY CONTENT */}
              {activeModal === 'privacy' && (
                <div className="lp-legal-text">
                  <p>Dernière mise à jour : 19 Juin 2026</p>
                  <p>Chez AI SEO Assistant, nous accordons une grande importance à la confidentialité de vos données. Cette politique détaille comment nous recueillons, traitons et protégeons vos informations personnelles.</p>
                  
                  <h3>1. Collecte des données</h3>
                  <p>Nous collectons les informations nécessaires pour vous fournir nos services d'audit, notamment :</p>
                  <ul>
                    <li>Vos informations de compte (nom, adresse email).</li>
                    <li>Les adresses URL et textes bruts que vous soumettez pour analyse SEO.</li>
                    <li>Les métadonnées générées par notre outil d'IA.</li>
                  </ul>

                  <h3>2. Utilisation et protection des données</h3>
                  <p>Vos données d'analyse et de texte ne sont en aucun cas revendues à des tiers, ni utilisées pour entraîner des modèles d'IA publics sans votre accord. Toutes les requêtes sémantiques sont chiffrées de bout en bout.</p>

                  <h3>3. Cookies et traceurs</h3>
                  <p>Nous utilisons des cookies strictement nécessaires pour stocker votre session de connexion et mesurer l'audience de manière totalement anonymisée.</p>
                </div>
              )}

              {/* CGU CONTENT */}
              {activeModal === 'cgu' && (
                <div className="lp-legal-text">
                  <p>Dernière mise à jour : 19 Juin 2026</p>
                  <p>Bienvenue sur la plateforme AI SEO Assistant. L'accès et l'utilisation de nos services sont régis par les conditions décrites ci-dessous.</p>

                  <h3>1. Description des services</h3>
                  <p>La plateforme fournit des audits sémantiques et techniques automatisés, l'évaluation des mots-clés cibles, et des suggestions de métadonnées optimisées assistées par intelligence artificielle.</p>

                  <h3>2. Obligations de l'utilisateur</h3>
                  <p>En utilisant le service, vous vous engagez à ne pas soumettre de contenus illicites, haineux, violant les droits d'auteur de tiers, ou visant à saturer nos serveurs de requêtes automatisées abusives.</p>

                  <h3>3. Limitation de responsabilité</h3>
                  <p>Les rapports et suggestions sont générés à titre consultatif selon l'état de l'art du SEO en 2026. Nous ne garantissons en aucun cas une augmentation fixe de votre trafic ou un positionnement spécifique dans les moteurs de recherche.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}
