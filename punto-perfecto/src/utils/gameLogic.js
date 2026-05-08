export function calculatePerfectPointResult(stoppedPosition) {
  const targetPosition = 50;
  const diff = Math.abs(stoppedPosition - targetPosition);

  if (diff <= 1) {
    return {
      score: 100,
      message: "Punto perfecto Ruta9",
      prize: "Participas por combo para dos semanal",
      condition: "Sujeto a sorteo semanal",
      level: "perfect",
      couponPrefix: "R9-PERF"
    };
  }

  if (diff <= 3) {
    return {
      score: 90,
      message: "Tremendo punto",
      prize: "Upgrade de papas comprando combo",
      condition: "Solo comprando combo",
      level: "excellent",
      couponPrefix: "R9-UPG"
    };
  }

  if (diff <= 7) {
    return {
      score: 75,
      message: "Muy buen punto",
      prize: "Salsa premium gratis",
      condition: "Comprando burger",
      level: "good",
      couponPrefix: "R9-SALS"
    };
  }

  if (diff <= 15) {
    return {
      score: 50,
      message: "Casi perfecto",
      prize: "10% para próxima compra",
      condition: "Válido en próxima visita",
      level: "regular",
      couponPrefix: "R9-NEXT"
    };
  }

  return {
    score: 10,
    message: "Se pasó el fuego",
    prize: "Gracias por jugar",
    condition: "Sin beneficio directo",
    level: "try-again",
    couponPrefix: "R9-R9"
  };
}

export function generateCouponCode(prefix) {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();

  return `${prefix}-${day}${month}-${random}`;
}
