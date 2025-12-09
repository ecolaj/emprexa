import React from 'react';
import { COLORS } from '../../utils/constants';

interface InfoODSScreenProps {
  onBack: () => void;
}

export const InfoODSScreen: React.FC<InfoODSScreenProps> = ({ onBack }) => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '20px',
        padding: '40px',
        maxWidth: '600px',
        width: '100%',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(10px)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '10px'
          }}>
            🌍
          </div>
          <h1 style={{
            color: COLORS.primary,
            margin: '0 0 10px 0',
            fontSize: '32px',
            fontWeight: '700'
          }}>
            Objetivos de Desarrollo Sostenible
          </h1>
          <div style={{
            height: '4px',
            width: '80px',
            background: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.secondary})`,
            margin: '0 auto',
            borderRadius: '2px'
          }}></div>
        </div>

        {/* Contenido */}
        <div style={{
          lineHeight: '1.6',
          color: COLORS.primary,
          fontSize: '16px'
        }}>
          <p style={{ marginBottom: '20px' }}>
            Los <strong>Objetivos de Desarrollo Sostenible (ODS)</strong> son un llamado universal a la acción 
            para poner fin a la pobreza, proteger el planeta y garantizar que todas las personas 
            gocen de paz y prosperidad para 2030.
          </p>

          <div style={{
            backgroundColor: `${COLORS.light}50`,
            padding: '20px',
            borderRadius: '12px',
            marginBottom: '20px',
            borderLeft: `4px solid ${COLORS.success}`
          }}>
            <h3 style={{ color: COLORS.success, margin: '0 0 10px 0' }}>🎯 ¿Qué buscan los ODS?</h3>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              <li>Erradicar la pobreza y el hambre</li>
              <li>Garantizar educación y salud de calidad</li>
              <li>Lograr la igualdad de género</li>
              <li>Promover el crecimiento económico sostenible</li>
              <li>Combatir el cambio climático</li>
              <li>Proteger los ecosistemas terrestres y marinos</li>
            </ul>
          </div>

          <p style={{ marginBottom: '20px' }}>
            Los 17 ODS están integrados, reconociendo que las intervenciones en un área 
            afectarán los resultados de otras y que el desarrollo debe equilibrar la 
            sostenibilidad social, económica y ambiental.
          </p>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '15px',
            backgroundColor: `${COLORS.primary}10`,
            borderRadius: '10px',
            marginBottom: '20px'
          }}>
            <div style={{ fontSize: '24px' }}>💡</div>
            <div>
              <strong>En EMPREXA</strong> conectamos proyectos e ideas con los ODS relevantes 
              para maximizar su impacto positivo en el mundo.
            </div>
          </div>
        </div>

        {/* Botón Regresar */}
        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <button
            onClick={onBack}
            style={{
              background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
              color: COLORS.white,
              border: 'none',
              padding: '12px 30px',
              borderRadius: '25px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '16px',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.3)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
            }}
          >
            ← Volver al Inicio
          </button>
        </div>
      </div>
    </div>
  );
};

export default InfoODSScreen;