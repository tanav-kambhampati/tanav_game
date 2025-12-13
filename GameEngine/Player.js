import Character from './Character.js';

const SCALE_FACTOR = 25; 
const STEP_FACTOR = 100; 
const ANIMATION_RATE = 1; 
const INIT_POSITION = { x: 0, y: 0 };

class MovementSoundManager {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.lastFootstepTime = 0;
        this.footstepInterval = 300; 
        this.isLeftFoot = true;
        
        this.minecraftMusic = null;
        this.initMinecraftMusic();
        this.isMusicPlaying = false;
        this.ambientMusicStarted = false;
        
        this.startAmbientMusic();
        
        this.surfaces = {
            'default': { pitch: 1, volume: 0.15, character: 'soft' },
            'grass': { pitch: 0.8, volume: 0.12, character: 'soft' },
            'stone': { pitch: 1.3, volume: 0.2, character: 'hard' },
            'wood': { pitch: 1.1, volume: 0.18, character: 'hollow' },
            'metal': { pitch: 1.5, volume: 0.25, character: 'metallic' },
            'carpet': { pitch: 0.6, volume: 0.08, character: 'muffled' },
            'sand': { pitch: 0.7, volume: 0.1, character: 'soft' }
        };
    }
    
    initMinecraftMusic() {
        try {
            this.ambientMusic = new Audio('/assets/audio/ambient-relaxing.mp3');
            this.ambientMusic.loop = true; 
            this.ambientMusic.volume = 0.15; 
            this.ambientMusic.preload = 'auto';
            
            this.ambientMusic.addEventListener('loadeddata', () => {
                console.log('Ambient music loaded');
                if (!this.ambientMusicStarted) {
                    this.startAmbientMusic();
                }
            });
            
            this.ambientMusic.addEventListener('error', (e) => {
                console.log('Ambient music file not found. Using generated ambient sounds.');
                this.createAmbientSoundscape();
            });
            
        } catch (error) {
            console.log('Ambient music file not found. Add ambient-relaxing.mp3 to assets/audio directory.');
            this.createAmbientSoundscape();
        }
    }
    
    startAmbientMusic() {
        if (!window.gameAudioEnabled || this.ambientMusicStarted) return;
        
        this.ambientMusicStarted = true;
        
        if (this.ambientMusic && this.ambientMusic.readyState >= 2) {
            this.ambientMusic.currentTime = 0; 
            this.ambientMusic.play().catch(e => {
                console.log('Could not play ambient music:', e);
                this.playAmbientSoundscape();
            });
            this.isMusicPlaying = true;
        } else {
            this.playAmbientSoundscape();
        }
    }
    
    stopAmbientMusic() {
        this.ambientMusicStarted = false;
        this.isMusicPlaying = false;
        if (this.ambientMusic && !this.ambientMusic.paused) {
            this.ambientMusic.pause();
        }
        if (this.ambientInterval) {
            clearInterval(this.ambientInterval);
            this.ambientInterval = null;
        }
    }
    
    createAmbientSoundscape() {
        this.ambientInterval = null;
        this.activeSounds = [];
    }
    
    playAmbientSoundscape() {
        if (!window.gameAudioEnabled || this.isMusicPlaying) return;
        
        this.isMusicPlaying = true;
        
        this.createBackgroundDrone();
        
        this.ambientInterval = setInterval(() => {
            if (!window.gameAudioEnabled || !this.isMusicPlaying) return;
            
            const rand = Math.random();
            if (rand < 0.3) {
                this.playGentleTone();
            } else if (rand < 0.5) {
                this.playWaterDroplet();
            } else if (rand < 0.7) {
                this.playWindSound();
            } else if (rand < 0.85) {
                this.playChimeSound();
            }
        }, 3000 + Math.random() * 5000); 
    }
    
    createBackgroundDrone() {
        const osc1 = this.audioContext.createOscillator();
        const osc2 = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(this.audioContext.destination);
        
        osc1.frequency.setValueAtTime(55, this.audioContext.currentTime); 
        osc2.frequency.setValueAtTime(82.41, this.audioContext.currentTime); 
        
        osc1.type = 'sine';
        osc2.type = 'sine';
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(200, this.audioContext.currentTime);
        filter.Q.setValueAtTime(0.5, this.audioContext.currentTime);
        
        gain.gain.setValueAtTime(0.02, this.audioContext.currentTime);
        
        osc1.start(this.audioContext.currentTime);
        osc2.start(this.audioContext.currentTime);
        
        this.backgroundDrone = { osc1, osc2, gain };
    }
    
    playGentleTone() {
        const frequencies = [261.63, 293.66, 349.23, 392.00, 440.00, 523.25]; 
        const freq = frequencies[Math.floor(Math.random() * frequencies.length)];
        
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.audioContext.destination);
        
        osc.frequency.setValueAtTime(freq, this.audioContext.currentTime);
        osc.type = 'sine';
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, this.audioContext.currentTime);
        
        const duration = 2 + Math.random() * 3; 
        
        gain.gain.setValueAtTime(0, this.audioContext.currentTime);
        gain.gain.linearRampToValueAtTime(0.03, this.audioContext.currentTime + 0.5);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
        
        osc.start(this.audioContext.currentTime);
        osc.stop(this.audioContext.currentTime + duration);
    }
    
    playWaterDroplet() {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        osc.frequency.setValueAtTime(800 + Math.random() * 400, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.1);
        osc.type = 'sine';
        
        gain.gain.setValueAtTime(0, this.audioContext.currentTime);
        gain.gain.linearRampToValueAtTime(0.015, this.audioContext.currentTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);
        
        osc.start(this.audioContext.currentTime);
        osc.stop(this.audioContext.currentTime + 0.3);
    }
    
    playWindSound() {
        const bufferSize = this.audioContext.sampleRate * 2; 
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
            b6 = white * 0.115926;
        }
        
        const source = this.audioContext.createBufferSource();
        const gain = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        source.buffer = buffer;
        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.audioContext.destination);
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(300, this.audioContext.currentTime);
        
        gain.gain.setValueAtTime(0, this.audioContext.currentTime);
        gain.gain.linearRampToValueAtTime(0.008, this.audioContext.currentTime + 0.5);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 2);
        
        source.start(this.audioContext.currentTime);
    }
    
    playChimeSound() {
        const baseFreq = 523.25 + Math.random() * 200;
        const harmonics = [1, 2.4, 4.1];
        
        harmonics.forEach((harmonic, index) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.connect(gain);
            gain.connect(this.audioContext.destination);
            
            osc.frequency.setValueAtTime(baseFreq * harmonic, this.audioContext.currentTime);
            osc.type = 'sine';
            
            const volume = 0.01 / (index + 1); 
            const duration = 3 + Math.random() * 2;
            
            gain.gain.setValueAtTime(0, this.audioContext.currentTime);
            gain.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.1);
            gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
            
            osc.start(this.audioContext.currentTime + index * 0.05);
            osc.stop(this.audioContext.currentTime + duration);
        });
    }
    
    handleAudioToggle(enabled) {
        if (enabled && !this.ambientMusicStarted) {
            this.startAmbientMusic();
        } else if (!enabled && this.ambientMusicStarted) {
            this.stopAmbientMusic();
        }
    }
    
    createFootstepSound(surface = 'default', isLeftFoot = true) {
    }
    
    playMovementSound(direction, surface = 'default') {
        if (!this.ambientMusicStarted && window.gameAudioEnabled) {
            this.startAmbientMusic();
        }
    }
    
    playStartMovementSound() {
        if (!this.ambientMusicStarted && window.gameAudioEnabled) {
            this.startAmbientMusic();
        }
    }
    
    playStopMovementSound() {
    }
}


class Player extends Character {

    @param {Object|null} data 

    constructor(data = null, gameEnv = null) {
        super(data, gameEnv);
        this.keypress = data?.keypress || {up: 87, left: 65, down: 83, right: 68};
        this.pressedKeys = {}; 
        this.bindMovementKeyListners();
        this.gravity = data.GRAVITY || false;
        this.acceleration = 0.001;
        this.time = 0;
        this.moved = false;
        this.wasMoving = false; 
        
        this.soundManager = new MovementSoundManager();
        this.currentSurface = this.detectSurface(); 
    }

    bindMovementKeyListners() {
        addEventListener('keydown', this.handleKeyDown.bind(this));
        addEventListener('keyup', this.handleKeyUp.bind(this));
    }

    handleKeyDown({ keyCode }) {
        this.pressedKeys[keyCode] = true;
        this.updateVelocityAndDirection();
    }

   
    @param {Object} event
    handleKeyUp({ keyCode }) {
        if (keyCode in this.pressedKeys) {
            delete this.pressedKeys[keyCode];
        }
        this.updateVelocityAndDirection();
    }

  
    detectSurface() {
        const currentLevel = this.gameEnv?.currentLevel || 'unknown';
        
        const levelSurfaceMap = {
            'desert': 'sand',
            'casino': 'carpet',
            'office': 'carpet',
            'bank': 'stone',
            'airport': 'stone',
            'wallstreet': 'stone',
            'default': 'default'
        };
        
        return levelSurfaceMap[currentLevel] || 'default';
    }


    updateVelocityAndDirection() {
        this.velocity.x = 0;
        this.velocity.y = 0;
        
        const wasMovingBefore = this.moved;

        if (this.pressedKeys[this.keypress.up] && this.pressedKeys[this.keypress.left]) {
            this.velocity.y -= this.yVelocity;
            this.velocity.x -= this.xVelocity;
            this.direction = 'upLeft';
            this.moved = true;
        } else if (this.pressedKeys[this.keypress.up] && this.pressedKeys[this.keypress.right]) {
            this.velocity.y -= this.yVelocity;
            this.velocity.x += this.xVelocity;
            this.direction = 'upRight';
            this.moved = true;
        } else if (this.pressedKeys[this.keypress.down] && this.pressedKeys[this.keypress.left]) {
            this.velocity.y += this.yVelocity;
            this.velocity.x -= this.xVelocity;
            this.direction = 'downLeft';
            this.moved = true;
        } else if (this.pressedKeys[this.keypress.down] && this.pressedKeys[this.keypress.right]) {
            this.velocity.y += this.yVelocity;
            this.velocity.x += this.xVelocity;
            this.direction = 'downRight';
            this.moved = true;
        } else if (this.pressedKeys[this.keypress.up]) {
            this.velocity.y -= this.yVelocity;
            this.direction = 'up';
            this.moved = true;
        } else if (this.pressedKeys[this.keypress.left]) {
            this.velocity.x -= this.xVelocity;
            this.direction = 'left';
            this.moved = true;
        } else if (this.pressedKeys[this.keypress.down]) {
            this.velocity.y += this.yVelocity;
            this.direction = 'down';
            this.moved = true;
        } else if (this.pressedKeys[this.keypress.right]) {
            this.velocity.x += this.xVelocity;
            this.direction = 'right';
            this.moved = true;
        } else{
            this.moved = false;
        }
        
        this.handleMovementSounds(wasMovingBefore);
    }
    
    handleMovementSounds(wasMovingBefore) {
        this.currentSurface = this.detectSurface();
        
        if (this.moved && !wasMovingBefore) {
            this.soundManager.playStartMovementSound();
            this.wasMoving = true;
        }
        else if (this.moved && wasMovingBefore) {
            this.soundManager.playMovementSound(this.direction, this.currentSurface);
        }
        else if (!this.moved && wasMovingBefore) {
            this.soundManager.playStopMovementSound();
            this.wasMoving = false;
        }
    }

    update() {
        super.update();
        if(!this.moved){
            if (this.gravity) {
                    this.time += 1;
                    this.velocity.y += 0.5 + this.acceleration * this.time;
                }
            }
        else{
            this.time = 0;
        }
        }
        
   
    @param {*} other
    handleCollisionReaction(other) {    
        this.playCollisionSound(other);
        
        this.pressedKeys = {};
        this.updateVelocityAndDirection();
        super.handleCollisionReaction(other);
    }
    
    playCollisionSound(other) {
        if (!window.gameAudioEnabled) return;
        
        try {
            const now = this.soundManager.audioContext.currentTime;
            
            const osc = this.soundManager.audioContext.createOscillator();
            const gain = this.soundManager.audioContext.createGain();
            const filter = this.soundManager.audioContext.createBiquadFilter();
            
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.soundManager.audioContext.destination);
            
            let frequency = 150;
            let volume = 0.1;
            
            if (other && other.constructor.name) {
                const objectType = other.constructor.name.toLowerCase();
                if (objectType.includes('wall') || objectType.includes('barrier')) {
                    frequency = 200; 
                    volume = 0.15;
                } else if (objectType.includes('npc') || objectType.includes('character')) {
                    frequency = 300; 
                    volume = 0.08; 
                } else if (objectType.includes('platform')) {
                    frequency = 120; 
                    volume = 0.12;
                }
            }
            
            osc.frequency.setValueAtTime(frequency, now);
            osc.type = 'triangle';
            
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(600, now);
            
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(volume, now + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
            
            osc.start(now);
            osc.stop(now + 0.1);
        } catch (e) {
            console.log("Collision sound error:", e);
        }
    }
}

export default Player;