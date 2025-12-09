import React from 'react';
import { COLORS } from '../../utils/constants';

interface FormattedTextProps {
  text: string;
  onHashtagClick?: (hashtag: string) => void;
  onMentionClick?: (username: string) => void;
}

export const FormattedText: React.FC<FormattedTextProps> = ({ 
  text, 
  onHashtagClick, 
  onMentionClick 
}) => {
  const formatText = (content: string) => {
    // Regex para detectar hashtags y menciones
    const hashtagRegex = /(#\w+)/g;
    const mentionRegex = /(@\w+)/g;
    
    const parts = [];
    let lastIndex = 0;
    
    // Combinar ambos regex para encontrar todas las coincidencias
    const combinedRegex = /(#\w+)|(@\w+)/g;
    let match;
    
    while ((match = combinedRegex.exec(content)) !== null) {
      // Agregar texto normal antes de la coincidencia
      if (match.index > lastIndex) {
        parts.push(content.slice(lastIndex, match.index));
      }
      
      // Agregar la coincidencia con formato especial
      const matchedText = match[0];
      
      if (matchedText.startsWith('#')) {
        parts.push(
          <span
            key={match.index}
            onClick={() => onHashtagClick?.(matchedText.substring(1))}
            style={{
              color: COLORS.secondary,
              fontWeight: '600',
              cursor: 'pointer',
              backgroundColor: `${COLORS.secondary}15`,
              padding: '2px 6px',
              borderRadius: '4px',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = `${COLORS.secondary}30`;
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = `${COLORS.secondary}15`;
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {matchedText}
          </span>
        );
      } else if (matchedText.startsWith('@')) {
        parts.push(
          <span
            key={match.index}
            onClick={() => onMentionClick?.(matchedText.substring(1))}
            style={{
              color: COLORS.primary,
              fontWeight: '600',
              cursor: 'pointer',
              backgroundColor: `${COLORS.primary}15`,
              padding: '2px 6px',
              borderRadius: '4px',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = `${COLORS.primary}30`;
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = `${COLORS.primary}15`;
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {matchedText}
          </span>
        );
      }
      
      lastIndex = match.index + matchedText.length;
    }
    
    // Agregar texto restante después de la última coincidencia
    if (lastIndex < content?.length || 0) {
      parts.push(content.slice(lastIndex));
    }
    
    return parts.length > 0 ? parts : content;
  };

  return (
    <div style={{ 
      lineHeight: '1.6',
      wordBreak: 'break-word'
    }}>
      {formatText(text)}
    </div>
  );
};

export default FormattedText;