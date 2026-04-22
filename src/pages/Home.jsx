import { Container, Typography, Paper, Box } from '@mui/material';

export default function Home() {
  return (
    <Container maxWidth="md" sx={{ mt: 5 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
        <Typography variant="h3" color="primary" gutterBottom fontWeight="bold">
          Derechos Laborales
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Explora la legislación laboral y tratados vigentes en Costa Rica.
        </Typography>
        <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
          <Typography variant="body1">
            (Aquí irá el buscador y la lista de documentos que conectaremos con Firebase)
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}