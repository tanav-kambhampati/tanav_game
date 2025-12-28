import Character from "./Character.js";
import DialogueSystem from "../DialogueSystem.js";

class Npc extends Character {
    static activeDialogueNpc = null;

    constructor(data = null, gameEnv = null) {
        super(data, gameEnv);
        this.interact = data?.interact;
        this.currentQuestionIndex = 0;
        this.alertTimeout = null;
        this.isInteracting = false;
        this.hasShownProximityDialogue = false;
        this.wasInProximity = false;
        this.handleKeyDownBound = this.handleKeyDown.bind(this);
        this.handleKeyUpBound = this.handleKeyUp.bind(this);
        this.bindInteractKeyListeners();
        
        this.uniqueId = data?.id + "_" + Math.random().toString(36).substr(2, 9);
        
        if (data?.dialogues) {
            this.dialogueSystem = new DialogueSystem({
                dialogues: data.dialogues,
                id: this.uniqueId
            });
        } else {
            const greeting = data?.greeting || "Hello, traveler!";
            this.dialogueSystem = new DialogueSystem({
                dialogues: [
                    greeting, 
                    "Nice weather we're having, isn't it?",
                    "I've been standing here for quite some time."
                ],
                id: this.uniqueId
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
        
        const isInProximity = players.length > 0;
        
        if (!isInProximity && this.wasInProximity) {
            this.hasShownProximityDialogue = false;
            if (Npc.activeDialogueNpc === this) {
                Npc.activeDialogueNpc = null;
            }
        }
        
        this.wasInProximity = isInProximity;
        
        if (Npc.activeDialogueNpc === this && 
            this.dialogueSystem && 
            !this.dialogueSystem.isDialogueOpen()) {
            Npc.activeDialogueNpc = null;
        }
        
        if (players.length === 0 && this.isInteracting) {
            this.isInteracting = false;
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
        
        if (this.dialogueSystem && this.dialogueSystem.isDialogueOpen()) {
            this.dialogueSystem.closeDialogue();
            if (Npc.activeDialogueNpc === this) {
                Npc.activeDialogueNpc = null;
            }
            return;
        }
        
        if (Npc.activeDialogueNpc && Npc.activeDialogueNpc !== this) {
            if (Npc.activeDialogueNpc.dialogueSystem && 
                Npc.activeDialogueNpc.dialogueSystem.isDialogueOpen()) {
                return;
            }
        }
        
        const players = this.gameEnv.gameObjects.filter(
            obj => obj.state.collisionEvents.includes(this.spriteData.id)
        );
        const hasInteract = this.interact !== undefined;

        if (players.length > 0 && hasInteract && !this.isInteracting) {
            this.isInteracting = true;
            Npc.activeDialogueNpc = this;
            const originalInteract = this.interact;
            originalInteract.call(this);
            
            if (this.gameEnv && this.gameEnv.gameControl && 
                !this.gameEnv.gameControl.isPaused) {
                setTimeout(() => {
                    this.isInteracting = false;
                }, 500);
            }
        }
    }
    
    showReactionDialogue() {
        if (!this.dialogueSystem) return;
        if (this.hasShownProximityDialogue) return;
        
        this.hasShownProximityDialogue = true;
        
        if (Npc.activeDialogueNpc) return;
        
        const visibleDialogues = document.querySelectorAll('[id^="custom-dialogue-box-"]');
        for (const box of visibleDialogues) {
            if (box.style.display !== 'none') {
                return;
            }
        }
        
        Npc.activeDialogueNpc = this;
        
        const npcName = this.spriteData?.id || "";
        const npcAvatar = this.spriteData?.src || null;
        const greeting = this.spriteData?.greeting || "Hello!";
        this.dialogueSystem.showDialogue(greeting, npcName, npcAvatar);
    }
    
    showRandomDialogue() {
        if (!this.dialogueSystem) return;
        const npcName = this.spriteData?.id || "";
        const npcAvatar = this.spriteData?.src || null;
        this.dialogueSystem.showRandomDialogue(npcName, npcAvatar);
    }

    destroy() {
        if (Npc.activeDialogueNpc === this) {
            Npc.activeDialogueNpc = null;
        }
        if (this.gameEnv && this.gameEnv.gameControl) {
            this.gameEnv.gameControl.unregisterInteractionHandler(this);
        }
        this.removeInteractKeyListeners();
        super.destroy();
    }
}

export default Npc;
