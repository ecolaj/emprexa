// ==============================================
// UTILIDADES DE PERMISOS POR PLAN
// ==============================================

import { PLANS, PlanType, checkPermission as checkPlanPermission } from './plans';

/**
 * Verifica si un usuario puede realizar una acción específica
 */
export const canUser = (userPlan: PlanType, action: keyof typeof PLANS.free.permissions): boolean => {
  return checkPlanPermission(userPlan, action);
};

/**
 * Obtiene información del plan del usuario
 */
export const getUserPlanInfo = (userPlan: PlanType) => {
  return PLANS[userPlan] || PLANS.free;
};

/**
 * Verifica si el usuario puede crear posts
 * (Mantiene compatibilidad con tu código existente que usa 'premium')
 */
export const canUserCreatePost = (userPlan: PlanType): boolean => {
  // Para mantener compatibilidad: si el plan es 'premium' (tu actual) o cualquier plan que permita postear
  if (userPlan === 'premium') return true;
  return canUser(userPlan, 'canPost');
};

/**
 * Verifica si el usuario puede usar dashboard avanzado
 */
export const canUserUseDashboard = (userPlan: PlanType): boolean => {
  if (userPlan === 'premium') return true;
  return canUser(userPlan, 'canUseDashboard');
};

/**
 * Verifica si el usuario tiene badge especial
 */
export const hasUserSpecialBadge = (userPlan: PlanType): boolean => {
  if (userPlan === 'premium') return true; // Asumimos que premium tiene badge
  return canUser(userPlan, 'hasSpecialBadge');
};

/**
 * Convierte 'premium' (tu plan actual) a 'basic' (nuestro nuevo sistema)
 * Para mantener compatibilidad durante la transición
 */
export const normalizePlanType = (planType: string): PlanType => {
  if (planType === 'premium') return 'basic';
  if (Object.keys(PLANS).includes(planType)) {
    return planType as PlanType;
  }
  return 'free';
};

/**
 * Obtiene el nombre del plan para mostrar en UI
 * Mantiene 'premium' para usuarios existentes
 */
export const getDisplayPlanType = (planType: string): string => {
  if (planType === 'premium') return 'premium';
  return normalizePlanType(planType);
};

/**
 * Obtiene información del plan para mostrar
 */
export const getDisplayPlanInfo = (planType: string) => {
  const normalized = normalizePlanType(planType);
  const planInfo = PLANS[normalized];
  
  // Si el usuario tiene 'premium' en DB, mostramos nombre custom
  if (planType === 'premium') {
    return {
      ...planInfo,
      name: 'Premium',
      description: 'Tu plan actual (equivalente a Básico en nuevo sistema)'
    };
  }
  
  return planInfo;
};

// ==============================================
// FUNCIONES PARA BADGES VISUALES DE PLANES
// ==============================================

/**
 * Obtiene la configuración del badge para un plan
 * Retorna null si el plan no debe mostrar badge
 */
export const getPlanBadgeConfig = (planType: PlanType) => {
  const plan = PLANS[planType];
  if (!plan.badge || !plan.badge.show) {
    return null;
  }
  return plan.badge;
};

/**
 * Retorna datos del badge para renderizar en componentes
 */
export const getPlanBadgeData = (planType: PlanType, size: 'sm' | 'md' | 'lg' = 'md') => {
  const badgeConfig = getPlanBadgeConfig(planType);
  if (!badgeConfig) return null;

  const sizeStyles = {
    sm: { padding: '2px 8px', fontSize: '10px', iconSize: '10px' },
    md: { padding: '4px 12px', fontSize: '12px', iconSize: '12px' },
    lg: { padding: '6px 16px', fontSize: '14px', iconSize: '14px' }
  };

  const style = sizeStyles[size];

  return {
    text: badgeConfig.text,
    icon: badgeConfig.icon,
    style: {
      background: `linear-gradient(135deg, ${badgeConfig.gradient[0]}, ${badgeConfig.gradient[1]})`,
      color: badgeConfig.textColor,
      border: badgeConfig.borderColor ? `1px solid ${badgeConfig.borderColor}` : 'none',
      padding: style.padding,
      borderRadius: '20px',
      fontSize: style.fontSize,
      fontWeight: 'bold',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      whiteSpace: 'nowrap',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      lineHeight: '1'
    },
    iconSize: style.iconSize
  };
};