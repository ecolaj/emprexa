import { supabase } from '../supabaseClient';
import { DateRange } from '../types';

export interface ImpactMetric {
  total_budget: number;
  total_beneficiaries: number;
  male_beneficiaries: number;
  female_beneficiaries: number;
  projects_with_partners: number;
  planning_count: number;
  execution_count: number;
  completed_count: number;
  scaling_count: number;
}

export const getUserImpactMetrics = async (
  userId: string, 
  { since, until }: DateRange
): Promise<ImpactMetric | null> => {
  try {
    console.log('📊 Obteniendo métricas de impacto para usuario:', userId);
    
    const { data, error } = await supabase
      .rpc('user_impact_metrics_premium', { 
        user_uuid: userId, 
        since_date: since, 
        until_date: until 
      });

    if (error) {
      console.error('Error en user_impact_metrics_premium:', error);
      throw error;
    }

    console.log('📊 Métricas de impacto obtenidas:', data);
    
    // La función RPC devuelve un array con un solo objeto
    return data && data.length > 0 ? data[0] : {
      total_budget: 0,
      total_beneficiaries: 0,
      male_beneficiaries: 0,
      female_beneficiaries: 0,
      projects_with_partners: 0,
      planning_count: 0,
      execution_count: 0,
      completed_count: 0,
      scaling_count: 0
    };

  } catch (error) {
    console.error('Error en getUserImpactMetrics:', error);
    throw error;
  }
};