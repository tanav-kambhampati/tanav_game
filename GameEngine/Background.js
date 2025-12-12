import GameObject from './GameObject.js';

export class Background extends GameObject {
    @param {Object} data
    @param {Object} gameEnv

    constructor(data = null, gameEnv = null) {
        super(gameEnv);

        if (!data.src) {
            throw new Error('Background requires a src property in data');
        }
        this.data = data;
        this.image = new Image();
        this.image.src = data.src;
        this.isInitialized = false;

        this.image.onload = () => {
            this.width = this.image.width;
            this.height = this.image.height;

            this.canvas = document.createElement("canvas");
            this.canvas.style.position = "absolute";
            this.canvas.style.zIndex = this.data.zIndex || "0";
            this.canvas.id = data.id || "background";
            this.ctx = this.canvas.getContext("2d", { willReadFrequently: true });
            
            this.alignCanvas();

            document.getElementById("gameContainer").appendChild(this.canvas);
            this.isInitialized = true;
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
        this.draw();
    }

    draw() {
        if (!this.isInitialized) {
            return; 
        }

        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;
        this.ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        
        if (this.image) {
            this.ctx.drawImage(this.image, 0, 0, canvasWidth, canvasHeight);
        } else {
            this.ctx.fillStyle = this.data.color || '#242435';
            this.ctx.fillRect(0, 0, canvasWidth, canvasHeight);
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

export default Background;