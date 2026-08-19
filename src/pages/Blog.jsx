import { useState, useEffect } from 'react';
import { Container, Typography, Box, Card, CardContent, CircularProgress, Divider, Avatar, TextField, InputAdornment } from '@mui/material';
import DOMPurify from 'dompurify';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import SearchIcon from '@mui/icons-material/Search';

// Firebase
import { db } from '../services/firebaseConfig';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const q = query(collection(db, "blog"), orderBy("fechaCreacion", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const articulos = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setPosts(articulos);
      setLoading(false);
    }, (error) => {
      console.error("Error cargando blog:", error);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  const filteredPosts = posts.filter(post => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (post.titulo && post.titulo.toLowerCase().includes(searchLower)) ||
      (post.subtitulo && post.subtitulo.toLowerCase().includes(searchLower)) ||
      (post.autorNombre && post.autorNombre.toLowerCase().includes(searchLower)) ||
      (post.contenido && post.contenido.toLowerCase().includes(searchLower))
    );
  });

  return (
    <Container maxWidth="md" sx={{ mt: 6, mb: 8 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <NewspaperIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
        <Typography variant="h3" color="primary" fontWeight="900" gutterBottom>
          Blog Oficial
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Análisis, opiniones y artículos de interés sobre derechos laborales redactados por nuestros especialistas.
        </Typography>
      </Box>

      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar por título, autor, o contenido..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="primary" />
              </InputAdornment>
            ),
            sx: { bgcolor: 'white', borderRadius: 2 }
          }}
        />
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      ) : posts.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 10, bgcolor: 'white', borderRadius: 2, border: '1px dashed #ccc' }}>
          <Typography color="text.secondary">Aún no hay artículos publicados en el blog.</Typography>
        </Box>
      ) : filteredPosts.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 10, bgcolor: 'white', borderRadius: 2, border: '1px dashed #ccc' }}>
          <Typography color="text.secondary">No se encontraron artículos que coincidan con su búsqueda.</Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {filteredPosts.map((post) => (
            <Card key={post.id} elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
              <CardContent sx={{ p: { xs: 3, md: 5 } }}>
                
                {/* Título y Subtítulo */}
                <Typography variant="h4" fontWeight="bold" color="primary.main" gutterBottom>
                  {post.titulo}
                </Typography>
                {post.subtitulo && (
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic', fontWeight: 400 }}>
                    {post.subtitulo}
                  </Typography>
                )}
                
                {/* Información del Autor */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, mt: 2 }}>
                  <Avatar sx={{ bgcolor: 'secondary.main', color: '#000', fontWeight: 'bold' }}>
                    {post.autorNombre ? post.autorNombre.charAt(0).toUpperCase() : 'O'}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                      Por: {post.autorNombre || 'Redactor Especializado'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {post.fechaCreacion ? post.fechaCreacion.toDate().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Publicación reciente'}
                    </Typography>
                  </Box>
                </Box>
                
                <Divider sx={{ mb: 4 }} />

                {/* Contenido Renderizado con Markdown */}
                <Box sx={{ 
                  fontFamily: 'inherit',
                  '& h1, & h2, & h3': { color: '#081A3D', mt: 4, mb: 2, fontWeight: 'bold' }, 
                  '& h1': { fontSize: '1.8rem', borderBottom: '1px solid #e0e0e0', pb: 1 },
                  '& h2': { fontSize: '1.5rem' },
                  '& h3': { fontSize: '1.25rem' },
                  '& p': { lineHeight: 1.8, mb: 2, color: '#333', fontSize: '1.05rem' },
                  '& strong': { color: '#000' },
                  '& em, & i': { fontStyle: 'italic', color: '#555' },
                  '& blockquote': { borderLeft: '4px solid #FFCC00', bgcolor: '#f9f9f9', m: 0, p: 2, fontStyle: 'italic', color: '#555' },
                  '& ul, & ol': { pl: 4, mb: 2, color: '#333', fontSize: '1.05rem' },
                  '& li': { mb: 1, lineHeight: 1.6 },
                  '& a': { color: '#081A3D', textDecoration: 'none', fontWeight: 'bold' },
                  '& code': {
                    fontFamily: 'monospace',
                    bgcolor: '#f4f6f8',
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    color: '#d32f2f',
                    fontSize: '0.95rem'
                  },
                  '& pre': {
                    bgcolor: '#f4f6f8',
                    p: 2,
                    borderRadius: 2,
                    overflowX: 'auto',
                    border: '1px solid #e0e0e0',
                    '& code': {
                      bgcolor: 'transparent',
                      color: 'inherit',
                      p: 0,
                      fontSize: '0.9rem'
                    }
                  }
                }}>
                  <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.contenido) }} />
                </Box>

              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Container>
  );
}