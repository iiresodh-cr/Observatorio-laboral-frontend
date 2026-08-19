import React from 'react';
import { Box, Container, Typography, Link as MuiLink } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export default function Footer() {
  return (
    <Box component="footer" sx={{ bgcolor: '#081A3D', color: 'white', py: 4, mt: 'auto' }}>
      <Container maxWidth="lg" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        
        {/* Enlaces Legales */}
        <Box sx={{ mb: 2, display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
          <MuiLink component={RouterLink} to="/privacidad" color="inherit" sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
            Política de Privacidad
          </MuiLink>
          <MuiLink component={RouterLink} to="/terminos" color="inherit" sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
            Términos y Condiciones de Uso
          </MuiLink>
        </Box>
        
        {/* Copyright */}
        <Typography variant="body2" sx={{ mb: 2 }}>
          © {new Date().getFullYear()} Instituto Internacional de Responsabilidad Social y Derechos Humanos (IIRESODH).
        </Typography>
        
        {/* Creative Commons License */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', justifyContent: 'center', gap: 2 }}>
          <a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank" rel="noreferrer">
            <img alt="Licencia de Creative Commons" style={{ borderWidth: 0 }} src="https://i.creativecommons.org/l/by-nc-sa/4.0/88x31.png" />
          </a>
          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', maxWidth: '400px' }}>
            El contenido de este sitio está bajo una <MuiLink href="http://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank" rel="noreferrer" color="inherit" underline="always">Licencia Creative Commons Atribución-NoComercial-CompartirIgual 4.0 Internacional</MuiLink>, salvo que se indique lo contrario.
          </Typography>
        </Box>

      </Container>
    </Box>
  );
}
