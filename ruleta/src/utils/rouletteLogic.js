export const ROULETTE_PRIZES = [
  {
    id: "salsa-premium",
    label: "SALSA GRATIS",
    condition: "Comprando burger",
    weight: 25,
    color: "#D21F2D"
  },
  {
    id: "proxima-compra-10",
    label: "10% DSCTO.",
    condition: "Válido en próxima visita",
    weight: 25,
    color: "#1A1A1A"
  },
  {
    id: "gracias",
    label: "GRACIAS",
    condition: "Sin beneficio directo",
    weight: 15,
    color: "#FFB800"
  },
  {
    id: "bebida-descuento",
    label: "BEBIDA PROMO",
    condition: "Solo comprando combo",
    weight: 12,
    color: "#D21F2D"
  },
  {
    id: "upgrade-papas",
    label: "UPGRADE PAPAS",
    condition: "Solo comprando combo",
    weight: 10,
    color: "#1A1A1A"
  },
  {
    id: "segundo-giro",
    label: "GIRO EXTRA",
    condition: "Máximo una vez por pedido",
    weight: 7,
    color: "#FFB800"
  },
  {
    id: "sorteo-semanal",
    label: "SORTEO SEMANAL",
    condition: "Sujeto a sorteo semanal",
    weight: 5,
    color: "#D21F2D"
  },
  {
    id: "papas-gratis",
    label: "PAPAS GRATIS",
    condition: "Sujeto a disponibilidad diaria",
    weight: 1,
    color: "#FFB800"
  }
];

export function selectWeightedPrize() {
  const totalWeight = ROULETTE_PRIZES.reduce((sum, prize) => sum + prize.weight, 0);
  let random = Math.random() * totalWeight;

  for (let i = 0; i < ROULETTE_PRIZES.length; i++) {
    const prize = ROULETTE_PRIZES[i];
    random -= prize.weight;
    if (random <= 0) {
      return { prize, index: i };
    }
  }

  return { prize: ROULETTE_PRIZES[0], index: 0 };
}

export const calculateRotation = (prizeIndex) => {
  const segmentAngle = 360 / ROULETTE_PRIZES.length;
  const extraSpins = 6 + Math.floor(Math.random() * 4);
  const prizeOffset = -(prizeIndex * segmentAngle) - (segmentAngle / 2);
  
  return (extraSpins * 360) + prizeOffset;
};

export function generateRouletteCouponCode() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();

  return `R9-RULETA-${day}${month}-${random}`;
}
