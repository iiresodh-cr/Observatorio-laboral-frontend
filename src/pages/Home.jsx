import { useState, useEffect } from 'react';
import { 
  Container, Typography, Paper, Box, Grid, Button, 
  Card, CardContent, CardActions, Divider, CircularProgress, Link as MuiLink 
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import GavelIcon from '@mui/icons-material/Gavel';
import ForumIcon from '@mui/icons-material/Forum';
import BalanceIcon from '@mui/icons-material/Balance';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

// Firebase Services
import { db } from '../services/firebaseConfig';
import { collection, query, where, getCountFromServer } from 'firebase/firestore';

export default function Home() {
  const [stats, setStats] = useState({ docs: 0, cases: 0, loading: true });

  useEffect(() => {
    async function fetchStats() {
      try {
        // 1. Contar documentos en el repositorio
        const docsSnap = await getCountFromServer(collection(db, "documentos"));
        
        // 2. Contar casos atendidos (denuncias completadas)
        const casesQuery = query(collection(db, "denuncias"), where("estado", "==", "completada"));
        const casesSnap = await getCountFromServer(casesQuery);

        setStats({
          docs: docsSnap.data().count,
          cases: casesSnap.data().count,
          loading: false
        });
      } catch (error) {
        console.error("Error cargando estadísticas:", error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    }
    fetchStats();
  }, []);

  return (
    <Box sx={{ width: '100%', pb: 8 }}>
      
      {/* --- SECCIÓN HERO (Bienvenida con Gradiente) --- */}
      <Box 
        sx={{ 
          background: 'linear-gradient(135deg, #003399 0%, #001f5c 100%)',
          color: 'white',
          pt: { xs: 8, md: 12 },
          pb: { xs: 8, md: 12 },
          px: 2,
          textAlign: 'center',
          borderBottom: '5px solid #FFCC00'
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h2" component="h1" gutterBottom fontWeight="900" sx={{ fontSize: { xs: '2.5rem', md: '4rem' }, letterSpacing: '-0.5px' }}>
            Observatorio de Derechos Laborales
          </Typography>
          <Typography variant="h5" paragraph sx={{ maxWidth: 800, mx: 'auto', fontWeight: 300, opacity: 0.9, mb: 4, lineHeight: 1.6 }}>
            Plataforma integral e inteligente para la protección, orientación y análisis normativo de las condiciones laborales en Costa Rica.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button component={RouterLink} to="/denuncia" variant="contained" color="secondary" size="large" sx={{ color: '#000', fontWeight: 'bold', px: 4, py: 1.5, fontSize: '1.1rem' }}>
              Solicitar Asesoría Legal
            </Button>
            <Button component={RouterLink} to="/repositorio" variant="outlined" size="large" sx={{ color: 'white', borderColor: 'white', fontWeight: 'bold', px: 4, py: 1.5, fontSize: '1.1rem', '&:hover': { borderColor: '#FFCC00', color: '#FFCC00' } }}>
              Consultar Normativa
            </Button>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: -5, position: 'relative', zIndex: 2 }}>
        <Paper elevation={4} sx={{ p: 3, textAlign: 'center', borderRadius: 2, bgcolor: '#ffffff', display: 'inline-block', left: '50%', transform: 'translateX(-50%)', position: 'relative' }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Iniciativa oficial desarrollada con el apoyo de la Unión Europea
          </Typography>
        </Paper>
      </Container>

      {/* --- SECCIÓN: CONTADORES DINÁMICOS (ALINEACIÓN CORREGIDA) --- */}
      <Container maxWidth="lg" sx={{ mt: 10, mb: 8 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'center', alignItems: 'center', gap: 4 }}>
          <Paper elevation={0} sx={{ width: '100%', maxWidth: 350, p: 4, textAlign: 'center', bgcolor: '#f0f4ff', borderRadius: 4, border: '1px solid #e0eaff' }}>
            <GavelIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
            {stats.loading ? <CircularProgress size={30} sx={{ display: 'block', mx: 'auto', my: 1 }} /> : (
              <Typography variant="h3" fontWeight="900" color="primary">{stats.docs}</Typography>
            )}
            <Typography variant="subtitle1" fontWeight="bold" color="text.secondary">Documentos Legales</Typography>
            <Typography variant="caption" color="text.disabled">Leyes, Tratados y Jurisprudencia</Typography>
          </Paper>
          
          <Paper elevation={0} sx={{ width: '100%', maxWidth: 350, p: 4, textAlign: 'center', bgcolor: '#fff9e6', borderRadius: 4, border: '1px solid #ffecb3' }}>
            <SupportAgentIcon sx={{ fontSize: 40, mb: 1, color: '#b28900' }} />
            {stats.loading ? <CircularProgress size={30} sx={{ display: 'block', mx: 'auto', my: 1, color: '#b28900' }} /> : (
              <Typography variant="h3" fontWeight="900" sx={{ color: '#b28900' }}>{stats.cases}</Typography>
            )}
            <Typography variant="subtitle1" fontWeight="bold" color="text.secondary">Asesorías Finalizadas</Typography>
            <Typography variant="caption" color="text.disabled">Casos con orientación brindada</Typography>
          </Paper>
        </Box>
      </Container>

      <Container maxWidth="lg" sx={{ mt: 2 }}>
        
        {/* --- SECCIÓN EXPLICATIVA: ¿Qué es el observatorio? --- */}
        <Box sx={{ mb: 10, textAlign: 'center' }}>
          <Typography variant="h4" color="primary" fontWeight="bold" gutterBottom>
            ¿Por qué existe este Observatorio?
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto', mb: 6 }}>
            Nuestra misión es democratizar el acceso a la justicia laboral. Brindamos herramientas gratuitas tanto para el análisis académico y legal, como para el acompañamiento directo a ciudadanos cuyos derechos han sido vulnerados.
          </Typography>

          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{ p: 3 }}>
                <BalanceIcon sx={{ fontSize: 50, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" fontWeight="bold" gutterBottom>Justicia Transparente</Typography>
                <Typography variant="body2" color="text.secondary">
                  Recopilamos y organizamos leyes, reglamentos y jurisprudencia para que trabajadores y empleadores conozcan las reglas claras del entorno laboral.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ p: 3 }}>
                <SupportAgentIcon sx={{ fontSize: 50, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" fontWeight="bold" gutterBottom>Orientación Gratuita</Typography>
                <Typography variant="body2" color="text.secondary">
                  Ofrecemos un canal seguro y confidencial para que cualquier ciudadano registre incidentes de acoso, impagos o despidos y reciba una guía estructurada.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ p: 3 }}>
                <AutoAwesomeIcon sx={{ fontSize: 50, color: 'secondary.main', mb: 2 }} />
                <Typography variant="h6" fontWeight="bold" gutterBottom>Impulsado por IA</Typography>
                <Typography variant="body2" color="text.secondary">
                  Utilizamos la inteligencia artificial especializada{' '}
                  <MuiLink 
                    href="https://pida-ai.com" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    sx={{ 
                      color: 'inherit', 
                      textDecoration: 'underline', 
                      textDecorationStyle: 'dotted', 
                      textUnderlineOffset: '3px', 
                      fontWeight: 'bold',
                      transition: '0.2s',
                      '&:hover': { color: 'primary.main', textDecorationStyle: 'solid' } 
                    }}
                  >
                    PIDA
                  </MuiLink>
                  {' '}para analizar casos complejos en segundos, permitiendo a nuestros abogados brindar respuestas precisas y ágiles.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ mb: 8 }} />

        {/* --- TARJETAS DE NAVEGACIÓN PRINCIPALES --- */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" color="primary" fontWeight="bold" gutterBottom>
            Nuestros Servicios
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Seleccione la herramienta que mejor se adapte a su necesidad actual.
          </Typography>
        </Box>

        <Grid container spacing={5}>
          {/* Tarjeta Repositorio */}
          <Grid item xs={12} md={6}>
            <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.3s ease, box-shadow 0.3s ease', '&:hover': { transform: 'translateY(-8px)', boxShadow: 10 }, borderRadius: 2, borderTop: '6px solid #003399' }}>
              <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: { xs: 4, md: 6 } }}>
                <GavelIcon sx={{ fontSize: 70, color: 'primary.main', mb: 3 }} />
                <Typography variant="h4" fontWeight="bold" gutterBottom color="primary.main">
                  Repositorio Documental
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
                  Explora nuestra biblioteca pública y constantemente actualizada. Contiene la legislación nacional vigente, los tratados internacionales de la OIT y la jurisprudencia más relevante de los tribunales de Costa Rica.
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 6 }}>
                <Button component={RouterLink} to="/repositorio" variant="outlined" color="primary" size="large" sx={{ fontWeight: 'bold', px: 5, py: 1.5 }}>
                  Entrar al Buscador Legal
                </Button>
              </CardActions>
            </Card>
          </Grid>

          {/* Tarjeta Denuncia / Orientación */}
          <Grid item xs={12} md={6}>
            <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.3s ease, box-shadow 0.3s ease', '&:hover': { transform: 'translateY(-8px)', boxShadow: 10 }, borderRadius: 2, borderTop: '6px solid #FFCC00' }}>
              <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: { xs: 4, md: 6 } }}>
                <ForumIcon sx={{ fontSize: 70, color: 'secondary.main', mb: 3 }} />
                <Typography variant="h4" fontWeight="bold" gutterBottom color="primary.main">
                  Orientación y Denuncia
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
                  ¿Han vulnerado sus derechos laborales? Registre su caso de forma segura. Nuestro sistema de Inteligencia Artificial{' '}
                  <MuiLink 
                    href="https://pida-ai.com" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    sx={{ 
                      color: 'inherit', 
                      textDecoration: 'underline', 
                      textDecorationStyle: 'dotted', 
                      textUnderlineOffset: '3px', 
                      fontWeight: 'bold',
                      transition: '0.2s',
                      '&:hover': { color: 'primary.main', textDecorationStyle: 'solid' } 
                    }}
                  >
                    PIDA
                  </MuiLink>
                  {' '}y nuestro equipo de abogados analizarán su situación para enviarle una recomendación legal a su correo.
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 6 }}>
                <Button component={RouterLink} to="/denuncia" variant="contained" color="secondary" size="large" sx={{ color: '#000', fontWeight: 'bold', px: 5, py: 1.5 }}>
                  Iniciar Solicitud de Ayuda
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>

        {/* --- RESPALDO INSTITUCIONAL --- */}
        <Box sx={{ mt: 10, textAlign: 'center', p: 4, bgcolor: '#f8f9fa', borderRadius: 2 }}>
          <Typography variant="body1" color="text.secondary" fontWeight="bold">
            Una iniciativa impulsada por el Instituto Internacional de Responsabilidad Social y Derechos Humanos (IIRESODH)
          </Typography>
        </Box>

      </Container>
    </Box>
  );
}