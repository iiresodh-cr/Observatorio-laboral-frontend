import { useState } from 'react';
import { 
  Container, Paper, Box, Typography, TextField, 
  Button, MenuItem, Grid, Divider, Stack,
  Dialog, DialogTitle, DialogContent, DialogActions 
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import InfoIcon from '@mui/icons-material/Info';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';

const tiposDenuncia = [
  'Despido injustificado',
  'Impago de salario o extremos laborales',
  'Acoso laboral (Mobbing)',
  'Acoso sexual',
  'Discriminación',
  'Incumplimiento de jornada u horas extra',
  'Riesgos del trabajo / Salud ocupacional',
  'Otro'
];

const opcionesGenero = [
  { value: 'femenino', label: 'Femenino' },
  { value: 'masculino', label: 'Masculino' },
  { value: 'no_binario', label: 'No binario' },
  { value: 'prefiero_no_decir', label: 'Prefiero no decirlo' }
];

export default function Denuncia() {
  const [openModal, setOpenModal] = useState(true);
  const [resultModal, setResultModal] = useState({ open: false, title: '', message: '' });

  const [formData, setFormData] = useState({
    nombre: '', empresa: '', email: '', edad: '', genero: '', tipoDenuncia: '', descripcion: ''
  });

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setResultModal({
      open: true,
      title: 'Reporte Registrado Exitosamente',
      message: 'Su información ha sido procesada de manera segura por el sistema del Observatorio.'
    });
    setFormData({ nombre: '', empresa: '', email: '', edad: '', genero: '', tipoDenuncia: '', descripcion: '' });
  };

  return (
    <Container maxWidth="md" sx={{ mt: 5, mb: 8 }}>
      {/* Modal Informativo */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'primary.main', fontWeight: 'bold' }}>
          <InfoIcon /> Marco de Confidencialidad
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body1" paragraph>
            Este formulario es un instrumento oficial del <strong>Observatorio de Derechos Laborales</strong> para la recopilación de datos estadísticos.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Toda la información proporcionada es confidencial. Este reporte tiene fines de monitoreo apoyados por la Unión Europea, y no constituye un trámite legal ante el Ministerio de Trabajo.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: '#f8f9fa' }}>
          <Button onClick={() => setOpenModal(false)} variant="contained" color="primary" disableElevation sx={{ fontWeight: 'bold' }}>
            ACEPTAR Y CONTINUAR
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Éxito */}
      <Dialog open={resultModal.open} onClose={() => setResultModal({ ...resultModal, open: false })}>
        <DialogTitle sx={{ fontWeight: 'bold', color: 'primary.main' }}>{resultModal.title}</DialogTitle>
        <DialogContent><Typography>{resultModal.message}</Typography></DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setResultModal({ ...resultModal, open: false })} variant="contained" disableElevation>
            CERRAR
          </Button>
        </DialogActions>
      </Dialog>

      {/* Encabezado de Página */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" color="primary" fontWeight="800" gutterBottom>
          Registro de Vulneraciones Laborales
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Plataforma segura para el reporte y análisis de las condiciones de trabajo.
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid #e0e0e0' }}>
        
        {/* Banner Superior Institucional */}
        <Box sx={{ p: 3, bgcolor: '#003399', color: 'white', display: 'flex', alignItems: 'center', gap: 2 }}>
          <AssignmentIcon fontSize="large" />
          <Box>
            <Typography variant="h6" fontWeight="bold">Formulario Oficial de Reporte</Typography>
            <Typography variant="body2" sx={{ opacity: 0.85 }}>
              Los campos requeridos (*) son indispensables para la validez del registro.
            </Typography>
          </Box>
        </Box>

        <Box component="form" onSubmit={handleFormSubmit} sx={{ p: { xs: 3, md: 5 }, bgcolor: '#ffffff' }}>
          <Stack spacing={4}>
            
            {/* SECCIÓN 1: DATOS PERSONALES */}
            <Box>
              <Typography variant="subtitle1" color="primary" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <PersonIcon /> 1. IDENTIFICACIÓN DE LA PERSONA
              </Typography>
              
              <Grid container spacing={3}>
                {/* Fila 1: Nombre (100% del ancho = 12 columnas) */}
                <Grid item xs={12}>
                  <TextField 
                    fullWidth 
                    label="Nombre completo" 
                    name="nombre" 
                    value={formData.nombre} 
                    onChange={handleFormChange} 
                    placeholder="Puede dejar este campo en blanco si desea mantener el anonimato" 
                  />
                </Grid>
                
                {/* Fila 2: Correo (50%), Género (25%), Edad (25%) */}
                <Grid item xs={12} md={6}>
                  <TextField 
                    required 
                    fullWidth 
                    type="email" 
                    label="Correo Electrónico" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleFormChange} 
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField 
                    select 
                    required 
                    fullWidth 
                    label="Género" 
                    name="genero" 
                    value={formData.genero} 
                    onChange={handleFormChange}
                  >
                    {opcionesGenero.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField 
                    required 
                    fullWidth 
                    type="number" 
                    label="Edad" 
                    name="edad" 
                    value={formData.edad} 
                    onChange={handleFormChange} 
                    inputProps={{ min: 15, max: 100 }}
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider />

            {/* SECCIÓN 2: DETALLES LABORALES */}
            <Box>
              <Typography variant="subtitle1" color="primary" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <BusinessIcon /> 2. INFORMACIÓN DEL CASO
              </Typography>
              
              <Stack spacing={3}>
                <TextField 
                  required 
                  fullWidth 
                  label="Nombre de la Empresa, Institución o Patrono" 
                  name="empresa" 
                  value={formData.empresa} 
                  onChange={handleFormChange} 
                />

                <TextField 
                  select 
                  required 
                  fullWidth 
                  label="Naturaleza principal de la vulneración" 
                  name="tipoDenuncia" 
                  value={formData.tipoDenuncia} 
                  onChange={handleFormChange}
                >
                  {tiposDenuncia.map((tipo) => (
                    <MenuItem key={tipo} value={tipo} sx={{ py: 1.2 }}>
                      {tipo}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField 
                  required 
                  fullWidth 
                  multiline 
                  minRows={6} 
                  label="Relación de los hechos" 
                  name="descripcion" 
                  value={formData.descripcion} 
                  onChange={handleFormChange} 
                  placeholder="Por favor, describa cronológicamente los hechos, incluyendo fechas, lugares y puestos involucrados." 
                />
              </Stack>
            </Box>

            {/* BOTÓN DE ENVÍO */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 2 }}>
              <Button 
                type="submit" 
                variant="contained" 
                color="secondary" 
                disableElevation
                sx={{ 
                  py: 1.5, 
                  px: 5, 
                  fontSize: '1rem', 
                  fontWeight: 'bold', 
                  borderRadius: 1, 
                  color: '#000'
                }}
              >
                REGISTRAR REPORTE
              </Button>
            </Box>
            
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
}