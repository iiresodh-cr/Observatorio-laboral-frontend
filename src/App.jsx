import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Denuncia from './pages/Denuncia';
import Admin from './pages/Admin';
import Repositorio from './pages/Repositorio';
import Blog from './pages/Blog';
import AuthAction from './pages/AuthAction'; // NUEVO: Importación del gestor de auth

// Tema visual con los colores de la Unión Europea
const theme = createTheme({
  palette: {
    primary: {
      main: '#003399', // Azul institucional de la Unión Europea
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
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  }
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline /> 
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/repositorio" element={<Repositorio />} />
          <Route path="/denuncia" element={<Denuncia />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/auth-action" element={<AuthAction />} /> {/* NUEVA RUTA */}
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;