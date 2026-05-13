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
  History as HistoryIcon, PendingActions as PendingActionsIcon
} from '@mui/icons-material';

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

const dataDenuncias = [
  { nombre: 'Impago de salario', casos: 112 }, { nombre: 'Despido injustificado', casos: 62 },
  { nombre: 'Acoso laboral', casos: 37 }, { nombre: 'Incumplimiento jornada', casos: 25 },
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
  
  // Estados Carga Documentos
  const [uploading, setUploading] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [progress, setProgress] = useState(0);
  const [docData, setDocData] = useState({ titulo: '', categoria: '', anio: '', descripcion: '' });
  const [archivo, setArchivo] = useState(null);
  const [actionModal, setActionModal] = useState({ open: false, title: '', message: '' });

  // Estados Asesorías
  const [listaDenuncias, setListaDenuncias] = useState([]);
  const [selectedDenuncia, setSelectedDenuncia] = useState(null);
  const [draftReview, setDraftReview] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [subTabDenuncias, setSubTabDenuncias] = useState('pendiente');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userEmail = currentUser.email.toLowerCase();
        if (userEmail === SUPER_ADMIN_EMAIL.toLowerCase()) {
          setIsAdmin(true); setUser(currentUser);
        } else {
          const q = query(collection(db, "admins"), where("email", "==", userEmail));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) { setIsAdmin(true); setUser(currentUser); } 
          else { await signOut(auth); setLoginError(`El acceso para ${currentUser.email} no está autorizado.`); }
        }
      } else { setUser(null); setIsAdmin(false); }
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      const unsubAdmins = onSnapshot(collection(db, "admins"), (snapshot) => {
        setAdminList(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      });
      // Escuchar denuncias en tiempo real
      const unsubDenuncias = onSnapshot(query(collection(db, "denuncias"), orderBy("fechaRegistro", "desc")), (snapshot) => {
        setListaDenuncias(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      });
      return () => { unsubAdmins(); unsubDenuncias(); };
    }
  }, [isAdmin]);

  const handleLoginGoogle = async () => { setLoginError(''); try { await signInWithPopup(auth, googleProvider); } catch (e) { setLoginError('Fallo en la conexión.'); } };
  const handleLoginManual = async (e) => { e.preventDefault(); setLoginError(''); try { await signInWithEmailAndPassword(auth, email, password); } catch (e) { setLoginError('Credenciales incorrectas.'); } };
  const handleLogout = () => signOut(auth);

  const handleAddAdmin = async () => {
    if (!newAdminEmail) return;
    try {
      await setDoc(doc(db, "admins", newAdminEmail.toLowerCase().trim()), { email: newAdminEmail.toLowerCase().trim(), addedBy: user.email, date: serverTimestamp() });
      setNewAdminEmail(''); setActionModal({ open: true, title: 'Acceso Concedido', message: `Nuevo admin.` });
    } catch (e) {}
  };
  const handleRemoveAdmin = async (id) => { try { await deleteDoc(doc(db, "admins", id)); } catch (e) {} };

  // Función exclusiva del Superadministrador para borrar
  const handleDeleteDenuncia = async (id) => {
    if (window.confirm("¿Está seguro de borrar esta denuncia permanentemente? Esta acción solo la puede realizar el Superadministrador.")) {
      try {
        await deleteDoc(doc(db, "denuncias", id));
        setActionModal({ open: true, title: 'Eliminado', message: 'El registro ha sido borrado de la base de datos.' });
      } catch (e) {
        setActionModal({ open: true, title: 'Acceso Denegado', message: 'No tiene permisos suficientes para borrar denuncias.' });
      }
    }
  };

  const handleFormChange = (e) => setDocData({ ...docData, [e.target.name]: e.target.value });
  
  const handleFileChange = async (e) => { 
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setArchivo(selectedFile); 
      setLoadingAI(true);
      const formData = new FormData(); formData.append('file', selectedFile);
      try {
        // URL CORRECTA
        const response = await fetch('https://observatorio-backend-86857815411.us-central1.run.app/extract-metadata', { method: 'POST', body: formData });
        if (response.ok) {
          const data = await response.json();
          setDocData(prevData => ({ titulo: data.titulo || prevData.titulo, categoria: data.categoria || prevData.categoria, anio: data.anio || prevData.anio, descripcion: data.descripcion || prevData.descripcion }));
        } else {
          console.error("Error del servidor IA:", await response.text());
          setActionModal({ open: true, title: 'IA falló', message: 'No se pudo analizar. Llena manualmente.' });
        }
      } catch (error) { 
        console.error("Error de red", error);
        setActionModal({ open: true, title: 'IA falló', message: 'Error de red. Llena manualmente.' }); 
      } finally { setLoadingAI(false); }
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault(); if (!archivo) return;
    setUploading(true);
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

  // FUNCIONES PARA ASESORÍAS
  const handleOpenReview = (denuncia) => {
    setSelectedDenuncia(denuncia);
    if (denuncia.estado === 'completada') {
      setDraftReview(denuncia.respuestaFinal || 'Sin respuesta guardada.');
    } else {
      setDraftReview(denuncia.borradorAsesoria || 'La IA no pudo generar un borrador para este caso.');
    }
  };

  const handleSendAdvice = async () => {
    if (!selectedDenuncia) return;
    setIsSendingEmail(true);

    try {
      // URL CORRECTA
      const response = await fetch('https://observatorio-backend-86857815411.us-central1.run.app/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to_email: selectedDenuncia.email,
          subject: "Observatorio Laboral: Orientación sobre su caso",
          body: draftReview
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error al conectar con servidor de correos: ${errorText}`);
      }

      // Actualizar documento en Firestore
      await updateDoc(doc(db, "denuncias", selectedDenuncia.id), {
        estado: 'completada',
        respuestaFinal: draftReview,
        respondidoPor: user.email,
        fechaRespuesta: serverTimestamp()
      });

      setActionModal({ open: true, title: 'Asesoría Enviada', message: 'El ciudadano ha recibido el correo exitosamente.' });
      setSelectedDenuncia(null);
    } catch (error) {
      console.error(error);
      setActionModal({ open: true, title: 'Error', message: 'No se pudo enviar el correo.' });
    } finally {
      setIsSendingEmail(false);
    }
  };

  if (loadingAuth) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><LinearProgress sx={{ width: '40%' }} /></Box>;

  if (!user || !isAdmin) {
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
          <Typography variant="h4" color="primary" fontWeight="bold">Panel Administrativo</Typography>
          <Typography variant="body2" color="text.secondary">Sesión: <strong>{user.email}</strong></Typography>
        </Box>
        <Button variant="outlined" color="error" startIcon={<LogoutIcon />} onClick={handleLogout}>Cerrar Sesión</Button>
      </Box>

      <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#f4f6f8' }}>
          <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} indicatorColor="secondary" textColor="primary" variant="scrollable" scrollButtons="auto">
            <Tab icon={<InsertChartIcon />} label="Estadísticas" />
            <Tab icon={<CloudUploadIcon />} label="Carga Manual" />
            <Tab icon={<EmailIcon />} label="Asesorías" />
            <Tab icon={<GroupIcon />} label="Administradores" />
          </Tabs>
        </Box>

        {tabValue === 0 && (
          <Box sx={{ p: 4, bgcolor: '#fafafa' }}>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={4}>
                <Card sx={{ borderTop: '4px solid #003399' }}><CardContent><Typography variant="subtitle2" color="text.secondary" fontWeight="bold">TOTAL DENUNCIAS</Typography><Typography variant="h3" fontWeight="bold" color="primary">{listaDenuncias.length || 248}</Typography></CardContent></Card>
              </Grid>
              <Grid item xs={12} sm={8}>
                <Card sx={{ borderTop: '4px solid #FFCC00' }}><CardContent><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><AssignmentLateIcon color="warning" /><Typography variant="subtitle2" color="text.secondary" fontWeight="bold">TENDENCIA</Typography></Box><Typography variant="h5" fontWeight="bold" sx={{ mt: 1 }}>Impago de salario o extremos laborales</Typography></CardContent></Card>
              </Grid>
            </Grid>
          </Box>
        )}

        {tabValue === 1 && (
          <Box component="form" onSubmit={handleUploadSubmit} sx={{ p: 4 }}>
            <Box sx={{ p: 4, border: '2px dashed #ccc', borderRadius: 2, textAlign: 'center', bgcolor: loadingAI ? '#f0f7ff' : '#fafafa', mb: 4, transition: '0.3s' }}>
              {loadingAI ? (
                <Stack alignItems="center" spacing={2}>
                  <CircularProgress size={40} color="secondary" />
                  <Typography variant="h6" color="secondary.main" fontWeight="bold">IA analizando documento...</Typography>
                </Stack>
              ) : (
                <Stack alignItems="center" spacing={2}>
                  <AutoAwesomeIcon color="secondary" sx={{ fontSize: 40 }} />
                  <Typography variant="h6" color="text.primary">{archivo ? `Archivo: ${archivo.name}` : 'Sube un PDF para autocompletar'}</Typography>
                  <Button variant="contained" component="label" size="large" startIcon={<PictureAsPdfIcon />}>Elegir Archivo PDF<input type="file" hidden accept="application/pdf" onChange={handleFileChange} /></Button>
                </Stack>
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

        {/* PESTAÑA: ASESORÍAS */}
        {tabValue === 2 && (
          <Box sx={{ p: 4, bgcolor: '#fafafa', minHeight: '60vh' }}>
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} sx={{ mb: 4 }} spacing={2}>
              <Box>
                <Typography variant="h6" color="primary" fontWeight="bold">Gestión de Asesorías</Typography>
                <Typography variant="body2" color="text.secondary">
                  Revisa los borradores, envía respuestas o consulta el historial.
                </Typography>
              </Box>
              <ToggleButtonGroup 
                value={subTabDenuncias} 
                exclusive 
                onChange={(e, v) => v && setSubTabDenuncias(v)} 
                color="primary" 
                size="small"
                sx={{ bgcolor: 'white' }}
              >
                <ToggleButton value="pendiente" sx={{ px: 3 }}>
                  <PendingActionsIcon sx={{ mr: 1, fontSize: 20 }} /> Pendientes
                </ToggleButton>
                <ToggleButton value="completada" sx={{ px: 3 }}>
                  <HistoryIcon sx={{ mr: 1, fontSize: 20 }} /> Historial
                </ToggleButton>
              </ToggleButtonGroup>
            </Stack>

            <Grid container spacing={3}>
              {listaDenuncias.filter(d => d.estado === subTabDenuncias).map(denuncia => (
                <Grid item xs={12} md={6} key={denuncia.id}>
                  <Card elevation={2} sx={{ borderLeft: `4px solid ${subTabDenuncias === 'pendiente' ? '#f44336' : '#4caf50'}` }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                          <Typography variant="subtitle1" fontWeight="bold">{denuncia.nombres} {denuncia.apellidos}</Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>{denuncia.email}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          {user?.email === SUPER_ADMIN_EMAIL && (
                            <IconButton size="small" color="error" onClick={() => handleDeleteDenuncia(denuncia.id)} title="Eliminar definitivamente">
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          )}
                          <Chip label={subTabDenuncias === 'pendiente' ? 'Pendiente' : 'Completada'} size="small" color={subTabDenuncias === 'pendiente' ? 'error' : 'success'} />
                        </Box>
                      </Box>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="body2"><strong>Caso:</strong> {denuncia.tipoDenuncia}</Typography>
                      <Typography variant="body2" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', mt: 1 }}>
                        {denuncia.descripcion}
                      </Typography>
                      <Button variant="outlined" sx={{ mt: 2 }} onClick={() => handleOpenReview(denuncia)}>
                        {subTabDenuncias === 'pendiente' ? 'Revisar y Enviar Respuesta' : 'Ver Respuesta Enviada'}
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
              {listaDenuncias.filter(d => d.estado === subTabDenuncias).length === 0 && (
                <Typography sx={{ mt: 4, ml: 3, color: 'text.secondary' }}>No hay asesorías en esta sección.</Typography>
              )}
            </Grid>
          </Box>
        )}

        {tabValue === 3 && (
          <Box sx={{ p: 4 }}>
            <Alert severity="info" sx={{ mb: 3 }}>El Superadmin {SUPER_ADMIN_EMAIL} tiene acceso total.</Alert>
            <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
              <TextField label="Email" size="small" sx={{ flexGrow: 1 }} value={newAdminEmail} onChange={(e) => setNewAdminEmail(e.target.value)} />
              <Button variant="contained" startIcon={<PersonAddIcon />} onClick={handleAddAdmin}>Autorizar</Button>
            </Stack>
            <List sx={{ bgcolor: '#f9f9f9', borderRadius: 1 }}>
              {adminList.map((admin) => (
                <ListItem key={admin.id} divider secondaryAction={<IconButton edge="end" color="error" onClick={() => handleRemoveAdmin(admin.id)}><DeleteIcon /></IconButton>}>
                  <ListItemText primary={admin.email} secondary={`Autorizado por: ${admin.addedBy}`} />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </Paper>
      
      {/* MODAL PARA REVISAR ASESORÍA - ALINEACIÓN CORREGIDA */}
      <Dialog open={Boolean(selectedDenuncia)} onClose={() => setSelectedDenuncia(null)} maxWidth="md" fullWidth>
        {selectedDenuncia && (
          <>
            <DialogTitle sx={{ bgcolor: '#003399', color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
              <EmailIcon /> {subTabDenuncias === 'pendiente' ? 'Revisión de Asesoría Legal' : 'Detalle de Asesoría Enviada'}
            </DialogTitle>
            <DialogContent dividers sx={{ bgcolor: '#f4f6f8' }}>
              
              {/* Uso de alignItems="stretch" para que ambas cajas tengan la misma altura siempre */}
              <Grid container spacing={3} alignItems="stretch">
                
                {/* LADO IZQUIERDO: Datos del ciudadano */}
                <Grid item xs={12} md={5} sx={{ display: 'flex' }}>
                  <Paper sx={{ p: 2, width: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="subtitle2" color="primary" fontWeight="bold">Datos del Ciudadano</Typography>
                    <Typography variant="body2"><strong>Nombre:</strong> {selectedDenuncia.nombres}</Typography>
                    <Typography variant="body2"><strong>Correo:</strong> {selectedDenuncia.email}</Typography>
                    <Typography variant="body2"><strong>Empresa:</strong> {selectedDenuncia.empresa}</Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="subtitle2" color="primary" fontWeight="bold" gutterBottom>Hechos reportados</Typography>
                    {/* Caja scrolleable para evitar que un texto muy largo rompa el diseño */}
                    <Box sx={{ flexGrow: 1, overflowY: 'auto', maxHeight: { xs: 150, md: 350 }, pr: 1 }}>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {selectedDenuncia.descripcion}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>

                {/* LADO DERECHO: Respuesta de IA / Respuesta Enviada */}
                <Grid item xs={12} md={7} sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="subtitle2" color="secondary.main" fontWeight="bold" gutterBottom>
                    {subTabDenuncias === 'pendiente' ? 'Borrador propuesto por IA (Editable)' : 'Respuesta Final Enviada'}
                  </Typography>
                  
                  {subTabDenuncias === 'pendiente' ? (
                    <>
                      {/* Campo editable normal para casos pendientes */}
                      <TextField 
                        fullWidth multiline minRows={12} maxRows={16}
                        value={draftReview} 
                        onChange={(e) => setDraftReview(e.target.value)}
                        variant="outlined"
                        sx={{ bgcolor: 'white', flexGrow: 1 }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                        Modifique el texto si es necesario. Al aprobar, este mensaje exacto se enviará por correo.
                      </Typography>
                    </>
                  ) : (
                    /* Papel estático en lugar de TextField deshabilitado para mejorar legibilidad de casos completados */
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'white', flexGrow: 1, overflowY: 'auto', maxHeight: { xs: 200, md: 400 } }}>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', color: 'text.primary', wordBreak: 'break-word' }}>
                        {draftReview}
                      </Typography>
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