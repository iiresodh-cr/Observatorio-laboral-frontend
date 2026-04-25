import { useState } from 'react';
import { 
  Container, Paper, Box, Typography, TextField, Button, 
  Tabs, Tab, MenuItem, Divider, Card, CardContent, Stack,
  Dialog, DialogTitle, DialogContent, DialogActions, LinearProgress 
} from '@mui/material';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SyncIcon from '@mui/icons-material/Sync';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import InsertChartIcon from '@mui/icons-material/InsertChart';
import GroupIcon from '@mui/icons-material/Group';
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';
import StorageIcon from '@mui/icons-material/Storage';

// Servicios de Firebase
import { db, storage } from '../services/firebaseConfig';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const categorias = [
  { value: 'leyes', label: 'Leyes Nacionales' },
  { value: 'tratados', label: 'Tratados Internacionales' },
  { value: 'jurisprudencia', label: 'Jurisprudencia' },
  { value: 'articulos', label: 'Libros y Artículos' }
];

const dataDenuncias = [
  { nombre: 'Impago de salario', casos: 112 },
  { nombre: 'Despido injustificado', casos: 62 },
  { nombre: 'Acoso laboral', casos: 37 },
  { nombre: 'Horas extra', casos: 25 },
  { nombre: 'Discriminación', casos: 12 },
];

const COLORS = ['#003399', '#FFCC00', '#1565c0', '#ffd54f', '#90caf9'];

export default function Admin() {
  const [tabValue, setTabValue] = useState(0);
  const [openWarning, setOpenWarning] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const [actionModal, setActionModal] = useState({ 
    open: false, 
    title: '', 
    message: '' 
  });

  const [docData, setDocData] = useState({
    titulo: '', categoria: '', anio: '', descripcion: ''
  });
  const [archivo, setArchivo] = useState(null);

  const handleFormChange = (e) => setDocData({ ...docData, [e.target.name]: e.target.value });
  
  const handleFileChange = (e) => { 
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== "application/pdf") {
        setActionModal({ open: true, title: 'Formato inválido', message: 'Solo se permiten archivos PDF.' });
        return;
      }
      setArchivo(file); 
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!archivo) {
      setActionModal({ open: true, title: 'Error de archivo', message: 'Por favor, seleccione un archivo PDF antes de continuar.' });
      return;
    }

    setUploading(true);

    try {
      const nombreArchivo = `${Date.now()}_${archivo.name}`;
      const storageRef = ref(storage, `documentos/${nombreArchivo}`);
      const uploadTask = uploadBytesResumable(storageRef, archivo);

      uploadTask.on('state_changed', 
        (snapshot) => {
          const progressPercent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(progressPercent);
        }, 
        (error) => {
          console.error("Error al subir archivo:", error);
          setUploading(false);
          setActionModal({ open: true, title: 'Error', message: 'No se pudo subir el documento al servidor.' });
        }, 
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

          // GUARDADO CON CAMPOS ESTANDARIZADOS
          await addDoc(collection(db, "documentos"), {
            titulo: docData.titulo,
            categoria: docData.categoria,
            anio: docData.anio,
            descripcion: docData.descripcion,
            fileUrl: downloadURL,
            fechaCreacion: serverTimestamp()
          });

          setUploading(false);
          setProgress(0);
          setActionModal({ open: true, title: 'Carga Exitosa', message: `El documento "${docData.titulo}" se ha subido correctamente.` });
          setDocData({ titulo: '', categoria: '', anio: '', descripcion: '' });
          setArchivo(null);
        }
      );
    } catch (error) {
      console.error("Error en Firebase:", error);
      setUploading(false);
      setActionModal({ open: true, title: 'Error', message: 'Ocurrió un error al registrar los datos.' });
    }
  };

  const handleSyncSinalevi = () => {
    setActionModal({ open: true, title: 'Sincronización Iniciada', message: 'Conectando con SINALEVI para extracción automática de documentos...' });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      
      <Dialog open={openWarning} onClose={() => setOpenWarning(false)} disableEscapeKeyDown>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#d32f2f', fontWeight: 'bold' }}>
          <WarningAmberIcon /> Área de Administración Restringida
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body1">
            Has ingresado al panel de control del Observatorio. 
            Cualquier carga de documentos o sincronización modificará la base de conocimientos del asistente de IA <strong>PIDA</strong>.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenWarning(false)} variant="contained" color="error" sx={{ borderRadius: 1, fontWeight: 'bold' }}>
            Comprendo los riesgos
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={actionModal.open} onClose={() => setActionModal({ ...actionModal, open: false })}>
        <DialogTitle sx={{ color: 'primary.main', fontWeight: 'bold' }}>{actionModal.title}</DialogTitle>
        <DialogContent dividers><Typography>{actionModal.message}</Typography></DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setActionModal({ ...actionModal, open: false })} variant="contained" color="primary" sx={{ borderRadius: 1 }}>
            ACEPTAR
          </Button>
        </DialogActions>
      </Dialog>

      <Typography variant="h4" color="primary" fontWeight="bold" gutterBottom>Panel de Administración</Typography>

      <Paper elevation={3} sx={{ borderRadius: 1, overflow: 'hidden', mt: 3, border: '1px solid #e0e0e0' }}>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#f4f6f8' }}>
          <Tabs value={tabValue} onChange={(e, val) => setTabValue(val)} variant="scrollable" scrollButtons="auto" textColor="primary" indicatorColor="secondary">
            <Tab icon={<InsertChartIcon />} iconPosition="start" label="Estadísticas" />
            <Tab icon={<CloudUploadIcon />} iconPosition="start" label="Carga Manual" />
            <Tab icon={<SyncIcon />} iconPosition="start" label="Sincronización SINALEVI" />
          </Tabs>
        </Box>

        {tabValue === 0 && (
          <Box sx={{ p: 4 }}>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={4}>
                <Card elevation={0} sx={{ borderLeft: '6px solid #003399', bgcolor: '#f8faff', border: '1px solid #e0e0e0', borderLeftWidth: '6px' }}>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">TOTAL DENUNCIAS</Typography>
                    <Typography variant="h3" fontWeight="bold" color="primary">248</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={8}>
                <Card elevation={0} sx={{ borderLeft: '6px solid #FFCC00', bgcolor: '#fffdf0', border: '1px solid #e0e0e0', borderLeftWidth: '6px' }}>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">TENDENCIA PRINCIPAL</Typography>
                    <Typography variant="h5" fontWeight="bold">Impago de salario o extremos laborales</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Grid container spacing={3}>
              <Grid item xs={12} md={7}>
                <Paper variant="outlined" sx={{ p: 3, height: 450, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Volumen de Denuncias por Categoría</Typography>
                  <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dataDenuncias} margin={{ bottom: 80 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="nombre" tick={{ fontSize: 11 }} interval={0} angle={-45} textAnchor="end" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="casos" fill="#003399" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} md={5}>
                <Paper variant="outlined" sx={{ p: 3, height: 450, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Proporción de Afectaciones</Typography>
                  <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={dataDenuncias} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="casos" nameKey="nombre">
                          {dataDenuncias.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: '11px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}

        {tabValue === 1 && (
          <Box component="form" onSubmit={handleUploadSubmit} sx={{ p: { xs: 3, md: 5 }, bgcolor: 'white' }}>
            <Stack spacing={4}>
              <Box>
                <Typography variant="h6" color="primary" fontWeight="bold">Subir Nuevo Documento</Typography>
                <Typography variant="body2" color="text.secondary">El sistema extraerá el texto para entrenar a la IA PIDA.</Typography>
                <Divider sx={{ mt: 2 }} />
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(12, 1fr)' }, gap: 3 }}>
                <Box sx={{ gridColumn: 'span 12' }}>
                  <TextField fullWidth label="Título del Documento" name="titulo" value={docData.titulo} onChange={handleFormChange} required />
                </Box>

                <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
                  <TextField select fullWidth label="Categoría" name="categoria" value={docData.categoria} onChange={handleFormChange} required>
                    {categorias.map((cat) => (<MenuItem key={cat.value} value={cat.value}>{cat.label}</MenuItem>))}
                  </TextField>
                </Box>

                <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
                  <TextField fullWidth label="Año de publicación" name="anio" type="number" value={docData.anio} onChange={handleFormChange} required />
                </Box>

                <Box sx={{ gridColumn: 'span 12' }}>
                  <TextField fullWidth label="Descripción breve" name="descripcion" value={docData.descripcion} onChange={handleFormChange} multiline minRows={4} required />
                </Box>

                <Box sx={{ gridColumn: 'span 12' }}>
                  <Box sx={{ p: 3, border: '1px dashed #ccc', borderRadius: 1, bgcolor: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Button variant="outlined" component="label" startIcon={<PictureAsPdfIcon />}>
                        SELECCIONAR PDF
                        <input type="file" hidden accept="application/pdf" onChange={handleFileChange} />
                      </Button>
                      <Typography variant="body2">{archivo ? archivo.name : 'Ningún archivo seleccionado'}</Typography>
                    </Box>
                    <Button type="submit" variant="contained" color="primary" disabled={uploading} sx={{ fontWeight: 'bold', px: 4, py: 1.5, borderRadius: 1 }}>
                      {uploading ? 'PROCESANDO...' : 'GUARDAR Y PROCESAR'}
                    </Button>
                  </Box>
                </Box>
              </Box>

              {uploading && (
                <Box>
                  <Typography variant="caption" color="primary" fontWeight="bold">Subiendo: {Math.round(progress)}%</Typography>
                  <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4, mt: 1 }} />
                </Box>
              )}
            </Stack>
          </Box>
        )}

        {tabValue === 2 && (
          <Box sx={{ p: 10, textAlign: 'center' }}>
            <SyncIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2, opacity: 0.3 }} />
            <Typography variant="h6" fontWeight="bold">Motor de Extracción SINALEVI</Typography>
            <Button variant="contained" color="secondary" onClick={handleSyncSinalevi} sx={{ mt: 3, color: '#000', fontWeight: 'bold', borderRadius: 1, px: 6 }}>
              EJECUTAR
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
}