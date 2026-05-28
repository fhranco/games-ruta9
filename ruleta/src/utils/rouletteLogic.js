export const ROULETTE_PRIZES = [
  {
    id: "descuento-r9",
    label: "DESCUENTO R9",
    color: "#C52026"
  },
  {
    id: "sigue-jugando",
    label: "SIGUE JUGANDO",
    color: "#111111"
  },
  {
    id: "helado-soft",
    label: "HELADO SOFT",
    color: "#FFB800"
  },
  {
    id: "sigue-jugando",
    label: "SIGUE JUGANDO",
    color: "#111111"
  },
  {
    id: "papas-fritas",
    label: "PAPAS FRITAS",
    color: "#C52026"
  },
  {
    id: "sigue-jugando",
    label: "SIGUE JUGANDO",
    color: "#111111"
  },
  {
    id: "schop-bebida",
    label: "BEBIDA/SCHOP",
    color: "#FFB800"
  },
  {
    id: "regalo-sorpresa",
    label: "SORPRESA R9",
    color: "#C52026"
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
  const extraSpins = 10 + Math.floor(Math.random() * 5);
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
