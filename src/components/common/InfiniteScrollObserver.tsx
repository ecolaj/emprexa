import React, { useRef, useEffect, useCallback } from 'react';

interface InfiniteScrollObserverProps {
  onLoadMore: () => void;
  hasMore: boolean;
  loading: boolean;
}

export const InfiniteScrollObserver: React.FC<InfiniteScrollObserverProps> = ({
  onLoadMore,
  hasMore,
  loading
}) => {
  const observerRef = useRef<IntersectionObserver>();
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const [target] = entries;
    if (target.isIntersecting && hasMore && !loading) {
      console.log('🎯 Elemento visible - cargando más posts...');
      onLoadMore();
    }
  }, [hasMore, loading, onLoadMore]);

  useEffect(() => {
    const option = {
      root: null,
      rootMargin: '100px', // 🆕 NUEVO: Esperar hasta estar más cerca del final
      threshold: 0.01 // 🆕 NUEVO: Solo 1% visible (más estricto)
    };

    observerRef.current = new IntersectionObserver(handleObserver, option);
    
    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleObserver]);

  if (!hasMore) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '40px 20px',
        color: '#2ecc71', // 🆕 NUEVO: Color verde más visible
        fontStyle: 'italic',
        fontWeight: 'bold',
        fontSize: '16px',
        border: '2px solid #2ecc71',
        borderRadius: '10px',
        backgroundColor: 'rgba(46, 204, 113, 0.1)'
      }}>
        🎉 ¡Has visto todos los posts disponibles!
      </div>
    );
  }

  return (
    <div ref={loadMoreRef} style={{ 
      padding: '20px',
      textAlign: 'center'
    }}>
      {loading && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          color: '#666'
        }}>
          <div style={{
            width: '20px',
            height: '20px',
            border: '2px solid #f3f3f3',
            borderTop: '2px solid #3498db',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          Cargando más posts...
        </div>
      )}
    </div>
  );
};

// Agregar estilos CSS para la animación
const styles = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;

// Injectar estilos
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}

export default InfiniteScrollObserver;