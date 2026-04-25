import { useState, useEffect } from 'react';
import { 
  Container, Typography, Box, TextField, InputAdornment, 
  Tabs, Tab, Card, CardContent, CardActions, Button, Grid, Chip, CircularProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import PublicIcon from '@mui/icons-material/Public';
import GavelIcon from '@mui/icons-material/Gavel';
import MenuBookIcon from '@mui/icons-material/MenuBook';

// Importación de Firebase
import { db } from '../services/firebaseConfig';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';

export default function Repositorio() {
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState('todos');
  const [searchQuery, setSearchQuery] = useState('');

  // Conexión real con Firestore
  useEffect(() => {
    const q = query(collection(db, "documentos"), orderBy("fechaCreacion", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDocumentos(docs);
      setLoading(false);
    }, (error) => {
      console.error("Error consultando Firestore:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // FILTRADO CORREGIDO CON CAMPOS EN ESPAÑOL
  const filteredDocs = documentos.filter(doc => {
    const matchesCategory = tabValue === 'todos' || doc.categoria === tabValue;
    const matchesSearch = 
      doc.titulo?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      doc.descripcion?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryIcon = (category) => {
    switch(category) {
      case 'leyes': return <PictureAsPdfIcon fontSize="small" />;
      case 'tratados': return <PublicIcon fontSize="small" />;
      case 'jurisprudencia': return <GavelIcon fontSize="small" />;
      case 'articulos': return <MenuBookIcon fontSize="small" />;
      default: return <PictureAsPdfIcon fontSize="small" />;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 6, mb: 8 }}>
      <Box sx={{ mb: 5 }}>
        <Typography variant="h3" color="primary" fontWeight="900" gutterBottom>
          Repositorio Documental
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Buscador de normativa, jurisprudencia y doctrina sobre Derechos Laborales.
        </Typography>
      </Box>

      <Box sx={{ mb: 6 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar por título, palabra clave o ley..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="primary" />
              </InputAdornment>
            ),
          }}
          sx={{ bgcolor: 'white', borderRadius: 1, boxShadow: 1 }}
        />
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant="scrollable"
          scrollButtons="auto"
          textColor="primary"
          indicatorColor="secondary"
        >
          <Tab label="Todos" value="todos" />
          <Tab label="Leyes Nacionales" value="leyes" icon={<PictureAsPdfIcon />} iconPosition="start" />
          <Tab label="Tratados" value="tratados" icon={<PublicIcon />} iconPosition="start" />
          <Tab label="Jurisprudencia" value="jurisprudencia" icon={<GavelIcon />} iconPosition="start" />
          <Tab label="Libros y Artículos" value="articulos" icon={<MenuBookIcon />} iconPosition="start" />
        </Tabs>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress color="primary" />
        </Box>
      ) : (
        <Grid container spacing={4}>
          {filteredDocs.length > 0 ? (
            filteredDocs.map((doc) => (
              <Grid item xs={12} sm={6} md={4} key={doc.id}>
                <Card elevation={2} sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  borderRadius: 1,
                  transition: '0.2s',
                  '&:hover': { boxShadow: 4 }
                }}>
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Chip 
                        icon={getCategoryIcon(doc.categoria)} 
                        label={doc.categoria?.toUpperCase()} 
                        size="small" 
                        color="primary" 
                        variant="outlined" 
                        sx={{ fontWeight: 'bold', borderRadius: 1 }}
                      />
                      <Typography variant="caption" color="text.secondary" fontWeight="bold">
                        {doc.anio}
                      </Typography>
                    </Box>
                    <Typography variant="h6" component="div" sx={{ mb: 1, fontWeight: 'bold' }}>
                      {doc.titulo}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {doc.descripcion}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button 
                      fullWidth
                      variant="contained"
                      color="primary"
                      disableElevation
                      href={doc.fileUrl} 
                      target="_blank" 
                      sx={{ fontWeight: 'bold', borderRadius: 1 }}
                    >
                      VER DOCUMENTO
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Box sx={{ textAlign: 'center', py: 10, bgcolor: '#f9f9f9', borderRadius: 1 }}>
                <Typography variant="h6" color="text.secondary">
                  No se encontraron documentos en esta categoría.
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      )}
    </Container>
  );
}