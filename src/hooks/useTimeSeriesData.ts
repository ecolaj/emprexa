import { useEffect, useState } from 'react';
import { getTimeSeriesData, TimeSeriesData } from '../services/timeSeriesService';
import { DateRange } from '../types';

interface UseTimeSeriesDataProps {
  range: DateRange;
  userId?: string;
}

export const useTimeSeriesData = ({ range, userId }: UseTimeSeriesDataProps) => {
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTimeSeriesData = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const data = await getTimeSeriesData(userId, range);
        setTimeSeriesData(data);
        
        console.log('📈 Datos de series temporales cargados:', data);
        
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching time series data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTimeSeriesData();
  }, [range.since, range.until, userId]);

  return { timeSeriesData, loading, error };
};