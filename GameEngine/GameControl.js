import GameLevel from "./GameLevel.js";

class GameControl {
  
    @param {*} path 
    @param {*} levelClasses 
    
    constructor(game, levelClasses) {
        this.game = game; 
        this.path = game.path;
        this.gameContainer = game.gameContainer; 
        this.gameCanvas = game.gameCanvas; 
        this.levelClasses = levelClasses;
        this.currentLevel = null;
        this.currentLevelIndex = 0;
        this.gameLoopCounter = 0;
        this.isPaused = false;
        this.nextLevelKeyListener = this.handleNextLevelKey.bind(this);
        this.gameOver = null; 
        this.savedCanvasState = [];
        
        this.globalInteractionHandlers = new Set();
    }

    
    start() {
        this.addExitKeyListener();
        this.transitionToLevel();
    }

    @param {Object} handler
     
    registerInteractionHandler(handler) {
        if (handler) {
            this.globalInteractionHandlers.add(handler);
        }
    }

    @param {Object} handler

    unregisterInteractionHandler(handler) {
        if (handler) {
            this.globalInteractionHandlers.delete(handler);
        }
    }

    cleanupInteractionHandlers() {
        this.globalInteractionHandlers.forEach(handler => {
            if (handler.removeInteractKeyListeners) {
                handler.removeInteractKeyListeners();
            }
        });
        this.globalInteractionHandlers.clear();
    }


    transitionToLevel() {
        this.cleanupInteractionHandlers();

        const GameLevelClass = this.levelClasses[this.currentLevelIndex];
        this.currentLevel = new GameLevel(this);
        this.currentLevel.create(GameLevelClass);
        this.gameLoop();
    }

    gameLoop() {
        if (!this.currentLevel.continue) {
            this.handleLevelEnd();
            return;
        }
        if (this.isPaused) {
            return;
        }
        this.currentLevel.update();
        this.handleInLevelLogic();
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    handleInLevelLogic() {
        if (this.currentLevelIndex === 0 && this.gameLoopCounter === 0) {
            console.log("Start Level.");
        }
        this.gameLoopCounter++;
    }


    handleLevelEnd() {
        if (this.currentLevelIndex < this.levelClasses.length - 1) {
            alert("Level ended.");
        } else {
            alert("All levels completed.");
        }
        
        this.cleanupInteractionHandlers();
        
        this.currentLevel.destroy();
        
        if (this.gameOver) {
            this.gameOver();
        } else {
            this.currentLevelIndex++;
            this.transitionToLevel();
        }
    }

    
    @param {*} event 
    handleNextLevelKey(event) {
        if (event.key.toLowerCase() === 't' || event.key.toLowerCase() === 'Escape') {
            if (this.currentLevelIndex < this.levelClasses.length - 1) {
                console.log("Hotkey 't' pressed: Transitioning to next level.");
                this.currentLevel.continue = false;
            } else {
                alert("🎉 You're on the final level! There are no more levels to transition to.");
            }
        }
    }
    
    addExitKeyListener() {
        document.addEventListener('keydown', this.exitKeyListener);
    }

    removeExitKeyListener() {
        document.removeEventListener('keydown', this.exitKeyListener);
    }

    saveCanvasState() {
        const gameContainer = document.getElementById('gameContainer');
        const canvasElements = gameContainer.querySelectorAll('canvas');
        this.savedCanvasState = Array.from(canvasElements).map(canvas => {
            return {
                id: canvas.id,
                imageData: canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height)
            };
        });
    }

    hideCanvasState() {
        const gameContainer = document.getElementById('gameContainer');
        const canvasElements = gameContainer.querySelectorAll('canvas');
        canvasElements.forEach(canvas => {
            if (canvas.id !== 'gameCanvas') {
                canvas.style.display = 'none';
            }
        });
    }

    showCanvasState() {
        const gameContainer = document.getElementById('gameContainer');
        this.savedCanvasState.forEach(hidden_canvas => {
            const canvas = document.getElementById(hidden_canvas.id);
            if (canvas) {
                canvas.style.display = 'block';
                canvas.getContext('2d').putImageData(hidden_canvas.imageData, 0, 0);
            }
        });
    }

    pause() {
        this.isPaused = true;
        this.removeExitKeyListener();
        this.saveCanvasState();
        this.hideCanvasState();
        
        this.cleanupInteractionHandlers();
     }

    resume() {
        this.isPaused = false;
        this.addExitKeyListener();
        this.showCanvasState();
        this.gameLoop();
    }
}

export default GameControl;