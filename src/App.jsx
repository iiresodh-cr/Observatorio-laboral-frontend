import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme, Box, CircularProgress } from '@mui/material';
import Navbar from './components/Navbar';

// Lazy loaded pages
const Home = lazy(() => import('./pages/Home'));
const Denuncia = lazy(() => import('./pages/Denuncia'));
const Admin = lazy(() => import('./pages/Admin'));
const Repositorio = lazy(() => import('./pages/Repositorio'));
const Blog = lazy(() => import('./pages/Blog'));
const AuthAction = lazy(() => import('./pages/AuthAction'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Tema visual con los colores de la Unión Europea
const theme = createTheme({
  palette: {
    primary: {
      main: '#081A3D', // Azul oscuro (Hero/Navbar)
    },
    secondary: {
      main: '#FFCC00', // Amarillo/Dorado de las estrellas de la UE
    },
    background: {
      default: '#f4f6f8', // Mantenemos un fondo gris claro para que resalten las tarjetas
    }
  },
  typography: {
    // Puedes ajustar detalles de la fuente aquí si lo necesitas en el futuro
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
  }
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline /> 
      <Router>
        <Navbar />
        <Suspense fallback={
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
            <CircularProgress />
          </Box>
        }>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/repositorio" element={<Repositorio />} />
            <Route path="/denuncia" element={<Denuncia />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/auth-action" element={<AuthAction />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Router>
    </ThemeProvider>
  );
}

export default App;