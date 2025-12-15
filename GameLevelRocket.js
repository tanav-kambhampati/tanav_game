import GameEnvBackground from './GameEngine/GameEnvBackground.js';
import Npc from './GameEngine/Npc.js';
import Player from './GameEngine/Player.js';
import FloorItem from './FloorItem.js';
import { CommanderDialogue } from './CommanderDialogue.js';
import NPCFactory from './NPCFactory.js';

class GameLevelRocket {
  constructor(gameEnv) {
    this.gameEnv = gameEnv;
    this.width = gameEnv.innerWidth;
    this.height = gameEnv.innerHeight;
    this.path = gameEnv.path;

    this.commanderDialogue = new CommanderDialogue(this.path);
    this.npcFactory = new NPCFactory(gameEnv, this.path, this.width, this.height);

    this.commanderDialogue.showIntro();

    this.spawnCollectibles();

    this.classes = this.buildLevel();
  }

  spawnCollectibles() {
    setTimeout(() => {
      FloorItem.createRandomItem(this.width * 0.3, this.height * 0.4);
      FloorItem.createRandomItem(this.width * 0.5, this.height * 0.6);
      FloorItem.createRandomItem(this.width * 0.7, this.height * 0.3);
    }, 1000);
  }

  createBackgroundData() {
    return {
      name: 'nova_settlement',
      greeting: "Welcome to Nova Settlement. Our fuel reserves are critically low...",
      src: this.path + "/images/gamify/spacebase.png",
      pixels: { height: 966, width: 654 }
    };
  }

  createPlayerData() {
    const scaleFactor = 5;
    return {
      id: 'Settler',
      greeting: "I'm a settler at Nova Settlement. I need to learn about rockets to help save our colony!",
      src: this.path + "/images/gamify/chillguy.png",
      SCALE_FACTOR: scaleFactor,
      STEP_FACTOR: 1000,
      ANIMATION_RATE: 50,
      INIT_POSITION: { x: 0, y: this.height - (this.height / scaleFactor) },
      pixels: { height: 384, width: 512 },
      orientation: { rows: 3, columns: 4 },
      down: { row: 0, start: 0, columns: 3 },
      downRight: { row: 1, start: 0, columns: 3, rotate: Math.PI / 16 },
      downLeft: { row: 2, start: 0, columns: 3, rotate: -Math.PI / 16 },
      left: { row: 2, start: 0, columns: 3 },
      right: { row: 1, start: 0, columns: 3 },
      up: { row: 3, start: 0, columns: 3 },
      upLeft: { row: 2, start: 0, columns: 3, rotate: Math.PI / 16 },
      upRight: { row: 1, start: 0, columns: 3, rotate: -Math.PI / 16 },
      hitbox: { widthPercentage: 0.45, heightPercentage: 0.2 },
      keypress: { up: 87, left: 65, down: 83, right: 68 }
    };
  }

  buildLevel() {
    return [
      { class: GameEnvBackground, data: this.createBackgroundData() },
      { class: Player, data: this.createPlayerData() },
      { class: Npc, data: this.npcFactory.createPropulsionExpert() },
      { class: Npc, data: this.npcFactory.createOrbitalExpert() },
      { class: Npc, data: this.npcFactory.createHistoryExpert() },
      { class: Npc, data: this.npcFactory.createSpaceXExpert() },
      { class: Npc, data: this.npcFactory.createElonMusk() },
    ];
  }
}

export default GameLevelRocket;
