import GameEnvBackground from './GameEngine/GameEnvBackground.js';
import Player from './GameEngine/Player.js';

class RocketAssemblyGame {
  constructor(levelRef) {
    this.levelRef = levelRef;
    this.canvas = null;
    this.ctx = null;
    this.gameLoop = null;
    this.gameStarted = false;
    this.gameWon = false;
    this.catcher = { x: 400, width: 100, height: 20 };
    this.fallingParts = [];
    this.debris = [];
    this.collectedParts = [];
    this.health = 100;
    this.score = 0;
    this.spawnTimer = 0;
    this.spawnRate = 90;
    this.keysPressed = {};
    this.catcherSpeed = 8;
    
    this.rocketParts = [
      { id: 'nosecone', name: 'Nose Cone', emoji: '🔺', color: '#E74C3C', points: 100 },
      { id: 'fairing', name: 'Payload Fairing', emoji: '📦', color: '#9B59B6', points: 75 },
      { id: 'stage2', name: 'Second Stage', emoji: '🚀', color: '#3498DB', points: 100 },
      { id: 'interstage', name: 'Interstage', emoji: '⚙️', color: '#F39C12', points: 50 },
      { id: 'stage1', name: 'First Stage', emoji: '🔧', color: '#2ECC71', points: 100 },
      { id: 'engine', name: 'Raptor Engine', emoji: '🔥', color: '#E67E22', points: 150 },
      { id: 'fins', name: 'Grid Fins', emoji: '🛩️', color: '#1ABC9C', points: 75 },
      { id: 'legs', name: 'Landing Legs', emoji: '🦵', color: '#34495E', points: 75 }
    ];
    
    this.debrisTypes = [
      { name: 'Space Junk', emoji: '💥', damage: 15 },
      { name: 'Meteor', emoji: '☄️', damage: 20 },
      { name: 'Broken Satellite', emoji: '📡', damage: 10 }
    ];
    
    this.requiredParts = new Set(['nosecone', 'stage2', 'stage1', 'engine']);
  }

  init() {
    this.injectStyles();
    this.createUI();
    this.showIntroModal();
    this.bindKeys();
  }

  injectStyles() {
    if (document.getElementById('spacex-game-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'spacex-game-styles';
    style.textContent = `
      @keyframes glowPulse { 0%, 100% { box-shadow: 0 0 20px rgba(231, 76, 60, 0.5); } 50% { box-shadow: 0 0 40px rgba(231, 76, 60, 0.8); } }
      @keyframes partCollect { 0% { transform: scale(1); } 50% { transform: scale(1.3); } 100% { transform: scale(1); opacity: 0; } }
      @keyframes damageFlash { 0%, 100% { background-color: transparent; } 50% { background-color: rgba(255, 0, 0, 0.3); } }
      .spacex-modal {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 100%);
        border: 3px solid #E74C3C;
        border-radius: 15px;
        padding: 30px;
        z-index: 10001;
        font-family: 'Consolas', monospace;
        max-width: 550px;
        box-shadow: 0 0 50px rgba(231, 76, 60, 0.4);
      }
      .spacex-btn {
        background: linear-gradient(135deg, #E74C3C, #C0392B);
        border: none;
        color: #FFF;
        padding: 12px 24px;
        font-family: 'Consolas', monospace;
        font-size: 12px;
        font-weight: bold;
        cursor: pointer;
        border-radius: 8px;
        transition: all 0.3s;
        margin: 5px;
      }
      .spacex-btn:hover {
        transform: scale(1.05);
        box-shadow: 0 0 20px rgba(231, 76, 60, 0.8);
      }
      .part-indicator {
        display: inline-block;
        width: 35px;
        height: 35px;
        margin: 3px;
        border-radius: 5px;
        border: 2px solid #333;
        text-align: center;
        line-height: 35px;
        font-size: 18px;
        transition: all 0.3s;
      }
      .part-indicator.collected {
        border-color: #00FF00;
        box-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
      }
    `;
    document.head.appendChild(style);
  }

  createUI() {
    const container = document.createElement('div');
    container.id = 'spacex-game-container';
    container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 9999;
      background: linear-gradient(to bottom, #000510 0%, #0a1628 50%, #1a2a48 100%);
    `;
    
    container.innerHTML = `
      <canvas id="spacex-canvas" style="width: 100%; height: 100%;"></canvas>
      <div id="spacex-hud" style="
        position: absolute;
        top: 20px;
        left: 20px;
        background: rgba(12, 12, 12, 0.9);
        border: 2px solid #E74C3C;
        border-radius: 10px;
        padding: 15px;
        font-family: 'Consolas', monospace;
        color: #FFF;
        font-size: 12px;
      ">
        <div style="color: #E74C3C; margin-bottom: 10px; font-size: 14px;">🚀 SPACEX TECH LAB</div>
        <div style="margin: 5px 0;">Health: <span id="spacex-health" style="color: #00FF00;">100</span>%</div>
        <div style="margin: 5px 0;">Score: <span id="spacex-score">0</span></div>
        <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #E74C3C;">
          <div style="color: #FFD700; font-size: 10px; margin-bottom: 5px;">REQUIRED PARTS:</div>
          <div id="parts-collected"></div>
        </div>
      </div>
      <div id="rocket-preview" style="
        position: absolute;
        top: 80px;
        right: 20px;
        background: rgba(12, 12, 12, 0.9);
        border: 2px solid #E74C3C;
        border-radius: 10px;
        padding: 15px;
        font-family: 'Consolas', monospace;
        text-align: center;
      ">
        <div style="color: #E74C3C; margin-bottom: 10px; font-size: 12px;">ROCKET STATUS</div>
        <div id="rocket-display" style="font-size: 24px; line-height: 1.2;"></div>
      </div>
    `;
    
    document.body.appendChild(container);
    
    this.canvas = document.getElementById('spacex-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
    
    this.updatePartsDisplay();
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.catcher.x = this.canvas.width / 2 - this.catcher.width / 2;
  }

  showIntroModal() {
    const modal = document.createElement('div');
    modal.className = 'spacex-modal';
    modal.id = 'spacex-intro-modal';
    modal.innerHTML = `
      <div style="text-align: center;">
        <div style="font-size: 48px; margin-bottom: 20px;">🚀</div>
        <div style="color: #E74C3C; font-size: 18px; margin-bottom: 15px;">SPACEX TECH LAB</div>
        <div style="color: #FFF; font-size: 11px; line-height: 1.8; margin-bottom: 20px;">
          Welcome to the assembly line, engineer!<br><br>
          Catch falling rocket parts with <span style="color: #FFD700;">← →</span> or <span style="color: #FFD700;">A D</span> keys.<br><br>
          Collect all required parts to build a complete Starship!<br>
          <span style="color: #FF6B6B;">Avoid space debris - it damages your collector!</span><br><br>
          Required: Nose Cone, Second Stage, First Stage, Raptor Engine
        </div>
        <button class="spacex-btn" id="start-spacex-game">🔧 START ASSEMBLY</button>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('start-spacex-game').addEventListener('click', () => {
      modal.remove();
      this.startGame();
    });
  }

  bindKeys() {
    this.keyDownHandler = (e) => {
      if (['ArrowLeft', 'ArrowRight', 'KeyA', 'KeyD'].includes(e.code)) {
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
    this.health = 100;
    this.score = 0;
    this.collectedParts = [];
    this.fallingParts = [];
    this.debris = [];
    this.runGameLoop();
  }

  runGameLoop() {
    this.gameLoop = requestAnimationFrame(() => this.update());
  }

  update() {
    if (!this.gameStarted || this.gameWon) return;
    
    this.handleInput();
    this.spawnObjects();
    this.updateFallingObjects();
    this.checkCollisions();
    this.render();
    this.updateHUD();
    this.checkWinCondition();
    
    if (this.health <= 0) {
      this.resetGame();
      return;
    }
    
    this.gameLoop = requestAnimationFrame(() => this.update());
  }

  handleInput() {
    if (this.keysPressed['ArrowLeft'] || this.keysPressed['KeyA']) {
      this.catcher.x -= this.catcherSpeed;
    }
    if (this.keysPressed['ArrowRight'] || this.keysPressed['KeyD']) {
      this.catcher.x += this.catcherSpeed;
    }
    
    this.catcher.x = Math.max(0, Math.min(this.canvas.width - this.catcher.width, this.catcher.x));
  }

  spawnObjects() {
    this.spawnTimer++;
    
    if (this.spawnTimer >= this.spawnRate) {
      this.spawnTimer = 0;
      
      if (Math.random() < 0.7) {
        const part = this.rocketParts[Math.floor(Math.random() * this.rocketParts.length)];
        this.fallingParts.push({
          x: Math.random() * (this.canvas.width - 50) + 25,
          y: -30,
          speed: 2 + Math.random() * 2,
          part: part,
          rotation: 0,
          rotationSpeed: (Math.random() - 0.5) * 0.1
        });
      } else {
        const debris = this.debrisTypes[Math.floor(Math.random() * this.debrisTypes.length)];
        this.debris.push({
          x: Math.random() * (this.canvas.width - 40) + 20,
          y: -30,
          speed: 3 + Math.random() * 3,
          type: debris,
          rotation: 0,
          rotationSpeed: (Math.random() - 0.5) * 0.2
        });
      }
      
      this.spawnRate = Math.max(40, this.spawnRate - 0.5);
    }
  }

  updateFallingObjects() {
    this.fallingParts = this.fallingParts.filter(p => {
      p.y += p.speed;
      p.rotation += p.rotationSpeed;
      return p.y < this.canvas.height + 50;
    });
    
    this.debris = this.debris.filter(d => {
      d.y += d.speed;
      d.rotation += d.rotationSpeed;
      return d.y < this.canvas.height + 50;
    });
  }

  checkCollisions() {
    const catcherY = this.canvas.height - 60;
    const catcherBox = {
      left: this.catcher.x,
      right: this.catcher.x + this.catcher.width,
      top: catcherY,
      bottom: catcherY + this.catcher.height
    };
    
    this.fallingParts = this.fallingParts.filter(p => {
      if (p.y + 20 >= catcherBox.top && 
          p.y - 20 <= catcherBox.bottom &&
          p.x >= catcherBox.left && 
          p.x <= catcherBox.right) {
        
        this.score += p.part.points;
        
        if (!this.collectedParts.includes(p.part.id)) {
          this.collectedParts.push(p.part.id);
          this.updatePartsDisplay();
        }
        
        return false;
      }
      return true;
    });
    
    this.debris = this.debris.filter(d => {
      if (d.y + 15 >= catcherBox.top && 
          d.y - 15 <= catcherBox.bottom &&
          d.x >= catcherBox.left && 
          d.x <= catcherBox.right) {
        
        this.health -= d.type.damage;
        this.flashDamage();
        
        return false;
      }
      return true;
    });
  }

  flashDamage() {
    const container = document.getElementById('spacex-game-container');
    if (container) {
      container.style.animation = 'damageFlash 0.3s';
      setTimeout(() => {
        container.style.animation = '';
      }, 300);
    }
  }

  render() {
    this.ctx.fillStyle = '#000510';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.renderStars();
    this.renderFallingParts();
    this.renderDebris();
    this.renderCatcher();
  }

  renderStars() {
    const time = Date.now() * 0.001;
    for (let i = 0; i < 100; i++) {
      const x = (i * 137) % this.canvas.width;
      const y = (i * 89) % this.canvas.height;
      const twinkle = 0.3 + Math.sin(time + i) * 0.3;
      this.ctx.fillStyle = `rgba(255, 255, 255, ${twinkle})`;
      this.ctx.fillRect(x, y, 2, 2);
    }
  }

  renderFallingParts() {
    this.fallingParts.forEach(p => {
      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate(p.rotation);
      
      this.ctx.fillStyle = p.part.color;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, 25, 0, Math.PI * 2);
      this.ctx.fill();
      
      this.ctx.fillStyle = '#FFF';
      this.ctx.font = '20px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(p.part.emoji, 0, 0);
      
      this.ctx.restore();
    });
  }

  renderDebris() {
    this.debris.forEach(d => {
      this.ctx.save();
      this.ctx.translate(d.x, d.y);
      this.ctx.rotate(d.rotation);
      
      this.ctx.fillStyle = '#666';
      this.ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const radius = 15 + Math.sin(i * 3) * 5;
        const px = Math.cos(angle) * radius;
        const py = Math.sin(angle) * radius;
        if (i === 0) {
          this.ctx.moveTo(px, py);
        } else {
          this.ctx.lineTo(px, py);
        }
      }
      this.ctx.closePath();
      this.ctx.fill();
      
      this.ctx.fillStyle = '#FFF';
      this.ctx.font = '16px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(d.type.emoji, 0, 0);
      
      this.ctx.restore();
    });
  }

  renderCatcher() {
    const y = this.canvas.height - 60;
    
    this.ctx.fillStyle = '#2C3E50';
    this.ctx.fillRect(this.catcher.x - 10, y - 10, this.catcher.width + 20, this.catcher.height + 20);
    
    const gradient = this.ctx.createLinearGradient(this.catcher.x, y, this.catcher.x + this.catcher.width, y);
    gradient.addColorStop(0, '#E74C3C');
    gradient.addColorStop(0.5, '#C0392B');
    gradient.addColorStop(1, '#E74C3C');
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(this.catcher.x, y, this.catcher.width, this.catcher.height);
    
    this.ctx.fillStyle = '#FFF';
    this.ctx.font = 'bold 10px Consolas';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('COLLECTOR', this.catcher.x + this.catcher.width / 2, y + 13);
    
    this.ctx.strokeStyle = '#00FF00';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(this.catcher.x, y - 5);
    this.ctx.lineTo(this.catcher.x - 10, y - 15);
    this.ctx.moveTo(this.catcher.x + this.catcher.width, y - 5);
    this.ctx.lineTo(this.catcher.x + this.catcher.width + 10, y - 15);
    this.ctx.stroke();
  }

  updateHUD() {
    const healthDisplay = document.getElementById('spacex-health');
    const scoreDisplay = document.getElementById('spacex-score');
    
    if (healthDisplay) {
      healthDisplay.textContent = Math.max(0, Math.floor(this.health));
      healthDisplay.style.color = this.health > 50 ? '#00FF00' : this.health > 25 ? '#FFD700' : '#FF0000';
    }
    if (scoreDisplay) scoreDisplay.textContent = this.score;
  }

  updatePartsDisplay() {
    const partsContainer = document.getElementById('parts-collected');
    const rocketDisplay = document.getElementById('rocket-display');
    
    if (partsContainer) {
      let html = '';
      this.requiredParts.forEach(partId => {
        const part = this.rocketParts.find(p => p.id === partId);
        const collected = this.collectedParts.includes(partId);
        html += `<div class="part-indicator ${collected ? 'collected' : ''}" title="${part.name}">${part.emoji}</div>`;
      });
      partsContainer.innerHTML = html;
    }
    
    if (rocketDisplay) {
      let rocketHtml = '';
      if (this.collectedParts.includes('nosecone')) rocketHtml += '🔺<br>';
      if (this.collectedParts.includes('stage2')) rocketHtml += '🚀<br>';
      if (this.collectedParts.includes('stage1')) rocketHtml += '🔧<br>';
      if (this.collectedParts.includes('engine')) rocketHtml += '🔥';
      
      if (rocketHtml === '') rocketHtml = '<span style="color: #666; font-size: 12px;">Catch parts!</span>';
      rocketDisplay.innerHTML = rocketHtml;
    }
  }

  checkWinCondition() {
    const hasAllRequired = Array.from(this.requiredParts).every(part => 
      this.collectedParts.includes(part)
    );
    
    if (hasAllRequired) {
      this.winGame();
    }
  }

  resetGame() {
    cancelAnimationFrame(this.gameLoop);
    
    const modal = document.createElement('div');
    modal.className = 'spacex-modal';
    modal.innerHTML = `
      <div style="text-align: center;">
        <div style="font-size: 48px; margin-bottom: 20px;">💥</div>
        <div style="color: #FF0000; font-size: 18px; margin-bottom: 15px;">COLLECTOR DESTROYED!</div>
        <div style="color: #FFF; font-size: 11px; line-height: 1.8; margin-bottom: 20px;">
          Too much debris damage!<br><br>
          Score: ${this.score}<br>
          Parts Collected: ${this.collectedParts.length}
        </div>
        <button class="spacex-btn" id="retry-spacex">🔄 TRY AGAIN</button>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('retry-spacex').addEventListener('click', () => {
      modal.remove();
      this.startGame();
    });
  }

  winGame() {
    this.gameWon = true;
    this.gameStarted = false;
    cancelAnimationFrame(this.gameLoop);
    
    const modal = document.createElement('div');
    modal.className = 'spacex-modal';
    modal.innerHTML = `
      <div style="text-align: center;">
        <div style="font-size: 64px; margin-bottom: 20px;">🎉🚀🎉</div>
        <div style="color: #00FF00; font-size: 18px; margin-bottom: 15px;">STARSHIP COMPLETE!</div>
        <div style="color: #FFF; font-size: 11px; line-height: 1.8; margin-bottom: 20px;">
          Outstanding engineering, settler!<br><br>
          Final Score: ${this.score}<br>
          Health Remaining: ${Math.floor(this.health)}%<br>
          Total Parts: ${this.collectedParts.length}<br><br>
          <span style="color: #FFD700;">You've earned the FUEL CELL!</span>
        </div>
        <div style="font-size: 10px; color: #E74C3C; margin-bottom: 20px; padding: 15px; background: rgba(231, 76, 60, 0.1); border-radius: 8px;">
          "Reusability is the holy grail of rocketry. You've proven you understand that."<br>
          - Dr. Falcon
        </div>
        <button class="spacex-btn" id="complete-spacex">⚡ CLAIM FUEL CELL</button>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('complete-spacex').addEventListener('click', () => {
      modal.remove();
      this.cleanup();
      this.levelRef.completeLevel();
    });
  }

  cleanup() {
    cancelAnimationFrame(this.gameLoop);
    document.removeEventListener('keydown', this.keyDownHandler);
    document.removeEventListener('keyup', this.keyUpHandler);
    const container = document.getElementById('spacex-game-container');
    if (container) container.remove();
    document.querySelectorAll('.spacex-modal').forEach(m => m.remove());
  }
}

class GameLevelSpaceX {
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
      name: 'spacex_lab',
      greeting: "Welcome to the SpaceX Tech Lab!",
      src: this.path + "/images/gamify/spacebase.png",
      pixels: { height: 966, width: 654 }
    };
  }

  createPlayerData() {
    const scaleFactor = 5;
    return {
      id: 'Settler',
      greeting: "Time to learn SpaceX secrets!",
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
    this.assemblyGame = new RocketAssemblyGame(this);
    this.assemblyGame.init();
  }

  completeLevel() {
    if (this.gameEnv.gameControl && this.gameEnv.gameControl.gameOver) {
      this.gameEnv.gameControl.gameOver();
    }
  }
}

export default GameLevelSpaceX;
