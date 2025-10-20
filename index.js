const wppconnect = require('@wppconnect-team/wppconnect');
const QRCode = require('qrcode');
const fs = require('fs');
const http = require('http');
const path = require('path');

// Función principal para iniciar el bot
async function start() {
  console.log('Iniciando bot de WhatsApp...');

  wppconnect
    .create({
      session: 'mi-sesion', // Nombre de la sesión
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

// Crear servidor HTTP para descargar el QR
const PORT = process.env.PORT || 3000;
const server = http.createServer((req, res) => {
  if (req.url === '/qr') {
    const qrPath = '/tmp/qr-code-large.png';
    if (fs.existsSync(qrPath)) {
      res.writeHead(200, { 'Content-Type': 'image/png' });
      fs.createReadStream(qrPath).pipe(res);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('QR code not generated yet. Wait for bot to start...');
    }
  } else if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <html>
        <head><title>WhatsApp Bot QR</title></head>
        <body style="text-align:center; padding:50px; font-family:Arial;">
          <h1>WhatsApp Bot - QR Code</h1>
          <p>Escanea este QR con WhatsApp para vincular el bot:</p>
          <img src="/qr" style="max-width:600px; border:2px solid #000;" />
          <p><a href="/qr" download="whatsapp-qr.png">Descargar QR</a></p>
          <p><small>El QR se renueva cada ~50 segundos</small></p>
        </body>
      </html>
    `);
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`🌐 Servidor web corriendo en puerto ${PORT}`);
  console.log(`📱 Abre esta URL para ver el QR: https://tu-app.railway.app/`);
});

// Iniciar el bot
start();
