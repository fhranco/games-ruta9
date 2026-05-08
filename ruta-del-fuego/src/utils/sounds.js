class SoundEngine {
    constructor() {
        this.ctx = null;
        this.fireSource = null;
        this.fireGain = null;
    }

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    startFireRoar() {
        this.init();
        if (this.fireSource) return;

        const bufferSize = 2 * this.ctx.sampleRate;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }

        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(100, this.ctx.currentTime);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0, this.ctx.currentTime);

        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        source.start();
        this.fireSource = { source, filter, gain };
    }

    updateFireIntensity(intensity) { // 0 to 100
        if (!this.fireSource) return;
        const now = this.ctx.currentTime;
        this.fireSource.filter.frequency.setTargetAtTime(100 + (intensity * 10), now, 0.1);
        this.fireSource.gain.gain.setTargetAtTime(0.01 + (intensity / 500), now, 0.1);
    }

    stopFireRoar() {
        if (this.fireSource) {
            this.fireSource.gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
            setTimeout(() => {
                if (this.fireSource) {
                    this.fireSource.source.stop();
                    this.fireSource = null;
                }
            }, 500);
        }
    }

    playImpact() {
        this.init();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.4);
    }
}

export const sounds = new SoundEngine();
