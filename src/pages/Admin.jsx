import { useState } from 'react';
import { 
  Container, Paper, Box, Typography, TextField, Button, 
  Tabs, Tab, MenuItem, Grid, Card, CardContent,
  Dialog, DialogTitle, DialogContent, DialogActions 
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

const categorias = [
  { value: 'leyes', label: 'Leyes Nacionales' },
  { value: 'tratados', label: 'Tratados Internacionales' },
  { value: 'jurisprudencia', label: 'Jurisprudencia' },
  { value: 'articulos', label: 'Libros y Artículos' }
];

// Datos estructurados para Recharts
const dataDenuncias = [
  { nombre: 'Impago de salario o extremos laborales', casos: 112 },
  { nombre: 'Despido injustificado', casos: 62 },
  { nombre: 'Acoso laboral (Mobbing)', casos: 37 },
  { nombre: 'Incumplimiento de jornada u horas extra', casos: 25 },
  { nombre: 'Discriminación', casos: 12 },
];

// Colores institucionales para el gráfico (Azul UE, Dorado UE y variaciones)
const COLORS = ['#003399', '#FFCC00', '#1565c0', '#ffd54f', '#90caf9'];

export default function Admin() {
  const [tabValue, setTabValue] = useState(0);
  
  const [openWarning, setOpenWarning] = useState(true);
  
  // ESTADO PARA EL MODAL DE RESULTADOS DE ACCIONES (Reemplaza a los alerts)
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
  const handleFileChange = (e) => { if (e.target.files && e.target.files[0]) setArchivo(e.target.files[0]); };

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!archivo) {
      setActionModal({ open: true, title: 'Error de archivo', message: 'Por favor, selecciona un archivo PDF antes de continuar.' });
      return;
    }
    setActionModal({ open: true, title: 'Carga Exitosa', message: `El documento "${docData.titulo}" se ha subido correctamente.` });
    setDocData({ titulo: '', categoria: '', anio: '', descripcion: '' });
    setArchivo(null);
  };

  const handleSyncSinalevi = () => {
    setActionModal({ open: true, title: 'Sincronización Iniciada', message: 'Conectando con SINALEVI para extracción automática de documentos...' });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      
      {/* MODAL DE ADVERTENCIA */}
      <Dialog open={openWarning} onClose={() => setOpenWarning(false)} disableEscapeKeyDown>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#d32f2f', fontWeight: 'bold' }}>
          <WarningAmberIcon /> Área de Administración Restringida
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Has ingresado al panel de control del Observatorio. 
            Cualquier carga de documentos o sincronización modificará la base de conocimientos de <strong>Gemini AI</strong>.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenWarning(false)} variant="outlined" color="error">
            Comprendo los riesgos
          </Button>
        </DialogActions>
      </Dialog>

      {/* MODAL DE RESULTADOS DE ACCIONES (Éxito / Error) */}
      <Dialog open={actionModal.open} onClose={() => setActionModal({ ...actionModal, open: false })}>
        <DialogTitle sx={{ color: 'primary.main', fontWeight: 'bold' }}>
          {actionModal.title}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">{actionModal.message}</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setActionModal({ ...actionModal, open: false })} variant="contained" color="primary">
            Aceptar
          </Button>
        </DialogActions>
      </Dialog>

      <Typography variant="h4" color="primary" fontWeight="bold" gutterBottom>Panel de Administración</Typography>

      <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden', mt: 3 }}>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#f4f6f8' }}>
          <Tabs value={tabValue} onChange={(e, val) => setTabValue(val)} variant="scrollable" scrollButtons="auto" textColor="primary" indicatorColor="secondary">
            <Tab icon={<InsertChartIcon />} iconPosition="start" label="Estadísticas" />
            <Tab icon={<CloudUploadIcon />} iconPosition="start" label="Carga Manual" />
            <Tab icon={<SyncIcon />} iconPosition="start" label="Sincronización SINALEVI" />
          </Tabs>
        </Box>

        {/* --- VISTA 0: ESTADÍSTICAS PROFESIONALES (Solución image_3.png) --- */}
        {tabValue === 0 && (
          <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#fafafa' }}>
            <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">Dashboard Analítico de Vulneraciones</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>Datos procesados a partir de los registros de la instancia de denuncia ciudadana.</Typography>

            {/* KPIs */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={4}>
                <Card elevation={2} sx={{ borderTop: '4px solid', borderColor: 'primary.main', height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <GroupIcon color="primary" />
                      <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">TOTAL DENUNCIAS</Typography>
                    </Box>
                    <Typography variant="h3" fontWeight="bold" color="primary.main">248</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={8}>
                <Card elevation={2} sx={{ borderTop: '4px solid', borderColor: 'secondary.main', height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <AssignmentLateIcon color="secondary" />
                      <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">TENDENCIA PRINCIPAL</Typography>
                    </Box>
                    <Typography variant="h5" fontWeight="bold" color="text.primary" sx={{ mt: 1 }}>Impago de salario o extremos laborales</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Gráficos Recharts (Solución image_3.png) */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={7}>
                <Paper elevation={1} sx={{ p: 3, borderRadius: 2, height: 400 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Volumen de Denuncias por Categoría</Typography>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dataDenuncias} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      {/* Solución: Rotación de etiquetas en eje X */}
                      <XAxis 
                        dataKey="nombre" 
                        tick={{ fontSize: 11 }} 
                        interval={0} 
                        angle={-45} 
                        textAnchor="end" 
                        height={80} 
                      />
                      <YAxis />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                      <Bar dataKey="casos" fill="#003399" radius={[4, 4, 0, 0]} name="Cantidad de Casos" />
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>

              <Grid item xs={12} md={5}>
                <Paper elevation={1} sx={{ p: 3, borderRadius: 2, height: 400, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Proporción de Afectaciones</Typography>
                  <Box sx={{ flexGrow: 1 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={dataDenuncias} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="casos">
                          {dataDenuncias.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                        {/* Solución: Leyenda vertical y alineada a la derecha */}
                        <Legend 
                          layout="vertical" 
                          align="right" 
                          verticalAlign="middle" 
                          iconSize={10} 
                          wrapperStyle={{ fontSize: 11 }} 
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* --- VISTA 1: CARGA MANUAL (Solución image_0.png) --- */}
        {tabValue === 1 && (
          <Box component="form" onSubmit={handleUploadSubmit} sx={{ p: { xs: 2, md: 4 }, bgcolor: 'white' }}>
            <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">Subir Nuevo Documento</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>Asegúrate de que el PDF sea legible. El sistema extraerá el texto para entrenar a la IA.</Typography>

            {/* Solución image_0.png: Uso de Grid para formulario robusto */}
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField fullWidth label="Título del Documento" name="titulo" value={docData.titulo} onChange={handleFormChange} variant="outlined" required />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField fullWidth select label="Categoría" name="categoria" value={docData.categoria} onChange={handleFormChange} variant="outlined" required>
                  <MenuItem value="" disabled><em>Seleccione...</em></MenuItem>
                  {categorias.map((cat) => (<MenuItem key={cat.value} value={cat.value}>{cat.label}</MenuItem>))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Año de publicación" name="anio" type="number" value={docData.anio} onChange={handleFormChange} variant="outlined" required />
              </Grid>

              <Grid item xs={12}>
                <TextField fullWidth label="Descripción breve" name="descripcion" value={docData.descripcion} onChange={handleFormChange} variant="outlined" multiline minRows={3} required />
              </Grid>

              <Grid item xs={12}>
                {/* Input de archivo estilizado */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, border: '1px dashed #ccc', borderRadius: 2, bgcolor: '#fafafa' }}>
                  <Button variant="outlined" component="label" startIcon={<PictureAsPdfIcon />}>
                    Seleccionar PDF
                    <input type="file" hidden accept="application/pdf" onChange={handleFileChange} />
                  </Button>
                  <Typography variant="body2" color={archivo ? 'text.primary' : 'text.secondary'}>
                    {archivo ? archivo.name : 'Ningún archivo seleccionado'}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                <Button type="submit" variant="contained" color="primary" size="large" sx={{ fontWeight: 'bold', px: 4 }}>
                  Guardar y Procesar
                </Button>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* --- VISTA 2: SINALEVI --- */}
        {tabValue === 2 && (
          <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: 'white', textAlign: 'center' }}>
            <SyncIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">Motor de Extracción Automática</Typography>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}>
              Este proceso buscará actualizaciones directamente en el sistema nacional.
            </Typography>
            <Button variant="contained" color="secondary" size="large" onClick={handleSyncSinalevi} sx={{ color: '#000', fontWeight: 'bold', px: 4, py: 1.5, mt: 2, borderRadius: 2 }}>
              Ejecutar
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
}