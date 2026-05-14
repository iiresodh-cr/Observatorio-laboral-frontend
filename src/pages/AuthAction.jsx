import { useEffect, useState } from 'react';
import { useSearchParams, Link as RouterLink } from 'react-router-dom';
import { Container, Paper, Typography, Box, CircularProgress, Button } from '@mui/material';

// SOLUCIÓN: Importación nombrada desde la raíz del paquete
import { 
  CheckCircle as CheckCircleIcon, 
  ErrorOutline as ErrorOutlineIcon 
} from '@mui/icons-material';

// Firebase
import { auth } from '../services/firebaseConfig';
import { applyActionCode } from 'firebase/auth';

export default function AuthAction() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [message, setMessage] = useState('Verificando tu cuenta de correo...');

  const mode = searchParams.get('mode');
  const oobCode = searchParams.get('oobCode');

  useEffect(() => {
    if (!mode || !oobCode) {
      setStatus('error');
      setMessage('Enlace inválido o incompleto. Por favor, revisa el correo que recibiste.');
      return;
    }

    if (mode === 'verifyEmail') {
      applyActionCode(auth, oobCode)
        .then(() => {
          setStatus('success');
          setMessage('¡Tu cuenta ha sido verificada exitosamente!');
        })
        .catch((error) => {
          setStatus('error');
          if (error.code === 'auth/invalid-action-code') {
            setMessage('El enlace ya ha sido utilizado o ha expirado. Si ya verificaste tu cuenta, puedes iniciar sesión.');
          } else {
            setMessage('Ocurrió un error al verificar tu cuenta. Inténtalo de nuevo.');
          }
        });
    } else {
      setStatus('error');
      setMessage('Acción no reconocida.');
    }
  }, [mode, oobCode]);

  return (
    <Container maxWidth="sm" sx={{ mt: 10, mb: 10 }}>
      <Paper elevation={4} sx={{ p: 5, textAlign: 'center', borderRadius: 3, borderTop: status === 'success' ? '6px solid #4caf50' : status === 'error' ? '6px solid #f44336' : '6px solid #003399' }}>
        
        {status === 'loading' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <CircularProgress size={60} color="primary" />
            <Typography variant="h5" fontWeight="bold" color="primary">
              Procesando...
            </Typography>
            <Typography color="text.secondary">{message}</Typography>
          </Box>
        )}

        {status === 'success' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <CheckCircleIcon sx={{ fontSize: 80, color: '#4caf50', mb: 1 }} />
            <Typography variant="h4" fontWeight="bold" color="text.primary">
              ¡Correo Verificado!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {message}
            </Typography>
            <Typography variant="body2" sx={{ mb: 4, p: 2, bgcolor: '#f4f6f8', borderRadius: 2 }}>
              Ya puedes acceder al panel de administración utilizando tu correo y la contraseña temporal que te fue asignada.
            </Typography>
            <Button component={RouterLink} to="/admin" variant="contained" color="primary" size="large" sx={{ fontWeight: 'bold', px: 5 }}>
              Ir al Inicio de Sesión
            </Button>
          </Box>
        )}

        {status === 'error' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <ErrorOutlineIcon sx={{ fontSize: 80, color: '#f44336', mb: 1 }} />
            <Typography variant="h4" fontWeight="bold" color="text.primary">
              Error de Verificación
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