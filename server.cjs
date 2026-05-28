/**
 * RUTA 9 — Servidor Centralizado de Stock e Inventario
 * =======================================================
 * Este servidor unificado corre en el puerto 3001.
 * Administra el stock central de 122 premios físicos en tiempo real,
 * controla el cronograma de liberación de 5 bloques con rollover
 * y atiende las peticiones transaccionales de ambos tótems.
 * 
 * Ejecución: node server.cjs
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3001;
const DB_FILE = path.join(__dirname, 'stock_db.json');

// Mapeo de nombres descriptivos de premios para los vouchers
const PRIZE_LABELS = {
  "DESCUENTO_30": "30% DE DESCUENTO",
  "DESCUENTO_20": "20% DE DESCUENTO",
  "DESCUENTO_10": "10% DE DESCUENTO",
  "HELADO_SOFT": "HELADO SOFT GRATIS",
  "PAPAS_FRITAS": "PAPAS FRITAS GRATIS",
  "SCHOP_BEBIDA": "BEBIDA O SCHOP GRATIS",
  "REGALO_SORPRESA": "REGALO SORPRESA R9",
  "SIGUE_PARTICIPANDO": "SIGUE PARTICIPANDO"
};

// Configuración inicial de límites horarios
const TIME_BLOCKS = [
  { id: 1, startHour: 12, endHour: 14 },
  { id: 2, startHour: 14, endHour: 16 },
  { id: 3, startHour: 16, endHour: 18 },
  { id: 4, startHour: 18, endHour: 20 },
  { id: 5, startHour: 20, endHour: 22 }
];

// Cargar Base de Datos
let db = null;
let consecutiveLosses = 0;
function loadDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      db = JSON.parse(data);
    } else {
      console.error(`❌ Archivo de base de datos no encontrado en ${DB_FILE}. Por favor, ejecute el script de inicialización.`);
      process.exit(1);
    }
  } catch (err) {
    console.error(`❌ Error leyendo base de datos:`, err.message);
    process.exit(1);
  }
}

function saveDb() {
  try {
    db.lastUpdated = new Date().toISOString();
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
  } catch (err) {
    console.error(`❌ Error guardando base de datos:`, err.message);
  }
}

/**
 * Determina el bloque horario activo (1 a 5) según la hora actual
 */
function getActiveBlock(testBlockOverride = null) {
  if (testBlockOverride) {
    const overrideVal = parseInt(testBlockOverride, 10);
    if (overrideVal >= 1 && overrideVal <= 5) return overrideVal;
  }

  const now = new Date();
  const chileTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Santiago"}));
  const currentHour = chileTime.getHours();

  if (currentHour < 12) return 1; // Antes de la apertura, forzar bloque 1
  if (currentHour >= 22) return 5; // Después del cierre, forzar bloque 5

  const block = TIME_BLOCKS.find(b => currentHour >= b.startHour && currentHour < b.endHour);
  return block ? block.id : 5;
}

/**
 * Calcula el inventario disponible acumulado para un bloque horario específico (Rollover activo)
 */
function getAvailableStockForBlock(blockNum) {
  const available = {
    "DESCUENTO_30": 0,
    "DESCUENTO_20": 0,
    "DESCUENTO_10": 0,
    "HELADO_SOFT": 0,
    "PAPAS_FRITAS": 0,
    "SCHOP_BEBIDA": 0,
    "REGALO_SORPRESA": 0
  };

  // Sumar todo lo liberado desde el bloque 1 hasta blockNum
  for (let b = 1; b <= blockNum; b++) {
    const released = db.blockRelease[b.toString()];
    const delivered = db.blockDelivered[b.toString()];
    
    if (released) {
      for (const category in available) {
        available[category] += (released[category] || 0) - (delivered[category] || 0);
      }
    }
  }

  // Asegurar que ningún valor sea negativo
  for (const category in available) {
    available[category] = Math.max(0, available[category]);
  }

  return available;
}

/**
 * Genera un código de cupón único y seguro
 */
function generateCouponCode(prefix) {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `R9-${prefix}-${day}${month}-${random}`;
}

// Configuración de CORS
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Cargar base de datos inicial
loadDb();

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
  const pathName = parsedUrl.pathname;
  const testBlock = parsedUrl.searchParams.get('testBlock');

  // Logs rápidos
  console.log(`➡️ [API] ${req.method} ${pathName}`);

  // Responder CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS_HEADERS);
    res.end();
    return;
  }

  // ====================================================
  // API ENDPOINT: GET /api/stock
  // ====================================================
  if (req.method === 'GET' && pathName === '/api/stock') {
    const activeBlock = getActiveBlock(testBlock);
    const blockAvailable = getAvailableStockForBlock(activeBlock);

    res.writeHead(200, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      ok: true,
      activeBlock,
      blockAvailable,
      gameStock: db.gameStock,
      deliveredCount: db.deliveredCount
    }));
    return;
  }

  // ====================================================
  // API ENDPOINT: GET /api/can-win
  // ====================================================
  if (req.method === 'GET' && pathName === '/api/can-win') {
    const gameId = parsedUrl.searchParams.get('gameId');
    if (!gameId || !db.gameStock[gameId]) {
      res.writeHead(400, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: 'gameId inválido o faltante' }));
      return;
    }

    const activeBlock = getActiveBlock(testBlock);
    const blockAvailable = getAvailableStockForBlock(activeBlock);
    const gameLimits = db.gameStock[gameId];

    // Verificar si queda algún premio físico asignado a este juego y que esté disponible en el bloque actual
    let canWin = false;
    for (const prizeCategory in gameLimits) {
      if (gameLimits[prizeCategory] > 0 && blockAvailable[prizeCategory] > 0) {
        canWin = true;
        break;
      }
    }

    res.writeHead(200, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      ok: true,
      gameId,
      canWin,
      activeBlock
    }));
    return;
  }

  // ====================================================
  // API ENDPOINT: POST /api/spin (RULETA RUTA 9)
  // ====================================================
  if (req.method === 'POST' && pathName === '/api/spin') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const data = body ? JSON.parse(body) : {};
        const playerName = data.playerName || 'Invitado';
        const receipt = data.receipt || '0000';
        const activeBlock = getActiveBlock(testBlock);
        const blockAvailable = getAvailableStockForBlock(activeBlock);
        const ruletaStock = db.gameStock.ruleta;

        // 1. Decidir si es un giro ganador basado en reglas orgánicas controladas
        const ahora = new Date();
        const chileTime = new Date(ahora.toLocaleString("en-US", {timeZone: "America/Santiago"}));
        const hora = chileTime.getHours();
        const minutos = chileTime.getMinutes();
        
        // Ventana Peak: 16:30 - 20:00 (en minutos: 990 a 1200)
        const minutosTotales = hora * 60 + minutos;
        const esPeak = (minutosTotales >= 990 && minutosTotales < 1200);
        const winRate = esPeak ? 0.35 : 0.25; // 35% en peak para subir la emoción, 25% estándar
        const maxConsecutiveLossesAllowed = esPeak ? 3 : 5; // Máximo 3 pérdidas en hora peak, 5 en estándar

        let isWinner = Math.random() < winRate;

        // Regla Anti-Sequía: si han perdido demasiados seguidos, el siguiente gana sí o sí
        if (consecutiveLosses >= maxConsecutiveLossesAllowed) {
          isWinner = true;
          console.log(`🛡️ [RULETA] Forzando ganador por regla Anti-Sequía (Tiros perdidos seguidos: ${consecutiveLosses})`);
        }

        const possiblePrizes = [];
        const prizeWeights = {
          "HELADO_SOFT": 50,     // ¡El Helado Soft es ahora el premio más fácil y común de ganar!
          "DESCUENTO_10": 25,
          "PAPAS_FRITAS": 16,
          "SCHOP_BEBIDA": 12,
          "REGALO_SORPRESA": 12,
          "DESCUENTO_20": 10,
          "DESCUENTO_30": 2
        };

        for (const prize in ruletaStock) {
          if (ruletaStock[prize] > 0 && blockAvailable[prize] > 0) {
            possiblePrizes.push({
              id: prize,
              weight: prizeWeights[prize] || 10
            });
          }
        }

        // Si decide perder, o no hay premios físicos disponibles en el bloque/ruleta, forzar "Sigue Jugando"
        if (!isWinner || possiblePrizes.length === 0) {
          // Si el jugador realmente perdió por azar (y no por falta absoluta de stock), aumentamos pérdidas
          if (possiblePrizes.length > 0) {
            consecutiveLosses++;
          }
          
          // Índices de pérdida de la ruleta en el frontend (1, 3, 5 son "SIGUE JUGANDO")
          const losingIndices = [1, 3, 5];
          const selectedIndex = losingIndices[Math.floor(Math.random() * losingIndices.length)];

          res.writeHead(200, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            status: "PERDEDOR",
            premio: "SIGUE_PARTICIPANDO",
            label: PRIZE_LABELS["SIGUE_PARTICIPANDO"],
            index: selectedIndex,
            couponCode: ""
          }));
          return;
        }

        // 3. Selección probabilística ponderada con redirección de pesos automática
        const totalWeight = possiblePrizes.reduce((sum, p) => sum + p.weight, 0);
        let randomVal = Math.random() * totalWeight;
        let selectedPrize = possiblePrizes[0].id;

        for (const p of possiblePrizes) {
          randomVal -= p.weight;
          if (randomVal <= 0) {
            selectedPrize = p.id;
            break;
          }
        }

        // Mapear el premio seleccionado al segmento correspondiente del frontend (8 segmentos)
        // Segmentos: 0: Desc R9, 1: Sigue, 2: Helado, 3: Sigue, 4: Papas, 5: Sigue, 6: Bebida, 7: Sorpresa
        let targetIndex = 1;
        if (selectedPrize.startsWith("DESCUENTO")) {
          targetIndex = 0;
        } else if (selectedPrize === "HELADO_SOFT") {
          targetIndex = 2;
        } else if (selectedPrize === "PAPAS_FRITAS") {
          targetIndex = 4;
        } else if (selectedPrize === "SCHOP_BEBIDA") {
          targetIndex = 6;
        } else if (selectedPrize === "REGALO_SORPRESA") {
          targetIndex = 7;
        }

        // Resetear contador de pérdidas consecutivas al entregar un premio
        consecutiveLosses = 0;

        // 4. Descontar stock atómicamente
        db.gameStock.ruleta[selectedPrize]--;
        db.blockDelivered[activeBlock.toString()][selectedPrize]++;
        db.deliveredCount++;

        const coupon = generateCouponCode("RULETA");
        const playRecord = {
          id: Math.random().toString(36).substring(2, 11),
          timestamp: new Date().toISOString(),
          game: "ruleta",
          playerName,
          receipt,
          prize: selectedPrize,
          couponCode: coupon,
          block: activeBlock
        };
        db.deliveredList.push(playRecord);

        saveDb();

        console.log(`🏆 [RULETA] Premio otorgado: ${selectedPrize} a ${playerName} (Boleta: ${receipt}). Cupón: ${coupon}`);

        res.writeHead(200, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: "GANADOR",
          premio: selectedPrize,
          label: PRIZE_LABELS[selectedPrize],
          index: targetIndex,
          couponCode: coupon
        }));
      } catch (err) {
        console.error('❌ Error procesando /api/spin:', err.message);
        res.writeHead(500, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: 'Error procesando solicitud' }));
      }
    });
    return;
  }

  // ====================================================
  // API ENDPOINT: POST /api/claim-skill-prize (JUEGOS DE HABILIDAD)
  // ====================================================
  if (req.method === 'POST' && pathName === '/api/claim-skill-prize') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const data = body ? JSON.parse(body) : {};
        const gameId = data.gameId;
        const playerName = data.playerName || 'Invitado';
        const receipt = data.receipt || '0000';
        const skillSuccessful = !!data.skillSuccessful; // Si realmente logró el objetivo en frontend

        if (!gameId || !db.gameStock[gameId]) {
          res.writeHead(400, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: false, error: 'gameId inválido' }));
          return;
        }

        const activeBlock = getActiveBlock(testBlock);
        const blockAvailable = getAvailableStockForBlock(activeBlock);
        const gameStock = db.gameStock[gameId];

        // Si el jugador no lo logró en el frontend o no hay stock, forzar "Sigue Participando"
        if (!skillSuccessful) {
          res.writeHead(200, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            status: "PERDEDOR",
            premio: "SIGUE_PARTICIPANDO",
            label: PRIZE_LABELS["SIGUE_PARTICIPANDO"],
            couponCode: ""
          }));
          return;
        }

        // Buscar qué premios permitidos para este juego tienen stock disponible
        const availablePrizes = [];
        for (const prize in gameStock) {
          if (gameStock[prize] > 0 && blockAvailable[prize] > 0) {
            availablePrizes.push(prize);
          }
        }

        if (availablePrizes.length === 0) {
          // Bloqueo total de premios físicos: stock agotado
          res.writeHead(200, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            status: "PERDEDOR",
            premio: "SIGUE_PARTICIPANDO",
            label: PRIZE_LABELS["SIGUE_PARTICIPANDO"],
            couponCode: ""
          }));
          return;
        }

        // Seleccionar un premio disponible. Prioridad por stock o aleatorio
        // Elegimos de forma aleatoria simple de los que quedan
        const selectedPrize = availablePrizes[Math.floor(Math.random() * availablePrizes.length)];

        // Descontar stock atómicamente
        db.gameStock[gameId][selectedPrize]--;
        db.blockDelivered[activeBlock.toString()][selectedPrize]++;
        db.deliveredCount++;

        const coupon = generateCouponCode(gameId.toUpperCase().replace('-', ''));
        const playRecord = {
          id: Math.random().toString(36).substring(2, 11),
          timestamp: new Date().toISOString(),
          game: gameId,
          playerName,
          receipt,
          prize: selectedPrize,
          couponCode: coupon,
          block: activeBlock
        };
        db.deliveredList.push(playRecord);

        saveDb();

        console.log(`🏆 [HABILIDAD: ${gameId}] Premio otorgado: ${selectedPrize} a ${playerName} (Boleta: ${receipt}). Cupón: ${coupon}`);

        res.writeHead(200, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: "GANADOR",
          premio: selectedPrize,
          label: PRIZE_LABELS[selectedPrize],
          couponCode: coupon
        }));
      } catch (err) {
        console.error('❌ Error procesando /api/claim-skill-prize:', err.message);
        res.writeHead(500, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: 'Error procesando solicitud' }));
      }
    });
    return;
  }

  // ====================================================
  // API ENDPOINT: GET /admin/logs (PANEL DE AUDITORÍA)
  // ====================================================
  if (req.method === 'GET' && pathName === '/admin/logs') {
    let tableRows = '';
    const reversedList = [...db.deliveredList].reverse(); // Últimos primeros
    reversedList.forEach(log => {
      const date = new Date(log.timestamp).toLocaleString('es-CL');
      tableRows += `
        <tr class="border-b border-slate-800 hover:bg-slate-900/40 transition-colors">
          <td class="px-6 py-4 font-mono text-xs text-slate-500">${log.id}</td>
          <td class="px-6 py-4 font-semibold text-slate-355">${date}</td>
          <td class="px-6 py-4">
            <span class="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-950 border border-slate-800 text-[#FFB800]">${log.game.toUpperCase()}</span>
          </td>
          <td class="px-6 py-4 font-medium text-white">${log.playerName}</td>
          <td class="px-6 py-4 font-mono text-xs text-slate-400">${log.receipt}</td>
          <td class="px-6 py-4">
            <span class="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-950 border border-slate-800 text-glow-red text-white">${PRIZE_LABELS[log.prize] || log.prize}</span>
          </td>
          <td class="px-6 py-4 font-mono text-sm font-black text-[#FFB800] select-all">${log.couponCode}</td>
          <td class="px-6 py-4 font-black text-xs text-slate-500 text-center">B${log.block}</td>
        </tr>
      `;
    });

    const summaryCounts = {};
    db.deliveredList.forEach(log => {
      summaryCounts[log.game] = (summaryCounts[log.game] || 0) + 1;
    });

    const totalDelivered = db.deliveredCount || db.deliveredList.length;

    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Ruta 9 — Panel de Auditoría de Premios</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;900&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Outfit', sans-serif;
    }
    .font-mono {
      font-family: 'JetBrains Mono', monospace;
    }
    .text-glow-red {
      text-shadow: 0 0 10px rgba(197, 32, 38, 0.4);
    }
    .text-glow-gold {
      text-shadow: 0 0 10px rgba(255, 184, 0, 0.4);
    }
  </style>
</head>
<body class="bg-slate-950 text-white min-h-screen p-6 md:p-12 relative overflow-x-hidden selection:bg-amber-500 selection:text-black">
  <div class="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-[#C52026]/5 blur-[120px] pointer-events-none"></div>
  <div class="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-[#FFB800]/5 blur-[120px] pointer-events-none"></div>

  <div class="max-w-7xl mx-auto space-y-12">
    <!-- Header -->
    <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-900 pb-8">
      <div>
        <h1 class="text-4xl font-black italic tracking-tighter flex items-center gap-2">
          <span>RUTA</span><span class="text-[#C52026]">9</span>
          <span class="font-light opacity-50 uppercase tracking-widest text-xs border-l border-white/20 pl-4 ml-2">PREMIUM LOGS</span>
        </h1>
        <p class="text-slate-500 text-sm mt-1.5 font-medium">Registro de auditoría transaccional de tótems en tiempo real.</p>
      </div>
      
      <div class="flex items-center gap-4 bg-slate-900/60 border border-slate-800 rounded-2xl px-6 py-3.5 shadow-xl backdrop-blur-md">
        <div class="text-right">
          <p class="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">TOTAL ENTREGADOS</p>
          <p class="text-3xl font-black text-[#FFB800] text-glow-gold mt-1 leading-none">${totalDelivered}</p>
        </div>
      </div>
    </header>

    <!-- Resumen por Juego -->
    <section class="grid grid-cols-2 md:grid-cols-5 gap-4">
      \${["ruleta", "deten-el-9", "punto-perfecto", "calza-burger", "memoria-burger"].map(game => \`
        <div class="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 shadow-lg backdrop-blur-sm flex flex-col justify-between">
          <span class="text-[9px] font-black text-slate-500 uppercase tracking-widest">\${game.toUpperCase()}</span>
          <span class="text-3xl font-black text-white mt-3 leading-none">\${summaryCounts[game] || 0}</span>
        </div>
      \`).join('')}
    </section>

    <!-- Tabla de Giros -->
    <section class="bg-slate-900/20 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md">
      <div class="px-6 py-5 border-b border-slate-850 bg-slate-950/40 flex justify-between items-center">
        <h2 class="text-lg font-black tracking-tight flex items-center gap-2">
          <span>🧾</span> HISTORIAL DE GIROS Y GANADORES
        </h2>
        <span class="text-xs text-slate-500 font-semibold uppercase tracking-wider bg-slate-950 border border-slate-800 px-3 py-1 rounded-full">Últimos primeros</span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-slate-800 bg-slate-950/20 text-[10px] font-black text-slate-500 uppercase tracking-widest">
              <th class="px-6 py-4">ID Transacción</th>
              <th class="px-6 py-4">Fecha / Hora</th>
              <th class="px-6 py-4">Tótem</th>
              <th class="px-6 py-4">Jugador</th>
              <th class="px-6 py-4">Boleta</th>
              <th class="px-6 py-4">Premio Otorgado</th>
              <th class="px-6 py-4">Código de Voucher</th>
              <th class="px-6 py-4 text-center">Bloque</th>
            </tr>
          </thead>
          <tbody>
            \${tableRows || \`
              <tr>
                <td colspan="8" class="text-center py-16 text-slate-600 font-semibold uppercase tracking-widest text-sm">
                  📭 Sin giros registrados en este local aún.
                </td>
              </tr>
            \`}
          </tbody>
        </table>
      </div>
    </section>
  </div>
</body>
</html>
    `;
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
    return;
  }

  // 404 para cualquier otra ruta
  res.writeHead(404, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ ok: false, error: 'Ruta no encontrada' }));
});

server.listen(PORT, '127.0.0.1', () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║  🎮 RUTA 9 — Servidor Centralizado de Stock (3001)  ║');
  console.log('╠══════════════════════════════════════════════════════╣');
  console.log(`║  🌐 Escuchando en: http://0.0.0.0:${PORT}             ║`);
  console.log('║                                                      ║');
  console.log('║  API activa:                                         ║');
  console.log('║    • GET /api/stock                                  ║');
  console.log('║    • GET /api/can-win?gameId=<gameId>                ║');
  console.log('║    • POST /api/spin                                  ║');
  console.log('║    • POST /api/claim-skill-prize                     ║');
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log('');
});
