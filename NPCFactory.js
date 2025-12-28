import { CommanderDialogue, MissionObjective } from './CommanderDialogue.js';

const LevelModules = {
  propulsion: () => import('./GameLevelPropulsion.js'),
  orbital: () => import('./GameLevelOrbital.js'),
  history: () => import('./GameLevelHistory.js'),
  spacex: () => import('./GameLevelSpaceX.js'),
  boss: () => import('./GameLevelBoss.js')
};

class NPCFactory {
  constructor(gameEnv, path, width, height) {
    this.gameEnv = gameEnv;
    this.path = path;
    this.width = width;
    this.height = height;
  }

  async transitionToLevel(levelKey, onComplete) {
    try {
      const module = await LevelModules[levelKey]();
      const LevelClass = module.default;
      const game = this.gameEnv.game;
      
      if (game && game.goToLevel) {
        game.goToLevel(LevelClass, onComplete);
      }
    } catch (error) {
      console.error(`Failed to load level: ${levelKey}`, error);
      CommanderDialogue.showMessage(`Level not available yet. Check back later!`);
    }
  }

  createPropulsionExpert() {
    const spriteSrc = this.path + "/images/gamify/PropulsionExpert.png";
    const gameEnv = this.gameEnv;
    const factory = this;
    
    return {
      id: 'Propulsion-NPC',
      greeting: "Settler! I'm Dr. Newton, the settlement's propulsion expert.",
      src: spriteSrc,
      SCALE_FACTOR: 3,
      ANIMATION_RATE: 50,
      pixels: { height: 441, width: 339 },
      INIT_POSITION: { x: this.width * 0.15, y: this.height * 0.5 },
      orientation: { rows: 1, columns: 1 },
      down: { row: 0, start: 0, columns: 1 },
      hitbox: { widthPercentage: 0.1, heightPercentage: 0.2 },
      dialogues: [
        "The SpaceX settlement uses advanced Raptor engines. To negotiate with them, you need to understand propulsion!",
        "Rockets work by Newton's Third Law: every action has an equal and opposite reaction.",
        "I'll take you to the Propulsion Training Facility. Complete the challenge there to earn your ENGINE COMPONENT!"
      ],
      interact: function() {
        const game = gameEnv?.game;
        
        if (game?.getNpcCookie?.('Propulsion-NPC')) {
          this.dialogueSystem.showDialogue(
            "You've already completed propulsion training! Go find the other experts.",
            'Dr. Newton',
            spriteSrc
          );
          return;
        }
        
        this.dialogueSystem.showDialogue(
          "Settler! I'm Dr. Newton. Ready to learn about rocket propulsion? " +
          "I'll take you to the Propulsion Training Facility!",
          'Dr. Newton',
          spriteSrc
        );
        
        setTimeout(() => {
          factory.transitionToLevel('propulsion', () => {
            if (game?.giveNpcCookie) {
              game.giveNpcCookie('Propulsion-NPC', 'propulsion_training', 'Engine Component acquired!');
            }
            if (game?.giveItem) {
              game.giveItem('engine_component', 1);
            }
          });
        }, 2000);
      }
    };
  }

  createOrbitalExpert() {
    const spriteSrc = this.path + "/images/gamify/satoshiNakamoto.png";
    const gameEnv = this.gameEnv;
    const factory = this;
    
    return {
      id: 'Orbital-NPC',
      greeting: "Greetings, settler. I'm Commander Luna, orbital mechanics specialist.",
      src: spriteSrc,
      SCALE_FACTOR: 10,
      ANIMATION_RATE: 50,
      pixels: { height: 282, width: 282 },
      INIT_POSITION: { x: this.width * 0.75, y: this.height * 0.6 },
      orientation: { rows: 1, columns: 1 },
      down: { row: 0, start: 0, columns: 1 },
      hitbox: { widthPercentage: 0.1, heightPercentage: 0.2 },
      dialogues: [
        "The SpaceX settlement controls the orbital refueling stations. That's how they maintain their power.",
        "To challenge them, you must understand orbital mechanics.",
        "I'll take you to the Orbital Training Simulator. Complete it to earn the NAVIGATION CHIP!"
      ],
      interact: function() {
        const game = gameEnv?.game;
        
        if (game?.getNpcCookie?.('Orbital-NPC')) {
          this.dialogueSystem.showDialogue(
            "You've mastered orbital mechanics! Seek out the other experts.",
            'Commander Luna',
            spriteSrc
          );
          return;
        }
        
        this.dialogueSystem.showDialogue(
          "The SpaceX settlement controls all orbital routes. " +
          "Let me take you to the Orbital Training Simulator!",
          'Commander Luna',
          spriteSrc
        );
        
        setTimeout(() => {
          factory.transitionToLevel('orbital', () => {
            if (game?.giveNpcCookie) {
              game.giveNpcCookie('Orbital-NPC', 'orbital_training', 'Navigation Chip acquired!');
            }
            if (game?.giveItem) {
              game.giveItem('navigation_chip', 1);
            }
          });
        }, 2000);
      }
    };
  }

  createHistoryExpert() {
    const spriteSrc = this.path + "/images/gamify/HistoryExpert.png";
    const gameEnv = this.gameEnv;
    const factory = this;
    
    return {
      id: 'History-NPC',
      greeting: "Ah, a settler seeking knowledge! I'm Professor Armstrong.",
      src: spriteSrc,
      SCALE_FACTOR: 7,
      ANIMATION_RATE: 50,
      pixels: { height: 281, width: 280 },
      INIT_POSITION: { x: this.width * 0.2, y: this.height * 0.25 },
      orientation: { rows: 1, columns: 1 },
      down: { row: 0, start: 0, columns: 1 },
      hitbox: { widthPercentage: 0.1, heightPercentage: 0.2 },
      dialogues: [
        "Do you know why Elon Musk respects history? Because SpaceX was built on the achievements of pioneers!",
        "Yuri Gagarin, Neil Armstrong, Robert Goddard - legends who made space travel possible.",
        "I'll take you to the History Archives. Learn from the past to earn the HEAT SHIELD!"
      ],
      interact: function() {
        const game = gameEnv?.game;
        
        if (game?.getNpcCookie?.('History-NPC')) {
          this.dialogueSystem.showDialogue(
            "You've learned from the pioneers! Continue your journey, settler.",
            'Professor Armstrong',
            spriteSrc
          );
          return;
        }
        
        this.dialogueSystem.showDialogue(
          "Musk won't respect someone who doesn't know rocket history! " +
          "Come with me to the History Archives!",
          'Professor Armstrong',
          spriteSrc
        );
        
        setTimeout(() => {
          factory.transitionToLevel('history', () => {
            if (game?.giveNpcCookie) {
              game.giveNpcCookie('History-NPC', 'history_training', 'Heat Shield acquired!');
            }
            if (game?.giveItem) {
              game.giveItem('heat_shield', 1);
            }
          });
        }, 2000);
      }
    };
  }

  createSpaceXExpert() {
    const spriteSrc = this.path + "/images/gamify/janetYellen.png";
    const gameEnv = this.gameEnv;
    const factory = this;
    
    return {
      id: 'SpaceX-NPC',
      greeting: "I'm Dr. Falcon. I used to work at SpaceX before joining Nova Settlement.",
      src: spriteSrc,
      SCALE_FACTOR: 6,
      ANIMATION_RATE: 50,
      pixels: { height: 282, width: 268 },
      INIT_POSITION: { x: this.width * 0.6, y: this.height * 0.75 },
      orientation: { rows: 1, columns: 1 },
      down: { row: 0, start: 0, columns: 1 },
      hitbox: { widthPercentage: 0.1, heightPercentage: 0.2 },
      dialogues: [
        "I defected from SpaceX when Musk started hoarding fuel. I know their technology inside and out.",
        "The Falcon 9, Starship, Raptor engines - I know all their secrets.",
        "I'll take you to my SpaceX Tech Lab. Master their technology to earn the FUEL CELL!"
      ],
      interact: function() {
        const game = gameEnv?.game;
        
        if (game?.getNpcCookie?.('SpaceX-NPC')) {
          this.dialogueSystem.showDialogue(
            "You know SpaceX's secrets now! Go challenge Elon Musk!",
            'Dr. Falcon',
            spriteSrc
          );
          return;
        }
        
        this.dialogueSystem.showDialogue(
          "I know SpaceX's secrets. To beat Musk, you need to understand his technology! " +
          "Follow me to my SpaceX Tech Lab!",
          'Dr. Falcon',
          spriteSrc
        );
        
        setTimeout(() => {
          factory.transitionToLevel('spacex', () => {
            if (game?.giveNpcCookie) {
              game.giveNpcCookie('SpaceX-NPC', 'spacex_training', 'Fuel Cell acquired!');
            }
            if (game?.giveItem) {
              game.giveItem('rocket_fuel', 1);
            }
          });
        }, 2000);
      }
    };
  }

  createElonMusk() {
    const spriteSrc = this.path + "/images/gamify/stockguy.png";
    const gameEnv = this.gameEnv;
    const factory = this;
    
    return {
      id: 'Elon-Musk',
      greeting: "So, a settler dares to challenge me? I am Elon Musk, ruler of SpaceX!",
      src: spriteSrc,
      SCALE_FACTOR: 5,
      ANIMATION_RATE: 50,
      pixels: { height: 441, width: 339 },
      INIT_POSITION: { x: this.width * 0.45, y: this.height * 0.15 },
      orientation: { rows: 1, columns: 1 },
      down: { row: 0, start: 0, columns: 1 },
      hitbox: { widthPercentage: 0.3, heightPercentage: 0.1 },
      dialogues: [
        "Ah, a settler from Nova Settlement. Here to beg for fuel?",
        "Your settlement is struggling because you lack vision. SpaceX will lead humanity to the stars!",
        "If you want our fuel reserves, prove you're worthy in my ultimate challenge!"
      ],
      interact: function() {
        const game = gameEnv.game;
        const inventory = game?.inventoryManager?.inventory;
        
        const requiredNpcs = ['Propulsion-NPC', 'Orbital-NPC', 'History-NPC', 'SpaceX-NPC'];
        const completedNpcs = requiredNpcs.filter(npcId => game?.getNpcCookie?.(npcId));
        
        if (completedNpcs.length < requiredNpcs.length) {
          this.dialogueSystem.showDialogue(
            `Ha! You've only completed ${completedNpcs.length} of 4 training missions. ` +
            `Come back when you've proven yourself to ALL the experts at Nova Settlement!`,
            'Elon Musk',
            spriteSrc
          );
          return;
        }
        
        const requiredParts = ['rocket_fuel', 'engine_component', 'heat_shield', 'navigation_chip'];
        let collectedCount = 0;
        if (inventory && inventory.items) {
          collectedCount = requiredParts.filter(partId => 
            inventory.items.some(item => item.id === partId)
          ).length;
        }
        
        if (collectedCount < requiredParts.length) {
          this.dialogueSystem.showDialogue(
            `You're missing components! You have ${collectedCount}/4. ` +
            `Collect all rocket components before challenging me!`,
            'Elon Musk',
            spriteSrc
          );
          return;
        }
        
        this.dialogueSystem.showDialogue(
          "Impressive... You've collected all the components and completed all the training. " +
          "Very well, settler. Follow me to the SpaceX Arena for the ultimate showdown!",
          'Elon Musk',
          spriteSrc
        );
        
        setTimeout(() => {
          factory.transitionToLevel('boss', () => {
            if (game?.giveItem) {
              game.giveItem('elon_key', 1);
            }
          });
        }, 3000);
      }
    };
  }
}

export default NPCFactory;

