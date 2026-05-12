import { Link as RouterLink } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import GavelIcon from '@mui/icons-material/Gavel'; 

export default function Navbar() {
  return (
    <AppBar position="static" elevation={2}>
      <Toolbar>
        <GavelIcon sx={{ mr: 2 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
          Observatorio Laboral CR
        </Typography>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button color="inherit" component={RouterLink} to="/">Inicio</Button>
          <Button color="inherit" component={RouterLink} to="/repositorio">Repositorio</Button>
          <Button color="inherit" component={RouterLink} to="/denuncia">Denuncias</Button>
          {/* El botón de Admin ha sido eliminado de aquí para ocultarlo al público */}
        </Box>
      </Toolbar>
    </AppBar>
  );
}