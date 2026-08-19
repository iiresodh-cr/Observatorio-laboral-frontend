import { Container, Typography, Paper, Box, Divider } from '@mui/material';

export default function Privacidad() {
  return (
    <Container maxWidth="md" sx={{ mt: 5, mb: 5 }}>
      <Paper elevation={3} sx={{ p: { xs: 3, md: 5 }, borderRadius: 2 }}>
        <Typography variant="h4" color="primary" fontWeight="bold" gutterBottom>
          POLÍTICA DE PRIVACIDAD
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" color="primary" fontWeight="bold" gutterBottom>
            1. Responsable del Tratamiento de la Base de Datos
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>Titular / Responsable:</strong> Instituto Internacional de Responsabilidad Social y Derechos Humanos (IIRESODH).<br />
            <strong>Sitio Web:</strong> observatoriolaboralcr.org / iiresodh.org.<br />
            <strong>Contacto de Privacidad y Derechos ARCO:</strong> privacidad@observatoriolaboralcr.org / webmaster@iiresodh.org.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" color="primary" fontWeight="bold" gutterBottom>
            2. Datos Recopilados y Principio de Minimización
          </Typography>
          <Typography variant="body1" paragraph>
            En cumplimiento del principio de calidad de la información y minimización de datos (Art. 6 de la Ley N° 8968), el Observatorio solo solicita la información indispensable para sus fines:
          </Typography>
          <ul>
            <li>
              <Typography variant="body1" paragraph>
                <strong>Modalidad Anónima:</strong> Si el usuario opta por reportar de forma anónima, el sistema no recopila nombres, apellidos, correos electrónicos ni identificadores personales. Únicamente se registran las variables sociodemográficas opcionales (género, provincia, rango de edad, sector económico) y la narración de los hechos fácticos.
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                <strong>Modalidad Identificada (Solicitud de Orientación):</strong> Se recopilan nombre, apellidos y correo electrónico exclusivamente para permitir el envío de la guía informativa de respuesta.
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                <strong>Datos Sensibles:</strong> La narración de los hechos laborales puede contener referencias a situaciones de discriminación, hostigamiento, salud ocupacional o afiliación sindical. Estos datos se tratan bajo estándares reforzados de confidencialidad y bajo el consentimiento expreso otorgado por el titular.
              </Typography>
            </li>
          </ul>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" color="primary" fontWeight="bold" gutterBottom>
            3. Finalidades del Tratamiento
          </Typography>
          <Typography variant="body1" paragraph>
            Los datos personales e informativos captados son tratados para los siguientes fines legítimos:
          </Typography>
          <ul>
            <li>
              <Typography variant="body1" paragraph>
                <strong>Emisión de Guías Informativas:</strong> Analizar la consulta y remitir al correo electrónico facilitado una orientación informativa no vinculante sobre derechos laborales y vías institucionales.
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                <strong>Análisis Estadístico e Investigación Social:</strong> Integrar los datos de vulneraciones de forma disociada y agregada en bases estadísticas públicas, resúmenes analíticos e informes académicos del Observatorio, garantizando la imposibilidad de reidentificación del denunciante.
              </Typography>
            </li>
          </ul>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" color="primary" fontWeight="bold" gutterBottom>
            4. Uso de Tecnologías de Inteligencia Artificial (Vertex AI Enterprise)
          </Typography>
          <Typography variant="body1" paragraph>
            El Observatorio utiliza herramientas avanzadas de procesamiento de lenguaje natural basadas en infraestructura empresarial segura en la nube (Google Cloud Vertex AI Enterprise) para la clasificación preliminar y elaboración de borradores de respuesta.
          </Typography>
          <ul>
            <li>
              <Typography variant="body1" paragraph>
                <strong>Garantía de Privacidad y No Reentrenamiento:</strong> Los datos, hechos y consultas procesadas en este entorno empresarial no se utilizan para entrenar los modelos base comerciales de Google ni se comparten con terceros.
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                <strong>Supervisión Humana (Human-in-the-Loop):</strong> Ninguna respuesta ni informe legal se emite de manera 100% automatizada. Todo borrador estructurado por el modelo de IA es obligatoriamente revisado, ajustado y validado por personal humano antes de su envío.
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                <strong>Minimización de Entrada:</strong> El sistema únicamente transfiere al modelo los hechos y la tipología de la vulneración, excluyendo identificadores directos del usuario.
              </Typography>
            </li>
          </ul>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" color="primary" fontWeight="bold" gutterBottom>
            5. Conservación, Custodia y Transferencia Internacional de Datos
          </Typography>
          <ul>
            <li>
              <Typography variant="body1" paragraph>
                <strong>Seguridad:</strong> Los datos se almacenan en Google Cloud Firestore bajo esquemas de cifrado en tránsito (HTTPS/TLS) y en reposo, con reglas de seguridad que impiden el acceso público no autenticado a los registros.
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                <strong>Transferencia Internacional:</strong> Los servidores de alojamiento se encuentran en centros de datos seguros de Google Cloud ubicados en los Estados Unidos, regulados por el Data Processing and Security Terms (DPST) de Google Cloud bajo estándares internacionales equivalentes de protección.
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                <strong>Plazo de Retención:</strong> Los datos identificativos (nombre y correo) se conservan únicamente durante el tiempo necesario para la atención de la consulta, tras lo cual podrán ser eliminados o disociados permanentemente de las estadísticas históricas.
              </Typography>
            </li>
          </ul>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" color="primary" fontWeight="bold" gutterBottom>
            6. Ejercicio de Derechos ARCO (Acceso, Rectificación, Cancelación y Oposición)
          </Typography>
          <Typography variant="body1" paragraph>
            De conformidad con los artículos 7 y siguientes de la Ley N° 8968, los titulares de los datos pueden ejercer en cualquier momento y de forma gratuita sus derechos de:
          </Typography>
          <ul>
            <li>
              <Typography variant="body1" paragraph>
                <strong>Acceso:</strong> Conocer qué datos personales suyos figuran en las bases del Observatorio.
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                <strong>Rectificación:</strong> Solicitar la corrección o actualización de datos inexactos o incompletos.
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                <strong>Cancelación (Supresión):</strong> Solicitar la eliminación total de sus datos identificables de los registros activos.
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                <strong>Oposición:</strong> Oponerse al tratamiento de sus datos por motivos fundados y legítimos.
              </Typography>
            </li>
          </ul>
          <Typography variant="body1" paragraph>
            Para ejercer estos derechos, el titular debe remitir una solicitud al correo <strong>privacidad@observatoriolaboralcr.org</strong> indicando su nombre, correo registrado y la petición concreta. El plazo máximo de respuesta legal es de cinco (5) días hábiles.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}
