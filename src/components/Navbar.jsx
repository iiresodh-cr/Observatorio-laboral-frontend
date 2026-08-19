import { Link as RouterLink } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Home, Library, ShieldAlert, Newspaper } from 'lucide-react';
import logoBlanco from '../assets/logo-blanco.png';

export default function Navbar() {
  return (
    <AppBar position="static" elevation={2} sx={{ bgcolor: '#081A3D' }}>
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
          <Button 
            color="inherit" 
            component={RouterLink} 
            to="/" 
            startIcon={<Home size={18} />}
          >
            Inicio
          </Button>
          <Button 
            color="inherit" 
            component={RouterLink} 
            to="/repositorio" 
            startIcon={<Library size={18} />}
          >
            Repositorio
          </Button>
          <Button 
            color="inherit" 
            component={RouterLink} 
            to="/denuncia" 
            startIcon={<ShieldAlert size={18} />}
          >
            Denuncias
          </Button>
          <Button 
            color="inherit" 
            component={RouterLink} 
            to="/blog" 
            startIcon={<Newspaper size={18} />}
          >
            Blog
          </Button>
          {/* El botón de Admin ha sido eliminado de aquí para ocultarlo al público */}
        </Box>
      </Toolbar>
    </AppBar>
  );
}