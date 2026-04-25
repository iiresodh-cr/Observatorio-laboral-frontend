import { useState } from 'react';
import { 
  Container, Paper, Box, Typography, TextField, 
  Button, MenuItem, Divider, Stack,
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
    nombres: '', 
    apellidos: '', 
    empresa: '', 
    email: '', 
    edad: '', 
    genero: '', 
    tipoDenuncia: '', 
    descripcion: ''
  });

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setResultModal({
      open: true,
      title: 'Reporte Registrado Exitosamente',
      message: 'Su información ha sido procesada de manera segura para el análisis estadístico del Observatorio.'
    });
    setFormData({ nombres: '', apellidos: '', empresa: '', email: '', edad: '', genero: '', tipoDenuncia: '', descripcion: '' });
  };

  return (
    <Container maxWidth="md" sx={{ mt: 5, mb: 8 }}>
      {/* Modal Informativo Institucional */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} PaperProps={{ sx: { borderRadius: 1 } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'primary.main', fontWeight: 'bold' }}>
          <InfoIcon /> Marco de Confidencialidad
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body1" paragraph sx={{ fontWeight: 500 }}>
            Este formulario es un instrumento oficial del <strong>Observatorio de Derechos Laborales</strong>.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Toda la información es confidencial y se utilizará para fines estadísticos. Este reporte es parte de una iniciativa apoyada por la Unión Europea.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: '#f8f9fa' }}>
          <Button onClick={() => setOpenModal(false)} variant="contained" disableElevation sx={{ fontWeight: 'bold', borderRadius: 1 }}>
            ACEPTAR Y CONTINUAR
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Éxito */}
      <Dialog open={resultModal.open} onClose={() => setResultModal({ ...resultModal, open: false })}>
        <DialogTitle sx={{ fontWeight: 'bold', color: 'primary.main' }}>{resultModal.title}</DialogTitle>
        <DialogContent><Typography>{resultModal.message}</Typography></DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setResultModal({ ...resultModal, open: false })} variant="contained" disableElevation sx={{ borderRadius: 1 }}>
            CERRAR
          </Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" color="primary" fontWeight="800" gutterBottom>
          Registro de Vulneraciones Laborales
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Plataforma de análisis de condiciones de trabajo de Costa Rica.
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ borderRadius: 1, overflow: 'hidden', border: '1px solid #e0e0e0' }}>
        <Box sx={{ p: 3, bgcolor: '#003399', color: 'white', display: 'flex', alignItems: 'center', gap: 2 }}>
          <AssignmentIcon fontSize="large" />
          <Typography variant="h6" fontWeight="bold">FORMULARIO OFICIAL DE REPORTE</Typography>
        </Box>

        <Box component="form" onSubmit={handleFormSubmit} sx={{ p: { xs: 3, md: 5 }, bgcolor: '#ffffff' }}>
          <Stack spacing={4}>
            
            {/* SECCIÓN 1: IDENTIFICACIÓN */}
            <Box>
              <Typography variant="subtitle1" color="primary" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <PersonIcon /> 1. IDENTIFICACIÓN DE LA PERSONA
              </Typography>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(12, 1fr)' }, gap: 3 }}>
                {/* DIVISIÓN: Nombres y Apellidos en la misma fila (50% cada uno) */}
                <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 6' } }}>
                  <TextField fullWidth label="Nombres" name="nombres" value={formData.nombres} onChange={handleFormChange} required />
                </Box>
                <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 6' } }}>
                  <TextField fullWidth label="Apellidos" name="apellidos" value={formData.apellidos} onChange={handleFormChange} required />
                </Box>
                
                {/* Correo Electrónico ocupa toda la fila */}
                <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 12' } }}>
                  <TextField required fullWidth type="email" label="Correo Electrónico de contacto" name="email" value={formData.email} onChange={handleFormChange} />
                </Box>

                {/* Edad y Género repartidos 50/50 */}
                <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 6' } }}>
                  <TextField required fullWidth type="number" label="Edad" name="edad" value={formData.edad} onChange={handleFormChange} inputProps={{ min: 15, max: 100 }} />
                </Box>
                <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 6' } }}>
                  <TextField select required fullWidth label="Género" name="genero" value={formData.genero} onChange={handleFormChange}>
                    {opcionesGenero.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                    ))}
                  </TextField>
                </Box>
              </Box>
            </Box>

            <Divider />

            {/* SECCIÓN 2: INFORMACIÓN DEL CASO */}
            <Box>
              <Typography variant="subtitle1" color="primary" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <BusinessIcon /> 2. INFORMACIÓN DEL CASO
              </Typography>
              
              <Stack spacing={3}>
                <TextField required fullWidth label="Nombre de la Empresa o Patrono" name="empresa" value={formData.empresa} onChange={handleFormChange} />

                <TextField select required fullWidth label="Naturaleza de la vulneración" name="tipoDenuncia" value={formData.tipoDenuncia} onChange={handleFormChange}>
                  {tiposDenuncia.map((tipo) => (
                    <MenuItem key={tipo} value={tipo} sx={{ py: 1.2, whiteSpace: 'normal' }}>
                      {tipo}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField required fullWidth multiline minRows={6} label="Relación cronológica de los hechos" name="descripcion" value={formData.descripcion} onChange={handleFormChange} placeholder="Describa con detalle fechas, lugares y cargos involucrados." />
              </Stack>
            </Box>

            {/* BOTÓN ALINEADO A LA DERECHA Y CUADRADO */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 2 }}>
              <Button 
                type="submit" 
                variant="contained" 
                color="secondary" 
                disableElevation
                sx={{ py: 1.5, px: 6, fontSize: '1rem', fontWeight: 'bold', borderRadius: 1, color: '#000' }}
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