import { useState, useEffect } from 'react';
import { 
  Container, Paper, Box, Typography, TextField, Button, 
  Tabs, Tab, MenuItem, Grid, Card, CardContent, Stack,
  Dialog, DialogTitle, DialogContent, DialogActions, LinearProgress,
  Alert, List, ListItem, ListItemText, IconButton, Divider, CircularProgress
} from '@mui/material';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { 
  CloudUpload as CloudUploadIcon, Sync as SyncIcon, PictureAsPdf as PictureAsPdfIcon,
  InsertChart as InsertChartIcon, Group as GroupIcon, Logout as LogoutIcon,
  Lock as LockIcon, PersonAdd as PersonAddIcon, Delete as DeleteIcon,
  Google as GoogleIcon, AssignmentLate as AssignmentLateIcon,
  AutoAwesome as AutoAwesomeIcon
} from '@mui/icons-material';

// Firebase Services
import { db, storage, auth, googleProvider } from '../services/firebaseConfig';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp, getDocs, query, where, deleteDoc, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { signInWithPopup, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';

const SUPER_ADMIN_EMAIL = 'webmaster@iiresodh.org';

const categorias = [
  { value: 'leyes', label: 'Leyes' },
  { value: 'reglamentos', label: 'Reglamentos' },
  { value: 'tratados', label: 'Tratados Internacionales' },
  { value: 'jurisprudencia', label: 'Jurisprudencia' },
  { value: 'articulos', label: 'Libros y Artículos' }
];

const dataDenuncias = [
  { nombre: 'Impago de salario', casos: 112 },
  { nombre: 'Despido injustificado', casos: 62 },
  { nombre: 'Acoso laboral', casos: 37 },
  { nombre: 'Incumplimiento jornada', casos: 25 },
  { nombre: 'Discriminación', casos: 12 },
];

const COLORS = ['#003399', '#FFCC00', '#1565c0', '#ffd54f', '#90caf9'];

export default function Admin() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [tabValue, setTabValue] = useState(0);
  const [adminList, setAdminList] = useState([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  
  const [uploading, setUploading] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [progress, setProgress] = useState(0);
  const [docData, setDocData] = useState({ titulo: '', categoria: '', anio: '', descripcion: '' });
  const [archivo, setArchivo] = useState(null);
  const [actionModal, setActionModal] = useState({ open: false, title: '', message: '' });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userEmail = currentUser.email.toLowerCase();
        if (userEmail === SUPER_ADMIN_EMAIL.toLowerCase()) {
          setIsAdmin(true);
          setUser(currentUser);
        } else {
          const q = query(collection(db, "admins"), where("email", "==", userEmail));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            setIsAdmin(true);
            setUser(currentUser);
          } else {
            await signOut(auth);
            setLoginError(`El acceso para ${currentUser.email} no está autorizado.`);
          }
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      return onSnapshot(collection(db, "admins"), (snapshot) => {
        setAdminList(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      });
    }
  }, [isAdmin]);

  const handleLoginGoogle = async () => {
    setLoginError('');
    try { await signInWithPopup(auth, googleProvider); } 
    catch (e) { setLoginError('Fallo en la conexión con Google.'); }
  };

  const handleLoginManual = async (e) => {
    e.preventDefault();
    setLoginError('');
    try { await signInWithEmailAndPassword(auth, email, password); } 
    catch (e) { setLoginError('Credenciales incorrectas.'); }
  };

  const handleAddAdmin = async () => {
    if (!newAdminEmail) return;
    const cleanEmail = newAdminEmail.toLowerCase().trim();
    try {
      await setDoc(doc(db, "admins", cleanEmail), {
        email: cleanEmail,
        addedBy: user.email,
        date: serverTimestamp()
      });
      setNewAdminEmail('');
      setActionModal({ open: true, title: 'Acceso Concedido', message: `Nuevo admin: ${cleanEmail}` });
    } catch (e) { setActionModal({ open: true, title: 'Error', message: 'No se pudo guardar.' }); }
  };

  const handleRemoveAdmin = async (id) => {
    try { await deleteDoc(doc(db, "admins", id)); } 
    catch (e) { console.error(e); }
  };

  const handleFormChange = (e) => setDocData({ ...docData, [e.target.name]: e.target.value });
  
  // Lógica unificada: Detectar archivo y mandarlo a la IA inmediatamente
  const handleFileChange = async (e) => { 
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setArchivo(selectedFile); 
      
      // Iniciamos el análisis automáticamente
      setLoadingAI(true);
      const formData = new FormData();
      formData.append('file', selectedFile);

      try {
        // Se reemplazó el marcador con la URL real de Cloud Run
        const response = await fetch('https://observatorio-backend-extracci-n-75047069496.us-central1.run.app/extract-metadata', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) throw new Error('Error en el servicio de IA');

        const data = await response.json();
        
        // Autocompletar el formulario con la respuesta de la IA
        setDocData(prevData => ({
          titulo: data.titulo || prevData.titulo,
          categoria: data.categoria || prevData.categoria,
          anio: data.anio || prevData.anio,
          descripcion: data.descripcion || prevData.descripcion
        }));
      } catch (error) {
        console.error(error);
        setActionModal({ open: true, title: 'Análisis IA fallido', message: 'No se pudo extraer la información automáticamente. Por favor, llena los campos a mano.' });
      } finally {
        setLoadingAI(false);
      }
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!archivo) return;
    setUploading(true);
    try {
      const nombreArchivo = `${Date.now()}_${archivo.name}`;
      const storageRef = ref(storage, `documentos/${nombreArchivo}`);
      const uploadTask = uploadBytesResumable(storageRef, archivo);

      uploadTask.on('state_changed', 
        (snapshot) => setProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100),
        (error) => { setUploading(false); setActionModal({ open: true, title: 'Error', message: 'Falla al subir PDF.' }); },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          await addDoc(collection(db, "documentos"), {
            ...docData, 
            fileUrl: downloadURL, 
            fileName: nombreArchivo, 
            fechaCreacion: serverTimestamp(),
            subidoPor: user.email
          });
          setUploading(false);
          setProgress(0);
          setActionModal({ open: true, title: 'Éxito', message: 'Cargado correctamente.' });
          setDocData({ titulo: '', categoria: '', anio: '', descripcion: '' });
          setArchivo(null);
        }
      );
    } catch (error) { setUploading(false); }
  };

  if (loadingAuth) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><LinearProgress sx={{ width: '40%' }} /></Box>;

  if (!user || !isAdmin) {
    return (
      <Container maxWidth="xs" sx={{ mt: 8 }}>
        <Paper elevation={4} sx={{ p: 4, borderRadius: 2, textAlign: 'center' }}>
          <LockIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
          <Typography variant="h5" fontWeight="bold">Administración</Typography>
          {loginError && <Alert severity="error" sx={{ mb: 2, fontSize: '0.8rem' }}>{loginError}</Alert>}
          <Button fullWidth variant="contained" startIcon={<GoogleIcon />} onClick={handleLoginGoogle} sx={{ mb: 3, py: 1.2, fontWeight: 'bold' }}>
            Entrar con Google
          </Button>
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
          <Typography variant="h4" color="primary" fontWeight="bold">Panel Administrativo</Typography>
          <Typography variant="body2" color="text.secondary">Sesión: <strong>{user.email}</strong></Typography>
        </Box>
        <Button variant="outlined" color="error" startIcon={<LogoutIcon />} onClick={() => signOut(auth)}>Cerrar Sesión</Button>
      </Box>

      <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#f4f6f8' }}>
          <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} indicatorColor="secondary" textColor="primary">
            <Tab icon={<InsertChartIcon />} iconPosition="start" label="Estadísticas" />
            <Tab icon={<CloudUploadIcon />} iconPosition="start" label="Carga Manual" />
            <Tab icon={<GroupIcon />} iconPosition="start" label="Administradores" />
          </Tabs>
        </Box>

        {tabValue === 0 && (
          <Box sx={{ p: 4, bgcolor: '#fafafa' }}>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={4}>
                <Card sx={{ borderTop: '4px solid #003399' }}>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">TOTAL DENUNCIAS</Typography>
                    <Typography variant="h3" fontWeight="bold" color="primary">248</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={8}>
                <Card sx={{ borderTop: '4px solid #FFCC00' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AssignmentLateIcon color="warning" />
                      <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">TENDENCIA</Typography>
                    </Box>
                    <Typography variant="h5" fontWeight="bold" sx={{ mt: 1 }}>Impago de salario o extremos laborales</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}

        {tabValue === 1 && (
          <Box component="form" onSubmit={handleUploadSubmit} sx={{ p: 4 }}>
            <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">Subir Nuevo Documento</Typography>
            
            {/* ÁREA DE SELECCIÓN DE ARCHIVO (Ahora dispara la IA automáticamente) */}
            <Box sx={{ p: 4, border: '2px dashed #ccc', borderRadius: 2, textAlign: 'center', bgcolor: loadingAI ? '#f0f7ff' : '#fafafa', mb: 4, transition: '0.3s' }}>
              {loadingAI ? (
                <Stack alignItems="center" spacing={2}>
                  <CircularProgress size={40} color="secondary" />
                  <Typography variant="h6" color="secondary.main" fontWeight="bold">
                    La Inteligencia Artificial está leyendo el documento...
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Extrayendo título, categoría, año y generando un resumen.
                  </Typography>
                </Stack>
              ) : (
                <Stack alignItems="center" spacing={2}>
                  <AutoAwesomeIcon color="secondary" sx={{ fontSize: 40 }} />
                  <Typography variant="h6" color="text.primary">
                    {archivo ? `Archivo listo: ${archivo.name}` : 'Sube un PDF para autocompletar la información'}
                  </Typography>
                  <Button variant="contained" component="label" size="large" startIcon={<PictureAsPdfIcon />}>
                    Elegir Archivo PDF
                    <input type="file" hidden accept="application/pdf" onChange={handleFileChange} />
                  </Button>
                </Stack>
              )}
            </Box>

            <Stack spacing={3}>
              <TextField fullWidth label="Título del Documento" name="titulo" value={docData.titulo} onChange={handleFormChange} required InputLabelProps={{ shrink: docData.titulo ? true : undefined }} />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField select sx={{ flex: 1 }} label="Categoría" name="categoria" value={docData.categoria} onChange={handleFormChange} required>
                  {categorias.map((cat) => (<MenuItem key={cat.value} value={cat.value}>{cat.label}</MenuItem>))}
                </TextField>
                <TextField sx={{ flex: 1 }} label="Año" name="anio" type="number" value={docData.anio} onChange={handleFormChange} required InputLabelProps={{ shrink: docData.anio ? true : undefined }} />
              </Box>
              <TextField fullWidth multiline rows={4} label="Descripción" name="descripcion" value={docData.descripcion} onChange={handleFormChange} required InputLabelProps={{ shrink: docData.descripcion ? true : undefined }} />
              
              <Button type="submit" variant="contained" size="large" disabled={uploading || !archivo || loadingAI} color="primary" sx={{ py: 1.5, fontWeight: 'bold' }}>
                {uploading ? `Subiendo... ${Math.round(progress)}%` : 'Guardar en Repositorio'}
              </Button>
              {uploading && <LinearProgress variant="determinate" value={progress} />}
            </Stack>
          </Box>
        )}

        {tabValue === 2 && (
          <Box sx={{ p: 4 }}>
            <Alert severity="info" sx={{ mb: 3 }}>El Superadmin tiene acceso total.</Alert>
            <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
              <TextField label="Email" size="small" sx={{ flexGrow: 1 }} value={newAdminEmail} onChange={(e) => setNewAdminEmail(e.target.value)} />
              <Button variant="contained" startIcon={<PersonAddIcon />} onClick={handleAddAdmin}>Autorizar</Button>
            </Stack>
            <List sx={{ bgcolor: '#f9f9f9', borderRadius: 1 }}>
              {adminList.map((admin) => (
                <ListItem key={admin.id} divider secondaryAction={
                  <IconButton edge="end" color="error" onClick={() => handleRemoveAdmin(admin.id)}><DeleteIcon /></IconButton>
                }>
                  <ListItemText primary={admin.email} secondary={`Autorizado por: ${admin.addedBy}`} />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </Paper>
      
      <Dialog open={actionModal.open} onClose={() => setActionModal({...actionModal, open: false})}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>{actionModal.title}</DialogTitle>
        <DialogContent><Typography>{actionModal.message}</Typography></DialogContent>
        <DialogActions sx={{ p: 2 }}><Button onClick={() => setActionModal({...actionModal, open: false})} variant="contained">Cerrar</Button></DialogActions>
      </Dialog>
    </Container>
  );
}