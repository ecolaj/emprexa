import { useEffect, useState } from 'react';
import { 
  getPostsCount, 
  getCommentsCount, 
  getLikesCount,
  getUserPostsCount,
  getUserLikesCount, 
  getUserCommentsCount 
} from '../services/dashboardService';
import { DateRange, DashboardMetric } from '../types';
import { getODSMetrics, ODSMetric } from '../services/odsMetricsService';
// Agrega esta importación al inicio del archivo (después de la línea 4):
import { getUserImpactMetrics, ImpactMetric } from '../services/impactMetricsService';


interface UseDashboardProps {
  range: DateRange;
  userId?: string;
}

interface UseDashboardReturn {
  metrics: DashboardMetric[];
  odsMetrics: ODSMetric[];
  impactMetrics: ImpactMetric | null; // 🆕 NUEVO
  loading: boolean;
  error: string | null;
}

export const useDashboard = ({ range, userId }: UseDashboardProps): UseDashboardReturn => {
  const [metrics, setMetrics] = useState<DashboardMetric[]>([]);
  const [odsMetrics, setOdsMetrics] = useState<ODSMetric[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [impactMetrics, setImpactMetrics] = useState<ImpactMetric | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let postsCount, likesCount, commentsCount, odsMetricsData, impactMetricsData;

        if (userId) {
          // 🆕 MÉTRICAS ESPECÍFICAS DEL USUARIO
          console.log('📊 Cargando métricas para usuario:', userId);
          [postsCount, likesCount, commentsCount, odsMetricsData, impactMetricsData] = await Promise.all([
            getUserPostsCount(userId, range),
            getUserLikesCount(userId, range),
            getUserCommentsCount(userId, range),
            getODSMetrics(userId, range), // 🆕 NUEVO: Métricas ODS
            getUserImpactMetrics(userId, range) // 🆕 NUEVO: Métricas de impacto
          ]);
          setImpactMetrics(impactMetricsData); // 🆕 NUEVO: Guardar métricas de impacto
        } else {
          // 📈 MÉTRICAS GENERALES (como antes)
          console.log('📊 Cargando métricas generales');
          [postsCount, likesCount, commentsCount] = await Promise.all([
            getPostsCount(range),
            getLikesCount(range),
            getCommentsCount(range)
          ]);
        }
        
        setMetrics([
          {
            label: userId ? 'Mis posts publicados' : 'Posts publicados',
            value: postsCount,
            trend: 12
          },
          {
            label: userId ? 'Likes en mis posts' : 'Likes recibidos',
            value: likesCount,
            trend: 8
          },
          {
            label: userId ? 'Comentarios en mis posts' : 'Comentarios recibidos',
            value: commentsCount,
            trend: 15
          }
        ]);

        setOdsMetrics(odsMetricsData || []);
        
        console.log('📊 Dashboard - Métricas cargadas:', {
          userId,
          posts: postsCount,
          likes: likesCount,
          comments: commentsCount,
          odsMetrics: odsMetricsData?.length || 0
        });
        
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [range.since, range.until, userId]); // 🆕 userId como dependencia

  return { metrics, odsMetrics, impactMetrics, loading, error }; // 🆕 Agregar impactMetrics
};