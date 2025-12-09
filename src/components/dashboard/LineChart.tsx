import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { DESIGN_SYSTEM } from '../../utils/designSystem';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface LineChartProps {
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
      tension?: number;
    }[];
  };
  title: string;
  height?: number;
}

export const LineChart: React.FC<LineChartProps> = ({ data, title, height = 300 }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#1a1a1a', // NEGRO OSCURO - MEJOR CONTRASTE
          font: {
            size: 13,
            weight: 'bold' as const
          }
        }
      },
      title: {
        display: true,
        text: title,
        color: '#000000', // NEGRO PURO - MÁXIMO CONTRASTE
        font: {
          size: 18,
          weight: 'bold' as const
        },
        padding: {
          top: 10,
          bottom: 20
        }
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.03)', // AÚN MÁS SUAVE
          borderDash: [3, 4], // PUNTEADO MÁS CERRADO
        },
        ticks: {
          color: '#64748b', // GRIS MÁS SUAVE
          font: {
            size: 11,
            weight: '500' as const // MÁS DELGADO
          }
        },
        border: {
          display: false // OCULTAR LÍNEA DEL EJE
        }
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)', // GRIS MUY SUAVE
          borderDash: [4, 4], // LÍNEAS PUNTEADAS
        },
        ticks: {
          color: '#64748b', // GRIS MÁS SUAVE
          font: {
            size: 11,
            weight: '500' as const // MÁS DELGADO
          }
        },
        border: {
          display: false // OCULTAR LÍNEA DEL EJE
        },
        beginAtZero: true
      },
    },
    animation: {
      duration: 2000, // 2 segundos de animación
      easing: 'easeOutQuart' as const
    },
    elements: {
      line: {
        tension: 0.4 // Curvas suaves
      },
      point: {
        radius: 4,
        hoverRadius: 6
      }
    }
  };

  return (
    <div style={{ height: `${height}px`, width: '100%' }}>
      <Line data={data} options={options} />
    </div>
  );
};