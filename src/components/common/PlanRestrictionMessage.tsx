import React from 'react';
import { useNavigation } from '../../contexts/NavigationContext';
import { COLORS } from '../../utils/constants';
import { Button } from '../ui/Button/Button';
import { PLANS, PlanType } from '../../utils/plans';

interface PlanRestrictionMessageProps {
  requiredPlan: PlanType;
  currentPlan: PlanType;
  actionName: string;
  featureDescription: string;
  onClose?: () => void;
  showUpgradeButton?: boolean;
}

export const PlanRestrictionMessage: React.FC<PlanRestrictionMessageProps> = ({
  requiredPlan,
  currentPlan,
  actionName,
  featureDescription,
  onClose,
  showUpgradeButton = true
}) => {
  const requiredPlanInfo = PLANS[requiredPlan];
  const currentPlanInfo = PLANS[currentPlan];

  return (
    <div style={{
      backgroundColor: '#fff8e1',
      border: `1px solid ${COLORS.accent}`,
      borderRadius: '12px',
      padding: '20px',
      margin: '20px 0',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      position: 'relative'
    }}>
      {/* Botón cerrar (opcional) */}
      {onClose && (
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'none',
            border: 'none',
            fontSize: '18px',
            cursor: 'pointer',
            color: COLORS.gray,
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f0f0f0';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          ×
        </button>
      )}

      {/* Icono y título */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '15px',
        gap: '10px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: COLORS.light,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          color: COLORS.primary
        }}>
          🔒
        </div>
        <div>
          <h3 style={{
            margin: 0,
            color: COLORS.primary,
            fontSize: '18px',
            fontWeight: '600'
          }}>
            Función {actionName} no disponible
          </h3>
          <p style={{
            margin: '5px 0 0 0',
            color: COLORS.gray,
            fontSize: '14px'
          }}>
            Requiere plan {requiredPlanInfo.name}
          </p>
        </div>
      </div>

      {/* Descripción */}
      <p style={{
        margin: '0 0 15px 0',
        color: COLORS.gray,
        fontSize: '15px',
        lineHeight: '1.5'
      }}>
        {featureDescription}
      </p>

      {/* Comparación de planes */}
      <div style={{
        display: 'flex',
        gap: '15px',
        marginBottom: '20px',
        flexWrap: 'wrap'
      }}>
        <div style={{
          flex: 1,
          minWidth: '200px',
          padding: '15px',
          backgroundColor: '#f9f9f9',
          borderRadius: '8px',
          border: `1px solid ${COLORS.accent}50`
        }}>
          <div style={{
            fontSize: '12px',
            color: COLORS.gray,
            marginBottom: '5px'
          }}>
            TU PLAN ACTUAL
          </div>
          <div style={{
            fontSize: '16px',
            fontWeight: '600',
            color: COLORS.primary
          }}>
            {currentPlanInfo.name}
          </div>
          <ul style={{
            margin: '10px 0 0 0',
            paddingLeft: '20px',
            fontSize: '13px',
            color: COLORS.gray
          }}>
            {currentPlanInfo.features.slice(0, 3).map((feature, idx) => (
              <li key={idx}>{feature}</li>
            ))}
          </ul>
        </div>

        <div style={{
          flex: 1,
          minWidth: '200px',
          padding: '15px',
          backgroundColor: `${COLORS.light}30`,
          borderRadius: '8px',
          border: `2px solid ${COLORS.success}`
        }}>
          <div style={{
            fontSize: '12px',
            color: COLORS.success,
            marginBottom: '5px'
          }}>
            PLAN REQUERIDO
          </div>
          <div style={{
            fontSize: '16px',
            fontWeight: '600',
            color: COLORS.success
          }}>
            {requiredPlanInfo.name}
          </div>
          <ul style={{
            margin: '10px 0 0 0',
            paddingLeft: '20px',
            fontSize: '13px',
            color: COLORS.success
          }}>
            {requiredPlanInfo.features.slice(0, 3).map((feature, idx) => (
              <li key={idx}>{feature}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Botón de acción */}
      {showUpgradeButton && (
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '10px'
        }}>
          {onClose && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onClose}
            >
              Cerrar
            </Button>
          )}
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              console.log('🔼 Redirigiendo a página de planes desde restricción');
              // Aquí necesitaríamos acceso a navigateToPricing
              // Por ahora, simplemente recargamos la página con hash
              window.location.href = '#pricing';
              window.location.reload();
            }}
            style={{
              background: `linear-gradient(135deg, ${COLORS.success}, ${COLORS.primary})`
            }}
          >
            ⭐ Ver planes y precios
          </Button>
        </div>
      )}
    </div>
  );
};