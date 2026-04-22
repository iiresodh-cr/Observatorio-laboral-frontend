import { useState, useRef, useEffect } from 'react';
import { 
  Container, Paper, Box, Typography, TextField, IconButton, 
  Avatar, Tabs, Tab, Button, MenuItem, 
  Dialog, DialogTitle, DialogContent, DialogActions 
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import ForumIcon from '@mui/icons-material/Forum';
import AssignmentIcon from '@mui/icons-material/Assignment';
import InfoIcon from '@mui/icons-material/Info';

// Opciones para el tipo de denuncia laboral
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

export default function Denuncia() {
  const [tabValue, setTabValue] = useState(0);

  // 1. ESTADO PARA EL MODAL LEGAL (Inicia abierto por defecto)
  const [openModal, setOpenModal] = useState(true);

  // 2. ESTADO PARA EL MODAL DE RESULTADOS DEL FORMULARIO
  const [resultModal, setResultModal] = useState({ 
    open: false, 
    title: '', 
    message: '' 
  });

  // --- ESTADOS PARA EL CHAT DE IA ---
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: 'Hola. Soy el asistente de orientación del Observatorio. Cuéntame tu situación y buscaré en la legislación para darte una guía preliminar.' }
  ]);
  const [inputChat, setInputChat] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (tabValue === 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, tabValue]);

  const handleSendChat = () => {
    if (inputChat.trim() === '') return;
    const newUserMessage = { id: Date.now(), sender: 'user', text: inputChat };
    setMessages((prev) => [...prev, newUserMessage]);
    setInputChat('');

    setTimeout(() => {
      const botResponse = { id: Date.now() + 1, sender: 'bot', text: 'He recibido tu consulta. Estoy analizando la legislación...' };
      setMessages((prev) => [...prev, botResponse]);
    }, 1000);
  };

  const handleKeyPressChat = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendChat();
    }
  };

  // --- ESTADOS PARA EL FORMULARIO DE DENUNCIA ---
  const [formData, setFormData] = useState({
    nombre: '', 
    empresa: '',
    tipoDenuncia: '',
    descripcion: '',
  });

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    // Abrir modal de éxito en lugar de alert()
    setResultModal({
      open: true,
      title: 'Denuncia Registrada',
      message: 'Tu caso ha sido registrado con éxito en el Observatorio. Gracias por tu reporte. (Simulación)'
    });
    
    // Limpiar el formulario
    setFormData({ nombre: '', empresa: '', tipoDenuncia: '', descripcion: '' });
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      
      {/* --- MODAL DE AVISO LEGAL --- */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} disableEscapeKeyDown>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main', fontWeight: 'bold' }}>
          <InfoIcon /> Aviso Importante
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Esta es una herramienta de Inteligencia Artificial diseñada para brindar orientación preliminar basada en la legislación de Costa Rica.
          </Typography>
          <Typography variant="body1" fontWeight="bold" color="error">
            No constituye asesoría legal oficial ni reemplaza el criterio de un abogado.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            El Observatorio recopila la información ingresada en los formularios con fines puramente estadísticos. Tus datos personales serán tratados de forma confidencial.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenModal(false)} variant="contained" color="primary">
            Entendido, continuar
          </Button>
        </DialogActions>
      </Dialog>

      {/* --- MODAL DE RESULTADO DE FORMULARIO --- */}
      <Dialog open={resultModal.open} onClose={() => setResultModal({ ...resultModal, open: false })}>
        <DialogTitle sx={{ color: 'primary.main', fontWeight: 'bold' }}>
          {resultModal.title}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">{resultModal.message}</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setResultModal({ ...resultModal, open: false })} variant="contained" color="primary">
            Aceptar
          </Button>
        </DialogActions>
      </Dialog>

      <Typography variant="h4" color="primary" fontWeight="bold" gutterBottom>
        Centro de Orientación y Denuncia
      </Typography>

      <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden', mt: 3 }}>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#f4f6f8' }}>
          <Tabs value={tabValue} onChange={(e, val) => setTabValue(val)} variant="fullWidth" textColor="primary" indicatorColor="secondary">
            <Tab icon={<ForumIcon />} iconPosition="start" label="1. Asistente de Orientación (IA)" />
            <Tab icon={<AssignmentIcon />} iconPosition="start" label="2. Registro Formal de Denuncia" />
          </Tabs>
        </Box>

        {/* --- VISTA 1: CHAT DE IA --- */}
        {tabValue === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '60vh' }}>
            <Box sx={{ flexGrow: 1, p: 2, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2, bgcolor: '#fafafa' }}>
              {messages.map((msg) => (
                <Box key={msg.id} sx={{ display: 'flex', flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row', gap: 1.5 }}>
                  <Avatar sx={{ bgcolor: msg.sender === 'user' ? 'secondary.main' : 'primary.main' }}>
                    {msg.sender === 'user' ? <PersonIcon sx={{ color: '#000' }}/> : <SmartToyIcon />}
                  </Avatar>
                  <Box sx={{ maxWidth: '75%', p: 2, borderRadius: 2, bgcolor: msg.sender === 'user' ? 'white' : '#e3f2fd', border: '1px solid', borderColor: msg.sender === 'user' ? 'grey.300' : 'primary.light', boxShadow: 1 }}>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{msg.text}</Typography>
                  </Box>
                </Box>
              ))}
              <div ref={messagesEndRef} />
            </Box>
            <Box sx={{ p: 2, bgcolor: 'white', borderTop: '1px solid #e0e0e0', display: 'flex', gap: 1 }}>
              <TextField fullWidth variant="outlined" placeholder="Describe tu situación aquí..." value={inputChat} onChange={(e) => setInputChat(e.target.value)} onKeyDown={handleKeyPressChat} multiline maxRows={3} />
              <IconButton color="primary" onClick={handleSendChat} disabled={inputChat.trim() === ''} sx={{ alignSelf: 'flex-end', mb: 0.5 }}>
                <SendIcon fontSize="large" />
              </IconButton>
            </Box>
          </Box>
        )}

        {/* --- VISTA 2: FORMULARIO DE DENUNCIA --- */}
        {tabValue === 1 && (
          <Box component="form" onSubmit={handleFormSubmit} sx={{ p: { xs: 2, md: 4 }, bgcolor: 'white' }}>
            <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
              Formulario de Registro para el Observatorio
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Completa este formulario para que tu caso quede registrado en nuestra base de datos. Puedes dejar el nombre en blanco si deseas que el registro sea completamente anónimo.
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3 }}>
                <TextField fullWidth label="Nombre completo (Opcional)" name="nombre" value={formData.nombre} onChange={handleFormChange} variant="outlined" />
                <TextField fullWidth label="Empresa o Patrono" name="empresa" value={formData.empresa} onChange={handleFormChange} variant="outlined" required />
              </Box>

              <TextField fullWidth select label="Tipo de Afectación / Denuncia" name="tipoDenuncia" value={formData.tipoDenuncia} onChange={handleFormChange} variant="outlined" required>
                <MenuItem value="" disabled><em>Seleccione una opción...</em></MenuItem>
                {tiposDenuncia.map((tipo) => (
                  <MenuItem key={tipo} value={tipo}>{tipo}</MenuItem>
                ))}
              </TextField>

              <TextField fullWidth label="Descripción detallada de los hechos" name="descripcion" value={formData.descripcion} onChange={handleFormChange} variant="outlined" multiline minRows={5} required placeholder="Menciona fechas, lugares y detalles relevantes..." />

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                <Button type="submit" variant="contained" color="secondary" size="large" sx={{ fontWeight: 'bold', color: '#000', px: 4, py: 1.5, borderRadius: 2 }}>
                  Registrar Denuncia
                </Button>
              </Box>

            </Box>
          </Box>
        )}
      </Paper>
    </Container>
  );
}