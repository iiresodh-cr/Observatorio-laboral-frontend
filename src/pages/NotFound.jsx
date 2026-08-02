import { Container, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

export default function NotFound() {
  return (
    <Container maxWidth="md">
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          minHeight: '80vh',
          textAlign: 'center',
          mt: 4
        }}
      >
        <ErrorOutlineIcon sx={{ fontSize: 120, mb: 2, color: 'secondary.main' }} />
        <Typography variant="h1" component="h1" fontWeight="bold" color="primary.main">
          404
        </Typography>
        <Typography variant="h4" component="h2" gutterBottom color="text.primary">
          Página no encontrada
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 4, maxWidth: '500px' }}>
          Lo sentimos, la página que estás buscando no existe o ha sido movida. Por favor, verifica la URL o vuelve a la página principal.
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          component={RouterLink} 
          to="/"
          size="large"
          sx={{ px: 4, py: 1.5, fontWeight: 'bold' }}
        >
          Volver al Inicio
        </Button>
      </Box>
    </Container>
  );
}
