import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { COLORS } from '../../utils/constants';
import { TERMS_AND_CONDITIONS } from '../../utils/terms';
import { supabase } from '../../supabaseClient';
import { normalizePlanType } from '../../utils/permissionUtils';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  onAuthSuccess 
}) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validar confirmación de contraseña en registro
    if (!isLogin && password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }
  
    try {
      console.log('1️⃣ Intentando autenticación:', { email, isLogin });
      
      let result;
      
      if (isLogin) {
        console.log('2️⃣ Ejecutando signInWithPassword');
        result = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password
        });
        console.log('3️⃣ Resultado recibido:', result);
      } else {
        console.log('2️⃣ Ejecutando signUp');
        result = await supabase.auth.signUp({
          email: email.trim(),
          password: password,
          options: {
            data: {
              username: username || email.split('@')[0]
            },
            emailRedirectTo: `${window.location.origin}`
          }
        });
        console.log('3️⃣ Resultado recibido:', result);
      }
  
      console.log('4️⃣ Verificando error...');
      if (result.error) {
        console.log('5️⃣ ERROR COMPLETO:', result.error);
        console.log('6️⃣ Mensaje:', result.error.message);
        console.log('7️⃣ Status:', result.error.status);
        throw new Error(result.error.message);
      }
  
      console.log('8️⃣ Autenticación exitosa');
  
      // Para registro, mostrar mensaje de confirmación
      if (!isLogin && result.data.user && result.data.user.identities?.length === 0) {
        setError('Usuario ya existe. Por favor inicia sesión.');
        return;
      }
  
      if (!isLogin && result.data.user) {
        setError('✅ Registro exitoso. Por favor verifica tu email.');
        return;
      }

      // ✅ Crear perfil SOLO durante el REGISTRO (no en login)
      if (!isLogin) {
        const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: result.data.user.id,
          email: result.data.user.email!,
          username: username || email.split('@')[0],
          plan_type: 'free',
        });

        if (profileError) {
          console.error('❌ Error creando perfil:', profileError);
        } else {
          console.log('✅ Perfil creado exitosamente');
        }
      }
  
      if (result.data.user) {
        console.log('🔄 Creando objeto user...');
        const authenticatedUser: User = {
          id: result.data.user.id,
          email: result.data.user.email!,
          username: username || email.split('@')[0],
          plan_type: 'free'
        };
        
        console.log('✅ User creado:', authenticatedUser);
        console.log('🚀 Llamando onAuthSuccess...');
        onAuthSuccess(authenticatedUser);
        console.log('🎯 onAuthSuccess llamado');
      }
    } catch (error: any) {
      console.log('9️⃣ CATCH - Error:', error);
      setError('Error: ' + error.message);
    } finally {
      console.log('🔟 FINALLY - Loading false');
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `https://react-ts-hgxurh8e.stackblitz.io/`,
      });

      if (error) throw error;
      
      setResetSent(true);
      setError('');
    } catch (error: any) {
      setError('Error: ' + error.message);
    } finally {
      setResetLoading(false);
    }
  };

  // 🆕 NUEVO: Detectar si venimos de un link de reset de contraseña - CON DEPURACIÓN
  useEffect(() => {
    console.log('🔍 DEPURACIÓN - URL completa:', window.location.href);
    console.log('🔍 DEPURACIÓN - Hash:', window.location.hash);
    console.log('🔍 DEPURACIÓN - Search:', window.location.search);
    
    // Probar diferentes métodos de extracción
    const fullURL = window.location.href;
    
    // Método 1: Buscar en el hash
    if (window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.replace('#', ''));
      console.log('🔍 Parámetros del hash:', Object.fromEntries(hashParams.entries()));
    }
    
    // Método 2: Buscar en toda la URL
    const urlObj = new URL(fullURL);
    const hashParams = new URLSearchParams(urlObj.hash.replace('#', ''));
    const type = hashParams.get('type');
    const accessToken = hashParams.get('access_token');
    
    console.log('🔍 Token detectado:', { type, accessToken });
    
    if (type === 'recovery' && accessToken) {
      console.log('✅ TOKEN VÁLIDO DETECTADO - Mostrando reset de contraseña');
      setShowForgotPassword(true);
      // Limpiar la URL
      window.history.replaceState({}, '', window.location.pathname);
    } else {
      console.log('❌ No se detectó token válido');
    }
  }, []);


  // Reset form cuando se abre/cierra el modal
  useEffect(() => {
    if (isOpen) {
      setEmail('');
      setPassword('');
      setUsername('');
      setConfirmPassword('');
      setError('');
      setResetSent(false);
      setShowForgotPassword(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Modal de recuperación de contraseña
  if (showForgotPassword) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <button className="close-button" onClick={() => setShowForgotPassword(false)}>×</button>
          <h2 style={{ color: COLORS.primary }}>Recuperar Contraseña</h2>
          
          {resetSent ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📧</div>
              <h3 style={{ color: COLORS.primary, marginBottom: '10px' }}>Email enviado</h3>
              <p style={{ color: COLORS.gray, marginBottom: '20px' }}>
                Hemos enviado un enlace de recuperación a <strong>{resetEmail}</strong>
              </p>
              <button
                onClick={() => setShowForgotPassword(false)}
                style={{
                  background: COLORS.primary,
                  color: COLORS.white,
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                Volver al login
              </button>
            </div>
          ) : (
            <>
              {error && (
                <div className="error-message">
                  <strong>Error:</strong> {error}
                </div>
              )}
              
              <form onSubmit={handlePasswordReset}>
                <div className="form-group">
                  <label>Email:</label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="Ingresa tu email"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="auth-button"
                >
                  {resetLoading ? 'Enviando...' : 'Enviar enlace de recuperación'}
                </button>
              </form>
              
              <p className="auth-switch">
                <button 
                  type="button" 
                  onClick={() => setShowForgotPassword(false)}
                  className="switch-button"
                >
                  ← Volver al login
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>×</button>
        <h2 style={{ color: COLORS.primary }}>{isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}</h2>
        
        {error && (
          <div className="error-message">
            <strong>Error:</strong> {error}
            <div style={{ fontSize: '12px', marginTop: '5px' }}>
              Usa: test@test.com / 123456
            </div>
          </div>
        )}
        
        <form onSubmit={handleAuth}>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder=""
              required
            />
          </div>
          
          {!isLogin && (
            <div className="form-group">
              <label>Nombre de usuario (opcional):</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Se usará el email si está vacío"
              />
            </div>
          )}
          
          <div className="form-group" style={{ position: 'relative' }}>
            <label>Contraseña:</label>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder=""
              required
              minLength={3}
              style={{ paddingRight: '40px' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '10px',
                top: '32px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: COLORS.gray,
                fontSize: '16px'
              }}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>

          {!isLogin && (
            <div className="form-group" style={{ position: 'relative' }}>
              <label>Confirmar Contraseña:</label>
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder=""
                required
                minLength={3}
                style={{ paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '32px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: COLORS.gray,
                  fontSize: '16px'
                }}
              >
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
              </button>
              {confirmPassword && password !== confirmPassword && (
                <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '5px' }}>
                  Las contraseñas no coinciden
                </div>
              )}
            </div>
          )}
          
          {!isLogin && (
            <div className="form-group" style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="checkbox"
                id="accept-terms"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                style={{ marginRight: '4px' }}
              />
              <label htmlFor="accept-terms" style={{ fontSize: '14px', margin: 0 }}>
                Acepto los{' '}
                <span
                  onClick={() => setShowTermsModal(true)}
                  style={{ color: COLORS.secondary, cursor: 'pointer', textDecoration: 'underline' }}
                >
                  términos y condiciones
                </span>
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || (!isLogin && (!acceptedTerms || password !== confirmPassword))}
            className="auth-button"
          >
            {loading ? 'Procesando...' : (isLogin ? 'Iniciar Sesión' : 'Crear Cuenta')}
          </button>
        </form>
        
        {isLogin && (
          <div style={{ textAlign: 'center', margin: '15px 0' }}>
            <button 
              type="button"
              onClick={() => setShowForgotPassword(true)}
              style={{
                background: 'none',
                border: 'none',
                color: COLORS.secondary,
                cursor: 'pointer',
                textDecoration: 'underline',
                fontSize: '14px'
              }}
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
        )}
        
        <p className="auth-switch">
          {isLogin ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
          <button 
            type="button" 
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="switch-button"
          >
            {isLogin ? 'Regístrate' : 'Inicia Sesión'}
          </button>
        </p>

        {/* 🆕 BOTÓN TEMPORAL PARA TESTING */}
        <div style={{ textAlign: 'center', margin: '10px 0', padding: '10px', background: '#f3f4f6', borderRadius: '6px' }}>
          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>
            🔍 Para testing: 
          </div>
          <button
            type="button"
            onClick={() => {
              console.log('🧪 Forzando modo reset password');
              setShowForgotPassword(true);
            }}
            style={{
              background: 'none',
              border: '1px dashed #6b7280',
              color: '#6b7280',
              padding: '5px 10px',
              borderRadius: '4px',
              fontSize: '11px',
              cursor: 'pointer'
            }}
          >
            Simular Reset Password
          </button>
        </div>


        <div style={{ 
          marginTop: '15px', 
          padding: '10px', 
          backgroundColor: COLORS.light,
          borderRadius: '6px',
          fontSize: '12px',
          color: COLORS.primary
        }}>
          <strong>Modo demostración:</strong> Sistema de autenticación simulado
          <br />
          Cualquier email/contraseña funcionará (mínimo 3 caracteres)
        </div>
      </div>

      {showTermsModal && (
        <div className="modal-overlay" onClick={() => setShowTermsModal(false)}>
          <div 
            className="modal-content terms-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ 
              maxHeight: '80vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <button className="close-button" onClick={() => setShowTermsModal(false)}>×</button>
            <h2 style={{ color: COLORS.primary, marginBottom: '15px' }}>Términos y Condiciones</h2>
            
            <div 
              style={{ 
                flex: 1,
                overflowY: 'auto',
                whiteSpace: 'pre-wrap', 
                fontSize: '14px', 
                lineHeight: '1.6',
                paddingRight: '10px',
                marginBottom: '20px'
              }}
            >
              {TERMS_AND_CONDITIONS}
            </div>
            
            <div style={{ marginTop: 'auto', textAlign: 'right' }}>
              <button
                onClick={() => setShowTermsModal(false)}
                style={{
                  background: COLORS.primary,
                  color: COLORS.white,
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};