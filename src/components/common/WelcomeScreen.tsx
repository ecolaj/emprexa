import React from 'react';
import { COLORS } from '../../utils/constants';

interface WelcomeScreenProps {
  onShowAuthModal: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onShowAuthModal }) => {
  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: COLORS.white,
        borderRadius: '20px',
        padding: '40px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        maxWidth: '500px',
        width: '100%',
        textAlign: 'center'
      }}>
        {/* Logo y título */}
        <div style={{ marginBottom: '30px' }}>
          <img 
            src="/images/logo.png" 
            alt="EMPREXA Logo" 
            style={{
              width: '80px',
              height: '80px',
              margin: '0 0 10px 0',
              objectFit: 'contain'
            }}
          />
          <h2 style={{ 
            margin: '0 0 10px 0',
            color: COLORS.primary,
            fontSize: '28px'
          }}>
            EMPREXA
          </h2>
          <p style={{ 
            color: COLORS.gray,
            fontSize: '16px',
            lineHeight: '1.5'
          }}>
            Conectando Organizaciones, personas y proyectos para alcanzar Objetivos de Desarrollo Sostenible
          </p>
        </div>

        {/* 🆕 MODIFICADO: Botones informativos - MEJOR ALINEADOS */}
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          marginBottom: '30px',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <button
            onClick={() => window.showODSInfo?.()}
            style={{
              background: 'transparent',
              color: COLORS.primary,
              border: `1px solid ${COLORS.primary}60`,
              padding: '10px 20px',
              borderRadius: '20px',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '14px',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = `${COLORS.primary}15`;
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <span>ℹ️</span>
            <span>¿Qué son los ODS?</span>
          </button>
          
          <button
            onClick={() => window.showEmprexaInfo?.()}
            style={{
              background: 'transparent',
              color: COLORS.primary,
              border: `1px solid ${COLORS.primary}60`,
              padding: '10px 20px',
              borderRadius: '20px',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '14px',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = `${COLORS.primary}15`;
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <span>🚀</span>
            <span>¿Qué es EMPREXA?</span>
          </button>
        </div>

        {/* 🆕 MODIFICADO: Botón de inicio de sesión - MEJOR ALINEADO */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <button
            onClick={() => {
              // Abrir AuthModal en modo login  
              onShowAuthModal();
            }}
            style={{
              background: 'transparent',
              color: COLORS.primary,
              border: `2px solid ${COLORS.primary}`,
              padding: '12px 30px',
              borderRadius: '20px', // 🆕 Cambiado a 20px para coincidir con los otros
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              width: 'fit-content',
              margin: '0 auto',
              minWidth: '200px' // 🆕 Ancho mínimo consistente
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = COLORS.primary;
              e.currentTarget.style.color = COLORS.white;
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
              // 🆕 Cambia también el color del emoji
              e.currentTarget.querySelector('span')!.style.filter = 'brightness(0) invert(1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = COLORS.primary;
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
              // 🆕 Restaura el color del emoji
              e.currentTarget.querySelector('span')!.style.filter = 'none';
            }}
          >
            <span>👤</span>
            <span>Iniciar Sesión</span>
          </button>
        </div>

        {/* Información adicional */}
        <div style={{ 
          marginTop: '40px',
          padding: '25px',
          backgroundColor: COLORS.light,
          borderRadius: '15px',
          border: `1px solid ${COLORS.primary}20`
        }}>
          <h4 style={{ 
            color: COLORS.primary, 
            margin: '0 0 15px 0',
            fontSize: '18px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            justifyContent: 'center'
          }}>
            <span>✨</span>
            <span>¿Qué puedes hacer aquí?</span>
          </h4>
          <ul style={{ 
            textAlign: 'left', 
            color: COLORS.gray,
            fontSize: '15px',
            lineHeight: '1.8',
            paddingLeft: '20px',
            margin: 0,
            listStyleType: 'none'
          }}>
            <li style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '18px' }}>📝</span>
              <span>Compartir proyectos de sostenibilidad</span>
            </li>
            <li style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '18px' }}>🤝</span>
              <span>Conectar con personas con tus mismos intereses</span>
            </li>
            <li style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '18px' }}>🎯</span>
              <span>Contribuir a los Objetivos de Desarrollo Sostenible</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '18px' }}>💬</span>
              <span>Colaborar y compartir ideas</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};