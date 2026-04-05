import { Button, Modal } from 'react-bootstrap'

export default function RiskModal({ show, onClose }) {
  return (
    <Modal show={show} onHide={onClose} centered backdrop="static" keyboard={false}>
      <Modal.Header closeButton className="bg-danger text-white border-0">
        <Modal.Title className="fw-bold">SISTEM KEAMANAN SENTINEL-ID</Modal.Title>
      </Modal.Header>
      <Modal.Body className="pt-4 pb-2">
        <h5 className="text-danger fw-bold mb-3">
          TRANSAKSI DIBLOKIR.
        </h5>
        <p className="mb-0">
          Aktivitas tidak wajar terdeteksi. Melindungi akun Anda dari indikasi
          pengambilalihan (Account Takeover).
        </p>
      </Modal.Body>
      <Modal.Footer className="border-0 pt-0">
        <Button variant="danger" onClick={onClose} className="fw-semibold">
          Saya Mengerti
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
