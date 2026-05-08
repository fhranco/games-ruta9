import React, { useState, useEffect } from 'react';
import PrimaryButton from './PrimaryButton';
import { storage } from '../utils/storage';
import { Trash2, CheckCircle, User, Receipt, Clock, Trophy } from 'lucide-react';

export default function AdminPanel({ onBack }) {
  const [plays, setPlays] = useState([]);
  const [stats, setStats] = useState({ total: 0, perfect: 0 });

  useEffect(() => {
    const data = storage.getPlays();
    setPlays(data.reverse());
    setStats({
      total: data.length,
      perfect: data.filter(p => p.score === 100).length
    });
  }, []);

  const handleClear = () => {
    if (confirm('¿Seguro que quieres borrar todo el historial?')) {
      storage.clearData();
      setPlays([]);
      setStats({ total: 0, perfect: 0 });
    }
  };

  const handleMarkUsed = (id) => {
    storage.markAsUsed(id);
    setPlays(storage.getPlays().reverse());
  };

  return (
    <div className="h-full flex flex-col pt-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-black text-r9-gold uppercase tracking-tighter">Control <span className="text-white">Admin</span></h2>
        <button onClick={onBack} className="text-xs uppercase font-black text-white/30 border border-white/10 px-4 py-2 rounded-lg">Salir</button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-r9-charcoal p-6 rounded-2xl border border-white/5">
            <p className="text-[10px] uppercase font-black text-white/30 mb-1">Total Jugadas</p>
            <p className="text-3xl font-black text-white">{stats.total}</p>
        </div>
        <div className="bg-r9-charcoal p-6 rounded-2xl border border-white/5">
            <p className="text-[10px] uppercase font-black text-r9-gold/50 mb-1">Perfectos (9.000)</p>
            <p className="text-3xl font-black text-r9-gold">{stats.perfect}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scroll">
        {plays.map((play) => (
          <div key={play.id} className={`p-4 rounded-2xl border ${play.status === 'used' ? 'bg-black/50 opacity-50 border-white/5' : 'bg-r9-charcoal border-white/10'}`}>
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h4 className="font-black text-white uppercase text-sm flex items-center gap-2">
                        <User size={14} className="text-white/30" /> {play.playerName}
                    </h4>
                    {play.receipt && (
                        <p className="text-[10px] text-white/40 flex items-center gap-2 mt-1">
                            <Receipt size={10} /> Boleta: {play.receipt}
                        </p>
                    )}
                </div>
                <div className="text-right">
                    <p className="text-xs font-black text-r9-gold">{play.stoppedTime.toFixed(3)}s</p>
                </div>
            </div>

            <div className="bg-black/20 p-3 rounded-xl mb-4 flex items-center gap-3">
                <Trophy size={16} className="text-r9-red" />
                <p className="text-xs text-white/60 font-bold uppercase">{play.prize}</p>
            </div>

            {play.status === 'pending' && (
                <button 
                    onClick={() => handleMarkUsed(play.id)}
                    className="w-full py-3 bg-white/5 hover:bg-r9-red/20 text-white text-[10px] font-black uppercase rounded-lg border border-white/10 transition-all flex items-center justify-center gap-2"
                >
                    <CheckCircle size={14} /> Marcar como Canjeado
                </button>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8">
        <button 
          onClick={handleClear}
          className="w-full py-4 text-r9-red text-xs font-black uppercase flex items-center justify-center gap-2 opacity-50 hover:opacity-100 transition-all"
        >
          <Trash2 size={16} /> Limpiar Datos de Prueba
        </button>
      </div>
    </div>
  );
}
