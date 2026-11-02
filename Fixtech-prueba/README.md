# Fixtech

Sitio React bilingüe (ES/EN) para cotizar reparaciones de iPhone y Samsung a domicilio. Proyecto local para VS Code. Inspirado en la estructura de iMedic; usa las imágenes proporcionadas en `img/`. No incluye pagos, envíos, Tampa Bay, tablets ni laptops. No se han copiado opiniones, garantías ni datos de contacto de otra empresa.

## Iniciar

Requiere Node.js 24 o superior.

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

Abrir http://localhost:5173. El servidor sirve React y la API en el mismo puerto. No abrir index.html directamente ni usar únicamente Live Server: el registro requiere el servidor Node.

## Configuración

Editar `.env` y reiniciar el servidor. `BUSINESS_NAME` cambia el nombre. `OWNER_EMAIL` es el destinatario. Completar `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` y `SMTP_FROM` con los datos del proveedor de correo del negocio. Usar contraseña de aplicación cuando el proveedor lo requiera. Puerto 465 usa TLS; 587 usa STARTTLS. Las credenciales nunca se exponen al navegador.

Las solicitudes se guardan aunque SMTP no esté configurado. Sin configurar SMTP **no se envían avisos**. Las notificaciones pendientes se reintentan cada minuto, hasta 10 intentos. Consultar los registros para revisar pendientes agotados. Para volver a intentar, el administrador puede restablecer `attempts` en la base de datos después de corregir SMTP. Un envío SMTP aceptado no garantiza entrega en la bandeja de entrada; verificar con el proveedor.

`INSTAGRAM_URL` y `FACEBOOK_URL` aceptan enlaces HTTPS. `WHATSAPP_NUMBER` acepta número internacional con código de país y solo dígitos. Los enlaces aparecen cuando se configuran; mientras tanto se muestra “Redes sociales próximamente”. No se usan cuentas de ejemplo ni cuentas del sitio de referencia.

## Registros del propietario

Base persistente: `data/fixtech.sqlite`. Cada solicitud contiene folio, fecha, modelo, reparaciones, datos de contacto, dirección, preferencia de cita y consentimiento. No se guarda como compra pagada. La cita y el precio siempre requieren confirmación directa.

Configurar un `ADMIN_TOKEN` largo y privado para consultar los últimos 200 registros con `GET /api/admin/quotes` y cabecera `Authorization: Bearer <ADMIN_TOKEN>`. Sin clave se rechaza el acceso. No colocar esa clave en React ni compartirla con clientes. Los registros no son públicos. Hacer copias de seguridad del directorio `data` con el servidor detenido para evitar inconsistencias del WAL de SQLite. La eliminación a petición de un cliente se administra por folio desde SQLite.

## Validación y producción

```powershell
npm test
npm run build
npm start
```

Producción requiere un servicio Node persistente, almacenamiento persistente para `data`, HTTPS mediante un proxy y configuración SMTP real. El servidor escucha en loopback (`127.0.0.1`) para desarrollo y para uso detrás de un proxy. `PORT` cambia el puerto. Este proyecto no está publicado en Internet. En un despliegue con proxy debe configurarse correctamente la IP confiable antes de ajustar el límite de solicitudes (15 por hora/IP). No exponer `data`, `.env` ni los archivos del servidor como contenido estático.

Las fuentes web son opcionales y tienen fuentes de sistema de respaldo. El catálogo está en `src/catalog.js`; los textos ES/EN en `src/main.jsx`. La validación del servidor usa el mismo catálogo. Las preferencias de idioma se guardan en el navegador; los datos personales de cotización se guardan únicamente en el servidor.

Antes de aceptar solicitudes reales: configurar y probar el correo con el propietario, definir la cobertura y horarios, y adaptar el aviso de privacidad a los datos de contacto y política real del negocio.
