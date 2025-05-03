// Define constants for game settings
// Define constants for game settings
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const PLAYER_START_Y = GAME_HEIGHT - 100; // Start player near the bottom
const PLAYER_SPEED = 350; // Horizontal speed in pixels per second
const SCROLL_SPEED = 180; // Speed obstacles move down screen (pixels/sec)
const OBSTACLE_SPAWN_DELAY = 1500; // Milliseconds between obstacle spawns

// --- Gameplay Scene ---
class GameplayScene extends Phaser.Scene {
    constructor() {
        super('GameplayScene'); // Scene key
        this.player = null;         // To hold the player sprite
        this.cursors = null;        // To hold cursor key input object
        this.obstacles = null;      // To hold the obstacle group
        this.obstacleTimer = null;  // Timer event for spawning obstacles
    }

    preload() {
        // --- Player Placeholder ---
        // Create a simple placeholder graphic for the skater
        // We'll draw a 32x48 green rectangle texture
        let graphics = this.make.graphics({ fillStyle: { color: 0x00ff00 } }); // Green color
        graphics.fillRect(0, 0, 32, 48);
        graphics.generateTexture('skater_placeholder', 32, 48);
        graphics.destroy();

        // --- Obstacle Placeholder ---
        // Create a simple red square placeholder for obstacles
        graphics = this.make.graphics({ fillStyle: { color: 0xff0000 } }); // Red color
        graphics.fillRect(0, 0, 40, 40); // 40x40 square
        graphics.generateTexture('obstacle_placeholder', 40, 40);
        graphics.destroy();

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

        // --- Obstacles ---
        // Create a physics group for obstacles
        this.obstacles = this.physics.add.group({
            allowGravity: false // Obstacles manage their own movement
        });

        // Setup a timed event to spawn obstacles
        this.obstacleTimer = this.time.addEvent({
            delay: OBSTACLE_SPAWN_DELAY,
            callback: this.spawnObstacle,
            callbackScope: this,
            loop: true
        });

        // --- Collisions ---
        // Add collider between player and obstacles
        this.physics.add.collider(this.player, this.obstacles, this.handleCollision, null, this);

        console.log("Player, input, obstacles, and collisions created");
    }

    // --- Obstacle Spawning ---
    spawnObstacle() {
        // Calculate a random horizontal position for the obstacle
        // Ensure it's not too close to the edges
        const spawnPadding = 50;
        const spawnX = Phaser.Math.Between(spawnPadding, GAME_WIDTH - spawnPadding);
        const spawnY = -50; // Start above the screen

        // Create the obstacle sprite
        const obstacle = this.obstacles.create(spawnX, spawnY, 'obstacle_placeholder');

        if (obstacle) {
            // Set its downward velocity
            obstacle.setVelocityY(SCROLL_SPEED);

            // Make sure physics body matches sprite size
            obstacle.body.setSize(obstacle.width, obstacle.height);

            console.log(`Obstacle spawned at (${spawnX}, ${spawnY})`);
        } else {
            console.error("Failed to create obstacle sprite.");
        }
    }

    // --- Collision Handling ---
    handleCollision(player, obstacle) {
        console.log("Collision detected!");

        // Simple feedback: make player semi-transparent and stop obstacle spawning
        player.setAlpha(0.5); // Make player semi-transparent
        this.obstacleTimer.paused = true; // Stop spawning new obstacles

        // Optional: Stop the player's movement
        player.setVelocity(0, 0);

        // Optional: Stop the colliding obstacle's movement
        obstacle.setVelocity(0, 0);

        // In later phases, this will trigger the game over sequence
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

        // --- Obstacle Cleanup ---
        // Check obstacles and destroy them if they go off-screen below
        this.obstacles.children.each(obstacle => {
            // Check if obstacle exists and has a body (it might be queued for destruction)
            if (obstacle && obstacle.body && obstacle.y > GAME_HEIGHT + obstacle.height) {
                console.log("Destroying off-screen obstacle");
                this.obstacles.remove(obstacle, true, true); // Remove from group, destroy sprite & body
            }
        });
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
