import React from 'react';
import { Post } from '../../types';
import { COLORS } from '../../utils/constants';

// 🆕 NUEVA FUNCIÓN: Extraer ID de video de YouTube
const extractYouTubeId = (url: string): string | null => {
  if (!url) return null;
  
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?#]+)/,
    /youtube\.com\/watch\?.*v=([^&?#]+)/,
    /youtu\.be\/([^&?#]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
};


interface PostMediaProps {
  post: Post;
  setImageModal: React.Dispatch<React.SetStateAction<{
    isOpen: boolean;
    images: string[];
    currentIndex: number;
  }>>;
}

export const PostMedia: React.FC<PostMediaProps> = ({ post, setImageModal }) => {
  if (!post.images?.length && !post.videos?.length) return null;

  const openImageModal = (index: number) => {
    setImageModal({
      isOpen: true,
      images: post.images || [],
      currentIndex: index
    });
  };

  return (
    <div style={{ margin: '15px 0' }}>
      {/* Imágenes */}
      {post.images && post.images.length > 0 && (
        <div style={{ marginBottom: post.videos?.length ? '15px' : '0' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: post.images.length === 1 ? '1fr' : 'repeat(2, 1fr)',
            gap: '8px'
          }}>
            {post.images.map((image, index) => (
              <img 
                key={index}
                src={image} 
                alt={`Post image ${index + 1}`}
                style={{
                  width: '100%',
                  height: '200px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'transform 0.2s'
                }}
                onClick={() => openImageModal(index)}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'scale(1.02)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              />
            ))}
          </div>
        </div>
      )}
      
            {/* Videos - Con YouTube Embeds */}
            {post.videos && post.videos.map((video, index) => {
        const youtubeId = extractYouTubeId(video);
        
        return (
          <div key={index} style={{ marginBottom: '15px' }}>
            {youtubeId ? (
              // 🆕 NUEVO: YouTube Embed
              <div style={{
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}>
                <div style={{
                  position: 'relative',
                  width: '100%',
                  height: '0',
                  paddingBottom: '56.25%' // Relación 16:9
                }}>
                  <iframe
                    src={`https://www.youtube.com/embed/${youtubeId}`}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      border: 'none'
                    }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={`YouTube video ${index + 1}`}
                  />
                </div>
                </div>
            ) : (
              // 🆕 NUEVO: Link normal para videos no-YouTube
              <div style={{
                padding: '10px',
                backgroundColor: COLORS.light,
                borderRadius: '8px',
                border: `1px solid ${COLORS.accent}`
              }}>
                <div style={{ color: COLORS.primary, fontWeight: '600', marginBottom: '5px' }}>
                  🎥 Enlace de video {post.videos!.length > 1 ? index + 1 : ''}
                </div>
                <a 
                  href={video} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: COLORS.secondary, fontSize: '14px', wordBreak: 'break-all' }}
                >
                  {video}
                </a>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};