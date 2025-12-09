// ==============================================
// DEFINICIÓN DE PLANES Y PERMISOS
// ==============================================

export type PlanType = 'free' | 'basic' | 'pro' | 'enterprise';

export interface Plan {
  id: PlanType;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingPeriod: 'month' | 'year';
  features: string[];
  permissions: {
    canPost: boolean;
    canUseDashboard: boolean;
    hasSpecialBadge: boolean;
    maxPostsPerDay?: number;
    maxChatContacts?: number;
    canSchedulePosts?: boolean;
    canAnalyticsAdvanced?: boolean;
  };
  popular?: boolean;
  badge?: {
    show: boolean;                     // ¿Mostrar badge?
    text: string;                      // Texto del badge
    icon: string;                      // Emoji/icono
    gradient: string[];                // Colores para gradiente [color1, color2]
    textColor: string;                 // Color del texto
    borderColor?: string;              // Color del borde (opcional)
  };
}

export const PLANS: Record<PlanType, Plan> = {
  free: {
    id: 'free',
    name: 'Gratuito',
    description: 'Para comenzar en la comunidad',
    price: 0,
    currency: 'USD',
    billingPeriod: 'month',
    features: [
      'Comentar en posts',
      'Chatear con usuarios',
      'Ver contenido público',
      'Seguir hasta 10 usuarios',
      'Dashboard básico de actividad'
    ],
    permissions: {
      canPost: false,
      canUseDashboard: true,
      hasSpecialBadge: false,
      maxChatContacts: 10,
      canSchedulePosts: false,
      canAnalyticsAdvanced: false
    },
    badge: {
      show: false,
      text: 'Free',
      icon: '🌱',
      gradient: ['#e2e8f0', '#cbd5e1'],
      textColor: '#64748b'
    }
  },
  basic: {
    id: 'basic',
    name: 'Básico',
    description: 'Publica tus proyectos',
    price: 4.99,
    currency: 'USD',
    billingPeriod: 'month',
    features: [
      'Publicar hasta 3 posts por día',
      'Todas las funciones gratuitas',
      'Dashboard con métricas básicas',
      'Hasta 50 contactos en chat',
      'Soporte por email'
    ],
    permissions: {
      canPost: true,
      canUseDashboard: true,
      hasSpecialBadge: false,
      maxPostsPerDay: 3,
      maxChatContacts: 50,
      canSchedulePosts: false,
      canAnalyticsAdvanced: false
    },
    badge: {
      show: true,
      text: 'Básico',
      icon: '🚀',
      gradient: ['#60a5fa', '#3b82f6'],
      textColor: '#ffffff',
      borderColor: '#1d4ed8'
    }
  },
  pro: {
    id: 'pro',
    name: 'Profesional',
    description: 'Para creadores serios',
    price: 9.99,
    currency: 'USD',
    billingPeriod: 'month',
    features: [
      'Publicación ilimitada',
      'Badge especial junto a tu nombre',
      'Dashboard avanzado con analytics',
      'Programación de posts',
      'Hasta 200 contactos en chat',
      'Soporte prioritario'
    ],
    permissions: {
      canPost: true,
      canUseDashboard: true,
      hasSpecialBadge: true,
      maxPostsPerDay: null,
      maxChatContacts: 200,
      canSchedulePosts: true,
      canAnalyticsAdvanced: true
    },
    popular: true,
    badge: {
      show: true,
      text: 'Pro',
      icon: '⭐',
      gradient: ['#fbbf24', '#f59e0b'],
      textColor: '#78350f',
      borderColor: '#f59e0b'
    }
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Para organizaciones',
    price: 19.99,
    currency: 'USD',
    billingPeriod: 'month',
    features: [
      'Todas las funciones Pro',
      'API access',
      'Reportes personalizados',
      'Hasta 500 contactos en chat',
      'Soporte 24/7',
      'White-label options'
    ],
    permissions: {
      canPost: true,
      canUseDashboard: true,
      hasSpecialBadge: true,
      maxPostsPerDay: null,
      maxChatContacts: 500,
      canSchedulePosts: true,
      canAnalyticsAdvanced: true
    },
    badge: {
      show: true,
      text: 'Enterprise',
      icon: '👑',
      gradient: ['#a78bfa', '#8b5cf6'],
      textColor: '#ffffff',
      borderColor: '#7c3aed'
    }
  }
};

// Helper para obtener plan por ID
export const getPlanById = (planId: PlanType): Plan => {
  return PLANS[planId] || PLANS.free;
};

// Helper para verificar permiso
export const checkPermission = (userPlan: PlanType, permission: keyof Plan['permissions']): boolean => {
  const plan = PLANS[userPlan];
  return plan ? plan.permissions[permission] : false;
};