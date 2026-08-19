import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { AppBar, Toolbar, Button, Box, IconButton, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import { Home, Library, ShieldAlert, Newspaper, Menu as MenuIcon } from 'lucide-react';
import logoBlanco from '../assets/logo-blanco.png';

export default function Navbar() {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

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

        {/* Desktop Menu */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
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
        </Box>

        {/* Mobile Menu */}
        <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
          <IconButton
            color="inherit"
            aria-label="menu"
            onClick={handleMenuClick}
            edge="end"
          >
            <MenuIcon size={24} />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleMenuClose}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
          >
            <MenuItem component={RouterLink} to="/" onClick={handleMenuClose}>
              <ListItemIcon>
                <Home size={18} />
              </ListItemIcon>
              <ListItemText>Inicio</ListItemText>
            </MenuItem>
            <MenuItem component={RouterLink} to="/repositorio" onClick={handleMenuClose}>
              <ListItemIcon>
                <Library size={18} />
              </ListItemIcon>
              <ListItemText>Repositorio</ListItemText>
            </MenuItem>
            <MenuItem component={RouterLink} to="/denuncia" onClick={handleMenuClose}>
              <ListItemIcon>
                <ShieldAlert size={18} />
              </ListItemIcon>
              <ListItemText>Denuncias</ListItemText>
            </MenuItem>
            <MenuItem component={RouterLink} to="/blog" onClick={handleMenuClose}>
              <ListItemIcon>
                <Newspaper size={18} />
              </ListItemIcon>
              <ListItemText>Blog</ListItemText>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}