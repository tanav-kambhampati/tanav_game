import Character from "./GameEngine/Character.js";;
import ProjectileExplosion from './ProjectileExplosion.js';

function newProjectileExplosion(data, gameEnv) {
    return new ProjectileExplosion(data, gameEnv);
}

class Projectile extends Character {
    constructor(data, gameEnv) {
        super(data, gameEnv);
        this.startTime = Date.now();
        this.duration = data.TRANSLATE_SIMULATION.miliseconds;
        this.calculateTranslatePositions();
        this.startScaleFactor = data.SCALE_FACTOR;
        this.endScaleFactor = data.TRANSLATE_SCALE_FACTOR;
        this.randomDelay = 0;
        this.delayStartTime = null;
    }

    calculateTranslatePositions() {
        this.startPosition = {
            x: this.gameEnv.innerWidth * this.data.INIT_POSITION_RATIO.x,
            y: this.gameEnv.innerHeight * this.data.INIT_POSITION_RATIO.y
        };
        this.endPosition = {
            x: this.gameEnv.innerWidth * this.data.TRANSLATE_POSITION_RATIO.x,
            y: this.gameEnv.innerHeight * this.data.TRANSLATE_POSITION_RATIO.y
        };
    }

    update() {
        const elapsedTime = Date.now() - this.startTime;
        const progress = Math.min(elapsedTime / this.duration, 1);

        if (progress >= 1) {
            if (this.delayStartTime === null) {
                this.triggerExplosion();
                this.randomDelay = Math.random() * this.data.TRANSLATE_SIMULATION.miliseconds * 5;
                this.delayStartTime = Date.now();
            } else if (Date.now() - this.delayStartTime >= this.randomDelay) {
                this.restart();
            }
            return; 
        }

        this.position.x = this.startPosition.x + (this.endPosition.x - this.startPosition.x) * progress;
        this.position.y = this.startPosition.y + (this.endPosition.y - this.startPosition.y) * progress;

        this.scaleFactor = this.startScaleFactor + (this.endScaleFactor - this.startScaleFactor) * progress;

        this.size = this.gameEnv.innerHeight / this.scaleFactor;
        this.width = this.size;
        this.height = this.size;

        super.update();
    }

    triggerExplosion() {
        const explosionData = {
            ...this.data,
            ie: "Explosion-" + this.data.id,
            down: {row: 0, start: 0, columns: 1, explode: true},
            SCALE_FACTOR: this.endScaleFactor,
            EXPLOSION_SCALE_FACTOR: this.endScaleFactor * 5, 
            EXPLOSION_SIMULATION: { miliseconds: 1000 } 
        };
        const explosion = newProjectileExplosion(explosionData, this.gameEnv);
        this.canvas.style.display = "none";
        this.gameEnv.gameObjects.push(explosion); 
    }

    restart() {
        this.startTime = Date.now();
        this.delayStartTime = null;
        this.calculateTranslatePositions();
        this.position = { ...this.startPosition };
        this.scaleFactor = this.startScaleFactor;
        this.canvas.style.display = "block";
    }

    resize() {
        this.calculateTranslatePositions();
        this.size = this.gameEnv.innerHeight / this.scaleFactor;
        this.width = this.size;
        this.height = this.size;
        super.resize();
    }
}

export default Projectile;