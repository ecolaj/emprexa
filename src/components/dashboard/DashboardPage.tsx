import React, { useState } from 'react';
import { useDashboard } from '../../hooks/useDashboard';
import { DESIGN_SYSTEM } from '../../utils/designSystem';
import { format, subDays } from 'date-fns';
import { LineChart } from './LineChart';
import { useTimeSeriesData } from '../../hooks/useTimeSeriesData';
import { ODSMetricsSection } from './ODSMetricsSection';
import React, { useState, useEffect } from 'react';
import { ImpactMetricsSection } from './ImpactMetricsSection';

interface DashboardPageProps {
  currentUser?: any; // 🆕 NUEVO: Recibir currentUser como prop
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ currentUser }) => {
  const [range] = useState(() => ({
    since: format(subDays(new Date(), 30), "yyyy-MM-dd'T00:00:00'"),
    until: format(new Date(), "yyyy-MM-dd'T23:59:59'")
  }));

  const [shouldAnimate, setShouldAnimate] = useState(false);

  // Efecto para activar animaciones cuando el componente se monta
  useEffect(() => {
    setShouldAnimate(true);
    
    // Reset para que la próxima vez también se anime
    return () => {
      setShouldAnimate(false);
    };
  }, []);

  const { metrics, odsMetrics, impactMetrics, loading, error } = useDashboard({ 
    range, 
    userId: currentUser?.id 
  });

  const { timeSeriesData, loading: chartsLoading } = useTimeSeriesData({
    range,
    userId: currentUser?.id
  });

  return (
    <div
      style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: DESIGN_SYSTEM.spacing[6],
        color: DESIGN_SYSTEM.colors.text.primary
      }}
    >
                  <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.2); opacity: 0.7; }
          }
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          @keyframes cardSlideIn {
            0% {
              opacity: 0;
              transform: translateY(20px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes fadeInUp {
            0% {
              opacity: 0;
              transform: translateY(30px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes scaleIn {
            0% {
              opacity: 0;
              transform: scale(0.9);
            }
            100% {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}
      </style>
      <div style={{ 
  marginBottom: DESIGN_SYSTEM.spacing[8],
  textAlign: 'center',
  padding: `${DESIGN_SYSTEM.spacing[8]} 0`,
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  borderRadius: DESIGN_SYSTEM.borderRadius.xl,
  margin: `0 -${DESIGN_SYSTEM.spacing[6]}`,
  paddingLeft: DESIGN_SYSTEM.spacing[6],
  paddingRight: DESIGN_SYSTEM.spacing[6],
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
}}>
 <h1 style={{ 
  fontSize: '2.5rem',
  fontWeight: '800',
  margin: 0,
  marginBottom: DESIGN_SYSTEM.spacing[3],
  color: 'white', // Color base para el emoji
  letterSpacing: '-0.025em'
}}>
  <span style={{ 
    background: 'linear-gradient(45deg, #ffffff, #f0f4ff)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    display: 'inline-block',
    marginRight: '8px'
  }}>
    Dashboard Premium
  </span>
  📊
</h1>
  <p style={{ 
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: DESIGN_SYSTEM.typography.fontSize.lg,
    margin: 0,
    fontWeight: DESIGN_SYSTEM.typography.fontWeight.medium,
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
  }}>
    Métricas de los últimos 30 días de actividad
  </p>
</div>

{loading && (
        <div style={{ 
          textAlign: 'center', 
          padding: DESIGN_SYSTEM.spacing[16],
          background: 'linear-gradient(145deg, #ffffff, #f8fafc)',
          borderRadius: '24px',
          marginBottom: DESIGN_SYSTEM.spacing[6],
          boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.8)'
        }}>
          {/* Spinner animado */}
          <div style={{
            width: '80px',
            height: '80px',
            margin: '0 auto',
            marginBottom: DESIGN_SYSTEM.spacing[6],
            border: '4px solid #f1f5f9',
            borderTop: '4px solid #667eea',
            borderRight: '4px solid #764ba2',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          
          <h3 style={{
            margin: 0,
            marginBottom: DESIGN_SYSTEM.spacing[3],
            fontSize: '1.5rem',
            fontWeight: '700',
            background: 'linear-gradient(45deg, #667eea, #764ba2)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Cargando Dashboard
          </h3>
          
          <p style={{ 
            color: '#64748b',
            margin: 0,
            fontSize: DESIGN_SYSTEM.typography.fontSize.base,
            fontWeight: '500'
          }}>
            Preparando tus métricas premium...
          </p>
          
          {/* Puntos animados */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: DESIGN_SYSTEM.spacing[4],
            gap: '8px'
          }}>
            {[0, 1, 2].map((dot) => (
              <div
                key={dot}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#667eea',
                  animation: `pulse 1.4s ease-in-out ${dot * 0.32}s infinite`
                }}
              />
            ))}
          </div>
        </div>
      )}

{error && (
        <div style={{
          background: 'linear-gradient(145deg, #fef2f2, #fecaca)',
          borderRadius: '24px',
          padding: DESIGN_SYSTEM.spacing[8],
          marginBottom: DESIGN_SYSTEM.spacing[6],
          boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.05)',
          border: '1px solid #fecaca',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Efecto decorativo */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '6px',
            background: 'linear-gradient(90deg, #ef4444, #dc2626)',
            borderRadius: '24px 24px 0 0'
          }} />
          
          {/* Icono de error */}
          <div style={{
            fontSize: '4rem',
            marginBottom: DESIGN_SYSTEM.spacing[4],
            animation: 'bounce 1s infinite'
          }}>
            ⚠️
          </div>
          
          <h3 style={{
            margin: 0,
            marginBottom: DESIGN_SYSTEM.spacing[3],
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#dc2626',
            background: 'linear-gradient(45deg, #dc2626, #ef4444)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Error al Cargar
          </h3>
          
          <p style={{ 
            color: '#7f1d1d',
            margin: 0,
            marginBottom: DESIGN_SYSTEM.spacing[6],
            fontSize: DESIGN_SYSTEM.typography.fontSize.base,
            fontWeight: '500',
            lineHeight: '1.5'
          }}>
            {error}
          </p>
          
          {/* Botón de reintento */}
          <button
            onClick={() => window.location.reload()}
            style={{
              background: 'linear-gradient(45deg, #ef4444, #dc2626)',
              color: 'white',
              border: 'none',
              padding: `${DESIGN_SYSTEM.spacing[3]} ${DESIGN_SYSTEM.spacing[6]}`,
              borderRadius: '12px',
              fontSize: DESIGN_SYSTEM.typography.fontSize.base,
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 6px -1px rgba(220, 38, 38, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 8px -1px rgba(220, 38, 38, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(220, 38, 38, 0.3)';
            }}
          >
            🔄 Reintentar
          </button>
        </div>
      )}

            {!loading && !error && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: DESIGN_SYSTEM.spacing[4],
                marginBottom: DESIGN_SYSTEM.spacing[6]
              }}>
                {metrics.map((metric, index) => (
                              <div
                              key={index}
                              style={{
                                background: 'linear-gradient(145deg, #ffffff, #f8fafc)',
                                borderRadius: '20px',
                                padding: DESIGN_SYSTEM.spacing[6],
                                boxShadow: `
                                  0 4px 6px -1px rgba(0, 0, 0, 0.05),
                                  0 10px 15px -3px rgba(0, 0, 0, 0.08),
                                  inset 0 1px 0 rgba(255, 255, 255, 0.5)
                                `,
                                border: `1px solid rgba(255, 255, 255, 0.8)`,
                                position: 'relative',
                                overflow: 'hidden',
                                transition: 'all 0.3s ease',
                                cursor: 'pointer',
                                opacity: shouldAnimate ? 0 : 1,
                                transform: shouldAnimate ? 'translateY(20px)' : 'translateY(0)',
                                animation: shouldAnimate ? `cardSlideIn 0.6s ease-out ${index * 0.1}s forwards` : 'none'
                              }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = `
                        0 20px 25px -5px rgba(0, 0, 0, 0.1),
                        0 10px 10px -5px rgba(0, 0, 0, 0.04)
                      `;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = `
                        0 4px 6px -1px rgba(0, 0, 0, 0.05),
                        0 10px 15px -3px rgba(0, 0, 0, 0.08),
                        inset 0 1px 0 rgba(255, 255, 255, 0.5)
                      `;
                    }}
                  >
                    {/* Efecto de brillo sutil */}
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: 'linear-gradient(90deg, #667eea, #764ba2)',
                      borderRadius: '20px 20px 0 0'
                    }} />
  {/* Efecto de brillo sutil */}
  <div style={{
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #667eea, #764ba2)',
    borderRadius: '20px 20px 0 0'
  }} />
  
  <h3 style={{ 
    margin: 0, 
    fontSize: DESIGN_SYSTEM.typography.fontSize.sm,
    color: '#64748b',
    marginBottom: DESIGN_SYSTEM.spacing[3],
    fontWeight: DESIGN_SYSTEM.typography.fontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  }}>
    {metric.label}
  </h3>
  <p style={{ 
    fontSize: '2.5rem', 
    fontWeight: '800',
    margin: 0,
    marginBottom: DESIGN_SYSTEM.spacing[3],
    background: 'linear-gradient(45deg, #1e293b, #475569)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    lineHeight: '1'
  }}>
    {metric.value}
  </p>
  {metric.trend && (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: `${DESIGN_SYSTEM.spacing[1]} ${DESIGN_SYSTEM.spacing[3]}`,
      borderRadius: '20px',
      background: metric.trend > 0 ? 
        'linear-gradient(45deg, #10b981, #34d399)' : 
        'linear-gradient(45deg, #ef4444, #f87171)',
      color: 'white',
      fontSize: DESIGN_SYSTEM.typography.fontSize.xs,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    }}>
      <span style={{ marginRight: '4px' }}>
        {metric.trend > 0 ? '↗' : '↘'}
      </span>
      {Math.abs(metric.trend)}%
    </div>
  )}
</div>
        
          ))}

                    {/* 🆕 NUEVA SECCIÓN: MÉTRICAS ODS */}
                    <ODSMetricsSection 
            odsMetrics={odsMetrics}
            loading={loading}
          />

          {/* 🆕 SECCIÓN: MÉTRICAS DE IMPACTO - Agrega esto después de ODSMetricsSection */}
<ImpactMetricsSection 
  impactMetrics={impactMetrics}
  loading={loading}
/>
          
        </div>
      )}


                        {/* 🆕 SECCIÓN DE GRÁFICOS ANIMADOS */}
                        {!loading && !chartsLoading && timeSeriesData && (
                <div style={{
                  background: 'linear-gradient(145deg, #ffffff, #f8fafc)',
                  borderRadius: '24px',
                  padding: DESIGN_SYSTEM.spacing[8],
                  boxShadow: `
                    0 20px 25px -5px rgba(0, 0, 0, 0.1),
                    0 10px 10px -5px rgba(0, 0, 0, 0.04),
                    inset 0 1px 0 rgba(255, 255, 255, 0.5)
                  `,
                  marginTop: DESIGN_SYSTEM.spacing[8],
                  border: '1px solid rgba(255, 255, 255, 0.8)',
                  position: 'relative',
                  overflow: 'hidden',
                  opacity: shouldAnimate ? 0 : 1,
                  transform: shouldAnimate ? 'translateY(30px)' : 'translateY(0)',
                  animation: shouldAnimate ? 'fadeInUp 0.8s ease-out 0.3s forwards' : 'none'
                }}>
          {/* Efecto de acento decorativo */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '6px',
            background: 'linear-gradient(90deg, #667eea, #764ba2, #f59e0b)',
            borderRadius: '24px 24px 0 0'
          }} />
                              <div style={{ 
            textAlign: 'center',
            marginBottom: DESIGN_SYSTEM.spacing[8]
          }}>
            <h3 style={{ 
              margin: 0, 
              marginBottom: DESIGN_SYSTEM.spacing[2],
              fontSize: '1.75rem',
              fontWeight: '800',
              color: '#1e293b' // Color base para el emoji
            }}>
              <span style={{ 
                background: 'linear-gradient(45deg, #1e293b, #475569)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                display: 'inline-block',
                marginRight: '8px'
              }}>
                Evolución de Actividad
              </span>
              📈
            </h3>
            <p style={{
              margin: 0,
              color: '#64748b',
              fontSize: DESIGN_SYSTEM.typography.fontSize.sm,
              fontWeight: '500'
            }}>
              Análisis detallado de los últimos 30 días
            </p>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
            gap: DESIGN_SYSTEM.spacing[8],
            marginBottom: DESIGN_SYSTEM.spacing[4]
          }}>
            {/* Gráfico de Posts */}
            <div>
              <LineChart
                data={{
                  labels: timeSeriesData.labels,
                  datasets: [
                    {
                      label: 'Posts Publicados',
                      data: timeSeriesData.posts,
                      borderColor: '#3b82f6', // AZUL
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      tension: 0.4,
                      fill: true
                    }
                  ]
                }}
                title="📝 Evolución de Posts"
                height={250}
                backgroundColor="#ffffff" // 🆕 CORREGIDO: Fondo blanco para el gráfico
                textColor="#ced4da" // 🆕 CORREGIDO: Color de texto gris oscuro
              />
            </div>

            {/* Gráfico de Likes */}
            <div>
              <LineChart
                data={{
                  labels: timeSeriesData.labels,
                  datasets: [
                    {
                      label: 'Likes Recibidos',
                      data: timeSeriesData.likes,
                      borderColor: '#10b981', // VERDE
                      backgroundColor: 'rgba(16, 185, 129, 0.1)',
                      tension: 0.4,
                      fill: true
                    }
                  ]
                }}
                title="❤️ Evolución de Likes"
                height={250}
                backgroundColor="#ffffff" // 🆕 CORREGIDO: Fondo blanco para el gráfico
                textColor="#ced4da" // 🆕 CORREGIDO: Color de texto gris oscuro
              />
            </div>

            {/* 🆕 NUEVO Gráfico de Comentarios */}
            <div>
              <LineChart
                data={{
                  labels: timeSeriesData.labels,
                  datasets: [
                    {
                      label: 'Comentarios Recibidos',
                      data: timeSeriesData.comments,
                      borderColor: '#f59e0b', // AMARILLO/ÁMBAR
                      backgroundColor: 'rgba(245, 158, 11, 0.1)',
                      tension: 0.4,
                      fill: true
                    }
                  ]
                }}
                title="💬 Evolución de Comentarios"
                height={250}
                backgroundColor="#ffffff" // 🆕 CORREGIDO: Fondo blanco para el gráfico
                textColor="#c1121f" // 🆕 CORREGIDO: Color de texto gris oscuro
              />
            </div>
          </div>
          
          <p style={{
            fontSize: DESIGN_SYSTEM.typography.fontSize.sm,
            color: '#ced4da',
            margin: 0,
            textAlign: 'center'
          }}>
            
          </p>
        </div>
      )}

<div style={{
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        borderRadius: '24px',
        padding: DESIGN_SYSTEM.spacing[8],
        boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1)',
        marginTop: DESIGN_SYSTEM.spacing[8],
        border: '1px solid rgba(255, 255, 255, 0.5)',
        position: 'relative',
        overflow: 'hidden',
        opacity: shouldAnimate ? 0 : 1,
        transform: shouldAnimate ? 'scale(0.95)' : 'scale(1)',
        animation: shouldAnimate ? 'scaleIn 0.6s ease-out 0.5s forwards' : 'none'
      }}>
        {/* Efecto de decoración */}
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '150px',
          height: '150px',
          background: 'linear-gradient(45deg, #667eea, #764ba2)',
          borderRadius: '50%',
          opacity: '0.1'
        }} />
        
        <h3 style={{ 
          margin: 0, 
          marginBottom: DESIGN_SYSTEM.spacing[6],
          fontSize: '1.5rem',
          fontWeight: '800',
          color: '#1e293b', // Color base para el emoji
          textAlign: 'center'
        }}>
          <span style={{ 
            background: 'linear-gradient(45deg, #1e293b, #475569)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            display: 'inline-block',
            marginRight: '8px'
          }}>
            Próximas Funciones
          </span>
          🚀
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: DESIGN_SYSTEM.spacing[4]
        }}>
          {[
            { icon: '📊', title: 'Análisis de Engagement', desc: 'Métricas detalladas por post' },
            { icon: '👥', title: 'Métricas de Seguidores', desc: 'Crecimiento y engagement' },
            { icon: '🏆', title: 'Comparativa Premium', desc: 'Benchmark con otros usuarios' },
            { icon: '📤', title: 'Exportación de Reportes', desc: 'Descarga en PDF/Excel' }
          ].map((feature, index) => (
            <div
              key={index}
              style={{
                background: 'rgba(255, 255, 255, 0.8)',
                borderRadius: '16px',
                padding: DESIGN_SYSTEM.spacing[5],
                textAlign: 'center',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.6)',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)';
              }}
            >
              <div style={{
                fontSize: '2rem',
                marginBottom: DESIGN_SYSTEM.spacing[3]
              }}>
                {feature.icon}
              </div>
              <h4 style={{
                margin: 0,
                marginBottom: DESIGN_SYSTEM.spacing[2],
                fontSize: DESIGN_SYSTEM.typography.fontSize.base,
                fontWeight: '700',
                color: '#1e293b'
              }}>
                {feature.title}
              </h4>
              <p style={{
                margin: 0,
                fontSize: DESIGN_SYSTEM.typography.fontSize.sm,
                color: '#64748b',
                lineHeight: '1.4'
              }}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};