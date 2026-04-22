import { useState } from 'react';
import { 
  Container, Paper, Box, Typography, TextField, Button, 
  Tabs, Tab, MenuItem, 
  Dialog, DialogTitle, DialogContent, DialogActions 
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SyncIcon from '@mui/icons-material/Sync';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

const categorias = [
  { value: 'leyes', label: 'Leyes Nacionales' },
  { value: 'tratados', label: 'Tratados Internacionales' },
  { value: 'jurisprudencia', label: 'Jurisprudencia' },
  { value: 'articulos', label: 'Libros y Artículos' }
];

export default function Admin() {
  const [tabValue, setTabValue] = useState(0);
  
  // 1. ESTADO PARA EL MODAL DE ADVERTENCIA INICIAL
  const [openWarning, setOpenWarning] = useState(true);

  // 2. ESTADO PARA EL MODAL DE RESULTADOS DE ACCIONES (Reemplaza a los alerts)
  const [actionModal, setActionModal] = useState({ 
    open: false, 
    title: '', 
    message: '' 
  });

  const [docData, setDocData] = useState({
    titulo: '', categoria: '', anio: '', descripcion: ''
  });
  const [archivo, setArchivo] = useState(null);

  const handleFormChange = (e) => {
    setDocData({ ...docData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setArchivo(e.target.files[0]);
    }
  };

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!archivo) {
      setActionModal({ 
        open: true, 
        title: 'Error de archivo', 
        message: 'Por favor, selecciona un archivo PDF antes de continuar.' 
      });
      return;
    }
    
    // Simulación de éxito (Aquí irá Firebase Storage en el futuro)
    setActionModal({ 
      open: true, 
      title: 'Carga Exitosa', 
      message: `El documento "${docData.titulo}" se ha procesado y subido correctamente. Estará disponible en el repositorio en breve.` 
    });

    // Limpiar formulario
    setDocData({ titulo: '', categoria: '', anio: '', descripcion: '' });
    setArchivo(null);
  };

  const handleSyncSinalevi = () => {
    // Simulación de llamado al Backend
    setActionModal({ 
      open: true, 
      title: 'Sincronización Iniciada', 
      message: 'El motor de extracción se está conectando con SINALEVI. Los nuevos documentos aparecerán en el repositorio automáticamente.' 
    });
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      
      {/* --- MODAL 1: ADVERTENCIA DE SEGURIDAD (Se abre al entrar) --- */}
      <Dialog open={openWarning} onClose={() => setOpenWarning(false)} disableEscapeKeyDown>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#d32f2f', fontWeight: 'bold' }}>
          <WarningAmberIcon /> Área Restringida
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

      {/* --- MODAL 2: RESULTADOS DE ACCIONES (Éxito / Error) --- */}
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

      <Typography variant="h4" color="primary" fontWeight="bold" gutterBottom>
        Panel de Administración
      </Typography>

      <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden', mt: 3 }}>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#f4f6f8' }}>
          <Tabs value={tabValue} onChange={(e, val) => setTabValue(val)} variant="fullWidth" textColor="primary" indicatorColor="secondary">
            <Tab icon={<CloudUploadIcon />} iconPosition="start" label="Carga Manual" />
            <Tab icon={<SyncIcon />} iconPosition="start" label="Sincronización SINALEVI" />
          </Tabs>
        </Box>

        {/* --- VISTA 1: CARGA MANUAL --- */}
        {tabValue === 0 && (
          <Box component="form" onSubmit={handleUploadSubmit} sx={{ p: { xs: 2, md: 4 }, bgcolor: 'white' }}>
            <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
              Subir Nuevo Documento
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Asegúrate de que el PDF sea legible. El sistema extraerá el texto para entrenar a la IA.
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              
              <TextField fullWidth label="Título del Documento" name="titulo" value={docData.titulo} onChange={handleFormChange} variant="outlined" required />

              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3 }}>
                <TextField fullWidth select label="Categoría" name="categoria" value={docData.categoria} onChange={handleFormChange} variant="outlined" required>
                  <MenuItem value="" disabled><em>Seleccione una categoría...</em></MenuItem>
                  {categorias.map((cat) => (
                    <MenuItem key={cat.value} value={cat.value}>{cat.label}</MenuItem>
                  ))}
                </TextField>
                
                <TextField fullWidth label="Año de publicación" name="anio" type="number" value={docData.anio} onChange={handleFormChange} variant="outlined" required />
              </Box>

              <TextField fullWidth label="Descripción breve" name="descripcion" value={docData.descripcion} onChange={handleFormChange} variant="outlined" multiline minRows={3} required />

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

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                <Button type="submit" variant="contained" color="primary" size="large" sx={{ fontWeight: 'bold', px: 4 }}>
                  Guardar y Procesar
                </Button>
              </Box>
            </Box>
          </Box>
        )}

        {/* --- VISTA 2: SINALEVI --- */}
        {tabValue === 1 && (
          <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: 'white', textAlign: 'center' }}>
            <SyncIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
              Motor de Extracción Automática
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}>
              Este proceso buscará actualizaciones directamente en el sistema nacional.
            </Typography>
            <Button variant="contained" color="secondary" size="large" onClick={handleSyncSinalevi} sx={{ fontWeight: 'bold', color: '#000', px: 4, py: 1.5, borderRadius: 2 }}>
              Ejecutar Extracción
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
}