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
  const currentHour = now.getHours();

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

        // 1. Decidir si es un giro ganador basado en Win Rate global del 25%
        const isWinner = Math.random() < 0.25;

        // 2. Obtener categorías con stock real (doble chequeo: juego + bloque)
        const possiblePrizes = [];
        const prizeWeights = {
          "DESCUENTO_10": 40,
          "DESCUENTO_20": 10,
          "DESCUENTO_30": 2,
          "HELADO_SOFT": 30,
          "PAPAS_FRITAS": 16,
          "SCHOP_BEBIDA": 12,
          "REGALO_SORPRESA": 12
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
