import { useState, useEffect } from 'react';
import { 
  Container, Typography, Box, Grid, Button, 
  Card, CardContent, CardActions, CircularProgress, Link as MuiLink, Chip
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { MessageSquare, Headset, Newspaper } from 'lucide-react';

// Local Assets
import fondoManos from '../assets/fondo-manos.webp';
import balanzaImg from '../assets/balanza.png';
import pidaMascota from '../assets/PIDA-MASCOTA-b.png';

// Firebase Services
import { db } from '../services/firebaseConfig';
import { collection, getCountFromServer, doc, getDoc } from 'firebase/firestore';

export default function Home() {
  const [stats, setStats] = useState({ docs: 0, cases: 0, blogs: 0, loading: true });

  useEffect(() => {
    async function fetchStats() {
      const CACHE_KEY = 'observatorio_home_stats';
      const CACHE_TTL_MS = 5 * 60 * 1000;

      try {
        const cachedString = sessionStorage.getItem(CACHE_KEY);
        if (cachedString) {
          const { data, timestamp } = JSON.parse(cachedString);
          if (Date.now() - timestamp < CACHE_TTL_MS && data.cases > 0) {
            setStats(data);
            return;
          }
        }
      } catch (e) {
        console.warn("Error leyendo caché:", e);
      }

      const [docsRes, statsDocRes, blogsRes] = await Promise.allSettled([
        getCountFromServer(collection(db, "documentos")),
        getDoc(doc(db, "stats", "global_counters")),
        getCountFromServer(collection(db, "blog"))
      ]);

      const docsCount = docsRes.status === 'fulfilled' ? docsRes.value.data().count : null;
      const casesCount = (statsDocRes.status === 'fulfilled' && statsDocRes.value.exists()) 
        ? (statsDocRes.value.data().completadas || 0) 
        : null;
      const blogsCount = blogsRes.status === 'fulfilled' ? blogsRes.value.data().count : null;

      const cachedStats = JSON.parse(sessionStorage.getItem(CACHE_KEY) || '{}')?.data || { docs: 0, cases: 0, blogs: 0 };

      const newStats = {
        docs: docsCount ?? cachedStats.docs,
        cases: casesCount ?? cachedStats.cases, 
        blogs: blogsCount ?? cachedStats.blogs,
        loading: false
      };

      if (docsCount === null && casesCount === null) {
        console.warn("No se pudo obtener datos de Firestore. No se actualizará el caché.");
        return;
      }

      setStats(newStats);

      sessionStorage.setItem(CACHE_KEY, JSON.stringify({
        data: newStats,
        timestamp: Date.now()
      }));
    }
    
    fetchStats();
  }, []);

  return (
    <Box sx={{ width: '100%', pb: 12, bgcolor: '#fbfcfd' }}>
      
      {/* --- SECCIÓN HERO --- */}
      <Box 
        sx={{ 
          background: `linear-gradient(180deg, rgba(8, 26, 61, 0.88) 0%, rgba(4, 15, 38, 0.95) 100%), url(${fondoManos})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: 'white',
          pt: { xs: 10, md: 14 },
          pb: { xs: 12, md: 16 },
          px: 2,
          textAlign: 'center',
          position: 'relative'
        }}
      >
        <Container maxWidth="md">
          <Chip 
            label="• PLATAFORMA DE DERECHOS LABORALES · COSTA RICA" 
            sx={{ 
              bgcolor: 'rgba(255, 255, 255, 0.12)', 
              color: '#d0d8e8', 
              fontWeight: 700, 
              fontSize: '0.75rem',
              letterSpacing: '1px',
              mb: 4,
              px: 1,
              backdropFilter: 'blur(4px)',
              border: '1px solid rgba(255,255,255,0.15)'
            }} 
          />
          <Typography 
            variant="h1" 
            component="h1" 
            gutterBottom 
            sx={{ 
              fontSize: { xs: '3rem', sm: '4rem', md: '5rem' }, 
              fontWeight: 900,
              letterSpacing: '-1.5px',
              lineHeight: 1.1,
              mb: 3,
              textShadow: '0px 2px 4px rgba(0,0,0,0.5)' // Added text shadow for more emphasis
            }}
          >
            Observatorio de<br />Derechos Laborales
          </Typography>
          
          <Typography 
            variant="body1" 
            sx={{ 
              maxWidth: 620, 
              mx: 'auto', 
              fontWeight: 300, 
              color: 'rgba(255, 255, 255, 0.8)', 
              mb: 5, 
              fontSize: { xs: '1rem', md: '1.1rem' },
              lineHeight: 1.6 
            }}
          >
            Plataforma integral e inteligente para la protección, orientación y análisis normativo de las condiciones laborales en Costa Rica.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2.5, justifyContent: 'center', flexWrap: 'wrap', mb: 6 }}>
            <Button 
              component={RouterLink} 
              to="/denuncia" 
              variant="contained" 
              sx={{ 
                bgcolor: '#eab308', 
                color: '#1e293b', 
                fontWeight: 800, 
                px: 3.5, 
                py: 1.4, 
                fontSize: '0.9rem',
                borderRadius: 2,
                boxShadow: 'none',
                textTransform: 'uppercase',
                '&:hover': { bgcolor: '#ca8a04', boxShadow: 'none' } 
              }}
            >
              Solicitar Asesoría Legal
            </Button>
            <Button 
              component={RouterLink} 
              to="/repositorio" 
              variant="outlined" 
              sx={{ 
                color: 'white', 
                borderColor: 'rgba(255, 255, 255, 0.4)', 
                fontWeight: 700, 
                px: 3.5, 
                py: 1.4, 
                fontSize: '0.9rem',
                borderRadius: 2,
                textTransform: 'uppercase',
                backdropFilter: 'blur(2px)',
                '&:hover': { borderColor: 'white', bgcolor: 'rgba(255, 255, 255, 0.08)' } 
              }}
            >
              Consultar Normativa
            </Button>
          </Box>

          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.55)', letterSpacing: '0.8px', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 600 }}>
            Iniciativa oficial desarrollada con el apoyo de la Unión Europea
          </Typography>
        </Container>
      </Box>

      {/* --- SECCIÓN: CONTADORES DINÁMICOS --- */}
      <Container maxWidth="lg" sx={{ mt: -6, position: 'relative', zIndex: 3 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 4, width: '100%' }}>
          
          <Box>
            <Card elevation={0} sx={{ p: 4, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', bgcolor: '#ffffff', borderRadius: 4, border: '1px solid #eef2f6', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
              <Box sx={{ width: 56, height: 56, mb: 2, bgcolor: '#eef4ff', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Box component="img" src={balanzaImg} alt="Balanza" sx={{ width: 40, height: 40, objectFit: 'contain' }} />
              </Box>
              {stats.loading ? <CircularProgress size={32} sx={{ my: 1, color: 'primary.main' }} /> : (
                <Typography variant="h3" fontWeight="900" sx={{ color: 'primary.main', mb: 0.5 }}>{stats.docs}</Typography>
              )}
              <Typography variant="subtitle1" fontWeight="800" sx={{ color: '#0f172a' }}>Documentos Legales</Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>Leyes, Tratados y Jurisprudencia</Typography>
            </Card>
          </Box>

          <Box>
            <Card elevation={0} sx={{ p: 4, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', bgcolor: '#ffffff', borderRadius: 4, border: '1px solid #eef2f6', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
              <Box sx={{ width: 56, height: 56, mb: 2, bgcolor: '#fffbeb', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
                <Headset size={28} />
              </Box>
              {stats.loading ? <CircularProgress size={32} sx={{ my: 1, color: '#b45309' }} /> : (
                <Typography variant="h3" fontWeight="900" sx={{ color: '#b45309', mb: 0.5 }}>{stats.cases}</Typography>
              )}
              <Typography variant="subtitle1" fontWeight="800" sx={{ color: '#0f172a' }}>Asesorías Finalizadas</Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>Casos con orientación brindada</Typography>
            </Card>
          </Box>

          <Box>
            <Card elevation={0} sx={{ p: 4, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', bgcolor: '#ffffff', borderRadius: 4, border: '1px solid #eef2f6', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
              <Box sx={{ width: 56, height: 56, mb: 2, bgcolor: '#ecfdf5', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
                <Newspaper size={28} />
              </Box>
              {stats.loading ? <CircularProgress size={32} sx={{ my: 1, color: '#047857' }} /> : (
                <Typography variant="h3" fontWeight="900" sx={{ color: '#047857', mb: 0.5 }}>{stats.blogs}</Typography>
              )}
              <Typography variant="subtitle1" fontWeight="800" sx={{ color: '#0f172a' }}>Artículos Publicados</Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>Análisis y noticias del sector</Typography>
            </Card>
          </Box>

        </Box>
      </Container>

      {/* --- SECCIÓN EXPLICATIVA (MISIÓN) --- */}
      <Container maxWidth="lg" sx={{ mt: 14 }}>
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: '1.2px', textTransform: 'uppercase', display: 'block', mb: 1 }}>
            NUESTRA MISIÓN
          </Typography>
          <Typography variant="h4" fontWeight="900" sx={{ color: '#0f172a', letterSpacing: '-0.5px', mb: 2 }}>
            ¿Por qué existe este Observatorio?
          </Typography>
          <Typography variant="body2" sx={{ maxWidth: 640, mx: 'auto', color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6 }}>
            Democratizar el acceso a la justicia laboral, con herramientas para el análisis académico y el acompañamiento directo a ciudadanos vulnerados.
          </Typography>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 4, width: '100%' }}>
          
          <Box>
            <Card elevation={0} sx={{ p: 4, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', bgcolor: '#ffffff', borderRadius: 4, border: '1px solid #eef2f6', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
              <Box sx={{ width: 56, height: 56, mb: 3, bgcolor: '#eef4ff', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Box component="img" src={balanzaImg} alt="Balanza" sx={{ width: 40, height: 40, objectFit: 'contain' }} />
              </Box>
              <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: '0.8px', textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
                ACCESO LEGAL
              </Typography>
              <Typography variant="h6" fontWeight="800" sx={{ color: '#0f172a', mb: 1.5 }}>
                Justicia Transparente
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', lineHeight: 1.6, fontSize: '0.88rem' }}>
                Recopilamos y organizamos leyes, reglamentos y jurisprudencia para que trabajadores y empleadores conozcan las reglas claras del entorno laboral.
              </Typography>
            </Card>
          </Box>

          <Box>
            <Card elevation={0} sx={{ p: 4, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', bgcolor: '#ffffff', borderRadius: 4, border: '1px solid #eef2f6', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
              <Box sx={{ width: 56, height: 56, mb: 3, bgcolor: '#eef4ff', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'primary.main' }}>
                <Headset size={28} />
              </Box>
              <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: '0.8px', textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
                ACOMPAÑAMIENTO
              </Typography>
              <Typography variant="h6" fontWeight="800" sx={{ color: '#0f172a', mb: 1.5 }}>
                Orientación Gratuita
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', lineHeight: 1.6, fontSize: '0.88rem' }}>
                Ofrecemos un canal seguro y confidencial para registrar incidentes de acoso, impagos o despidos y recibir una guía estructurada.
              </Typography>
            </Card>
          </Box>

          <Box>
            <Card elevation={0} sx={{ p: 4, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', bgcolor: '#ffffff', borderRadius: 4, border: '1px solid #eef2f6', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
              <Box sx={{ width: 56, height: 56, mb: 3, bgcolor: '#fffbeb', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Box component="img" src={pidaMascota} alt="PIDA Mascota" sx={{ width: 28, height: 28 }} />
              </Box>
              <Typography variant="caption" sx={{ color: '#2563eb', fontWeight: 800, letterSpacing: '0.8px', textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
                INTELIGENCIA ARTIFICIAL
              </Typography>
              <Typography variant="h6" fontWeight="800" sx={{ color: '#0f172a', mb: 1.5 }}>
                Impulsado por IA
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', lineHeight: 1.6, fontSize: '0.88rem' }}>
                Utilizamos la IA especializada{' '}
                <MuiLink href="https://pida-ai.com" target="_blank" rel="noopener noreferrer" sx={{ color: '#0f172a', fontWeight: 700, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                  PIDA
                </MuiLink>{' '}
                para analizar casos complejos en segundos, permitiendo a nuestros abogados brindar respuestas precisas.
              </Typography>
            </Card>
          </Box>

        </Box>
      </Container>

      {/* --- SECCIÓN: NUESTROS SERVICIOS --- */}
      <Container maxWidth="lg" sx={{ mt: 14 }}>
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: '1.2px', textTransform: 'uppercase', display: 'block', mb: 1 }}>
            SERVICIOS
          </Typography>
          <Typography variant="h4" fontWeight="900" sx={{ color: '#0f172a', letterSpacing: '-0.5px', mb: 2 }}>
            Nuestros Servicios
          </Typography>
          <Typography variant="body2" sx={{ maxWidth: 640, mx: 'auto', color: '#64748b', fontSize: '0.95rem' }}>
            Seleccione la herramienta que mejor se adapte a su necesidad actual.
          </Typography>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 4, width: '100%' }}>
          
          {/* Card 1: Repositorio */}
          <Box>
            <Card elevation={0} sx={{ p: 4, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', bgcolor: '#ffffff', borderRadius: 4, border: '1px solid #eef2f6', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
              <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Box sx={{ width: 56, height: 56, mb: 3, bgcolor: '#eef4ff', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Box component="img" src={balanzaImg} alt="Balanza" sx={{ width: 40, height: 40, objectFit: 'contain' }} />
                </Box>
                <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: '0.8px', textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
                  HERRAMIENTA
                </Typography>
                <Typography variant="h6" fontWeight="800" sx={{ color: '#0f172a', mb: 1.5 }}>
                  Repositorio Documental
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b', lineHeight: 1.6, fontSize: '0.88rem' }}>
                  Explora nuestra biblioteca con la legislación nacional vigente, tratados de la OIT y la jurisprudencia más relevante de Costa Rica.
                </Typography>
              </Box>
              <Box sx={{ width: '100%', mt: 3 }}>
                <Button 
                  component={RouterLink} 
                  to="/repositorio" 
                  variant="outlined" 
                  fullWidth
                  sx={{ 
                    color: 'primary.main', 
                    borderColor: '#cbd5e1', 
                    fontWeight: 700, 
                    py: 1, 
                    borderRadius: 2,
                    fontSize: '0.82rem',
                    textTransform: 'uppercase',
                    '&:hover': { borderColor: 'primary.main', bgcolor: 'transparent' }
                  }}
                >
                  Buscador Legal
                </Button>
              </Box>
            </Card>
          </Box>

          {/* Card 2: Orientación Legal */}
          <Box>
            <Card elevation={0} sx={{ p: 4, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', bgcolor: '#ffffff', borderRadius: 4, border: '1px solid #eef2f6', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
              <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Box sx={{ width: 56, height: 56, mb: 3, bgcolor: '#fffbeb', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
                  <MessageSquare size={28} />
                </Box>
                <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: '0.8px', textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
                  SOPORTE
                </Typography>
                <Typography variant="h6" fontWeight="800" sx={{ color: '#0f172a', mb: 1.5 }}>
                  Orientación Legal
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b', lineHeight: 1.6, fontSize: '0.88rem' }}>
                  Registre su caso de forma segura. Nuestro equipo y PIDA analizarán su situación para enviarle una recomendación a su correo.
                </Typography>
              </Box>
              <Box sx={{ width: '100%', mt: 3 }}>
                <Button 
                  component={RouterLink} 
                  to="/denuncia" 
                  variant="contained" 
                  fullWidth
                  sx={{ 
                    bgcolor: '#eab308', 
                    color: '#1e293b', 
                    fontWeight: 800, 
                    py: 1, 
                    borderRadius: 2,
                    fontSize: '0.82rem',
                    boxShadow: 'none',
                    textTransform: 'uppercase',
                    '&:hover': { bgcolor: '#ca8a04', boxShadow: 'none' }
                  }}
                >
                  Solicitar Ayuda
                </Button>
              </Box>
            </Card>
          </Box>

          {/* Card 3: Blog */}
          <Box>
            <Card elevation={0} sx={{ p: 4, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', bgcolor: '#ffffff', borderRadius: 4, border: '1px solid #eef2f6', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
              <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Box sx={{ width: 56, height: 56, mb: 3, bgcolor: '#ecfdf5', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
                  <Newspaper size={28} />
                </Box>
                <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: '0.8px', textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
                  CONTENIDO
                </Typography>
                <Typography variant="h6" fontWeight="800" sx={{ color: '#0f172a', mb: 1.5 }}>
                  Blog Oficial
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b', lineHeight: 1.6, fontSize: '0.88rem' }}>
                  Manténgase informado con análisis profundos, artículos de opinión y actualizaciones redactadas por nuestros expertos legales.
                </Typography>
              </Box>
              <Box sx={{ width: '100%', mt: 3 }}>
                <Button 
                  component={RouterLink} 
                  to="/blog" 
                  variant="outlined" 
                  fullWidth
                  sx={{ 
                    color: 'primary.main', 
                    borderColor: '#cbd5e1', 
                    fontWeight: 700, 
                    py: 1, 
                    borderRadius: 2,
                    fontSize: '0.82rem',
                    textTransform: 'uppercase',
                    '&:hover': { borderColor: 'primary.main', bgcolor: 'transparent' }
                  }}
                >
                  Leer Artículos
                </Button>
              </Box>
            </Card>
          </Box>

        </Box>
      </Container>

      {/* --- RESPALDO INSTITUCIONAL --- */}
      <Container maxWidth="md" sx={{ mt: 10 }}>
        <Box sx={{ textAlign: 'center', p: 3, bgcolor: '#f8fafc', borderRadius: 3, border: '1px solid #e2e8f0' }}>
          <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
            Una iniciativa impulsada por el Instituto Internacional de Responsabilidad Social y Derechos Humanos (IIRESODH)
          </Typography>
        </Box>
      </Container>

    </Box>
  );
}