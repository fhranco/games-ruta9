import React from 'react';
import PrimaryButton from './PrimaryButton';
import { motion } from 'framer-motion';
import { ChevronLeft, Info } from 'lucide-react';

export default function RulesScreen({ onBack }) {
  const rules = [
    "Máximo 3 intentos por boleta de compra real.",
    "Gana 1, 2 o 3 tickets para el sorteo semanal según tu precisión.",
    "Debes detener el tiempo entre 8.950s y 9.050s para ganar.",
    "Muestra el resultado al personal de Ruta9 para validar tus tickets.",
    "Los tickets acumulados son válidos para el sorteo de la semana en curso.",
    "Cualquier intento de fraude anulará tu participación."
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full flex flex-col justify-between py-12"
    >
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-3 bg-r9-charcoal rounded-full text-white/50">
            <ChevronLeft size={24} />
          </button>
          <h2 className="text-4xl font-black text-white uppercase italic">Reglas del <span className="text-r9-red">Juego</span></h2>
        </div>

        <div className="space-y-4">
            {rules.map((rule, idx) => (
                <div key={idx} className="flex gap-4 p-5 bg-r9-charcoal/50 border border-white/5 rounded-2xl items-start">
                    <div className="w-6 h-6 rounded-full bg-r9-red flex items-center justify-center flex-shrink-0 text-[10px] font-black">
                        {idx + 1}
                    </div>
                    <p className="text-white/60 leading-tight">{rule}</p>
                </div>
            ))}
        </div>

        <div className="p-6 bg-r9-gold/10 border border-r9-gold/20 rounded-3xl flex gap-4 items-center">
            <Info className="text-r9-gold flex-shrink-0" size={32} />
            <p className="text-r9-gold text-xs font-bold leading-tight uppercase italic">
                Cualquier intento de manipulación del sistema anulará la entrega de beneficios.
            </p>
        </div>
      </div>

      <PrimaryButton variant="outline" onClick={onBack}>
        VOLVER
      </PrimaryButton>
    </motion.div>
  );
}
