const wppconnect = require('@wppconnect-team/wppconnect');

// Función principal para iniciar el bot
async function start() {
  console.log('Iniciando bot de WhatsApp...');

  wppconnect
    .create({
      session: 'mi-sesion', // Nombre de la sesión
      autoClose: 300000, // 5 minutos para escanear el QR (en milisegundos)
      catchQR: (base64Qrimg, asciiQR, attempts, urlCode) => {
        console.log('\n===========================================');
        console.log('ESCANEA EL CÓDIGO QR CON TU WHATSAPP:');
        console.log('Tienes 5 MINUTOS para escanearlo');
        console.log('===========================================\n');
        console.log(asciiQR); // Muestra el QR en la terminal
        console.log('\nO abre este link en tu navegador:');
        console.log(urlCode);
        console.log(`\nIntento: ${attempts}`);
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

// Iniciar el bot
start();
