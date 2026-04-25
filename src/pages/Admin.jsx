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
      setActionModal({ open: true, title: 'Error de archivo', message: 'Por favor, adjunte el documento PDF oficial.' });
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
          setUploading(false);
          setActionModal({ open: true, title: 'Fallo de Red', message: 'No se pudo establecer conexión con Firebase Storage.' });
        }, 
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
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
          setActionModal({ open: true, title: 'Publicación Exitosa', message: `El recurso ha sido indexado correctamente en el Repositorio Digital.` });
          setDocData({ titulo: '', categoria: '', anio: '', descripcion: '' });
          setArchivo(null);
        }
      );
    } catch (error) {
      setUploading(false);
      setActionModal({ open: true, title: 'Error de Sistema', message: 'Fallo crítico al intentar registrar los metadatos en Firestore.' });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 5, mb: 8 }}>
      
      {/* Modal de Advertencia Inicial */}
      <Dialog open={openWarning} onClose={() => setOpenWarning(false)}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: '#d32f2f', fontWeight: 'bold' }}>
          <WarningAmberIcon /> Acceso Administrativo Restringido
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body1">
            Usted está ingresando al panel de control del <strong>Observatorio Laboral</strong>. 
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Las acciones realizadas aquí modifican la base de datos oficial y el repositorio documental público financiado por la Unión Europea.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenWarning(false)} variant="contained" color="error" disableElevation sx={{ borderRadius: 1, fontWeight: 'bold' }}>
            CONFIRMAR IDENTIDAD
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Feedback */}
      <Dialog open={actionModal.open} onClose={() => setActionModal({ ...actionModal, open: false })}>
        <DialogTitle sx={{ fontWeight: 'bold', color: 'primary.main' }}>{actionModal.title}</DialogTitle>
        <DialogContent dividers><Typography>{actionModal.message}</Typography></DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setActionModal({ ...actionModal, open: false })} variant="contained" disableElevation sx={{ borderRadius: 1 }}>
            ACEPTAR
          </Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" color="primary" fontWeight="900" gutterBottom>Panel de Control</Typography>
        <Typography variant="h6" color="text.secondary">Gestión técnica y estadística del Observatorio de Derechos Laborales.</Typography>
      </Box>

      <Paper elevation={3} sx={{ borderRadius: 1, overflow: 'hidden', border: '1px solid #e0e0e0' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#f4f6f8' }}>
          <Tabs value={tabValue} onChange={(e, val) => setTabValue(val)} textColor="primary" indicatorColor="secondary">
            <Tab icon={<InsertChartIcon />} iconPosition="start" label="ANÁLISIS ESTADÍSTICO" />
            <Tab icon={<CloudUploadIcon />} iconPosition="start" label="REPOSITORIO DIGITAL" />
            <Tab icon={<SyncIcon />} iconPosition="start" label="SINALEVI" />
          </Tabs>
        </Box>

        {/* PESTAÑA 0: ESTADÍSTICAS */}
        {tabValue === 0 && (
          <Box sx={{ p: 4 }}>
            <Stack spacing={4}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 2fr' }, gap: 3 }}>
                <Card variant="outlined" sx={{ borderLeft: '6px solid #003399' }}>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">TOTAL DE REPORTES</Typography>
                    <Typography variant="h2" fontWeight="900" color="primary">248</Typography>
                    <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <GroupIcon fontSize="small" color="disabled" />
                      <Typography variant="caption" color="text.secondary">Datos captados desde el Centro de Denuncia</Typography>
                    </Box>
                  </CardContent>
                </Card>
                <Card variant="outlined" sx={{ borderLeft: '6px solid #FFCC00' }}>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">TENDENCIA DE VULNERACIÓN PREDOMINANTE</Typography>
                    <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>Impago de salario o extremos laborales</Typography>
                    <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AssignmentLateIcon fontSize="small" color="disabled" />
                      <Typography variant="caption" color="text.secondary">Actualizado en tiempo real</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.2fr 0.8fr' }, gap: 4 }}>
                <Paper variant="outlined" sx={{ p: 3, height: 450, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 3 }}>Distribución de Casos por Categoría</Typography>
                  <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dataDenuncias} margin={{ bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="nombre" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip cursor={{fill: '#f4f6f8'}} />
                        <Bar dataKey="casos" fill="#003399" radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>

                <Paper variant="outlined" sx={{ p: 3, height: 450, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 3 }}>Proporción de Afectaciones</Typography>
                  <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={dataDenuncias} innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="casos" nameKey="nombre">
                          {dataDenuncias.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '11px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              </Box>
            </Stack>
          </Box>
        )}

        {/* PESTAÑA 1: CARGA DE DOCUMENTOS */}
        {tabValue === 1 && (
          <Box component="form" onSubmit={handleUploadSubmit} sx={{ p: { xs: 3, md: 6 }, bgcolor: 'white' }}>
            <Stack spacing={4}>
              <Box>
                <Typography variant="subtitle1" color="primary" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <StorageIcon /> INDEXACIÓN DE NUEVO RECURSO
                </Typography>
                <Divider />
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(12, 1fr)' }, gap: 3 }}>
                <Box sx={{ gridColumn: 'span 12' }}>
                  <TextField fullWidth label="Título Oficial del Documento" name="titulo" value={docData.titulo} onChange={handleFormChange} required />
                </Box>

                <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 8' } }}>
                  <TextField select fullWidth label="Categoría Jurídica" name="categoria" value={docData.categoria} onChange={handleFormChange} required>
                    {categorias.map((cat) => (<MenuItem key={cat.value} value={cat.value}>{cat.label}</MenuItem>))}
                  </TextField>
                </Box>

                <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
                  <TextField fullWidth label="Año de Publicación" name="anio" type="number" value={docData.anio} onChange={handleFormChange} required />
                </Box>

                <Box sx={{ gridColumn: 'span 12' }}>
                  <TextField fullWidth label="Resumen Ejecutivo" name="descripcion" value={docData.descripcion} onChange={handleFormChange} multiline minRows={4} required placeholder="Describa brevemente el alcance de este documento para el buscador." />
                </Box>

                <Box sx={{ gridColumn: 'span 12' }}>
                  <Box sx={{ p: 4, border: '2px dashed #003399', borderRadius: 1, bgcolor: '#f8faff', textAlign: 'center' }}>
                    <Button variant="outlined" component="label" startIcon={<PictureAsPdfIcon />} sx={{ borderRadius: 1, fontWeight: 'bold' }}>
                      SELECCIONAR ARCHIVO PDF
                      <input type="file" hidden accept="application/pdf" onChange={handleFileChange} />
                    </Button>
                    <Typography variant="body2" sx={{ mt: 2, fontWeight: 'bold', color: archivo ? 'primary.main' : 'text.disabled' }}>
                      {archivo ? `LISTO PARA SUBIR: ${archivo.name}` : 'FORMATO REQUERIDO: .PDF'}
                    </Typography>
                  </Box>
                </Box>

                {uploading && (
                  <Box sx={{ gridColumn: 'span 12' }}>
                    <Typography variant="caption" color="primary" fontWeight="bold">PROGRESO DE CARGA: {Math.round(progress)}%</Typography>
                    <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4, mt: 1 }} />
                  </Box>
                )}

                <Box sx={{ gridColumn: 'span 12', display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button 
                    type="submit" 
                    variant="contained" 
                    color="primary" 
                    disabled={uploading}
                    disableElevation
                    sx={{ borderRadius: 1, px: 6, py: 1.5, fontWeight: 'bold' }}
                  >
                    PUBLICAR DOCUMENTO
                  </Button>
                </Box>
              </Box>
            </Stack>
          </Box>
        )}

        {/* PESTAÑA 2: SINALEVI */}
        {tabValue === 2 && (
          <Box sx={{ p: { xs: 4, md: 10 }, textAlign: 'center' }}>
            <SyncIcon sx={{ fontSize: 100, color: 'primary.main', mb: 2, opacity: 0.1 }} />
            <Typography variant="h5" fontWeight="bold" gutterBottom>Sincronización de Normativa Nacional</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}>
              Este proceso conecta con el sistema nacional para descargar automáticamente las últimas actualizaciones en materia laboral.
            </Typography>
            <Button variant="contained" color="secondary" onClick={handleSyncSinalevi} disableElevation sx={{ borderRadius: 1, px: 8, py: 2, color: '#000', fontWeight: 'bold' }}>
              INICIAR EXTRACCIÓN AUTOMÁTICA
            </Button>
          </Box>
        )}
      </Paper>
      
      <Box sx={{ mt: 6, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 1.5 }}>
          SISTEMA DE GESTIÓN | OBSERVATORIO DE DERECHOS LABORALES - UNIÓN EUROPEA
        </Typography>
      </Box>
    </Container>
  );
}