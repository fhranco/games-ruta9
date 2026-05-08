/**
 * Calcula el resultado basado en la precisión del usuario respecto a los 9.00 segundos.
 */
export function calculateResult(stoppedTime) {
  const target = 9.00;
  const diff = Math.abs(stoppedTime - target);

  if (diff <= 0.01) {
    return {
      score: 100,
      message: "Punto perfecto Ruta9",
      prize: "3 Cupones para sorteo semanal",
      level: "perfect"
    };
  }

  if (diff <= 0.02) {
    return {
      score: 98,
      message: "Brutal, casi perfecto",
      prize: "2 Cupones para sorteo semanal",
      level: "excellent"
    };
  }

  if (diff <= 0.05) {
    return {
      score: 90,
      message: "Muy cerca",
      prize: "1 Cupón para sorteo semanal",
      level: "great"
    };
  }

  return {
    score: 10,
    message: "Te faltó precisión magallánica",
    prize: "Vuelve mañana por otro intento",
    level: "try-again"
  };
}

/**
 * Genera un código de cupón único con formato R9-DETEN9-DDMM-RANDOM
 */
export function generateCouponCode() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();

  return `R9-DETEN9-${day}${month}-${random}`;
}

export const DAILY_PRIZE_LIMITS = {
  "Papas medianas gratis, cupos limitados": 5,
  "Upgrade de papas en combo": 10,
  "Salsa premium gratis": 20,
  "10% en próxima compra": 100,
  "Participas por combo para dos semanal": 999,
  "Vuelve mañana por otro intento": 999
};
