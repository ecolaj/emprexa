import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { COLORS } from '../../utils/constants';

export const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;
      
      setSuccess(true);
      setTimeout(() => {
        window.location.href = '/';
      }, 3000);
    } catch (error: any) {
      setError('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      maxWidth: '400px', 
      margin: '100px auto', 
      padding: '40px 20px',
      textAlign: 'center'
    }}>
      <h2 style={{ color: COLORS.primary, marginBottom: '30px' }}>
        Restablecer Contraseña
      </h2>
      
      {success ? (
        <div style={{ 
          color: COLORS.success, 
          padding: '20px',
          backgroundColor: '#f0fdf4',
          borderRadius: '8px',
          border: `1px solid ${COLORS.success}20`
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
          <h3 style={{ color: COLORS.success, marginBottom: '10px' }}>
            Contraseña actualizada
          </h3>
          <p style={{ color: COLORS.gray }}>
            Tu contraseña ha sido actualizada exitosamente. 
            Serás redirigido al inicio en 3 segundos...
          </p>
        </div>
      ) : (
        <form onSubmit={handleResetPassword} style={{ textAlign: 'left' }}>
          {error && (
            <div style={{ 
              color: '#ef4444', 
              backgroundColor: '#fef2f2',
              padding: '12px',
              borderRadius: '6px',
              marginBottom: '20px',
              border: '1px solid #fecaca'
            }}>
              {error}
            </div>
          )}
          
          <div style={{ marginBottom: '20px', position: 'relative' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              Nueva Contraseña:
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="Mínimo 6 caracteres"
              style={{ 
                width: '100%', 
                padding: '12px 40px 12px 12px',
                border: `1px solid ${COLORS.border.light}`,
                borderRadius: '6px',
                fontSize: '16px'
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '38px',
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
          
          <div style={{ marginBottom: '25px', position: 'relative' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              Confirmar Contraseña:
            </label>
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Repite la contraseña"
              style={{ 
                width: '100%', 
                padding: '12px 40px 12px 12px',
                border: `1px solid ${COLORS.border.light}`,
                borderRadius: '6px',
                fontSize: '16px'
              }}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '38px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: COLORS.gray,
                fontSize: '16px'
              }}
            >
              {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '12px',
              background: loading ? COLORS.gray : COLORS.primary,
              color: COLORS.white,
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
          </button>
        </form>
      )}
    </div>
  );
};