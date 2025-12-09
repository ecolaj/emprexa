import React from 'react';
import { COLORS } from '../../utils/constants';

interface InfoEmprexaScreenProps {
  onBack: () => void;
}

export const InfoEmprexaScreen: React.FC<InfoEmprexaScreenProps> = ({ onBack }) => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
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
            🚀
          </div>
          <h1 style={{
            color: COLORS.primary,
            margin: '0 0 10px 0',
            fontSize: '32px',
            fontWeight: '700'
          }}>
            ¿Qué es EMPREXA?
          </h1>
          <div style={{
            height: '4px',
            width: '80px',
            background: `linear-gradient(90deg, #f5576c, #f093fb)`,
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
            <strong>EMPREXA</strong> es una plataforma innovadora diseñada para conectar 
            emprendedores, activistas y agentes de cambio con los Objetivos de Desarrollo 
            Sostenible de las Naciones Unidas.
          </p>

          <div style={{
            backgroundColor: `${COLORS.light}50`,
            padding: '20px',
            borderRadius: '12px',
            marginBottom: '20px',
            borderLeft: `4px solid #f5576c`
          }}>
            <h3 style={{ color: '#f5576c', margin: '0 0 10px 0' }}>🎯 Nuestra Misión</h3>
            <p style={{ margin: 0 }}>
              Facilitar la conexión entre proyectos con impacto social y ambiental 
              y los ODS relevantes, creando una red global de agentes de cambio 
              comprometidos con un futuro sostenible.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '15px',
            marginBottom: '20px'
          }}>
            <div style={{
              padding: '15px',
              backgroundColor: `${COLORS.primary}08`,
              borderRadius: '10px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>🌱</div>
              <div style={{ fontWeight: '600', color: COLORS.primary }}>Proyectos Sostenibles</div>
              <div style={{ fontSize: '14px', color: COLORS.gray }}>Conecta tu iniciativa con los ODS</div>
            </div>
            
            <div style={{
              padding: '15px',
              backgroundColor: `${COLORS.primary}08`,
              borderRadius: '10px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>🤝</div>
              <div style={{ fontWeight: '600', color: COLORS.primary }}>Comunidad Global</div>
              <div style={{ fontSize: '14px', color: COLORS.gray }}>Networking con agentes de cambio</div>
            </div>
          </div>

          <div style={{
            backgroundColor: `${COLORS.success}10`,
            padding: '20px',
            borderRadius: '12px',
            marginBottom: '20px',
            border: `1px solid ${COLORS.success}30`
          }}>
            <h3 style={{ color: COLORS.success, margin: '0 0 15px 0' }}>📈 Nuestro Impacto</h3>
            <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
              <div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: COLORS.success }}>17</div>
                <div style={{ fontSize: '12px', color: COLORS.gray }}>ODS Conectados</div>
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: COLORS.success }}>∞</div>
                <div style={{ fontSize: '12px', color: COLORS.gray }}>Proyectos Posibles</div>
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: COLORS.success }}>100%</div>
                <div style={{ fontSize: '12px', color: COLORS.gray }}>Compromiso Sostenible</div>
              </div>
            </div>
          </div>

          <p style={{ 
            fontStyle: 'italic', 
            textAlign: 'center',
            color: COLORS.gray,
            marginBottom: '20px'
          }}>
            "Conectando ideas, transformando realidades, construyendo el futuro"
          </p>
        </div>

        {/* Botón Regresar */}
        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <button
            onClick={onBack}
            style={{
              background: 'linear-gradient(135deg, #f5576c, #f093fb)',
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

export default InfoEmprexaScreen;