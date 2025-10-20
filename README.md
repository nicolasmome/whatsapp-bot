# 🤖 Bot de WhatsApp con API REST

Bot automatizado de WhatsApp creado con WPPConnect, Express y Swagger. Incluye una API REST completa para enviar mensajes programáticamente.

## 📋 Tabla de Contenidos

- [Características](#características)
- [Requisitos](#requisitos)
- [Instalación Local](#instalación-local)
- [Deployment en Railway](#deployment-en-railway)
- [API REST Endpoints](#api-rest-endpoints)
- [Uso con n8n](#uso-con-n8n)
- [Configuración](#configuración)
- [Troubleshooting](#troubleshooting)

---

## ✨ Características

- ✅ **API REST completa** con Swagger UI
- ✅ **Envío de mensajes** (texto, imágenes, archivos)
- ✅ **Persistencia de sesión** en Railway
- ✅ **QR Code visual** para vincular WhatsApp
- ✅ **CORS habilitado** para integraciones
- ✅ **Documentación interactiva** con Swagger
- ✅ **Comandos automáticos** ("hola", "info")

---

## 📦 Requisitos

- Node.js 18+ instalado
- Una cuenta de WhatsApp
- Cuenta de Railway (para deployment)
- (Opcional) n8n para automatizaciones

---

## 🚀 Instalación Local

### 1. Clonar el repositorio

```bash
git clone https://github.com/nicolasmome/whatsapp-bot.git
cd whatsapp-bot
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Iniciar el bot

```bash
npm start
```

### 4. Escanear el QR

1. Abre http://localhost:3000 en tu navegador
2. Abre WhatsApp en tu teléfono
3. Ve a **Configuración** → **Dispositivos vinculados**
4. Toca **Vincular un dispositivo**
5. Escanea el QR que aparece en la página web

### 5. Probar la API

- **Swagger UI**: http://localhost:3000/api-docs
- **Estado del bot**: http://localhost:3000/api/status

---

## ☁️ Deployment en Railway

### URL de Producción

🌐 **https://whatsapp-bot-production-de76.up.railway.app/**

### Pasos para desplegar

1. **Conecta tu repositorio de GitHub a Railway**
   - Ve a [railway.app](https://railway.app)
   - Click en "New Project"
   - Selecciona "Deploy from GitHub repo"
   - Elige el repositorio `nicolasmome/whatsapp-bot`

2. **Configura el dominio público**
   - En el proyecto, ve a Settings → Networking
   - Click en "Generate Domain"
   - Copia la URL generada

3. **Agrega volumen persistente (opcional pero recomendado)**
   - Ve a la pestaña "Data" o "Volumes"
   - Click en "+ New Volume"
   - Mount Path: `/data`
   - Name: `whatsapp-session`

4. **Escanea el QR**
   - Abre la URL de Railway en tu navegador
   - Escanea el QR con WhatsApp
   - ¡Listo! El bot estará corriendo 24/7

---

## 📡 API REST Endpoints

### Base URL (Producción)
```
https://whatsapp-bot-production-de76.up.railway.app
```

### Documentación Swagger
```
https://whatsapp-bot-production-de76.up.railway.app/api-docs
```

---

### 1️⃣ GET /api/status

Verifica si el bot está conectado.

**Request:**
```bash
curl https://whatsapp-bot-production-de76.up.railway.app/api/status
```

**Response:**
```json
{
  "connected": true,
  "message": "Bot conectado"
}
```

---

### 2️⃣ POST /api/send-message

Envía un mensaje de texto.

**Request:**
```bash
curl -X POST https://whatsapp-bot-production-de76.up.railway.app/api/send-message \
  -H "Content-Type: application/json" \
  -d '{
    "number": "573001234567",
    "message": "Hola, este es un mensaje automático"
  }'
```

**Body Parameters:**
- `number` (string, requerido): Número con código de país sin el `+` (ej: "573001234567")
- `message` (string, requerido): Mensaje a enviar

**Response:**
```json
{
  "success": true,
  "message": "Mensaje enviado",
  "to": "573001234567@c.us"
}
```

---

### 3️⃣ POST /api/send-image

Envía una imagen desde una URL.

**Request:**
```bash
curl -X POST https://whatsapp-bot-production-de76.up.railway.app/api/send-image \
  -H "Content-Type: application/json" \
  -d '{
    "number": "573001234567",
    "imageUrl": "https://picsum.photos/200",
    "caption": "Mira esta imagen"
  }'
```

**Body Parameters:**
- `number` (string, requerido): Número de WhatsApp
- `imageUrl` (string, requerido): URL de la imagen
- `caption` (string, opcional): Texto que acompaña la imagen

---

### 4️⃣ POST /api/send-file

Envía un archivo desde una URL.

**Request:**
```bash
curl -X POST https://whatsapp-bot-production-de76.up.railway.app/api/send-file \
  -H "Content-Type: application/json" \
  -d '{
    "number": "573001234567",
    "fileUrl": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    "filename": "documento.pdf"
  }'
```

**Body Parameters:**
- `number` (string, requerido): Número de WhatsApp
- `fileUrl` (string, requerido): URL del archivo
- `filename` (string, opcional): Nombre del archivo

---

## 🔗 Uso con n8n

### Configuración del nodo HTTP Request

1. **Agrega un nodo "HTTP Request"**
2. **Configura los parámetros:**

```
Method: POST
URL: https://whatsapp-bot-production-de76.up.railway.app/api/send-message
Authentication: None
Send Body: Yes
Body Content Type: JSON
```

3. **Body (JSON):**

```json
{
  "number": "573001234567",
  "message": "Mensaje desde n8n"
}
```

4. **Headers:**

```
Content-Type: application/json
```

### Ejemplo de flujo n8n

```
[Trigger] → [HTTP Request] → [Success]
```

**Casos de uso:**
- Enviar notificaciones automáticas
- Respuestas a webhooks
- Integración con CRM
- Alertas programadas
- Confirmaciones de pedidos

---

## ⚙️ Configuración

### Variables de Entorno (opcional)

Crea un archivo `.env` (local) o configura en Railway:

```bash
PORT=3000
NODE_ENV=production
```

### Estructura del Proyecto

```
whatsapp-bot/
├── index.js              # Código principal (API + Bot)
├── package.json          # Dependencias
├── railway.json          # Configuración Railway
├── Dockerfile            # Configuración Docker
├── nixpacks.toml         # Dependencias de sistema
├── .gitignore            # Archivos ignorados por Git
├── README.md             # Documentación
└── tokens/               # Sesiones de WhatsApp (no commitear)
```

### Dependencias Principales

```json
{
  "@wppconnect-team/wppconnect": "^1.37.5",
  "express": "^5.1.0",
  "swagger-jsdoc": "^6.2.8",
  "swagger-ui-express": "^5.0.1",
  "qrcode": "^1.5.4",
  "cors": "^2.8.5",
  "body-parser": "^2.2.0"
}
```

---

## 🐛 Troubleshooting

### El bot no se conecta

**Problema:** El QR no funciona o expira.

**Solución:**
1. Verifica que el servidor esté corriendo: `GET /api/status`
2. Recarga la página para obtener un nuevo QR
3. Escanea el QR dentro de los 5 minutos
4. No desconectes el dispositivo vinculado manualmente en WhatsApp

---

### Error "Bot no conectado" en la API

**Problema:** Los endpoints devuelven error 503.

**Solución:**
1. Verifica el estado: `GET /api/status`
2. Si `connected: false`, escanea el QR de nuevo
3. En Railway, verifica que el servicio esté corriendo
4. Revisa los logs en Railway Dashboard

---

### Error "Bad request" desde n8n

**Problema:** n8n devuelve error 400.

**Solución:**
1. Verifica que la URL sea correcta (HTTPS, no localhost)
2. Asegúrate de enviar `Content-Type: application/json`
3. El body debe ser JSON válido con `number` y `message`
4. El número debe incluir código de país sin `+`

**Ejemplo correcto:**
```json
{
  "number": "573001234567",
  "message": "Test"
}
```

**Ejemplo incorrecto:**
```json
{
  "number": "+57 300 123 4567",  ❌ Espacios y símbolo +
  "message": "Test"
}
```

---

### Railway se queda sin memoria

**Problema:** El bot se reinicia constantemente.

**Solución:**
1. Railway Free Tier tiene límite de 512MB RAM
2. Considera upgradar a plan Pro
3. O usa un VPS alternativo (DigitalOcean, AWS, etc.)

---

### La sesión se pierde al reiniciar

**Problema:** Cada vez que Railway redeploya, hay que volver a escanear el QR.

**Solución:**
1. Configura un volumen persistente en Railway:
   - Ve a "Data" → "+ New Volume"
   - Mount Path: `/data`
2. El código ya está preparado para usar `/data` si existe
3. Alternativamente, usa Railway Database (PostgreSQL) para guardar sesión

---

### Error de conexión desde n8n

**Problema:** "The service refused the connection"

**Solución:**
1. Verifica que n8n tenga acceso a internet saliente
2. Prueba el endpoint con cURL primero
3. Asegúrate de usar HTTPS (no HTTP)
4. Verifica que Railway no esté en modo sleep (plan Free duerme después de inactividad)

---

## 📚 Recursos Adicionales

- **Documentación WPPConnect**: https://github.com/wppconnect-team/wppconnect
- **Swagger Docs**: https://swagger.io/docs/
- **Railway Docs**: https://docs.railway.app/
- **n8n Docs**: https://docs.n8n.io/

---

## 🔒 Seguridad

⚠️ **IMPORTANTE:**

- No compartas la carpeta `tokens/` (contiene tu sesión activa)
- No expongas tu API públicamente sin autenticación
- WhatsApp puede banear cuentas que usen bots
- Usa bajo tu propio riesgo

### Agregar autenticación (recomendado)

Para proteger tu API, considera agregar:
- API Keys
- JWT Tokens
- Rate limiting
- Whitelist de IPs

---

## 📝 Licencia

ISC

---

## 👨‍💻 Autor

Nicolas Montes

- GitHub: [@nicolasmome](https://github.com/nicolasmome)
- Repositorio: [whatsapp-bot](https://github.com/nicolasmome/whatsapp-bot)

---

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Si encuentras un bug o tienes una mejora:

1. Fork el proyecto
2. Crea una branch (`git checkout -b feature/mejora`)
3. Commit tus cambios (`git commit -m 'Add: nueva funcionalidad'`)
4. Push a la branch (`git push origin feature/mejora`)
5. Abre un Pull Request

---

## 📞 Soporte

Si tienes problemas:

1. Revisa la sección [Troubleshooting](#troubleshooting)
2. Consulta los logs en Railway
3. Abre un issue en GitHub

---

## 🎯 Roadmap

- [ ] Agregar autenticación con API Keys
- [ ] Webhooks para mensajes recibidos
- [ ] Soporte para envío masivo (broadcast)
- [ ] Panel de administración web
- [ ] Métricas y analytics
- [ ] Rate limiting
- [ ] Docker Compose para deployment local

---

**🤖 Generado con [Claude Code](https://claude.com/claude-code)**

Co-Authored-By: Claude <noreply@anthropic.com>
