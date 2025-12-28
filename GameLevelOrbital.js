import GameEnvBackground from './GameEngine/GameEnvBackground.js';
import Player from './GameEngine/Player.js';

class OrbitalDockingGame {
  constructor(levelRef) {
    this.levelRef = levelRef;
    this.canvas = null;
    this.ctx = null;
    this.gameLoop = null;
    this.gameStarted = false;
    this.gameWon = false;
    this.spacecraft = { x: 100, y: 300, vx: 0, vy: 0, angle: 0 };
    this.station = { x: 600, y: 300, angle: 0 };
    this.fuel = 100;
    this.dockingProgress = 0;
    this.stars = [];
    this.particles = [];
    this.keysPressed = {};
    this.thrustPower = 0.15;
    this.friction = 0.995;
  }

  init() {
    this.injectStyles();
    this.createUI();
    this.generateStars();
    this.showIntroModal();
    this.bindKeys();
  }

  injectStyles() {
    if (document.getElementById('orbital-game-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'orbital-game-styles';
    style.textContent = `
      @keyframes orbitPulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.6; } }
      @keyframes dockingBeacon { 0%, 100% { box-shadow: 0 0 10px #00FF00; } 50% { box-shadow: 0 0 30px #00FF00; } }
      .orbital-modal {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #0a1628 0%, #162447 100%);
        border: 3px solid #4ECDC4;
        border-radius: 15px;
        padding: 30px;
        z-index: 10001;
        font-family: 'Courier New', monospace;
        max-width: 500px;
        box-shadow: 0 0 50px rgba(78, 205, 196, 0.4);
      }
      .orbital-btn {
        background: linear-gradient(135deg, #4ECDC4, #44A08D);
        border: none;
        color: #000;
        padding: 12px 24px;
        font-family: 'Courier New', monospace;
        font-size: 12px;
        font-weight: bold;
        cursor: pointer;
        border-radius: 8px;
        transition: all 0.3s;
        margin: 5px;
      }
      .orbital-btn:hover {
        transform: scale(1.05);
        box-shadow: 0 0 20px rgba(78, 205, 196, 0.8);
      }
    `;
    document.head.appendChild(style);
  }

  createUI() {
    const container = document.createElement('div');
    container.id = 'orbital-game-container';
    container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 9999;
      background: radial-gradient(ellipse at center, #0a1628 0%, #000510 100%);
    `;
    
    container.innerHTML = `
      <canvas id="orbital-canvas" style="width: 100%; height: 100%;"></canvas>
      <div id="orbital-hud" style="
        position: absolute;
        top: 20px;
        left: 20px;
        background: rgba(10, 22, 40, 0.9);
        border: 2px solid #4ECDC4;
        border-radius: 10px;
        padding: 15px;
        font-family: 'Courier New', monospace;
        color: #FFF;
        font-size: 12px;
      ">
        <div style="color: #4ECDC4; margin-bottom: 10px; font-size: 14px;">🛸 ORBITAL DOCKING</div>
        <div style="margin: 5px 0;">Fuel: <span id="orbital-fuel" style="color: #00FF00;">100</span>%</div>
        <div style="margin: 5px 0;">Velocity: <span id="orbital-velocity">0.00</span> m/s</div>
        <div style="margin: 5px 0;">Distance: <span id="orbital-distance">500</span>m</div>
        <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #4ECDC4;">
          <div style="color: #FFD700; font-size: 10px;">CONTROLS: WASD or Arrows</div>
        </div>
      </div>
      <div id="docking-indicator" style="
        position: absolute;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%);
        width: 300px;
        height: 20px;
        background: rgba(0,0,0,0.5);
        border: 2px solid #4ECDC4;
        border-radius: 10px;
        overflow: hidden;
      ">
        <div id="docking-progress" style="
          width: 0%;
          height: 100%;
          background: linear-gradient(90deg, #4ECDC4, #00FF00);
          transition: width 0.3s;
        "></div>
      </div>
      <div style="
        position: absolute;
        bottom: 55px;
        left: 50%;
        transform: translateX(-50%);
        color: #4ECDC4;
        font-family: 'Courier New', monospace;
        font-size: 10px;
      ">DOCKING PROGRESS</div>
    `;
    
    document.body.appendChild(container);
    
    this.canvas = document.getElementById('orbital-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.station.x = this.canvas.width - 200;
    this.station.y = this.canvas.height / 2;
  }

  generateStars() {
    this.stars = [];
    for (let i = 0; i < 200; i++) {
      this.stars.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 2 + 0.5,
        brightness: Math.random()
      });
    }
  }

  showIntroModal() {
    const modal = document.createElement('div');
    modal.className = 'orbital-modal';
    modal.id = 'orbital-intro-modal';
    modal.innerHTML = `
      <div style="text-align: center;">
        <div style="font-size: 48px; margin-bottom: 20px;">🛸</div>
        <div style="color: #4ECDC4; font-size: 18px; margin-bottom: 15px;">ORBITAL DOCKING SIMULATOR</div>
        <div style="color: #FFF; font-size: 11px; line-height: 1.8; margin-bottom: 20px;">
          Pilot your spacecraft to the space station!<br><br>
          Use <span style="color: #FFD700;">WASD</span> or <span style="color: #FFD700;">Arrow Keys</span> to thrust.<br><br>
          Approach the station slowly and carefully.<br>
          Dock successfully to earn the NAVIGATION CHIP!<br><br>
          <span style="color: #FF6B6B;">Warning: Fuel is limited!</span>
        </div>
        <button class="orbital-btn" id="start-orbital-game">🚀 BEGIN DOCKING</button>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('start-orbital-game').addEventListener('click', () => {
      modal.remove();
      this.startGame();
    });
  }

  bindKeys() {
    this.keyDownHandler = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(e.code)) {
        e.preventDefault();
        this.keysPressed[e.code] = true;
      }
    };
    this.keyUpHandler = (e) => {
      this.keysPressed[e.code] = false;
    };
    document.addEventListener('keydown', this.keyDownHandler);
    document.addEventListener('keyup', this.keyUpHandler);
  }

  startGame() {
    this.gameStarted = true;
    this.spacecraft = { 
      x: 150, 
      y: this.canvas.height / 2, 
      vx: 0, 
      vy: 0, 
      angle: 0 
    };
    this.fuel = 100;
    this.dockingProgress = 0;
    this.runGameLoop();
  }

  runGameLoop() {
    this.gameLoop = requestAnimationFrame(() => this.update());
  }

  update() {
    if (!this.gameStarted || this.gameWon) return;
    
    this.handleInput();
    this.updatePhysics();
    this.checkDocking();
    this.updateParticles();
    this.render();
    this.updateHUD();
    
    this.gameLoop = requestAnimationFrame(() => this.update());
  }

  handleInput() {
    if (this.fuel <= 0) return;
    
    let thrusting = false;
    
    if (this.keysPressed['ArrowUp'] || this.keysPressed['KeyW']) {
      this.spacecraft.vy -= this.thrustPower;
      this.fuel -= 0.1;
      thrusting = true;
      this.addThrustParticle(0, 1);
    }
    if (this.keysPressed['ArrowDown'] || this.keysPressed['KeyS']) {
      this.spacecraft.vy += this.thrustPower;
      this.fuel -= 0.1;
      thrusting = true;
      this.addThrustParticle(0, -1);
    }
    if (this.keysPressed['ArrowLeft'] || this.keysPressed['KeyA']) {
      this.spacecraft.vx -= this.thrustPower;
      this.fuel -= 0.1;
      thrusting = true;
      this.addThrustParticle(1, 0);
    }
    if (this.keysPressed['ArrowRight'] || this.keysPressed['KeyD']) {
      this.spacecraft.vx += this.thrustPower;
      this.fuel -= 0.1;
      thrusting = true;
      this.addThrustParticle(-1, 0);
    }
    
    this.fuel = Math.max(0, this.fuel);
  }

  addThrustParticle(dirX, dirY) {
    for (let i = 0; i < 3; i++) {
      this.particles.push({
        x: this.spacecraft.x - dirX * 20,
        y: this.spacecraft.y - dirY * 20,
        vx: dirX * (2 + Math.random() * 2) + (Math.random() - 0.5),
        vy: dirY * (2 + Math.random() * 2) + (Math.random() - 0.5),
        life: 30,
        maxLife: 30,
        color: Math.random() > 0.5 ? '#FF6B35' : '#FFD700'
      });
    }
  }

  updatePhysics() {
    this.spacecraft.vx *= this.friction;
    this.spacecraft.vy *= this.friction;
    
    this.spacecraft.x += this.spacecraft.vx;
    this.spacecraft.y += this.spacecraft.vy;
    
    this.spacecraft.x = Math.max(30, Math.min(this.canvas.width - 30, this.spacecraft.x));
    this.spacecraft.y = Math.max(30, Math.min(this.canvas.height - 30, this.spacecraft.y));
    
    this.spacecraft.angle = Math.atan2(this.spacecraft.vy, this.spacecraft.vx);
  }

  updateParticles() {
    this.particles = this.particles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      return p.life > 0;
    });
  }

  checkDocking() {
    const dx = this.station.x - this.spacecraft.x;
    const dy = this.station.y - this.spacecraft.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const velocity = Math.sqrt(this.spacecraft.vx * this.spacecraft.vx + this.spacecraft.vy * this.spacecraft.vy);
    
    if (distance < 80) {
      if (velocity < 1.5) {
        this.dockingProgress += 2;
        if (this.dockingProgress >= 100) {
          this.winGame();
        }
      } else if (velocity > 3) {
        this.dockingProgress = Math.max(0, this.dockingProgress - 5);
      }
    } else {
      this.dockingProgress = Math.max(0, this.dockingProgress - 0.5);
    }
    
    const progressBar = document.getElementById('docking-progress');
    if (progressBar) {
      progressBar.style.width = this.dockingProgress + '%';
    }
  }

  render() {
    this.ctx.fillStyle = '#000510';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.renderStars();
    this.renderParticles();
    this.renderStation();
    this.renderSpacecraft();
    this.renderDockingZone();
  }

  renderStars() {
    this.stars.forEach(star => {
      const twinkle = 0.5 + Math.sin(Date.now() * 0.003 * star.brightness) * 0.5;
      this.ctx.fillStyle = `rgba(255, 255, 255, ${twinkle})`;
      this.ctx.beginPath();
      this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }

  renderParticles() {
    this.particles.forEach(p => {
      const alpha = p.life / p.maxLife;
      this.ctx.fillStyle = p.color.replace(')', `, ${alpha})`).replace('rgb', 'rgba');
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, 3 * alpha, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }

  renderStation() {
    this.ctx.save();
    this.ctx.translate(this.station.x, this.station.y);
    
    this.ctx.strokeStyle = '#4ECDC4';
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([5, 5]);
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 80, 0, Math.PI * 2);
    this.ctx.stroke();
    this.ctx.setLineDash([]);
    
    this.ctx.fillStyle = '#2C3E50';
    this.ctx.fillRect(-60, -15, 120, 30);
    
    this.ctx.fillStyle = '#34495E';
    this.ctx.fillRect(-15, -50, 30, 100);
    
    this.ctx.fillStyle = '#3498DB';
    this.ctx.fillRect(-55, -35, 40, 15);
    this.ctx.fillRect(15, -35, 40, 15);
    this.ctx.fillRect(-55, 20, 40, 15);
    this.ctx.fillRect(15, 20, 40, 15);
    
    this.ctx.fillStyle = '#00FF00';
    const blink = Math.sin(Date.now() * 0.01) > 0;
    if (blink) {
      this.ctx.beginPath();
      this.ctx.arc(-70, 0, 5, 0, Math.PI * 2);
      this.ctx.fill();
    }
    
    this.ctx.restore();
  }

  renderSpacecraft() {
    this.ctx.save();
    this.ctx.translate(this.spacecraft.x, this.spacecraft.y);
    
    const velocity = Math.sqrt(this.spacecraft.vx * this.spacecraft.vx + this.spacecraft.vy * this.spacecraft.vy);
    if (velocity > 0.1) {
      this.ctx.rotate(this.spacecraft.angle);
    }
    
    this.ctx.fillStyle = '#ECF0F1';
    this.ctx.beginPath();
    this.ctx.moveTo(25, 0);
    this.ctx.lineTo(-15, -12);
    this.ctx.lineTo(-10, 0);
    this.ctx.lineTo(-15, 12);
    this.ctx.closePath();
    this.ctx.fill();
    
    this.ctx.fillStyle = '#3498DB';
    this.ctx.beginPath();
    this.ctx.arc(5, 0, 6, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.fillStyle = '#E74C3C';
    this.ctx.beginPath();
    this.ctx.moveTo(-15, -12);
    this.ctx.lineTo(-25, -18);
    this.ctx.lineTo(-15, -5);
    this.ctx.closePath();
    this.ctx.fill();
    
    this.ctx.beginPath();
    this.ctx.moveTo(-15, 12);
    this.ctx.lineTo(-25, 18);
    this.ctx.lineTo(-15, 5);
    this.ctx.closePath();
    this.ctx.fill();
    
    this.ctx.restore();
  }

  renderDockingZone() {
    const dx = this.station.x - this.spacecraft.x;
    const dy = this.station.y - this.spacecraft.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < 150) {
      this.ctx.save();
      this.ctx.translate(this.station.x - 70, this.station.y);
      
      const velocity = Math.sqrt(this.spacecraft.vx * this.spacecraft.vx + this.spacecraft.vy * this.spacecraft.vy);
      const color = velocity < 1.5 ? '#00FF00' : velocity < 3 ? '#FFD700' : '#FF0000';
      
      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, 15, 0, Math.PI * 2);
      this.ctx.stroke();
      
      this.ctx.fillStyle = color;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, 5, 0, Math.PI * 2);
      this.ctx.fill();
      
      this.ctx.restore();
    }
  }

  updateHUD() {
    const fuelDisplay = document.getElementById('orbital-fuel');
    const velocityDisplay = document.getElementById('orbital-velocity');
    const distanceDisplay = document.getElementById('orbital-distance');
    
    const velocity = Math.sqrt(this.spacecraft.vx * this.spacecraft.vx + this.spacecraft.vy * this.spacecraft.vy);
    const dx = this.station.x - this.spacecraft.x;
    const dy = this.station.y - this.spacecraft.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (fuelDisplay) {
      fuelDisplay.textContent = Math.floor(this.fuel);
      fuelDisplay.style.color = this.fuel > 30 ? '#00FF00' : '#FF0000';
    }
    if (velocityDisplay) velocityDisplay.textContent = velocity.toFixed(2);
    if (distanceDisplay) distanceDisplay.textContent = Math.floor(distance);
  }

  winGame() {
    this.gameWon = true;
    this.gameStarted = false;
    cancelAnimationFrame(this.gameLoop);
    
    const modal = document.createElement('div');
    modal.className = 'orbital-modal';
    modal.innerHTML = `
      <div style="text-align: center;">
        <div style="font-size: 64px; margin-bottom: 20px;">🎉🛸🎉</div>
        <div style="color: #00FF00; font-size: 18px; margin-bottom: 15px;">DOCKING SUCCESSFUL!</div>
        <div style="color: #FFF; font-size: 11px; line-height: 1.8; margin-bottom: 20px;">
          Excellent piloting, Commander!<br><br>
          Remaining Fuel: ${Math.floor(this.fuel)}%<br><br>
          <span style="color: #FFD700;">You've earned the NAVIGATION CHIP!</span>
        </div>
        <div style="font-size: 10px; color: #4ECDC4; margin-bottom: 20px; padding: 15px; background: rgba(78, 205, 196, 0.1); border-radius: 8px;">
          "In orbit, patience and precision are everything. You've proven you have both."<br>
          - Commander Luna
        </div>
        <button class="orbital-btn" id="complete-orbital">🧭 CLAIM NAVIGATION CHIP</button>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('complete-orbital').addEventListener('click', () => {
      modal.remove();
      this.cleanup();
      this.levelRef.completeLevel();
    });
  }

  cleanup() {
    cancelAnimationFrame(this.gameLoop);
    document.removeEventListener('keydown', this.keyDownHandler);
    document.removeEventListener('keyup', this.keyUpHandler);
    const container = document.getElementById('orbital-game-container');
    if (container) container.remove();
    document.querySelectorAll('.orbital-modal').forEach(m => m.remove());
  }
}

class GameLevelOrbital {
  constructor(gameEnv) {
    this.gameEnv = gameEnv;
    this.width = gameEnv.innerWidth;
    this.height = gameEnv.innerHeight;
    this.path = gameEnv.path;

    this.classes = this.buildLevel();
    
    setTimeout(() => this.initMiniGame(), 1000);
  }

  createBackgroundData() {
    return {
      name: 'orbital_simulator',
      greeting: "Welcome to the Orbital Training Simulator!",
      src: this.path + "/images/gamify/spacebase.png",
      pixels: { height: 966, width: 654 }
    };
  }

  createPlayerData() {
    const scaleFactor = 5;
    return {
      id: 'Settler',
      greeting: "Time to master orbital mechanics!",
      src: this.path + "/images/gamify/chillguy.png",
      SCALE_FACTOR: scaleFactor,
      STEP_FACTOR: 1000,
      ANIMATION_RATE: 50,
      INIT_POSITION: { x: 0, y: this.height - (this.height / scaleFactor) },
      pixels: { height: 384, width: 512 },
      orientation: { rows: 3, columns: 4 },
      down: { row: 0, start: 0, columns: 3 },
      left: { row: 2, start: 0, columns: 3 },
      right: { row: 1, start: 0, columns: 3 },
      up: { row: 3, start: 0, columns: 3 },
      hitbox: { widthPercentage: 0.45, heightPercentage: 0.2 },
      keypress: { up: 87, left: 65, down: 83, right: 68 }
    };
  }

  buildLevel() {
    return [
      { class: GameEnvBackground, data: this.createBackgroundData() },
      { class: Player, data: this.createPlayerData() },
    ];
  }

  initMiniGame() {
    this.dockingGame = new OrbitalDockingGame(this);
    this.dockingGame.init();
  }

  completeLevel() {
    if (this.gameEnv.gameControl && this.gameEnv.gameControl.gameOver) {
      this.gameEnv.gameControl.gameOver();
    }
  }
}

export default GameLevelOrbital;
