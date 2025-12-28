import Character from './Character.js';

class Player extends Character {
    constructor(data = null, gameEnv = null) {
        super(data, gameEnv);
        this.keypress = data?.keypress || { up: 87, left: 65, down: 83, right: 68 };
        this.pressedKeys = {};
        this.speed = 5;
        this.handleKeyDownBound = this.handleKeyDown.bind(this);
        this.handleKeyUpBound = this.handleKeyUp.bind(this);
        document.addEventListener('keydown', this.handleKeyDownBound);
        document.addEventListener('keyup', this.handleKeyUpBound);
    }

    handleKeyDown(event) {
        this.pressedKeys[event.keyCode] = true;
    }

    handleKeyUp(event) {
        delete this.pressedKeys[event.keyCode];
    }

    update() {
        this.velocity.x = 0;
        this.velocity.y = 0;
        
        if (this.pressedKeys[this.keypress.up]) {
            this.velocity.y = -this.speed;
            this.direction = 'up';
        }
        if (this.pressedKeys[this.keypress.down]) {
            this.velocity.y = this.speed;
            this.direction = 'down';
        }
        if (this.pressedKeys[this.keypress.left]) {
            this.velocity.x = -this.speed;
            this.direction = 'left';
        }
        if (this.pressedKeys[this.keypress.right]) {
            this.velocity.x = this.speed;
            this.direction = 'right';
        }
        
        if (this.pressedKeys[this.keypress.up] && this.pressedKeys[this.keypress.left]) {
            this.direction = 'upLeft';
        } else if (this.pressedKeys[this.keypress.up] && this.pressedKeys[this.keypress.right]) {
            this.direction = 'upRight';
        } else if (this.pressedKeys[this.keypress.down] && this.pressedKeys[this.keypress.left]) {
            this.direction = 'downLeft';
        } else if (this.pressedKeys[this.keypress.down] && this.pressedKeys[this.keypress.right]) {
            this.direction = 'downRight';
        }
        
        super.update();
        this.collisionChecks();
    }

    destroy() {
        document.removeEventListener('keydown', this.handleKeyDownBound);
        document.removeEventListener('keyup', this.handleKeyUpBound);
        super.destroy();
    }
}

export default Player;
