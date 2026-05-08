class SoundEngine {
    constructor() {
        this.ctx = null;
        this.fireNode = null;
    }

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    // Genera un sonido de fuego orgánico usando ruido rosa filtrado
    startFireAmbience() {
        this.init();
        if (this.fireNode) return;

        const bufferSize = 2 * this.ctx.sampleRate;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = buffer.getChannelData(0);
        
        // Generar ruido rosa
        let lastOut = 0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            const pink = (lastOut + (0.02 * white)) / 1.02;
            output[i] = pink;
            lastOut = pink;
        }

        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, this.ctx.currentTime);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.05, this.ctx.currentTime);

        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        source.start();
        this.fireNode = { source, gain };

        // Añadir "chispas" aleatorias
        this.playCrackles();
    }

    playCrackles() {
        if (!this.fireNode) return;
        
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'square';
        osc.frequency.setValueAtTime(Math.random() * 100 + 50, now);
        
        gain.gain.setValueAtTime(0.02, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start(now);
        osc.stop(now + 0.05);

        setTimeout(() => this.playCrackles(), Math.random() * 2000 + 100);
    }

    stopFire() {
        if (this.fireNode) {
            this.fireNode.gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1);
            setTimeout(() => {
                this.fireNode.source.stop();
                this.fireNode = null;
            }, 1000);
        }
    }

    playSizzle() {
        this.init();
        const bufferSize = 0.5 * this.ctx.sampleRate;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }

        const source = this.ctx.createBufferSource();
        source.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(3000, this.ctx.currentTime);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);

        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        source.start();
    }
}

export const sounds = new SoundEngine();
