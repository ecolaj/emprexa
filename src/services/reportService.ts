import { supabase } from '../supabaseClient';
import { Report } from '../types';

export const reportReasons = [
  {
    value: 'spam' as const,
    label: 'Spam',
    description: 'Contenido repetitivo o publicitario no deseado'
  },
  {
    value: 'harassment' as const,
    label: 'Acoso',
    description: 'Contenido que intimida o hostiga a otros usuarios'
  },
  {
    value: 'inappropriate' as const,
    label: 'Contenido inapropiado',
    description: 'Contenido ofensivo, violento o explícito'
  },
  {
    value: 'other' as const,
    label: 'Otro',
    description: 'Otra razón no listada'
  }
];

/**
 * Crear un nuevo reporte
 */
 export const createReport = async (
  contentId: string,
  contentType: 'post' | 'comment',
  reason: Report['reason'],
  description?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // 🆕 VERIFICAR QUE EL USUARIO ESTÉ AUTENTICADO
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' };
    }

    const { error } = await supabase
      .from('reports')
      .insert({
        content_id: contentId,
        content_type: contentType,
        reason: reason,
        description: description?.trim() || null,
        reporter_id: user.id // 🆕 CRÍTICO: incluir el ID del usuario que reporta
      });

    if (error) {
      console.error('Error creando reporte:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error inesperado creando reporte:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Obtener reportes para administradores
 */
export const getReports = async (status?: Report['status']): Promise<{ data: Report[]; error?: string }> => {
  try {
    let query = supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error obteniendo reportes:', error);
      return { data: [], error: error.message };
    }

    return { data: data || [] };
  } catch (error: any) {
    console.error('Error inesperado obteniendo reportes:', error);
    return { data: [], error: error.message };
  }
};

/**
 * Actualizar estado de un reporte
 */
export const updateReportStatus = async (
  reportId: string,
  status: Report['status']
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('reports')
      .update({ 
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', reportId);

    if (error) {
      console.error('Error actualizando reporte:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error inesperado actualizando reporte:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Verificar si el usuario actual es admin/moderador
 */
export const isUserAdmin = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    return profile?.role === 'admin' || profile?.role === 'moderator';
  } catch (error) {
    console.error('Error verificando rol de usuario:', error);
    return false;
  }
};

/**
 * Obtener cantidad de reportes pendientes
 */
 export const getPendingReportsCount = async (): Promise<number> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 0;

    // Verificar si es admin primero
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin' && profile?.role !== 'moderator') return 0;

    const { count, error } = await supabase
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    if (error) {
      console.error('Error contando reportes pendientes:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Error inesperado contando reportes:', error);
    return 0;
  }
};