import { supabase } from '../supabaseClient';
import { DateRange } from '../types';

export interface ODSMetric {
  ods_numero: number;
  ods_nombre: string;
  ods_color: string;
  post_count: number;
  total_engagement: number;
}

export const getODSMetrics = async (userId: string, { since, until }: DateRange): Promise<ODSMetric[]> => {
  try {
    console.log('📊 Obteniendo métricas ODS para usuario:', userId);
    
    const { data, error } = await supabase
      .rpc('ods_metrics_premium', { 
        user_uuid: userId, 
        since_date: since, 
        until_date: until 
      });

    if (error) {
      console.error('Error en ods_metrics_premium:', error);
      throw error;
    }

    console.log('📊 Métricas ODS obtenidas:', data);
    return data || [];

  } catch (error) {
    console.error('Error en getODSMetrics:', error);
    throw error;
  }
};