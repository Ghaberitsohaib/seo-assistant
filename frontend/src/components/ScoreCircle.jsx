import { useEffect, useState } from 'react'

export default function ScoreCircle({ score, size = 120, strokeWidth = 8 }) {
  const [animatedScore, setAnimatedScore] = useState(0)
  
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (animatedScore / 100) * circumference

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score)
    }, 100)
    return () => clearTimeout(timer)
  }, [score])

  const getColor = (score) => {
    if (score >= 80) return '#10B981'
    if (score >= 60) return '#F59E0B'
    if (score >= 40) return '#F97316'
    return '#EF4444'
  }

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          strokeWidth={strokeWidth}
          stroke="rgba(255,255,255,0.05)"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className="score-circle"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          stroke={getColor(score)}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold" style={{ color: 'var(--text-primary)', fontFamily: '"Space Grotesk", sans-serif' }}>
          {Math.round(animatedScore)}
        </span>
      </div>
    </div>
  )
}
