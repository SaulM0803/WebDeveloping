# Fixtech · versión de prueba para la nube

Este paquete incluye el sitio React, el servidor Node, las imágenes, una compilación lista en `dist`, las pruebas y configuración Docker. No incluye datos de clientes, contraseñas ni `node_modules`.

## Servicio Node

1. Extrae el ZIP. Usa la carpeta que contiene `package.json` como raíz del servicio.
2. Selecciona **Node.js 24** o superior.
3. Comando de instalación y compilación: `npm ci && npm run build`.
4. Comando de inicio: `npm start`.
5. Configura `HOST=0.0.0.0`. El servidor usa el `PORT` que le asigne el proveedor; si no lo asigna, configura `PORT=5173`.
6. Monta un disco persistente y configura `DATA_DIR` con su ruta absoluta. Ejecuta una sola instancia del servidor para esta versión SQLite.
7. Activa HTTPS con el proveedor. El proxy debe conservar la cabecera Host del dominio público para que la validación de origen del formulario funcione.

No basta con subir `dist` a un alojamiento estático: el formulario requiere Node y SQLite. Si el servicio solo ofrece archivos estáticos o PHP, necesitarás otro alojamiento para este proyecto.

## Alternativa Docker

Desde la raíz del proyecto:

```sh
docker build -t fixtech-prueba .
docker run -d --name fixtech-prueba -p 5173:5173 -v fixtech-data:/app/data fixtech-prueba
```

En un servicio de contenedores usa el Dockerfile incluido y monta un volumen persistente en `/app/data`. Configura los secretos desde el panel del proveedor. No incluyas `.env` dentro de la imagen.

## Correo y redes

Las solicitudes se guardan sin correo configurado, pero **no llegan avisos al dueño** hasta completar `OWNER_EMAIL`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` y `SMTP_FROM`. Usa `.env.example` como referencia, no como archivo de credenciales público.

Configura `INSTAGRAM_URL`, `FACEBOOK_URL` y `WHATSAPP_NUMBER` cuando tengas los datos. Para consultar registros mediante la API del propietario, configura `ADMIN_TOKEN` con una clave larga y privada; consulta README.md.

## Comprobar el despliegue

- Abre el sitio y cambia entre ES y EN.
- Envía una solicitud con datos ficticios y guarda el folio.
- Reinicia el servicio y verifica que el registro siga disponible mediante la API protegida del propietario.
- Configura SMTP y verifica la recepción de un aviso antes de usar solicitudes reales.

Si el disco del servicio es temporal, los registros se pueden perder al reiniciar o desplegar. Esta versión no incluye cobros ni confirma automáticamente citas. El límite de solicitudes usa la IP que recibe el servidor; detrás de un proxy puede compartirse entre visitantes hasta configurar la confianza en ese proxy según la infraestructura elegida.

El ZIP no publica automáticamente el sitio ni contrata alojamiento.
