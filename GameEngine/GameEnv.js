/**

 * @class GameEnv
 * @property {Object} container
 * @property {Object} canvas 
 * @property {Object} ctx 
 * @property {number} innerWidth 
 * @property {number} innerHeight 
 * @property {number} top
 * @property {number} bottom 
 */
class GameEnv {
    constructor() {
        this.container = null;
        this.canvas = null;
        this.ctx = null;
        this.innerWidth = 0;
        this.innerHeight = 0;
        this.top = 0;
        this.bottom = 0;

        this.game = null; 
        this.path = ''; 
        this.gameControl = null; 
        this.gameObjects = [];    
    }

     
    create() {
        this.setCanvas();
        this.setTop();
        this.setBottom();
        this.innerWidth = window.innerWidth;
        this.innerHeight = window.innerHeight - this.top - this.bottom;
        this.size();
    }


    setCanvas() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    }

    setTop() {
        const header = document.querySelector('header');
        this.top = header ? header.offsetHeight : 0;
    }

    setBottom() {
        const footer = document.querySelector('footer');
        this.bottom = footer ? footer.offsetHeight : 0;
    }

    size() {
        this.canvas.width = this.innerWidth;
        this.canvas.height = this.innerHeight;
        this.canvas.style.width = `${this.innerWidth}px`;
        this.canvas.style.height = `${this.innerHeight}px`;
        this.canvas.style.position = 'absolute';
        this.canvas.style.left = '0px';
        this.canvas.style.top = `${this.top}px`;
    }


    resize() {
        this.create();
    }

 
    clear() {
        this.ctx.clearRect(0, 0, this.innerWidth, this.innerHeight);
    }
}

export default GameEnv;
