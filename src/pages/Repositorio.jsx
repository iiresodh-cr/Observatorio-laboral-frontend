import { useState, useEffect } from 'react';
import { 
  Container, Typography, Box, TextField, InputAdornment, 
  Tabs, Tab, Card, CardContent, CardActions, Button, Grid, Chip, 
  CircularProgress, MenuItem, Pagination, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import {
  Search as SearchIcon,
  PictureAsPdf as PictureAsPdfIcon,
  Public as PublicIcon,
  Gavel as GavelIcon,
  MenuBook as MenuBookIcon,
  Assignment as AssignmentIcon,
  Delete as DeleteIcon,
  WarningAmber as WarningAmberIcon
} from '@mui/icons-material';

// Importación de Firebase
import { db, storage, auth } from '../services/firebaseConfig';
import { collection, query, onSnapshot, orderBy, doc, deleteDoc, getDocs, where } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { onAuthStateChanged } from 'firebase/auth';

const SUPER_ADMIN_EMAIL = 'webmaster@iiresodh.org';

export default function Repositorio() {
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('fecha_desc');
  
  // Paginación
  const [page, setPage] = useState(1);
  const itemsPerPage = 6;

  // Estados de Administración y Eliminación
  const [isAdmin, setIsAdmin] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ open: false, docId: null, fileName: '', titulo: '' });
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionModal, setActionModal] = useState({ open: false, title: '', message: '' });

  // 1. Verificar si el usuario actual es Administrador
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userEmail = currentUser.email.toLowerCase();
        if (userEmail === SUPER_ADMIN_EMAIL.toLowerCase()) {
          setIsAdmin(true);
        } else {
          const q = query(collection(db, "admins"), where("email", "==", userEmail));
          const querySnapshot = await getDocs(q);
          setIsAdmin(!querySnapshot.empty);
        }
      } else {
        setIsAdmin(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  // 2. Traer los documentos en tiempo real
  useEffect(() => {
    const q = query(collection(db, "documentos"), orderBy("fechaCreacion", "desc"));
    const unsubscribeDocs = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setDocumentos(docs);
      setLoading(false);
    }, (error) => {
      console.error(error);
      setLoading(false);
    });
    return () => unsubscribeDocs();
  }, []);

  useEffect(() => { setPage(1); }, [searchQuery, tabValue, sortOrder]);

  // Funciones de Filtrado y Ordenamiento
  const filteredDocs = documentos.filter(doc => {
    const matchesCategory = tabValue === 'todos' || doc.categoria === tabValue;
    const matchesSearch = 
      doc.titulo?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      doc.descripcion?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortedDocs = [...filteredDocs].sort((a, b) => {
    if (sortOrder === 'alfabetico') return (a.titulo || '').localeCompare(b.titulo || '');
    
    // Se convierte a entero para asegurar un ordenamiento matemático correcto por año
    const anioA = parseInt(a.anio) || 0;
    const anioB = parseInt(b.anio) || 0;
    
    return sortOrder === 'fecha_asc' ? anioA - anioB : anioB - anioA;
  });

  const totalPages = Math.ceil(sortedDocs.length / itemsPerPage);
  const paginatedDocs = sortedDocs.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const getCategoryIcon = (category) => {
    switch(category) {
      case 'leyes': return <PictureAsPdfIcon fontSize="small" />;
      case 'reglamentos': return <AssignmentIcon fontSize="small" />;
      case 'tratados': return <PublicIcon fontSize="small" />;
      case 'jurisprudencia': return <GavelIcon fontSize="small" />;
      case 'articulos': return <MenuBookIcon fontSize="small" />;
      default: return <PictureAsPdfIcon fontSize="small" />;
    }
  };

  // FUNCIONES DE ELIMINACIÓN DE DOCUMENTOS
  const handleOpenDelete = (docObj) => {
    setDeleteModal({ open: true, docId: docObj.id, fileName: docObj.fileName, titulo: docObj.titulo });
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    const { docId, fileName } = deleteModal;
    
    try {
      // 1. Borrar PDF físico de Firebase Storage (Si existe el fileName)
      if (fileName) {
        const fileRef = ref(storage, `documentos/${fileName}`);
        await deleteObject(fileRef);
      }
      
      // 2. Borrar registro de la base de datos (Firestore)
      await deleteDoc(doc(db, "documentos", docId));
      
      setDeleteModal({ open: false, docId: null, fileName: '', titulo: '' });
      setActionModal({ open: true, title: 'Documento Eliminado', message: 'El documento fue borrado del servidor exitosamente.' });
    } catch (error) {
      console.error("Error al eliminar:", error);
      setActionModal({ open: true, title: 'Error', message: 'No se pudo eliminar el documento. Intente de nuevo.' });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 6, mb: 8 }}>
      <Box sx={{ mb: 5 }}>
        <Typography variant="h3" color="primary" fontWeight="900" gutterBottom>Repositorio Documental</Typography>
        <Typography variant="h6" color="text.secondary">Normativa y Jurisprudencia Laboral.</Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 6 }}>
        <TextField
          sx={{ flex: 3, bgcolor: 'white', borderRadius: 1, boxShadow: 1 }}
          variant="outlined"
          placeholder="Buscar norma o palabra clave..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon color="primary" /></InputAdornment>) }}
        />
        <TextField
          select
          sx={{ flex: 1, bgcolor: 'white', borderRadius: 1, boxShadow: 1 }}
          variant="outlined"
          label="Ordenar por"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        >
          <MenuItem value="fecha_desc">Año más reciente</MenuItem>
          <MenuItem value="fecha_asc">Año más antiguo</MenuItem>
          <MenuItem value="alfabetico">Orden A-Z</MenuItem>
        </TextField>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs 
          value={tabValue} 
          onChange={(e, v) => setTabValue(v)} 
          variant="scrollable"
          scrollButtons="auto"
          textColor="primary"
          indicatorColor="secondary"
        >
          <Tab label="Todos" value="todos" />
          <Tab label="Leyes" value="leyes" icon={<PictureAsPdfIcon />} iconPosition="start" />
          <Tab label="Reglamentos" value="reglamentos" icon={<AssignmentIcon />} iconPosition="start" />
          <Tab label="Tratados" value="tratados" icon={<PublicIcon />} iconPosition="start" />
          <Tab label="Jurisprudencia" value="jurisprudencia" icon={<GavelIcon />} iconPosition="start" />
          <Tab label="Libros" value="articulos" icon={<MenuBookIcon />} iconPosition="start" />
        </Tabs>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>
      ) : (
        <>
          <Grid container spacing={4}>
            {paginatedDocs.map((doc) => (
              <Grid item xs={12} sm={6} md={4} key={doc.id}>
                <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Chip 
                        icon={getCategoryIcon(doc.categoria)} 
                        label={doc.categoria?.toUpperCase()} 
                        size="small" color="primary" variant="outlined" 
                        sx={{ fontWeight: 'bold' }}
                      />
                      
                      {/* Contenedor del Año y del Botón de Borrar (si es admin) */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="caption" fontWeight="bold">{doc.anio}</Typography>
                        {isAdmin && (
                          <IconButton 
                            size="small" 
                            color="error" 
                            onClick={() => handleOpenDelete(doc)}
                            title="Eliminar documento"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    </Box>

                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>{doc.titulo}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {doc.descripcion}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button fullWidth variant="contained" href={doc.fileUrl} target="_blank" sx={{ fontWeight: 'bold' }}>VER DOCUMENTO</Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
              <Pagination count={totalPages} page={page} onChange={(e, v) => setPage(v)} color="primary" size="large" />
            </Box>
          )}
          
          {paginatedDocs.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 10, width: '100%' }}>
              <Typography color="text.secondary">No se encontraron documentos.</Typography>
            </Box>
          )}
        </>
      )}

      {/* MODAL DE CONFIRMACIÓN DE BORRADO */}
      <Dialog open={deleteModal.open} onClose={() => !isDeleting && setDeleteModal({...deleteModal, open: false})}>
        <DialogTitle sx={{ color: 'error.main', display: 'flex', alignItems: 'center', gap: 1, fontWeight: 'bold' }}>
          <WarningAmberIcon /> Confirmar Eliminación
        </DialogTitle>
        <DialogContent>
          <Typography paragraph>¿Estás seguro de que deseas eliminar el documento <strong>{deleteModal.titulo}</strong>?</Typography>
          <Typography variant="body2" color="text.secondary">
            Esta acción borrará el archivo de forma permanente de la base de datos y del servidor. No se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteModal({...deleteModal, open: false})} disabled={isDeleting} color="inherit">
            Cancelar
          </Button>
          <Button onClick={handleConfirmDelete} variant="contained" color="error" disabled={isDeleting} disableElevation>
            {isDeleting ? <CircularProgress size={24} color="inherit" /> : 'Eliminar Permanentemente'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* MODAL DE MENSAJES DE ÉXITO/ERROR */}
      <Dialog open={actionModal.open} onClose={() => setActionModal({...actionModal, open: false})}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>{actionModal.title}</DialogTitle>
        <DialogContent><Typography>{actionModal.message}</Typography></DialogContent>
        <DialogActions sx={{ p: 2 }}><Button onClick={() => setActionModal({...actionModal, open: false})} variant="contained">Aceptar</Button></DialogActions>
      </Dialog>

    </Container>
  );
}