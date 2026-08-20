import { useState, useEffect } from 'react';
import { 
  Container, Paper, Box, Typography, TextField, Button, 
  Tabs, Tab, MenuItem, Grid, Card, CardContent, Stack,
  Dialog, DialogTitle, DialogContent, DialogActions, LinearProgress,
  Alert, List, ListItem, ListItemText, IconButton, Divider, CircularProgress, Chip, Checkbox, FormControlLabel,
  ToggleButton, ToggleButtonGroup
} from '@mui/material';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell
} from 'recharts';
import { 
  CloudUpload, FileText, Users, LogOut, 
  Lock, UserPlus, Trash2, LogIn, 
  Sparkles, Mail, CheckCircle, History, Clock, 
  FileBarChart, Newspaper, Edit 
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import RichTextEditor from '../components/RichTextEditor';

// Firebase Services
import { analytics, db, storage, auth, googleProvider } from '../services/firebaseConfig';
import { logEvent } from 'firebase/analytics';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp, getDocs, query, where, deleteDoc, doc, setDoc, onSnapshot, orderBy, updateDoc } from 'firebase/firestore';
import { signInWithPopup, signInWithEmailAndPassword, onAuthStateChanged, signOut, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';

const SUPER_ADMIN_EMAIL = 'webmaster@iiresodh.org';

const categorias = [
  { value: 'leyes', label: 'Leyes' }, { value: 'reglamentos', label: 'Reglamentos' },
  { value: 'tratados', label: 'Tratados Internacionales' }, { value: 'jurisprudencia', label: 'Jurisprudencia' },
  { value: 'articulos', label: 'Libros y Artículos' }
];

const COLORS = ['#003399', '#FFCC00', '#1565c0', '#ffd54f', '#001f5c', '#ffb300', '#90caf9'];
const BACKEND_URL = 'https://observatorio-backend-86857815411.us-central1.run.app';

// Función auxiliar para realizar fetch con el token de Firebase Auth
const authFetch = async (url, options = {}) => {
  const token = await auth.currentUser?.getIdToken();
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    }
  });
};

export default function Admin() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthor, setIsAuthor] = useState(false); 
  const [loadingAuth, setLoadingAuth] = useState(true);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [tabValue, setTabValue] = useState('informes'); 
  
  // Estados de Administración
  const [adminList, setAdminList] = useState([]);
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');

  // Estados de Autores
  const [autorList, setAutorList] = useState([]);
  const [newAutorName, setNewAutorName] = useState('');
  const [newAutorEmail, setNewAutorEmail] = useState('');
  
  // Consentimiento GDPR
  const [gdprConsent, setGdprConsent] = useState(false);

  // Estado general de creación de usuarios para bloqueo de botones
  const [isCreatingUser, setIsCreatingUser] = useState(false);

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
  const [blogData, setBlogData] = useState({ titulo: '', subtitulo: '', autor: '', contenido: '' });
  const [blogPosts, setBlogPosts] = useState([]);
  const [publishing, setPublishing] = useState(false);
  const [editingPost, setEditingPost] = useState(null);

  // Recuperación de Contraseña
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [resetPasswordEmail, setResetPasswordEmail] = useState('');
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  // Cambio de Contraseña Autenticado
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [changePasswordError, setChangePasswordError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // REGLA DE SEGURIDAD: Validar que el correo esté verificado si no es inicio por Google
        if (currentUser.providerData[0]?.providerId === 'password' && !currentUser.emailVerified) {
          await signOut(auth);
          setLoginError('Por seguridad, debes verificar tu correo electrónico antes de ingresar. Revisa tu bandeja de entrada o carpeta de Spam.');
          setLoadingAuth(false);
          return;
        }

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

  const handleLoginGoogle = async () => { 
    setLoginError(''); 
    try { 
      await signInWithPopup(auth, googleProvider); 
      if (analytics) logEvent(analytics, 'login', { method: 'google' });
    } catch (e) { 
      setLoginError('Fallo en la conexión.'); 
    } 
  };

  const handleLoginManual = async (e) => { 
    e.preventDefault(); 
    setLoginError(''); 
    try { 
      await signInWithEmailAndPassword(auth, email, password); 
      if (analytics) logEvent(analytics, 'login', { method: 'email' });
    } catch (e) { 
      setLoginError('Credenciales incorrectas.'); 
    } 
  };

  const handleLogout = () => signOut(auth);

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!resetPasswordEmail) return;
    setIsResettingPassword(true);
    try {
      const response = await fetch(`${BACKEND_URL}/request-password-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetPasswordEmail })
      });
      if (!response.ok) throw new Error('Error al solicitar restablecimiento.');
      setResetPasswordOpen(false);
      setActionModal({ open: true, title: 'Enlace enviado', message: `Se ha enviado un enlace para restablecer la contraseña a ${resetPasswordEmail}.` });
    } catch (error) {
      setActionModal({ open: true, title: 'Error', message: 'No se pudo enviar el enlace de recuperación. Verifica que el correo sea correcto.' });
    } finally {
      setIsResettingPassword(false);
      setResetPasswordEmail('');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setChangePasswordError('');
    if (newPassword !== confirmNewPassword) {
      setChangePasswordError('Las contraseñas no coinciden.');
      return;
    }
    if (newPassword.length < 6) {
      setChangePasswordError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }
    setIsChangingPassword(true);
    try {
      // Reautenticar al usuario
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      // Actualizar contraseña
      await updatePassword(user, newPassword);
      setChangePasswordOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setActionModal({ open: true, title: 'Contraseña actualizada', message: 'Tu contraseña se ha cambiado exitosamente.' });
    } catch (error) {
      setChangePasswordError('La contraseña actual es incorrecta o hubo un error en la autenticación.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // NUEVO: Funciones que llaman al backend para crear usuario, verificar y notificar
  const handleAddAdmin = async () => {
    if (!newAdminEmail || !newAdminName) {
      setActionModal({ open: true, title: 'Campos incompletos', message: 'Debe ingresar nombre y correo del administrador.' });
      return;
    }
    if (!gdprConsent) {
      setActionModal({ open: true, title: 'Consentimiento requerido', message: 'Debe confirmar que ha informado al usuario sobre el tratamiento de sus datos según la política de privacidad.' });
      return;
    }
    setIsCreatingUser(true);
    try {
      const response = await authFetch(`${BACKEND_URL}/create-user`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newAdminEmail, nombre: newAdminName, rol: 'admin', addedBy: user.email })
      });
      if (!response.ok) throw new Error("Error creando usuario en el backend");
      
      setNewAdminName(''); setNewAdminEmail(''); setGdprConsent(false);
      setActionModal({ open: true, title: 'Administrador Registrado', message: `Cuenta creada. Se ha enviado un correo con la contraseña temporal y el link de verificación a ${newAdminEmail}.` });
    } catch (e) {
      setActionModal({ open: true, title: 'Error', message: 'No se pudo crear la cuenta de usuario.' });
    } finally { setIsCreatingUser(false); }
  };
  
  const handleAddAutor = async () => {
    if (!newAutorEmail || !newAutorName) {
      setActionModal({ open: true, title: 'Campos incompletos', message: 'Debe ingresar nombre y correo del redactor.' });
      return;
    }
    if (!gdprConsent) {
      setActionModal({ open: true, title: 'Consentimiento requerido', message: 'Debe confirmar que ha informado al usuario sobre el tratamiento de sus datos.' });
      return;
    }
    setIsCreatingUser(true);
    try {
      const response = await authFetch(`${BACKEND_URL}/create-user`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newAutorEmail, nombre: newAutorName, rol: 'autor', addedBy: user.email })
      });
      if (!response.ok) throw new Error("Error creando usuario en el backend");

      setNewAutorName(''); setNewAutorEmail(''); setGdprConsent(false);
      setActionModal({ open: true, title: 'Redactor Registrado', message: `Cuenta creada. Se ha enviado un correo con la contraseña temporal y el link de verificación a ${newAutorEmail}.` });
    } catch (e) {
      setActionModal({ open: true, title: 'Error', message: 'No se pudo crear la cuenta de usuario.' });
    } finally { setIsCreatingUser(false); }
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
        const response = await authFetch(`${BACKEND_URL}/extract-metadata`, { method: 'POST', body: formData });
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
          if (analytics) logEvent(analytics, 'upload_document', { category: docData.categoria, title: docData.titulo });
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
      const tieneEmail = Boolean(selectedDenuncia.email && selectedDenuncia.email.trim() !== '');

      // 1. Enviar el correo SOLO si no es anónimo y tiene email
      if (tieneEmail) {
        const responseMail = await authFetch(`${BACKEND_URL}/send-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to_email: selectedDenuncia.email,
            subject: "Observatorio Laboral: Orientación sobre su caso",
            body: draftReview
          })
        });
        if (!responseMail.ok) throw new Error("Error al enviar el correo al ciudadano.");
      }

      // 2. Actualizar el documento en Firestore
      await updateDoc(doc(db, "denuncias", selectedDenuncia.id), {
        estado: 'completada',
        respuestaFinal: draftReview,
        respondidoPor: user.email,
        fechaRespuesta: serverTimestamp()
      });

      // 3. Incrementar las estadísticas en el backend
      const resIncrement = await authFetch(`${BACKEND_URL}/incrementar-completadas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipoDenuncia: selectedDenuncia.tipoDenuncia || 'Otro' })
      });

      if (!resIncrement.ok) {
        const errorDetail = await resIncrement.text();
        throw new Error(`Error actualizando contadores globales: ${errorDetail}`);
      }

      setActionModal({
        open: true,
        title: tieneEmail ? 'Asesoría Enviada' : 'Caso Anónimo Completado',
        message: tieneEmail 
          ? 'El ciudadano ha recibido el correo y el caso se marcó como completado.' 
          : 'El caso anónimo ha sido procesado y las estadísticas se actualizaron exitosamente.'
      });
      setSelectedDenuncia(null);
    } catch (error) {
      setActionModal({ open: true, title: 'Error en el proceso', message: error.message });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setBlogData({
      titulo: post.titulo,
      subtitulo: post.subtitulo || '',
      autor: post.autorNombre || '',
      contenido: post.contenido
    });
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingPost(null);
    setBlogData({ titulo: '', subtitulo: '', autor: '', contenido: '' });
  };

  const handlePublishBlog = async (e) => {
    e.preventDefault();
    if (!blogData.titulo || !blogData.contenido) return;
    setPublishing(true);
    
    const currentAutor = autorList.find(a => a.email === user.email) || adminList.find(a => a.email === user.email);
    const nombreAutor = currentAutor ? currentAutor.nombre : user.email;

    try {
      if (editingPost) {
        await updateDoc(doc(db, "blog", editingPost.id), {
          titulo: blogData.titulo,
          subtitulo: blogData.subtitulo || '',
          contenido: blogData.contenido,
          autorNombre: blogData.autor || nombreAutor,
          fechaUltimaEdicion: serverTimestamp()
        });
        if (analytics) logEvent(analytics, 'edit_blog_post', { title: blogData.titulo });
        setEditingPost(null);
        setActionModal({ open: true, title: 'Artículo Actualizado', message: 'El artículo ha sido modificado con éxito.' });
      } else {
        await addDoc(collection(db, "blog"), {
          titulo: blogData.titulo,
          subtitulo: blogData.subtitulo || '',
          contenido: blogData.contenido,
          autorEmail: user.email,
          autorNombre: blogData.autor || nombreAutor,
          fechaCreacion: serverTimestamp()
        });
        if (analytics) logEvent(analytics, 'publish_blog_post', { title: blogData.titulo });
        setActionModal({ open: true, title: 'Publicado', message: 'El artículo se ha publicado en el blog exitosamente.' });
      }
      setBlogData({ titulo: '', subtitulo: '', autor: '', contenido: '' });
    } catch (error) {
      setActionModal({ open: true, title: 'Error', message: editingPost ? 'No se pudo actualizar el artículo.' : 'No se pudo publicar el artículo.' });
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
      const response = await authFetch(`${BACKEND_URL}/generate-report`, {
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
          <Lock size={40} style={{ color: '#081A3D', marginBottom: '8px' }} />
          <Typography variant="h5" fontWeight="bold">Administración</Typography>
          {loginError && <Alert severity="error" sx={{ mb: 2, fontSize: '0.8rem' }}>{loginError}</Alert>}
          <Button fullWidth variant="contained" startIcon={<LogIn size={20} />} onClick={handleLoginGoogle} sx={{ mb: 3, py: 1.2, fontWeight: 'bold' }}>Entrar con Google</Button>
          <Divider sx={{ mb: 3 }}><Typography variant="caption" color="text.disabled">O CORREO EXTERNO</Typography></Divider>
          <Box component="form" onSubmit={handleLoginManual}>
            <TextField fullWidth size="small" label="Email" margin="dense" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <TextField fullWidth size="small" label="Contraseña" type="password" margin="dense" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <Button fullWidth type="submit" variant="outlined" sx={{ mt: 2, mb: 2, fontWeight: 'bold' }}>Acceder</Button>
            <Button onClick={() => setResetPasswordOpen(true)} size="small" sx={{ textTransform: 'none' }}>¿Olvidó su contraseña?</Button>
          </Box>
        </Paper>

        <Dialog open={resetPasswordOpen} onClose={() => setResetPasswordOpen(false)}>
          <DialogTitle>Recuperar Contraseña</DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ mb: 2 }}>Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.</Typography>
            <TextField fullWidth autoFocus label="Correo Electrónico" type="email" value={resetPasswordEmail} onChange={(e) => setResetPasswordEmail(e.target.value)} disabled={isResettingPassword} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setResetPasswordOpen(false)} disabled={isResettingPassword}>Cancelar</Button>
            <Button onClick={handleForgotPassword} variant="contained" disabled={isResettingPassword || !resetPasswordEmail}>
              {isResettingPassword ? 'Enviando...' : 'Enviar Enlace'}
            </Button>
          </DialogActions>
        </Dialog>
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
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" color="primary" onClick={() => setChangePasswordOpen(true)}>Cambiar Contraseña</Button>
          <Button variant="outlined" color="error" startIcon={<LogOut size={20} />} onClick={handleLogout}>Cerrar Sesión</Button>
        </Box>
      </Box>

      <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#f4f6f8' }}>
          <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} indicatorColor="secondary" textColor="primary" variant="scrollable" scrollButtons="auto">
            {isAdmin && <Tab value="informes" icon={<FileBarChart size={20} />} label="Informes y Gráficos" />}
            {isAdmin && <Tab value="carga" icon={<CloudUpload size={20} />} label="Carga Manual" />}
            {isAdmin && <Tab value="asesorias" icon={<Mail size={20} />} label="Asesorías" />}
            {isAdmin && <Tab value="admins" icon={<Users size={20} />} label="Administradores" />}
            {(isAdmin || isAuthor) && <Tab value="blog" icon={<Newspaper size={20} />} label="Redacción Blog" />}
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
                <Box sx={{ width: '100%', height: 300 }}>
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
                </Box>
              ) : (
                <Box display="flex" justifyContent="center" alignItems="center" height="100%"><Typography color="text.secondary">No hay datos suficientes para graficar.</Typography></Box>
              )}
            </Paper>

            <Box sx={{ mt: 6, p: 4, border: '1px solid #e0e0e0', borderRadius: 2, bgcolor: 'white' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                  <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Sparkles size={24} color="#FFCC00" /> Informe Ejecutivo</Typography>
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
                <Stack alignItems="center" spacing={2}><Sparkles size={40} color="#FFCC00" /><Typography variant="h6" color="text.primary">{archivo ? `Archivo: ${archivo.name}` : 'Sube un PDF para autocompletar'}</Typography><Button variant="contained" component="label" size="large" startIcon={<FileText size={20} />}>Elegir Archivo PDF<input type="file" hidden accept="application/pdf" onChange={handleFileChange} /></Button></Stack>
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
                <ToggleButton value="pendiente" sx={{ px: 3 }}><Clock size={20} style={{ marginRight: '8px' }} /> Pendientes</ToggleButton>
                <ToggleButton value="completada" sx={{ px: 3 }}><History size={20} style={{ marginRight: '8px' }} /> Historial</ToggleButton>
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
                          {user?.email === SUPER_ADMIN_EMAIL && (<IconButton size="small" color="error" onClick={() => handleDeleteDenuncia(denuncia.id)} title="Eliminar definitivamente"><Trash2 size={18} /></IconButton>)}
                          <Chip label={subTabDenuncias === 'pendiente' ? 'Pendiente' : 'Completada'} size="small" color={subTabDenuncias === 'pendiente' ? 'error' : 'success'} />
                        </Box>
                      </Box>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="body2"><strong>Caso:</strong> {denuncia.tipoDenuncia}</Typography>
                      <Typography variant="body2" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', mt: 1 }}>{denuncia.descripcion}</Typography>
                      <Button variant="outlined" sx={{ mt: 2 }} onClick={() => handleOpenReview(denuncia)}>
                        {subTabDenuncias === 'pendiente' 
                          ? (denuncia.email && denuncia.email.trim() !== '' ? 'Revisar y Enviar Respuesta' : 'Revisar Caso') 
                          : (denuncia.email && denuncia.email.trim() !== '' ? 'Ver Respuesta Registrada' : 'Ver Detalle')}
                      </Button>
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
            <Alert severity="info" sx={{ mb: 4 }}>Gestión centralizada. Al autorizar, el sistema creará la cuenta y enviará un correo automático para la verificación del usuario.</Alert>
            
            <Typography variant="h6" color="primary" fontWeight="bold" gutterBottom>Administradores del Sistema</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Tienen acceso total a estadísticas, asesorías, documentos y permisos.</Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
              <TextField label="Nombre Completo" size="small" sx={{ flexGrow: 1 }} value={newAdminName} onChange={(e) => setNewAdminName(e.target.value)} disabled={isCreatingUser} />
              <TextField label="Correo Electrónico" size="small" sx={{ flexGrow: 1 }} value={newAdminEmail} onChange={(e) => setNewAdminEmail(e.target.value)} disabled={isCreatingUser} />
            </Stack>
            <Box sx={{ mb: 2 }}>
              <FormControlLabel
                control={<Checkbox checked={gdprConsent} onChange={(e) => setGdprConsent(e.target.checked)} size="small" />}
                label={<Typography variant="caption">Confirmo que el tratamiento de estos datos cumple con la política de privacidad y protección de datos personales.</Typography>}
              />
            </Box>
            <Box sx={{ mb: 3 }}>
              <Button variant="contained" startIcon={isCreatingUser ? <CircularProgress size={20} color="inherit" /> : <UserPlus size={20} />} onClick={handleAddAdmin} sx={{ minWidth: '150px' }} disabled={isCreatingUser}>
                {isCreatingUser ? 'Procesando...' : 'Autorizar Admin'}
              </Button>
            </Box>
            <List sx={{ bgcolor: '#f9f9f9', borderRadius: 1, mb: 6 }}>
              <ListItem divider secondaryAction={<Chip label="Inamovible" size="small" color="primary" sx={{ fontWeight: 'bold' }} />}>
                <ListItemText primary={<Typography variant="body1"><strong>Super Administrador</strong> ({SUPER_ADMIN_EMAIL})</Typography>} secondary="Acceso total al sistema (Predeterminado)" />
              </ListItem>
              {adminList.map((admin) => (
                <ListItem key={admin.id} divider secondaryAction={<IconButton edge="end" color="error" onClick={() => handleRemoveAdmin(admin.id)}><Trash2 size={20} /></IconButton>}>
                  <ListItemText primary={<Typography variant="body1">{admin.nombre ? <strong>{admin.nombre}</strong> : <strong>{admin.email}</strong>}{admin.nombre && ` (${admin.email})`}</Typography>} secondary={`Autorizado por: ${admin.addedBy}`} />
                </ListItem>
              ))}
            </List>

            <Divider sx={{ my: 4 }} />

            <Typography variant="h6" color="secondary.main" fontWeight="bold" gutterBottom>Redactores Autorizados (Blog)</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Solo tendrán acceso a la pestaña de "Redacción Blog" para escribir y publicar artículos.</Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
              <TextField label="Nombre del Autor" size="small" sx={{ flexGrow: 1 }} value={newAutorName} onChange={(e) => setNewAutorName(e.target.value)} disabled={isCreatingUser} />
              <TextField label="Correo del Autor" size="small" sx={{ flexGrow: 1 }} value={newAutorEmail} onChange={(e) => setNewAutorEmail(e.target.value)} disabled={isCreatingUser} />
            </Stack>
            <Box sx={{ mb: 2 }}>
              <FormControlLabel
                control={<Checkbox checked={gdprConsent} onChange={(e) => setGdprConsent(e.target.checked)} size="small" />}
                label={<Typography variant="caption">Confirmo que el tratamiento de estos datos cumple con la política de privacidad y protección de datos personales.</Typography>}
              />
            </Box>
            <Box sx={{ mb: 3 }}>
              <Button variant="contained" color="secondary" startIcon={isCreatingUser ? <CircularProgress size={20} color="inherit" /> : <Edit size={20} />} onClick={handleAddAutor} sx={{ minWidth: '150px', color: 'black' }} disabled={isCreatingUser}>
                {isCreatingUser ? 'Procesando...' : 'Autorizar Autor'}
              </Button>
            </Box>
            <List sx={{ bgcolor: '#fffde7', borderRadius: 1 }}>
              {autorList.length === 0 && <Typography variant="body2" sx={{ p: 2, color: 'text.secondary' }}>No hay redactores autorizados aún.</Typography>}
              {autorList.map((autor) => (
                <ListItem key={autor.id} divider secondaryAction={<IconButton edge="end" color="error" onClick={() => handleRemoveAutor(autor.id)}><Trash2 size={20} /></IconButton>}>
                  <ListItemText primary={<Typography variant="body1"><strong>{autor.nombre}</strong> ({autor.email})</Typography>} secondary={`Autorizado por: ${autor.addedBy}`} />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {tabValue === 'blog' && (isAdmin || isAuthor) && (
          <Box sx={{ p: 4, bgcolor: '#fafafa' }}>
            <Typography variant="h6" color="primary" fontWeight="bold" gutterBottom>{editingPost ? 'Editar Artículo' : 'Redactar Nuevo Artículo'}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Puede utilizar el editor para redactar su contenido, añadir negritas, títulos, citas y enlaces de forma visual.
            </Typography>
            
            <Paper elevation={2} sx={{ p: 3, mb: 6 }}>
              <Stack spacing={3} component="form" onSubmit={handlePublishBlog}>
                <TextField 
                  fullWidth label="Título del Artículo" value={blogData.titulo} 
                  onChange={(e) => setBlogData({...blogData, titulo: e.target.value})} required 
                />
                <TextField 
                  fullWidth label="Subtítulo del Artículo (Opcional)" value={blogData.subtitulo} 
                  onChange={(e) => setBlogData({...blogData, subtitulo: e.target.value})} 
                />
                <TextField 
                  fullWidth label="Autor del Artículo (Opcional)" value={blogData.autor} 
                  onChange={(e) => setBlogData({...blogData, autor: e.target.value})} 
                  helperText="Si se deja en blanco, se usará el nombre de tu usuario."
                />
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1, ml: 1, fontWeight: 'bold' }}>Contenido del Artículo</Typography>
                  <RichTextEditor 
                    value={blogData.contenido} 
                    onChange={(html) => setBlogData({...blogData, contenido: html}) } 
                  />
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button type="submit" variant="contained" disabled={publishing} size="large" sx={{ mt: 2, flexGrow: 1 }}>
                    {publishing ? 'Procesando...' : (editingPost ? 'Guardar Cambios' : 'Publicar Artículo')}
                  </Button>
                  {editingPost && (
                    <Button variant="outlined" color="inherit" onClick={handleCancelEdit} size="large" sx={{ mt: 2 }}>
                      Cancelar Edición
                    </Button>
                  )}
                </Box>
              </Stack>
            </Paper>

            <Typography variant="h6" color="primary" fontWeight="bold" gutterBottom>Mis Artículos Publicados</Typography>
            <List sx={{ bgcolor: 'white', borderRadius: 1, border: '1px solid #e0e0e0' }}>
              {blogPosts.filter(p => isAdmin || p.autorEmail === user.email).length === 0 && (
                <Typography sx={{ p: 2, color: 'text.secondary' }}>No tienes artículos publicados aún.</Typography>
              )}
              {blogPosts.filter(p => isAdmin || p.autorEmail === user.email).map(post => (
                <ListItem key={post.id} divider secondaryAction={
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton color="primary" onClick={() => handleEditPost(post)} title="Editar artículo">
                      <Edit size={20} />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDeletePost(post.id)} title="Eliminar artículo">
                      <Trash2 size={20} />
                    </IconButton>
                  </Box>
                }>
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
            <DialogTitle sx={{ bgcolor: '#081A3D', color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
              <Mail size={24} /> {subTabDenuncias === 'pendiente' ? (selectedDenuncia?.email && selectedDenuncia.email.trim() !== '' ? 'Revisión de Asesoría Legal' : 'Revisión de Caso Anónimo') : (selectedDenuncia?.email && selectedDenuncia.email.trim() !== '' ? 'Detalle de Asesoría Enviada' : 'Detalle de Caso Anónimo')}
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
                      {selectedDenuncia?.email && selectedDenuncia.email.trim() !== '' ? (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>Modifique el texto si es necesario. Al aprobar, este mensaje exacto se enviará por correo.</Typography>
                      ) : (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>Caso anónimo: no se enviará notificación por correo electrónico.</Typography>
                      )}
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
                <Button 
                  onClick={handleSendAdvice} 
                  variant="contained" 
                  color="secondary" 
                  sx={{ color: '#000', fontWeight: 'bold' }} 
                  disabled={isSendingEmail} 
                  startIcon={isSendingEmail ? <CircularProgress size={20} color="inherit" /> : <CheckCircle size={20} />}
                >
                  {isSendingEmail 
                    ? 'Procesando...' 
                    : (selectedDenuncia?.email && selectedDenuncia.email.trim() !== '' ? 'Aprobar y Enviar Correo' : 'Marcar Caso como Completado')}
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

      {/* MODAL PARA CAMBIO DE CONTRASEÑA */}
      <Dialog open={changePasswordOpen} onClose={() => setChangePasswordOpen(false)}>
        <DialogTitle>Cambiar Contraseña</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {changePasswordError && <Alert severity="error">{changePasswordError}</Alert>}
            <TextField label="Contraseña Actual" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required disabled={isChangingPassword} />
            <TextField label="Nueva Contraseña" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required disabled={isChangingPassword} />
            <TextField label="Confirmar Nueva Contraseña" type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} required disabled={isChangingPassword} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setChangePasswordOpen(false)} disabled={isChangingPassword}>Cancelar</Button>
          <Button onClick={handleChangePassword} variant="contained" color="primary" disabled={isChangingPassword || !currentPassword || !newPassword || !confirmNewPassword}>
            {isChangingPassword ? 'Actualizando...' : 'Actualizar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}