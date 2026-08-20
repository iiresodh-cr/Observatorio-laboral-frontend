import { useEffect, useState } from 'react';
import { useSearchParams, Link as RouterLink } from 'react-router-dom';
import { Container, Paper, Typography, Box, CircularProgress, Button, TextField } from '@mui/material';

import { 
  CheckCircle as CheckCircleIcon, 
  AlertCircle as ErrorIcon,
  Key as KeyIcon
} from 'lucide-react';

// Firebase
import { auth } from '../services/firebaseConfig';
import { applyActionCode, verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth';

export default function AuthAction() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error', 'resetForm'
  const [message, setMessage] = useState('Procesando solicitud...');

  // Campos para reset password
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const mode = searchParams.get('mode');
  const oobCode = searchParams.get('oobCode');

  useEffect(() => {
    if (!mode || !oobCode) {
      setStatus('error');
      setMessage('Enlace inválido o incompleto. Por favor, revisa el correo que recibiste.');
      return;
    }

    if (mode === 'verifyEmail') {
      setMessage('Verificando tu cuenta de correo...');
      applyActionCode(auth, oobCode)
        .then(() => {
          setStatus('success');
          setMessage('¡Tu cuenta ha sido verificada exitosamente! Ya puedes acceder al panel.');
        })
        .catch((error) => {
          setStatus('error');
          if (error.code === 'auth/invalid-action-code') {
            setMessage('El enlace ya ha sido utilizado o ha expirado. Si ya verificaste tu cuenta, puedes iniciar sesión.');
          } else {
            setMessage('Ocurrió un error al verificar tu cuenta. Inténtalo de nuevo.');
          }
        });
    } else if (mode === 'resetPassword') {
      setMessage('Verificando enlace de recuperación...');
      verifyPasswordResetCode(auth, oobCode)
        .then((email) => {
          setResetEmail(email);
          setStatus('resetForm');
        })
        .catch((error) => {
          setStatus('error');
          if (error.code === 'auth/invalid-action-code') {
            setMessage('El enlace de recuperación es inválido o ha expirado. Solicita uno nuevo.');
          } else {
            setMessage('Error verificando el enlace. Inténtalo de nuevo.');
          }
        });
    } else {
      setStatus('error');
      setMessage('Acción no reconocida.');
    }
  }, [mode, oobCode]);

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setResetError('');
    if (newPassword !== confirmPassword) {
      setResetError('Las contraseñas no coinciden.');
      return;
    }
    if (newPassword.length < 6) {
      setResetError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setIsResetting(true);
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setStatus('success');
      setMessage('¡Tu contraseña ha sido actualizada correctamente! Ya puedes iniciar sesión con tu nueva contraseña.');
    } catch (error) {
      setResetError(error.message || 'Error al restablecer la contraseña.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 10, mb: 10 }}>
      <Paper elevation={4} sx={{ p: 5, textAlign: 'center', borderRadius: 3, borderTop: status === 'success' ? '6px solid #4caf50' : status === 'error' ? '6px solid #f44336' : '6px solid #081A3D' }}>
        
        {status === 'loading' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <CircularProgress size={60} color="primary" />
            <Typography variant="h5" fontWeight="bold" color="primary">
              Procesando...
            </Typography>
            <Typography color="text.secondary">{message}</Typography>
          </Box>
        )}

        {status === 'resetForm' && (
          <Box component="form" onSubmit={handlePasswordReset} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Box sx={{ mb: 1 }}><KeyIcon size={60} color="#081A3D" /></Box>
            <Typography variant="h5" fontWeight="bold" color="text.primary">
              Restablecer Contraseña
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Ingresa una nueva contraseña para la cuenta <strong>{resetEmail}</strong>
            </Typography>
            
            <TextField fullWidth label="Nueva Contraseña" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required margin="normal" />
            <TextField fullWidth label="Confirmar Nueva Contraseña" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required margin="normal" />
            
            {resetError && (
              <Typography color="error" variant="body2" sx={{ mt: 1 }}>{resetError}</Typography>
            )}

            <Button type="submit" variant="contained" color="primary" size="large" fullWidth sx={{ mt: 3, fontWeight: 'bold' }} disabled={isResetting}>
              {isResetting ? 'Actualizando...' : 'Actualizar Contraseña'}
            </Button>
          </Box>
        )}

        {status === 'success' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Box sx={{ mb: 1 }}><CheckCircleIcon size={80} color="#4caf50" /></Box>
            <Typography variant="h4" fontWeight="bold" color="text.primary">
              ¡Operación Exitosa!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {message}
            </Typography>
            <Button component={RouterLink} to="/admin" variant="contained" color="primary" size="large" sx={{ fontWeight: 'bold', px: 5 }}>
              Ir al Inicio de Sesión
            </Button>
          </Box>
        )}

        {status === 'error' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Box sx={{ mb: 1 }}><ErrorIcon size={80} color="#f44336" /></Box>
            <Typography variant="h4" fontWeight="bold" color="text.primary">
              Ocurrió un Problema
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              {message}
            </Typography>
            <Button component={RouterLink} to="/admin" variant="outlined" color="primary" size="large" sx={{ fontWeight: 'bold' }}>
              Volver al Panel
            </Button>
          </Box>
        )}

      </Paper>
    </Container>
  );
}