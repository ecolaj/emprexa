import React, { useState } from 'react';
import { useNavigation } from '../contexts/NavigationContext';
import { PLANS, PlanType } from '../utils/plans';
import { getUserPlanInfo } from '../utils/permissionUtils';
import { COLORS } from '../utils/constants';
import { Button } from '../components/ui/Button/Button';
import { Card } from '../components/ui/Card/Card';

interface PricingPageProps {
  currentUserPlan?: PlanType;
}

export const PricingPage: React.FC<PricingPageProps> = ({ 
  currentUserPlan = 'free' 
}) => {
  const { navigateToMain } = useNavigation();
  const [billingPeriod, setBillingPeriod] = useState<'month' | 'year'>('month');
  const currentPlanInfo = getUserPlanInfo(currentUserPlan);

  // Calcular precio con descuento anual (20% off)
  const getPrice = (plan: PlanType) => {
    const basePrice = PLANS[plan].price;
    if (billingPeriod === 'year') {
      return Math.round(basePrice * 12 * 0.8 * 100) / 100; // 20% descuento anual
    }
    return basePrice;
  };

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '40px 20px',
      minHeight: '80vh'
    }}>
      {/* Encabezado */}
      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        <h1 style={{
          fontSize: '48px',
          fontWeight: '800',
          background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.accent})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: '20px'
        }}>
          Elige tu plan Emprexa
        </h1>
        <p style={{
          fontSize: '18px',
          color: COLORS.gray,
          maxWidth: '600px',
          margin: '0 auto 30px',
          lineHeight: '1.6'
        }}>
          Desde completamente gratuito hasta funciones avanzadas para profesionales.
          Todos incluyen acceso a la comunidad.
        </p>

        {/* Switch mensual/anual */}
        <div style={{
          display: 'inline-flex',
          background: COLORS.light,
          padding: '6px',
          borderRadius: '12px',
          marginBottom: '40px'
        }}>
          <button
            onClick={() => setBillingPeriod('month')}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              background: billingPeriod === 'month' ? COLORS.white : 'transparent',
              color: billingPeriod === 'month' ? COLORS.primary : COLORS.gray,
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: billingPeriod === 'month' ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.3s ease'
            }}
          >
            Mensual
          </button>
          <button
            onClick={() => setBillingPeriod('year')}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              background: billingPeriod === 'year' ? COLORS.white : 'transparent',
              color: billingPeriod === 'year' ? COLORS.primary : COLORS.gray,
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: billingPeriod === 'year' ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.3s ease'
            }}
          >
            Anual <span style={{
              color: COLORS.success,
              fontSize: '14px',
              marginLeft: '6px'
            }}>20% OFF</span>
          </button>
        </div>

        {/* Tu plan actual */}
        {currentUserPlan && currentUserPlan !== 'free' && (
          <div style={{
            background: `linear-gradient(135deg, ${COLORS.accent}20, ${COLORS.primary}10)`,
            border: `1px solid ${COLORS.accent}`,
            borderRadius: '16px',
            padding: '20px',
            maxWidth: '400px',
            margin: '0 auto 40px',
            display: 'flex',
            alignItems: 'center',
            gap: '15px'
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              background: COLORS.success,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              color: COLORS.white
            }}>
              ✓
            </div>
            <div>
              <div style={{
                fontSize: '14px',
                color: COLORS.gray,
                marginBottom: '4px'
              }}>
                PLAN ACTUAL
              </div>
              <div style={{
                fontSize: '20px',
                fontWeight: '600',
                color: COLORS.primary
              }}>
                {currentPlanInfo.name}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tarjetas de planes */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '30px',
        marginBottom: '50px'
      }}>
        {Object.values(PLANS).map((plan) => {
          const isCurrentPlan = plan.id === currentUserPlan;
          const price = getPrice(plan.id);
          const isPopular = plan.popular;

          return (
            <Card
              key={plan.id}
              variant={isPopular ? 'filled' : 'outlined'}
              padding="lg"
              style={{
                position: 'relative',
                border: isPopular ? `2px solid ${COLORS.success}` : undefined,
                transform: isPopular ? 'translateY(-10px)' : 'none',
                transition: 'transform 0.3s ease'
              }}
            >
              {/* Badge popular */}
              {isPopular && (
                <div style={{
                  position: 'absolute',
                  top: '-12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: COLORS.success,
                  color: COLORS.white,
                  padding: '6px 20px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  boxShadow: `0 4px 12px ${COLORS.success}40`
                }}>
                  MÁS POPULAR
                </div>
              )}

              {/* Badge plan actual */}
              {isCurrentPlan && (
                <div style={{
                  position: 'absolute',
                  top: '15px',
                  right: '15px',
                  background: COLORS.accent,
                  color: COLORS.primary,
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  TU PLAN
                </div>
              )}

              {/* Encabezado del plan */}
              <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                <h3 style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: COLORS.primary,
                  marginBottom: '8px'
                }}>
                  {plan.name}
                </h3>
                <p style={{
                  color: COLORS.gray,
                  fontSize: '14px',
                  marginBottom: '20px',
                  minHeight: '40px'
                }}>
                  {plan.description}
                </p>
                
                {/* Precio */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{
                    fontSize: '48px',
                    fontWeight: '800',
                    color: COLORS.primary,
                    lineHeight: '1'
                  }}>
                    ${price}
                    <span style={{
                      fontSize: '16px',
                      fontWeight: '400',
                      color: COLORS.gray
                    }}>
                      /{billingPeriod === 'month' ? 'mes' : 'año'}
                    </span>
                  </div>
                  {plan.id !== 'free' && billingPeriod === 'year' && (
                    <div style={{
                      fontSize: '14px',
                      color: COLORS.success,
                      marginTop: '5px'
                    }}>
                      Ahorras ${Math.round(plan.price * 12 * 0.2 * 100) / 100} vs mensual
                    </div>
                  )}
                </div>
              </div>

              {/* Características */}
              <div style={{ marginBottom: '30px' }}>
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: COLORS.primary,
                  marginBottom: '15px',
                  borderBottom: `1px solid ${COLORS.accent}30`,
                  paddingBottom: '8px'
                }}>
                  Incluye:
                </h4>
                <ul style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0
                }}>
                  {plan.features.map((feature, index) => (
                    <li key={index} style={{
                      padding: '10px 0',
                      borderBottom: `1px solid ${COLORS.accent}10`,
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px'
                    }}>
                      <span style={{
                        color: COLORS.success,
                        fontSize: '18px',
                        flexShrink: 0
                      }}>
                        ✓
                      </span>
                      <span style={{
                        color: COLORS.gray,
                        fontSize: '14px',
                        lineHeight: '1.4'
                      }}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Botón de acción */}
              <div>
                {isCurrentPlan ? (
                  <Button
                    variant="secondary"
                    size="lg"
                    style={{ width: '100%' }}
                    onClick={navigateToMain}
                  >
                    👑 Plan Actual
                  </Button>
                ) : plan.id === 'free' ? (
                  <Button
                    variant="secondary"
                    size="lg"
                    style={{ width: '100%' }}
                    onClick={navigateToMain}
                  >
                    Comenzar Gratis
                  </Button>
                ) : (
                  <Button
                    variant={isPopular ? 'primary' : 'secondary'}
                    size="lg"
                    style={{ 
                      width: '100%',
                      background: isPopular 
                        ? `linear-gradient(135deg, ${COLORS.success}, ${COLORS.primary})`
                        : undefined
                    }}
                    onClick={() => {
                      console.log(`🛒 Seleccionado plan: ${plan.id}`);
                      // TODO: Integrar con PayPal
                    }}
                  >
                    {plan.id === 'enterprise' ? 'Contactar' : 'Seleccionar Plan'}
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* FAQ */}
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '40px 0'
      }}>
        <h2 style={{
          textAlign: 'center',
          fontSize: '32px',
          fontWeight: '700',
          color: COLORS.primary,
          marginBottom: '40px'
        }}>
          Preguntas frecuentes
        </h2>
        
        <div style={{
          display: 'grid',
          gap: '20px'
        }}>
          {[
            {
              q: '¿Puedo cambiar de plan en cualquier momento?',
              a: 'Sí, puedes cambiar a un plan superior en cualquier momento. La diferencia se prorrateará.'
            },
            {
              q: '¿Hay contrato de permanencia?',
              a: 'No, todos los planes son mensuales/anuales sin permanencia. Cancela cuando quieras.'
            },
            {
              q: '¿Qué métodos de pago aceptan?',
              a: 'Aceptamos PayPal y todas las tarjetas de crédito/débito principales.'
            },
            {
              q: '¿Puedo probar antes de pagar?',
              a: '¡Claro! El plan Gratuito incluye todas las funciones básicas para que pruebes la plataforma.'
            }
          ].map((faq, index) => (
            <Card key={index} variant="filled" padding="md">
              <div style={{
                fontWeight: '600',
                color: COLORS.primary,
                marginBottom: '10px',
                fontSize: '16px'
              }}>
                {faq.q}
              </div>
              <div style={{
                color: COLORS.gray,
                fontSize: '14px',
                lineHeight: '1.6'
              }}>
                {faq.a}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};