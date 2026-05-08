const PLAYS_KEY = 'ruta9_games_plays';
const DAILY_PRIZES_KEY = 'ruta9_games_daily_prizes';

export const storage = {
  savePlay: (playData) => {
    const plays = storage.getPlays();
    plays.push({
      ...playData,
      createdAt: new Date().toISOString(),
      status: 'pending'
    });
    localStorage.setItem(PLAYS_KEY, JSON.stringify(plays));
    
    // Actualizar contador diario de premios
    if (playData.prize) {
        storage.incrementDailyPrize(playData.prize);
    }
  },

  getPlays: () => {
    const data = localStorage.getItem(PLAYS_KEY);
    return data ? JSON.parse(data) : [];
  },

  incrementDailyPrize: (prizeName) => {
    const today = new Date().toISOString().split('T')[0];
    const dailyData = storage.getDailyPrizes();
    
    if (!dailyData[today]) dailyData[today] = {};
    dailyData[today][prizeName] = (dailyData[today][prizeName] || 0) + 1;
    
    localStorage.setItem(DAILY_PRIZES_KEY, JSON.stringify(dailyData));
  },

  getDailyPrizes: () => {
    const data = localStorage.getItem(DAILY_PRIZES_KEY);
    return data ? JSON.parse(data) : {};
  },

  getReceiptPlayCount: (receipt) => {
    const plays = storage.getPlays();
    return plays.filter(p => p.receipt === receipt).length;
  },

  getPrizeCountToday: (prizeName) => {
    const today = new Date().toISOString().split('T')[0];
    const dailyData = storage.getDailyPrizes();
    return (dailyData[today] && dailyData[today][prizeName]) || 0;
  },

  markAsUsed: (couponId) => {
    const plays = storage.getPlays();
    const updated = plays.map(p => 
        p.id === couponId ? { ...p, status: 'used' } : p
    );
    localStorage.setItem(PLAYS_KEY, JSON.stringify(updated));
  },

  clearData: () => {
    localStorage.removeItem(PLAYS_KEY);
    localStorage.removeItem(DAILY_PRIZES_KEY);
  }
};
