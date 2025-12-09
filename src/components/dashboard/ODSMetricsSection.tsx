import React from 'react';
import { ODSMetric } from '../../services/odsMetricsService';
import { DESIGN_SYSTEM } from '../../utils/designSystem';

interface ODSMetricsSectionProps {
  odsMetrics: ODSMetric[];
  loading?: boolean;
}

export const ODSMetricsSection: React.FC<ODSMetricsSectionProps> = ({ 
  odsMetrics, 
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
          <div style={{ fontSize: '32px', marginBottom: DESIGN_SYSTEM.spacing[3] }}>🌍</div>
          <p style={{ color: '#4a5568' }}>Cargando impacto ODS...</p>
        </div>
      </div>
    );
  }

  if (!odsMetrics || odsMetrics.length === 0) {
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
          marginBottom: DESIGN_SYSTEM.spacing[3],
          fontSize: DESIGN_SYSTEM.typography.fontSize.lg,
          color: '#000000'  // NEGRO PURO
        }}>
          🌍 Mi Impacto en ODS
        </h3>
        <div style={{ textAlign: 'center', padding: DESIGN_SYSTEM.spacing[6] }}>
          <div style={{ fontSize: '48px', marginBottom: DESIGN_SYSTEM.spacing[3] }}>📊</div>
          <p style={{ 
            color: '#4a5568',  // GRIS OSCURO
            marginBottom: DESIGN_SYSTEM.spacing[3]
          }}>
            Aún no tienes métricas de impacto en ODS
          </p>
          <p style={{ 
            fontSize: DESIGN_SYSTEM.typography.fontSize.sm,
            color: '#4a5568'  // GRIS OSCURO
          }}>
            Publica proyectos relacionados con los Objetivos de Desarrollo Sostenible para ver tu impacto aquí.
          </p>
        </div>
      </div>
    );
  }

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
        color: '#000000'  // NEGRO PURO
      }}>
        🌍 Mi Impacto en ODS
      </h3>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: DESIGN_SYSTEM.spacing[4],
        marginBottom: DESIGN_SYSTEM.spacing[4]
      }}>
        {odsMetrics.map((ods, index) => (
          <div
            key={ods.ods_numero}
            style={{
              background: 'white',
              borderRadius: DESIGN_SYSTEM.borderRadius.lg,
              padding: DESIGN_SYSTEM.spacing[4],
              border: `2px solid ${ods.ods_color || DESIGN_SYSTEM.colors.primary[500]}`,
              boxShadow: DESIGN_SYSTEM.shadows.small
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: DESIGN_SYSTEM.spacing[3]
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: ods.ods_color || DESIGN_SYSTEM.colors.primary[500],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: DESIGN_SYSTEM.typography.fontSize.lg,
                marginRight: DESIGN_SYSTEM.spacing[3]
              }}>
                {ods.ods_numero}
              </div>
              <div>
                <h4 style={{
                  margin: 0,
                  fontSize: DESIGN_SYSTEM.typography.fontSize.base,
                  fontWeight: DESIGN_SYSTEM.typography.fontWeight.semibold,
                  color: '#000000'  // NEGRO PURO
                }}>
                  ODS {ods.ods_numero}
                </h4>
                <p style={{
                  margin: 0,
                  fontSize: DESIGN_SYSTEM.typography.fontSize.sm,
                  color: ods.ods_color || '#4a5568',  // COLOR OFICIAL DEL ODS
                  fontWeight: DESIGN_SYSTEM.typography.fontWeight.medium
                }}>
                  {ods.ods_nombre}
                </p>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: DESIGN_SYSTEM.spacing[3]
            }}>
              <div>
                <div style={{
                  fontSize: DESIGN_SYSTEM.typography.fontSize.sm,
                  color: '#4a5568',  // GRIS OSCURO
                  marginBottom: DESIGN_SYSTEM.spacing[1]
                }}>
                  Proyectos
                </div>
                <div style={{
                  fontSize: DESIGN_SYSTEM.typography.fontSize.xl,
                  fontWeight: DESIGN_SYSTEM.typography.fontWeight.bold,
                  color: '#000000'  // NEGRO PURO
                }}>
                  {ods.post_count}
                </div>
              </div>
              
              <div>
                <div style={{
                  fontSize: DESIGN_SYSTEM.typography.fontSize.sm,
                  color: '#4a5568',  // GRIS OSCURO
                  marginBottom: DESIGN_SYSTEM.spacing[1]
                }}>
                  Engagement
                </div>
                <div style={{
                  fontSize: DESIGN_SYSTEM.typography.fontSize.xl,
                  fontWeight: DESIGN_SYSTEM.typography.fontWeight.bold,
                  color: '#000000'  // NEGRO PURO
                }}>
                  {ods.total_engagement}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: DESIGN_SYSTEM.spacing[4],
        borderTop: `1px solid ${DESIGN_SYSTEM.colors.border.subtle}`
      }}>
        <div>
          <p style={{
            margin: 0,
            fontSize: DESIGN_SYSTEM.typography.fontSize.sm,
            color: '#4a5568'  // GRIS OSCURO
          }}>
            Total: <strong style={{ color: '#000000' }}>{odsMetrics.length} ODS</strong> impactados
          </p>
        </div>
        <div>
          <p style={{
            margin: 0,
            fontSize: DESIGN_SYSTEM.typography.fontSize.sm,
            color: '#4a5568'  // GRIS OSCURO
          }}>
            <strong style={{ color: '#000000' }}>
              {odsMetrics.reduce((sum, ods) => sum + ods.post_count, 0)} proyectos
            </strong> en total
          </p>
        </div>
      </div>
    </div>
  );
};