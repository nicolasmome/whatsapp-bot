# Bot de WhatsApp con WPPConnect

Bot automatizado de WhatsApp creado con WPPConnect.

## Requisitos

- Node.js instalado ✓
- Una cuenta de WhatsApp

## Instalación

Las dependencias ya están instaladas. Si necesitas reinstalar:

```bash
npm install
```

## Cómo usar

### 1. Iniciar el bot

```bash
node index.js
```

### 2. Escanear el código QR

Cuando ejecutes el bot, aparecerá un código QR en la terminal.

**Pasos:**
1. Abre WhatsApp en tu teléfono
2. Ve a **Configuración** > **Dispositivos vinculados**
3. Toca **Vincular un dispositivo**
4. Escanea el código QR que aparece en tu terminal

### 3. Una vez conectado

El bot comenzará a escuchar mensajes automáticamente.

## Comandos disponibles

Envía estos mensajes al bot desde cualquier chat:

- `hola` - El bot responderá con un saludo
- `info` - Muestra información sobre el bot

## Personalizar el bot

Edita el archivo `index.js` para:

- Agregar más comandos
- Cambiar las respuestas automáticas
- Enviar mensajes programados
- Crear lógica personalizada

### Ejemplo: Agregar un nuevo comando

```javascript
if (message.body.toLowerCase() === 'hora') {
  const hora = new Date().toLocaleTimeString();
  await client.sendText(message.from, `La hora actual es: ${hora}`);
}
```

## Estructura del proyecto

```
whatsapp-bot/
├── index.js          # Archivo principal del bot
├── package.json      # Dependencias del proyecto
├── node_modules/     # Paquetes instalados
└── tokens/           # Sesiones guardadas (se crea automáticamente)
```

## Notas importantes

- **Sesión persistente**: Una vez que escanees el QR, la sesión se guarda en la carpeta `tokens/`. No necesitarás escanear el QR cada vez.
- **Headless**: El bot corre en modo headless (sin ventana de navegador visible).
- **Seguridad**: No compartas la carpeta `tokens/` ya que contiene tu sesión activa.
- **Términos de servicio**: Recuerda que usar bots puede violar los términos de servicio de WhatsApp. Usa bajo tu propio riesgo.

## Documentación completa

Para más funcionalidades, consulta la documentación oficial:
https://github.com/wppconnect-team/wppconnect

## Funciones avanzadas disponibles

- Enviar imágenes, videos, documentos
- Crear grupos
- Enviar mensajes a listas
- Leer estados de mensajes
- Y mucho más...
