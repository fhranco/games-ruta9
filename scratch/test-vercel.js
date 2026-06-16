// Script de prueba para validar que api/server.js se pueda inicializar e invocar sin crasheos en Node.js (Versión ESM)
import serverlessFunc from '../api/server.js';

console.log("✅ El módulo api/server.js se importó correctamente.");

// Simular un request y response mínimos para GET /admin/logs
const req = {
  method: 'GET',
  url: 'http://localhost/admin/logs'
};

const res = {
  writeHead: (statusCode, headers) => {
    console.log(`[res.writeHead] Status: ${statusCode}, Headers:`, headers);
  },
  end: (body) => {
    console.log(`[res.end] Body length: ${body ? body.length : 0}`);
    console.log("✅ Simulación finalizada con éxito.");
  }
};

serverlessFunc(req, res).catch(err => {
  console.error("❌ Error durante la ejecución de la función serverless:", err);
});
