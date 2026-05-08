/**
 * Generador de sonidos sintéticos para Ruta9 Games usando Web Audio API.
 * No requiere archivos externos y tiene latencia cero.
 */

class SoundEngine {
    constructor() {
        this.ctx = null;
        this.motorOsc = null;
        this.motorGain = null;
    }

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    // 🏎️ Sonido de Motor en Aceleración
    startMotor() {
        this.init();
        if (this.motorOsc) return;

        this.motorOsc = this.ctx.createOscillator();
        this.motorGain = this.ctx.createGain();
        
        this.motorOsc.type = 'sawtooth';
        this.motorOsc.frequency.setValueAtTime(60, this.ctx.currentTime);
        
        this.motorGain.gain.setValueAtTime(0, this.ctx.currentTime);
        this.motorGain.gain.linearRampToValueAtTime(0.05, this.ctx.currentTime + 0.1);

        this.motorOsc.connect(this.motorGain);
        this.motorGain.connect(this.ctx.destination);
        
        this.motorOsc.start();
    }

    updateMotorPitch(time) {
        if (!this.motorOsc) return;
        // El tono sube a medida que pasa el tiempo (base 60Hz + 20Hz por segundo)
        const newFreq = 60 + (time * 25);
        this.motorOsc.frequency.setTargetAtTime(newFreq, this.ctx.currentTime, 0.1);
    }

    stopMotor() {
        if (this.motorOsc) {
            this.motorGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
            this.motorOsc.stop(this.ctx.currentTime + 0.1);
            this.motorOsc = null;
            this.motorGain = null;
        }
    }

    // 🛑 Sonido de Frenado / Impacto
    playStop() {
        this.init();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(150, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.2);

        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.2);
    }

    // 🎉 Sonido de Premio
    playWin(isPerfect = false) {
        this.init();
        const now = this.ctx.currentTime;
        const notes = isPerfect ? [440, 554, 659, 880] : [330, 440, 554];
        
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + (i * 0.1));
            
            gain.gain.setValueAtTime(0, now + (i * 0.1));
            gain.gain.linearRampToValueAtTime(0.1, now + (i * 0.1) + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, now + (i * 0.1) + 0.2);
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.start(now + (i * 0.1));
            osc.stop(now + (i * 0.1) + 0.3);
        });
    }

    // ⏲️ Beep de Cuenta Regresiva
    playBeep(isFinal = false) {
        this.init();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(isFinal ? 880 : 440, this.ctx.currentTime);

        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);
    }
}

export const sounds = new SoundEngine();
