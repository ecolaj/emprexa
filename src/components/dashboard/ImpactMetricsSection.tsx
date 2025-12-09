import React from 'react';
import { ImpactMetric } from '../../services/impactMetricsService';
import { DESIGN_SYSTEM } from '../../utils/designSystem';
import { formatUSD } from '../../utils/formatUtils';

interface ImpactMetricsSectionProps {
  impactMetrics: ImpactMetric | null;
  loading?: boolean;
}

export const ImpactMetricsSection: React.FC<ImpactMetricsSectionProps> = ({ 
  impactMetrics, 
  loading = false 
}) => {
  if (loading) {
    return (
      <div style={{
        background: DESIGN_SYSTEM.colors.background.card,
        borderRadius: DESIGN_SYSTEM.borderRadius.lg,
        padding: DESIGN_SYSTEM.spacing[5],
        boxShadow: DESIGN_SYSTEM.shadows.medium,
        border: `1px solid ${DESIGN_SYSTEM.colors.border.subtle}`,
        marginBottom: DESIGN_SYSTEM.spacing[6]
      }}>
        <div style={{ textAlign: 'center', padding: DESIGN_SYSTEM.spacing[8] }}>
          <div style={{ fontSize: '32px', marginBottom: DESIGN_SYSTEM.spacing[3] }}>📊</div>
          <p style={{ color: '#4a5568' }}>Cargando métricas de impacto...</p>
        </div>
      </div>
    );
  }

  if (!impactMetrics) {
    return null;
  }

  const {
    total_budget,
    total_beneficiaries,
    male_beneficiaries,
    female_beneficiaries,
    projects_with_partners,
    planning_count,
    execution_count,
    completed_count,
    scaling_count
  } = impactMetrics;

  // Calcular porcentajes
  const malePercentage = total_beneficiaries > 0 
    ? Math.round((male_beneficiaries / total_beneficiaries) * 100) 
    : 0;
  const femalePercentage = total_beneficiaries > 0 
    ? Math.round((female_beneficiaries / total_beneficiaries) * 100) 
    : 0;

  const totalProjects = planning_count + execution_count + completed_count + scaling_count;

  return (
    <div style={{
      background: DESIGN_SYSTEM.colors.background.card,
      borderRadius: DESIGN_SYSTEM.borderRadius.lg,
      padding: DESIGN_SYSTEM.spacing[5],
      boxShadow: DESIGN_SYSTEM.shadows.medium,
      border: `1px solid ${DESIGN_SYSTEM.colors.border.subtle}`,
      marginBottom: DESIGN_SYSTEM.spacing[6]
    }}>
      <h3 style={{ 
        margin: 0, 
        marginBottom: DESIGN_SYSTEM.spacing[4],
        fontSize: DESIGN_SYSTEM.typography.fontSize.lg,
        color: '#000000',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <span>🌍</span>
        Métricas de Impacto
      </h3>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: DESIGN_SYSTEM.spacing[4],
        marginBottom: DESIGN_SYSTEM.spacing[4]
      }}>
        {/* Presupuesto */}
        <div style={{
          background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
          borderRadius: DESIGN_SYSTEM.borderRadius.lg,
          padding: DESIGN_SYSTEM.spacing[4],
          border: '2px solid #f59e0b'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: DESIGN_SYSTEM.spacing[3]
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#f59e0b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '20px',
              marginRight: DESIGN_SYSTEM.spacing[3]
            }}>
              💰
            </div>
            <div>
              <h4 style={{
                margin: 0,
                fontSize: DESIGN_SYSTEM.typography.fontSize.base,
                fontWeight: DESIGN_SYSTEM.typography.fontWeight.semibold,
                color: '#000000'
              }}>
                Presupuesto Total
              </h4>
            </div>
          </div>
          <div style={{
            fontSize: DESIGN_SYSTEM.typography.fontSize.xl,
            fontWeight: DESIGN_SYSTEM.typography.fontWeight.bold,
            color: '#000000',
            textAlign: 'center'
          }}>
            {formatUSD(total_budget)}
          </div>
        </div>

        {/* Beneficiarios Totales */}
        <div style={{
          background: 'linear-gradient(135deg, #dbeafe, #93c5fd)',
          borderRadius: DESIGN_SYSTEM.borderRadius.lg,
          padding: DESIGN_SYSTEM.spacing[4],
          border: '2px solid #3b82f6'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: DESIGN_SYSTEM.spacing[3]
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '20px',
              marginRight: DESIGN_SYSTEM.spacing[3]
            }}>
              👥
            </div>
            <div>
              <h4 style={{
                margin: 0,
                fontSize: DESIGN_SYSTEM.typography.fontSize.base,
                fontWeight: DESIGN_SYSTEM.typography.fontWeight.semibold,
                color: '#000000'
              }}>
                Beneficiarios Totales
              </h4>
            </div>
          </div>
          <div style={{
            fontSize: DESIGN_SYSTEM.typography.fontSize.xl,
            fontWeight: DESIGN_SYSTEM.typography.fontWeight.bold,
            color: '#000000',
            textAlign: 'center'
          }}>
            {total_beneficiaries}
          </div>
          {total_beneficiaries > 0 && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-around',
              marginTop: DESIGN_SYSTEM.spacing[2],
              fontSize: DESIGN_SYSTEM.typography.fontSize.sm
            }}>
              <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>
                👨 {male_beneficiaries} ({malePercentage}%)
              </span>
              <span style={{ color: '#ec4899', fontWeight: 'bold' }}>
                👩 {female_beneficiaries} ({femalePercentage}%)
              </span>
            </div>
          )}
        </div>

        {/* Proyectos con Aliados */}
        <div style={{
          background: 'linear-gradient(135deg, #dcfce7, #86efac)',
          borderRadius: DESIGN_SYSTEM.borderRadius.lg,
          padding: DESIGN_SYSTEM.spacing[4],
          border: '2px solid #10b981'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: DESIGN_SYSTEM.spacing[3]
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '20px',
              marginRight: DESIGN_SYSTEM.spacing[3]
            }}>
              🤝
            </div>
            <div>
              <h4 style={{
                margin: 0,
                fontSize: DESIGN_SYSTEM.typography.fontSize.base,
                fontWeight: DESIGN_SYSTEM.typography.fontWeight.semibold,
                color: '#000000'
              }}>
                Proyectos con Aliados
              </h4>
            </div>
          </div>
          <div style={{
            fontSize: DESIGN_SYSTEM.typography.fontSize.xl,
            fontWeight: DESIGN_SYSTEM.typography.fontWeight.bold,
            color: '#000000',
            textAlign: 'center'
          }}>
            {projects_with_partners}
          </div>
        </div>
      </div>

      {/* Estado de Proyectos */}
      {totalProjects > 0 && (
        <div style={{
          background: 'white',
          borderRadius: DESIGN_SYSTEM.borderRadius.lg,
          padding: DESIGN_SYSTEM.spacing[4],
          border: '2px solid #e2e8f0',
          marginTop: DESIGN_SYSTEM.spacing[4]
        }}>
          <h4 style={{
            margin: 0,
            marginBottom: DESIGN_SYSTEM.spacing[3],
            fontSize: DESIGN_SYSTEM.typography.fontSize.base,
            fontWeight: DESIGN_SYSTEM.typography.fontWeight.semibold,
            color: '#000000',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>📋</span>
            Estado de Proyectos
          </h4>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: DESIGN_SYSTEM.spacing[3]
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '24px',
                marginBottom: '4px',
                color: '#f59e0b'
              }}>
                📋
              </div>
              <div style={{
                fontSize: DESIGN_SYSTEM.typography.fontSize.sm,
                color: '#4a5568',
                marginBottom: '4px'
              }}>
                Planificación
              </div>
              <div style={{
                fontSize: DESIGN_SYSTEM.typography.fontSize.xl,
                fontWeight: 'bold',
                color: '#000000'
              }}>
                {planning_count}
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '24px',
                marginBottom: '4px',
                color: '#3b82f6'
              }}>
                🚀
              </div>
              <div style={{
                fontSize: DESIGN_SYSTEM.typography.fontSize.sm,
                color: '#4a5568',
                marginBottom: '4px'
              }}>
                En ejecución
              </div>
              <div style={{
                fontSize: DESIGN_SYSTEM.typography.fontSize.xl,
                fontWeight: 'bold',
                color: '#000000'
              }}>
                {execution_count}
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '24px',
                marginBottom: '4px',
                color: '#10b981'
              }}>
                ✅
              </div>
              <div style={{
                fontSize: DESIGN_SYSTEM.typography.fontSize.sm,
                color: '#4a5568',
                marginBottom: '4px'
              }}>
                Completados
              </div>
              <div style={{
                fontSize: DESIGN_SYSTEM.typography.fontSize.xl,
                fontWeight: 'bold',
                color: '#000000'
              }}>
                {completed_count}
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '24px',
                marginBottom: '4px',
                color: '#8b5cf6'
              }}>
                📈
              </div>
              <div style={{
                fontSize: DESIGN_SYSTEM.typography.fontSize.sm,
                color: '#4a5568',
                marginBottom: '4px'
              }}>
                Escalando
              </div>
              <div style={{
                fontSize: DESIGN_SYSTEM.typography.fontSize.xl,
                fontWeight: 'bold',
                color: '#000000'
              }}>
                {scaling_count}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};