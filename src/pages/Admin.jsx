import { useState } from 'react';
import { 
  Container, Paper, Box, Typography, TextField, Button, 
  Tabs, Tab, MenuItem, Grid, Card, CardContent, Divider,
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

// Importación de servicios de Firebase
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
      setActionModal({ open: true, title: 'Error de archivo', message: 'Por favor, selecciona un archivo PDF.' });
      return;
    }

    setUploading(true);

    try {
      // 1. Crear referencia en Storage con timestamp para evitar colisiones
      const nombreArchivo = `${Date.now()}_${archivo.name}`;
      const storageRef = ref(storage, `documentos/${nombreArchivo}`);
      
      // 2. Iniciar subida
      const uploadTask = uploadBytesResumable(storageRef, archivo);

      uploadTask.on('state_changed', 
        (snapshot) => {
          const progressPercent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(progressPercent);
        }, 
        (error) => {
          console.error("Error en Storage:", error);
          setUploading(false);
          setActionModal({ open: true, title: 'Error de Carga', message: 'No se pudo subir el archivo al servidor.' });
        }, 
        async () => {
          // 3. Obtener URL de descarga
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

          // 4. Guardar metadatos en Firestore
          await addDoc(collection(db, "documentos"), {
            titulo: docData.titulo,
            categoria: docData.categoria,
            anio: parseInt(docData.anio),
            descripcion: docData.descripcion,
            fileUrl: downloadURL,
            fileName: nombreArchivo,
            createdAt: serverTimestamp()
          });

          setUploading(false);
          setProgress(0);
          setActionModal({ open: true, title: 'Operación Exitosa', message: `El documento "${docData.titulo}" ha sido indexado correctamente.` });
          setDocData({ titulo: '', categoria: '', anio: '', descripcion: '' });
          setArchivo(null);
        }
      );
    } catch (error) {
      console.error("Error general:", error);
      setUploading(false);
      setActionModal({ open: true, title: 'Error Crítico', message: 'Hubo un fallo en la conexión con la base de datos.' });
    }
  };

  const handleSyncSinalevi = () => {
    setActionModal({ open: true, title: 'Sincronización Iniciada', message: 'Conectando con SINALEVI para extracción automática...' });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      
      <Dialog open={openWarning} onClose={() => setOpenWarning(false)}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#d32f2f', fontWeight: 'bold' }}>
          <WarningAmberIcon /> Área de Administración Restringida
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Cualquier modificación en el repositorio impactará directamente en la base de conocimientos pública.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenWarning(false)} variant="contained" color="error" sx={{ borderRadius: 0 }}>
            ENTENDIDO
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={actionModal.open} onClose={() => setActionModal({ ...actionModal, open: false })}>
        <DialogTitle sx={{ color: 'primary.main', fontWeight: 'bold' }}>{actionModal.title}</DialogTitle>
        <DialogContent><Typography>{actionModal.message}</Typography></DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setActionModal({ ...actionModal, open: false })} variant="contained" color="primary" sx={{ borderRadius: 0 }}>
            ACEPTAR
          </Button>
        </DialogActions>
      </Dialog>

      <Typography variant="h4" color="primary" fontWeight="900" gutterBottom>Panel de Control Institucional</Typography>

      <Paper elevation={3} sx={{ borderRadius: 1, overflow: 'hidden', mt: 3, border: '1px solid #e0e0e0' }}>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#f4f6f8' }}>
          <Tabs value={tabValue} onChange={(e, val) => setTabValue(val)} textColor="primary" indicatorColor="secondary">
            <Tab icon={<InsertChartIcon />} iconPosition="start" label="Estadísticas" />
            <Tab icon={<CloudUploadIcon />} iconPosition="start" label="Carga de Documentos" />
            <Tab icon={<SyncIcon />} iconPosition="start" label="SINALEVI" />
          </Tabs>
        </Box>

        {tabValue === 0 && (
          <Box sx={{ p: 4 }}>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={4}>
                <Card variant="outlined" sx={{ borderTop: '4px solid #003399' }}>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">TOTAL REPORTES</Typography>
                    <Typography variant="h3" fontWeight="bold" color="primary">248</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={8}>
                <Card variant="outlined" sx={{ borderTop: '4px solid #FFCC00' }}>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">TENDENCIA ACTUAL</Typography>
                    <Typography variant="h5" fontWeight="bold">Impago de salario o extremos laborales</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Grid container spacing={3}>
              <Grid item xs={12} md={7}>
                <Paper variant="outlined" sx={{ p: 3, height: 400 }}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Casos por Categoría</Typography>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dataDenuncias}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="nombre" tick={{ fontSize: 10 }} interval={0} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="casos" fill="#003399" />
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
              <Grid item xs={12} md={5}>
                <Paper variant="outlined" sx={{ p: 3, height: 400 }}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Distribución Porcentual</Typography>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={dataDenuncias} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="casos" nameKey="nombre">
                        {dataDenuncias.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}

        {tabValue === 1 && (
          <Box component="form" onSubmit={handleUploadSubmit} sx={{ p: 5, bgcolor: 'white' }}>
            <Typography variant="h6" color="primary" fontWeight="bold" gutterBottom>Gestión de Repositorio Digital</Typography>
            <Divider sx={{ mb: 4 }} />

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(12, 1fr)' }, gap: 3 }}>
              <Box sx={{ gridColumn: 'span 12' }}>
                <TextField fullWidth label="Título del Documento" name="titulo" value={docData.titulo} onChange={handleFormChange} required />
              </Box>

              <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
                <TextField fullWidth select label="Categoría del Recurso" name="categoria" value={docData.categoria} onChange={handleFormChange} required>
                  {categorias.map((cat) => (<MenuItem key={cat.value} value={cat.value}>{cat.label}</MenuItem>))}
                </TextField>
              </Box>

              <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
                <TextField fullWidth label="Año de Emisión" name="anio" type="number" value={docData.anio} onChange={handleFormChange} required />
              </Box>

              <Box sx={{ gridColumn: 'span 12' }}>
                <TextField fullWidth label="Resumen Ejecutivo / Descripción" name="descripcion" value={docData.descripcion} onChange={handleFormChange} multiline minRows={3} required />
              </Box>

              <Box sx={{ gridColumn: 'span 12' }}>
                <Box sx={{ p: 3, border: '2px dashed #003399', borderRadius: 1, bgcolor: '#f0f4ff', textAlign: 'center' }}>
                  <Button variant="outlined" component="label" startIcon={<PictureAsPdfIcon />}>
                    ADJUNTAR PDF OFICIAL
                    <input type="file" hidden accept="application/pdf" onChange={handleFileChange} />
                  </Button>
                  <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold' }}>
                    {archivo ? archivo.name : 'No hay archivo seleccionado'}
                  </Typography>
                </Box>
              </Box>

              {uploading && (
                <Box sx={{ gridColumn: 'span 12', mt: 2 }}>
                  <Typography variant="caption" color="primary" fontWeight="bold">PROCESANDO CARGA... {Math.round(progress)}%</Typography>
                  <LinearProgress variant="determinate" value={progress} sx={{ height: 10, borderRadius: 5, mt: 1 }} />
                </Box>
              )}

              <Box sx={{ gridColumn: 'span 12', display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary" 
                  disabled={uploading}
                  sx={{ borderRadius: 0, px: 8, py: 1.5, fontWeight: 'bold' }}
                >
                  PUBLICAR EN REPOSITORIO
                </Button>
              </Box>
            </Box>
          </Box>
        )}

        {tabValue === 2 && (
          <Box sx={{ p: 10, textAlign: 'center' }}>
            <SyncIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2, opacity: 0.2 }} />
            <Typography variant="h6" fontWeight="bold">Motor de Sincronización SINALEVI</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>Extracción automatizada de normativa vigente desde el Sistema Nacional de Legislación Vigente.</Typography>
            <Button variant="contained" color="secondary" onClick={handleSyncSinalevi} sx={{ borderRadius: 0, px: 6, color: '#000', fontWeight: 'bold' }}>
              INICIAR EXTRACCIÓN
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
}