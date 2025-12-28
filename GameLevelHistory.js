import GameEnvBackground from './GameEngine/GameEnvBackground.js';
import Player from './GameEngine/Player.js';

class MemoryMatchGame {
  constructor(levelRef) {
    this.levelRef = levelRef;
    this.cards = [];
    this.flippedCards = [];
    this.matchedPairs = 0;
    this.totalPairs = 8;
    this.moves = 0;
    this.canFlip = true;
    this.gameWon = false;
    
    this.pioneers = [
      { id: 1, name: 'Yuri Gagarin', achievement: 'First human in space', emoji: '🚀' },
      { id: 2, name: 'Neil Armstrong', achievement: 'First on the Moon', emoji: '🌙' },
      { id: 3, name: 'Robert Goddard', achievement: 'Father of rocketry', emoji: '🔬' },
      { id: 4, name: 'Valentina Tereshkova', achievement: 'First woman in space', emoji: '👩‍🚀' },
      { id: 5, name: 'Wernher von Braun', achievement: 'Saturn V architect', emoji: '🛰️' },
      { id: 6, name: 'Buzz Aldrin', achievement: 'Moonwalk pioneer', emoji: '👨‍🚀' },
      { id: 7, name: 'Sally Ride', achievement: 'First US woman in space', emoji: '🌟' },
      { id: 8, name: 'Alan Shepard', achievement: 'First American in space', emoji: '🇺🇸' }
    ];
  }

  init() {
    this.injectStyles();
    this.createUI();
    this.showIntroModal();
  }

  injectStyles() {
    if (document.getElementById('history-game-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'history-game-styles';
    style.textContent = `
      @keyframes cardFlip { 0% { transform: rotateY(0deg); } 100% { transform: rotateY(180deg); } }
      @keyframes cardMatch { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
      @keyframes starBurst { 0% { transform: scale(0) rotate(0deg); opacity: 1; } 100% { transform: scale(2) rotate(180deg); opacity: 0; } }
      .history-modal {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #1a0a2e 0%, #2d1b4e 100%);
        border: 3px solid #FFD700;
        border-radius: 15px;
        padding: 30px;
        z-index: 10001;
        font-family: 'Georgia', serif;
        max-width: 500px;
        box-shadow: 0 0 50px rgba(255, 215, 0, 0.4);
      }
      .history-btn {
        background: linear-gradient(135deg, #FFD700, #FFA500);
        border: none;
        color: #000;
        padding: 12px 24px;
        font-family: 'Georgia', serif;
        font-size: 14px;
        font-weight: bold;
        cursor: pointer;
        border-radius: 8px;
        transition: all 0.3s;
        margin: 5px;
      }
      .history-btn:hover {
        transform: scale(1.05);
        box-shadow: 0 0 20px rgba(255, 215, 0, 0.8);
      }
      .memory-card {
        width: 120px;
        height: 150px;
        perspective: 1000px;
        cursor: pointer;
        margin: 8px;
      }
      .card-inner {
        position: relative;
        width: 100%;
        height: 100%;
        transition: transform 0.5s;
        transform-style: preserve-3d;
      }
      .card-inner.flipped {
        transform: rotateY(180deg);
      }
      .card-front, .card-back {
        position: absolute;
        width: 100%;
        height: 100%;
        backface-visibility: hidden;
        border-radius: 10px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 10px;
        box-sizing: border-box;
      }
      .card-back {
        background: linear-gradient(135deg, #1a0a2e 0%, #4a2a7e 100%);
        border: 2px solid #FFD700;
      }
      .card-front {
        background: linear-gradient(135deg, #2d1b4e 0%, #1a0a2e 100%);
        border: 2px solid #FFD700;
        transform: rotateY(180deg);
      }
      .card-matched {
        animation: cardMatch 0.5s ease;
      }
      .card-matched .card-front {
        border-color: #00FF00;
        box-shadow: 0 0 20px rgba(0, 255, 0, 0.5);
      }
    `;
    document.head.appendChild(style);
  }

  createUI() {
    const container = document.createElement('div');
    container.id = 'history-game-container';
    container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 9999;
      background: radial-gradient(ellipse at center, #1a0a2e 0%, #0a0515 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    `;
    
    container.innerHTML = `
      <div id="history-hud" style="
        position: absolute;
        top: 20px;
        left: 20px;
        background: rgba(26, 10, 46, 0.9);
        border: 2px solid #FFD700;
        border-radius: 10px;
        padding: 15px;
        font-family: 'Georgia', serif;
        color: #FFF;
        font-size: 14px;
      ">
        <div style="color: #FFD700; margin-bottom: 10px; font-size: 16px;">📜 HISTORY ARCHIVES</div>
        <div style="margin: 5px 0;">Pairs Found: <span id="history-pairs" style="color: #00FF00;">0</span>/${this.totalPairs}</div>
        <div style="margin: 5px 0;">Moves: <span id="history-moves">0</span></div>
      </div>
      <div id="history-title" style="
        color: #FFD700;
        font-family: 'Georgia', serif;
        font-size: 24px;
        margin-bottom: 20px;
        text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
      ">Match the Space Pioneers!</div>
      <div id="card-grid" style="
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 10px;
        padding: 20px;
      "></div>
    `;
    
    document.body.appendChild(container);
  }

  showIntroModal() {
    const modal = document.createElement('div');
    modal.className = 'history-modal';
    modal.id = 'history-intro-modal';
    modal.innerHTML = `
      <div style="text-align: center;">
        <div style="font-size: 48px; margin-bottom: 20px;">📜</div>
        <div style="color: #FFD700; font-size: 20px; margin-bottom: 15px;">HISTORY ARCHIVES</div>
        <div style="color: #FFF; font-size: 13px; line-height: 1.8; margin-bottom: 20px;">
          Welcome to the Archives, settler!<br><br>
          Match the space pioneers with their achievements.<br>
          Find all 8 pairs to prove your knowledge!<br><br>
          <span style="color: #FFD700;">The heroes of the past light the way to the stars.</span>
        </div>
        <button class="history-btn" id="start-history-game">📚 BEGIN MATCHING</button>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('start-history-game').addEventListener('click', () => {
      modal.remove();
      this.startGame();
    });
  }

  startGame() {
    this.createCards();
    this.renderCards();
  }

  createCards() {
    this.cards = [];
    
    this.pioneers.forEach(pioneer => {
      this.cards.push({
        id: pioneer.id,
        type: 'name',
        content: pioneer.name,
        emoji: pioneer.emoji,
        matched: false,
        flipped: false
      });
      this.cards.push({
        id: pioneer.id,
        type: 'achievement',
        content: pioneer.achievement,
        emoji: pioneer.emoji,
        matched: false,
        flipped: false
      });
    });
    
    this.shuffleCards();
  }

  shuffleCards() {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  renderCards() {
    const grid = document.getElementById('card-grid');
    grid.innerHTML = '';
    
    this.cards.forEach((card, index) => {
      const cardElement = document.createElement('div');
      cardElement.className = 'memory-card';
      cardElement.dataset.index = index;
      
      cardElement.innerHTML = `
        <div class="card-inner">
          <div class="card-back">
            <div style="font-size: 32px;">⭐</div>
            <div style="color: #FFD700; font-size: 10px; margin-top: 10px;">CLASSIFIED</div>
          </div>
          <div class="card-front">
            <div style="font-size: 28px; margin-bottom: 8px;">${card.emoji}</div>
            <div style="color: #FFF; font-size: 11px; line-height: 1.4;">${card.content}</div>
            <div style="color: #888; font-size: 9px; margin-top: 5px;">${card.type === 'name' ? 'PIONEER' : 'ACHIEVEMENT'}</div>
          </div>
        </div>
      `;
      
      cardElement.addEventListener('click', () => this.flipCard(index));
      grid.appendChild(cardElement);
    });
  }

  flipCard(index) {
    if (!this.canFlip) return;
    if (this.cards[index].flipped) return;
    if (this.cards[index].matched) return;
    if (this.flippedCards.length >= 2) return;
    
    this.cards[index].flipped = true;
    this.flippedCards.push(index);
    
    const cardElement = document.querySelectorAll('.memory-card')[index];
    cardElement.querySelector('.card-inner').classList.add('flipped');
    
    if (this.flippedCards.length === 2) {
      this.moves++;
      this.updateHUD();
      this.checkMatch();
    }
  }

  checkMatch() {
    this.canFlip = false;
    
    const [firstIndex, secondIndex] = this.flippedCards;
    const firstCard = this.cards[firstIndex];
    const secondCard = this.cards[secondIndex];
    
    if (firstCard.id === secondCard.id && firstCard.type !== secondCard.type) {
      this.matchedPairs++;
      firstCard.matched = true;
      secondCard.matched = true;
      
      const cardElements = document.querySelectorAll('.memory-card');
      cardElements[firstIndex].classList.add('card-matched');
      cardElements[secondIndex].classList.add('card-matched');
      
      this.flippedCards = [];
      this.canFlip = true;
      this.updateHUD();
      
      if (this.matchedPairs === this.totalPairs) {
        setTimeout(() => this.winGame(), 500);
      }
    } else {
      setTimeout(() => {
        this.cards[firstIndex].flipped = false;
        this.cards[secondIndex].flipped = false;
        
        const cardElements = document.querySelectorAll('.memory-card');
        cardElements[firstIndex].querySelector('.card-inner').classList.remove('flipped');
        cardElements[secondIndex].querySelector('.card-inner').classList.remove('flipped');
        
        this.flippedCards = [];
        this.canFlip = true;
      }, 1000);
    }
  }

  updateHUD() {
    const pairsDisplay = document.getElementById('history-pairs');
    const movesDisplay = document.getElementById('history-moves');
    
    if (pairsDisplay) pairsDisplay.textContent = this.matchedPairs;
    if (movesDisplay) movesDisplay.textContent = this.moves;
  }

  winGame() {
    this.gameWon = true;
    
    const efficiency = Math.max(0, 100 - (this.moves - this.totalPairs) * 5);
    
    const modal = document.createElement('div');
    modal.className = 'history-modal';
    modal.innerHTML = `
      <div style="text-align: center;">
        <div style="font-size: 64px; margin-bottom: 20px;">🎉📜🎉</div>
        <div style="color: #00FF00; font-size: 20px; margin-bottom: 15px;">ARCHIVES MASTERED!</div>
        <div style="color: #FFF; font-size: 13px; line-height: 1.8; margin-bottom: 20px;">
          Excellent memory, historian!<br><br>
          Pairs Matched: ${this.matchedPairs}/${this.totalPairs}<br>
          Total Moves: ${this.moves}<br>
          Efficiency: ${efficiency}%<br><br>
          <span style="color: #FFD700;">You've earned the HEAT SHIELD!</span>
        </div>
        <div style="font-size: 12px; color: #FFD700; margin-bottom: 20px; padding: 15px; background: rgba(255, 215, 0, 0.1); border-radius: 8px;">
          "Those who don't learn from history are doomed to never reach the stars."<br>
          - Professor Armstrong
        </div>
        <button class="history-btn" id="complete-history">🛡️ CLAIM HEAT SHIELD</button>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('complete-history').addEventListener('click', () => {
      modal.remove();
      this.cleanup();
      this.levelRef.completeLevel();
    });
  }

  cleanup() {
    const container = document.getElementById('history-game-container');
    if (container) container.remove();
    document.querySelectorAll('.history-modal').forEach(m => m.remove());
  }
}

class GameLevelHistory {
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
      name: 'history_archives',
      greeting: "Welcome to the History Archives!",
      src: this.path + "/images/gamify/spacebase.png",
      pixels: { height: 966, width: 654 }
    };
  }

  createPlayerData() {
    const scaleFactor = 5;
    return {
      id: 'Settler',
      greeting: "Time to learn from the pioneers!",
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
    this.memoryGame = new MemoryMatchGame(this);
    this.memoryGame.init();
  }

  completeLevel() {
    if (this.gameEnv.gameControl && this.gameEnv.gameControl.gameOver) {
      this.gameEnv.gameControl.gameOver();
    }
  }
}

export default GameLevelHistory;
