class FullAudioSuite {
    constructor() {
        this.ctx = null;
        this.isPlaying = false;
        this.bgSource = null;
        this.bgGain = null;
        this.samples = {};
        this.urls = {
            bg: "/background.mp3",
            correct: "/correct.mp3",
            wrong: "/timeout.mp3" // Usamos el sonido de timeout que es más corto y preciso para marcar el error
        };
    }

    async init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        if (this.ctx.state === 'suspended') {
            await this.ctx.resume();
        }

        const loadPromises = Object.entries(this.urls).map(async ([key, url]) => {
            if (!this.samples[key]) {
                try {
                    const response = await fetch(url);
                    const arrayBuffer = await response.arrayBuffer();
                    this.samples[key] = await this.ctx.decodeAudioData(arrayBuffer);
                } catch (e) {
                    console.error(`Error cargando sonido ${key}:`, e);
                }
            }
        });

        await Promise.all(loadPromises);
    }

    startMusic() {
        this.init().then(() => {
            if (this.isPlaying || !this.samples.bg) return;
            this.isPlaying = true;

            this.bgSource = this.ctx.createBufferSource();
            this.bgGain = this.ctx.createGain();
            this.bgSource.buffer = this.samples.bg;
            this.bgSource.loop = true;
            
            this.bgGain.gain.setValueAtTime(0, this.ctx.currentTime);
            this.bgGain.gain.linearRampToValueAtTime(0.4, this.ctx.currentTime + 2);
            
            this.bgSource.connect(this.bgGain);
            this.bgGain.connect(this.ctx.destination);
            this.bgSource.start(0);
        });
    }

    stopMusic() {
        this.isPlaying = false;
        if (this.bgGain) {
            this.bgGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1);
            setTimeout(() => {
                if (this.bgSource) {
                    try { this.bgSource.stop(); } catch(e) {}
                    this.bgSource = null;
                }
            }, 1000);
        }
    }

    playEffect(key, volume = 0.7) {
        if (!this.samples[key]) return;
        
        if (this.bgGain) {
            this.bgGain.gain.exponentialRampToValueAtTime(0.1, this.ctx.currentTime + 0.1);
            setTimeout(() => {
                if (this.bgGain && this.isPlaying) {
                    this.bgGain.gain.exponentialRampToValueAtTime(0.4, this.ctx.currentTime + 1);
                }
            }, 2000);
        }

        const source = this.ctx.createBufferSource();
        const gain = this.ctx.createGain();
        source.buffer = this.samples[key];
        gain.gain.setValueAtTime(volume, this.ctx.currentTime);
        source.connect(gain);
        gain.connect(this.ctx.destination);
        source.start(0);
    }

    playCorrect() { this.playEffect('correct', 0.7); }
    playWrong() { this.playEffect('wrong', 0.8); } // Volumen un poco más alto para el error
    playTimeout() {}
    playTick() {}
}

export const sounds = new FullAudioSuite();
