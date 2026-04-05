import { useEffect, useRef, useState } from 'react'
import { Alert, Badge, Button, Card, Col, Form, InputGroup, ProgressBar, Row } from 'react-bootstrap'

function riskVariant(score) {
  if (score >= 85) return 'danger'
  if (score >= 65) return 'warning'
  return 'success'
}

function riskLabel(score) {
  if (score >= 85) return 'High Risk'
  if (score >= 65) return 'Watchlist'
  return 'Trusted'
}

export default function TransferForm({
  accountNumber,
  amount,
  riskScore,
  adaptiveChallenge,
  challengeCode,
  challengeStatus,
  isAnalyzing,
  successMessage,
  formError,
  onAccountChange,
  onAmountChange,
  onChallengeCodeChange,
  onSubmit,
}) {
  const [displayRisk, setDisplayRisk] = useState(riskScore)
  const [pulseRisk, setPulseRisk] = useState(false)
  const rafRef = useRef(null)
  const displayRiskRef = useRef(riskScore)

  useEffect(() => {
    const startValue = displayRiskRef.current
    const targetValue = riskScore
    const delta = targetValue - startValue
    const startTime = performance.now()
    const durationMs = 500

    const animate = (now) => {
      const progress = Math.min((now - startTime) / durationMs, 1)
      const eased = 1 - (1 - progress) ** 3
      const nextValue = startValue + delta * eased
      displayRiskRef.current = nextValue
      setDisplayRisk(nextValue)

      if (progress < 1) {
        rafRef.current = window.requestAnimationFrame(animate)
      }
    }

    if (Math.abs(delta) > 2) {
      rafRef.current = window.requestAnimationFrame(animate)
    } else {
      displayRiskRef.current = targetValue
      setDisplayRisk(targetValue)
    }

    if (delta >= 14) {
      setPulseRisk(true)
      const timer = window.setTimeout(() => setPulseRisk(false), 700)
      return () => {
        window.clearTimeout(timer)
        if (rafRef.current) {
          window.cancelAnimationFrame(rafRef.current)
        }
      }
    }

    return () => {
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current)
      }
    }
  }, [riskScore])

  const variant = riskVariant(displayRisk)

  return (
    <Card className="border-0 shadow-sm sentinel-card">
      <Card.Body className="p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <p className="text-secondary small mb-1">Sentinel-ID Continuous Authentication</p>
            <h5 className="mb-0 fw-semibold">Transfer Dana</h5>
          </div>
          <Badge bg={variant} pill>
            {riskLabel(displayRisk)}
          </Badge>
        </div>

        <div className={`mb-4 ${pulseRisk ? 'risk-score-pulse' : ''}`}>
          <div className="d-flex justify-content-between mb-1 small text-secondary">
            <span>Risk Score</span>
            <span className="fw-semibold text-dark">{Math.round(displayRisk)}/100</span>
          </div>
          <ProgressBar now={displayRisk} variant={variant} style={{ height: '8px', transition: 'all .45s ease' }} />
        </div>

        <Form onSubmit={onSubmit} noValidate>
          <Form.Group className="mb-3" controlId="accountNumber">
            <Form.Label className="fw-medium">Nomor Rekening Tujuan</Form.Label>
            <Form.Control
              type="text"
              inputMode="numeric"
              maxLength={16}
              value={accountNumber}
              onChange={onAccountChange}
              placeholder="Contoh: 1234567890123456"
              required
            />
          </Form.Group>

          <Form.Group className="mb-4" controlId="transferAmount">
            <Form.Label className="fw-medium">Nominal Transfer</Form.Label>
            <InputGroup>
              <InputGroup.Text>Rp</InputGroup.Text>
              <Form.Control
                type="text"
                inputMode="numeric"
                value={amount}
                onChange={onAmountChange}
                placeholder="Contoh: 1500000"
                required
              />
            </InputGroup>
          </Form.Group>

          {formError ? (
            <Alert variant="warning" className="py-2 mb-3 small">
              {formError}
            </Alert>
          ) : null}

          {successMessage ? (
            <Alert variant="success" className="py-2 mb-3">
              {successMessage}
            </Alert>
          ) : null}

          {adaptiveChallenge ? (
            <Alert variant={challengeStatus === 'failed' ? 'danger' : challengeStatus === 'passed' ? 'success' : 'info'} className="mb-3">
              <p className="mb-2 fw-semibold">Adaptive Challenge Diperlukan</p>
              <p className="mb-2 small">
                Risk berada di zona menengah. Masukkan kode verifikasi untuk melanjutkan transaksi.
              </p>
              <Form.Control
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={challengeCode}
                onChange={onChallengeCodeChange}
                placeholder="Masukkan 6 digit verifikasi"
              />
            </Alert>
          ) : null}

          <Row className="g-2 align-items-center">
            <Col>
              <Button
                type="submit"
                variant="primary"
                className="w-100 fw-semibold py-2"
                disabled={isAnalyzing}
              >
                {isAnalyzing ? 'Menganalisis Perilaku...' : 'Kirim'}
              </Button>
            </Col>
          </Row>
        </Form>
      </Card.Body>
    </Card>
  )
}
