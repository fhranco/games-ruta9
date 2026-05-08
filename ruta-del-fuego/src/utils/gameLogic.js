export function calculateFireRouteResult(releasedFireLevel) {
  const targetFireLevel = 70;
  const diff = Math.abs(releasedFireLevel - targetFireLevel);

  if (diff <= 2) {
    return {
      score: 100,
      message: "Punto Ruta9 alcanzado",
      prize: "Participas por experiencia Ruta9 para dos",
      condition: "Sujeto a sorteo semanal",
      level: "perfect",
      couponPrefix: "R9-FUEGO"
    };
  }

  if (diff <= 5) {
    return {
      score: 90,
      message: "Fuego perfecto",
      prize: "Upgrade de papas comprando combo",
      condition: "Solo comprando combo",
      level: "excellent",
      couponPrefix: "R9-FUEGO"
    };
  }

  if (diff <= 10) {
    return {
      score: 75,
      message: "Buen punto de brasa",
      prize: "Salsa premium gratis",
      condition: "Comprando burger",
      level: "good",
      couponPrefix: "R9-FUEGO"
    };
  }

  if (diff <= 18) {
    return {
      score: 50,
      message: "Casi llegas al punto",
      prize: "10% para próxima compra",
      condition: "Válido en próxima visita",
      level: "regular",
      couponPrefix: "R9-FUEGO"
    };
  }

  if (releasedFireLevel < targetFireLevel) {
    return {
      score: 10,
      message: "Se apagó la brasa",
      prize: "Gracias por participar",
      condition: "Sin beneficio directo",
      level: "low-fire",
      couponPrefix: "R9-FUEGO"
    };
  }

  return {
    score: 10,
    message: "Se pasó el fuego",
    prize: "Gracias por participar",
    condition: "Sin beneficio directo",
    level: "over-fire",
    couponPrefix: "R9-FUEGO"
  };
}

export function generateCouponCode(prefix) {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();

  return `${prefix}-${day}${month}-${random}`;
}
