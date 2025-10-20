const wppconnect = require('@wppconnect-team/wppconnect');
const QRCode = require('qrcode');
const fs = require('fs');
const express = require('express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Variable global para almacenar el cliente
let globalClient = null;

// Usar /data para persistencia en Railway (volumen persistente)
// Si no existe, usar ./tokens como fallback
const dataPath = fs.existsSync('/data') ? '/data' : './tokens';
console.log(`📁 Usando directorio para tokens: ${dataPath}`);

// Función principal para iniciar el bot
async function start() {
  console.log('Iniciando bot de WhatsApp...');

  wppconnect
    .create({
      session: 'mi-sesion', // Nombre de la sesión
      folderNameToken: dataPath, // Usar directorio persistente
      autoClose: 300000, // 5 minutos para escanear el QR (en milisegundos)
      catchQR: async (base64Qrimg, asciiQR, attempts, urlCode) => {
        console.log('\n===========================================');
        console.log('ESCANEA EL CÓDIGO QR CON TU WHATSAPP:');
        console.log('Tienes 5 MINUTOS para escanearlo');
        console.log('===========================================\n');

        // Guardar QR como imagen PNG
        const qrPath = '/tmp/qr-code.png';
        const base64Data = base64Qrimg.replace(/^data:image\/png;base64,/, '');
        fs.writeFileSync(qrPath, base64Data, 'base64');
        console.log(`✅ QR guardado en: ${qrPath}`);

        // Generar un QR más grande para mejor escaneo
        try {
          const largeQrPath = '/tmp/qr-code-large.png';
          await QRCode.toFile(largeQrPath, urlCode, {
            width: 600,
            margin: 2
          });
          console.log(`✅ QR grande guardado en: ${largeQrPath}`);
        } catch (err) {
          console.error('Error generando QR grande:', err);
        }

        console.log('\n📱 OPCIÓN 1: Descarga el QR desde Railway');
        console.log('   Ve a la pestaña "Data" en Railway y descarga: /tmp/qr-code-large.png');

        console.log('\n🔗 OPCIÓN 2: Usa este link (expira en 20 segundos):');
        console.log(urlCode);

        console.log(`\n🔄 Intento: ${attempts}`);
        console.log('\n===========================================\n');
      },
      statusFind: (statusSession, session) => {
        console.log('Estado de la sesión:', statusSession);
        console.log('Sesión:', session);
      },
      headless: true, // Ejecuta Chrome en modo headless (sin interfaz gráfica)
      logQR: true, // Muestra el QR en la consola
      puppeteerOptions: {
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      }
    })
    .then((client) => start_bot(client))
    .catch((error) => {
      console.log('Error al iniciar:', error);
    });
}

// Función que maneja el bot una vez conectado
function start_bot(client) {
  console.log('\n✓ Bot conectado exitosamente!\n');

  // Guardar el cliente globalmente para usarlo en la API
  globalClient = client;

  // Escuchar mensajes entrantes
  client.onMessage(async (message) => {
    console.log('Mensaje recibido:', message.body);
    console.log('De:', message.from);

    // Ejemplo: Responder automáticamente
    if (message.body.toLowerCase() === 'hola') {
      await client.sendText(message.from, 'Hola! Soy un bot automatizado.');
    }

    if (message.body.toLowerCase() === 'info') {
      await client.sendText(
        message.from,
        'Este es un bot de WhatsApp creado con WPPConnect.\n\nComandos:\n- hola: Saludo\n- info: Ver esta información'
      );
    }
  });

  // Escuchar cambios de estado
  client.onStateChange((state) => {
    console.log('Estado:', state);
    if (state === 'CONFLICT' || state === 'UNLAUNCHED') {
      client.useHere();
    }
  });

  console.log('El bot está escuchando mensajes...');
}

// Configurar Express
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configuración de Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'WhatsApp Bot API',
      version: '1.0.0',
      description: 'API REST para controlar el bot de WhatsApp',
    },
    servers: [
      {
        url: 'https://whatsapp-bot-production-de76.up.railway.app',
        description: 'Servidor Railway (Producción)'
      },
      {
        url: `http://localhost:${PORT}`,
        description: 'Servidor local (Desarrollo)'
      }
    ],
  },
  apis: ['./index.js'], // Path to the API docs
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Ruta para la página principal (QR Code)
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head><title>WhatsApp Bot</title></head>
      <body style="text-align:center; padding:50px; font-family:Arial;">
        <h1>WhatsApp Bot - API REST</h1>
        <p>Escanea este QR con WhatsApp para vincular el bot:</p>
        <img src="/qr" style="max-width:600px; border:2px solid #000;" />
        <p><a href="/qr" download="whatsapp-qr.png">Descargar QR</a></p>
        <p><small>El QR se renueva cada ~50 segundos</small></p>
        <hr>
        <h2>📚 Documentación de la API</h2>
        <p><a href="/api-docs" style="font-size:20px; color:#0066cc;">Ver Swagger UI</a></p>
      </body>
    </html>
  `);
});

// Ruta para servir el QR
app.get('/qr', (req, res) => {
  const qrPath = '/tmp/qr-code-large.png';
  if (fs.existsSync(qrPath)) {
    res.sendFile(qrPath);
  } else {
    res.status(404).send('QR code not generated yet. Wait for bot to start...');
  }
});

/**
 * @swagger
 * /api/status:
 *   get:
 *     summary: Obtener el estado del bot
 *     description: Devuelve si el bot está conectado o no
 *     responses:
 *       200:
 *         description: Estado del bot
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 connected:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Bot conectado"
 */
app.get('/api/status', (req, res) => {
  if (globalClient) {
    res.json({
      connected: true,
      message: 'Bot conectado'
    });
  } else {
    res.json({
      connected: false,
      message: 'Bot no conectado. Escanea el QR code.'
    });
  }
});

/**
 * @swagger
 * /api/send-message:
 *   post:
 *     summary: Enviar mensaje de WhatsApp
 *     description: Envía un mensaje de texto a un número de WhatsApp
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - number
 *               - message
 *             properties:
 *               number:
 *                 type: string
 *                 description: Número de WhatsApp (con código de país, sin +)
 *                 example: "573001234567"
 *               message:
 *                 type: string
 *                 description: Mensaje a enviar
 *                 example: "Hola, este es un mensaje automático"
 *     responses:
 *       200:
 *         description: Mensaje enviado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Mensaje enviado"
 *       400:
 *         description: Faltan parámetros requeridos
 *       503:
 *         description: Bot no conectado
 */
app.post('/api/send-message', async (req, res) => {
  try {
    const { number, message } = req.body;

    if (!number || !message) {
      return res.status(400).json({
        success: false,
        error: 'Se requieren los campos: number y message'
      });
    }

    if (!globalClient) {
      return res.status(503).json({
        success: false,
        error: 'Bot no conectado. Escanea el QR code primero.'
      });
    }

    // Formatear número (agregar @c.us si no lo tiene)
    const formattedNumber = number.includes('@c.us') ? number : `${number}@c.us`;

    await globalClient.sendText(formattedNumber, message);

    res.json({
      success: true,
      message: 'Mensaje enviado',
      to: formattedNumber
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/send-image:
 *   post:
 *     summary: Enviar imagen por WhatsApp
 *     description: Envía una imagen desde una URL a un número de WhatsApp
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - number
 *               - imageUrl
 *             properties:
 *               number:
 *                 type: string
 *                 description: Número de WhatsApp (con código de país, sin +)
 *                 example: "573001234567"
 *               imageUrl:
 *                 type: string
 *                 description: URL de la imagen
 *                 example: "https://picsum.photos/200"
 *               caption:
 *                 type: string
 *                 description: Texto opcional para acompañar la imagen
 *                 example: "Mira esta imagen"
 *     responses:
 *       200:
 *         description: Imagen enviada exitosamente
 *       400:
 *         description: Faltan parámetros requeridos
 *       503:
 *         description: Bot no conectado
 */
app.post('/api/send-image', async (req, res) => {
  try {
    const { number, imageUrl, caption } = req.body;

    if (!number || !imageUrl) {
      return res.status(400).json({
        success: false,
        error: 'Se requieren los campos: number e imageUrl'
      });
    }

    if (!globalClient) {
      return res.status(503).json({
        success: false,
        error: 'Bot no conectado. Escanea el QR code primero.'
      });
    }

    const formattedNumber = number.includes('@c.us') ? number : `${number}@c.us`;

    await globalClient.sendImage(
      formattedNumber,
      imageUrl,
      'image',
      caption || ''
    );

    res.json({
      success: true,
      message: 'Imagen enviada',
      to: formattedNumber
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/send-file:
 *   post:
 *     summary: Enviar archivo por WhatsApp
 *     description: Envía un archivo desde una URL a un número de WhatsApp
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - number
 *               - fileUrl
 *             properties:
 *               number:
 *                 type: string
 *                 description: Número de WhatsApp (con código de país, sin +)
 *                 example: "573001234567"
 *               fileUrl:
 *                 type: string
 *                 description: URL del archivo
 *                 example: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
 *               filename:
 *                 type: string
 *                 description: Nombre del archivo
 *                 example: "documento.pdf"
 *     responses:
 *       200:
 *         description: Archivo enviado exitosamente
 *       400:
 *         description: Faltan parámetros requeridos
 *       503:
 *         description: Bot no conectado
 */
app.post('/api/send-file', async (req, res) => {
  try {
    const { number, fileUrl, filename } = req.body;

    if (!number || !fileUrl) {
      return res.status(400).json({
        success: false,
        error: 'Se requieren los campos: number y fileUrl'
      });
    }

    if (!globalClient) {
      return res.status(503).json({
        success: false,
        error: 'Bot no conectado. Escanea el QR code primero.'
      });
    }

    const formattedNumber = number.includes('@c.us') ? number : `${number}@c.us`;

    await globalClient.sendFile(
      formattedNumber,
      fileUrl,
      filename || 'file',
      ''
    );

    res.json({
      success: true,
      message: 'Archivo enviado',
      to: formattedNumber
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Iniciar servidor Express
app.listen(PORT, () => {
  console.log(`🌐 Servidor API corriendo en puerto ${PORT}`);
  console.log(`📚 Documentación Swagger: http://localhost:${PORT}/api-docs`);
  console.log(`📱 QR Code: http://localhost:${PORT}/`);
});

// Iniciar el bot
start();
