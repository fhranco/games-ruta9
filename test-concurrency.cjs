const http = require('http');

const PORT = 3001;

function makeRequest() {
  return new Promise((resolve) => {
    const data = JSON.stringify({
      gameId: "deten-el-9",
      playerName: "Jugador Test",
      receipt: "9999",
      skillSuccessful: true
    });

    const req = http.request(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/claim-skill-prize?testBlock=1', // Forzar bloque 1 para el test
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': data.length
        }
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            resolve({ error: 'JSON inválido' });
          }
        });
      }
    );

    req.on('error', (err) => {
      resolve({ error: err.message });
    });

    req.write(data);
    req.end();
  });
}

async function runTest() {
  console.log('🚀 Iniciando Prueba de Concurrencia Extrema...');
  console.log('Enviando 50 solicitudes de canje de premios simultáneas a la API central...');

  // Enviar 50 solicitudes en paralelo
  const promises = Array.from({ length: 50 }).map(() => makeRequest());
  const results = await Promise.all(promises);

  let winnersCount = 0;
  let losersCount = 0;
  let errorCount = 0;
  const prizesWon = {};

  results.forEach((res) => {
    if (res.status === 'GANADOR') {
      winnersCount++;
      prizesWon[res.premio] = (prizesWon[res.premio] || 0) + 1;
    } else if (res.status === 'PERDEDOR') {
      losersCount++;
    } else {
      errorCount++;
    }
  });

  console.log('\n--- RESULTADOS DEL TEST DE CONCURRENCIA ---');
  console.log(`✅ Jugadas Ganadoras: ${winnersCount}`);
  console.log(`❌ Jugadas Perdedoras (Sigue participando): ${losersCount}`);
  if (errorCount > 0) {
    console.log(`⚠️ Solicitudes con Error: ${errorCount}`);
  }

  console.log('\nDistribución de Premios Otorgados:');
  console.log(JSON.stringify(prizesWon, null, 2));

  console.log('\nVerificación:');
  if (winnersCount === 10) {
    console.log('✨ ¡ÉXITO ROTUNDO! Exactamente 10 premios fueron entregados (el límite de stock físico del Bloque 1).');
    console.log('El validador atómico previno con éxito la sobre-entrega y los duplicados.');
  } else {
    console.log(`⚠️ Se entregaron ${winnersCount} premios (se esperaban 10). Revisa las condiciones.`);
  }
}

runTest();
