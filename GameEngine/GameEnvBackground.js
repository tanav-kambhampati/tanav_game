import GameObject from './GameObject.js';

export class GameEnvBackground extends GameObject {
    constructor(data = null, gameEnv = null) {
        super(gameEnv);
        if (data.src) {
            this.image = new Image();
            this.image.src = data.src;
        } else {
            this.image = null;
        }
    }
    
    update() {
        this.draw();
    }
    
    draw() {
        const ctx = this.gameEnv.ctx;
        const width = this.gameEnv.innerWidth;
        const height = this.gameEnv.innerHeight;

        if (this.image) {
            ctx.drawImage(this.image, 0, 0, width, height);
        } else {
            ctx.fillStyle = '#063970';
            ctx.fillRect(0, 0, width, height);
        }
    }

    resize() {
        this.draw();
    }

    destroy() {
        const index = this.gameEnv.gameObjects.indexOf(this);
        if (index !== -1) {
            this.gameEnv.gameObjects.splice(index, 1);
        }
    }
}

export default GameEnvBackground;
