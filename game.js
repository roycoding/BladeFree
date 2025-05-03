// Define constants for game settings
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const PLAYER_START_Y = GAME_HEIGHT - 100; // Start player near the bottom
const PLAYER_SPEED = 350; // Horizontal speed in pixels per second

// --- Gameplay Scene ---
class GameplayScene extends Phaser.Scene {
    constructor() {
        super('GameplayScene'); // Scene key
        this.player = null;     // To hold the player sprite
        this.cursors = null;    // To hold cursor key input object
    }

    preload() {
        // Create a simple placeholder graphic for the skater
        // We'll draw a 32x48 green rectangle texture
        let graphics = this.make.graphics({ fillStyle: { color: 0x00ff00 } }); // Green color
        graphics.fillRect(0, 0, 32, 48);
        graphics.generateTexture('skater_placeholder', 32, 48);
        graphics.destroy(); // Clean up the graphics object
        console.log("Assets preloaded");
    }

    create() {
        console.log("GameplayScene create started");

        // Add the player sprite using the placeholder texture
        // Positioned horizontally centered, vertically at PLAYER_START_Y
        this.player = this.physics.add.sprite(GAME_WIDTH / 2, PLAYER_START_Y, 'skater_placeholder');

        // Enable physics collision with the world bounds (edges of the screen)
        this.player.setCollideWorldBounds(true);

        // Prevent player from being pushed down by gravity (since world scrolls up)
        // If we add gravity later, it will be for specific jump mechanics.
        this.player.body.allowGravity = false; // Assuming default Arcade Physics gravity is y=300

        // Setup cursor keys for input
        this.cursors = this.input.keyboard.createCursorKeys();

        console.log("Player and input created");
    }

    update(time, delta) {
        // --- Player Movement ---
        if (!this.player || !this.cursors) {
            return; // Exit if player or cursors aren't ready
        }

        // Stop horizontal movement initially each frame
        this.player.setVelocityX(0);

        // Check for left/right arrow key presses
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-PLAYER_SPEED);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(PLAYER_SPEED);
        }

        // --- Scrolling (Placeholder) ---
        // The world/obstacles will move upwards in later phases.
        // The player's Y position remains fixed for now.
    }
}

// --- Phaser Game Configuration ---
const config = {
    type: Phaser.AUTO, // Automatically choose WebGL or Canvas
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    parent: 'game-container', // ID of the div to contain the game canvas
    physics: {
        default: 'arcade', // Use the Arcade Physics engine
        arcade: {
            gravity: { y: 0 }, // No global gravity for now
            // debug: true // Set to true to see physics bodies and velocity vectors
        }
    },
    scene: [GameplayScene] // Add our scene to the game
};

// --- Initialize Phaser Game ---
const game = new Phaser.Game(config);
console.log("Phaser game initialized");
