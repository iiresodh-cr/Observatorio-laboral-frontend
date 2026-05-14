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
import NewspaperIcon from '@mui/icons-material/Newspaper'; // NUEVO: Icono para el blog

// Firebase Services
import { db } from '../services/firebaseConfig';
import { collection, query, where, getCountFromServer } from 'firebase/firestore';

export default function Home() {
  // NUEVO: Se agregó 'blogs' al estado
  const [stats, setStats] = useState({ docs: 0, cases: 0, blogs: 0, loading: true });

  useEffect(() => {
    async function fetchStats() {
      try {
        // 1. Contar documentos
        const docsSnap = await getCountFromServer(collection(db, "documentos"));
        
        // 2. Contar casos completados
        const casesQuery = query(collection(db, "denuncias"), where("estado", "==", "completada"));
        const casesSnap = await getCountFromServer(casesQuery);

        // 3. NUEVO: Contar artículos del blog
        const blogsSnap = await getCountFromServer(collection(db, "blog"));

        setStats({
          docs: docsSnap.data().count,
          cases: casesSnap.data().count,
          blogs: blogsSnap.data().count,
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
      
      {/* --- SECCIÓN HERO --- */}
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

      {/* --- SECCIÓN: CONTADORES DINÁMICOS --- */}
      <Container maxWidth="lg" sx={{ mt: 10, mb: 8 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'center', alignItems: 'stretch', gap: 4 }}>
          
          <Paper elevation={0} sx={{ flex: 1, p: 4, textAlign: 'center', bgcolor: '#f0f4ff', borderRadius: 4, border: '1px solid #e0eaff' }}>
            <GavelIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
            {stats.loading ? <CircularProgress size={30} sx={{ display: 'block', mx: 'auto', my: 1 }} /> : (
              <Typography variant="h3" fontWeight="900" color="primary">{stats.docs}</Typography>
            )}
            <Typography variant="subtitle1" fontWeight="bold" color="text.secondary">Documentos Legales</Typography>
            <Typography variant="caption" color="text.disabled">Leyes, Tratados y Jurisprudencia</Typography>
          </Paper>
          
          <Paper elevation={0} sx={{ flex: 1, p: 4, textAlign: 'center', bgcolor: '#fff9e6', borderRadius: 4, border: '1px solid #ffecb3' }}>
            <SupportAgentIcon sx={{ fontSize: 40, mb: 1, color: '#b28900' }} />
            {stats.loading ? <CircularProgress size={30} sx={{ display: 'block', mx: 'auto', my: 1, color: '#b28900' }} /> : (
              <Typography variant="h3" fontWeight="900" sx={{ color: '#b28900' }}>{stats.cases}</Typography>
            )}
            <Typography variant="subtitle1" fontWeight="bold" color="text.secondary">Asesorías Finalizadas</Typography>
            <Typography variant="caption" color="text.disabled">Casos con orientación brindada</Typography>
          </Paper>

          {/* NUEVO: Contador del Blog */}
          <Paper elevation={0} sx={{ flex: 1, p: 4, textAlign: 'center', bgcolor: '#e8f5e9', borderRadius: 4, border: '1px solid #c8e6c9' }}>
            <NewspaperIcon sx={{ fontSize: 40, mb: 1, color: '#2e7d32' }} />
            {stats.loading ? <CircularProgress size={30} sx={{ display: 'block', mx: 'auto', my: 1, color: '#2e7d32' }} /> : (
              <Typography variant="h3" fontWeight="900" sx={{ color: '#2e7d32' }}>{stats.blogs}</Typography>
            )}
            <Typography variant="subtitle1" fontWeight="bold" color="text.secondary">Artículos Publicados</Typography>
            <Typography variant="caption" color="text.disabled">Análisis y noticias del sector</Typography>
          </Paper>

        </Box>
      </Container>

      <Container maxWidth="lg" sx={{ mt: 2 }}>
        
        {/* --- SECCIÓN EXPLICATIVA --- */}
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
                      color: 'inherit', textDecoration: 'underline', textDecorationStyle: 'dotted', 
                      textUnderlineOffset: '3px', fontWeight: 'bold', transition: '0.2s',
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
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h4" color="primary" fontWeight="bold" gutterBottom>
            Nuestros Servicios
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Seleccione la herramienta que mejor se adapte a su necesidad actual.
          </Typography>
        </Box>

        {/* NUEVO: Grid de 3 columnas (md={4}) */}
        <Grid container spacing={4}>
          
          {/* Tarjeta Repositorio */}
          <Grid item xs={12} md={4}>
            <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.3s ease, box-shadow 0.3s ease', '&:hover': { transform: 'translateY(-8px)', boxShadow: 10 }, borderRadius: 2, borderTop: '6px solid #003399' }}>
              <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: { xs: 3, md: 4 } }}>
                <GavelIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" fontWeight="bold" gutterBottom color="primary.main">
                  Repositorio Documental
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Explora nuestra biblioteca con la legislación nacional vigente, tratados de la OIT y la jurisprudencia más relevante de Costa Rica.
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 4 }}>
                <Button component={RouterLink} to="/repositorio" variant="outlined" color="primary" sx={{ fontWeight: 'bold', px: 4 }}>
                  Buscador Legal
                </Button>
              </CardActions>
            </Card>
          </Grid>

          {/* Tarjeta Denuncia */}
          <Grid item xs={12} md={4}>
            <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.3s ease, box-shadow 0.3s ease', '&:hover': { transform: 'translateY(-8px)', boxShadow: 10 }, borderRadius: 2, borderTop: '6px solid #FFCC00' }}>
              <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: { xs: 3, md: 4 } }}>
                <ForumIcon sx={{ fontSize: 60, color: 'secondary.main', mb: 2 }} />
                <Typography variant="h5" fontWeight="bold" gutterBottom color="primary.main">
                  Orientación Legal
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Registre su caso de forma segura. Nuestro equipo y PIDA analizarán su situación para enviarle una recomendación a su correo.
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 4 }}>
                <Button component={RouterLink} to="/denuncia" variant="contained" color="secondary" sx={{ color: '#000', fontWeight: 'bold', px: 4 }}>
                  Solicitar Ayuda
                </Button>
              </CardActions>
            </Card>
          </Grid>

          {/* NUEVO: Tarjeta Blog */}
          <Grid item xs={12} md={4}>
            <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.3s ease, box-shadow 0.3s ease', '&:hover': { transform: 'translateY(-8px)', boxShadow: 10 }, borderRadius: 2, borderTop: '6px solid #4caf50' }}>
              <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: { xs: 3, md: 4 } }}>
                <NewspaperIcon sx={{ fontSize: 60, color: '#4caf50', mb: 2 }} />
                <Typography variant="h5" fontWeight="bold" gutterBottom color="primary.main">
                  Blog Oficial
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Manténgase informado con análisis profundos, artículos de opinión y actualizaciones redactadas por nuestros expertos legales.
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 4 }}>
                <Button component={RouterLink} to="/blog" variant="outlined" color="success" sx={{ fontWeight: 'bold', px: 4 }}>
                  Leer Artículos
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