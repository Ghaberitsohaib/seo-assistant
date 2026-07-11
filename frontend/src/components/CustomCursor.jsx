import { useEffect, useState } from 'react'

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [hidden, setHidden] = useState(true)
  const [clicked, setClicked] = useState(false)
  const [linkHovered, setLinkHovered] = useState(false)

  useEffect(() => {
    const onMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY })
      if (hidden) setHidden(false)
    }

    const onMouseEnter = () => {
      setHidden(false)
    }

    const onMouseLeave = () => {
      setHidden(true)
    }

    const onMouseDown = () => {
      setClicked(true)
    }

    const onMouseUp = () => {
      setClicked(false)
    }

    const addEventListeners = () => {
      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseenter', onMouseEnter)
      document.addEventListener('mouseleave', onMouseLeave)
      document.addEventListener('mousedown', onMouseDown)
      document.addEventListener('mouseup', onMouseUp)
    }

    const removeEventListeners = () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseenter', onMouseEnter)
      document.removeEventListener('mouseleave', onMouseLeave)
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('mouseup', onMouseUp)
    }

    addEventListeners()

    // Query and listen to hoverable elements
    const handleLinkHoverEvents = () => {
      const hoverables = document.querySelectorAll('a, button, input, textarea, select, [role="button"], .sidebar-link, .tab-btn')
      hoverables.forEach((el) => {
        el.removeEventListener('mouseenter', onLinkMouseEnter)
        el.removeEventListener('mouseleave', onLinkMouseLeave)
        
        el.addEventListener('mouseenter', onLinkMouseEnter)
        el.addEventListener('mouseleave', onLinkMouseLeave)
      })
    }

    const onLinkMouseEnter = () => setLinkHovered(true)
    const onLinkMouseLeave = () => setLinkHovered(false)

    handleLinkHoverEvents()

    const observer = new MutationObserver(handleLinkHoverEvents)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      removeEventListeners()
      observer.disconnect()
      
      const hoverables = document.querySelectorAll('a, button, input, textarea, select, [role="button"], .sidebar-link, .tab-btn')
      hoverables.forEach((el) => {
        el.removeEventListener('mouseenter', onLinkMouseEnter)
        el.removeEventListener('mouseleave', onLinkMouseLeave)
      })
    }
  }, [hidden])

  if (hidden) return null

  return (
    <>
      {/* 3D Glossy White Sphere (Smaller: 8px) */}
      <div
        style={{
          position: 'fixed',
          left: position.x,
          top: position.y,
          width: '8px',
          height: '8px',
          background: 'radial-gradient(circle at 35% 35%, #FFFFFF 0%, #E0E0E0 30%, #AAAAAA 65%, #555555 100%)',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 99999,
          transform: 'translate(-50%, -50%)',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.6), inset -0.5px -0.5px 1.5px rgba(0,0,0,0.5), inset 1px 1px 1.5px rgba(255,255,255,0.9)',
          transition: 'width 0.15s, height 0.15s, transform 0.03s ease-out',
          ...(clicked ? { width: '6px', height: '6px' } : {}),
          ...(linkHovered ? { background: 'radial-gradient(circle at 35% 35%, #FFFFFF 0%, #F0F0F0 20%, #CCCCCC 60%, #777777 100%)' } : {})
        }}
      />
      {/* 3D Outer Halo Follower (Smaller: 24px) */}
      <div
        style={{
          position: 'fixed',
          left: position.x,
          top: position.y,
          width: '24px',
          height: '24px',
          border: '1.2px solid rgba(255, 255, 255, 0.6)',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 99998,
          transform: 'translate(-50%, -50%)',
          boxShadow: '0 0 10px rgba(255, 255, 255, 0.2), inset 0 0 5px rgba(255, 255, 255, 0.1)',
          filter: 'blur(0.5px)',
          transition: 'width 0.18s, height 0.18s, border-color 0.18s, background-color 0.18s, transform 0.05s cubic-bezier(0.1, 0.8, 0.2, 1)',
          ...(clicked ? { width: '18px', height: '18px', borderColor: '#ffffff', boxShadow: '0 0 6px rgba(255, 255, 255, 0.3)' } : {}),
          ...(linkHovered ? { width: '36px', height: '36px', borderColor: '#ffffff', backgroundColor: 'rgba(255, 255, 255, 0.04)', boxShadow: '0 0 14px rgba(255, 255, 255, 0.1)' } : {})
        }}
      />
    </>
  )
}
