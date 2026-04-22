import { useState } from 'react';
import { 
  Container, Typography, Box, TextField, InputAdornment, 
  Tabs, Tab, Card, CardContent, CardActions, Button, Grid, Chip 
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import PublicIcon from '@mui/icons-material/Public';
import GavelIcon from '@mui/icons-material/Gavel';
import MenuBookIcon from '@mui/icons-material/MenuBook';

// Datos de prueba (Luego vendrán de Firebase Firestore)
const mockDocuments = [
  { id: 1, title: 'Código de Trabajo de Costa Rica', category: 'leyes', year: '1943 (Actualizado)', desc: 'Normativa principal que regula las relaciones laborales.' },
  { id: 2, title: 'Convenio 87 OIT', category: 'tratados', year: '1948', desc: 'Libertad sindical y la protección del derecho de sindicación.' },
  { id: 3, title: 'Resolución N° 2023-001234', category: 'jurisprudencia', year: '2023', desc: 'Sala Segunda: Criterio sobre el cálculo de horas extra.' },
  { id: 4, title: 'El acoso laboral en la región', category: 'articulos', year: '2022', desc: 'Artículo académico sobre la evolución de los derechos laborales.' },
  { id: 5, title: 'Ley de Protección al Trabajador', category: 'leyes', year: '2000', desc: 'Creación del sistema de pensiones complementarias.' },
];

export default function Repositorio() {
  const [tabValue, setTabValue] = useState('todos');
  const [searchQuery, setSearchQuery] = useState('');

  // Manejar cambio de pestañas
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Filtrar documentos por categoría y por texto de búsqueda
  const filteredDocs = mockDocuments.filter(doc => {
    const matchesCategory = tabValue === 'todos' || doc.category === tabValue;
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          doc.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Función para asignar un ícono según la categoría
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
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" color="primary" fontWeight="bold" gutterBottom>
        Repositorio Documental
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Consulta la legislación nacional, tratados internacionales, jurisprudencia y artículos académicos relacionados con los derechos laborales en Costa Rica.
      </Typography>

      {/* Barra de Búsqueda */}
      <Box sx={{ my: 4 }}>
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
          sx={{ bgcolor: 'white', borderRadius: 1 }}
        />
      </Box>

      {/* Pestañas de Categorías */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant="scrollable"
          scrollButtons="auto"
          textColor="primary"
          indicatorColor="secondary" // Usa el amarillo de la UE
        >
          <Tab label="Todos" value="todos" />
          <Tab label="Leyes Nacionales" value="leyes" icon={<PictureAsPdfIcon />} iconPosition="start" />
          <Tab label="Tratados (OIT / UE)" value="tratados" icon={<PublicIcon />} iconPosition="start" />
          <Tab label="Jurisprudencia" value="jurisprudencia" icon={<GavelIcon />} iconPosition="start" />
          <Tab label="Libros y Artículos" value="articulos" icon={<MenuBookIcon />} iconPosition="start" />
        </Tabs>
      </Box>

      {/* Grid de Documentos */}
      <Grid container spacing={3}>
        {filteredDocs.length > 0 ? (
          filteredDocs.map((doc) => (
            <Grid item xs={12} sm={6} md={4} key={doc.id}>
              <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Chip 
                      icon={getCategoryIcon(doc.category)} 
                      label={doc.category.toUpperCase()} 
                      size="small" 
                      color="primary" 
                      variant="outlined" 
                    />
                    <Typography variant="caption" color="text.secondary" fontWeight="bold">
                      {doc.year}
                    </Typography>
                  </Box>
                  <Typography variant="h6" component="div" sx={{ mt: 1, mb: 1, fontWeight: 'bold', lineHeight: 1.2 }}>
                    {doc.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {doc.desc}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" color="secondary" sx={{ fontWeight: 'bold' }}>
                    Ver Documento
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mt: 5 }}>
              No se encontraron documentos que coincidan con tu búsqueda.
            </Typography>
          </Grid>
        )}
      </Grid>
    </Container>
  );
}