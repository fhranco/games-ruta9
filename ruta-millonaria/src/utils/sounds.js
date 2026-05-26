class FullAudioSuite {
    constructor() {
        this.ctx = null;
        this.isPlaying = false;
        this.bgSource = null;
        this.bgGain = null;
        this.bgSynthInterval = null;
        this.samples = {};
        this.urls = {
            bg: "background.mp3",
            correct: "correct.mp3",
            wrong: "timeout.mp3" // Usamos el sonido de timeout que es más corto y preciso para marcar el error
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
                    if (!response.ok) throw new Error(`HTTP ${response.status}`);
                    const arrayBuffer = await response.arrayBuffer();
                    this.samples[key] = await this.ctx.decodeAudioData(arrayBuffer);
                } catch (e) {
                    console.warn(`Error cargando sonido ${key}: ${e.message}. Usando sintetizador fallback.`);
                }
            }
        });

        await Promise.all(loadPromises);
    }

    startMusic() {
        this.init().then(() => {
            if (this.isPlaying) return;

            if (!this.samples.bg) {
                // Fallback de música sintetizada
                this.playMusicSynth();
                return;
            }

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
        }).catch(err => console.error("Error al iniciar música:", err));
    }

    stopMusic() {
        this.isPlaying = false;
        
        // Parar música sintetizada
        if (this.bgSynthInterval) {
            clearInterval(this.bgSynthInterval);
            this.bgSynthInterval = null;
        }

        // Parar música original
        if (this.bgGain) {
            try {
                this.bgGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1);
            } catch (e) {
                // Fallback si falla rampa exponencial
                this.bgGain.gain.setValueAtTime(0, this.ctx.currentTime);
            }
            setTimeout(() => {
                if (this.bgSource) {
                    try { this.bgSource.stop(); } catch(e) {}
                    this.bgSource = null;
                }
            }, 1000);
        }
    }

    playEffect(key, volume = 0.7) {
        if (!this.samples[key]) {
            // Fallback sintetizado
            if (key === 'correct') {
                this.playCorrectSynth();
            } else if (key === 'wrong') {
                this.playWrongSynth();
            }
            return;
        }
        
        if (this.bgGain) {
            try {
                this.bgGain.gain.exponentialRampToValueAtTime(0.1, this.ctx.currentTime + 0.1);
                setTimeout(() => {
                    if (this.bgGain && this.isPlaying) {
                        this.bgGain.gain.exponentialRampToValueAtTime(0.4, this.ctx.currentTime + 1);
                    }
                }, 2000);
            } catch (e) {}
        }

        try {
            const source = this.ctx.createBufferSource();
            const gain = this.ctx.createGain();
            source.buffer = this.samples[key];
            gain.gain.setValueAtTime(volume, this.ctx.currentTime);
            source.connect(gain);
            gain.connect(this.ctx.destination);
            source.start(0);
        } catch (e) {
            console.error("Error reproduciendo sample:", e);
        }
    }

    playCorrect() { 
        this.playEffect('correct', 0.7); 
    }

    playWrong() { 
        this.playEffect('wrong', 0.8); 
    }

    // --- SINTETIZADORES WEB AUDIO API (Bajo Consumo, 8-Bit Arcade Style) ---

    playCorrectSynth() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'square';
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        // Sonido de moneda clásico (Arpegio rápido: B5 a E6)
        osc.frequency.setValueAtTime(987.77, now); // B5
        osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6
        
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.setValueAtTime(0.15, now + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        
        osc.start(now);
        osc.stop(now + 0.35);
    }

    playWrongSynth() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc1.type = 'sawtooth';
        osc2.type = 'sawtooth';
        
        // Frecuencias bajas disonantes deslizando hacia abajo
        osc1.frequency.setValueAtTime(120, now);
        osc1.frequency.linearRampToValueAtTime(70, now + 0.4);
        
        osc2.frequency.setValueAtTime(123, now);
        osc2.frequency.linearRampToValueAtTime(73, now + 0.4);
        
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.4);
        osc2.stop(now + 0.4);
    }

    playTick() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        // Chasquido sutil agudo
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);
        
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start(now);
        osc.stop(now + 0.05);
    }

    playWin() {
        this.init().then(() => {
            if (!this.ctx) return;
            const now = this.ctx.currentTime;
            
            // Fanfarria victoriosa retro en C mayor
            const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
            notes.forEach((freq, index) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, now + index * 0.08);
                
                gain.gain.setValueAtTime(0.12, now + index * 0.08);
                gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.08 + 0.4);
                
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                
                osc.start(now + index * 0.08);
                osc.stop(now + index * 0.08 + 0.4);
            });
        }).catch(e => console.error("Error al iniciar audio para Win:", e));
    }

    playLose() {
        this.init().then(() => {
            if (!this.ctx) return;
            const now = this.ctx.currentTime;
            
            // Arpegio melancólico descendente en C menor
            const notes = [392.00, 311.13, 261.63]; // G4, Eb4, C4
            notes.forEach((freq, index) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(freq, now + index * 0.12);
                
                gain.gain.setValueAtTime(0.12, now + index * 0.12);
                gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.12 + 0.5);
                
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                
                osc.start(now + index * 0.12);
                osc.stop(now + index * 0.12 + 0.5);
            });
        }).catch(e => console.error("Error al iniciar audio para Lose:", e));
    }

    playMusicSynth() {
        if (this.bgSynthInterval) return; // Evitar duplicaciones
        this.isPlaying = true;
        
        let step = 0;
        // Línea de bajo retro en C menor (C -> Eb -> F -> G)
        const notes = [
            65.41, 65.41, 77.78, 77.78, 
            87.31, 87.31, 98.00, 98.00
        ];
        
        this.bgSynthInterval = setInterval(() => {
            if (!this.isPlaying || !this.ctx) {
                clearInterval(this.bgSynthInterval);
                this.bgSynthInterval = null;
                return;
            }
            
            if (this.ctx.state === 'suspended') return;
            
            try {
                const now = this.ctx.currentTime;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                
                osc.type = 'triangle'; // Tono suave retro de bajo
                const freq = notes[step % notes.length];
                osc.frequency.setValueAtTime(freq, now);
                
                gain.gain.setValueAtTime(0.06, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
                
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                
                osc.start(now);
                osc.stop(now + 0.45);
                
                step++;
            } catch (e) {
                console.error("Error en loop de bajo sintetizado:", e);
            }
        }, 500); // Ritmo estable a 120 BPM
    }
}

export const sounds = new FullAudioSuite();
