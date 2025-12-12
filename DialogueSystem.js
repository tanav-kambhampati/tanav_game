class DialogueSystem {
  constructor(options = {}) {
    this.dialogues = options.dialogues || [
      "You've come far, traveler. The skies whisper your name.",
      "The End holds secrets only the brave dare uncover.",
      "Retrieve the elytra and embrace your destiny!"
    ];
    
    this.id = options.id || "dialogue_" + Math.random().toString(36).substr(2, 9);
    
    this.lastShownIndex = -1;
    
    this.dialogueBox = null;
    this.dialogueText = null;
    this.closeBtn = null;
    
    this.enableSound = options.enableSound !== undefined ? options.enableSound : true; 
    this.soundUrl = options.soundUrl || "./sounds/dialogue.mp3";
    this.sound = this.enableSound ? new Audio(this.soundUrl) : null;
    
    this.typewriterSound = this.createTypewriterSound();
    
    this.createDialogueBox();
    
    this.isOpen = false;
    
    this.isTyping = false;
    this.typewriterTimeout = null;
  }

  createTypewriterSound() {
    if (!this.enableSound) return null;
    
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    const playKeyClick = () => {
      const now = audioContext.currentTime;
      
      const osc1 = audioContext.createOscillator();
      const gain1 = audioContext.createGain();
      const filter1 = audioContext.createBiquadFilter();
      
      osc1.connect(filter1);
      filter1.connect(gain1);
      gain1.connect(audioContext.destination);
      
      osc1.frequency.setValueAtTime(1200 + Math.random() * 800, now);
      osc1.type = 'square';
      filter1.type = 'bandpass';
      filter1.frequency.setValueAtTime(2000 + Math.random() * 1000, now);
      filter1.Q.setValueAtTime(2, now);
      
      gain1.gain.setValueAtTime(0, now);
      gain1.gain.linearRampToValueAtTime(0.12, now + 0.003);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
      
      osc1.start(now);
      osc1.stop(now + 0.02);
      
      const osc2 = audioContext.createOscillator();
      const gain2 = audioContext.createGain();
      const filter2 = audioContext.createBiquadFilter();
      
      osc2.connect(filter2);
      filter2.connect(gain2);
      gain2.connect(audioContext.destination);
      
      osc2.frequency.setValueAtTime(200 + Math.random() * 150, now);
      osc2.type = 'sawtooth';
      filter2.type = 'lowpass';
      filter2.frequency.setValueAtTime(800, now);
      
      gain2.gain.setValueAtTime(0, now);
      gain2.gain.linearRampToValueAtTime(0.06, now + 0.002);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      
      osc2.start(now);
      osc2.stop(now + 0.05);
    };
    
    const playSpacebarClick = () => {
      const now = audioContext.currentTime;
      
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const filter = audioContext.createBiquadFilter();
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(audioContext.destination);
      
      osc.frequency.setValueAtTime(150 + Math.random() * 100, now);
      osc.type = 'square';
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(500, now);
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      
      osc.start(now);
      osc.stop(now + 0.08);
    };
    
    const playBell = () => {
      const now = audioContext.currentTime;
      
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      
      osc.connect(gain);
      gain.connect(audioContext.destination);
      
      osc.frequency.setValueAtTime(2000, now);
      osc.frequency.exponentialRampToValueAtTime(1800, now + 0.1);
      osc.type = 'sine';
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.06, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      
      osc.start(now);
      osc.stop(now + 0.4);
    };
    
    return {
      playKey: playKeyClick,
      playSpace: playSpacebarClick,
      playBell: playBell,
      audioContext: audioContext
    };
  }

  createDialogueBox() {
    this.dialogueBox = document.createElement("div");
    this.dialogueBox.id = "custom-dialogue-box-" + this.id;
    
    Object.assign(this.dialogueBox.style, {
      position: "fixed",
      bottom: "100px",
      left: "50%",
      transform: "translateX(-50%)",
      padding: "20px",
      maxWidth: "80%",
      background: "rgba(0, 0, 0, 0.85)",
      color: "#00FFFF",
      fontFamily: "'Press Start 2P', cursive, monospace",
      fontSize: "14px",
      textAlign: "center",
      border: "2px solid #4a86e8",
      borderRadius: "12px",
      zIndex: "9999",
      boxShadow: "0 0 20px rgba(0, 255, 255, 0.7)",
      display: "none"
    });

    const avatarContainer = document.createElement("div");
    avatarContainer.id = "dialogue-avatar-" + this.id;
    Object.assign(avatarContainer.style, {
      width: "50px",
      height: "50px",
      marginRight: "15px",
      backgroundSize: "contain",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center",
      display: "none" 
    });

    const speakerName = document.createElement("div");
    speakerName.id = "dialogue-speaker-" + this.id;
    Object.assign(speakerName.style, {
      fontWeight: "bold",
      color: "#4a86e8",
      marginBottom: "10px",
      fontSize: "16px"
    });

    this.dialogueText = document.createElement("div");
    this.dialogueText.id = "dialogue-text-" + this.id;
    Object.assign(this.dialogueText.style, {
      marginBottom: "15px",
      lineHeight: "1.5"
    });

    this.closeBtn = document.createElement("button");
    this.closeBtn.innerText = "Close";
    Object.assign(this.closeBtn.style, {
      marginTop: "15px",
      padding: "10px 20px",
      background: "#4a86e8",
      color: "#fff",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
      fontFamily: "'Press Start 2P', cursive, monospace",
      fontSize: "12px"
    });
    
    this.closeBtn.onclick = () => {
      this.closeDialogue();
    };

    const contentContainer = document.createElement("div");
    contentContainer.style.display = "flex";
    contentContainer.style.alignItems = "flex-start";
    contentContainer.style.marginBottom = "10px";
    contentContainer.appendChild(avatarContainer);
    
    const textContainer = document.createElement("div");
    textContainer.style.flexGrow = "1";
    textContainer.appendChild(speakerName);
    textContainer.appendChild(this.dialogueText);
    contentContainer.appendChild(textContainer);

    this.dialogueBox.appendChild(contentContainer);
    this.dialogueBox.appendChild(this.closeBtn);
    
    document.body.appendChild(this.dialogueBox);
    
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isOpen) {
        this.closeDialogue();
      }
    });
  }

  showDialogue(message, speaker = "", avatarSrc = null) {
    if (this.typewriterTimeout) {
      clearTimeout(this.typewriterTimeout);
      this.typewriterTimeout = null;
    }
    
    const speakerElement = document.getElementById("dialogue-speaker-" + this.id);
    if (speakerElement) {
      speakerElement.textContent = speaker;
      speakerElement.style.display = speaker ? "block" : "none";
    }
    
    const avatarElement = document.getElementById("dialogue-avatar-" + this.id);
    if (avatarElement) {
      if (avatarSrc) {
        avatarElement.style.backgroundImage = `url('${avatarSrc}')`;
        avatarElement.style.display = "block";
      } else {
        avatarElement.style.display = "none";
      }
    }
    
    this.dialogueBox.style.display = "block";
    this.isOpen = true;
    
    this.startTypewriterEffect(message);
    
    if (this.sound && window.gameAudioEnabled !== false) {
      this.sound.currentTime = 0;
      this.sound.play().catch(e => console.log("Sound play error:", e));
    }
    
    return this.dialogueBox;
  }

  startTypewriterEffect(message) {
    this.isTyping = true;
    this.dialogueText.textContent = ""; 
    
    this.dialogueText.style.borderRight = "2px solid #4a86e8";
    this.dialogueText.style.animation = "dialogueBlink 1s infinite";
    
    if (!document.getElementById('dialogue-typewriter-styles')) {
      const style = document.createElement('style');
      style.id = 'dialogue-typewriter-styles';
      style.textContent = `
        @keyframes dialogueBlink {
          0%, 50% { border-color: #4a86e8; }
          51%, 100% { border-color: transparent; }
        }
      `;
      document.head.appendChild(style);
    }
    
    let charIndex = 0;
    let lineLength = 0; 
    const maxLineLength = 60; 
    
    const typeChar = () => {
      if (charIndex < message.length && this.isTyping) {
        this.dialogueText.textContent = message.substring(0, charIndex + 1);
        const char = message[charIndex];
        charIndex++;
        lineLength++;
        
        if (charIndex % 2 === 0) { 
          try {
            if (char === ' ') {
              if (window.gameAudioEnabled !== false) {
                this.typewriterSound.playSpace();
              }
            } else if (char === '\n' || char === '\r') {
              lineLength = 0;
              if (window.gameAudioEnabled !== false) {
                this.typewriterSound.playKey();
              }
            } else if ('.,!?;:'.includes(char)) {
              if (window.gameAudioEnabled !== false) {
                this.typewriterSound.playKey();
              }
              this.typewriterTimeout = setTimeout(typeChar, 120 + Math.random() * 80);
              return;
            } else {
              if (window.gameAudioEnabled !== false) {
                this.typewriterSound.playKey();
              }
            }
            
            if (lineLength >= maxLineLength && char === ' ') {
              if (window.gameAudioEnabled !== false) {
                this.typewriterSound.playBell();
              }
              lineLength = 0;
            }
            
          } catch (e) {
            console.log("Typewriter sound error:", e);
          }
        }
        
        const baseSpeed = 40; 
        let variance = Math.random() * 12; 
        
        let charSpeed = baseSpeed;
        if (char === ' ') {
          charSpeed = baseSpeed - 8; 
        } else if ('.,!?;:'.includes(char)) {
          charSpeed = baseSpeed + 40; 
        } else if (char.match(/[A-Z]/)) {
          charSpeed = baseSpeed + 15; 
        }
        
        if (Math.random() < 0.04) { 
          variance += 150 + Math.random() * 250; 
        }
        
        this.typewriterTimeout = setTimeout(typeChar, charSpeed + variance);
      } else {
        this.isTyping = false;
        this.dialogueText.style.borderRight = "none";
        this.dialogueText.style.animation = "none";
        
        setTimeout(() => {
          if (this.typewriterSound && window.gameAudioEnabled !== false) {
            this.playCompletionSound();
          }
        }, 250);
      }
    };
    
    this.typewriterTimeout = setTimeout(typeChar, 400);
  }

  playCompletionSound() {
    if (!this.enableSound || !this.typewriterSound.audioContext) return;
    
    try {
      const audioContext = this.typewriterSound.audioContext;
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.05, audioContext.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (e) {
      console.log("Completion sound error:", e);
    }
  }

  showRandomDialogue(speaker = "", avatarSrc = null) {
    if (this.dialogues.length === 0) return;
    
    let randomIndex;
    if (this.dialogues.length > 1) {
      do {
        randomIndex = Math.floor(Math.random() * this.dialogues.length);
      } while (randomIndex === this.lastShownIndex);
    } else {
      randomIndex = 0; 
    }
    
    this.lastShownIndex = randomIndex;
    
    const randomDialogue = this.dialogues[randomIndex];
    return this.showDialogue(randomDialogue, speaker, avatarSrc);
  }

  closeDialogue() {
    if (!this.isOpen) return;
    
    this.isTyping = false;
    if (this.typewriterTimeout) {
      clearTimeout(this.typewriterTimeout);
      this.typewriterTimeout = null;
    }
    
    if (this.dialogueText) {
      this.dialogueText.style.borderRight = "none";
      this.dialogueText.style.animation = "none";
    }
    
    this.dialogueBox.style.display = "none";
    this.isOpen = false;
    
    const buttonContainers = this.dialogueBox.querySelectorAll('div[style*="display: flex"]');
    buttonContainers.forEach(container => {
      if (container.contains(document.getElementById("dialogue-avatar-" + this.id))) {
        return;
      }
      container.remove();
    });
  }

  isDialogueOpen() {
    return this.isOpen;
  }
  
  addButtons(buttons) {
      if (!this.isOpen || !buttons || !Array.isArray(buttons) || buttons.length === 0) return;
      
      const buttonContainer = document.createElement('div');
      buttonContainer.style.display = 'flex';
      buttonContainer.style.justifyContent = 'space-between';
      buttonContainer.style.marginTop = '10px';
      
      buttons.forEach(button => {
          if (!button || !button.text) return;
          
          const btn = document.createElement('button');
          btn.textContent = button.text;
          btn.style.padding = '8px 15px';
          btn.style.background = button.primary ? '#4a86e8' : '#666';
          btn.style.color = 'white';
          btn.style.border = 'none';
          btn.style.borderRadius = '5px';
          btn.style.cursor = 'pointer';
          btn.style.marginRight = '10px';
          
          btn.onclick = () => {
              if (button.action && typeof button.action === 'function') {
                  button.action();
              }
          };
          
          buttonContainer.appendChild(btn);
      });
      
      if (buttonContainer.children.length > 0) {
          this.dialogueBox.insertBefore(buttonContainer, this.closeBtn);
      }
  }
}

export default DialogueSystem;