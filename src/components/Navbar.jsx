import { Link as RouterLink } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import logoBlanco from '../assets/logo-blanco.png';

export default function Navbar() {
  return (
    <AppBar position="static" elevation={2} sx={{ bgcolor: '#081a3d' }}>
      <Toolbar>
        <Box 
          component={RouterLink} 
          to="/" 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            textDecoration: 'none', 
            color: 'inherit', 
            flexGrow: 1 
          }}
        >
          <Box 
            component="img" 
            src={logoBlanco} 
            alt="Logo Observatorio Laboral CR" 
            sx={{ height: 48, objectFit: 'contain' }} 
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button color="inherit" component={RouterLink} to="/">Inicio</Button>
          <Button color="inherit" component={RouterLink} to="/repositorio">Repositorio</Button>
          <Button color="inherit" component={RouterLink} to="/denuncia">Denuncias</Button>
          <Button color="inherit" component={RouterLink} to="/blog">Blog</Button>
          {/* El botón de Admin ha sido eliminado de aquí para ocultarlo al público */}
        </Box>
      </Toolbar>
    </AppBar>
  );
}