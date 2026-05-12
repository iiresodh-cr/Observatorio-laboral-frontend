import { useState, useEffect } from 'react';
import { 
  Container, Paper, Box, Typography, TextField, Button, 
  Tabs, Tab, MenuItem, Grid, Card, CardContent, Stack,
  Dialog, DialogTitle, DialogContent, DialogActions, LinearProgress,
  Alert, List, ListItem, ListItemText, IconButton, Divider
} from '@mui/material';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  CloudUpload as CloudUploadIcon, PictureAsPdf as PictureAsPdfIcon,
  InsertChart as InsertChartIcon, Group as GroupIcon, Logout as LogoutIcon,
  Lock as LockIcon, PersonAdd as PersonAddIcon, Delete as DeleteIcon,
  Google as GoogleIcon, Email as EmailIcon
} from '@mui/icons-material';

// Firebase Services
import { db, storage, auth, googleProvider } from '../services/firebaseConfig';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp, getDocs, query, where, deleteDoc, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { signInWithPopup, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';

const SUPER_ADMIN_EMAIL = 'webmaster@iiresodh.org';

export default function Admin() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);
  
  // Estados para Login Manual
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Estados del Panel
  const [tabValue, setTabValue] = useState(0);
  const [adminList, setAdminList] = useState([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [docData, setDocData] = useState({ titulo: '', categoria: '', anio: '', descripcion: '' });
  const [archivo, setArchivo] = useState(null);
  const [actionModal, setActionModal] = useState({ open: false, title: '', message: '' });

  // 1. Lógica de Verificación de Permisos
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        if (currentUser.email === SUPER_ADMIN_EMAIL) {
          setIsAdmin(true);
          setUser(currentUser);
        } else {
          // Verificar si el email (sea de Google o Manual) está en la lista de 'admins'
          const q = query(collection(db, "admins"), where("email", "==", currentUser.email.toLowerCase()));
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

  // 2. Cargar lista de admins autorizados
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
    catch (e) { setLoginError('Credenciales incorrectas o usuario no registrado.'); }
  };

  const handleAddAdmin = async () => {
    if (!newAdminEmail) return;
    try {
      await setDoc(doc(db, "admins", newAdminEmail.toLowerCase()), {
        email: newAdminEmail.toLowerCase(),
        addedBy: user.email,
        date: serverTimestamp()
      });
      setNewAdminEmail('');
      setActionModal({ open: true, title: 'Acceso Concedido', message: `Ahora ${newAdminEmail} puede entrar al panel.` });
    } catch (e) { setActionModal({ open: true, title: 'Error', message: 'No se pudo guardar en la base de datos.' }); }
  };

  const handleRemoveAdmin = async (id) => {
    try { await deleteDoc(doc(db, "admins", id)); } 
    catch (e) { console.error(e); }
  };

  if (loadingAuth) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><LinearProgress sx={{ width: '40%' }} /></Box>;

  // --- VISTA DE ACCESO (HÍBRIDA) ---
  if (!user || !isAdmin) {
    return (
      <Container maxWidth="xs" sx={{ mt: 8 }}>
        <Paper elevation={4} sx={{ p: 4, borderRadius: 2, textAlign: 'center' }}>
          <LockIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
          <Typography variant="h5" fontWeight="bold">Administración</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Observatorio de Derechos Laborales</Typography>
          
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

  // --- VISTA DEL PANEL ---
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" color="primary" fontWeight="bold">Panel Administrativo</Typography>
        <Button variant="outlined" color="error" startIcon={<LogoutIcon />} onClick={() => signOut(auth)}>Cerrar Sesión</Button>
      </Box>

      <Paper elevation={2}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} indicatorColor="secondary" textColor="primary">
          <Tab icon={<InsertChartIcon />} label="Estadísticas" />
          <Tab icon={<CloudUploadIcon />} label="Subir Documentos" />
          <Tab icon={<GroupIcon />} label="Gestionar Admins" />
        </Tabs>

        {/* GESTIÓN DE ADMINISTRADORES */}
        {tabValue === 2 && (
          <Box sx={{ p: 4 }}>
            <Alert severity="info" sx={{ mb: 3 }}>
              El Superadmin <strong>{SUPER_ADMIN_EMAIL}</strong> tiene acceso total inamovible.
            </Alert>
            
            <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
              <TextField label="Correo (Google o Externo)" size="small" sx={{ flexGrow: 1 }} value={newAdminEmail} onChange={(e) => setNewAdminEmail(e.target.value)} />
              <Button variant="contained" startIcon={<PersonAddIcon />} onClick={handleAddAdmin}>Autorizar</Button>
            </Stack>

            <Typography variant="subtitle2" color="text.secondary" gutterBottom>Usuarios Autorizados:</Typography>
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

        {/* ... Otras pestañas (Estadísticas, Carga) ... */}
      </Paper>
      
      <Dialog open={actionModal.open} onClose={() => setActionModal({...actionModal, open: false})}>
        <DialogTitle>{actionModal.title}</DialogTitle>
        <DialogContent>{actionModal.message}</DialogContent>
        <DialogActions><Button onClick={() => setActionModal({...actionModal, open: false})}>Aceptar</Button></DialogActions>
      </Dialog>
    </Container>
  );
}