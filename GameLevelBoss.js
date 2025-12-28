import GameEnvBackground from './GameEngine/GameEnvBackground.js';
import Player from './GameEngine/Player.js';

class BossFightGame {
  constructor(levelRef) {
    this.levelRef = levelRef;
    this.canvas = null;
    this.ctx = null;
    this.gameLoop = null;
    this.gameStarted = false;
    this.gameWon = false;
    this.gameLost = false;
    
    this.player = { x: 400, y: 500, width: 60, height: 40, health: 100, invincible: 0 };
    this.boss = { x: 400, y: 80, width: 120, height: 100, health: 100, phase: 1, moveDir: 1, attackTimer: 0 };
    this.playerBullets = [];
    this.bossBullets = [];
    this.explosions = [];
    this.particles = [];
    this.stars = [];
    
    this.keysPressed = {};
    this.playerSpeed = 7;
    this.canShoot = true;
    this.shootCooldown = 150;
    this.gameTime = 0;
    this.maxTime = 45000;
    
    this.phaseMessages = [
      "PHASE 1: Elon deploys his Starlink satellites!",
      "PHASE 2: Raptor engines at maximum thrust!",
      "PHASE 3: FINAL FORM - Full Starship assault!"
    ];
  }

  init() {
    this.injectStyles();
    this.createUI();
    this.generateStars();
    this.showIntroModal();
    this.bindKeys();
  }

  injectStyles() {
    if (document.getElementById('boss-game-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'boss-game-styles';
    style.textContent = `
      @keyframes bossGlow { 0%, 100% { filter: drop-shadow(0 0 20px #FF0000); } 50% { filter: drop-shadow(0 0 40px #FF6600); } }
      @keyframes phaseFlash { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      @keyframes shakeScreen { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
      .boss-modal {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #1a0000 0%, #330000 100%);
        border: 3px solid #FF0000;
        border-radius: 15px;
        padding: 30px;
        z-index: 10001;
        font-family: 'Impact', sans-serif;
        max-width: 550px;
        box-shadow: 0 0 50px rgba(255, 0, 0, 0.6);
      }
      .boss-btn {
        background: linear-gradient(135deg, #FF0000, #AA0000);
        border: none;
        color: #FFF;
        padding: 15px 30px;
        font-family: 'Impact', sans-serif;
        font-size: 16px;
        letter-spacing: 2px;
        cursor: pointer;
        border-radius: 8px;
        transition: all 0.3s;
        margin: 5px;
      }
      .boss-btn:hover {
        transform: scale(1.1);
        box-shadow: 0 0 30px rgba(255, 0, 0, 0.8);
      }
      .phase-announce {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-family: 'Impact', sans-serif;
        font-size: 32px;
        color: #FF0000;
        text-shadow: 0 0 20px #FF0000;
        animation: phaseFlash 0.5s ease 3;
        z-index: 10000;
        pointer-events: none;
      }
    `;
    document.head.appendChild(style);
  }

  createUI() {
    const container = document.createElement('div');
    container.id = 'boss-game-container';
    container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 9999;
      background: #000;
    `;
    
    container.innerHTML = `
      <canvas id="boss-canvas" style="width: 100%; height: 100%;"></canvas>
      <div id="boss-hud" style="
        position: absolute;
        top: 20px;
        left: 20px;
        font-family: 'Impact', sans-serif;
        color: #FFF;
        font-size: 14px;
        text-shadow: 0 0 10px #000;
      ">
        <div style="margin-bottom: 10px;">
          <span style="color: #00FF00;">YOUR HEALTH</span>
          <div style="width: 200px; height: 20px; background: #333; border: 2px solid #00FF00; border-radius: 5px; overflow: hidden;">
            <div id="player-health-bar" style="width: 100%; height: 100%; background: linear-gradient(90deg, #00FF00, #00AA00); transition: width 0.3s;"></div>
          </div>
        </div>
      </div>
      <div id="boss-health-hud" style="
        position: absolute;
        top: 20px;
        right: 20px;
        font-family: 'Impact', sans-serif;
        color: #FFF;
        font-size: 14px;
        text-align: right;
        text-shadow: 0 0 10px #000;
      ">
        <div style="margin-bottom: 5px;">
          <span style="color: #FF0000;">ELON MUSK</span>
          <span id="boss-phase" style="color: #FFD700; margin-left: 10px;">PHASE 1</span>
        </div>
        <div style="width: 300px; height: 25px; background: #333; border: 2px solid #FF0000; border-radius: 5px; overflow: hidden;">
          <div id="boss-health-bar" style="width: 100%; height: 100%; background: linear-gradient(90deg, #FF0000, #FF6600); transition: width 0.3s;"></div>
        </div>
      </div>
      <div id="time-display" style="
        position: absolute;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        font-family: 'Impact', sans-serif;
        font-size: 24px;
        color: #FFD700;
        text-shadow: 0 0 10px #000;
      ">TIME: 0:45</div>
      <div id="controls-hint" style="
        position: absolute;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        font-family: 'Impact', sans-serif;
        font-size: 12px;
        color: #888;
      ">WASD/ARROWS: Move | SPACE: Fire</div>
    `;
    
    document.body.appendChild(container);
    
    this.canvas = document.getElementById('boss-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.player.x = this.canvas.width / 2 - this.player.width / 2;
    this.player.y = this.canvas.height - 100;
    this.boss.x = this.canvas.width / 2 - this.boss.width / 2;
  }

  generateStars() {
    this.stars = [];
    for (let i = 0; i < 150; i++) {
      this.stars.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 2 + 1
      });
    }
  }

  showIntroModal() {
    const modal = document.createElement('div');
    modal.className = 'boss-modal';
    modal.id = 'boss-intro-modal';
    modal.innerHTML = `
      <div style="text-align: center;">
        <div style="font-size: 64px; margin-bottom: 10px;">🚀⚔️🚀</div>
        <div style="color: #FF0000; font-size: 28px; margin-bottom: 10px; letter-spacing: 3px;">FINAL BOSS</div>
        <div style="color: #FFD700; font-size: 36px; margin-bottom: 20px;">ELON MUSK</div>
        <div style="color: #FFF; font-size: 14px; line-height: 1.8; margin-bottom: 20px;">
          "You dare challenge me, settler?<br>
          I control the future of space travel!<br>
          Let's see if you can handle my Starship!"<br><br>
          <span style="color: #FF6600;">Defeat Elon to save Nova Settlement!</span>
        </div>
        <div style="color: #888; font-size: 12px; margin-bottom: 20px;">
          WASD/Arrows to move | SPACE to shoot<br>
          Survive and defeat all 3 phases!
        </div>
        <button class="boss-btn" id="start-boss-game">⚔️ BEGIN BATTLE ⚔️</button>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('start-boss-game').addEventListener('click', () => {
      modal.remove();
      this.startGame();
    });
  }

  bindKeys() {
    this.keyDownHandler = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space'].includes(e.code)) {
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
    this.gameTime = 0;
    this.boss.health = 100;
    this.boss.phase = 1;
    this.player.health = 100;
    this.showPhaseAnnouncement(1);
    this.runGameLoop();
  }

  showPhaseAnnouncement(phase) {
    const announce = document.createElement('div');
    announce.className = 'phase-announce';
    announce.textContent = this.phaseMessages[phase - 1];
    document.body.appendChild(announce);
    
    setTimeout(() => announce.remove(), 2000);
    
    const phaseDisplay = document.getElementById('boss-phase');
    if (phaseDisplay) phaseDisplay.textContent = `PHASE ${phase}`;
  }

  runGameLoop() {
    const lastTime = performance.now();
    
    const loop = (currentTime) => {
      if (!this.gameStarted || this.gameWon || this.gameLost) return;
      
      const deltaTime = currentTime - lastTime;
      this.gameTime += 16;
      
      this.handleInput();
      this.updatePlayer();
      this.updateBoss();
      this.updateBullets();
      this.updateExplosions();
      this.updateParticles();
      this.checkCollisions();
      this.updateStars();
      this.render();
      this.updateHUD();
      
      if (this.boss.health <= 0) {
        this.winGame();
        return;
      }
      
      if (this.player.health <= 0) {
        this.loseGame();
        return;
      }
      
      this.gameLoop = requestAnimationFrame(loop);
    };
    
    this.gameLoop = requestAnimationFrame(loop);
  }

  handleInput() {
    if (this.keysPressed['ArrowLeft'] || this.keysPressed['KeyA']) {
      this.player.x -= this.playerSpeed;
    }
    if (this.keysPressed['ArrowRight'] || this.keysPressed['KeyD']) {
      this.player.x += this.playerSpeed;
    }
    if (this.keysPressed['ArrowUp'] || this.keysPressed['KeyW']) {
      this.player.y -= this.playerSpeed;
    }
    if (this.keysPressed['ArrowDown'] || this.keysPressed['KeyS']) {
      this.player.y += this.playerSpeed;
    }
    
    this.player.x = Math.max(0, Math.min(this.canvas.width - this.player.width, this.player.x));
    this.player.y = Math.max(this.canvas.height / 2, Math.min(this.canvas.height - this.player.height - 20, this.player.y));
    
    if (this.keysPressed['Space'] && this.canShoot) {
      this.shootPlayerBullet();
      this.canShoot = false;
      setTimeout(() => this.canShoot = true, this.shootCooldown);
    }
  }

  shootPlayerBullet() {
    this.playerBullets.push({
      x: this.player.x + this.player.width / 2 - 3,
      y: this.player.y,
      width: 6,
      height: 15,
      speed: 12
    });
    
    this.addParticles(this.player.x + this.player.width / 2, this.player.y, '#00FFFF', 5);
  }

  updatePlayer() {
    if (this.player.invincible > 0) {
      this.player.invincible--;
    }
  }

  updateBoss() {
    const phase = this.boss.phase;
    const speed = 2 + phase;
    
    this.boss.x += this.boss.moveDir * speed;
    
    if (this.boss.x <= 50 || this.boss.x >= this.canvas.width - this.boss.width - 50) {
      this.boss.moveDir *= -1;
    }
    
    this.boss.attackTimer++;
    
    if (phase === 1) {
      if (this.boss.attackTimer % 60 === 0) {
        this.bossAttackPhase1();
      }
    } else if (phase === 2) {
      if (this.boss.attackTimer % 40 === 0) {
        this.bossAttackPhase2();
      }
    } else if (phase === 3) {
      if (this.boss.attackTimer % 25 === 0) {
        this.bossAttackPhase3();
      }
    }
    
    if (this.boss.health <= 66 && this.boss.phase === 1) {
      this.boss.phase = 2;
      this.showPhaseAnnouncement(2);
      this.shakeScreen();
    } else if (this.boss.health <= 33 && this.boss.phase === 2) {
      this.boss.phase = 3;
      this.showPhaseAnnouncement(3);
      this.shakeScreen();
    }
  }

  bossAttackPhase1() {
    this.bossBullets.push({
      x: this.boss.x + this.boss.width / 2 - 5,
      y: this.boss.y + this.boss.height,
      width: 10,
      height: 10,
      speed: 5,
      type: 'satellite'
    });
  }

  bossAttackPhase2() {
    for (let i = -1; i <= 1; i++) {
      this.bossBullets.push({
        x: this.boss.x + this.boss.width / 2 - 5 + i * 30,
        y: this.boss.y + this.boss.height,
        width: 12,
        height: 20,
        speed: 6,
        vx: i * 1.5,
        type: 'rocket'
      });
    }
  }

  bossAttackPhase3() {
    const angle = Math.atan2(
      this.player.y - this.boss.y,
      this.player.x - this.boss.x
    );
    
    for (let i = -2; i <= 2; i++) {
      const spreadAngle = angle + i * 0.15;
      this.bossBullets.push({
        x: this.boss.x + this.boss.width / 2,
        y: this.boss.y + this.boss.height,
        width: 15,
        height: 15,
        speed: 7,
        vx: Math.cos(spreadAngle) * 7,
        vy: Math.sin(spreadAngle) * 7,
        type: 'plasma'
      });
    }
  }

  updateBullets() {
    this.playerBullets = this.playerBullets.filter(b => {
      b.y -= b.speed;
      return b.y > -b.height;
    });
    
    this.bossBullets = this.bossBullets.filter(b => {
      if (b.vx !== undefined) {
        b.x += b.vx;
        b.y += b.vy || b.speed;
      } else {
        b.y += b.speed;
      }
      return b.y < this.canvas.height + 50 && b.x > -50 && b.x < this.canvas.width + 50;
    });
  }

  updateExplosions() {
    this.explosions = this.explosions.filter(e => {
      e.frame++;
      e.radius += 2;
      e.alpha -= 0.05;
      return e.alpha > 0;
    });
  }

  updateParticles() {
    this.particles = this.particles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      return p.life > 0;
    });
  }

  updateStars() {
    this.stars.forEach(star => {
      star.y += star.speed;
      if (star.y > this.canvas.height) {
        star.y = 0;
        star.x = Math.random() * this.canvas.width;
      }
    });
  }

  checkCollisions() {
    this.playerBullets = this.playerBullets.filter(bullet => {
      if (this.rectCollision(bullet, this.boss)) {
        this.boss.health -= 3;
        this.addExplosion(bullet.x, bullet.y, '#FF6600');
        this.addParticles(bullet.x, bullet.y, '#FF0000', 8);
        return false;
      }
      return true;
    });
    
    if (this.player.invincible <= 0) {
      this.bossBullets = this.bossBullets.filter(bullet => {
        if (this.rectCollision(bullet, this.player)) {
          this.player.health -= 10;
          this.player.invincible = 60;
          this.addExplosion(this.player.x + this.player.width / 2, this.player.y, '#00FFFF');
          this.shakeScreen();
          return false;
        }
        return true;
      });
    }
  }

  rectCollision(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
  }

  addExplosion(x, y, color) {
    this.explosions.push({ x, y, radius: 5, alpha: 1, frame: 0, color });
  }

  addParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 20 + Math.random() * 20,
        color
      });
    }
  }

  shakeScreen() {
    const container = document.getElementById('boss-game-container');
    if (container) {
      container.style.animation = 'shakeScreen 0.3s ease';
      setTimeout(() => container.style.animation = '', 300);
    }
  }

  render() {
    this.ctx.fillStyle = '#000510';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.renderStars();
    this.renderParticles();
    this.renderBoss();
    this.renderPlayer();
    this.renderBullets();
    this.renderExplosions();
  }

  renderStars() {
    this.ctx.fillStyle = '#FFF';
    this.stars.forEach(star => {
      this.ctx.globalAlpha = 0.5 + Math.random() * 0.5;
      this.ctx.fillRect(star.x, star.y, star.size, star.size);
    });
    this.ctx.globalAlpha = 1;
  }

  renderPlayer() {
    if (this.player.invincible > 0 && Math.floor(this.player.invincible / 5) % 2 === 0) {
      return;
    }
    
    this.ctx.save();
    this.ctx.translate(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2);
    
    this.ctx.fillStyle = '#00FFFF';
    this.ctx.beginPath();
    this.ctx.moveTo(0, -this.player.height / 2);
    this.ctx.lineTo(-this.player.width / 2, this.player.height / 2);
    this.ctx.lineTo(0, this.player.height / 4);
    this.ctx.lineTo(this.player.width / 2, this.player.height / 2);
    this.ctx.closePath();
    this.ctx.fill();
    
    this.ctx.fillStyle = '#0088FF';
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 8, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.fillStyle = '#FF6600';
    this.ctx.beginPath();
    this.ctx.moveTo(-8, this.player.height / 2);
    this.ctx.lineTo(0, this.player.height / 2 + 15 + Math.random() * 10);
    this.ctx.lineTo(8, this.player.height / 2);
    this.ctx.closePath();
    this.ctx.fill();
    
    this.ctx.restore();
  }

  renderBoss() {
    this.ctx.save();
    this.ctx.translate(this.boss.x + this.boss.width / 2, this.boss.y + this.boss.height / 2);
    
    const glow = Math.sin(Date.now() * 0.01) * 10 + 20;
    this.ctx.shadowColor = '#FF0000';
    this.ctx.shadowBlur = glow;
    
    this.ctx.fillStyle = '#444';
    this.ctx.beginPath();
    this.ctx.moveTo(0, -this.boss.height / 2);
    this.ctx.lineTo(-this.boss.width / 3, this.boss.height / 4);
    this.ctx.lineTo(-this.boss.width / 2, this.boss.height / 2);
    this.ctx.lineTo(this.boss.width / 2, this.boss.height / 2);
    this.ctx.lineTo(this.boss.width / 3, this.boss.height / 4);
    this.ctx.closePath();
    this.ctx.fill();
    
    this.ctx.fillStyle = '#666';
    this.ctx.beginPath();
    this.ctx.ellipse(0, -this.boss.height / 4, 25, 15, 0, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.fillStyle = '#FF0000';
    const flameHeight = 20 + Math.random() * 15;
    for (let i = -1; i <= 1; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(i * 25 - 10, this.boss.height / 2);
      this.ctx.lineTo(i * 25, this.boss.height / 2 + flameHeight);
      this.ctx.lineTo(i * 25 + 10, this.boss.height / 2);
      this.ctx.closePath();
      this.ctx.fill();
    }
    
    this.ctx.fillStyle = '#FFF';
    this.ctx.font = 'bold 14px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('X', 0, 5);
    
    this.ctx.restore();
    this.ctx.shadowBlur = 0;
  }

  renderBullets() {
    this.ctx.fillStyle = '#00FFFF';
    this.ctx.shadowColor = '#00FFFF';
    this.ctx.shadowBlur = 10;
    this.playerBullets.forEach(b => {
      this.ctx.fillRect(b.x, b.y, b.width, b.height);
    });
    
    this.bossBullets.forEach(b => {
      if (b.type === 'satellite') {
        this.ctx.fillStyle = '#888';
        this.ctx.fillRect(b.x, b.y, b.width, b.height);
        this.ctx.fillStyle = '#0088FF';
        this.ctx.fillRect(b.x - 8, b.y + 3, 26, 4);
      } else if (b.type === 'rocket') {
        this.ctx.fillStyle = '#FF6600';
        this.ctx.beginPath();
        this.ctx.moveTo(b.x + b.width / 2, b.y);
        this.ctx.lineTo(b.x, b.y + b.height);
        this.ctx.lineTo(b.x + b.width, b.y + b.height);
        this.ctx.closePath();
        this.ctx.fill();
      } else if (b.type === 'plasma') {
        this.ctx.fillStyle = '#FF00FF';
        this.ctx.beginPath();
        this.ctx.arc(b.x, b.y, b.width / 2, 0, Math.PI * 2);
        this.ctx.fill();
      }
    });
    
    this.ctx.shadowBlur = 0;
  }

  renderExplosions() {
    this.explosions.forEach(e => {
      this.ctx.globalAlpha = e.alpha;
      this.ctx.strokeStyle = e.color;
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
      this.ctx.stroke();
      
      this.ctx.fillStyle = e.color;
      this.ctx.beginPath();
      this.ctx.arc(e.x, e.y, e.radius * 0.5, 0, Math.PI * 2);
      this.ctx.fill();
    });
    this.ctx.globalAlpha = 1;
  }

  renderParticles() {
    this.particles.forEach(p => {
      this.ctx.globalAlpha = p.life / 40;
      this.ctx.fillStyle = p.color;
      this.ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
    });
    this.ctx.globalAlpha = 1;
  }

  updateHUD() {
    const playerBar = document.getElementById('player-health-bar');
    const bossBar = document.getElementById('boss-health-bar');
    const timeDisplay = document.getElementById('time-display');
    
    if (playerBar) playerBar.style.width = Math.max(0, this.player.health) + '%';
    if (bossBar) bossBar.style.width = Math.max(0, this.boss.health) + '%';
    
    const remaining = Math.max(0, Math.ceil((this.maxTime - this.gameTime) / 1000));
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    if (timeDisplay) timeDisplay.textContent = `TIME: ${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  winGame() {
    this.gameWon = true;
    this.gameStarted = false;
    cancelAnimationFrame(this.gameLoop);
    
    for (let i = 0; i < 50; i++) {
      setTimeout(() => {
        this.addExplosion(
          this.boss.x + Math.random() * this.boss.width,
          this.boss.y + Math.random() * this.boss.height,
          ['#FF0000', '#FF6600', '#FFFF00'][Math.floor(Math.random() * 3)]
        );
      }, i * 50);
    }
    
    setTimeout(() => {
      const modal = document.createElement('div');
      modal.className = 'boss-modal';
      modal.innerHTML = `
        <div style="text-align: center;">
          <div style="font-size: 64px; margin-bottom: 20px;">🎉🏆🎉</div>
          <div style="color: #00FF00; font-size: 32px; margin-bottom: 10px;">VICTORY!</div>
          <div style="color: #FFD700; font-size: 18px; margin-bottom: 20px;">ELON MUSK DEFEATED!</div>
          <div style="color: #FFF; font-size: 14px; line-height: 1.8; margin-bottom: 20px;">
            "Impossible! You've proven yourself worthy, settler.<br>
            Take the fuel... Nova Settlement has earned it."<br><br>
            <span style="color: #00FF00;">NOVA SETTLEMENT IS SAVED!</span>
          </div>
          <div style="color: #FFD700; font-size: 12px; margin-bottom: 20px;">
            Remaining Health: ${Math.floor(this.player.health)}%<br>
            Boss defeated in all 3 phases!
          </div>
          <button class="boss-btn" id="complete-boss" style="background: linear-gradient(135deg, #00FF00, #00AA00);">
            🏆 CLAIM VICTORY 🏆
          </button>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      document.getElementById('complete-boss').addEventListener('click', () => {
        modal.remove();
        this.cleanup();
        this.levelRef.completeLevel();
      });
    }, 2500);
  }

  loseGame() {
    this.gameLost = true;
    this.gameStarted = false;
    cancelAnimationFrame(this.gameLoop);
    
    const modal = document.createElement('div');
    modal.className = 'boss-modal';
    modal.innerHTML = `
      <div style="text-align: center;">
        <div style="font-size: 64px; margin-bottom: 20px;">💥</div>
        <div style="color: #FF0000; font-size: 32px; margin-bottom: 10px;">DEFEATED</div>
        <div style="color: #FFF; font-size: 14px; line-height: 1.8; margin-bottom: 20px;">
          "Ha! You thought you could defeat me?<br>
          Come back when you're ready for a real fight!"<br><br>
          <span style="color: #FF6600;">Nova Settlement still needs you!</span>
        </div>
        <button class="boss-btn" id="retry-boss">🔄 TRY AGAIN</button>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('retry-boss').addEventListener('click', () => {
      modal.remove();
      this.resetGame();
    });
  }

  resetGame() {
    this.gameWon = false;
    this.gameLost = false;
    this.player.health = 100;
    this.player.invincible = 0;
    this.boss.health = 100;
    this.boss.phase = 1;
    this.boss.attackTimer = 0;
    this.playerBullets = [];
    this.bossBullets = [];
    this.explosions = [];
    this.particles = [];
    this.gameTime = 0;
    
    this.player.x = this.canvas.width / 2 - this.player.width / 2;
    this.player.y = this.canvas.height - 100;
    this.boss.x = this.canvas.width / 2 - this.boss.width / 2;
    
    this.startGame();
  }

  cleanup() {
    cancelAnimationFrame(this.gameLoop);
    document.removeEventListener('keydown', this.keyDownHandler);
    document.removeEventListener('keyup', this.keyUpHandler);
    const container = document.getElementById('boss-game-container');
    if (container) container.remove();
    document.querySelectorAll('.boss-modal').forEach(m => m.remove());
    document.querySelectorAll('.phase-announce').forEach(a => a.remove());
  }
}

class GameLevelBoss {
  constructor(gameEnv) {
    this.gameEnv = gameEnv;
    this.width = gameEnv.innerWidth;
    this.height = gameEnv.innerHeight;
    this.path = gameEnv.path;

    this.classes = this.buildLevel();
    
    setTimeout(() => this.initBossFight(), 1000);
  }

  createBackgroundData() {
    return {
      name: 'spacex_arena',
      greeting: "Welcome to the SpaceX Arena - FINAL BATTLE!",
      src: this.path + "/images/gamify/spacebase.png",
      pixels: { height: 966, width: 654 }
    };
  }

  createPlayerData() {
    const scaleFactor = 5;
    return {
      id: 'Settler',
      greeting: "This is it... the final challenge!",
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

  initBossFight() {
    this.bossFight = new BossFightGame(this);
    this.bossFight.init();
  }

  completeLevel() {
    if (this.gameEnv.gameControl && this.gameEnv.gameControl.gameOver) {
      this.gameEnv.gameControl.gameOver();
    }
  }
}

export default GameLevelBoss;
