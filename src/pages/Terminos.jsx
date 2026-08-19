import { Container, Typography, Paper, Box, Divider } from '@mui/material';

export default function Terminos() {
  return (
    <Container maxWidth="md" sx={{ mt: 5, mb: 5 }}>
      <Paper elevation={3} sx={{ p: { xs: 3, md: 5 }, borderRadius: 2 }}>
        <Typography variant="h4" color="primary" fontWeight="bold" gutterBottom>
          TÉRMINOS Y CONDICIONES DE USO
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" color="primary" fontWeight="bold" gutterBottom>
            1. Naturaleza No Vinculante del Servicio (Deslinde de Responsabilidad)
          </Typography>
          <ul>
            <li>
              <Typography variant="body1" paragraph>
                <strong>Carácter Orientador:</strong> El servicio de recepción de casos y respuesta provisto por el Observatorio tiene una finalidad exclusivamente orientadora, educativa, social y académica.
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                <strong>No Sustitución Legal:</strong> La orientación remitida no constituye patrocinio letrado, mandato judicial ni asesoría jurídica formal, y no sustituye bajo ninguna circunstancia la interposición de denuncias formales ante la Inspección de Trabajo del Ministerio de Trabajo y Seguridad Social (MTSS), el Poder Judicial u otras entidades públicas competentes.
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                <strong>Plazos Legales:</strong> El uso de este formulario no interrumpe los plazos de prescripción ni de caducidad fijados por el Código de Trabajo de Costa Rica para entablar acciones administrativas o demandas judiciales.
              </Typography>
            </li>
          </ul>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" color="primary" fontWeight="bold" gutterBottom>
            2. Responsabilidad del Usuario y Veracidad
          </Typography>
          <Typography variant="body1" paragraph>
            El usuario se compromete a:
          </Typography>
          <ul>
            <li>
              <Typography variant="body1" paragraph>
                Proporcionar información fidedigna, verídica y ajustada a los hechos ocurridos.
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                No utilizar el canal para remitir denuncias falsas, calumniosas, material publicitario no solicitado (spam) ni contenidos ilícitos.
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                Asumir la responsabilidad civil o penal en caso de proporcionar deliberadamente información inexacta con fines lesivos a terceros.
              </Typography>
            </li>
          </ul>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" color="primary" fontWeight="bold" gutterBottom>
            3. Repositorio Documental y Propiedad Intelectual
          </Typography>
          <ul>
            <li>
              <Typography variant="body1" paragraph>
                Los textos normativos, tratados internacionales, jurisprudencia y leyes publicados en el Repositorio Documental son de dominio público conforme al ordenamiento jurídico costarricense.
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                Los análisis analíticos, informes ejecutivos, artículos del blog y la estructura visual de la plataforma son propiedad del Observatorio y del IIRESODH, protegidos por la Ley N° 6683 sobre Derechos de Autor y Conexos. Se autoriza su cita y reproducción con fines académicos y de divulgación citando la fuente.
              </Typography>
            </li>
          </ul>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" color="primary" fontWeight="bold" gutterBottom>
            4. Jurisdicción y Legislación Aplicable
          </Typography>
          <Typography variant="body1" paragraph>
            Para cualquier controversia o interpretación derivada de los presentes términos o del tratamiento de datos personales, las partes se someten a la legislación vigente de la República de Costa Rica y a la jurisdicción de los tribunales competentes de la ciudad de San José, sin perjuicio de las competencias administrativas asignadas a la PRODHAB.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}
