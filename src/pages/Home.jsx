import { Container, Typography, Paper, Box, Grid, Button, Card, CardContent, CardActions } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import GavelIcon from '@mui/icons-material/Gavel';
import ForumIcon from '@mui/icons-material/Forum';

export default function Home() {
  return (
    <Container maxWidth="lg" sx={{ mt: 5, mb: 5 }}>
      
      {/* --- SECCIÓN HERO (Bienvenida) --- */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: { xs: 4, md: 8 }, 
          textAlign: 'center', 
          borderRadius: 2, 
          bgcolor: 'primary.main', // Azul de la UE
          color: 'white' 
        }}
      >
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold" sx={{ fontSize: { xs: '2rem', md: '3rem' } }}>
          Observatorio de Derechos Laborales
        </Typography>
        <Typography variant="h6" paragraph sx={{ maxWidth: 800, mx: 'auto', fontWeight: 'light', opacity: 0.9 }}>
          Una plataforma integral para la protección, orientación y análisis de las condiciones laborales en Costa Rica.
        </Typography>
        <Box sx={{ mt: 3, display: 'inline-block', border: '1px solid rgba(255,255,255,0.3)', p: 1.5, borderRadius: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
            Iniciativa desarrollada con el apoyo de la Unión Europea
          </Typography>
        </Box>
      </Paper>

      {/* --- TARJETAS DE NAVEGACIÓN (Llamados a la acción) --- */}
      <Grid container spacing={4} sx={{ mt: 2 }}>
        
        {/* Tarjeta Repositorio */}
        <Grid item xs={12} md={6}>
          <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: '0.3s', '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 } }}>
            <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 4 }}>
              <GavelIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Repositorio Documental
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Explora nuestra biblioteca actualizada con la legislación nacional, los tratados internacionales de la OIT y la jurisprudencia relevante.
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'center', pb: 4 }}>
              <Button component={RouterLink} to="/repositorio" variant="outlined" color="primary" size="large" sx={{ fontWeight: 'bold', px: 4 }}>
                Ir al Buscador Legal
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Tarjeta Denuncia / Orientación */}
        <Grid item xs={12} md={6}>
          <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: '0.3s', '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 } }}>
            <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 4 }}>
              <ForumIcon sx={{ fontSize: 60, color: 'secondary.main', mb: 2 }} />
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Orientación y Denuncia
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Consulta tu situación con nuestro asistente de Inteligencia Artificial y registra formalmente una vulneración a tus derechos laborales.
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'center', pb: 4 }}>
              <Button component={RouterLink} to="/denuncia" variant="contained" color="secondary" size="large" sx={{ color: '#000', fontWeight: 'bold', px: 4 }}>
                Recibir Orientación
              </Button>
            </CardActions>
          </Card>
        </Grid>

      </Grid>

    </Container>
  );
}