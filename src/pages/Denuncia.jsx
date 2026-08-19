import { useState, useEffect } from 'react';
import { 
  Container, Paper, Box, Typography, TextField, 
  Button, MenuItem, Divider, Stack,
  Dialog, DialogTitle, DialogContent, DialogActions,
  FormControlLabel, Checkbox, CircularProgress, Alert
} from '@mui/material';
import { ClipboardList, Info, Building2, User, ShieldCheck, HelpCircle } from 'lucide-react';

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

const estadosCiviles = ['Soltero/a', 'Casado/a', 'Divorciado/a', 'Viudo/a', 'Unión Libre', 'Prefiero no indicar'];
const nivelesEducativos = [
  'Sin estudios', 'Primaria incompleta', 'Primaria completa', 
  'Secundaria incompleta', 'Secundaria completa', 
  'Técnico / Parauniversitario', 'Universitario', 'Postgrado'
];

export default function Denuncia() {
  const [openModal, setOpenModal] = useState(true);
  const [resultModal, setResultModal] = useState({ open: false, title: '', message: '', severity: 'success' });
  const [loading, setLoading] = useState(false);
  const [isAnonimo, setIsAnonimo] = useState(false);
  const [aceptaTerminos, setAceptaTerminos] = useState(false);

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
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!aceptaTerminos) {
      setResultModal({
        open: true,
        title: 'Consentimiento requerido',
        message: 'Debe aceptar los términos de tratamiento de datos personales para continuar.',
        severity: 'error'
      });
      return;
    }

    setLoading(true);

    try {
      // 1. Delegar análisis de IA al backend
      let borradorIA = '';
      try {
        const response = await fetch('https://observatorio-backend-86857815411.us-central1.run.app/analyze-denuncia', {
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
          borradorIA = data.draft || '';
        }
      } catch (aiError) {
        console.error("Error al generar borrador asistido:", aiError);
      }

      // 2. Depuración de datos según modalidad anónima
      const payload = {
        ...formData,
        nombres: isAnonimo ? 'Anónimo' : formData.nombres,
        apellidos: isAnonimo ? 'Anónimo' : formData.apellidos,
        email: isAnonimo ? null : formData.email,
        esAnonima: isAnonimo,
        consentimientoInformado: true,
        fechaRegistro: serverTimestamp(),
        estado: 'pendiente',
        borradorAsesoria: borradorIA
      };

      // 3. Persistencia en Firestore
      await addDoc(collection(db, "denuncias"), payload);

      // 4. Contador de métricas
      fetch('https://observatorio-backend-86857815411.us-central1.run.app/incrementar-nuevas', {
        method: 'POST'
      }).catch(err => console.error("Error en métricas:", err));

      setResultModal({
        open: true,
        title: 'Reporte Registrado',
        message: isAnonimo 
          ? 'Su reporte ha sido agregado exitosamente a la base estadística del Observatorio.' 
          : 'Su reporte ha sido recibido. El equipo revisará los antecedentes y remitirá una guía orientadora a su correo.',
        severity: 'success'
      });

      setFormData({
        nombres: '', apellidos: '', email: '', edad: '', genero: '', paisResidencia: 'Costa Rica',
        provincia: '', estadoCivil: '', nivelEducativo: '', ingresosMensuales: '', moneda: 'CRC',
        isDefensorDDHH: false, empresa: '', tipoDenuncia: '', descripcion: ''
      });
      setAceptaTerminos(false);
      setIsAnonimo(false);

    } catch (error) {
      setResultModal({
        open: true,
        title: 'Error de Registro',
        message: 'No fue posible registrar su reporte. Por favor intente más tarde.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 5, mb: 8 }}>
      {/* Modal Informativo Inicial */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'primary.main', fontWeight: 'bold' }}>
          <ShieldCheck size={24} /> Marco de Confidencialidad y Fines
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" paragraph>
            Este espacio recopila datos para el análisis estadístico de la situación laboral en Costa Rica e investigación social.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            La información suministrada no constituye una denuncia formal ante el Ministerio de Trabajo y Seguridad Social (MTSS) ni genera patrocinio letrado obligatorio.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenModal(false)} variant="contained" disableElevation>ENTENDIDO</Button>
        </DialogActions>
      </Dialog>

      {/* Modal Resultado */}
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
          Registro de Casos y Orientación Laboral
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Observatorio Laboral. Los datos son tratados conforme a la Ley N° 8968 de Protección de la Persona frente al Tratamiento de sus Datos Personales.
        </Typography>
      </Box>

      <Paper elevation={2} sx={{ borderRadius: 1, overflow: 'hidden', border: '1px solid #e0e0e0' }}>
        <Box sx={{ p: 2.5, bgcolor: '#081A3D', color: 'white', display: 'flex', alignItems: 'center', gap: 2 }}>
          <ClipboardList size={30} />
          <Typography variant="h6" fontWeight="bold">FORMULARIO DE REPORTE</Typography>
        </Box>

        <Box component="form" onSubmit={handleFormSubmit} sx={{ p: { xs: 2.5, md: 4 }, bgcolor: '#ffffff' }}>
          <Stack spacing={3.5}>
            
            {/* Modalidad de Denuncia */}
            <Alert severity="info" icon={<HelpCircle size={20} />}>
              <FormControlLabel 
                control={<Checkbox checked={isAnonimo} onChange={(e) => setIsAnonimo(e.target.checked)} color="primary" />} 
                label={<Typography variant="body2" fontWeight="600">Deseo que este reporte sea 100% anónimo (No recibirá respuesta por correo)</Typography>} 
              />
            </Alert>

            {/* SECCIÓN 1: IDENTIFICACIÓN */}
            <Box>
              <Typography variant="subtitle1" color="primary" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <User size={20} /> 1. IDENTIFICACIÓN Y DATOS DEMOGRÁFICOS
              </Typography>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(12, 1fr)' }, gap: 2.5 }}>
                <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 6' } }}>
                  <TextField fullWidth label="Nombres" name="nombres" value={formData.nombres} onChange={handleFormChange} required={!isAnonimo} disabled={isAnonimo} />
                </Box>
                <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 6' } }}>
                  <TextField fullWidth label="Apellidos" name="apellidos" value={formData.apellidos} onChange={handleFormChange} required={!isAnonimo} disabled={isAnonimo} />
                </Box>
                
                <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 12' } }}>
                  <TextField fullWidth type="email" label="Correo Electrónico (para recibir la guía informativa)" name="email" value={formData.email} onChange={handleFormChange} required={!isAnonimo} disabled={isAnonimo} helperText={isAnonimo ? "Deshabilitado para reportes anónimos" : ""} />
                </Box>

                <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 4' } }}>
                  <TextField select required fullWidth label="País de residencia" name="paisResidencia" value={formData.paisResidencia} onChange={handleFormChange}>
                    {paisesDisponibles.map((p) => <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>)}
                  </TextField>
                </Box>
                <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 4' } }}>
                  <TextField select required fullWidth label="Provincia" name="provincia" value={formData.provincia} onChange={handleFormChange}>
                    {(regionesPorPais[formData.paisResidencia] || []).map((r) => (<MenuItem key={r} value={r}>{r}</MenuItem>))}
                  </TextField>
                </Box>
                <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 4' } }}>
                  <TextField fullWidth type="number" label="Edad" name="edad" value={formData.edad} onChange={handleFormChange} inputProps={{ min: 15 }} />
                </Box>

                <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 4' } }}>
                  <TextField select fullWidth label="Género" name="genero" value={formData.genero} onChange={handleFormChange}>
                    {opcionesGenero.map((opt) => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                  </TextField>
                </Box>
                <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 4' } }}>
                  <TextField select fullWidth label="Estado Civil" name="estadoCivil" value={formData.estadoCivil} onChange={handleFormChange}>
                    {estadosCiviles.map((e) => <MenuItem key={e} value={e}>{e}</MenuItem>)}
                  </TextField>
                </Box>
                <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 4' } }}>
                  <TextField select fullWidth label="Nivel Educativo" name="nivelEducativo" value={formData.nivelEducativo} onChange={handleFormChange}>
                    {nivelesEducativos.map((n) => <MenuItem key={n} value={n}>{n}</MenuItem>)}
                  </TextField>
                </Box>

                <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 8' } }}>
                  <TextField fullWidth type="number" label="Ingresos Mensuales Aproximados (Opcional)" name="ingresosMensuales" value={formData.ingresosMensuales} onChange={handleFormChange} />
                </Box>
                <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 4' } }}>
                  <TextField select fullWidth label="Moneda" name="moneda" value={formData.moneda} onChange={handleFormChange}>
                    <MenuItem value="CRC">CRC (Colones)</MenuItem>
                    <MenuItem value="USD">USD (Dólares)</MenuItem>
                  </TextField>
                </Box>
                
                <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 12' } }}>
                  <FormControlLabel control={<Checkbox name="isDefensorDDHH" checked={formData.isDefensorDDHH} onChange={handleFormChange} color="primary" />} label={<Typography variant="body2">¿Ejerce como persona defensora de Derechos Humanos o líder sindical?</Typography>} />
                </Box>
              </Box>
            </Box>

            <Divider />

            {/* SECCIÓN 2: HECHOS */}
            <Box>
              <Typography variant="subtitle1" color="primary" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Building2 size={20} /> 2. INFORMACIÓN DE LA SITUACIÓN LABORAL
              </Typography>
              
              <Stack spacing={2.5}>
                <TextField required fullWidth label="Nombre de la Empresa o Empleador" name="empresa" value={formData.empresa} onChange={handleFormChange} />
                <TextField select required fullWidth label="Tipo de vulneración laboral" name="tipoDenuncia" value={formData.tipoDenuncia} onChange={handleFormChange}>
                  {tiposDenuncia.map((tipo) => (<MenuItem key={tipo} value={tipo} sx={{ py: 1, whiteSpace: 'normal' }}>{tipo}</MenuItem>))}
                </TextField>
                <TextField required fullWidth multiline minRows={5} label="Descripción cronológica de los hechos" name="descripcion" value={formData.descripcion} onChange={handleFormChange} placeholder="Indique las fechas, acciones ocurridas y el estado actual de su relación laboral." />
              </Stack>
            </Box>

            <Divider />

            {/* CONSENTIMIENTO INFORMADO */}
            <Box sx={{ bgcolor: '#f9f9f9', p: 2, borderRadius: 1, border: '1px solid #e5e5e5' }}>
              <FormControlLabel 
                control={<Checkbox checked={aceptaTerminos} onChange={(e) => setAceptaTerminos(e.target.checked)} color="primary" required />} 
                label={
                  <Typography variant="caption" color="text.secondary">
                    Declaro que la información proporcionada es verídica y autorizo su tratamiento confidencial con fines de orientación e investigación estadística disociada (Ley N° 8968). Entiendo que este canal no sustituye una denuncia formal ante el MTSS ni tribunales judiciales.
                  </Typography>
                } 
              />
            </Box>

            {/* BOTÓN DE ACCIÓN */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2 }}>
              {loading && <CircularProgress size={24} />}
              <Button 
                type="submit" 
                variant="contained" 
                color="primary" 
                disabled={loading || !aceptaTerminos}
                sx={{ py: 1.2, px: 5, fontWeight: 'bold' }}
              >
                {loading ? 'PROCESANDO...' : 'ENVIAR REPORTE'}
              </Button>
            </Box>

          </Stack>
        </Box>
      </Paper>
    </Container>
  );
}