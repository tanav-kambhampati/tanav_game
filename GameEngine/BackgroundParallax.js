import GameObject from './GameObject.js';

export class BackgroundParallax extends GameObject {
    @param {Object} data
    @param {Object} gameEnv 

    constructor(data = null, gameEnv = null) {
        super(gameEnv);
        
        if (!data || !data.src) {
            console.error('BackgroundParallax requires a src property in data');
            throw new Error('BackgroundParallax requires a src property in data');
        }
        
        this.data = data;
        this.position = data.position || { x: 0, y: 0 };
        this.velocity = data.velocity || 1;
        
        this.image = new Image();
        this.image.src = data.src;
        this.isInitialized = false; 
        
        this.image.onload = () => {
            this.width = this.image.width;
            this.height = this.image.height;

            this.canvas = document.createElement("canvas");
            this.canvas.style.position = "absolute";
            this.canvas.id = data.id || "parallax-background";
            this.ctx = this.canvas.getContext("2d");
            

            this.canvas.style.zIndex = "1"; 
            this.canvas.style.opacity = "0.3"; 
            
            this.alignCanvas();

            const gameContainer = document.getElementById("gameContainer");
            if (gameContainer.firstChild) {
                gameContainer.insertBefore(this.canvas, gameContainer.firstChild);
            } else {
                gameContainer.appendChild(this.canvas);
            }
            
            this.isInitialized = true; 
        };
        
        this.image.onerror = () => {
            console.error("Error loading background parallax image:", data.src);
        };
    }

    alignCanvas() {
        const gameCanvas = document.getElementById("gameCanvas");
        if (!gameCanvas) {
            console.error("Game canvas not found");
            return;
        }
        
        this.canvas.width = gameCanvas.width;
        this.canvas.height = gameCanvas.height;
        this.canvas.style.left = gameCanvas.style.left;
        this.canvas.style.top = gameCanvas.style.top;
    }

    update() {
        this.position.x -= this.velocity; 
        this.position.y += this.velocity; 

        if (this.position.x < -this.width) {
            this.position.x = 0;
        }
        if (this.position.y > this.height) {
            this.position.y = 0;
        }

        this.draw();
    }

    draw() {
        if (!this.isInitialized) {
            return;
        }

        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;
    
        let xWrapped = this.position.x % this.width;
        let yWrapped = this.position.y % this.height;
    
        if (xWrapped > 0) {
            xWrapped -= this.width;
        }
        if (yWrapped > 0) {
            yWrapped -= this.height;
        }
   
        const numHorizontalDraws = Math.ceil(canvasWidth / this.width) + 1;
        const numVerticalDraws = Math.ceil(canvasHeight / this.height) + 1;

        this.ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        for (let i = 0; i < numHorizontalDraws; i++) {
            for (let j = 0; j < numVerticalDraws; j++) {
                this.ctx.drawImage(
                    this.image, 
                    0, 0, this.width, this.height,
                    xWrapped + i * this.width, yWrapped + j * this.height, this.width, this.height); 
            }
        }
    }

    resize() {
        this.alignCanvas(); 
        this.draw();
    }

    destroy() {
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
        
        if (this.gameEnv && this.gameEnv.gameObjects) {
            const index = this.gameEnv.gameObjects.indexOf(this);
            if (index !== -1) {
                this.gameEnv.gameObjects.splice(index, 1);
            }
        }
    }
}

export default BackgroundParallax;