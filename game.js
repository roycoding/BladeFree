// Define constants for game settings
// Define constants for game settings
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const PLAYER_START_Y = GAME_HEIGHT - 100; // Start player near the bottom
const PLAYER_SPEED = 350; // Horizontal speed in pixels per second
const JUMP_VELOCITY = 350; // Vertical speed when jumping (pixels/sec)
const JUMP_GRAVITY_PULL = 500; // Simulated gravity pulling player down after jump (pixels/sec^2)
const SCROLL_SPEED = 180; // Speed obstacles move down screen (pixels/sec)
const OBSTACLE_SPAWN_DELAY = 1500; // Milliseconds between obstacle spawns


// --- Start Scene ---
class StartScene extends Phaser.Scene {
    constructor() {
        super('StartScene');
    }

    create() {
        // Add title text
        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 3, 'BladeFree', {
            fontSize: '64px',
            fill: '#fff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        // Add instruction text
        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'Press any Arrow Key to Start', {
            fontSize: '24px',
            fill: '#fff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        // Listen for any arrow key press
        this.input.keyboard.once('keydown-LEFT', () => {
            this.scene.start('GameplayScene');
        });
        this.input.keyboard.once('keydown-RIGHT', () => {
            this.scene.start('GameplayScene');
        });
        this.input.keyboard.once('keydown-UP', () => { // Also allow Up/Down if desired
            this.scene.start('GameplayScene');
        });
        this.input.keyboard.once('keydown-DOWN', () => {
            this.scene.start('GameplayScene');
        });

        console.log("StartScene created");
    }
}


// --- Gameplay Scene ---
class GameplayScene extends Phaser.Scene {
    constructor() {
        super('GameplayScene'); // Scene key
        this.player = null;         // To hold the player sprite
        this.cursors = null;        // To hold cursor key input object
        this.obstacles = null;      // To hold the obstacle group
        this.ramps = null;          // To hold the ramp group
        this.obstacleTimer = null;  // Timer event for spawning obstacles/ramps
        this.score = 0;             // Player's current score
        this.highScore = 0;         // Highest score achieved
        this.scoreText = null;      // Text object for current score
        this.highScoreText = null;  // Text object for high score
        // this.isGameOver = false; // No longer needed, scene state handles this
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

        // --- Ramp Placeholder ---
        // Create a simple blue rectangle placeholder for ramps
        graphics = this.make.graphics({ fillStyle: { color: 0x0000ff } }); // Blue color
        graphics.fillRect(0, 0, 80, 20); // 80 wide, 20 high rectangle
        graphics.generateTexture('ramp_placeholder', 80, 20);
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

        // Set player depth to render on top of obstacles/ramps (default depth is 0)
        this.player.setDepth(1);

        // Setup cursor keys for input
        this.cursors = this.input.keyboard.createCursorKeys();

        // --- Obstacles ---
        // Create a physics group for obstacles
        this.obstacles = this.physics.add.group({
            allowGravity: false // Obstacles manage their own movement
        });

        // Create a physics group for ramps
        this.ramps = this.physics.add.group({
            allowGravity: false
        });

        // Setup a timed event to spawn obstacles or ramps
        this.obstacleTimer = this.time.addEvent({
            delay: OBSTACLE_SPAWN_DELAY, // Reuse same timer, decide type in spawn function
            callback: this.spawnObstacle,
            callbackScope: this,
            loop: true
        });

        // --- Collisions & Overlaps ---
        // Add collider between player and obstacles (stops movement)
        this.physics.add.collider(this.player, this.obstacles, this.handleCollision, null, this);
        // Add overlap check between player and ramps (doesn't stop movement)
        this.physics.add.overlap(this.player, this.ramps, this.handleRampOverlap, null, this);

        // --- Score and UI ---
        // Load high score from local storage
        this.highScore = localStorage.getItem('bladeFreeHighScore') || 0;

        // Score Text (Top Right)
        this.scoreText = this.add.text(GAME_WIDTH - 20, 20, 'Score: 0', {
            fontSize: '24px',
            fill: '#fff',
            fontFamily: 'Arial', // Basic fallback font
            align: 'right'
        }).setOrigin(1, 0); // Anchor to top-right

        // High Score Text (Top Left)
        // Ensure we display the loaded high score as an integer
        this.highScoreText = this.add.text(20, 20, `High Score: ${Math.floor(this.highScore)}`, {
            fontSize: '24px',
            fill: '#fff',
            fontFamily: 'Arial',
            align: 'left'
        }).setOrigin(0, 0); // Anchor to top-left

        // Reset score
        this.score = 0;
        this.scoreText.setText('Score: 0'); // Update display too

        // Reset player appearance and state if restarting
        this.player.setAlpha(1.0); // Make player fully visible
        this.player.setVelocity(0, 0); // Ensure player starts stationary

        // Ensure obstacle timer is running if restarting
        if (this.obstacleTimer) {
            this.obstacleTimer.paused = false;
        } else {
             // Setup a timed event to spawn obstacles (if first time)
            this.obstacleTimer = this.time.addEvent({
                delay: OBSTACLE_SPAWN_DELAY,
                callback: this.spawnObstacle,
                callbackScope: this,
                loop: true
            });
        }

        // Clear any existing obstacles if restarting
        this.obstacles.clear(true, true);

        console.log("GameplayScene create/reset finished");
    }

    // --- Obstacle/Ramp Spawning ---
    spawnObstacle() { // Renaming later might be good, but keep for now
        // Decide whether to spawn an obstacle or a ramp (e.g., 20% chance for ramp)
        const spawnType = (Phaser.Math.Between(1, 100) <= 20) ? 'ramp' : 'obstacle';

        // Calculate a random horizontal position
        // Ensure it's not too close to the edges
        const spawnPadding = 50;
        const spawnX = Phaser.Math.Between(spawnPadding, GAME_WIDTH - spawnPadding);
        const spawnY = -50; // Start above the screen

        let spawnedItem = null;
        let itemKey = '';
        let group = null;

        if (spawnType === 'ramp') {
            itemKey = 'ramp_placeholder';
            group = this.ramps;
            spawnedItem = group.create(spawnX, spawnY, itemKey);
            console.log(`Ramp spawned at (${spawnX}, ${spawnY})`);
        } else { // 'obstacle'
            itemKey = 'obstacle_placeholder';
            group = this.obstacles;
            spawnedItem = group.create(spawnX, spawnY, itemKey);
            console.log(`Obstacle spawned at (${spawnX}, ${spawnY})`);
        }


        if (spawnedItem) {
            // Set its downward velocity
            spawnedItem.setVelocityY(SCROLL_SPEED);

            // Make sure physics body matches sprite size
            spawnedItem.body.setSize(spawnedItem.width, spawnedItem.height);

        } else {
            console.error(`Failed to create ${spawnType} sprite.`);
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
        // obstacle.setVelocity(0, 0); // Let's keep the obstacle moving for now

        // --- High Score Check ---
        // Compare floor of current score with existing high score
        const finalScore = Math.floor(this.score);
        if (finalScore > this.highScore) {
            this.highScore = finalScore; // Save the floored score
            localStorage.setItem('bladeFreeHighScore', this.highScore);
            // Update display with the new integer high score
            this.highScoreText.setText(`High Score: ${this.highScore}`);
            console.log(`New high score: ${this.highScore}`);
        }

        // Stop the obstacle timer
        if (this.obstacleTimer) {
            this.obstacleTimer.paused = true;
        }

        // Transition to GameOverScene, passing the final score
        console.log(`Transitioning to GameOverScene with score: ${finalScore}`);
        this.scene.start('GameOverScene', { score: finalScore });
    }

    // --- Ramp Overlap Handling ---
    handleRampOverlap(player, ramp) {
        // Check if the ramp has already been hit
        if (ramp.getData('hit')) {
            return; // Ignore overlap if already hit
        }

        console.log("Ramp overlap detected!");

        // Mark the ramp as hit
        ramp.setData('hit', true);

        // Optional: Change appearance to show it's used (e.g., tint grey)
        ramp.setTint(0x808080); // Grey tint

        // Award points for hitting the ramp
        const rampPoints = 50; // Example points
        this.score += rampPoints;
        this.scoreText.setText(`Score: ${Math.floor(this.score)}`);
        console.log(`+${rampPoints} points for ramp!`);

        // Add jump logic here later (Phase 4/5)
        // Apply upward velocity for the jump
        player.setVelocityY(-JUMP_VELOCITY);
        console.log(`Jump initiated! VelocityY: ${player.body.velocity.y}, PlayerY: ${player.y}`);

        // Don't destroy the ramp, let it scroll off. It's marked as 'hit' now.
        // ramp.destroy();
    }


    update(time, delta) {
        // --- Player Movement ---
        if (!this.player || !this.cursors) {
            return; // Exit if player or cursors aren't ready
        }

        // Game logic (movement, score) now runs continuously while this scene is active.
        // Collision handling transitions away from this scene.

        // --- Player Horizontal Movement ---
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-PLAYER_SPEED);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(PLAYER_SPEED);
        } else {
            // No horizontal movement key pressed
            this.player.setVelocityX(0);
        }

        // --- Score Increment ---
        // Increment score based on time (e.g., 10 points per second)
        // delta is in milliseconds, so divide by 100 to get points per second approx
        this.score += delta / 100;
        this.scoreText.setText(`Score: ${Math.floor(this.score)}`);


        // --- Player Vertical Movement (Post-Jump) ---
        // --- Player Vertical Movement (Post-Jump) ---
        // Only apply jump physics if the player has upward velocity or is above the ground line
        if (this.player.body.velocity.y < 0 || this.player.y < PLAYER_START_Y) {
            // Apply a downward acceleration to simulate gravity pulling them back
            // console.log(`Applying gravity pull. Before VelY: ${this.player.body.velocity.y}, PlayerY: ${this.player.y}`);
            this.player.body.velocity.y += JUMP_GRAVITY_PULL * (delta / 1000); // Adjust velocity based on delta time
            // console.log(`Applying gravity pull. After VelY: ${this.player.body.velocity.y}, PlayerY: ${this.player.y}`);

            // Check if player has landed (gone past the start line while moving down)
            if (this.player.y >= PLAYER_START_Y && this.player.body.velocity.y > 0) {
                console.log(`Landed. Snapping player Y from ${this.player.y} to ${PLAYER_START_Y}`);
                this.player.setVelocityY(0);
                this.player.setY(PLAYER_START_Y); // Snap back exactly to the start line
            }
        }
        // Ensure player doesn't get stuck slightly below the line if gravity pull overshoots
        else if (this.player.y > PLAYER_START_Y) {
             this.player.setY(PLAYER_START_Y);
             this.player.setVelocityY(0); // Ensure vertical velocity is zeroed if below line
        }


        // --- Scrolling (Placeholder) ---
        // The world/obstacles will move upwards in later phases.
        // The player's Y position remains fixed for now, unless jumping.

        // --- Obstacle & Ramp Cleanup ---
        // Check items in both groups and destroy them if they go off-screen below
        [this.obstacles, this.ramps].forEach(group => {
            group.children.each(item => {
                // Check if item exists and has a body
                if (item && item.body && item.y > GAME_HEIGHT + item.height) {
                    console.log(`Destroying off-screen ${item.texture.key}`);
                    group.remove(item, true, true); // Remove from group, destroy sprite & body
                }
            });
        });
    }
}


// --- Game Over Scene ---
class GameOverScene extends Phaser.Scene {
    constructor() {
        super('GameOverScene');
        this.finalScore = 0;
        this.highScore = 0;
    }

    // Receive data from the scene that started this one (GameplayScene)
    init(data) {
        this.finalScore = data.score || 0; // Get score passed from GameplayScene
        console.log(`GameOverScene received score: ${this.finalScore}`);
    }

    create() {
        // Load high score
        this.highScore = localStorage.getItem('bladeFreeHighScore') || 0;

        // Game Over Text
        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 3, 'GAME OVER', {
            fontSize: '64px',
            fill: '#ff0000', // Red for game over
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        // Final Score Text
        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 30, `Your Score: ${this.finalScore}`, {
            fontSize: '32px',
            fill: '#fff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        // High Score Text
        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 30, `High Score: ${this.highScore}`, {
            fontSize: '32px',
            fill: '#fff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        // Restart Text
        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT * 0.75, 'Press R to Restart', {
            fontSize: '24px',
            fill: '#fff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        // Listen for 'R' key press to restart
        this.input.keyboard.once('keydown-R', () => {
            this.scene.start('GameplayScene'); // Restart the gameplay
        });

        console.log("GameOverScene created");
        // Add funny animation/text later (Phase 4/5)
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
    // Define scenes and the order they load. First scene is the starting one.
    scene: [StartScene, GameplayScene, GameOverScene]
};

// --- Initialize Phaser Game ---
const game = new Phaser.Game(config);
console.log("Phaser game initialized");
