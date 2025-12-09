import React, { useState } from 'react';
import { Report, ReportReason } from '../../types';
import { createReport, reportReasons } from '../../services/reportService';
import { COLORS } from '../../utils/constants';

interface ReportButtonProps {
  contentId: string;
  contentType: 'post' | 'comment';
  onReportSubmitted?: () => void;
  buttonStyle?: 'icon' | 'text';
}

export const ReportButton: React.FC<ReportButtonProps> = ({
  contentId,
  contentType,
  onReportSubmitted,
  buttonStyle = 'icon'
}) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState<Report['reason']>('spam');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitReport = async () => {
    if (!selectedReason) return;

    setSubmitting(true);
    const result = await createReport(contentId, contentType, selectedReason, description);
    setSubmitting(false);

    if (result.success) {
      setSubmitted(true);
      setTimeout(() => {
        setShowModal(false);
        setSubmitted(false);
        onReportSubmitted?.();
      }, 1500);
    } else {
      alert('Error al enviar el reporte: ' + result.error);
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setSelectedReason('spam');
    setDescription('');
    setSubmitted(false);
  };

  if (submitted) {
    return (
      <div style={{ 
        color: COLORS.success, 
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        ✅ Reporte enviado
      </div>
    );
  }

  return (
    <>
      {/* Botón para abrir el modal de reporte */}
      {buttonStyle === 'icon' ? (
        <button
          onClick={() => setShowModal(true)}
          style={{
            background: 'none',
            border: 'none',
            color: COLORS.gray,
            cursor: 'pointer',
            fontSize: '14px',
            padding: '4px 8px',
            borderRadius: '4px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = COLORS.primary;
            e.currentTarget.style.backgroundColor = '#f1f5f9';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = COLORS.gray;
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          title="Reportar contenido"
        >
          ⚠️ Reportar
        </button>
      ) : (
        <button
          onClick={() => setShowModal(true)}
          style={{
            background: 'none',
            border: 'none',
            color: COLORS.gray,
            cursor: 'pointer',
            fontSize: '12px',
            textDecoration: 'underline',
            padding: '2px 4px'
          }}
        >
          Reportar
        </button>
      )}

      {/* Modal de reporte */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h3 style={{ margin: 0, color: COLORS.primary }}>
                Reportar {contentType === 'post' ? 'Publicación' : 'Comentario'}
              </h3>
              <button
                onClick={handleClose}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: COLORS.gray
                }}
              >
                ×
              </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: COLORS.primary
              }}>
                Motivo del reporte:
              </label>
              {reportReasons.map((reason) => (
                <div key={reason.value} style={{ marginBottom: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      value={reason.value}
                      checked={selectedReason === reason.value}
                      onChange={(e) => setSelectedReason(e.target.value as Report['reason'])}
                      style={{ marginTop: '2px' }}
                    />
                    <div>
                      <div style={{ fontWeight: '600' }}>{reason.label}</div>
                      <div style={{ fontSize: '12px', color: COLORS.gray }}>
                        {reason.description}
                      </div>
                    </div>
                  </label>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: COLORS.primary
              }}>
                Descripción adicional (opcional):
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Proporciona más detalles sobre el problema..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: `1px solid ${COLORS.gray}`, // o usa un color específico como '#e2e8f0'
                  borderRadius: '6px',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={handleClose}
                style={{
                  padding: '10px 20px',
                  background: '#f8fafc',
                  color: COLORS.gray,
                  border: `1px solid ${COLORS.gray}`, // o usa un color específico como '#e2e8f0'
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmitReport}
                disabled={submitting || !selectedReason}
                style={{
                  padding: '10px 20px',
                  background: submitting ? COLORS.gray : COLORS.primary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.7 : 1
                }}
              >
                {submitting ? 'Enviando...' : 'Enviar Reporte'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};