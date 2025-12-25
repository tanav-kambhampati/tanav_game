import GameObject from './GameObject.js';


class Character extends GameObject {
    constructor(data = null, gameEnv = null) {
        super(gameEnv);
        
        this.spriteData = data;
        this.position = data?.INIT_POSITION || { x: 0, y: 0 };
        this.velocity = { x: 0, y: 0 };
        this.direction = 'down';
        
        this.frameIndex = 0;
        this.frameCounter = 0;
        this.animationRate = data?.ANIMATION_RATE || 50;
        
        this.scaleFactor = data?.SCALE_FACTOR || 5;
        this.stepFactor = data?.STEP_FACTOR || 100;
        this.pixels = data?.pixels || { width: 64, height: 64 };
        this.orientation = data?.orientation || { rows: 1, columns: 1 };
        
        this.hitbox = data?.hitbox || { widthPercentage: 0.2, heightPercentage: 0.2 };
        
        this.down = data?.down || { row: 0, start: 0, columns: 1 };
        this.up = data?.up || { row: 0, start: 0, columns: 1 };
        this.left = data?.left || { row: 0, start: 0, columns: 1 };
        this.right = data?.right || { row: 0, start: 0, columns: 1 };
        this.downLeft = data?.downLeft || this.down;
        this.downRight = data?.downRight || this.down;
        this.upLeft = data?.upLeft || this.up;
        this.upRight = data?.upRight || this.up;
        
        this.xVelocity = this.gameEnv.innerWidth / this.stepFactor;
        this.yVelocity = this.gameEnv.innerHeight / this.stepFactor;
        
        this.canvas = document.createElement('canvas');
        this.canvas.id = data?.id || 'character';
        this.ctx = this.canvas.getContext('2d');
        
        this.canvas.width = this.gameEnv.innerWidth / this.scaleFactor;
        this.canvas.height = this.gameEnv.innerHeight / this.scaleFactor;
        
        this.gameEnv.gameContainer.appendChild(this.canvas);
        
        this.canvas.style.position = 'absolute';
        this.canvas.style.left = this.position.x + 'px';
        this.canvas.style.top = this.position.y + 'px';
        this.canvas.style.zIndex = '10';
        
        this.image = new Image();
        this.image.src = data?.src || '';
        
        this.frameWidth = this.pixels.width / this.orientation.columns;
        this.frameHeight = this.pixels.height / this.orientation.rows;
    }
    
    update() {
        if (this.velocity.x < 0 && this.state.movement.left) {
            this.position.x += this.velocity.x;
        }
        if (this.velocity.x > 0 && this.state.movement.right) {
            this.position.x += this.velocity.x;
        }
        if (this.velocity.y < 0 && this.state.movement.up) {
            this.position.y += this.velocity.y;
        }
        if (this.velocity.y > 0 && this.state.movement.down) {
            this.position.y += this.velocity.y;
        }
        
        this.position.x = Math.max(0, Math.min(this.position.x, this.gameEnv.innerWidth - this.canvas.width));
        this.position.y = Math.max(0, Math.min(this.position.y, this.gameEnv.innerHeight - this.canvas.height));
        
        this.canvas.style.left = this.position.x + 'px';
        this.canvas.style.top = this.position.y + 'px';
        
        this.draw();
        
        this.collisionChecks();
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (!this.image.complete) return;
        
        const animation = this[this.direction] || this.down;
        const row = animation.row || 0;
        const columns = animation.columns || 1;
        const start = animation.start || 0;
        
        const frameX = (start + this.frameIndex) * this.frameWidth;
        const frameY = row * this.frameHeight;
        
        if (animation.rotate) {
            this.ctx.save();
            this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.rotate(animation.rotate);
            this.ctx.drawImage(
                this.image,
                frameX, frameY, this.frameWidth, this.frameHeight,
                -this.canvas.width / 2, -this.canvas.height / 2, this.canvas.width, this.canvas.height
            );
            this.ctx.restore();
        } else {
            this.ctx.drawImage(
                this.image,
                frameX, frameY, this.frameWidth, this.frameHeight,
                0, 0, this.canvas.width, this.canvas.height
            );
        }
        
        this.frameCounter++;
        if (this.frameCounter >= this.animationRate) {
            this.frameCounter = 0;
            this.frameIndex = (this.frameIndex + 1) % columns;
        }
    }
    
    resize() {
        this.xVelocity = this.gameEnv.innerWidth / this.stepFactor;
        this.yVelocity = this.gameEnv.innerHeight / this.stepFactor;
        
        this.canvas.width = this.gameEnv.innerWidth / this.scaleFactor;
        this.canvas.height = this.gameEnv.innerHeight / this.scaleFactor;
        
        this.draw();
    }
    
    destroy() {
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
        
        const index = this.gameEnv.gameObjects.indexOf(this);
        if (index !== -1) {
            this.gameEnv.gameObjects.splice(index, 1);
        }
    }
    
    /**
     * @param {*} other 
     */
    handleCollisionReaction(other) {
        super.handleCollisionReaction(other);
    }
}

export default Character;


