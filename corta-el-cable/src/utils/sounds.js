class SoundEngine {
    constructor() {
        this.ctx = null;
    }

    init() {
        try {
            if (!this.ctx) {
                const AudioContextClass = window.AudioContext || window.webkitAudioContext;
                if (AudioContextClass) {
                    this.ctx = new AudioContextClass();
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

    announce(text) {
        if ('speechSynthesis' in window) {
            try {
                window.speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = 'es-CL'; // Acento chileno
                utterance.rate = 1.2;     // Rápido e intenso
                utterance.pitch = 1.05;   // Entusiasta
                
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

    // 🔊 Sonido de corte rápido
    playTap() {
        this.init();
        if (!this.ctx) return;
        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(300, now);
            osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
            
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.start(now);
            osc.stop(now + 0.1);
        } catch (e) {
            console.warn("Fallo en playTap():", e);
        }
    }

    // 🔊 Reloj de cuenta regresiva LED
    playTick() {
        this.init();
        if (!this.ctx) return;
        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1200, now);
            
            gain.gain.setValueAtTime(0.04, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.start(now);
            osc.stop(now + 0.05);
        } catch (e) {
            console.warn("Fallo en playTick():", e);
        }
    }

    // 🔊 Sonido de desactivación exitosa del circuito (Zap + Moneda)
    playMatch() {
        this.init();
        if (!this.ctx) return;
        try {
            const now = this.ctx.currentTime;
            
            // Tono laser zap ascendente
            const osc1 = this.ctx.createOscillator();
            const gain1 = this.ctx.createGain();
            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(400, now);
            osc1.frequency.exponentialRampToValueAtTime(1200, now + 0.15);
            gain1.gain.setValueAtTime(0.12, now);
            gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
            osc1.connect(gain1);
            gain1.connect(this.ctx.destination);
            osc1.start(now);
            osc1.stop(now + 0.15);

            // Campanita metálica aguda
            const osc2 = this.ctx.createOscillator();
            const gain2 = this.ctx.createGain();
            osc2.type = 'triangle';
            osc2.frequency.setValueAtTime(1500, now + 0.05);
            gain2.gain.setValueAtTime(0, now + 0.05);
            gain2.gain.linearRampToValueAtTime(0.08, now + 0.06);
            gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
            osc2.connect(gain2);
            gain2.connect(this.ctx.destination);
            osc2.start(now + 0.05);
            osc2.stop(now + 0.25);
        } catch (e) {
            console.warn("Fallo en playMatch():", e);
        }
    }

    // 🔊 Alarma de fallo de cable o tiempo agotado (Explosión + Sirena)
    playLose() {
        this.init();
        if (!this.ctx) return;
        try {
            const now = this.ctx.currentTime;

            // 1. Sonido de Explosión (Ruido blanco de baja frecuencia)
            const bufferSize = this.ctx.sampleRate * 0.5; // 0.5 segundos de explosión
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }

            const noiseNode = this.ctx.createBufferSource();
            noiseNode.buffer = buffer;

            // Filtro paso bajo para darle cuerpo de explosión grave
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(800, now);
            filter.frequency.exponentialRampToValueAtTime(80, now + 0.5);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.4, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);

            noiseNode.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);

            noiseNode.start(now);
            noiseNode.stop(now + 0.5);

            // 2. Sirena descendente rápida
            const osc = this.ctx.createOscillator();
            const oscGain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(600, now);
            osc.frequency.linearRampToValueAtTime(100, now + 0.4);
            oscGain.gain.setValueAtTime(0.15, now);
            oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
            
            osc.connect(oscGain);
            oscGain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.4);
        } catch (e) {
            console.warn("Fallo en playLose():", e);
        }
    }

    // 🎉 Voz de resultados según aciertos
    playGameResult(level) {
        this.init();
        if (!this.ctx) return;
        try {
            const now = this.ctx.currentTime;
            
            if (level === 'perfect') {
                setTimeout(() => {
                    this.announce("¡Increíble! ¡Desactivaste la bomba y salvaste el local de Ruta Nueve! ¡Te ganaste tres cupones para el sorteo semanal!");
                }, 100);
            } else if (level === 'excellent') {
                setTimeout(() => {
                    this.announce("¡Excelente velocidad de corte! ¡Te ganaste unas papas fritas gratis en caja!");
                }, 100);
            } else if (level === 'good') {
                setTimeout(() => {
                    this.announce("¡Buen intento desactivando el circuito! ¡Te ganaste una salsa gratis!");
                }, 100);
            } else {
                setTimeout(() => {
                    this.announce("¡Boom! ¡La cocina ha explotado! ¡Sigue participando para ganar!");
                }, 100);
            }
        } catch (e) {
            console.error("Fallo al reproducir locución:", e);
        }
    }
}

export const sounds = new SoundEngine();
export default sounds;
