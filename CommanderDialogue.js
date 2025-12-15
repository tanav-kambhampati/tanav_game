// All of the script and some of the CSS was done with AI
class CommanderDialogue {
  constructor(path) {
    this.path = path;
    this.currentIndex = 0;
    this.dialogueSequence = this.createDialogueSequence();
    this.keyHandler = null;
    this.injectStyles();
  }

  createDialogueSequence() {
    return [
      {
        speaker: "Commander Nova",
        avatar: "👩‍🚀",
        text: "Settler, can you hear me? This is Commander Nova speaking through your earpiece.",
        isFirst: true
      },
      {
        speaker: "Commander Nova", 
        avatar: "👩‍🚀",
        text: "Welcome to Nova Settlement. I'll be your guide on this mission. Our situation is critical."
      },
      {
        speaker: "Commander Nova",
        avatar: "👩‍🚀", 
        text: "Our settlement is running dangerously low on rocket fuel. Without it, we can't power our generators or launch supply missions."
      },
      {
        speaker: "Commander Nova",
        avatar: "👩‍🚀",
        text: "The SpaceX Settlement on the eastern ridge is hoarding all the fuel reserves. Their leader, Elon Musk, refuses to share."
      },
      {
        speaker: "Commander Nova",
        avatar: "👩‍🚀",
        text: "But we have a plan. To negotiate with Musk, you'll need to prove you're a capable rocket scientist."
      },
      {
        speaker: "Commander Nova",
        avatar: "👩‍🚀",
        text: "There are FOUR experts in our settlement. Each one will take you to a training area where you'll learn about rockets."
      },
      {
        speaker: "Commander Nova",
        avatar: "👩‍🚀",
        text: "Complete their training to earn critical ROCKET COMPONENTS. You'll need all four to gain access to the SpaceX Settlement."
      },
      {
        speaker: "Commander Nova",
        avatar: "👩‍🚀",
        text: "Once you have all components, confront Elon Musk in a final showdown. If you win, we get the fuel we need to survive."
      },
      {
        speaker: "Commander Nova",
        avatar: "👩‍🚀",
        text: "CONTROLS: Use WASD or Arrow Keys to move. Press E near an NPC to interact. Press I for inventory. Press H for help.",
        isControls: true
      },
      {
        speaker: "Commander Nova",
        avatar: "👩‍🚀",
        text: "I'll be monitoring your progress through your earpiece. Good luck, settler. Nova Settlement is counting on you!",
        isLast: true
      }
    ];
  }

  injectStyles() {
    if (document.getElementById('commander-dialogue-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'commander-dialogue-styles';
    style.textContent = `
      @keyframes dialogueSlideIn {
        from {
          transform: translateX(-50%) translateY(50px);
          opacity: 0;
        }
        to {
          transform: translateX(-50%) translateY(0);
          opacity: 1;
        }
      }
      @keyframes earPieceStatic {
        0%, 100% { opacity: 0.8; }
        50% { opacity: 1; }
      }
      @keyframes textGlow {
        0%, 100% { text-shadow: 0 0 10px #00FFFF; }
        50% { text-shadow: 0 0 20px #00FFFF, 0 0 30px #0088FF; }
      }
      @keyframes msgFadeIn {
        from { opacity: 0; transform: translateX(-50%) translateY(20px); }
        to { opacity: 1; transform: translateX(-50%) translateY(0); }
      }
      @keyframes objectiveSlideIn {
        from { transform: translateX(-50%) translateY(-50px); opacity: 0; }
        to { transform: translateX(-50%) translateY(0); opacity: 1; }
      }
      @keyframes pulseGlow {
        0%, 100% { box-shadow: 0 0 30px rgba(255, 215, 0, 0.5); }
        50% { box-shadow: 0 0 50px rgba(255, 215, 0, 0.8); }
      }
    `;
    document.head.appendChild(style);
  }

  hasSeenIntro() {
    return localStorage.getItem('rocketGame_seenIntro') === 'true';
  }

  markIntroSeen() {
    localStorage.setItem('rocketGame_seenIntro', 'true');
  }

  showIntro() {
    if (this.hasSeenIntro()) return;
    
    setTimeout(() => {
      this.showDialogue(0);
    }, 1500);
  }

  showDialogue(index) {
    this.currentIndex = index;
    const dialogue = this.dialogueSequence[index];
    
    this.removeDialogue();

    const container = document.createElement('div');
    container.id = 'commander-dialogue';
    container.style.cssText = `
      position: fixed;
      bottom: 80px;
      left: 50%;
      transform: translateX(-50%);
      width: 90%;
      max-width: 700px;
      background: linear-gradient(135deg, #0a0a1a 0%, #1a1a3a 50%, #0a0a1a 100%);
      border: 3px solid #00FFFF;
      border-radius: 15px;
      padding: 25px;
      z-index: 10000;
      font-family: 'Press Start 2P', cursive;
      box-shadow: 0 0 30px rgba(0, 255, 255, 0.5), inset 0 0 20px rgba(0, 255, 255, 0.1);
      animation: dialogueSlideIn 0.4s ease-out;
    `;

    container.innerHTML = this.createDialogueHTML(dialogue, index);
    document.body.appendChild(container);

    this.attachEventListeners(container, dialogue);
  }

  createDialogueHTML(dialogue, index) {
    return `
      <div style="display: flex; align-items: flex-start; gap: 20px;">
        <div style="
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #00FFFF, #0088FF);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 30px;
          box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
          animation: earPieceStatic 2s infinite;
          flex-shrink: 0;
        ">
          ${dialogue.avatar}
        </div>
        
        <div style="flex: 1;">
          <div style="
            color: #00FFFF;
            font-size: 12px;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 10px;
          ">
            <span style="animation: textGlow 2s infinite;">📡 ${dialogue.speaker}</span>
            <span style="font-size: 8px; color: #666;">[ EARPIECE TRANSMISSION ]</span>
          </div>
          <div style="
            color: #FFFFFF;
            font-size: 11px;
            line-height: 1.8;
            ${dialogue.isControls ? 'background: rgba(0, 255, 255, 0.1); padding: 15px; border-radius: 8px; border: 1px solid #00FFFF;' : ''}
          ">
            ${dialogue.text}
          </div>
        </div>
      </div>
      
      <div style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 20px;
        padding-top: 15px;
        border-top: 1px solid rgba(0, 255, 255, 0.3);
      ">
        <div style="color: #666; font-size: 8px;">
          ${index + 1} / ${this.dialogueSequence.length}
        </div>
        
        <div style="display: flex; gap: 10px;">
          ${index > 0 ? `
            <button id="cmd-prev" style="
              background: transparent;
              border: 2px solid #666;
              color: #666;
              padding: 10px 20px;
              font-family: 'Press Start 2P', cursive;
              font-size: 10px;
              cursor: pointer;
              border-radius: 5px;
              transition: all 0.3s;
            ">◀ BACK</button>
          ` : ''}
          
          <button id="cmd-next" style="
            background: ${dialogue.isLast ? 'linear-gradient(135deg, #00FF00, #00AA00)' : 'linear-gradient(135deg, #00FFFF, #0088FF)'};
            border: none;
            color: #000;
            padding: 10px 20px;
            font-family: 'Press Start 2P', cursive;
            font-size: 10px;
            cursor: pointer;
            border-radius: 5px;
            transition: all 0.3s;
            box-shadow: 0 0 15px ${dialogue.isLast ? 'rgba(0, 255, 0, 0.5)' : 'rgba(0, 255, 255, 0.5)'};
          ">${dialogue.isLast ? '🚀 BEGIN MISSION' : 'CONTINUE ▶'}</button>
        </div>
      </div>
    `;
  }

  attachEventListeners(container, dialogue) {
    const nextBtn = document.getElementById('cmd-next');
    const prevBtn = document.getElementById('cmd-prev');

    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.handleNext(dialogue));
      nextBtn.addEventListener('mouseenter', () => nextBtn.style.transform = 'scale(1.05)');
      nextBtn.addEventListener('mouseleave', () => nextBtn.style.transform = 'scale(1)');
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => this.handlePrev());
    }

    this.keyHandler = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.handleNext(dialogue);
      }
    };
    document.addEventListener('keydown', this.keyHandler);
  }

  handleNext(dialogue) {
    if (dialogue.isLast) {
      this.closeIntro();
    } else {
      this.showDialogue(this.currentIndex + 1);
    }
  }

  handlePrev() {
    if (this.currentIndex > 0) {
      this.showDialogue(this.currentIndex - 1);
    }
  }

  closeIntro() {
    this.removeDialogue();
    this.markIntroSeen();
    if (this.keyHandler) {
      document.removeEventListener('keydown', this.keyHandler);
    }
    MissionObjective.showInitialObjective();
  }

  removeDialogue() {
    const existing = document.getElementById('commander-dialogue');
    if (existing) existing.remove();
  }

  static showMessage(message) {
    const msg = document.createElement('div');
    msg.className = 'commander-message';
    msg.style.cssText = `
      position: fixed;
      bottom: 150px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.95);
      border: 2px solid #00FFFF;
      border-radius: 10px;
      padding: 15px 25px;
      z-index: 9500;
      font-family: 'Press Start 2P', cursive;
      max-width: 500px;
      animation: msgFadeIn 0.3s ease-out;
    `;
    
    msg.innerHTML = `
      <div style="display: flex; align-items: center; gap: 15px;">
        <span style="font-size: 24px;">👩‍🚀</span>
        <div>
          <div style="color: #00FFFF; font-size: 8px; margin-bottom: 5px;">📡 COMMANDER NOVA</div>
          <div style="color: #FFF; font-size: 10px; line-height: 1.5;">${message}</div>
        </div>
      </div>
    `;
    
    document.body.appendChild(msg);
    
    setTimeout(() => {
      msg.style.transition = 'opacity 0.5s';
      msg.style.opacity = '0';
      setTimeout(() => msg.remove(), 500);
    }, 4000);
  }
}

// ==================== MISSION OBJECTIVE CLASS ====================
class MissionObjective {
  static showInitialObjective() {
    this.show('Talk to the 4 experts to begin their training missions');
  }

  static show(text, duration = 5000) {
    const objective = document.createElement('div');
    objective.id = 'mission-objective';
    objective.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.9);
      border: 2px solid #FFD700;
      border-radius: 10px;
      padding: 15px 25px;
      z-index: 9000;
      font-family: 'Press Start 2P', cursive;
      animation: objectiveSlideIn 0.5s ease-out;
    `;
    
    objective.innerHTML = `
      <div style="color: #FFD700; font-size: 10px; margin-bottom: 8px;">🎯 CURRENT OBJECTIVE</div>
      <div style="color: #FFF; font-size: 9px;">${text}</div>
    `;
    
    document.body.appendChild(objective);
    
    setTimeout(() => {
      objective.style.transition = 'opacity 1s';
      objective.style.opacity = '0';
      setTimeout(() => objective.remove(), 1000);
    }, duration);
  }

  static showFinalUnlocked() {
    const obj = document.createElement('div');
    obj.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: linear-gradient(135deg, #0a0a1a 0%, #13132eff 100%);
      border: 4px solid #FFD700;
      border-radius: 15px;
      padding: 30px;
      z-index: 10000;
      font-family: 'Press Start 2P', cursive;
      text-align: center;
      box-shadow: 0 0 50px rgba(255, 215, 0, 0.5);
      animation: pulseGlow 2s infinite;
    `;
    
    obj.innerHTML = `
      <div style="font-size: 48px; margin-bottom: 20px;">🚀⚔️🚀</div>
      <div style="color: #FFD700; font-size: 16px; margin-bottom: 15px;">FINAL MISSION UNLOCKED</div>
      <div style="color: #FFF; font-size: 11px; margin-bottom: 20px; line-height: 1.6;">
        All components collected!<br>
        Confront Elon Musk at the SpaceX Settlement!
      </div>
      <button id="final-obj-close" style="
        background: linear-gradient(135deg, #FFD700, #FFA500);
        border: none;
        color: #000;
        padding: 12px 25px;
        font-family: 'Press Start 2P', cursive;
        font-size: 10px;
        cursor: pointer;
        border-radius: 8px;
      ">LET'S GO!</button>
    `;
    
    document.body.appendChild(obj);
    
    document.getElementById('final-obj-close').addEventListener('click', () => {
      obj.remove();
    });
  }
}

export { CommanderDialogue, MissionObjective };

