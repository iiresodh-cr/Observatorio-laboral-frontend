import { useState, useEffect } from 'react';
import { 
  Container, Paper, Box, Typography, TextField, Button, 
  Tabs, Tab, MenuItem, Grid, Card, CardContent, Stack,
  Dialog, DialogTitle, DialogContent, DialogActions, LinearProgress,
  Alert, List, ListItem, ListItemText, IconButton, Divider, CircularProgress, Chip,
  ToggleButton, ToggleButtonGroup
} from '@mui/material';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { 
  CloudUpload as CloudUploadIcon, PictureAsPdf as PictureAsPdfIcon,
  InsertChart as InsertChartIcon, Group as GroupIcon, Logout as LogoutIcon,
  Lock as LockIcon, PersonAdd as PersonAddIcon, Delete as DeleteIcon,
  Google as GoogleIcon, AssignmentLate as AssignmentLateIcon,
  AutoAwesome as AutoAwesomeIcon, Email as EmailIcon, CheckCircle as CheckCircleIcon,
  History as HistoryIcon, PendingActions as PendingActionsIcon,
  Assessment as AssessmentIcon, Newspaper as NewspaperIcon, Edit as EditIcon
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';

// Firebase Services
import { db, storage, auth, googleProvider } from '../services/firebaseConfig';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp, getDocs, query, where, deleteDoc, doc, setDoc, onSnapshot, orderBy, updateDoc } from 'firebase/firestore';
import { signInWithPopup, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';

const SUPER_ADMIN_EMAIL = 'webmaster@iiresodh.org';

const categorias = [
  { value: 'leyes', label: 'Leyes' }, { value: 'reglamentos', label: 'Reglamentos' },
  { value: 'tratados', label: 'Tratados Internacionales' }, { value: 'jurisprudencia', label: 'Jurisprudencia' },
  { value: 'articulos', label: 'Libros y Artículos' }
];

const COLORS = ['#003399', '#FFCC00', '#1565c0', '#ffd54f', '#001f5c', '#ffb300', '#90caf9'];
const BACKEND_URL = 'https://observatorio-backend-86857815411.us-central1.run.app';

export default function Admin() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthor, setIsAuthor] = useState(false); // NUEVO: Estado para Rol de Autor
  const [loadingAuth, setLoadingAuth] = useState(true);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [tabValue, setTabValue] = useState('informes'); // Refactorizado a string para seguridad de roles
  
  // Estados de Administración
  const [adminList, setAdminList] = useState([]);
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');

  // Estados de Autores
  const [autorList, setAutorList] = useState([]);
  const [newAutorName, setNewAutorName] = useState('');
  const [newAutorEmail, setNewAutorEmail] = useState('');
  
  // Carga Documentos
  const [uploading, setUploading] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [progress, setProgress] = useState(0);
  const [docData, setDocData] = useState({ titulo: '', categoria: '', anio: '', descripcion: '' });
  const [archivo, setArchivo] = useState(null);
  const [actionModal, setActionModal] = useState({ open: false, title: '', message: '' });

  // Asesorías
  const [listaDenuncias, setListaDenuncias] = useState([]);
  const [selectedDenuncia, setSelectedDenuncia] = useState(null);
  const [draftReview, setDraftReview] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [subTabDenuncias, setSubTabDenuncias] = useState('pendiente');

  // Informes IA
  const [aiReport, setAiReport] = useState('');
  const [generatingReport, setGeneratingReport] = useState(false);

  // Artículos de Blog
  const [blogData, setBlogData] = useState({ titulo: '', contenido: '' });
  const [blogPosts, setBlogPosts] = useState([]);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userEmail = currentUser.email.toLowerCase();
        let adminAcc = false;
        let authorAcc = false;

        if (userEmail === SUPER_ADMIN_EMAIL.toLowerCase()) {
          adminAcc = true; authorAcc = true;
        } else {
          const qAdmin = query(collection(db, "admins"), where("email", "==", userEmail));
          const snapAdmin = await getDocs(qAdmin);
          if (!snapAdmin.empty) { adminAcc = true; authorAcc = true; }

          const qAuthor = query(collection(db, "autores"), where("email", "==", userEmail));
          const snapAuthor = await getDocs(qAuthor);
          if (!snapAuthor.empty) { authorAcc = true; }
        }

        if (adminAcc || authorAcc) {
          setIsAdmin(adminAcc);
          setIsAuthor(authorAcc);
          setUser(currentUser);
          // Si solo es autor y no admin, forzar pestaña de blog
          if (!adminAcc && authorAcc) {
            setTabValue('blog');
          } else {
            setTabValue('informes');
          }
        } else {
          await signOut(auth);
          setLoginError(`El acceso para ${currentUser.email} no está autorizado.`);
        }
      } else { 
        setUser(null); setIsAdmin(false); setIsAuthor(false); 
      }
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      const unsubAdmins = onSnapshot(collection(db, "admins"), (snapshot) => {
        setAdminList(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      });
      const unsubAutores = onSnapshot(collection(db, "autores"), (snapshot) => {
        setAutorList(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      });
      const unsubDenuncias = onSnapshot(query(collection(db, "denuncias"), orderBy("fechaRegistro", "desc")), (snapshot) => {
        setListaDenuncias(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      });
      return () => { unsubAdmins(); unsubAutores(); unsubDenuncias(); };
    } else if (isAuthor) {
      // Si solo es autor, solo necesita ver los posts (y opcionalmente la lista de autores)
      const unsubAutores = onSnapshot(collection(db, "autores"), (snapshot) => {
        setAutorList(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      });
      return () => { unsubAutores(); };
    }
  }, [isAdmin, isAuthor]);

  useEffect(() => {
    if (isAdmin || isAuthor) {
      const unsubBlog = onSnapshot(query(collection(db, "blog"), orderBy("fechaCreacion", "desc")), (snapshot) => {
        setBlogPosts(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      });
      return () => unsubBlog();
    }
  }, [isAdmin, isAuthor]);

  const handleLoginGoogle = async () => { setLoginError(''); try { await signInWithPopup(auth, googleProvider); } catch (e) { setLoginError('Fallo en la conexión.'); } };
  const handleLoginManual = async (e) => { e.preventDefault(); setLoginError(''); try { await signInWithEmailAndPassword(auth, email, password); } catch (e) { setLoginError('Credenciales incorrectas.'); } };
  const handleLogout = () => signOut(auth);

  const handleAddAdmin = async () => {
    if (!newAdminEmail || !newAdminName) {
      setActionModal({ open: true, title: 'Campos incompletos', message: 'Debe ingresar nombre y correo del administrador.' });
      return;
    }
    try {
      await setDoc(doc(db, "admins", newAdminEmail.toLowerCase().trim()), { 
        nombre: newAdminName.trim(), email: newAdminEmail.toLowerCase().trim(), addedBy: user.email, date: serverTimestamp() 
      });
      setNewAdminName(''); setNewAdminEmail(''); 
      setActionModal({ open: true, title: 'Administrador Agregado', message: `Nuevo administrador registrado exitosamente.` });
    } catch (e) {}
  };
  
  const handleAddAutor = async () => {
    if (!newAutorEmail || !newAutorName) {
      setActionModal({ open: true, title: 'Campos incompletos', message: 'Debe ingresar nombre y correo del redactor.' });
      return;
    }
    try {
      await setDoc(doc(db, "autores", newAutorEmail.toLowerCase().trim()), { 
        nombre: newAutorName.trim(), email: newAutorEmail.toLowerCase().trim(), addedBy: user.email, date: serverTimestamp() 
      });
      setNewAutorName(''); setNewAutorEmail(''); 
      setActionModal({ open: true, title: 'Redactor Agregado', message: `Nuevo autor de blog registrado exitosamente.` });
    } catch (e) {}
  };

  const handleRemoveAdmin = async (id) => { try { await deleteDoc(doc(db, "admins", id)); } catch (e) {} };
  const handleRemoveAutor = async (id) => { try { await deleteDoc(doc(db, "autores", id)); } catch (e) {} };

  const handleDeleteDenuncia = async (id) => {
    if (window.confirm("¿Está seguro de borrar esta denuncia permanentemente?")) {
      try {
        await deleteDoc(doc(db, "denuncias", id));
        setActionModal({ open: true, title: 'Eliminado', message: 'El registro ha sido borrado.' });
      } catch (e) {
        setActionModal({ open: true, title: 'Acceso Denegado', message: 'Solo el Superadmin puede borrar denuncias.' });
      }
    }
  };

  const handleFormChange = (e) => setDocData({ ...docData, [e.target.name]: e.target.value });
  
  const handleFileChange = async (e) => { 
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setArchivo(selectedFile); setLoadingAI(true);
      const formData = new FormData(); formData.append('file', selectedFile);
      try {
        const response = await fetch(`${BACKEND_URL}/extract-metadata`, { method: 'POST', body: formData });
        if (response.ok) {
          const data = await response.json();
          setDocData(prevData => ({ titulo: data.titulo || prevData.titulo, categoria: data.categoria || prevData.categoria, anio: data.anio || prevData.anio, descripcion: data.descripcion || prevData.descripcion }));
        } else {
          setActionModal({ open: true, title: 'IA falló', message: 'No se pudo analizar. Llena manualmente.' });
        }
      } catch (error) { 
        setActionModal({ open: true, title: 'IA falló', message: 'Error de red. Llena manualmente.' }); 
      } finally { setLoadingAI(false); }
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault(); if (!archivo) return; setUploading(true);
    try {
      const nombreArchivo = `${Date.now()}_${archivo.name}`;
      const storageRef = ref(storage, `documentos/${nombreArchivo}`);
      const uploadTask = uploadBytesResumable(storageRef, archivo);
      uploadTask.on('state_changed', 
        (snapshot) => setProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100),
        (error) => { setUploading(false); },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          await addDoc(collection(db, "documentos"), { ...docData, fileUrl: downloadURL, fileName: nombreArchivo, fechaCreacion: serverTimestamp(), subidoPor: user.email });
          setUploading(false); setProgress(0); setActionModal({ open: true, title: 'Éxito', message: 'Cargado.' });
          setDocData({ titulo: '', categoria: '', anio: '', descripcion: '' }); setArchivo(null);
        }
      );
    } catch (error) { setUploading(false); }
  };

  const handleOpenReview = (denuncia) => {
    setSelectedDenuncia(denuncia);
    if (denuncia.estado === 'completada') {
      setDraftReview(denuncia.respuestaFinal || 'Sin respuesta guardada.');
    } else {
      setDraftReview(denuncia.borradorAsesoria || 'La IA no pudo generar un borrador para este caso.');
    }
  };

  const handleSendAdvice = async () => {
    if (!selectedDenuncia) return; setIsSendingEmail(true);
    try {
      const response = await fetch(`${BACKEND_URL}/send-email`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to_email: selectedDenuncia.email, subject: "Observatorio Laboral: Orientación sobre su caso", body: draftReview })
      });
      if (!response.ok) throw new Error(`Error`);

      await updateDoc(doc(db, "denuncias", selectedDenuncia.id), {
        estado: 'completada', respuestaFinal: draftReview, respondidoPor: user.email, fechaRespuesta: serverTimestamp()
      });
      setActionModal({ open: true, title: 'Asesoría Enviada', message: 'El ciudadano ha recibido el correo exitosamente.' });
      setSelectedDenuncia(null);
    } catch (error) {
      setActionModal({ open: true, title: 'Error', message: 'No se pudo enviar el correo.' });
    } finally { setIsSendingEmail(false); }
  };

  const handlePublishBlog = async (e) => {
    e.preventDefault();
    if (!blogData.titulo || !blogData.contenido) return;
    setPublishing(true);
    
    // Obtener el nombre del autor logueado para mostrarlo en el blog
    const currentAutor = autorList.find(a => a.email === user.email) || adminList.find(a => a.email === user.email);
    const nombreAutor = currentAutor ? currentAutor.nombre : user.email;

    try {
      await addDoc(collection(db, "blog"), {
        titulo: blogData.titulo,
        contenido: blogData.contenido,
        autorEmail: user.email,
        autorNombre: nombreAutor,
        fechaCreacion: serverTimestamp()
      });
      setBlogData({ titulo: '', contenido: '' });
      setActionModal({ open: true, title: 'Publicado', message: 'El artículo se ha publicado en el blog exitosamente.' });
    } catch (error) {
      setActionModal({ open: true, title: 'Error', message: 'No se pudo publicar el artículo.' });
    } finally {
      setPublishing(false);
    }
  };

  const handleDeletePost = async (id) => {
    if(window.confirm("¿Borrar este artículo del blog?")) {
      try { await deleteDoc(doc(db, "blog", id)); } catch(e) {}
    }
  };

  const totalDenuncias = listaDenuncias.length;
  const pendientes = listaDenuncias.filter(d => d.estado === 'pendiente').length;
  const completadas = listaDenuncias.filter(d => d.estado === 'completada').length;

  const tipoCounts = {};
  listaDenuncias.forEach(d => { if (d.tipoDenuncia) tipoCounts[d.tipoDenuncia] = (tipoCounts[d.tipoDenuncia] || 0) + 1; });
  const chartData = Object.keys(tipoCounts).map((key) => ({ nombre: key, casos: tipoCounts[key] })).sort((a, b) => b.casos - a.casos);

  const handleGeneratePidaReport = async () => {
    setGeneratingReport(true); setAiReport('');
    try {
      const response = await fetch(`${BACKEND_URL}/generate-report`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ total_denuncias: totalDenuncias, pendientes: pendientes, completadas: completadas, desglose_tipos: tipoCounts })
      });
      if (response.ok) { const data = await response.json(); setAiReport(data.report); } 
      else { setActionModal({ open: true, title: 'Error PIDA', message: 'No se pudo generar el informe analítico.' }); }
    } catch (error) { setActionModal({ open: true, title: 'Error de Conexión', message: 'PIDA no responde.' }); } 
    finally { setGeneratingReport(false); }
  };

  if (loadingAuth) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><LinearProgress sx={{ width: '40%' }} /></Box>;

  if (!user || (!isAdmin && !isAuthor)) {
    return (
      <Container maxWidth="xs" sx={{ mt: 8 }}>
        <Paper elevation={4} sx={{ p: 4, borderRadius: 2, textAlign: 'center' }}>
          <LockIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
          <Typography variant="h5" fontWeight="bold">Administración</Typography>
          {loginError && <Alert severity="error" sx={{ mb: 2, fontSize: '0.8rem' }}>{loginError}</Alert>}
          <Button fullWidth variant="contained" startIcon={<GoogleIcon />} onClick={handleLoginGoogle} sx={{ mb: 3, py: 1.2, fontWeight: 'bold' }}>Entrar con Google</Button>
          <Divider sx={{ mb: 3 }}><Typography variant="caption" color="text.disabled">O CORREO EXTERNO</Typography></Divider>
          <Box component="form" onSubmit={handleLoginManual}>
            <TextField fullWidth size="small" label="Email" margin="dense" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <TextField fullWidth size="small" label="Contraseña" type="password" margin="dense" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <Button fullWidth type="submit" variant="outlined" sx={{ mt: 2, fontWeight: 'bold' }}>Acceder</Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" color="primary" fontWeight="bold">{isAdmin ? 'Panel Administrativo' : 'Panel de Redacción'}</Typography>
          <Typography variant="body2" color="text.secondary">Sesión: <strong>{user.email}</strong> {isAuthor && !isAdmin && '(Redactor)'}</Typography>
        </Box>
        <Button variant="outlined" color="error" startIcon={<LogoutIcon />} onClick={handleLogout}>Cerrar Sesión</Button>
      </Box>

      <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#f4f6f8' }}>
          <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} indicatorColor="secondary" textColor="primary" variant="scrollable" scrollButtons="auto">
            {isAdmin && <Tab value="informes" icon={<AssessmentIcon />} label="Informes y Gráficos" />}
            {isAdmin && <Tab value="carga" icon={<CloudUploadIcon />} label="Carga Manual" />}
            {isAdmin && <Tab value="asesorias" icon={<EmailIcon />} label="Asesorías" />}
            {isAdmin && <Tab value="admins" icon={<GroupIcon />} label="Administradores" />}
            {(isAdmin || isAuthor) && <Tab value="blog" icon={<NewspaperIcon />} label="Redacción Blog" />}
          </Tabs>
        </Box>

        {tabValue === 'informes' && isAdmin && (
          <Box sx={{ p: 4, bgcolor: '#fafafa' }}>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={4}>
                <Card sx={{ borderTop: '4px solid #003399', height: '100%' }}><CardContent sx={{ textAlign: 'center' }}><Typography variant="subtitle2" color="text.secondary" fontWeight="bold">CASOS TOTALES</Typography><Typography variant="h3" fontWeight="bold" color="primary">{totalDenuncias}</Typography></CardContent></Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card sx={{ borderTop: '4px solid #f44336', height: '100%' }}><CardContent sx={{ textAlign: 'center' }}><Typography variant="subtitle2" color="text.secondary" fontWeight="bold">PENDIENTES DE ATENCIÓN</Typography><Typography variant="h3" fontWeight="bold" color="error">{pendientes}</Typography></CardContent></Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card sx={{ borderTop: '4px solid #4caf50', height: '100%' }}><CardContent sx={{ textAlign: 'center' }}><Typography variant="subtitle2" color="text.secondary" fontWeight="bold">ASESORÍAS FINALIZADAS</Typography><Typography variant="h3" fontWeight="bold" color="success.main">{completadas}</Typography></CardContent></Card>
              </Grid>
            </Grid>

            <Typography variant="h6" color="primary" fontWeight="bold" sx={{ mb: 2 }}>Gráfico: Casos por tipo de vulneración</Typography>
            <Paper elevation={1} sx={{ p: 3, mb: 4, height: 350, bgcolor: 'white' }}>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="nombre" angle={-15} textAnchor="end" height={80} interval={0} tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip cursor={{ fill: '#f5f5f5' }} />
                    <Bar dataKey="casos" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Box display="flex" justifyContent="center" alignItems="center" height="100%"><Typography color="text.secondary">No hay datos suficientes para graficar.</Typography></Box>
              )}
            </Paper>

            <Box sx={{ mt: 6, p: 4, border: '1px solid #e0e0e0', borderRadius: 2, bgcolor: 'white' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                  <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><AutoAwesomeIcon color="secondary" /> Informe Ejecutivo</Typography>
                  <Typography variant="body2" color="text.secondary">Utiliza PIDA para analizar los datos mostrados arriba y sugerir estrategias.</Typography>
                </Box>
                <Button variant="contained" color="secondary" onClick={handleGeneratePidaReport} disabled={generatingReport || totalDenuncias === 0} sx={{ color: '#000', fontWeight: 'bold' }}>
                  {generatingReport ? 'Analizando datos...' : 'Generar Informe Analítico'}
                </Button>
              </Box>
              {generatingReport && <LinearProgress color="secondary" sx={{ mb: 2 }} />}
              {aiReport && (
                <Paper variant="outlined" sx={{ p: 4, bgcolor: '#fafafa', maxHeight: 600, overflowY: 'auto' }}>
                  <Box sx={{ fontFamily: 'inherit', '& h1, & h2, & h3': { color: '#003399', mt: 3, mb: 1.5, fontWeight: 'bold' }, '& h1': { fontSize: '1.75rem', borderBottom: '2px solid #e0e0e0', pb: 1 }, '& h2': { fontSize: '1.5rem' }, '& h3': { fontSize: '1.25rem' }, '& p': { lineHeight: 1.7, mb: 2, color: '#333' }, '& strong': { color: '#000' }, '& ul, & ol': { pl: 3, mb: 2, color: '#333' }, '& li': { mb: 1, lineHeight: 1.6 } }}>
                    <ReactMarkdown>{aiReport}</ReactMarkdown>
                  </Box>
                </Paper>
              )}
            </Box>
          </Box>
        )}

        {tabValue === 'carga' && isAdmin && (
          <Box component="form" onSubmit={handleUploadSubmit} sx={{ p: 4 }}>
            <Box sx={{ p: 4, border: '2px dashed #ccc', borderRadius: 2, textAlign: 'center', bgcolor: loadingAI ? '#f0f7ff' : '#fafafa', mb: 4, transition: '0.3s' }}>
              {loadingAI ? (
                <Stack alignItems="center" spacing={2}><CircularProgress size={40} color="secondary" /><Typography variant="h6" color="secondary.main" fontWeight="bold">IA analizando documento...</Typography></Stack>
              ) : (
                <Stack alignItems="center" spacing={2}><AutoAwesomeIcon color="secondary" sx={{ fontSize: 40 }} /><Typography variant="h6" color="text.primary">{archivo ? `Archivo: ${archivo.name}` : 'Sube un PDF para autocompletar'}</Typography><Button variant="contained" component="label" size="large" startIcon={<PictureAsPdfIcon />}>Elegir Archivo PDF<input type="file" hidden accept="application/pdf" onChange={handleFileChange} /></Button></Stack>
              )}
            </Box>
            <Stack spacing={3}>
              <TextField fullWidth label="Título" name="titulo" value={docData.titulo} onChange={handleFormChange} required InputLabelProps={{ shrink: docData.titulo ? true : undefined }} />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField select sx={{ flex: 1 }} label="Categoría" name="categoria" value={docData.categoria} onChange={handleFormChange} required>{categorias.map((cat) => (<MenuItem key={cat.value} value={cat.value}>{cat.label}</MenuItem>))}</TextField>
                <TextField sx={{ flex: 1 }} label="Año" name="anio" type="number" value={docData.anio} onChange={handleFormChange} required InputLabelProps={{ shrink: docData.anio ? true : undefined }} />
              </Box>
              <TextField fullWidth multiline rows={4} label="Descripción" name="descripcion" value={docData.descripcion} onChange={handleFormChange} required InputLabelProps={{ shrink: docData.descripcion ? true : undefined }} />
              <Button type="submit" variant="contained" size="large" disabled={uploading || !archivo || loadingAI}>{uploading ? `Subiendo... ${Math.round(progress)}%` : 'Guardar'}</Button>
            </Stack>
          </Box>
        )}

        {tabValue === 'asesorias' && isAdmin && (
          <Box sx={{ p: 4, bgcolor: '#fafafa', minHeight: '60vh' }}>
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} sx={{ mb: 4 }} spacing={2}>
              <Box>
                <Typography variant="h6" color="primary" fontWeight="bold">Gestión de Asesorías</Typography>
                <Typography variant="body2" color="text.secondary">Revisa los borradores, envía respuestas o consulta el historial.</Typography>
              </Box>
              <ToggleButtonGroup value={subTabDenuncias} exclusive onChange={(e, v) => v && setSubTabDenuncias(v)} color="primary" size="small" sx={{ bgcolor: 'white' }}>
                <ToggleButton value="pendiente" sx={{ px: 3 }}><PendingActionsIcon sx={{ mr: 1, fontSize: 20 }} /> Pendientes</ToggleButton>
                <ToggleButton value="completada" sx={{ px: 3 }}><HistoryIcon sx={{ mr: 1, fontSize: 20 }} /> Historial</ToggleButton>
              </ToggleButtonGroup>
            </Stack>

            <Grid container spacing={3}>
              {listaDenuncias.filter(d => d.estado === subTabDenuncias).map(denuncia => (
                <Grid item xs={12} md={6} key={denuncia.id}>
                  <Card elevation={2} sx={{ borderLeft: `4px solid ${subTabDenuncias === 'pendiente' ? '#f44336' : '#4caf50'}` }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box><Typography variant="subtitle1" fontWeight="bold">{denuncia.nombres} {denuncia.apellidos}</Typography><Typography variant="body2" color="text.secondary" gutterBottom>{denuncia.email}</Typography></Box>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          {user?.email === SUPER_ADMIN_EMAIL && (<IconButton size="small" color="error" onClick={() => handleDeleteDenuncia(denuncia.id)} title="Eliminar definitivamente"><DeleteIcon fontSize="small" /></IconButton>)}
                          <Chip label={subTabDenuncias === 'pendiente' ? 'Pendiente' : 'Completada'} size="small" color={subTabDenuncias === 'pendiente' ? 'error' : 'success'} />
                        </Box>
                      </Box>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="body2"><strong>Caso:</strong> {denuncia.tipoDenuncia}</Typography>
                      <Typography variant="body2" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', mt: 1 }}>{denuncia.descripcion}</Typography>
                      <Button variant="outlined" sx={{ mt: 2 }} onClick={() => handleOpenReview(denuncia)}>{subTabDenuncias === 'pendiente' ? 'Revisar y Enviar Respuesta' : 'Ver Respuesta Enviada'}</Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
              {listaDenuncias.filter(d => d.estado === subTabDenuncias).length === 0 && (<Typography sx={{ mt: 4, ml: 3, color: 'text.secondary' }}>No hay asesorías en esta sección.</Typography>)}
            </Grid>
          </Box>
        )}

        {tabValue === 'admins' && isAdmin && (
          <Box sx={{ p: 4 }}>
            <Alert severity="info" sx={{ mb: 4 }}>Gestión de accesos y permisos de la plataforma.</Alert>
            
            {/* SECCIÓN ADMINISTRADORES */}
            <Typography variant="h6" color="primary" fontWeight="bold" gutterBottom>Administradores del Sistema</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Tienen acceso total a estadísticas, asesorías, documentos y permisos.</Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
              <TextField label="Nombre Completo" size="small" sx={{ flexGrow: 1 }} value={newAdminName} onChange={(e) => setNewAdminName(e.target.value)} />
              <TextField label="Correo Electrónico" size="small" sx={{ flexGrow: 1 }} value={newAdminEmail} onChange={(e) => setNewAdminEmail(e.target.value)} />
              <Button variant="contained" startIcon={<PersonAddIcon />} onClick={handleAddAdmin} sx={{ minWidth: '150px' }}>Autorizar</Button>
            </Stack>
            <List sx={{ bgcolor: '#f9f9f9', borderRadius: 1, mb: 6 }}>
              <ListItem divider secondaryAction={<Chip label="Inamovible" size="small" color="primary" sx={{ fontWeight: 'bold' }} />}>
                <ListItemText primary={<Typography variant="body1"><strong>Super Administrador</strong> ({SUPER_ADMIN_EMAIL})</Typography>} secondary="Acceso total al sistema (Predeterminado)" />
              </ListItem>
              {adminList.map((admin) => (
                <ListItem key={admin.id} divider secondaryAction={<IconButton edge="end" color="error" onClick={() => handleRemoveAdmin(admin.id)}><DeleteIcon /></IconButton>}>
                  <ListItemText primary={<Typography variant="body1">{admin.nombre ? <strong>{admin.nombre}</strong> : <strong>{admin.email}</strong>}{admin.nombre && ` (${admin.email})`}</Typography>} secondary={`Autorizado por: ${admin.addedBy}`} />
                </ListItem>
              ))}
            </List>

            <Divider sx={{ my: 4 }} />

            {/* NUEVO: SECCIÓN REDACTORES DE BLOG */}
            <Typography variant="h6" color="secondary.main" fontWeight="bold" gutterBottom>Redactores Autorizados (Blog)</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Estas personas <strong>solo</strong> tendrán acceso a la pestaña de "Redacción Blog" para escribir y publicar artículos. No podrán ver denuncias ni estadísticas.</Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
              <TextField label="Nombre del Autor" size="small" sx={{ flexGrow: 1 }} value={newAutorName} onChange={(e) => setNewAutorName(e.target.value)} />
              <TextField label="Correo del Autor" size="small" sx={{ flexGrow: 1 }} value={newAutorEmail} onChange={(e) => setNewAutorEmail(e.target.value)} />
              <Button variant="contained" color="secondary" startIcon={<EditIcon />} onClick={handleAddAutor} sx={{ minWidth: '150px', color: 'black' }}>Autorizar Autor</Button>
            </Stack>
            <List sx={{ bgcolor: '#fffde7', borderRadius: 1 }}>
              {autorList.length === 0 && <Typography variant="body2" sx={{ p: 2, color: 'text.secondary' }}>No hay redactores autorizados aún.</Typography>}
              {autorList.map((autor) => (
                <ListItem key={autor.id} divider secondaryAction={<IconButton edge="end" color="error" onClick={() => handleRemoveAutor(autor.id)}><DeleteIcon /></IconButton>}>
                  <ListItemText primary={<Typography variant="body1"><strong>{autor.nombre}</strong> ({autor.email})</Typography>} secondary={`Autorizado por: ${autor.addedBy}`} />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {/* NUEVO: PESTAÑA REDACCIÓN BLOG */}
        {tabValue === 'blog' && (isAdmin || isAuthor) && (
          <Box sx={{ p: 4, bgcolor: '#fafafa' }}>
            <Typography variant="h6" color="primary" fontWeight="bold" gutterBottom>Redactar Nuevo Artículo</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Puede utilizar formato <strong>Markdown</strong> en el contenido para añadir negritas (**texto**), títulos (# Título), listas y enlaces.
            </Typography>
            
            <Paper elevation={2} sx={{ p: 3, mb: 6 }}>
              <Stack spacing={3} component="form" onSubmit={handlePublishBlog}>
                <TextField 
                  fullWidth label="Título del Artículo" value={blogData.titulo} 
                  onChange={(e) => setBlogData({...blogData, titulo: e.target.value})} required 
                />
                <TextField 
                  fullWidth multiline minRows={8} label="Contenido del Artículo (Soporta Markdown)" 
                  value={blogData.contenido} onChange={(e) => setBlogData({...blogData, contenido: e.target.value})} required 
                  sx={{ fontFamily: 'monospace' }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button type="submit" variant="contained" color="primary" size="large" disabled={publishing}>
                    {publishing ? 'Publicando...' : 'Publicar en el Blog Oficial'}
                  </Button>
                </Box>
              </Stack>
            </Paper>

            <Divider sx={{ mb: 4 }} />
            
            <Typography variant="h6" color="primary" fontWeight="bold" gutterBottom>Tus Artículos Publicados</Typography>
            <List sx={{ bgcolor: 'white', borderRadius: 1, border: '1px solid #e0e0e0' }}>
              {blogPosts.filter(p => isAdmin || p.autorEmail === user.email).length === 0 && (
                <Typography sx={{ p: 2, color: 'text.secondary' }}>No tienes artículos publicados aún.</Typography>
              )}
              {blogPosts.filter(p => isAdmin || p.autorEmail === user.email).map(post => (
                <ListItem key={post.id} divider secondaryAction={<IconButton color="error" onClick={() => handleDeletePost(post.id)}><DeleteIcon /></IconButton>}>
                  <ListItemText 
                    primary={<Typography fontWeight="bold">{post.titulo}</Typography>}
                    secondary={`Publicado por ${post.autorNombre} el ${post.fechaCreacion?.toDate().toLocaleDateString() || 'recientemente'}`}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

      </Paper>
      
      {/* MODAL PARA REVISAR ASESORÍA */}
      <Dialog open={Boolean(selectedDenuncia)} onClose={() => setSelectedDenuncia(null)} maxWidth="md" fullWidth>
        {selectedDenuncia && (
          <>
            <DialogTitle sx={{ bgcolor: '#003399', color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
              <EmailIcon /> {subTabDenuncias === 'pendiente' ? 'Revisión de Asesoría Legal' : 'Detalle de Asesoría Enviada'}
            </DialogTitle>
            <DialogContent dividers sx={{ bgcolor: '#f4f6f8' }}>
              <Grid container spacing={3} alignItems="stretch">
                <Grid item xs={12} md={5} sx={{ display: 'flex' }}>
                  <Paper sx={{ p: 2, width: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="subtitle2" color="primary" fontWeight="bold">Datos del Ciudadano</Typography>
                    <Typography variant="body2"><strong>Nombre:</strong> {selectedDenuncia.nombres}</Typography>
                    <Typography variant="body2"><strong>Correo:</strong> {selectedDenuncia.email}</Typography>
                    <Typography variant="body2"><strong>Empresa:</strong> {selectedDenuncia.empresa}</Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="subtitle2" color="primary" fontWeight="bold" gutterBottom>Hechos reportados</Typography>
                    <Box sx={{ flexGrow: 1, overflowY: 'auto', maxHeight: { xs: 150, md: 350 }, pr: 1 }}>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {selectedDenuncia.descripcion}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={7} sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="subtitle2" color="secondary.main" fontWeight="bold" gutterBottom>
                    {subTabDenuncias === 'pendiente' ? 'Borrador propuesto por IA (Editable)' : 'Respuesta Final Enviada'}
                  </Typography>
                  {subTabDenuncias === 'pendiente' ? (
                    <>
                      <TextField fullWidth multiline minRows={12} maxRows={16} value={draftReview} onChange={(e) => setDraftReview(e.target.value)} variant="outlined" sx={{ bgcolor: 'white', flexGrow: 1 }} />
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>Modifique el texto si es necesario. Al aprobar, este mensaje exacto se enviará por correo.</Typography>
                    </>
                  ) : (
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'white', flexGrow: 1, overflowY: 'auto', maxHeight: { xs: 200, md: 400 } }}>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', color: 'text.primary', wordBreak: 'break-word' }}>{draftReview}</Typography>
                    </Paper>
                  )}
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setSelectedDenuncia(null)} color="inherit" disabled={isSendingEmail}>Cerrar</Button>
              {subTabDenuncias === 'pendiente' && (
                <Button onClick={handleSendAdvice} variant="contained" color="secondary" sx={{ color: '#000', fontWeight: 'bold' }} disabled={isSendingEmail} startIcon={isSendingEmail ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}>
                  {isSendingEmail ? 'Enviando...' : 'Aprobar y Enviar Correo'}
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      <Dialog open={actionModal.open} onClose={() => setActionModal({...actionModal, open: false})}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>{actionModal.title}</DialogTitle>
        <DialogContent><Typography>{actionModal.message}</Typography></DialogContent>
        <DialogActions sx={{ p: 2 }}><Button onClick={() => setActionModal({...actionModal, open: false})} variant="contained">Cerrar</Button></DialogActions>
      </Dialog>
    </Container>
  );
}