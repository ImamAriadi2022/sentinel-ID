import { Badge, Button, Card, Stack } from 'react-bootstrap'

export default function SimulationControl({ riskScore, simulationMode, onNormal, onHacker }) {
  return (
    <Card className="border-0 shadow-sm control-panel">
      <Card.Body className="p-4">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h6 className="mb-0 fw-semibold">Simulation Control</h6>
          <Badge bg="dark" pill>
            Mode: {simulationMode === 'hacker' ? 'Hacker/Bot' : 'Normal'}
          </Badge>
        </div>

        <p className="text-secondary small mb-3">
          Panel ini hanya untuk demo POC. Gunakan untuk memicu telemetry anomali dan
          menunjukkan intervensi real-time Sentinel-ID.
        </p>

        <Stack direction="vertical" gap={2}>
          <Button variant="outline-success" className="fw-semibold" onClick={onNormal}>
            Simulate Normal User
          </Button>
          <Button variant="outline-danger" className="fw-semibold" onClick={onHacker}>
            Simulate Hacker/Bot
          </Button>
        </Stack>

        <div className="mt-3 p-3 rounded sentinel-mini-status">
          <p className="mb-1 small text-secondary">Current risk score</p>
          <h4 className="mb-0 fw-bold">{Math.round(riskScore)}</h4>
        </div>
      </Card.Body>
    </Card>
  )
}
