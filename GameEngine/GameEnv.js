// This file is going to manage the game environment

@class
@property {Object} container
@property {Object} canvas 
@property {Object} ctx //2D rendering width of canvas
@property {number} innerWidth
@property {number} innerHeight .
@property {number} top
@property {number} bottom

class GameEnv {
    constructor(){
        this.container = null
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

}

