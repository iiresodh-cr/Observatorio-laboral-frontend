import { useState, useEffect } from 'react';
import { 
  Container, Paper, Box, Typography, TextField, 
  Button, MenuItem, Divider, Stack,
  Dialog, DialogTitle, DialogContent, DialogActions,
  FormControlLabel, Checkbox, CircularProgress
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import InfoIcon from '@mui/icons-material/Info';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';

import { db } from '../services/firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const tiposDenuncia = [
  'Despido injustificado', 'Impago de salario o extremos laborales',
  'Acoso laboral (Mobbing)', 'Acoso sexual', 'Discriminación',
  'Incumplimiento de jornada u horas extra', 'Riesgos del trabajo / Salud ocupacional', 'Otro'
];

const opcionesGenero = [
  { value: 'femenino', label: 'Femenino' }, { value: 'masculino', label: 'Masculino' },
  { value: 'no_binario', label: 'No binario' }, { value: 'prefiero_no_decir', label: 'Prefiero no decirlo' }
];

const paisesDisponibles = [{ value: 'Costa Rica', label: 'Costa Rica' }];
const regionesPorPais = {
  'Costa Rica': ['San José', 'Alajuela', 'Cartago', 'Heredia', 'Guanacaste', 'Puntarenas', 'Limón']
};

const estadosCiviles = ['Soltero/a', 'Casado/a', 'Divorciado/a', 'Viudo/a', 'Unión Libre'];
const nivelesEducativos = [
  'Sin estudios', 'Primaria incompleta', 'Primaria completa', 
  'Secundaria incompleta', 'Secundaria completa', 
  'Técnico / Parauniversitario', 'Universitario', 'Postgrado'
];

export default function Denuncia() {
  const [openModal, setOpenModal] = useState(true);
  const [resultModal, setResultModal] = useState({ open: false, title: '', message: '', severity: 'success' });
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nombres: '', apellidos: '', email: '', edad: '', genero: '',
    paisResidencia: 'Costa Rica', provincia: '', estadoCivil: '', nivelEducativo: '',
    ingresosMensuales: '', moneda: 'CRC', isDefensorDDHH: false,
    empresa: '', tipoDenuncia: '', descripcion: ''
  });

  useEffect(() => {
    setFormData(prev => ({ ...prev, provincia: '' }));
  }, [formData.paisResidencia]);

  const handleFormChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Solicitar análisis a Gemini en el Backend
      let borradorIA = '';
      try {
        // REEMPLAZA ESTA URL POR LA DE TU CLOUD RUN ACTUAL
        const response = await fetch('https://observatorio-backend-extraccion-86857815411.us-central1.run.app/analyze-denuncia', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tipoDenuncia: formData.tipoDenuncia,
            descripcion: formData.descripcion,
            empresa: formData.empresa
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          borradorIA = data.draft;
        } else {
          // Mejoramos el log de errores para atrapar fallos del servidor 500 o 403
          const errorData = await response.text();
          console.error("Error del servidor al generar IA:", response.status, errorData);
        }
      } catch (aiError) {
        console.error("Error de red obteniendo análisis de IA", aiError);
      }

      // 2. Guardar todo en Firestore
      await addDoc(collection(db, "denuncias"), {
        ...formData,
        fechaRegistro: serverTimestamp(),
        estado: 'pendiente',
        borradorAsesoria: borradorIA
      });

      setResultModal({
        open: true,
        title: 'Reporte Registrado Exitosamente',
        message: 'Su solicitud ha sido recibida. Nuestro equipo revisará su caso y recibirá orientación legal a su correo pronto.',
        severity: 'success'
      });

      setFormData({
        nombres: '', apellidos: '', email: '', edad: '', genero: '', paisResidencia: 'Costa Rica',
        provincia: '', estadoCivil: '', nivelEducativo: '', ingresosMensuales: '', moneda: 'CRC',
        isDefensorDDHH: false, empresa: '', tipoDenuncia: '', descripcion: ''
      });
    } catch (error) {
      setResultModal({
        open: true, title: 'Error de Registro', message: 'No se pudo procesar su reporte. Intente más tarde.', severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 5, mb: 8 }}>
      <Dialog open={openModal} onClose={() => setOpenModal(false)} PaperProps={{ sx: { borderRadius: 1 } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'primary.main', fontWeight: 'bold' }}>
          <InfoIcon /> Marco de Confidencialidad
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body1" paragraph sx={{ fontWeight: 500 }}>
            Este es un espacio seguro para denunciar vulneraciones y recibir orientación.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Toda la información es confidencial. La asesoría brindada servirá de guía inicial sobre sus derechos laborales.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: '#f8f9fa' }}>
          <Button onClick={() => setOpenModal(false)} variant="contained" disableElevation>ACEPTAR Y CONTINUAR</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={resultModal.open} onClose={() => setResultModal({ ...resultModal, open: false })}>
        <DialogTitle sx={{ fontWeight: 'bold', color: resultModal.severity === 'error' ? 'error.main' : 'primary.main' }}>
          {resultModal.title}
        </DialogTitle>
        <DialogContent><Typography>{resultModal.message}</Typography></DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setResultModal({ ...resultModal, open: false })} variant="contained">CERRAR</Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" color="primary" fontWeight="800" gutterBottom>
          Registro de Vulneraciones y Solicitud de Asesoría
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Sistema de captación de datos y orientación legal gratuita del Observatorio Laboral de Costa Rica.
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ borderRadius: 1, overflow: 'hidden', border: '1px solid #e0e0e0' }}>
        <Box sx={{ p: 3, bgcolor: '#003399', color: 'white', display: 'flex', alignItems: 'center', gap: 2 }}>
          <AssignmentIcon fontSize="large" />
          <Typography variant="h6" fontWeight="bold">FORMULARIO DE REPORTE Y ASESORÍA</Typography>
        </Box>

        <Box component="form" onSubmit={handleFormSubmit} sx={{ p: { xs: 3, md: 5 }, bgcolor: '#ffffff' }}>
          <Stack spacing={4}>
            
            <Box>
              <Typography variant="subtitle1" color="primary" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <PersonIcon /> 1. IDENTIFICACIÓN Y DATOS DEMOGRÁFICOS
              </Typography>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(12, 1fr)' }, gap: 3 }}>
                <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 6' } }}>
                  <TextField fullWidth label="Nombres" name="nombres" value={formData.nombres} onChange={handleFormChange} required />
                </Box>
                <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 6' } }}>
                  <TextField fullWidth label="Apellidos" name="apellidos" value={formData.apellidos} onChange={handleFormChange} required />
                </Box>
                
                <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 12' } }}>
                  <TextField required fullWidth type="email" label="Correo Electrónico para recibir la respuesta" name="email" value={formData.email} onChange={handleFormChange} />
                </Box>

                <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 4' } }}>
                  <TextField select required fullWidth label="País de residencia" name="paisResidencia" value={formData.paisResidencia} onChange={handleFormChange}>
                    {paisesDisponibles.map((p) => <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>)}
                  </TextField>
                </Box>
                <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 4' } }}>
                  <TextField select required fullWidth label="Provincia/Región" name="provincia" value={formData.provincia} onChange={handleFormChange} disabled={!formData.paisResidencia}>
                    {(regionesPorPais[formData.paisResidencia] || []).map((r) => (<MenuItem key={r} value={r}>{r}</MenuItem>))}
                  </TextField>
                </Box>
                <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 4' } }}>
                  <TextField required fullWidth type="number" label="Edad" name="edad" value={formData.edad} onChange={handleFormChange} inputProps={{ min: 15 }} />
                </Box>

                <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 4' } }}>
                  <TextField select required fullWidth label="Género" name="genero" value={formData.genero} onChange={handleFormChange}>
                    {opcionesGenero.map((opt) => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                  </TextField>
                </Box>
                <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 4' } }}>
                  <TextField select required fullWidth label="Estado Civil" name="estadoCivil" value={formData.estadoCivil} onChange={handleFormChange}>
                    {estadosCiviles.map((e) => <MenuItem key={e} value={e}>{e}</MenuItem>)}
                  </TextField>
                </Box>
                <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 4' } }}>
                  <TextField select required fullWidth label="Nivel Educativo" name="nivelEducativo" value={formData.nivelEducativo} onChange={handleFormChange}>
                    {nivelesEducativos.map((n) => <MenuItem key={n} value={n}>{n}</MenuItem>)}
                  </TextField>
                </Box>

                <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 8' } }}>
                  <TextField required fullWidth type="number" label="Ingresos Mensuales Aproximados" name="ingresosMensuales" value={formData.ingresosMensuales} onChange={handleFormChange} />
                </Box>
                <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 4' } }}>
                  <TextField select required fullWidth label="Moneda" name="moneda" value={formData.moneda} onChange={handleFormChange}>
                    <MenuItem value="CRC">CRC (Colones)</MenuItem>
                    <MenuItem value="USD">USD (Dólares)</MenuItem>
                  </TextField>
                </Box>
                
                <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 12' }, display: 'flex', alignItems: 'center' }}>
                  <FormControlLabel control={<Checkbox name="isDefensorDDHH" checked={formData.isDefensorDDHH} onChange={handleFormChange} color="primary" />} label={<Typography sx={{ fontWeight: 500 }}>¿Es defensor(a) de Derechos Humanos?</Typography>} />
                </Box>
              </Box>
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle1" color="primary" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <BusinessIcon /> 2. INFORMACIÓN DEL CASO
              </Typography>
              
              <Stack spacing={3}>
                <TextField required fullWidth label="Nombre de la Empresa o Patrono" name="empresa" value={formData.empresa} onChange={handleFormChange} />
                <TextField select required fullWidth label="Naturaleza de la vulneración laboral" name="tipoDenuncia" value={formData.tipoDenuncia} onChange={handleFormChange}>
                  {tiposDenuncia.map((tipo) => (<MenuItem key={tipo} value={tipo} sx={{ py: 1.2, whiteSpace: 'normal' }}>{tipo}</MenuItem>))}
                </TextField>
                <TextField required fullWidth multiline minRows={6} label="Relación cronológica de los hechos" name="descripcion" value={formData.descripcion} onChange={handleFormChange} placeholder="Describa el caso. Nuestro equipo y sistema de inteligencia artificial leerán esto para orientarle." />
              </Stack>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 2, alignItems: 'center', gap: 2 }}>
              {loading && <CircularProgress size={24} />}
              <Button 
                type="submit" variant="contained" color="secondary" disableElevation disabled={loading}
                sx={{ py: 1.5, px: 6, fontSize: '1rem', fontWeight: 'bold', borderRadius: 1, color: '#000' }}
              >
                {loading ? 'ANALIZANDO Y REGISTRANDO...' : 'ENVIAR SOLICITUD'}
              </Button>
            </Box>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
}