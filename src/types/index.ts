// ==============================================
// INTERFACES TYPESCRIPT
// ==============================================

export interface ODS {
  id: number;
  numero: number;
  nombre: string;
  color_principal: string;
}

export interface Author {
  username: string;
  plan_type: PlanType; // ← CAMBIA string por PlanType
  avatar_url?: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  ods: ODS[];
  like_count: number;
  comment_count: number;
  author: Author;
  images?: string[];
  videos?: string[];
  created_at?: string; 
  comments?: Comment[];
  user_id?: string;
  _loadingComments?: boolean;
  user_has_liked?: boolean; // 🆕 NUEVO: Indica si el usuario actual dio like
}

export interface Comment {
  id: string;
  post_id: string;
  content: string;
  author: Author;
  created_at: string;
  like_count: number;
  replies?: Comment[];
  showReply?: boolean;
  liked?: boolean;
  user_id?: string; 
}

export interface User {
  id: string;
  email: string;
  username: string;
  plan_type: PlanType; // ← CAMBIA string por PlanType
  avatar_url?: string;
  bio?: string;
  created_at?: string;
  full_name?: string;
}

// ==============================================
// TIPOS DE PLANES (Importar desde utils/plans)
// ==============================================
import { PlanType as PlanTypeImport } from '../utils/plans';
export type PlanType = PlanTypeImport;

// ==============================================
// INTERFACES PARA SISTEMA DE AMISTADES
// ==============================================

export interface Friendship {
  id: number;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  plan_type: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
}

export interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  currentUserId: string;
  onProfileUpdate?: (updatedProfile: any) => void;
}

export interface ImageModalState {
  isOpen: boolean;
  images: string[];
  currentIndex: number;
}

// ==============================================
// TIPOS PARA DASHBOARD PREMIUM
// ==============================================

export interface DateRange {
  since: string; // ISO 8601
  until: string; // ISO 8601
}

export interface DashboardMetric {
  label: string;
  value: number;
  trend?: number; // % vs período anterior (opcional)
}

// ==============================================
// INTERFACES PARA SISTEMA DE REPORTES
// ==============================================

export interface Report {
  id: string;
  reporter_id: string;
  content_id: string;
  content_type: 'post' | 'comment';
  reason: 'spam' | 'harassment' | 'inappropriate' | 'other';
  description?: string;
  status: 'pending' | 'reviewed' | 'resolved';
  created_at: string;
  updated_at: string;
}

export interface ReportReason {
  value: 'spam' | 'harassment' | 'inappropriate' | 'other';
  label: string;
  description: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  ods: ODS[];
  like_count: number;
  comment_count: number;
  author: Author;
  images?: string[];
  videos?: string[];
  created_at?: string;
  comments?: Comment[];
  user_id?: string;
  _loadingComments?: boolean;
  user_has_liked?: boolean;
  
  // 🆕 NUEVO: Campos de métricas de impacto
  budget_approx?: number;           // Presupuesto en USD
  beneficiaries_men?: number;       // Hombres beneficiados
  beneficiaries_women?: number;     // Mujeres beneficiadas
  partners?: string;               // Aliados/colaboradores
  project_status?: 'planning' | 'execution' | 'completed' | 'scaling';
}