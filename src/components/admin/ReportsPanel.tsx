import React, { useState, useEffect } from 'react';
import { Report, Post, Comment } from '../../types';
import { getReports, updateReportStatus, isUserAdmin } from '../../services/reportService';
import { COLORS } from '../../utils/constants';
import { supabase } from '../../supabaseClient';

interface ReportsPanelProps {
  onClose: () => void;
}

interface ReportWithContent extends Report {
  content_data?: Post | Comment;
  author_username?: string;
}

export const ReportsPanel: React.FC<ReportsPanelProps> = ({ onClose }) => {
  const [reports, setReports] = useState<ReportWithContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'reviewed' | 'resolved'>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      loadReports();
    }
  }, [isAdmin, filter]);

  const checkAdminStatus = async () => {
    const admin = await isUserAdmin();
    setIsAdmin(admin);
    if (!admin) setLoading(false);
  };

  const loadReports = async () => {
    setLoading(true);
    const status = filter === 'all' ? undefined : filter;
    const { data, error } = await getReports(status);
    
    if (!error && data) {
      // Cargar contenido de cada reporte
      const reportsWithContent = await Promise.all(
        data.map(async (report) => {
          let contentData = null;
          let authorUsername = 'Usuario desconocido';

          try {
            if (report.content_type === 'post') {
              const { data: post } = await supabase
                .from('posts')
                .select('*, profiles:user_id(username)')
                .eq('id', report.content_id)
                .single();
              
              if (post) {
                contentData = post;
                authorUsername = post.profiles?.username || 'Usuario';
              }
            } else {
              const { data: comment } = await supabase
                .from('comments')
                .select('*, profiles:user_id(username)')
                .eq('id', report.content_id)
                .single();
              
              if (comment) {
                contentData = comment;
                authorUsername = comment.profiles?.username || 'Usuario';
              }
            }
          } catch (error) {
            console.error('Error cargando contenido del reporte:', error);
          }

          return {
            ...report,
            content_data: contentData,
            author_username: authorUsername
          };
        })
      );

      setReports(reportsWithContent);
    } else {
      console.error('Error cargando reportes:', error);
    }
    setLoading(false);
  };

  const handleStatusUpdate = async (reportId: string, newStatus: Report['status']) => {
    const { success } = await updateReportStatus(reportId, newStatus);
    if (success) {
      setReports(prev => prev.map(report => 
        report.id === reportId ? { ...report, status: newStatus } : report
      ));
    }
  };

  const handleDeleteContent = async (report: ReportWithContent) => {
    if (!confirm(`¿Estás seguro de eliminar este ${report.content_type}?`)) return;
    
    setActionLoading(report.id);
    try {
      if (report.content_type === 'post') {
        await supabase
          .from('posts')
          .delete()
          .eq('id', report.content_id);
      } else {
        await supabase
          .from('comments')
          .delete()
          .eq('id', report.content_id);
      }

      // Marcar reporte como resuelto
      await handleStatusUpdate(report.id, 'resolved');
      alert('Contenido eliminado exitosamente');
    } catch (error) {
      console.error('Error eliminando contenido:', error);
      alert('Error al eliminar el contenido');
    } finally {
      setActionLoading(null);
    }
  };

  const handleBanUser = async (report: ReportWithContent) => {
    if (!report.content_data?.user_id) {
      alert('No se pudo identificar al usuario');
      return;
    }

    if (!confirm(`¿Estás seguro de banear al usuario @${report.author_username}?`)) return;
    
    setActionLoading(report.id);
    try {
      // Actualizar perfil del usuario para marcarlo como baneado
      await supabase
        .from('profiles')
        .update({ 
          status: 'banned',
          banned_at: new Date().toISOString()
        })
        .eq('id', report.content_data.user_id);

      // Marcar reporte como resuelto
      await handleStatusUpdate(report.id, 'resolved');
      alert(`Usuario @${report.author_username} baneado exitosamente`);
    } catch (error) {
      console.error('Error baneando usuario:', error);
      alert('Error al banear el usuario');
    } finally {
      setActionLoading(null);
    }
  };

  const handleHideContent = async (report: ReportWithContent) => {
    setActionLoading(report.id);
    try {
      if (report.content_type === 'post') {
        await supabase
          .from('posts')
          .update({ hidden: true })
          .eq('id', report.content_id);
      } else {
        await supabase
          .from('comments')
          .update({ hidden: true })
          .eq('id', report.content_id);
      }

      await handleStatusUpdate(report.id, 'resolved');
      alert('Contenido ocultado exitosamente');
    } catch (error) {
      console.error('Error ocultando contenido:', error);
      alert('Error al ocultar el contenido');
    } finally {
      setActionLoading(null);
    }
  };

  if (!isAdmin) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h3>Acceso denegado</h3>
        <p>No tienes permisos para ver esta página.</p>
      </div>
    );
  }

  return (
    <div style={{ 
      position: 'fixed',
      top: 0,
      right: 0,
      width: '80%',
      height: '100vh',
      backgroundColor: 'white',
      boxShadow: '-4px 0 20px rgba(0,0,0,0.3)',
      zIndex: 1001,
      overflowY: 'auto',
      padding: '20px'
    }}>
      {/* Header del panel */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: COLORS.primary, margin: 0 }}>
          🛡️ Panel de Moderación
        </h1>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: COLORS.gray,
            padding: '8px'
          }}
        >
          ×
        </button>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', flexWrap: 'wrap' }}>
        {(['all', 'pending', 'reviewed', 'resolved'] as const).map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            style={{
              padding: '10px 20px',
              background: filter === status ? COLORS.primary : '#f1f5f9',
              color: filter === status ? 'white' : COLORS.primary,
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px'
            }}
          >
            {status === 'all' && '📋 Todos'}
            {status === 'pending' && '⏳ Pendientes'}
            {status === 'reviewed' && '👁️ Revisados'}
            {status === 'resolved' && '✅ Resueltos'}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '16px', color: COLORS.gray }}>Cargando reportes...</div>
        </div>
      ) : reports.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: COLORS.gray }}>
          🎉 No hay reportes {filter !== 'all' ? `con estado "${filter}"` : ''}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {reports.map(report => (
            <div
              key={report.id}
              style={{
                padding: '24px',
                border: `2px solid ${report.status === 'pending' ? '#f59e0b' : report.status === 'reviewed' ? '#3b82f6' : '#10b981'}`,
                borderRadius: '12px',
                backgroundColor: 'white',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
            >
              {/* Header del reporte */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <span style={{ fontWeight: '700', fontSize: '18px' }}>
                      {report.content_type === 'post' ? '📝 Publicación' : '💬 Comentario'}
                    </span>
                    <span style={{ 
                      fontSize: '12px', 
                      color: COLORS.gray,
                      backgroundColor: '#f1f5f9',
                      padding: '4px 8px',
                      borderRadius: '12px'
                    }}>
                      ID: {report.content_id}
                    </span>
                  </div>
                  
                  <div style={{ fontSize: '14px', color: COLORS.gray, marginBottom: '4px' }}>
                    👤 Creado por: <strong>@{report.author_username}</strong>
                  </div>
                  
                  <div style={{ fontSize: '14px', color: COLORS.gray }}>
                    📅 Reportado el {new Date(report.created_at).toLocaleDateString('es-ES')} a las {' '}
                    {new Date(report.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                
                <div style={{ 
                  padding: '6px 16px', 
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '700',
                  backgroundColor: 
                    report.status === 'pending' ? '#fef3c7' :
                    report.status === 'reviewed' ? '#dbeafe' : '#dcfce7',
                  color: 
                    report.status === 'pending' ? '#92400e' :
                    report.status === 'reviewed' ? '#1e40af' : '#166534',
                  border: `1px solid ${
                    report.status === 'pending' ? '#f59e0b' :
                    report.status === 'reviewed' ? '#3b82f6' : '#10b981'
                  }`
                }}>
                  {report.status === 'pending' && '⏳ Pendiente'}
                  {report.status === 'reviewed' && '👁️ Revisado'}
                  {report.status === 'resolved' && '✅ Resuelto'}
                </div>
              </div>

              {/* Motivo del reporte */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontWeight: '700', marginBottom: '8px', fontSize: '16px' }}>🚨 Motivo del reporte:</div>
                <div style={{ 
                  padding: '12px 16px', 
                  backgroundColor: '#f8fafc', 
                  borderRadius: '8px',
                  fontSize: '14px',
                  borderLeft: `4px solid ${COLORS.primary}`
                }}>
                  <div style={{ fontWeight: '600', color: COLORS.primary, textTransform: 'capitalize' }}>
                    {report.reason}
                  </div>
                  {report.description && (
                    <div style={{ marginTop: '8px', color: COLORS.gray, lineHeight: '1.5' }}>
                      {report.description}
                    </div>
                  )}
                </div>
              </div>

              {/* Contenido reportado */}
              {report.content_data && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontWeight: '700', marginBottom: '8px', fontSize: '16px' }}>
                    📄 Contenido reportado:
                  </div>
                  <div style={{ 
                    padding: '16px', 
                    backgroundColor: '#f1f5f9', 
                    borderRadius: '8px',
                    fontSize: '14px',
                    border: `1px solid #e2e8f0`,
                    maxHeight: '200px',
                    overflowY: 'auto'
                  }}>
                    {report.content_type === 'post' ? (
                      <div>
                        <div style={{ fontWeight: '600', marginBottom: '8px', color: COLORS.primary }}>
                          {(report.content_data as Post).title}
                        </div>
                        <div style={{ color: COLORS.gray, lineHeight: '1.5' }}>
                          {(report.content_data as Post).content}
                        </div>
                      </div>
                    ) : (
                      <div style={{ color: COLORS.gray, lineHeight: '1.5' }}>
                        {(report.content_data as Comment).content}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Acciones de moderación */}
              <div style={{ 
                display: 'flex', 
                gap: '10px', 
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap'
              }}>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {/* Acciones de estado */}
                  <button
                    onClick={() => handleStatusUpdate(report.id, 'reviewed')}
                    disabled={report.status === 'reviewed' || actionLoading === report.id}
                    style={{
                      padding: '8px 16px',
                      background: report.status === 'reviewed' ? '#dbeafe' : '#3b82f6',
                      color: report.status === 'reviewed' ? '#1e40af' : 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: report.status === 'reviewed' ? 'default' : 'pointer',
                      fontSize: '12px',
                      fontWeight: '600',
                      opacity: actionLoading === report.id ? 0.6 : 1
                    }}
                  >
                    👁️ Marcar Revisado
                  </button>
                  
                  <button
                    onClick={() => handleStatusUpdate(report.id, 'resolved')}
                    disabled={report.status === 'resolved' || actionLoading === report.id}
                    style={{
                      padding: '8px 16px',
                      background: report.status === 'resolved' ? '#dcfce7' : '#10b981',
                      color: report.status === 'resolved' ? '#166534' : 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: report.status === 'resolved' ? 'default' : 'pointer',
                      fontSize: '12px',
                      fontWeight: '600',
                      opacity: actionLoading === report.id ? 0.6 : 1
                    }}
                  >
                    ✅ Marcar Resuelto
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {/* Acciones de moderación */}
                  <button
                    onClick={() => handleHideContent(report)}
                    disabled={actionLoading === report.id}
                    style={{
                      padding: '8px 16px',
                      background: '#f59e0b',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '600',
                      opacity: actionLoading === report.id ? 0.6 : 1
                    }}
                  >
                    🚫 Ocultar
                  </button>
                  
                  <button
                    onClick={() => handleDeleteContent(report)}
                    disabled={actionLoading === report.id}
                    style={{
                      padding: '8px 16px',
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '600',
                      opacity: actionLoading === report.id ? 0.6 : 1
                    }}
                  >
                    🗑️ Eliminar
                  </button>
                  
                  <button
                    onClick={() => handleBanUser(report)}
                    disabled={actionLoading === report.id}
                    style={{
                      padding: '8px 16px',
                      background: '#dc2626',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '600',
                      opacity: actionLoading === report.id ? 0.6 : 1
                    }}
                  >
                    ⚡ Banear Usuario
                  </button>
                </div>
              </div>

              {actionLoading === report.id && (
                <div style={{ 
                  textAlign: 'center', 
                  marginTop: '12px', 
                  fontSize: '12px', 
                  color: COLORS.gray 
                }}>
                  Procesando...
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};