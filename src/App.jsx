import { useMemo, useState } from 'react'
import { Badge, Card, Col, Container, Row } from 'react-bootstrap'
import RiskModal from './components/RiskModal'
import SimulationControl from './components/SimulationControl'
import TelemetryPanel from './components/TelemetryPanel'
import TransferForm from './components/TransferForm'
import useSentinelSDK from './hooks/useSentinelSDK'

function App() {
  const [accountNumber, setAccountNumber] = useState('')
  const [amount, setAmount] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showBlockedModal, setShowBlockedModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [formError, setFormError] = useState('')
  const [adaptiveChallenge, setAdaptiveChallenge] = useState(false)
  const [challengeCode, setChallengeCode] = useState('')
  const [challengeStatus, setChallengeStatus] = useState('idle')

  const {
    riskScore,
    simulationMode,
    telemetryReasons,
    telemetryTrail,
    trackKeystroke,
    analyzeBehavior,
    simulateNormalUser,
    simulateHackerBot,
  } = useSentinelSDK()

  const formattedAmountPreview = useMemo(() => {
    const numeric = Number(amount.replace(/\D/g, ''))
    if (!numeric) return 'Rp0'
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(numeric)
  }, [amount])

  const onAccountChange = (event) => {
    const digitsOnly = event.target.value.replace(/\D/g, '')
    setAccountNumber(digitsOnly)
    setSuccessMessage('')
    setFormError('')
    trackKeystroke('accountNumber')
  }

  const onAmountChange = (event) => {
    const digitsOnly = event.target.value.replace(/\D/g, '')
    setAmount(digitsOnly)
    setSuccessMessage('')
    setFormError('')
    trackKeystroke('amount')
  }

  const onChallengeCodeChange = (event) => {
    const digitsOnly = event.target.value.replace(/\D/g, '')
    setChallengeCode(digitsOnly)
    if (challengeStatus !== 'idle') {
      setChallengeStatus('idle')
    }
  }

  const onNormalSimulation = () => {
    simulateNormalUser()
    setAdaptiveChallenge(false)
    setChallengeCode('')
    setChallengeStatus('idle')
    setFormError('')
  }

  const onHackerSimulation = () => {
    simulateHackerBot()
    setAdaptiveChallenge(false)
    setChallengeCode('')
    setChallengeStatus('idle')
    setFormError('')
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!accountNumber || accountNumber.length < 8) {
      setFormError('Nomor rekening minimal 8 digit.')
      return
    }

    if (!amount || Number(amount) <= 0) {
      setFormError('Nominal transfer harus lebih dari Rp0.')
      return
    }

    setFormError('')
    setSuccessMessage('')
    setIsAnalyzing(true)

    const score = analyzeBehavior()

    setTimeout(() => {
      setIsAnalyzing(false)

      if (score >= 85) {
        setAdaptiveChallenge(false)
        setShowBlockedModal(true)
        return
      }

      if (score >= 65) {
        if (!adaptiveChallenge) {
          setAdaptiveChallenge(true)
          setFormError('Aktivitas borderline terdeteksi. Lanjutkan dengan adaptive challenge.')
          return
        }

        if (challengeCode.length !== 6) {
          setChallengeStatus('failed')
          setFormError('Kode verifikasi wajib 6 digit untuk melanjutkan.')
          return
        }

        if (challengeCode !== '129900') {
          setChallengeStatus('failed')
          setFormError('Kode verifikasi tidak valid. Silakan coba lagi.')
          return
        }

        setChallengeStatus('passed')
        setAdaptiveChallenge(false)
      }

      setSuccessMessage(score >= 65 ? 'Transaksi Berhasil setelah verifikasi tambahan' : 'Transaksi Berhasil')
      setAmount('')
      setAccountNumber('')
      setChallengeCode('')
      setFormError('')
    }, 550)
  }

  return (
    <main className="sentinel-page py-4 py-md-5">
      <Container>
        <Row className="g-4 justify-content-center align-items-start">
          <Col xs={12} lg={6} className="d-flex justify-content-center">
            <div className="mobile-frame">
              <Card className="border-0 shadow sentinel-mobile-app">
                <Card.Body className="p-4 p-md-4">
                  <div className="d-flex justify-content-between align-items-start mb-4">
                    <div>
                      <p className="text-secondary small mb-1">Sentinel Mobile Banking</p>
                      <h4 className="fw-bold mb-0">Halo, Anzim tim</h4>
                    </div>
                    <Badge bg="primary" pill>
                      Active Shield
                    </Badge>
                  </div>

                  <Card className="border-0 mb-3 account-balance-card">
                    <Card.Body className="p-3">
                      <p className="small text-secondary mb-1">Saldo Tersedia</p>
                      <h5 className="fw-bold mb-0">Rp24.850.000</h5>
                    </Card.Body>
                  </Card>

                  <TransferForm
                    accountNumber={accountNumber}
                    amount={amount}
                    riskScore={riskScore}
                    adaptiveChallenge={adaptiveChallenge}
                    challengeCode={challengeCode}
                    challengeStatus={challengeStatus}
                    isAnalyzing={isAnalyzing}
                    successMessage={successMessage}
                    formError={formError}
                    onAccountChange={onAccountChange}
                    onAmountChange={onAmountChange}
                    onChallengeCodeChange={onChallengeCodeChange}
                    onSubmit={handleSubmit}
                  />

                  <p className="text-secondary small mt-3 mb-0 text-center">
                    Nominal saat ini: <span className="fw-semibold text-dark">{formattedAmountPreview}</span>
                  </p>
                </Card.Body>
              </Card>
            </div>
          </Col>

          <Col xs={12} lg={5}>
            <SimulationControl
              riskScore={riskScore}
              simulationMode={simulationMode}
              onNormal={onNormalSimulation}
              onHacker={onHackerSimulation}
            />

            <TelemetryPanel reasons={telemetryReasons} trail={telemetryTrail} />
          </Col>
        </Row>
      </Container>

      <RiskModal show={showBlockedModal} onClose={() => setShowBlockedModal(false)} />
    </main>
  )
}

export default App
