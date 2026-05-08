export function calculateBurgerMatchResult(stoppedPosition) {
  const targetPosition = 50;
  const diff = Math.abs(stoppedPosition - targetPosition);

  if (diff <= 2) {
    return {
      score: 100,
      message: "Calce perfecto Ruta9",
      prize: "Participas por combo para dos semanal",
      condition: "Sujeto a sorteo semanal",
      level: "perfect",
      couponPrefix: "R9-PERF"
    };
  }

  if (diff <= 5) {
    return {
      score: 90,
      message: "Tremenda precisión",
      prize: "Upgrade de papas comprando combo",
      condition: "Solo comprando combo",
      level: "excellent",
      couponPrefix: "R9-UPG"
    };
  }

  if (diff <= 10) {
    return {
      score: 75,
      message: "Muy cerca",
      prize: "Salsa premium gratis",
      condition: "Comprando burger",
      level: "good",
      couponPrefix: "R9-SALS"
    };
  }

  if (diff <= 18) {
    return {
      score: 50,
      message: "Buen intento",
      prize: "10% para próxima compra",
      condition: "Válido en próxima visita",
      level: "regular",
      couponPrefix: "R9-NEXT"
    };
  }

  return {
    score: 10,
    message: "Se te movió la burger",
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
