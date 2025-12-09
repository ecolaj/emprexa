import React from 'react';
import { Post } from '../../types';
import { COLORS } from '../../utils/constants';
import { PostCard } from './PostCard';
import { Card } from '../ui/Card/Card';

interface PublicPostViewProps {
  post: Post;
}

export const PublicPostView: React.FC<PublicPostViewProps> = ({ post }) => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: COLORS.light,
      padding: '20px' 
    }}>
      {/* Header de la app */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '30px',
        padding: '20px'
      }}>
        <h1 style={{ color: COLORS.primary, margin: 0 }}>🌱 TuApp</h1>
        <p style={{ color: COLORS.gray, margin: '10px 0 0 0' }}>
          Comunidad de Proyectos Sostenibles
        </p>
      </div>

      {/* Post */}
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <PostCard 
          post={post}
          currentUser={null} // 🆕 Usuario null = vista pública
          onShowProfile={() => window.location.href = '/register'}
          setImageModal={() => {}}
          onExpandComments={() => {}}
          onCommentAdded={() => {}}
          onPostLike={() => {}}
        />
      </div>

      {/* Call-to-action para registrarse */}
      <div style={{ 
        maxWidth: '800px', 
        margin: '40px auto 0',
        textAlign: 'center'
      }}>
        <Card variant="filled" padding="lg">
          <h3 style={{ color: COLORS.primary, marginBottom: '15px' }}>
            ¿Te gusta este proyecto?
          </h3>
          <p style={{ color: COLORS.gray, marginBottom: '25px' }}>
            Únete a nuestra comunidad para conectar con innovadores, 
            dar like a proyectos inspiradores y compartir tus propias ideas.
          </p>
          <button
            onClick={() => window.location.href = '/register'}
            style={{
              background: COLORS.primary,
              color: COLORS.white,
              border: 'none',
              padding: '12px 30px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600'
            }}
          >
            Crear Cuenta Gratis
          </button>
          <p style={{ 
            fontSize: '14px', 
            color: COLORS.gray, 
            marginTop: '15px' 
          }}>
            ¿Ya tienes cuenta? <a href="/login" style={{ color: COLORS.primary }}>Iniciar Sesión</a>
          </p>
        </Card>
      </div>
    </div>
  );
};