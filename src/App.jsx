import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Denuncia from './pages/Denuncia';
import Admin from './pages/Admin';

// (Opcional) Aquí puedes personalizar los colores de tu app
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Un azul confiable y profesional
    },
    secondary: {
      main: '#f50057', 
    },
    background: {
      default: '#f4f6f8', // Un fondo gris muy suave
    }
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* Resetea márgenes y aplica el color de fondo */}
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/denuncia" element={<Denuncia />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;