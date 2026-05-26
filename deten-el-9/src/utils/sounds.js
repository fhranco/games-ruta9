/**
 * Generador de sonidos sintéticos para Ruta9 Games usando Web Audio API.
 * No requiere archivos externos, tiene latencia cero y funciona 100% offline.
 * Además, incluye un Locutor de Voz Sintética extremadamente robusto y tolerante a fallos.
 */

class SoundEngine {
    constructor() {
        this.ctx = null;
        
        // Nodos del motor principal
        this.motorOsc = null;
        this.motorOsc2 = null;
        this.motorFilter = null;
        this.motorGain = null;
        
        // Nodos del generador de ruido (viento/velocidad)
        this.noiseBuffer = null;
        this.noiseNode = null;
        this.noiseFilter = null;
        this.noiseGain = null;
        
        // Variables de control de cuenta regresiva y ticks
        this.lastTickTime = 0;
    }

    // Inicializa el AudioContext de forma ultra-segura, tolerando navegadores viejos y restricciones de seguridad
    init() {
        try {
            if (!this.ctx) {
                const AudioContextClass = window.AudioContext || window.webkitAudioContext;
                if (AudioContextClass) {
                    this.ctx = new AudioContextClass();
                    this.createNoiseBuffer();
                } else {
                    console.warn("Web Audio API no es compatible con este navegador.");
                }
            }
            // Reanudar si se encuentra en estado suspendido por políticas de interacción del navegador
            if (this.ctx && this.ctx.state === 'suspended') {
                this.ctx.resume().catch(e => console.warn("No se pudo reanudar el AudioContext:", e));
            }
        } catch (e) {
            console.error("Fallo al inicializar AudioContext de forma segura:", e);
            this.ctx = null;
        }
    }

    // Crea un buffer estático de ruido blanco reutilizable
    createNoiseBuffer() {
        try {
            if (!this.ctx) return;
            const bufferSize = this.ctx.sampleRate * 2; // 2 segundos de buffer
            this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = this.noiseBuffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
        } catch (e) {
            console.error("Fallo al crear el noise buffer:", e);
            this.noiseBuffer = null;
        }
    }

    // 🎙️ Locutor de Voz en Español de Chile (Totem Digital Kiosco)
    announce(text) {
        if ('speechSynthesis' in window) {
            try {
                // Cancelamos cualquier locución anterior para evitar superposiciones
                window.speechSynthesis.cancel();
                
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = 'es-CL'; // Acento local
                utterance.rate = 1.12;    // Ritmo enérgico y dinámico de arcade
                utterance.pitch = 1.05;   // Tono entusiasta
                
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

    // 🏎️ Sonido de Motor en Aceleración con Tensión Exponencial, Ruido de Viento y Chorus Analógico
    startMotor() {
        this.init();
        if (!this.ctx || this.motorOsc) return;

        try {
            const now = this.ctx.currentTime;

            // 1. Oscilador 1: Diente de sierra para un tono de máquina arcade agresivo
            this.motorOsc = this.ctx.createOscillator();
            this.motorOsc.type = 'sawtooth';
            this.motorOsc.frequency.setValueAtTime(55, now); // Nota base La1
            
            // 2. Oscilador 2: Onda cuadrada levemente detuneada para un efecto de "Chorus" super grueso y analógico
            this.motorOsc2 = this.ctx.createOscillator();
            this.motorOsc2.type = 'square';
            this.motorOsc2.frequency.setValueAtTime(55.45, now);

            // 3. Generador de Ruido de Viento (Sensación de velocidad espacial)
            if (this.noiseBuffer) {
                this.noiseNode = this.ctx.createBufferSource();
                this.noiseNode.buffer = this.noiseBuffer;
                this.noiseNode.loop = true;
                
                this.noiseFilter = this.ctx.createBiquadFilter();
                this.noiseFilter.type = 'bandpass';
                this.noiseFilter.frequency.setValueAtTime(250, now);
                this.noiseFilter.Q.setValueAtTime(2.2, now);

                this.noiseGain = this.ctx.createGain();
                this.noiseGain.gain.setValueAtTime(0, now);
                
                this.noiseNode.connect(this.noiseFilter);
                this.noiseFilter.connect(this.noiseGain);
                this.noiseGain.connect(this.ctx.destination);
            }

            // 4. Filtro paso bajo principal del motor (corta agudos molestos al inicio y los abre progresivamente)
            this.motorFilter = this.ctx.createBiquadFilter();
            this.motorFilter.type = 'lowpass';
            this.motorFilter.frequency.setValueAtTime(130, now);

            // 5. Control de ganancia del motor
            this.motorGain = this.ctx.createGain();
            this.motorGain.gain.setValueAtTime(0, now);
            this.motorGain.gain.linearRampToValueAtTime(0.08, now + 0.12);

            // Conexiones de Audio
            this.motorOsc.connect(this.motorFilter);
            this.motorOsc2.connect(this.motorFilter);
            this.motorFilter.connect(this.motorGain);
            this.motorGain.connect(this.ctx.destination);

            // Encendido sincrónico
            this.motorOsc.start(now);
            this.motorOsc2.start(now);
            if (this.noiseNode) this.noiseNode.start(now);

            // Resetear tracker de ticks
            this.lastTickTime = 0;
        } catch (e) {
            console.error("Fallo al encender el motor de audio sintético:", e);
        }
    }

    // Actualiza la tensión acústica del motor en tiempo real en base a los segundos transcurridos
    updateMotorPitch(time) {
        if (!this.ctx || !this.motorOsc || !this.motorOsc2 || !this.motorFilter || !this.motorGain) return;
        
        try {
            const now = this.ctx.currentTime;
            
            // 1. Tono sube de forma exponencial (curva parabólica extrema que se descontrola hacia los 9.0s)
            const baseFreq = 55 + Math.pow(time, 2.3) * 6.5;
            this.motorOsc.frequency.setTargetAtTime(baseFreq, now, 0.05);
            this.motorOsc2.frequency.setTargetAtTime(baseFreq + 0.6 + Math.sin(now * 6) * 0.35, now, 0.05);

            // 2. Abrir filtro paso bajo del motor para revelar chillidos y agudos alarmantes
            const filterFreq = 130 + Math.pow(time, 2.45) * 8.8;
            this.motorFilter.frequency.setTargetAtTime(filterFreq, now, 0.05);

            // 3. Incrementar el silbido de viento de alta velocidad
            if (this.noiseGain && this.noiseFilter) {
                const windVolume = Math.min(0.065, Math.pow(time, 2.2) * 0.0009);
                this.noiseGain.gain.setTargetAtTime(windVolume, now, 0.05);
                this.noiseFilter.frequency.setTargetAtTime(250 + time * 135, now, 0.05);
            }

            // 4. LFO de latido rítmico que simula taquicardia acelerada del jugador
            const pulseRate = Math.max(1, time * 2.2);
            const pulseGain = 0.06 + (Math.sin(time * Math.PI * 2 * pulseRate) * 0.045);
            this.motorGain.gain.setTargetAtTime(pulseGain, now, 0.035);

            // 5. ⏰ SISTEMA DE TICKS ELECTRÓNICOS DE ALTA PRESIÓN (TICKING BOMB)
            let interval = 1.0;
            if (time >= 4.0 && time < 7.0) interval = 0.5;
            else if (time >= 7.0 && time < 8.5) interval = 0.25;
            else if (time >= 8.5 && time < 9.5) interval = 0.125;
            else if (time >= 9.5) interval = 0.2;

            const currentTick = Math.floor(time / interval);
            const lastTick = Math.floor(this.lastTickTime / interval);

            if (currentTick > lastTick) {
                this.lastTickTime = time;
                
                const tickFreq = 420 + Math.min(time, 9.0) * 130;
                const duration = time >= 8.5 ? 0.035 : 0.052;
                const volume = time >= 8.5 ? 0.15 : time >= 7.0 ? 0.12 : 0.085;
                
                this.playTick(tickFreq, duration, volume, time >= 7.0);
            }
        } catch (e) {
            console.error("Fallo al actualizar el pitch del motor:", e);
        }
    }

    // Genera un beep sónico individual y puede opcionalmente agregar un latido subwoofer físico
    playTick(frequency, duration = 0.05, volume = 0.08, includeSubKick = false) {
        this.init();
        if (!this.ctx) return;
        
        try {
            const now = this.ctx.currentTime;
            
            // 1. Tono principal del click sintético
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(frequency, now);
            osc.frequency.exponentialRampToValueAtTime(frequency * 0.45, now + duration);
            
            gain.gain.setValueAtTime(volume, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + duration);

            // 2. Latido de graves de ultra baja frecuencia (Sub-Kick cardíaco)
            if (includeSubKick) {
                const subOsc = this.ctx.createOscillator();
                const subGain = this.ctx.createGain();
                subOsc.type = 'sine';
                subOsc.frequency.setValueAtTime(75, now);
                subOsc.frequency.exponentialRampToValueAtTime(25, now + 0.08);
                
                subGain.gain.setValueAtTime(volume * 1.6, now);
                subGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
                
                subOsc.connect(subGain);
                subGain.connect(this.ctx.destination);
                subOsc.start(now);
                subOsc.stop(now + 0.08);
            }
        } catch (e) {
            console.warn("Fallo al reproducir tick:", e);
        }
    }

    // Apaga el motor de forma fluida y sin clics digitales (crackle protection)
    stopMotor() {
        if (!this.ctx) return;
        
        try {
            const now = this.ctx.currentTime;
            
            if (this.motorGain) this.motorGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
            if (this.noiseGain) this.noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
            
            if (this.motorOsc) this.motorOsc.stop(now + 0.08);
            if (this.motorOsc2) this.motorOsc2.stop(now + 0.08);
            if (this.noiseNode) this.noiseNode.stop(now + 0.08);
        } catch(e) {
            console.warn("Error al apagar motor:", e);
        }
        
        this.motorOsc = null;
        this.motorOsc2 = null;
        this.noiseNode = null;
        this.motorGain = null;
        this.noiseGain = null;
        this.motorFilter = null;
        this.noiseFilter = null;
    }

    // 🛑 Sonido de Frenado e Impacto Brutal (Cyberpunk Bass Drop + Laser Brake + Reverb Burst)
    playStop() {
        this.init();
        if (!this.ctx) return;
        
        try {
            const now = this.ctx.currentTime;
            
            // 1. Impacto Sub-graves (Bass Drop Monumental)
            const bassOsc = this.ctx.createOscillator();
            const bassGain = this.ctx.createGain();
            bassOsc.type = 'sine';
            bassOsc.frequency.setValueAtTime(220, now);
            bassOsc.frequency.exponentialRampToValueAtTime(25, now + 0.65);
            
            bassGain.gain.setValueAtTime(0.55, now);
            bassGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);
            
            bassOsc.connect(bassGain);
            bassGain.connect(this.ctx.destination);
            bassOsc.start(now);
            bassOsc.stop(now + 0.65);

            // 2. Freno Láser Descendente (Estilo Synthwave Sci-Fi)
            const laserOsc = this.ctx.createOscillator();
            const laserGain = this.ctx.createGain();
            laserOsc.type = 'sawtooth';
            laserOsc.frequency.setValueAtTime(1500, now);
            laserOsc.frequency.exponentialRampToValueAtTime(55, now + 0.42);
            
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(1300, now);
            filter.frequency.exponentialRampToValueAtTime(80, now + 0.42);
            
            laserGain.gain.setValueAtTime(0.14, now);
            laserGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);
            
            laserOsc.connect(filter);
            filter.connect(laserGain);
            laserGain.connect(this.ctx.destination);
            
            laserOsc.start(now);
            laserOsc.stop(now + 0.42);

            // 3. Estallido de Compresión de Aire (Impacto Físico de Ruido Blanco)
            if (this.noiseBuffer) {
                const noiseNode = this.ctx.createBufferSource();
                noiseNode.buffer = this.noiseBuffer;
                const noiseGain = this.ctx.createGain();
                const noiseFilter = this.ctx.createBiquadFilter();
                
                noiseFilter.type = 'bandpass';
                noiseFilter.frequency.setValueAtTime(750, now);
                noiseFilter.frequency.exponentialRampToValueAtTime(90, now + 0.48);
                noiseFilter.Q.value = 1.2;
                
                noiseGain.gain.setValueAtTime(0.2, now);
                noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.48);
                
                noiseNode.connect(noiseFilter);
                noiseFilter.connect(noiseGain);
                noiseGain.connect(this.ctx.destination);
                
                noiseNode.start(now);
                noiseNode.stop(now + 0.48);
            }
        } catch (e) {
            console.error("Fallo al reproducir sonido playStop():", e);
        }
    }

    // 🎉 Distribuidor de Sonidos de Resultados en Base a la Precisión del Tiro
    playGameResult(level) {
        this.init();
        if (!this.ctx) return;
        
        try {
            const now = this.ctx.currentTime;
            
            if (level === 'perfect') {
                // --- 🏆 JUEGO PERFECTO (Exactamente 9.00s!): Fanfarria Legendaria de Ruta9 ---
                const arpeggioNotes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98, 2093.00];
                const step = 0.04;
                
                arpeggioNotes.forEach((freq, i) => {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    
                    osc.type = 'square';
                    osc.frequency.setValueAtTime(freq, now + (i * step));
                    
                    gain.gain.setValueAtTime(0, now + (i * step));
                    gain.gain.linearRampToValueAtTime(0.08, now + (i * step) + 0.01);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + (i * step) + 0.22);
                    
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start(now + (i * step));
                    osc.stop(now + (i * step) + 0.22);
                });

                const chordFreqs = [261.63, 329.63, 392.00, 523.25];
                const chordStart = now + (arpeggioNotes.length * step);
                
                chordFreqs.forEach((freq) => {
                    for (let d = -1; d <= 1; d += 2) {
                        const osc = this.ctx.createOscillator();
                        const gain = this.ctx.createGain();
                        const filter = this.ctx.createBiquadFilter();
                        
                        osc.type = 'sawtooth';
                        osc.frequency.setValueAtTime(freq + (d * 0.85), chordStart);
                        
                        const vibrato = this.ctx.createOscillator();
                        const vibratoGain = this.ctx.createGain();
                        vibrato.frequency.value = 6.2;
                        vibratoGain.gain.value = 4.5;
                        vibrato.connect(vibratoGain);
                        vibratoGain.connect(osc.frequency);
                        
                        filter.type = 'lowpass';
                        filter.frequency.setValueAtTime(120, chordStart);
                        filter.frequency.exponentialRampToValueAtTime(2200, chordStart + 0.45);
                        filter.frequency.exponentialRampToValueAtTime(450, chordStart + 1.8);
                        
                        gain.gain.setValueAtTime(0, chordStart);
                        gain.gain.linearRampToValueAtTime(0.065, chordStart + 0.1);
                        gain.gain.exponentialRampToValueAtTime(0.0001, chordStart + 1.85);
                        
                        osc.connect(filter);
                        filter.connect(gain);
                        gain.connect(this.ctx.destination);
                        
                        vibrato.start(chordStart);
                        osc.start(chordStart);
                        
                        vibrato.stop(chordStart + 1.85);
                        osc.stop(chordStart + 1.85);
                    }
                });

                for (let i = 0; i < 9; i++) {
                    const bellOsc = this.ctx.createOscillator();
                    const bellGain = this.ctx.createGain();
                    const delay = chordStart + 0.12 + (i * 0.11);
                    const randomFreq = 1500 + Math.random() * 1300;
                    
                    bellOsc.type = 'sine';
                    bellOsc.frequency.setValueAtTime(randomFreq, delay);
                    
                    bellGain.gain.setValueAtTime(0, delay);
                    bellGain.gain.linearRampToValueAtTime(0.045, delay + 0.012);
                    bellGain.gain.exponentialRampToValueAtTime(0.0001, delay + 0.28);
                    
                    bellOsc.connect(bellGain);
                    bellGain.connect(this.ctx.destination);
                    
                    bellOsc.start(delay);
                    bellOsc.stop(delay + 0.28);
                }

                setTimeout(() => {
                    this.announce("¡Espectacular! ¡Hiciste un punto perfecto Ruta 9! ¡Ganaste tres cupones para el sorteo!");
                }, 180);
                
            } else if (level === 'excellent') {
                // --- ⭐ EXCELENTE (Casi perfecto): Fanfarria de Arpegio Mayor Conducente ---
                const notes = [329.63, 392.00, 493.88, 587.33, 659.25, 987.77];
                const step = 0.065;
                
                notes.forEach((freq, i) => {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(freq, now + (i * step));
                    
                    const isLast = i === notes.length - 1;
                    const duration = isLast ? 1.1 : 0.28;
                    
                    if (isLast) {
                        const vibrato = this.ctx.createOscillator();
                        const vibratoGain = this.ctx.createGain();
                        vibrato.frequency.value = 8.0;
                        vibratoGain.gain.value = 6.0;
                        vibrato.connect(vibratoGain);
                        vibratoGain.connect(osc.frequency);
                        vibrato.start(now + (i * step));
                        vibrato.stop(now + (i * step) + duration);
                    }
                    
                    gain.gain.setValueAtTime(0, now + (i * step));
                    gain.gain.linearRampToValueAtTime(0.12, now + (i * step) + 0.02);
                    gain.gain.exponentialRampToValueAtTime(0.0001, now + (i * step) + duration);
                    
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    
                    osc.start(now + (i * step));
                    osc.stop(now + (i * step) + duration);
                });

                setTimeout(() => {
                    this.announce("¡Brutal! ¡Casi perfecto! ¡Ganaste dos cupones!");
                }, 150);
                
            } else if (level === 'great') {
                // --- 👍 MUY CERCA: Campanas Felices Agradables ---
                const notes = [261.63, 329.63, 392.00, 523.25];
                const step = 0.085;
                
                notes.forEach((freq, i) => {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq, now + (i * step));
                    
                    const isLast = i === notes.length - 1;
                    const duration = isLast ? 0.85 : 0.38;
                    
                    gain.gain.setValueAtTime(0, now + (i * step));
                    gain.gain.linearRampToValueAtTime(0.14, now + (i * step) + 0.02);
                    gain.gain.exponentialRampToValueAtTime(0.0001, now + (i * step) + duration);
                    
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    
                    osc.start(now + (i * step));
                    osc.stop(now + (i * step) + duration);
                });

                setTimeout(() => {
                    this.announce("¡Muy bien! ¡Quedaste muy cerca! ¡Ganaste un cupón!");
                }, 150);
                
            } else {
                // --- ❌ VOLVER A INTENTAR (Perdiste): "Wah-Wah-Wah" Triste y Cómico de Arcade ---
                const duration = 0.22;
                const sadNotes = [220.00, 196.00, 146.83, 110.00];
                
                sadNotes.forEach((freq, i) => {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    const filter = this.ctx.createBiquadFilter();
                    
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(freq, now + (i * duration));
                    
                    osc.frequency.exponentialRampToValueAtTime(freq * 0.76, now + (i * duration) + duration);
                    
                    filter.type = 'lowpass';
                    filter.frequency.setValueAtTime(550, now + (i * duration));
                    filter.frequency.exponentialRampToValueAtTime(65, now + (i * duration) + duration);
                    
                    gain.gain.setValueAtTime(0, now + (i * duration));
                    gain.gain.linearRampToValueAtTime(0.15, now + (i * duration) + 0.03);
                    gain.gain.exponentialRampToValueAtTime(0.0001, now + (i * duration) + duration);
                    
                    osc.connect(filter);
                    filter.connect(gain);
                    gain.connect(this.ctx.destination);
                    
                    osc.start(now + (i * duration));
                    osc.stop(now + (i * duration) + duration);
                });

                setTimeout(() => {
                    this.announce("¡Casi! ¡Vuelve a intentarlo!");
                }, 150);
            }
        } catch (e) {
            console.error("Fallo al reproducir la fanfarria de resultados:", e);
        }
    }

    // ⏲️ Beep individual limpio para la cuenta regresiva antes de largar
    playBeep(isFinal = false) {
        this.init();
        if (!this.ctx) return;
        
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(isFinal ? 980 : 490, this.ctx.currentTime);

            gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + 0.12);
        } catch (e) {
            console.warn("Fallo al reproducir beep:", e);
        }
    }
}

export const sounds = new SoundEngine();
