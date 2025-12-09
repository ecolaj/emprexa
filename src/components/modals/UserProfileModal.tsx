import React, { useState, useEffect } from 'react';
import { UserProfileModalProps } from '../../types';
import { COLORS } from '../../utils/constants';
import { FriendshipButton } from '../common/FriendshipButton';
import { supabase } from '../../services/supabaseService';
import { ChatButton } from '../chat/ChatButton';
import { getPlanBadgeData, normalizePlanType } from '../../utils/permissionUtils';

// 🎨 SISTEMA DE DISEÑO MEJORADO (SOLO ESTILOS)
const MODERN_STYLES = {
  gradients: {
    primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    premium: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    modal: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.95) 100%)'
  },
  shadows: {
    soft: '0 20px 60px rgba(0,0,0,0.15)',
    medium: '0 8px 30px rgba(0,0,0,0.12)',
    card: '0 4px 20px rgba(0,0,0,0.08)'
  }
};

// Función para subir avatar (ORIGINAL - SIN CAMBIOS)
const uploadAvatar = async (file: File, userId: string): Promise<string> => {
  try {
    console.log('🔼 Subiendo avatar para usuario:', userId);
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/avatar-${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    console.log('✅ Avatar subido exitosamente:', publicUrl);
    return publicUrl;

  } catch (error: any) {
    console.error('❌ Error subiendo avatar:', error);
    throw new Error('No se pudo subir la imagen: ' + error.message);
  }
};

// Componente de formulario de edición (ORIGINAL - SOLO MEJORAS VISUALES)
const EditProfileFormContent = ({ userProfile, onClose, onProfileUpdate }: any) => {
  const [formData, setFormData] = useState({
    full_name: userProfile.full_name || '',
    username: userProfile.username || '',
    bio: userProfile.bio || '',
    avatar_url: userProfile.avatar_url || ''
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      console.log('🔄 Intentando actualizar perfil...');
      console.log('📝 Cambio de username:', userProfile.username, '→', formData.username);
      console.log('ID del usuario:', userProfile.id);
      console.log('Datos a actualizar:', formData);
  
      if (!formData.username.trim()) {
        throw new Error('El nombre de usuario es requerido');
      }
  
      const { data, error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name?.trim() || null,
          username: formData.username.trim(),
          bio: formData.bio?.trim() || null,
          avatar_url: formData.avatar_url?.trim() || null
        })
        .eq('id', userProfile.id)
        .select()
        .single();
  
      console.log('Respuesta de Supabase:', { data, error });
  
      if (error) {
        console.error('❌ Error de Supabase:', error);
        
        if (error.code === '23505') {
          throw new Error('El nombre de usuario ya está en uso');
        } else if (error.code === '42501') {
          throw new Error('No tienes permisos para editar este perfil');
        } else {
          throw new Error(`Error de base de datos: ${error.message}`);
        }
      }
  
      if (!data) {
        throw new Error('No se recibieron datos actualizados');
      }
  
      console.log('✅ Perfil actualizado correctamente:', data);

      const { data: updatedProfile, error: reloadError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userProfile.id)
        .single();

      if (!reloadError && updatedProfile) {
        console.log('🔄 Perfil recargado:', updatedProfile);
        onProfileUpdate(updatedProfile);
      } else {
        onProfileUpdate({ ...userProfile, ...formData });
      }

      onClose();

      setTimeout(() => {
        alert('✅ Perfil actualizado correctamente');
      }, 500);
      
    } catch (error: any) {
      console.error('❌ Error completo al actualizar perfil:', error);
      alert(`Error al actualizar el perfil: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="form-group">
        <label style={{ 
          display: 'block', 
          marginBottom: '8px', 
          fontWeight: '600',
          color: COLORS.primary 
        }}>Nombre completo:</label>
        <input
          type="text"
          value={formData.full_name}
          onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
          placeholder="Tu nombre completo"
          style={{
            width: '100%',
            padding: '12px',
            border: `2px solid #e2e8f0`,
            borderRadius: '12px',
            fontSize: '14px',
            transition: 'all 0.2s',
            outline: 'none'
          }}
          onFocus={(e) => e.target.style.borderColor = COLORS.primary}
          onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
        />
      </div>

      <div className="form-group">
        <label style={{ 
          display: 'block', 
          marginBottom: '8px', 
          fontWeight: '600',
          color: COLORS.primary 
        }}>Nombre de usuario:</label>
        <input
          type="text"
          value={formData.username}
          onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
          placeholder="tu_usuario"
          style={{
            width: '100%',
            padding: '12px',
            border: `2px solid #e2e8f0`,
            borderRadius: '12px',
            fontSize: '14px',
            transition: 'all 0.2s',
            outline: 'none'
          }}
          onFocus={(e) => e.target.style.borderColor = COLORS.primary}
          onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
        />
      </div>

      <div className="form-group">
        <label style={{ 
          display: 'block', 
          marginBottom: '8px', 
          fontWeight: '600',
          color: COLORS.primary 
        }}>Biografía:</label>
        <textarea
          value={formData.bio}
          onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
          placeholder="Cuéntanos sobre ti..."
          rows={4}
          style={{
            width: '100%',
            padding: '12px',
            border: `2px solid #e2e8f0`,
            borderRadius: '12px',
            fontSize: '14px',
            fontFamily: 'inherit',
            resize: 'vertical',
            transition: 'all 0.2s',
            outline: 'none',
            minHeight: '100px'
          }}
          onFocus={(e) => e.target.style.borderColor = COLORS.primary}
          onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
        />
      </div>

      <div className="form-group">
        <label style={{ 
          display: 'block', 
          marginBottom: '8px', 
          fontWeight: '600',
          color: COLORS.primary 
        }}>Avatar:</label>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
          <div style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            backgroundColor: formData.avatar_url ? 'transparent' : MODERN_STYLES.gradients.primary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '32px',
            overflow: 'hidden',
            border: '4px solid white',
            boxShadow: MODERN_STYLES.shadows.card,
            flexShrink: 0
          }}>
            {formData.avatar_url ? (
              <img 
                src={formData.avatar_url} 
                alt="Avatar preview" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              formData.username?.charAt(0).toUpperCase() || 'U'
            )}
          </div>

          <div style={{ flex: 1 }}>
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  if (file.size > 5 * 1024 * 1024) {
                    alert('La imagen debe ser menor a 5MB');
                    return;
                  }

                  if (!file.type.startsWith('image/')) {
                    alert('Por favor selecciona una imagen válida');
                    return;
                  }

                  try {
                    setSaving(true);
                    const avatarUrl = await uploadAvatar(file, userProfile.id);
                    setFormData(prev => ({ ...prev, avatar_url: avatarUrl }));
                  } catch (error: any) {
                    alert('Error al subir la imagen: ' + error.message);
                  } finally {
                    setSaving(false);
                  }
                }
              }}
              style={{ display: 'none' }}
              id="avatar-upload"
            />
            <label
              htmlFor="avatar-upload"
              style={{
                display: 'inline-block',
                background: MODERN_STYLES.gradients.primary,
                color: 'white',
                padding: '12px 20px',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                textAlign: 'center',
                marginBottom: '10px',
                transition: 'all 0.2s',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
              }}
            >
              📸 Subir Imagen
            </label>
            <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '10px' }}>
              Formatos: JPG, PNG, GIF (Máx. 5MB)
            </div>
            
            {formData.avatar_url && (
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, avatar_url: '' }))}
                style={{
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#dc2626'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#ef4444'}
              >
                🗑️ Remover Avatar
              </button>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
        <button 
          onClick={onClose} 
          style={{ 
            flex: 1, 
            padding: '14px', 
            background: '#f1f5f9', 
            color: '#64748b', 
            border: 'none', 
            borderRadius: '12px',
            fontWeight: '600',
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#e2e8f0'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#f1f5f9'}
        >
          Cancelar
        </button>
        <button 
          onClick={handleSave} 
          disabled={saving}
          style={{ 
            flex: 1, 
            padding: '14px', 
            background: saving ? '#94a3b8' : MODERN_STYLES.gradients.primary, 
            color: 'white', 
            border: 'none', 
            borderRadius: '12px',
            fontWeight: '600',
            fontSize: '14px',
            cursor: saving ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            boxShadow: saving ? 'none' : '0 4px 15px rgba(102, 126, 234, 0.3)'
          }}
          onMouseEnter={(e) => {
            if (!saving) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            if (!saving) {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
            }
          }}
        >
          {saving ? '⏳ Guardando...' : '💾 Guardar Cambios'}
        </button>
      </div>
    </div>
  );
};

export const UserProfileModal: React.FC<UserProfileModalProps> = (props) => {
  const { isOpen, onClose, userId, currentUserId, onProfileUpdate } = props;
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Cargar datos del perfil (ORIGINAL - SIN CAMBIOS FUNCIONALES)
  useEffect(() => {
    if (!isOpen || !userId) return;

    const loadUserProfile = async () => {
      setLoading(true);
      try {
        let userUUID = userId;
        
        if (!userId.includes('-')) {
          console.log('🔍 Buscando UUID para username:', userId);
          
          const { data: allProfiles, error: profilesError } = await supabase
            .from('profiles')
            .select('id, username')
            .order('created_at', { ascending: false });

          if (profilesError) {
            console.error('Error obteniendo perfiles:', profilesError);
            throw new Error('Error al cargar usuarios');
          }

          const userProfile = allProfiles.find(profile => 
            profile.username.toLowerCase() === userId.toLowerCase()
          );

          if (!userProfile) {
            console.error('Usuario no encontrado:', userId);
            throw new Error('Usuario no encontrado');
          }
          
          userUUID = userProfile.id;
          console.log('✅ UUID encontrado:', userUUID, 'para username:', userId);
        }

        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userUUID)
          .single();

        if (error) throw error;
        setUserProfile(profileData);

        const subscription = supabase
          .channel('profile-changes')
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public', 
              table: 'profiles',
              filter: `id=eq.${userUUID}`
            },
            (payload) => {
              console.log('🔄 Cambio en tiempo real del perfil:', payload.new);
              setUserProfile(payload.new);
            }
          )
          .subscribe();

        return () => {
          subscription.unsubscribe();
        };

      } catch (error) {
        console.error('Error cargando perfil:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [isOpen, userId, currentUserId]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        background: MODERN_STYLES.gradients.modal,
        borderRadius: '24px',
        padding: '30px',
        maxWidth: '500px',
        width: '100%',
        boxShadow: MODERN_STYLES.shadows.soft,
        border: '1px solid rgba(255, 255, 255, 0.2)',
        position: 'relative',
        animation: 'modalAppear 0.3s ease-out'
      }}>
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255, 255, 255, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '20px',
            fontWeight: 'bold',
            color: COLORS.primary,
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'white';
            e.currentTarget.style.transform = 'rotate(90deg)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
            e.currentTarget.style.transform = 'rotate(0deg)';
          }}
        >
          ×
        </button>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ 
              fontSize: '48px', 
              marginBottom: '16px',
              animation: 'pulse 2s infinite'
            }}>🌙</div>
            <div style={{
              fontSize: '16px',
              fontWeight: '600',
              color: COLORS.primary
            }}>Cargando perfil...</div>
          </div>
        ) : userProfile ? (
          <div style={{ textAlign: 'center' }}>
            {/* Avatar Mejorado */}
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: userProfile.plan_type === 'premium' ? MODERN_STYLES.gradients.premium : MODERN_STYLES.gradients.primary,
              padding: '4px',
              margin: '0 auto 25px',
              boxShadow: MODERN_STYLES.shadows.medium
            }}>
              <div style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                backgroundColor: userProfile.avatar_url ? 'transparent' : 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: userProfile.plan_type === 'premium' ? '#f5576c' : COLORS.primary,
                fontWeight: 'bold',
                fontSize: '42px',
                overflow: 'hidden',
                border: '4px solid white'
              }}>
                {userProfile.avatar_url ? (
                  <img 
                    src={userProfile.avatar_url} 
                    alt="Avatar" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  userProfile.username?.charAt(0).toUpperCase() || 'U'
                )}
              </div>
            </div>

            {/* Información del Usuario */}
            <h2 style={{ 
              color: COLORS.primary, 
              margin: '0 0 8px 0',
              fontSize: '28px',
              fontWeight: '700',
              background: MODERN_STYLES.gradients.primary,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              {userProfile.full_name || 'Usuario'}
            </h2>
            <p style={{ 
              color: '#64748b', 
              margin: '0 0 25px 0', 
              fontSize: '16px',
              fontWeight: '500'
            }}>
              @{userProfile.username}
            </p>

            {/* Badge de Plan Dinámico */}
            {(() => {
              const badgeData = getPlanBadgeData(normalizePlanType(userProfile.plan_type || 'free'), 'md');
              
              if (!badgeData) return null;
              
              return (
                <div style={{
                  ...badgeData.style,
                  marginBottom: '25px',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
                }}>
                  <span style={{ fontSize: badgeData.iconSize }}>{badgeData.icon}</span>
                  {badgeData.text}
                </div>
              );
            })()}

            {/* Biografía Mejorada */}
            {userProfile.bio && (
              <div style={{
                background: 'rgba(248, 250, 252, 0.8)',
                padding: '20px',
                borderRadius: '16px',
                marginBottom: '25px',
                textAlign: 'left',
                borderLeft: `4px solid ${COLORS.primary}`,
                boxShadow: MODERN_STYLES.shadows.card
              }}>
                <p style={{ 
                  margin: 0, 
                  color: '#475569', 
                  lineHeight: '1.6',
                  fontSize: '15px',
                  fontStyle: 'italic'
                }}>
                  "{userProfile.bio}"
                </p>
              </div>
            )}

            {/* Información de Registro Mejorada */}
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.7)',
              padding: '20px',
              borderRadius: '16px',
              marginBottom: '25px',
              boxShadow: MODERN_STYLES.shadows.card
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-around',
                alignItems: 'center'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    fontSize: '13px', 
                    color: '#64748b',
                    fontWeight: '600',
                    marginBottom: '6px'
                  }}>Miembro desde</div>
                  <div style={{ 
                    fontSize: '15px', 
                    color: COLORS.primary,
                    fontWeight: '700'
                  }}>
                    {userProfile.created_at ? 
                      new Date(userProfile.created_at).toLocaleDateString('es-ES') : 
                      '--/--/----'
                    }
                  </div>
                </div>
              </div>
            </div>

            {/* Botones de Acción Mejorados */}
            <div style={{ 
              display: 'flex', 
              gap: '12px', 
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              {/* Botón de Chat (solo si no es el usuario actual) */}
              {currentUserId !== userProfile.id && (
                <ChatButton
                  currentUser={{ id: currentUserId } as User}
                  targetUser={{
                    id: userProfile.id,
                    username: userProfile.username,
                    avatar_url: userProfile.avatar_url,
                    plan_type: userProfile.plan_type
                  }}
                  onShowProfile={() => {}}
                />
              )}
              
              {/* Botón Editar Mejorado */}
              {currentUserId === userProfile.id && (
                <button
                  style={{
                    background: MODERN_STYLES.gradients.primary,
                    color: 'white',
                    border: 'none',
                    padding: '14px 28px',
                    borderRadius: '14px',
                    cursor: 'pointer',
                    fontWeight: '700',
                    fontSize: '15px',
                    transition: 'all 0.3s',
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onClick={() => setEditModalOpen(true)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
                  }}
                >
                  <span>✏️</span>
                  Editar Perfil
                </button>
              )}
            </div>
          </div>
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px',
            color: '#64748b'
          }}>
            <div style={{ 
              fontSize: '48px', 
              marginBottom: '16px'
            }}>😔</div>
            <div style={{
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: '8px'
            }}>No se pudo cargar el perfil</div>
            <div style={{
              fontSize: '14px',
              color: '#94a3b8'
            }}>Intenta nuevamente más tarde</div>
          </div>
        )}
      </div>
    
      {/* Modal de Edición de Perfil Mejorado */}
      {editModalOpen && userProfile && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1001,
          padding: '20px'
        }}>
          <div style={{
            background: MODERN_STYLES.gradients.modal,
            borderRadius: '24px',
            padding: '30px',
            maxWidth: '520px',
            width: '100%',
            boxShadow: MODERN_STYLES.shadows.soft,
            border: '1px solid rgba(255, 255, 255, 0.2)',
            position: 'relative'
          }}>
            <button 
              onClick={() => setEditModalOpen(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '20px',
                fontWeight: 'bold',
                color: COLORS.primary,
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.transform = 'rotate(90deg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
                e.currentTarget.style.transform = 'rotate(0deg)';
              }}
            >
              ×
            </button>
            
            <h2 style={{ 
              color: COLORS.primary,
              marginBottom: '25px',
              fontSize: '24px',
              fontWeight: '700',
              textAlign: 'center',
              background: MODERN_STYLES.gradients.primary,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Editar Perfil
            </h2>

            <EditProfileFormContent 
              userProfile={userProfile}
              onClose={() => setEditModalOpen(false)}
              onProfileUpdate={(updatedProfile) => {
                setUserProfile(updatedProfile);
                if (props.onProfileUpdate) {
                  props.onProfileUpdate(updatedProfile);
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// 🎨 Estilos CSS para animaciones
const styles = `
  @keyframes modalAppear {
    from {
      opacity: 0;
      transform: scale(0.9) translateY(20px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
`;

// Inyectar estilos
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}