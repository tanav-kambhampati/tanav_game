import GameEnvBackground from './GameEngine/GameEnvBackground.js';
import Player from './GameEngine/Player.js';

class GameLevelPropulsion {
  constructor(gameEnv) {
    this.gameEnv = gameEnv;
    this.width = gameEnv.innerWidth;
    this.height = gameEnv.innerHeight;
    this.path = gameEnv.path;

    // Game state
    this.gameStarted = false;
    this.gameWon = false;
    this.currentQuestion = 0;
    this.correctAnswers = 0;
    this.rocketAltitude = 0;
    this.rocketVelocity = 0;
    this.fuel = 100;
    this.thrust = 0;
    this.targetAltitude = 1000;
    this.gravity = 0.5;
    
    // Questions about propulsion
    this.questions = [
      {
        question: "What law explains how rockets work?",
        answers: ["Newton's First Law", "Newton's Second Law", "Newton's Third Law", "Law of Gravity"],
        correct: 2,
        explanation: "Newton's Third Law: For every action, there is an equal and opposite reaction!"
      },
      {
        question: "What happens when a rocket expels gas downward?",
        answers: ["Nothing happens", "Rocket moves down", "Rocket moves up", "Rocket spins"],
        correct: 2,
        explanation: "The rocket moves UP because the expelled gas pushes DOWN - action and reaction!"
      },
      {
        question: "What fuel do SpaceX Raptor engines use?",
        answers: ["Gasoline", "Liquid Methane & Oxygen", "Solid Fuel", "Nuclear Power"],
        correct: 1,
        explanation: "Raptor engines use liquid methane (CH4) and liquid oxygen (LOX) - called Methalox!"
      },
      {
        question: "What is thrust measured in?",
        answers: ["Meters", "Kilograms", "Newtons", "Watts"],
        correct: 2,
        explanation: "Thrust is a force, measured in Newtons (N) - named after Sir Isaac Newton!"
      },
      {
        question: "What is escape velocity from Earth?",
        answers: ["100 mph", "1,000 mph", "11,000 mph (25,000 mph)", "100,000 mph"],
        correct: 2,
        explanation: "Escape velocity is about 25,020 mph (11.2 km/s) - that's FAST!"
      }
    ];

    this.classes = this.buildLevel();
    
    // Start the mini-game after a short delay
    setTimeout(() => this.initMiniGame(), 1000);
  }

  createBackgroundData() {
    return {
      name: 'propulsion_facility',
      greeting: "Welcome to the Propulsion Training Facility!",
      src: this.path + "/images/gamify/spacebase.png",
      pixels: { height: 966, width: 654 }
    };
  }

  createPlayerData() {
    const scaleFactor = 5;
    return {
      id: 'Settler',
      greeting: "Time to learn about rocket propulsion!",
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
    this.injectStyles();
    this.createGameUI();
    this.showIntroModal();
  }

  injectStyles() {
    if (document.getElementById('propulsion-game-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'propulsion-game-styles';
    style.textContent = `
      @keyframes rocketShake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-3px); }
        75% { transform: translateX(3px); }
      }
      @keyframes flame {
        0%, 100% { transform: scaleY(1); opacity: 1; }
        50% { transform: scaleY(1.3); opacity: 0.8; }
      }
      @keyframes starTwinkle {
        0%, 100% { opacity: 0.3; }
        50% { opacity: 1; }
      }
      @keyframes successPulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }
      .propulsion-modal {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #0a0a2e 0%, #1a1a4e 100%);
        border: 3px solid #00FFFF;
        border-radius: 15px;
        padding: 30px;
        z-index: 10001;
        font-family: 'Press Start 2P', cursive;
        max-width: 600px;
        box-shadow: 0 0 50px rgba(0, 255, 255, 0.5);
      }
      .propulsion-btn {
        background: linear-gradient(135deg, #00FFFF, #0088FF);
        border: none;
        color: #000;
        padding: 12px 24px;
        font-family: 'Press Start 2P', cursive;
        font-size: 10px;
        cursor: pointer;
        border-radius: 8px;
        transition: all 0.3s;
        margin: 5px;
      }
      .propulsion-btn:hover {
        transform: scale(1.05);
        box-shadow: 0 0 20px rgba(0, 255, 255, 0.8);
      }
      .propulsion-btn.correct {
        background: linear-gradient(135deg, #00FF00, #00AA00) !important;
      }
      .propulsion-btn.wrong {
        background: linear-gradient(135deg, #FF0000, #AA0000) !important;
      }
      .answer-btn {
        display: block;
        width: 100%;
        text-align: left;
        background: rgba(255, 255, 255, 0.1);
        border: 2px solid #00FFFF;
        color: #FFF;
        padding: 15px;
        margin: 10px 0;
        font-family: 'Press Start 2P', cursive;
        font-size: 9px;
        cursor: pointer;
        border-radius: 8px;
        transition: all 0.3s;
      }
      .answer-btn:hover {
        background: rgba(0, 255, 255, 0.2);
        transform: translateX(10px);
      }
    `;
    document.head.appendChild(style);
  }

  createGameUI() {
    // Create the game container
    const container = document.createElement('div');
    container.id = 'propulsion-game-container';
    container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9999;
    `;
    
    // Rocket display area
    container.innerHTML = `
      <div id="rocket-display" style="
        position: absolute;
        right: 50px;
        top: 50%;
        transform: translateY(-50%);
        width: 150px;
        height: 400px;
        background: linear-gradient(to top, #1a0a2e 0%, #0a0a1e 50%, #000022 100%);
        border: 3px solid #00FFFF;
        border-radius: 10px;
        overflow: hidden;
        pointer-events: auto;
      ">
        <!-- Stars -->
        <div id="stars-container" style="position: absolute; width: 100%; height: 100%;"></div>
        
        <!-- Altitude markers -->
        <div style="position: absolute; right: 5px; top: 10px; color: #00FFFF; font-family: 'Press Start 2P'; font-size: 6px;">
          <div>1000m 🎯</div>
        </div>
        <div style="position: absolute; right: 5px; top: 50%; color: #666; font-family: 'Press Start 2P'; font-size: 6px;">500m</div>
        <div style="position: absolute; right: 5px; bottom: 40px; color: #666; font-family: 'Press Start 2P'; font-size: 6px;">0m</div>
        
        <!-- Launch pad -->
        <div style="
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 30px;
          background: linear-gradient(to top, #444, #222);
          border-top: 2px solid #666;
        "></div>
        
        <!-- Rocket -->
        <div id="rocket" style="
          position: absolute;
          bottom: 30px;
          left: 50%;
          transform: translateX(-50%);
          width: 40px;
          height: 80px;
          transition: bottom 0.1s linear;
        ">
          <!-- Rocket body -->
          <div style="
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, #ccc, #fff, #ccc);
            border-radius: 20px 20px 5px 5px;
            position: relative;
          ">
            <!-- Nose cone -->
            <div style="
              position: absolute;
              top: -15px;
              left: 50%;
              transform: translateX(-50%);
              width: 0;
              height: 0;
              border-left: 15px solid transparent;
              border-right: 15px solid transparent;
              border-bottom: 20px solid #FF4444;
            "></div>
            <!-- Window -->
            <div style="
              position: absolute;
              top: 20px;
              left: 50%;
              transform: translateX(-50%);
              width: 15px;
              height: 15px;
              background: #00FFFF;
              border-radius: 50%;
              border: 2px solid #0088FF;
            "></div>
            <!-- Fins -->
            <div style="
              position: absolute;
              bottom: 0;
              left: -10px;
              width: 0;
              height: 0;
              border-top: 20px solid transparent;
              border-right: 15px solid #FF4444;
            "></div>
            <div style="
              position: absolute;
              bottom: 0;
              right: -10px;
              width: 0;
              height: 0;
              border-top: 20px solid transparent;
              border-left: 15px solid #FF4444;
            "></div>
          </div>
          <!-- Flame -->
          <div id="rocket-flame" style="
            position: absolute;
            bottom: -30px;
            left: 50%;
            transform: translateX(-50%);
            width: 20px;
            height: 0;
            background: linear-gradient(to bottom, #FF6600, #FFFF00, transparent);
            border-radius: 0 0 10px 10px;
            transition: height 0.2s;
          "></div>
        </div>
      </div>
      
      <!-- HUD -->
      <div id="propulsion-hud" style="
        position: absolute;
        top: 20px;
        left: 20px;
        background: rgba(0, 0, 0, 0.8);
        border: 2px solid #00FFFF;
        border-radius: 10px;
        padding: 15px;
        font-family: 'Press Start 2P', cursive;
        color: #FFF;
        font-size: 10px;
        pointer-events: auto;
      ">
        <div style="color: #00FFFF; margin-bottom: 10px;">🚀 PROPULSION TRAINING</div>
        <div style="margin: 5px 0;">Altitude: <span id="altitude-display">0</span>m</div>
        <div style="margin: 5px 0;">Velocity: <span id="velocity-display">0</span> m/s</div>
        <div style="margin: 5px 0;">Fuel: <span id="fuel-display">100</span>%</div>
        <div style="margin: 5px 0;">Questions: <span id="score-display">0</span>/5</div>
        <div style="margin-top: 15px; padding: 10px; background: rgba(0, 255, 255, 0.1); border-radius: 5px;">
          <div style="color: #FFD700; font-size: 8px;">TARGET: 1000m</div>
        </div>
      </div>
    `;
    
    document.body.appendChild(container);
    
    // Add stars
    this.addStars();
  }

  addStars() {
    const container = document.getElementById('stars-container');
    if (!container) return;
    
    for (let i = 0; i < 30; i++) {
      const star = document.createElement('div');
      star.style.cssText = `
        position: absolute;
        width: ${Math.random() * 3 + 1}px;
        height: ${Math.random() * 3 + 1}px;
        background: #FFF;
        border-radius: 50%;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 80}%;
        animation: starTwinkle ${Math.random() * 2 + 1}s infinite;
        animation-delay: ${Math.random() * 2}s;
      `;
      container.appendChild(star);
    }
  }

  showIntroModal() {
    const modal = document.createElement('div');
    modal.className = 'propulsion-modal';
    modal.id = 'propulsion-intro-modal';
    modal.innerHTML = `
      <div style="text-align: center;">
        <div style="font-size: 48px; margin-bottom: 20px;">🚀</div>
        <div style="color: #00FFFF; font-size: 14px; margin-bottom: 15px;">PROPULSION TRAINING</div>
        <div style="color: #FFF; font-size: 10px; line-height: 1.8; margin-bottom: 20px;">
          Welcome to Dr. Newton's Propulsion Facility!<br><br>
          Your mission: Launch the rocket to 1000m altitude.<br><br>
          Answer questions correctly to earn thrust power!<br>
          Wrong answers waste fuel.<br><br>
          Use SPACE to fire thrusters after answering!
        </div>
        <button class="propulsion-btn" id="start-propulsion-game">
          🔥 BEGIN TRAINING
        </button>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('start-propulsion-game').addEventListener('click', () => {
      modal.remove();
      this.startGame();
    });
  }

  startGame() {
    this.gameStarted = true;
    this.showQuestion();
    this.startGameLoop();
    
    // Add space bar listener for thrust
    this.thrustHandler = (e) => {
      if (e.code === 'Space' && this.gameStarted && !this.gameWon && this.fuel > 0) {
        e.preventDefault();
        this.applyThrust();
      }
    };
    document.addEventListener('keydown', this.thrustHandler);
  }

  showQuestion() {
    if (this.currentQuestion >= this.questions.length) {
      // All questions answered, just let them fly
      return;
    }
    
    const q = this.questions[this.currentQuestion];
    
    const modal = document.createElement('div');
    modal.className = 'propulsion-modal';
    modal.id = 'question-modal';
    modal.style.pointerEvents = 'auto';
    modal.innerHTML = `
      <div>
        <div style="color: #FFD700; font-size: 10px; margin-bottom: 15px;">
          QUESTION ${this.currentQuestion + 1} OF ${this.questions.length}
        </div>
        <div style="color: #FFF; font-size: 11px; line-height: 1.6; margin-bottom: 20px;">
          ${q.question}
        </div>
        <div id="answers-container">
          ${q.answers.map((a, i) => `
            <button class="answer-btn" data-index="${i}">
              ${String.fromCharCode(65 + i)}. ${a}
            </button>
          `).join('')}
        </div>
        <div id="explanation" style="display: none; margin-top: 15px; padding: 15px; background: rgba(0, 255, 0, 0.1); border: 1px solid #00FF00; border-radius: 8px; color: #00FF00; font-size: 9px; line-height: 1.6;"></div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add click handlers
    const buttons = modal.querySelectorAll('.answer-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.dataset.index);
        this.handleAnswer(index, q, modal);
      });
    });
  }

  handleAnswer(index, question, modal) {
    const buttons = modal.querySelectorAll('.answer-btn');
    const explanation = document.getElementById('explanation');
    
    // Disable all buttons
    buttons.forEach(btn => btn.style.pointerEvents = 'none');
    
    if (index === question.correct) {
      // Correct answer
      buttons[index].classList.add('correct');
      buttons[index].style.background = 'linear-gradient(135deg, #00FF00, #00AA00)';
      this.correctAnswers++;
      this.thrust += 20; // Gain thrust power
      
      explanation.style.display = 'block';
      explanation.style.borderColor = '#00FF00';
      explanation.style.color = '#00FF00';
      explanation.innerHTML = `✅ CORRECT! +20 Thrust Power!<br><br>${question.explanation}`;
    } else {
      // Wrong answer
      buttons[index].classList.add('wrong');
      buttons[index].style.background = 'linear-gradient(135deg, #FF0000, #AA0000)';
      buttons[question.correct].style.background = 'linear-gradient(135deg, #00FF00, #00AA00)';
      this.fuel -= 10; // Lose fuel
      
      explanation.style.display = 'block';
      explanation.style.borderColor = '#FF6600';
      explanation.style.color = '#FF6600';
      explanation.innerHTML = `❌ Wrong! -10 Fuel<br><br>${question.explanation}`;
    }
    
    // Update displays
    this.updateHUD();
    
    // Move to next question after delay
    setTimeout(() => {
      modal.remove();
      this.currentQuestion++;
      
      if (this.currentQuestion < this.questions.length) {
        setTimeout(() => this.showQuestion(), 500);
      } else {
        this.showFinalPhase();
      }
    }, 2500);
  }

  showFinalPhase() {
    const modal = document.createElement('div');
    modal.className = 'propulsion-modal';
    modal.innerHTML = `
      <div style="text-align: center;">
        <div style="font-size: 48px; margin-bottom: 20px;">🔥</div>
        <div style="color: #00FFFF; font-size: 14px; margin-bottom: 15px;">LAUNCH PHASE!</div>
        <div style="color: #FFF; font-size: 10px; line-height: 1.8; margin-bottom: 15px;">
          You answered ${this.correctAnswers}/5 correctly!<br><br>
          Thrust Power: ${this.thrust}<br>
          Remaining Fuel: ${this.fuel}%<br><br>
          Hold SPACE to fire thrusters and reach 1000m!
        </div>
        <button class="propulsion-btn" id="begin-launch">
          🚀 LAUNCH!
        </button>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('begin-launch').addEventListener('click', () => {
      modal.remove();
    });
  }

  applyThrust() {
    if (this.fuel <= 0) return;
    
    this.fuel -= 0.5;
    this.rocketVelocity += (this.thrust / 10);
    
    // Show flame
    const flame = document.getElementById('rocket-flame');
    if (flame) {
      flame.style.height = '40px';
      flame.style.animation = 'flame 0.1s infinite';
      
      // Shake rocket
      const rocket = document.getElementById('rocket');
      if (rocket) {
        rocket.style.animation = 'rocketShake 0.1s infinite';
      }
    }
    
    this.updateHUD();
  }

  startGameLoop() {
    this.gameLoop = setInterval(() => {
      if (!this.gameStarted || this.gameWon) return;
      
      // Apply gravity
      this.rocketVelocity -= this.gravity;
      
      // Apply velocity to altitude
      this.rocketAltitude += this.rocketVelocity;
      
      // Clamp altitude
      if (this.rocketAltitude < 0) {
        this.rocketAltitude = 0;
        this.rocketVelocity = 0;
      }
      
      // Check win condition
      if (this.rocketAltitude >= this.targetAltitude) {
        this.winGame();
        return;
      }
      
      // Update rocket position visually
      this.updateRocketPosition();
      this.updateHUD();
      
      // Stop flame if not thrusting
      const flame = document.getElementById('rocket-flame');
      const rocket = document.getElementById('rocket');
      if (flame && !this.isThrusting) {
        flame.style.height = '0';
        flame.style.animation = 'none';
      }
      if (rocket && !this.isThrusting) {
        rocket.style.animation = 'none';
      }
      this.isThrusting = false;
      
    }, 50);
    
    // Track thrust state
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space') this.isThrusting = true;
    });
  }

  updateRocketPosition() {
    const rocket = document.getElementById('rocket');
    if (!rocket) return;
    
    // Map altitude (0-1000) to visual position (30-350)
    const maxVisualHeight = 320;
    const visualPosition = 30 + (this.rocketAltitude / this.targetAltitude) * maxVisualHeight;
    rocket.style.bottom = Math.min(visualPosition, 350) + 'px';
  }

  updateHUD() {
    const altDisplay = document.getElementById('altitude-display');
    const velDisplay = document.getElementById('velocity-display');
    const fuelDisplay = document.getElementById('fuel-display');
    const scoreDisplay = document.getElementById('score-display');
    
    if (altDisplay) altDisplay.textContent = Math.floor(this.rocketAltitude);
    if (velDisplay) velDisplay.textContent = this.rocketVelocity.toFixed(1);
    if (fuelDisplay) fuelDisplay.textContent = Math.max(0, Math.floor(this.fuel));
    if (scoreDisplay) scoreDisplay.textContent = this.correctAnswers;
  }

  winGame() {
    this.gameWon = true;
    this.gameStarted = false;
    
    // Stop the game loop
    if (this.gameLoop) clearInterval(this.gameLoop);
    
    // Remove thrust handler
    if (this.thrustHandler) {
      document.removeEventListener('keydown', this.thrustHandler);
    }
    
    // Show victory modal
    const modal = document.createElement('div');
    modal.className = 'propulsion-modal';
    modal.style.animation = 'successPulse 1s infinite';
    modal.innerHTML = `
      <div style="text-align: center;">
        <div style="font-size: 64px; margin-bottom: 20px;">🎉🚀🎉</div>
        <div style="color: #00FF00; font-size: 16px; margin-bottom: 15px;">MISSION COMPLETE!</div>
        <div style="color: #FFF; font-size: 11px; line-height: 1.8; margin-bottom: 20px;">
          You reached ${Math.floor(this.rocketAltitude)}m altitude!<br><br>
          Questions Correct: ${this.correctAnswers}/5<br>
          Remaining Fuel: ${Math.floor(this.fuel)}%<br><br>
          <span style="color: #FFD700;">You've earned the ENGINE COMPONENT!</span>
        </div>
        <div style="font-size: 10px; color: #00FFFF; margin-bottom: 20px; padding: 15px; background: rgba(0, 255, 255, 0.1); border-radius: 8px;">
          "Every rocket works by Newton's Third Law - for every action, there's an equal and opposite reaction!"<br>
          - Dr. Newton
        </div>
        <button class="propulsion-btn" id="complete-propulsion">
          ⚙️ CLAIM ENGINE COMPONENT
        </button>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('complete-propulsion').addEventListener('click', () => {
      modal.remove();
      this.cleanup();
      this.completeLevel();
    });
  }

  cleanup() {
    // Remove game UI
    const container = document.getElementById('propulsion-game-container');
    if (container) container.remove();
    
    // Remove any modals
    document.querySelectorAll('.propulsion-modal').forEach(m => m.remove());
    
    // Stop game loop
    if (this.gameLoop) clearInterval(this.gameLoop);
    
    // Remove event listeners
    if (this.thrustHandler) {
      document.removeEventListener('keydown', this.thrustHandler);
    }
  }

  completeLevel() {
    if (this.gameEnv.gameControl && this.gameEnv.gameControl.gameOver) {
      this.gameEnv.gameControl.gameOver();
    }
  }
}

export default GameLevelPropulsion;
