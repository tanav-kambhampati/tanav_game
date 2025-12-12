import Character from "./Character.js";
import DialogueSystem from "../DialogueSystem.js";

class Collectible extends Character {
    constructor(data = null, gameEnv = null) {
        super(data, gameEnv);
        this.interact = data?.interact;
        this.alertTimeout = null;
        this.isInteracting = false; 
        this.handleKeyDownBound = this.handleKeyDown.bind(this);
        this.handleKeyUpBound = this.handleKeyUp.bind(this);
        this.bindInteractKeyListeners();
        
        if (data?.dialogues) {
            this.dialogueSystem = new DialogueSystem({
                dialogues: data.dialogues,
                enableSound: data.enableDialogueSound
            });
        } else {
            const itemMessage = data?.greeting || "Press E to interact.";
            this.dialogueSystem = new DialogueSystem({
                dialogues: [itemMessage]
            });
        }
        
        if (gameEnv && gameEnv.gameControl) {
            gameEnv.gameControl.registerInteractionHandler(this);
        }
    }

    update() {
        this.draw();
        const players = this.gameEnv.gameObjects.filter(
            obj => obj.state.collisionEvents.includes(this.spriteData.id)
        );
        
        if (players.length === 0 && this.isInteracting) {
            this.isInteracting = false;
            if (this.dialogueSystem && this.dialogueSystem.isDialogueOpen()) {
                this.dialogueSystem.closeDialogue();
            }
        }
    }

    bindInteractKeyListeners() {
        document.addEventListener('keydown', this.handleKeyDownBound);
        document.addEventListener('keyup', this.handleKeyUpBound);
    }

    removeInteractKeyListeners() {
        document.removeEventListener('keydown', this.handleKeyDownBound);
        document.removeEventListener('keyup', this.handleKeyUpBound);
        
        if (this.alertTimeout) {
            clearTimeout(this.alertTimeout);
            this.alertTimeout = null;
        }
        
        if (this.dialogueSystem && this.dialogueSystem.isDialogueOpen()) {
            this.dialogueSystem.closeDialogue();
        }
        
        this.isInteracting = false;
    }

    handleKeyDown(event) {
        if (event.key === 'e' || event.key === 'u') {
            this.handleKeyInteract();
        }
    }

    handleKeyUp(event) {
        if (event.key === 'e' || event.key === 'u') {
            if (this.alertTimeout) {
                clearTimeout(this.alertTimeout);
                this.alertTimeout = null;
            }
        }
    }

    handleKeyInteract() {
        if (this.gameEnv.gameControl && this.gameEnv.gameControl.isPaused) {
            return;
        }
        
        const players = this.gameEnv.gameObjects.filter(
            obj => obj.state.collisionEvents.includes(this.spriteData.id)
        );
        
        const hasInteract = this.interact !== undefined;

        if (players.length > 0 && hasInteract) {
            const originalInteract = this.interact;
            
            originalInteract.call(this);
       
            this.isInteracting = false;
        }
    }
    
    showItemMessage() {
        if (!this.dialogueSystem) return;
        
        const itemName = this.spriteData?.id || "";
        const itemIcon = this.spriteData?.src || null;
        
        const message = this.spriteData?.greeting || "Press E to interact.";
        this.dialogueSystem.showDialogue(message, itemName, itemIcon);
    }

    destroy() {
        if (this.gameEnv && this.gameEnv.gameControl) {
            this.gameEnv.gameControl.unregisterInteractionHandler(this);
        }
        
        this.removeInteractKeyListeners();
        super.destroy();
    }
}

export default Collectible;