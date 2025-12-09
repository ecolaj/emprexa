import React, { useState, useEffect } from 'react';
import { Post, User } from '../../types';
import { COLORS, ODS_EJEMPLO } from '../../utils/constants';
import { supabase, insertPost } from '../../services/supabaseService';
import { insertPost, insertPostODS } from '../../services/supabaseService';
import { uploadPostImages } from '../../services/imageService';
import { processPostHashtags } from '../../services/textProcessingService';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: (post) => void;
}

export const CreatePostModal: React.FC = ({
  isOpen,
  onClose,
  onPostCreated,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedODS, setSelectedODS] = useState<number[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [videoLinks, setVideoLinks] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [hoveredODS, setHoveredODS] = useState<number | null>(null);
    // 🆕 NUEVO: Estados para métricas de impacto
    const [budgetApprox, setBudgetApprox] = useState<string>('');
    const [beneficiariesMen, setBeneficiariesMen] = useState<string>('');
    const [beneficiariesWomen, setBeneficiariesWomen] = useState<string>('');
    const [partners, setPartners] = useState<string>('');
    const [projectStatus, setProjectStatus] = useState<'planning' | 'execution' | 'completed' | 'scaling'>('planning');

  /* ----------  limpieza SIEMPRE antes de cualquier return  ---------- */
  useEffect(() => {
    if (!isOpen) imagePreviews.forEach((url) => URL.revokeObjectURL(url));
  }, [isOpen]);

  /* ----------  usuario actual  ---------- */
  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        // 🆕 OBTENER PERFIL COMPLETO CON AVATAR Y USERNAME ACTUALIZADO
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, plan_type, avatar_url')
          .eq('id', session.user.id)
          .single();

        setCurrentUser({
          id: session.user.id,
          email: session.user.email!,
          username: profile?.username || session.user.email!.split('@')[0],
          plan_type: profile?.plan_type || 'free',
          avatar_url: profile?.avatar_url || '',
        });
      }
    })();
  }, [isOpen]);

  /* ----------  return después de TODOS los hooks  ---------- */
  if (!isOpen) return null;

  /* ----------  resto igual que antes  ---------- */
  const handleODSToggle = (odsId: number) => {
    setSelectedODS((prev) =>
      prev.includes(odsId)
        ? prev.filter((id) => id !== odsId)
        : [...prev, odsId]
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files);
      setImages((prev) => [...prev, ...newImages]);
      const newPreviews = newImages.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const extractYouTubeId = (url: string): string | null => {
    if (!url) return null;
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?#]+)/,
      /youtube\.com\/watch\?.*v=([^&?#]+)/,
      /youtu\.be\/([^&?#]+)/,
    ];
    for (const p of patterns) {
      const m = url.match(p);
      if (m && m[1]) return m[1];
    }
    return null;
  };

  const addVideoLink = () => setVideoLinks((prev) => [...prev, '']);
  const updateVideoLink = (index: number, value: string) =>
    setVideoLinks((prev) => prev.map((v, i) => (i === index ? value : v)));
  const removeVideoLink = (index: number) =>
    setVideoLinks((prev) => prev.filter((_, i) => i !== index));

    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError('');
  
      try {
        if (!title.trim() || !content.trim())
          throw new Error('Título y contenido obligatorios');
        if (!currentUser) throw new Error('Debes iniciar sesión');
  
        // 1. Subir imágenes...
        const uploadedUrls = await uploadPostImages(imagePreviews, currentUser.id);
  
      // 2. insertamos post con URLs reales Y métricas de impacto
      const dbPost = await insertPost({
        title,
        content_text: content,
        image_urls: uploadedUrls, // ✅ URLs persistentes
        video_url: videoLinks.filter((v) => v).join(','),
        is_public: true,
        ods: selectedODS, // 🆕 IMPORTANTE: Este campo ya existía pero asegúrate que esté
        // 🆕 NUEVO: Campos de métricas de impacto (solo si usuario es de pago)
        ...(currentUser.plan_type !== 'free' && {
          budget_approx: budgetApprox ? parseFloat(budgetApprox) : null,
          beneficiaries_men: beneficiariesMen ? parseInt(beneficiariesMen) : null,
          beneficiaries_women: beneficiariesWomen ? parseInt(beneficiariesWomen) : null,
          partners: partners || null,
          project_status: projectStatus
        })
      });

      // 3. Guardar hashtags
      await processPostHashtags(dbPost.id, content);

      // 4. insertamos ODS
      if (selectedODS.length)
        await insertPostODS(dbPost.id, selectedODS);

      const newPost: Post = {
        id: dbPost.id, // UUID real devuelto por Supabase
        title: dbPost.title,
        content: dbPost.content_text,
        ods: ODS_EJEMPLO.filter((o) => selectedODS.includes(o.id)),
        like_count: dbPost.like_count ?? 0,
        comment_count: dbPost.comment_count ?? 0,
        author: {
          username: currentUser.username || currentUser.email.split('@')[0],
          plan_type: currentUser.plan_type || 'free',
          avatar_url: currentUser.avatar_url || '', // 🆕 USAR AVATAR ACTUALIZADO
        },
        
        // Usar las URLs definitivas que devolvió la DB si existen,
        // fallback a imagePreviews por seguridad.
        images: dbPost.image_urls ?? imagePreviews,
        // Si la DB devolvió video_url, usarlo; si no, usar lo que el usuario ingresó.
        videos: dbPost.video_url ? [dbPost.video_url] : videoLinks.filter((v) => v),
        created_at: dbPost.created_at,
        user_id: dbPost.user_id,


                // 🆕 NUEVO: Añadir métricas de impacto al objeto Post
                budget_approx: dbPost.budget_approx,
                beneficiaries_men: dbPost.beneficiaries_men,
                beneficiaries_women: dbPost.beneficiaries_women,
                partners: dbPost.partners,
                project_status: dbPost.project_status
      };

      // Notificar a App que el post fue creado (App solo actualiza su estado local)
      onPostCreated(newPost);

      onClose();

      // reset
      setTitle('');
      setContent('');
      setSelectedODS([]);
      setImages([]);
      setImagePreviews([]);
      setVideoLinks(['']);
            // 🆕 NUEVO: Resetear métricas de impacto
            setBudgetApprox('');
            setBeneficiariesMen('');
            setBeneficiariesWomen('');
            setPartners('');
            setProjectStatus('planning');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="modal-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        padding: '20px',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        className="modal-content"
        style={{
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          padding: '32px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          border: `1px solid ${COLORS.accent}20`,
          position: 'relative',
          animation: 'modalAppear 0.3s ease-out',
        }}
      >
        <button 
          className="close-button" 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(0, 0, 0, 0.1)',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            fontSize: '20px',
            fontWeight: 'bold',
            color: COLORS.gray,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            zIndex: 10,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = COLORS.danger;
            e.currentTarget.style.color = '#ffffff';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.1)';
            e.currentTarget.style.color = COLORS.gray;
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          ×
        </button>
        
        <h2 style={{ 
          color: COLORS.primary, 
          marginBottom: '28px',
          fontSize: '28px',
          fontWeight: '700',
          textAlign: 'center',
          background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.accent})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          Crear Nuevo Post
        </h2>
        
        {error && (
          <div style={{
            backgroundColor: `${COLORS.danger}15`,
            border: `1px solid ${COLORS.danger}30`,
            color: COLORS.danger,
            padding: '16px',
            borderRadius: '12px',
            marginBottom: '24px',
            fontSize: '14px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <span style={{ fontSize: '18px' }}>⚠️</span>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {/* título */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              color: COLORS.primary,
              fontSize: '14px',
            }}>
              Título del post:
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Escribe un título atractivo..."
              required
              maxLength={100}
              style={{
                width: '100%',
                padding: '16px',
                border: `2px solid ${COLORS.accent}30`,
                borderRadius: '12px',
                fontSize: '16px',
                fontFamily: 'inherit',
                backgroundColor: '#fafafa',
                transition: 'all 0.2s ease',
                outline: 'none',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = COLORS.primary;
                e.target.style.backgroundColor = '#ffffff';
                e.target.style.boxShadow = `0 0 0 3px ${COLORS.primary}20`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = `${COLORS.accent}30`;
                e.target.style.backgroundColor = '#fafafa';
                e.target.style.boxShadow = 'none';
              }}
            />
            <div style={{
              fontSize: '12px',
              color: COLORS.gray,
              marginTop: '4px',
              textAlign: 'right',
            }}>
              {title.length}/100 caracteres
            </div>
          </div>

          {/* contenido */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              color: COLORS.primary,
              fontSize: '14px',
            }}>
              Contenido:
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Comparte tu historia, proyecto o idea..."
              required
              rows={5}
              style={{
                width: '100%',
                padding: '16px',
                border: `2px solid ${COLORS.accent}30`,
                borderRadius: '12px',
                fontSize: '16px',
                fontFamily: 'inherit',
                resize: 'vertical',
                backgroundColor: '#fafafa',
                transition: 'all 0.2s ease',
                outline: 'none',
                lineHeight: '1.5',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = COLORS.primary;
                e.target.style.backgroundColor = '#ffffff';
                e.target.style.boxShadow = `0 0 0 3px ${COLORS.primary}20`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = `${COLORS.accent}30`;
                e.target.style.backgroundColor = '#fafafa';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* ODS */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              color: COLORS.primary,
              fontSize: '14px',
            }}>
              ODS relacionados (haz click para seleccionar):
            </label>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '10px',
                marginTop: '12px',
                padding: '20px',
                border: `2px dashed ${COLORS.accent}30`,
                borderRadius: '16px',
                backgroundColor: `${COLORS.light}08`,
                minHeight: '100px',
                transition: 'all 0.2s ease',
              }}
            >
              {ODS_EJEMPLO.map((ods) => (
                <div key={ods.id} style={{ position: 'relative', display: 'inline-block' }}>
                  <div
                    onClick={() => handleODSToggle(ods.id)}
                    onMouseEnter={() => setHoveredODS(ods.id)}
                    onMouseLeave={() => setHoveredODS(null)}
                    style={{
                      cursor: 'pointer',
                      padding: '10px 16px',
                      borderRadius: '25px',
                      backgroundColor: selectedODS.includes(ods.id)
                        ? ods.color_principal
                        : '#f0f0f0',
                      color: selectedODS.includes(ods.id)
                        ? '#ffffff'
                        : '#666666',
                      border: `2px solid ${
                        selectedODS.includes(ods.id)
                          ? ods.color_principal
                          : '#e0e0e0'
                      }`,
                      fontSize: '13px',
                      fontWeight: '700',
                      transition: 'all 0.3s ease',
                      transform: selectedODS.includes(ods.id)
                        ? 'scale(1.05)'
                        : 'scale(1)',
                      boxShadow: selectedODS.includes(ods.id)
                        ? `0 4px 12px ${ods.color_principal}40`
                        : '0 2px 4px rgba(0,0,0,0.1)',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <span style={{ position: 'relative', zIndex: 2 }}>
                      ODS {ods.numero}
                    </span>
                    {selectedODS.includes(ods.id) && (
                      <span style={{
                        marginLeft: '6px',
                        fontSize: '12px',
                      }}>
                        ✓
                      </span>
                    )}
                  </div>
                  
                  {/* Tooltip */}
                  {hoveredODS === ods.id && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '100%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: `linear-gradient(135deg, ${ods.color_principal}, ${ods.color_secundario || ods.color_principal})`,
                        color: '#fff',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        fontSize: '12px',
                        fontWeight: '600',
                        whiteSpace: 'nowrap',
                        zIndex: 1000,
                        marginBottom: '10px',
                        pointerEvents: 'none',
                        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)',
                        border: '1px solid rgba(255,255,255,0.2)',
                      }}
                    >
                      {ods.nombre_completo || ods.nombre}
                      <div
                        style={{
                          position: 'absolute',
                          top: '100%',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: 0,
                          height: 0,
                          borderLeft: '8px solid transparent',
                          borderRight: '8px solid transparent',
                          borderTop: `8px solid ${ods.color_principal}`,
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div
              style={{
                fontSize: '13px',
                color: selectedODS.length > 0 ? COLORS.primary : COLORS.gray,
                marginTop: '8px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>🎯</span>
              {selectedODS.length} ODS seleccionado{selectedODS.length !== 1 ? 's' : ''}
            </div>
          </div>
          {/* ============================================== */}
          {/* 🆕 SECCIÓN: MÉTRICAS DE IMPACTO (Solo para planes de pago) */}
          {/* ============================================== */}
          {currentUser && currentUser.plan_type !== 'free' && (
            <div style={{ marginBottom: '24px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '16px',
                paddingBottom: '12px',
                borderBottom: `2px solid ${COLORS.success}30`
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: COLORS.success,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}>
                  📊
                </div>
                <div>
                  <h3 style={{
                    margin: 0,
                    color: COLORS.primary,
                    fontSize: '18px',
                    fontWeight: '600'
                  }}>
                    Métricas de Impacto
                  </h3>
                  <p style={{
                    margin: '4px 0 0 0',
                    color: COLORS.gray,
                    fontSize: '13px'
                  }}>
                    Información adicional para tu proyecto
                  </p>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                marginBottom: '16px'
              }}>
                {/* Presupuesto */}
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '600',
                    color: COLORS.primary,
                    fontSize: '14px',
                  }}>
                    Presupuesto aproximado (USD):
                  </label>
                  <input
                    type="number"
                    value={budgetApprox}
                    onChange={(e) => setBudgetApprox(e.target.value)}
                    placeholder="Ej: 5000"
                    min="0"
                    step="0.01"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: `2px solid ${COLORS.accent}30`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      backgroundColor: '#fafafa',
                      transition: 'all 0.2s ease',
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = COLORS.success;
                      e.target.style.backgroundColor = '#ffffff';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = `${COLORS.accent}30`;
                      e.target.style.backgroundColor = '#fafafa';
                    }}
                  />
                </div>

                {/* Estado del proyecto */}
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '600',
                    color: COLORS.primary,
                    fontSize: '14px',
                  }}>
                    Estado del proyecto:
                  </label>
                  <select
                    value={projectStatus}
                    onChange={(e) => setProjectStatus(e.target.value as any)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: `2px solid ${COLORS.accent}30`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      backgroundColor: '#fafafa',
                      color: COLORS.primary,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = COLORS.success;
                      e.target.style.backgroundColor = '#ffffff';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = `${COLORS.accent}30`;
                      e.target.style.backgroundColor = '#fafafa';
                    }}
                  >
                    <option value="planning">📋 Planificación</option>
                    <option value="execution">🚀 En ejecución</option>
                    <option value="completed">✅ Completado</option>
                    <option value="scaling">📈 Escalando</option>
                  </select>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                marginBottom: '16px'
              }}>
                {/* Beneficiarios Hombres */}
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '600',
                    color: COLORS.primary,
                    fontSize: '14px',
                  }}>
                    👨 Hombres beneficiados:
                  </label>
                  <input
                    type="number"
                    value={beneficiariesMen}
                    onChange={(e) => setBeneficiariesMen(e.target.value)}
                    placeholder="Ej: 50"
                    min="0"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: `2px solid ${COLORS.accent}30`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      backgroundColor: '#fafafa',
                      transition: 'all 0.2s ease',
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3b82f6';
                      e.target.style.backgroundColor = '#ffffff';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = `${COLORS.accent}30`;
                      e.target.style.backgroundColor = '#fafafa';
                    }}
                  />
                </div>

                {/* Beneficiarios Mujeres */}
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '600',
                    color: COLORS.primary,
                    fontSize: '14px',
                  }}>
                    👩 Mujeres beneficiadas:
                  </label>
                  <input
                    type="number"
                    value={beneficiariesWomen}
                    onChange={(e) => setBeneficiariesWomen(e.target.value)}
                    placeholder="Ej: 50"
                    min="0"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: `2px solid ${COLORS.accent}30`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      backgroundColor: '#fafafa',
                      transition: 'all 0.2s ease',
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#ec4899';
                      e.target.style.backgroundColor = '#ffffff';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = `${COLORS.accent}30`;
                      e.target.style.backgroundColor = '#fafafa';
                    }}
                  />
                </div>
              </div>

              {/* Aliados/Colaboradores */}
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: COLORS.primary,
                  fontSize: '14px',
                }}>
                  🤝 Aliados / Colaboradores:
                </label>
                <input
                  type="text"
                  value={partners}
                  onChange={(e) => setPartners(e.target.value)}
                  placeholder="Ej: Municipalidad de X, ONG Y, Empresa Z"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `2px solid ${COLORS.accent}30`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    backgroundColor: '#fafafa',
                    transition: 'all 0.2s ease',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = COLORS.success;
                    e.target.style.backgroundColor = '#ffffff';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = `${COLORS.accent}30`;
                    e.target.style.backgroundColor = '#fafafa';
                  }}
                />
                <div style={{
                  fontSize: '12px',
                  color: COLORS.gray,
                  marginTop: '6px'
                }}>
                  Separa con comas si son varios
                </div>
              </div>

              {/* Resumen de métricas */}
              {(budgetApprox || beneficiariesMen || beneficiariesWomen || partners) && (
                <div style={{
                  marginTop: '16px',
                  padding: '16px',
                  backgroundColor: `${COLORS.success}10`,
                  border: `1px solid ${COLORS.success}30`,
                  borderRadius: '12px',
                  fontSize: '13px',
                  color: COLORS.primary
                }}>
                  <div style={{
                    fontWeight: '600',
                    marginBottom: '8px',
                    color: COLORS.success
                  }}>
                    📋 Resumen de métricas:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                    {budgetApprox && (
                      <span style={{
                        background: COLORS.light,
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontWeight: '600'
                      }}>
                        💰 ${parseFloat(budgetApprox).toLocaleString()}
                      </span>
                    )}
                    {(beneficiariesMen || beneficiariesWomen) && (
                      <span style={{
                        background: COLORS.light,
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontWeight: '600'
                      }}>
                        👥 {(parseInt(beneficiariesMen) || 0) + (parseInt(beneficiariesWomen) || 0)} personas
                      </span>
                    )}
                    {partners && (
                      <span style={{
                        background: COLORS.light,
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontWeight: '600',
                        maxWidth: '200px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        🤝 {partners.split(',')[0].trim()}
                        {partners.split(',').length > 1 && ` +${partners.split(',').length - 1} más`}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}


          {/* imágenes */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              color: COLORS.primary,
              fontSize: '14px',
            }}>
              Imágenes:
            </label>
            <div
              style={{
                border: `2px dashed ${COLORS.accent}50`,
                borderRadius: '16px',
                padding: '30px 20px',
                textAlign: 'center',
                marginBottom: '12px',
                cursor: 'pointer',
                backgroundColor: `${COLORS.light}05`,
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
              }}
              onClick={() => document.getElementById('image-upload')?.click()}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = COLORS.primary;
                e.currentTarget.style.backgroundColor = `${COLORS.primary}08`;
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = `${COLORS.accent}50`;
                e.currentTarget.style.backgroundColor = `${COLORS.light}05`;
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <input
                id="image-upload"
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
              <div style={{ 
                color: COLORS.primary, 
                fontSize: '48px',
                marginBottom: '12px',
              }}>
                📸
              </div>
              <div style={{ 
                color: COLORS.primary, 
                fontSize: '16px',
                fontWeight: '600',
                marginBottom: '6px',
              }}>
                Haz clic o arrastra imágenes aquí
              </div>
              <div style={{ 
                color: COLORS.gray, 
                fontSize: '13px',
              }}>
                PNG, JPG, WEBP (máx. 10MB por imagen)
              </div>
            </div>

            {imagePreviews.length > 0 && (
              <div style={{ marginTop: '20px' }}>
                <div
                  style={{
                    fontSize: '14px',
                    color: COLORS.primary,
                    marginBottom: '12px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <span>🖼️</span>
                  Vista previa ({imagePreviews.length} imagen{imagePreviews.length !== 1 ? 'es' : ''})
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                    gap: '12px',
                  }}
                >
                  {imagePreviews.map((preview, index) => (
                    <div key={index} style={{ 
                      position: 'relative',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      transition: 'transform 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                    >
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        style={{
                          width: '100%',
                          height: '120px',
                          objectFit: 'cover',
                          display: 'block',
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        style={{
                          position: 'absolute',
                          top: '-6px',
                          right: '-6px',
                          background: COLORS.danger,
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '50%',
                          width: '28px',
                          height: '28px',
                          cursor: 'pointer',
                          fontSize: '16px',
                          fontWeight: 'bold',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.2)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* videos */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              color: COLORS.primary,
              fontSize: '14px',
            }}>
              Enlaces de video (YouTube):
            </label>
            {videoLinks.map((link, index) => {
              const youtubeId = extractYouTubeId(link);
              return (
                <div key={index} style={{ 
                  marginBottom: '20px',
                  padding: '20px',
                  borderRadius: '16px',
                  backgroundColor: youtubeId ? `${COLORS.success}08` : '#fafafa',
                  border: `2px solid ${youtubeId ? COLORS.success : `${COLORS.accent}30`}`,
                  transition: 'all 0.2s ease',
                }}>
                  <div
                    style={{
                      display: 'flex',
                      gap: '12px',
                      marginBottom: '12px',
                      alignItems: 'center',
                    }}
                  >
                    <input
                      type="url"
                      value={link}
                      onChange={(e) => updateVideoLink(index, e.target.value)}
                      placeholder="https://youtube.com/watch?v=..."
                      style={{
                        flex: 1,
                        padding: '14px',
                        border: `2px solid ${youtubeId ? COLORS.success : `${COLORS.accent}30`}`,
                        borderRadius: '10px',
                        fontSize: '15px',
                        fontFamily: 'inherit',
                        backgroundColor: '#ffffff',
                        transition: 'all 0.2s ease',
                        outline: 'none',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = COLORS.primary;
                        e.target.style.boxShadow = `0 0 0 3px ${COLORS.primary}20`;
                      }}
                      onBlur={(e) => {
                        if (!youtubeId) {
                          e.target.style.borderColor = `${COLORS.accent}30`;
                          e.target.style.boxShadow = 'none';
                        }
                      }}
                    />
                    {videoLinks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVideoLink(index)}
                        style={{
                          background: COLORS.danger,
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '10px',
                          padding: '14px 16px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          fontSize: '16px',
                          minWidth: '50px',
                          transition: 'all 0.2s ease',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.05)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                        }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                  {youtubeId && (
                    <div
                      style={{
                        marginTop: '16px',
                        padding: '16px',
                        border: `2px solid ${COLORS.success}30`,
                        borderRadius: '12px',
                        backgroundColor: `${COLORS.success}05`,
                      }}
                    >
                      <div
                        style={{
                          fontSize: '13px',
                          color: COLORS.success,
                          marginBottom: '12px',
                          fontWeight: '700',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        <span>✅</span>
                        Vista previa de YouTube:
                      </div>
                      <div
                        style={{
                          position: 'relative',
                          width: '100%',
                          height: 0,
                          paddingBottom: '56.25%',
                          borderRadius: '10px',
                          overflow: 'hidden',
                          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                        }}
                      >
                        <iframe
                          src={`https://www.youtube.com/embed/${youtubeId}`}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            border: 'none',
                            borderRadius: '10px',
                          }}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          title="YouTube video preview"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            <button
              type="button"
              onClick={addVideoLink}
              style={{
                background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.primary})`,
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '14px 20px',
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: '600',
                width: '100%',
                transition: 'all 0.3s ease',
                boxShadow: `0 4px 12px ${COLORS.primary}30`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 6px 20px ${COLORS.primary}40`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = `0 4px 12px ${COLORS.primary}30`;
              }}
            >
              <span style={{ fontSize: '18px' }}>🎥</span>
              + Agregar otro enlace de video
            </button>
          </div>

          {/* botones */}
          <div style={{ 
            display: 'flex', 
            gap: '16px', 
            marginTop: '32px',
            paddingTop: '24px',
            borderTop: `1px solid ${COLORS.accent}20`,
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '16px',
                background: '#f8f9fa',
                color: COLORS.gray,
                border: `2px solid ${COLORS.accent}30`,
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '15px',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#e9ecef';
                e.currentTarget.style.color = COLORS.primary;
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f8f9fa';
                e.currentTarget.style.color = COLORS.gray;
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: '16px',
                background: loading 
                  ? `${COLORS.gray}`
                  : `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.accent})`,
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '15px',
                transition: 'all 0.3s ease',
                boxShadow: loading 
                  ? 'none'
                  : `0 4px 12px ${COLORS.primary}40`,
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = `0 6px 20px ${COLORS.primary}50`;
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = `0 4px 12px ${COLORS.primary}40`;
                }
              }}
            >
              {loading ? (
                <>
                  <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>
                    ⏳
                  </span>
                  Publicando...
                </>
              ) : (
                <>
                  <span style={{ marginRight: '8px' }}>🚀</span>
                  Publicar Post
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <style>{`
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
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @media (max-width: 640px) {
          .modal-overlay {
            padding: 10px;
          }
          
          .modal-content {
            padding: 24px 20px;
            border-radius: 16px;
          }
        }
      `}</style>
    </div>
  );
};