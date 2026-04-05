import { useCallback, useEffect, useRef, useState } from 'react'

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

export default function useSentinelSDK() {
  const [riskScore, setRiskScore] = useState(18)
  const [simulationMode, setSimulationMode] = useState('normal')
  const [telemetryReasons, setTelemetryReasons] = useState([])
  const [telemetryTrail, setTelemetryTrail] = useState([])

  const keyIntervalsRef = useRef([])
  const lastKeyTimestampRef = useRef({})
  const mouseTimestampsRef = useRef([])
  const clickTimestampsRef = useRef([])

  const pushWithLimit = (ref, value, limit = 80) => {
    ref.current = [...ref.current, value].slice(-limit)
  }

  const pushTelemetryTrail = useCallback((entries) => {
    const now = Date.now()
    const normalized = entries.map((entry, index) => ({
      id: `${now}-${index}`,
      ...entry,
      timestamp: now,
    }))

    setTelemetryTrail((prev) => [...normalized, ...prev].slice(0, 10))
  }, [])

  const publishTelemetry = useCallback((entries) => {
    setTelemetryReasons(entries)
    pushTelemetryTrail(entries)
  }, [pushTelemetryTrail])

  const updateRiskPreview = useCallback(() => {
    const now = Date.now()
    const recentMouseMoves = mouseTimestampsRef.current.filter((ts) => now - ts <= 2500).length
    const recentClicks = clickTimestampsRef.current.filter((ts) => now - ts <= 2500).length

    const baselineRisk = clamp(15 + recentMouseMoves * 0.5 + recentClicks * 2.2, 8, 45)
    setRiskScore((prev) => clamp(prev * 0.65 + baselineRisk * 0.35, 6, 55))
    publishTelemetry([
      {
        label: 'pointer-baseline',
        value: `${recentMouseMoves} move / ${recentClicks} click`,
        severity: 'low',
      },
    ])
  }, [publishTelemetry])

  const trackKeystroke = useCallback((fieldName) => {
    const now = Date.now()
    const last = lastKeyTimestampRef.current[fieldName]

    if (last) {
      const interval = now - last
      pushWithLimit(keyIntervalsRef, interval, 60)
    }

    lastKeyTimestampRef.current[fieldName] = now
    if (simulationMode === 'normal') {
      updateRiskPreview()
    }
  }, [simulationMode, updateRiskPreview])

  const simulateNormalUser = useCallback(() => {
    setSimulationMode('normal')
    setRiskScore((prev) => clamp(prev * 0.6 + 18, 8, 32))
    publishTelemetry([
      {
        label: 'simulation-profile',
        value: 'normal-user-pattern',
        severity: 'low',
      },
      {
        label: 'typing-cadence',
        value: 'human-like',
        severity: 'low',
      },
    ])
  }, [publishTelemetry])

  const simulateHackerBot = useCallback(() => {
    setSimulationMode('hacker')
    setRiskScore(92)

    const now = Date.now()
    for (let i = 0; i < 12; i += 1) {
      pushWithLimit(keyIntervalsRef, 8 + i, 60)
      pushWithLimit(clickTimestampsRef, now - i * 20, 100)
      pushWithLimit(mouseTimestampsRef, now - i * 15, 100)
    }
    publishTelemetry([
      {
        label: 'simulation-profile',
        value: 'hacker-bot-pattern',
        severity: 'high',
      },
      {
        label: 'typing-cadence',
        value: 'ultra-fast-burst',
        severity: 'high',
      },
      {
        label: 'pointer-activity',
        value: 'erratic-burst',
        severity: 'high',
      },
    ])
  }, [publishTelemetry])

  const analyzeBehavior = useCallback(() => {
    if (simulationMode === 'hacker') {
      setRiskScore((prev) => (prev < 86 ? 90 : prev))
      publishTelemetry([
        {
          label: 'risk-engine',
          value: 'forced-anomaly-profile',
          severity: 'high',
        },
        {
          label: 'decision',
          value: 'block-transaction',
          severity: 'high',
        },
      ])
      return 90
    }

    const intervals = keyIntervalsRef.current
    const avgInterval = intervals.length
      ? intervals.reduce((sum, current) => sum + current, 0) / intervals.length
      : 320

    const variance = intervals.length
      ? intervals.reduce((sum, current) => sum + (current - avgInterval) ** 2, 0) / intervals.length
      : 0

    const now = Date.now()
    const moveBurst = mouseTimestampsRef.current.filter((ts) => now - ts <= 2000).length
    const clickBurst = clickTimestampsRef.current.filter((ts) => now - ts <= 2000).length

    const typingRisk = clamp((220 - avgInterval) * 0.35, 0, 45)
    const consistencyRisk = clamp(variance * 0.0025, 0, 20)
    const pointerRisk = clamp(moveBurst * 0.5 + clickBurst * 2.5, 0, 30)

    // Edge AI processing would happen here in production:
    // on-device model inference combines telemetry features into a fraud probability.
    const finalRisk = clamp(12 + typingRisk + consistencyRisk + pointerRisk, 5, 98)

    const reasons = [
      {
        label: 'typing-speed',
        value: `${Math.round(avgInterval)}ms avg`,
        severity: typingRisk > 24 ? 'high' : typingRisk > 12 ? 'medium' : 'low',
      },
      {
        label: 'typing-consistency',
        value: `${Math.round(variance)} variance`,
        severity: consistencyRisk > 12 ? 'high' : consistencyRisk > 5 ? 'medium' : 'low',
      },
      {
        label: 'pointer-burst',
        value: `${moveBurst} move / ${clickBurst} click`,
        severity: pointerRisk > 18 ? 'high' : pointerRisk > 8 ? 'medium' : 'low',
      },
      {
        label: 'risk-decision',
        value: finalRisk >= 85 ? 'block' : finalRisk >= 65 ? 'challenge' : 'allow',
        severity: finalRisk >= 85 ? 'high' : finalRisk >= 65 ? 'medium' : 'low',
      },
    ]

    publishTelemetry(reasons)
    setRiskScore(finalRisk)
    return finalRisk
  }, [publishTelemetry, simulationMode])

  useEffect(() => {
    const handleMouseMove = () => {
      pushWithLimit(mouseTimestampsRef, Date.now(), 120)
    }

    const handleClick = () => {
      pushWithLimit(clickTimestampsRef, Date.now(), 120)
      if (simulationMode === 'normal') {
        updateRiskPreview()
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('click', handleClick)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('click', handleClick)
    }
  }, [simulationMode, updateRiskPreview])

  return {
    riskScore,
    simulationMode,
    telemetryReasons,
    telemetryTrail,
    trackKeystroke,
    analyzeBehavior,
    simulateNormalUser,
    simulateHackerBot,
  }
}
