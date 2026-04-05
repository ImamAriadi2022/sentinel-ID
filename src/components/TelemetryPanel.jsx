import { Badge, Card, ListGroup } from 'react-bootstrap'

function severityVariant(severity) {
  if (severity === 'high') return 'danger'
  if (severity === 'medium') return 'warning'
  return 'success'
}

export default function TelemetryPanel({ reasons, trail }) {
  return (
    <Card className="border-0 shadow-sm control-panel mt-3">
      <Card.Body className="p-4">
        <h6 className="fw-semibold mb-2">Telemetry Reason Codes</h6>
        <p className="text-secondary small mb-3">
          Ringkasan sinyal Edge AI untuk menjelaskan keputusan risk engine saat demo.
        </p>

        <ListGroup variant="flush" className="mb-3 telemetry-list">
          {reasons.length ? reasons.map((item) => (
            <ListGroup.Item key={`${item.label}-${item.value}`} className="px-0 py-2 border-0 bg-transparent">
              <div className="d-flex justify-content-between align-items-center gap-2">
                <div>
                  <p className="mb-0 fw-semibold text-uppercase telemetry-label">{item.label}</p>
                  <p className="mb-0 small text-secondary">{item.value}</p>
                </div>
                <Badge bg={severityVariant(item.severity)}>{item.severity}</Badge>
              </div>
            </ListGroup.Item>
          )) : (
            <ListGroup.Item className="px-0 py-2 border-0 bg-transparent small text-secondary">
              Belum ada telemetry. Mulai ketik atau jalankan simulasi.
            </ListGroup.Item>
          )}
        </ListGroup>

        <div>
          <p className="small text-secondary mb-2">Recent decisions</p>
          <div className="telemetry-trail-wrap">
            {trail.length ? trail.slice(0, 6).map((event) => (
              <span key={event.id} className={`telemetry-pill telemetry-${event.severity}`}>
                {event.label}
              </span>
            )) : (
              <span className="small text-secondary">No decision trail</span>
            )}
          </div>
        </div>
      </Card.Body>
    </Card>
  )
}
