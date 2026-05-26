/**
 * Generador de sonidos sintéticos para "Calza la Burger" de Ruta9 Games usando Web Audio API.
 * No requiere archivos externos, tiene latencia cero, corre offline y es ultra-seguro ante errores.
 */

class SoundEngine {
    constructor() {
        this.ctx = null;
    }

    // Inicializa el AudioContext de forma defensiva y compatible con navegadores antiguos
    init() {
        try {
            if (!this.ctx) {
                const AudioContextClass = window.AudioContext || window.webkitAudioContext;
                if (AudioContextClass) {
                    this.ctx = new AudioContextClass();
                } else {
                    console.warn("Web Audio API no es compatible con este navegador.");
                }
            }
            if (this.ctx && this.ctx.state === 'suspended') {
                this.ctx.resume().catch(e => console.warn("No se pudo reanudar el AudioContext:", e));
            }
        } catch (e) {
            console.error("Fallo al inicializar AudioContext:", e);
            this.ctx = null;
        }
    }

    // 🎙️ Locutor de Voz Arcade en Español de Chile
    announce(text) {
        if ('speechSynthesis' in window) {
            try {
                // Cancelar locuciones previas
                window.speechSynthesis.cancel();
                
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = 'es-CL'; // Acento chileno
                utterance.rate = 1.15;    // Enérgico
                utterance.pitch = 1.08;   // Entusiasta
                
                const voices = window.speechSynthesis.getVoices();
                const esVoice = voices.find(v => v.lang.includes('es-CL') || v.lang.includes('es-AR') || v.lang.includes('es-ES') || v.lang.includes('es'));
                if (esVoice) {
                    utterance.voice = esVoice;
                }
                
                window.speechSynthesis.speak(utterance);
            } catch (e) {
                console.error("Error en locución de voz:", e);
            }
        }
    }

    // 🔊 Sonido de rebote jugoso y elástico en las paredes
    playTap() {
        this.init();
        if (!this.ctx) return;
        
        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            // Sonido elástico descendente rápido
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(450, now);
            osc.frequency.exponentialRampToValueAtTime(140, now + 0.09);
            
            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.start(now);
            osc.stop(now + 0.09);
        } catch (e) {
            console.warn("Fallo en playTap():", e);
        }
    }

    // 🔊 Sonido metálico/mecánico al encajar la hamburguesa (¡CLACK!)
    playMatch() {
        this.init();
        if (!this.ctx) return;
        
        try {
            const now = this.ctx.currentTime;
            
            // 1. Golpe pesado de graves (Cuerpo metálico)
            const lowOsc = this.ctx.createOscillator();
            const lowGain = this.ctx.createGain();
            lowOsc.type = 'triangle';
            lowOsc.frequency.setValueAtTime(180, now);
            lowOsc.frequency.exponentialRampToValueAtTime(60, now + 0.18);
            
            lowGain.gain.setValueAtTime(0.35, now);
            lowGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
            
            lowOsc.connect(lowGain);
            lowGain.connect(this.ctx.destination);
            lowOsc.start(now);
            lowOsc.stop(now + 0.18);

            // 2. Click metálico de alta frecuencia (El choque de los ingredientes)
            const clickOsc = this.ctx.createOscillator();
            const clickGain = this.ctx.createGain();
            clickOsc.type = 'sine';
            clickOsc.frequency.setValueAtTime(950, now);
            clickOsc.frequency.exponentialRampToValueAtTime(300, now + 0.03);
            
            clickGain.gain.setValueAtTime(0.2, now);
            clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);
            
            clickOsc.connect(clickGain);
            clickGain.connect(this.ctx.destination);
            clickOsc.start(now);
            clickOsc.stop(now + 0.03);
        } catch (e) {
            console.warn("Fallo en playMatch():", e);
        }
    }

    // 🎉 Distribuidor de Sonidos de Resultados en Base a la Precisión del Calce
    playGameResult(level) {
        this.init();
        if (!this.ctx) return;
        
        try {
            const now = this.ctx.currentTime;
            
            if (level === 'perfect') {
                // --- 🏆 CALCE PERFECTO: Arpegio majestuoso y monedas cayendo ---
                const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98, 2093.00];
                const step = 0.045;
                
                notes.forEach((freq, i) => {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    
                    osc.type = 'square';
                    osc.frequency.setValueAtTime(freq, now + (i * step));
                    
                    gain.gain.setValueAtTime(0, now + (i * step));
                    gain.gain.linearRampToValueAtTime(0.08, now + (i * step) + 0.015);
                    gain.gain.exponentialRampToValueAtTime(0.0001, now + (i * step) + 0.25);
                    
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start(now + (i * step));
                    osc.stop(now + (i * step) + 0.25);
                });

                // Campanadas extra
                for (let i = 0; i < 6; i++) {
                    const bellOsc = this.ctx.createOscillator();
                    const bellGain = this.ctx.createGain();
                    const delay = now + 0.35 + (i * 0.12);
                    const randomFreq = 1200 + Math.random() * 800;
                    
                    bellOsc.type = 'sine';
                    bellOsc.frequency.setValueAtTime(randomFreq, delay);
                    
                    bellGain.gain.setValueAtTime(0, delay);
                    bellGain.gain.linearRampToValueAtTime(0.05, delay + 0.01);
                    bellGain.gain.exponentialRampToValueAtTime(0.0001, delay + 0.3);
                    
                    bellOsc.connect(bellGain);
                    bellGain.connect(this.ctx.destination);
                    bellOsc.start(delay);
                    bellOsc.stop(delay + 0.3);
                }

                setTimeout(() => {
                    this.announce("¡Espectacular! ¡Armaste la burger perfecta Ruta 9! ¡Participas en el sorteo semanal!");
                }, 180);
                
            } else if (level === 'excellent') {
                // --- ⭐ EXCELENTE: Fanfarria de Arpegio Mayor Conducente ---
                const notes = [329.63, 392.00, 493.88, 587.33, 659.25, 987.77];
                const step = 0.07;
                
                notes.forEach((freq, i) => {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(freq, now + (i * step));
                    
                    const isLast = i === notes.length - 1;
                    const duration = isLast ? 1.0 : 0.3;
                    
                    gain.gain.setValueAtTime(0, now + (i * step));
                    gain.gain.linearRampToValueAtTime(0.12, now + (i * step) + 0.02);
                    gain.gain.exponentialRampToValueAtTime(0.0001, now + (i * step) + duration);
                    
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    
                    osc.start(now + (i * step));
                    osc.stop(now + (i * step) + duration);
                });

                setTimeout(() => {
                    this.announce("¡Increíble precisión! ¡Excelente armado! ¡Te ganaste un upgrade de papas!");
                }, 150);
                
            } else if (level === 'good') {
                // --- 👍 MUY CERCA: Campanas Felices Agradables ---
                const notes = [261.63, 329.63, 392.00, 523.25];
                const step = 0.09;
                
                notes.forEach((freq, i) => {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq, now + (i * step));
                    
                    const isLast = i === notes.length - 1;
                    const duration = isLast ? 0.8 : 0.4;
                    
                    gain.gain.setValueAtTime(0, now + (i * step));
                    gain.gain.linearRampToValueAtTime(0.14, now + (i * step) + 0.02);
                    gain.gain.exponentialRampToValueAtTime(0.0001, now + (i * step) + duration);
                    
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    
                    osc.start(now + (i * step));
                    osc.stop(now + (i * step) + duration);
                });

                setTimeout(() => {
                    this.announce("¡Muy buen armado! ¡Llévate una salsa premium gratis!");
                }, 150);
                
            } else if (level === 'regular') {
                // --- 👌 ACEPTABLE: Chime de éxito menor ---
                const notes = [196.00, 261.63, 329.63];
                const step = 0.12;
                
                notes.forEach((freq, i) => {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq, now + (i * step));
                    
                    gain.gain.setValueAtTime(0.1, now + (i * step));
                    gain.gain.exponentialRampToValueAtTime(0.001, now + (i * step) + 0.35);
                    
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start(now + (i * step));
                    osc.stop(now + (i * step) + 0.35);
                });

                setTimeout(() => {
                    this.announce("¡Bien jugado! ¡Tienes un diez por ciento de descuento para tu próxima burger!");
                }, 150);

            } else {
                // --- ❌ VOLVER A INTENTAR: Descendente Cómico "Wah-Wah-Wah" ---
                const duration = 0.22;
                const sadNotes = [220.00, 196.00, 146.83, 110.00];
                
                sadNotes.forEach((freq, i) => {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    const filter = this.ctx.createBiquadFilter();
                    
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(freq, now + (i * duration));
                    osc.frequency.exponentialRampToValueAtTime(freq * 0.75, now + (i * duration) + duration);
                    
                    filter.type = 'lowpass';
                    filter.frequency.setValueAtTime(500, now + (i * duration));
                    filter.frequency.exponentialRampToValueAtTime(60, now + (i * duration) + duration);
                    
                    gain.gain.setValueAtTime(0, now + (i * duration));
                    gain.gain.linearRampToValueAtTime(0.12, now + (i * duration) + 0.03);
                    gain.gain.exponentialRampToValueAtTime(0.0001, now + (i * duration) + duration);
                    
                    osc.connect(filter);
                    filter.connect(gain);
                    gain.connect(this.ctx.destination);
                    
                    osc.start(now + (i * duration));
                    osc.stop(now + (i * duration) + duration);
                });

                setTimeout(() => {
                    this.announce("¡Casi! ¡Se te movió la burger! ¡Sigue intentando!");
                }, 150);
            }
        } catch (e) {
            console.error("Fallo al reproducir la fanfarria de resultados de Calza Burger:", e);
        }
    }
}

export const sounds = new SoundEngine();
