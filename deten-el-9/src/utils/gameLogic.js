/**
 * Calcula el resultado basado en la precisión del usuario respecto a los 9.00 segundos.
 */
export function calculateResult(stoppedTime, tolerance = 0.05) {
  const diff = Math.abs(stoppedTime - 9.00);
  const isExact = (diff <= tolerance);

  if (isExact) {
    return {
      score: 100,
      message: "¡HAS GANADO!",
      prize: "30% DE DESCUENTO",
      level: "perfect"
    };
  }

  return {
    score: 10,
    message: "¡Sigue participando!",
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
