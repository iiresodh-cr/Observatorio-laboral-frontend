import { useState, useEffect } from 'react';
import { Container, Typography, Box, Card, CardContent, CircularProgress, Divider, Avatar } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import NewspaperIcon from '@mui/icons-material/Newspaper';

// Firebase
import { db } from '../services/firebaseConfig';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

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

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      ) : posts.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 10, bgcolor: 'white', borderRadius: 2, border: '1px dashed #ccc' }}>
          <Typography color="text.secondary">Aún no hay artículos publicados en el blog.</Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {posts.map((post) => (
            <Card key={post.id} elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
              <CardContent sx={{ p: { xs: 3, md: 5 } }}>
                
                {/* Título y Fecha */}
                <Typography variant="h4" fontWeight="bold" color="primary.main" gutterBottom>
                  {post.titulo}
                </Typography>
                
                {/* Información del Autor */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, mt: 2 }}>
                  <Avatar sx={{ bgcolor: 'secondary.main', color: '#000', fontWeight: 'bold' }}>
                    {post.autorNombre ? post.autorNombre.charAt(0).toUpperCase() : 'O'}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {post.autorNombre || 'Redactor Especializado'}
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
                  '& h1, & h2, & h3': { color: '#003399', mt: 4, mb: 2, fontWeight: 'bold' }, 
                  '& h1': { fontSize: '1.8rem', borderBottom: '1px solid #e0e0e0', pb: 1 },
                  '& h2': { fontSize: '1.5rem' },
                  '& h3': { fontSize: '1.25rem' },
                  '& p': { lineHeight: 1.8, mb: 2, color: '#333', fontSize: '1.05rem' },
                  '& strong': { color: '#000' },
                  '& blockquote': { borderLeft: '4px solid #FFCC00', bgcolor: '#f9f9f9', m: 0, p: 2, fontStyle: 'italic', color: '#555' },
                  '& ul, & ol': { pl: 4, mb: 2, color: '#333', fontSize: '1.05rem' },
                  '& li': { mb: 1, lineHeight: 1.6 },
                  '& a': { color: '#003399', textDecoration: 'none', fontWeight: 'bold' }
                }}>
                  <ReactMarkdown>{post.contenido}</ReactMarkdown>
                </Box>

              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Container>
  );
}