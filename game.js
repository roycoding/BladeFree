// Define constants for game settings
const GAME_VERSION = "0.2.3"; // Current game version
// Define constants for game settings
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const PLAYER_START_Y = GAME_HEIGHT - 100; // Start player near the bottom
const PLAYER_SPEED = 350; // Horizontal speed in pixels per second
const JUMP_VELOCITY = 350; // Vertical speed when jumping (pixels/sec)
const JUMP_GRAVITY_PULL = 500; // Simulated gravity pulling player down after jump (pixels/sec^2)
const SCROLL_SPEED = 180; // Speed obstacles move down screen (pixels/sec)
const OBSTACLE_SPAWN_DELAY = 1500; // Milliseconds between obstacle spawns

// Transfer Combo Constants
const TRANSFER_COMBO_WINDOW = 750; // ms to make a transfer
const RAMP_TO_RAMP_POINTS = 75;
const RAMP_TO_RAIL_POINTS = 100;
const RAIL_TO_RAMP_POINTS = 100;
const RAIL_TO_RAIL_POINTS = 125;

// Difficulty Scaling Constants for Obstacles
const OBSTACLE_MOVEMENT_TIER1_TIME = 60000; // 1 minute in ms
const OBSTACLE_HORIZONTAL_SPEED_TIER1 = 30; // pixels/sec
const OBSTACLE_MOVEMENT_TIER2_TIME = 120000; // 2 minutes in ms
const OBSTACLE_HORIZONTAL_SPEED_TIER2 = 60; // pixels/sec

// Difficulty Scaling Constants for Spawn Rate
const SPAWN_DELAY_REDUCTION_PER_1000_PTS = 100; // ms reduction in spawn delay
const MIN_OBSTACLE_SPAWN_DELAY = 500; // Minimum spawn delay in ms


// --- Start Scene ---
class StartScene extends Phaser.Scene {
    constructor() {
        super('StartScene');
        this.muteButton = null;
    }

    preload() {
        // Load UI confirmation sound
        this.load.audio('ui_confirm', 'assets/audio/ui_confirm.mp3');
        // Load start screen music
        this.load.audio('start_music', 'assets/audio/start_music.mp3');
        // Load title image
        this.load.image('title_image', 'assets/graphics/title.png');
        // Load skater spritesheet for the play button
        this.load.spritesheet('skater', 'assets/graphics/skater.png', {
            frameWidth: 32,
            frameHeight: 48
        });
    }

    create() {
        // Add title image as the full background
        const titleImage = this.add.image(0, 0, 'title_image').setOrigin(0,0);
        // No scaling needed if image is 800x600
        // No setBackgroundColor needed as the image covers the screen

        // Play start screen music
        this.sound.play('start_music', { loop: true, volume: 0.4 }); // Adjust volume as needed

        // Function to start the game and play sound
        const startGame = () => {
            // Ensure audio context is resumed by playing a sound on user interaction
            if (this.sound.context.state === 'suspended') {
                this.sound.context.resume();
            }
            this.sound.play('ui_confirm');
            this.sound.stopByKey('start_music'); // Stop start music before transitioning
            this.scene.start('GameplayScene');
        };

        // Add Play Button sprite
        const playButton = this.add.sprite(GAME_WIDTH / 2, GAME_HEIGHT * 0.75, 'skater', 37)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .setScale(2); // Make the button a bit larger

        playButton.on('pointerdown', startGame);

        // Also allow ANY key press to start
        this.input.keyboard.once('keydown', startGame);

        // Add "Push START to SKATE" text below the button
        this.add.text(GAME_WIDTH / 2, playButton.y + playButton.displayHeight / 2 + 30, 'Push START to SKATE', {
            fontSize: '28px',
            fill: '#FFFF00', // Yellow
            fontFamily: 'Arial',
            stroke: '#000000', // Black stroke
            strokeThickness: 5
        }).setOrigin(0.5);

        // Mute Button
        const muteButtonPadding = 20;
        const initialMuteText = this.sound.mute ? 'Unmute' : 'Mute';
        this.muteButton = this.add.text(
            GAME_WIDTH - muteButtonPadding, 
            GAME_HEIGHT - muteButtonPadding, 
            initialMuteText, 
            { 
                fontSize: '18px', 
                fill: '#fff', 
                fontFamily: 'Arial',
                backgroundColor: '#00000080', // Semi-transparent black background
                padding: { x: 8, y: 4 }
            }
        )
        .setOrigin(1, 1) // Anchor to bottom-right
        .setDepth(100)   // Ensure it's on top
        .setInteractive({ useHandCursor: true });

        this.muteButton.on('pointerdown', () => {
            this.sound.mute = !this.sound.mute;
            this.muteButton.setText(this.sound.mute ? 'Unmute' : 'Mute');
            // Optionally play a UI sound, but consider it might be muted
            if (!this.sound.mute) {
                this.sound.play('ui_confirm', { volume: 0.3 }); // Play softly if unmuting
            }
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
        this.grindables = null;     // To hold the grindable rails/ledges
        this.collectibles = null;   // To hold the collectible items
        this.obstacleTimer = null;  // Timer event for spawning obstacles/ramps/grindables/collectibles
        this.score = 0;             // Player's current score
        this.isGrinding = false;    // Flag to track if player is currently grinding
        this.isJumping = false;     // Flag to track if player is airborne from a jump
        this.isFalling = false;     // Flag to track if player is in collision state
        this.activeGrindable = null; // Reference to the current rail being grinded
        this.currentGrindPoints = 0; // Points accumulated in the current grind, for display
        this.grindPointsDisplay = null; // Text object for displaying current grind points
        this.highScore = 0;         // Highest score achieved
        this.scoreText = null;      // Text object for current score
        this.highScoreText = null;  // Text object for high score
        this.hasHelmet = false;     // Flag for helmet power-up
        this.helmetIcon = null;     // UI icon for helmet status
        this.initialHelmetSpawned = false; // Flag to ensure one helmet spawns early
        this.isPaused = false;      // Flag to track if game is paused
        this.pauseText = null;      // Text object for "PAUSED" message

        // Transfer combo tracking
        this.lastTrickObject = null;
        this.lastTrickObjectType = null; // 'ramp' or 'rail'
        this.timeLastTrickEnded = 0;     // Timestamp of when the last trick interaction relevant for a transfer ended/started

        this.jumpAnimationTimer = null; // Timer for 360 animation frame switch
        this.grindNameText = null;   // Text object for "Royale Grind" persistent display
        this.isPerformingRampJump = false; // Flag to indicate a 360 ramp jump is in progress
        this.pointsForCurrentRampJump = 0; // Points to award upon landing a 360

        this.gameStartTime = 0; // To track elapsed time for difficulty scaling
        this.lastScoreThresholdForSpawnDelay = 0; // Tracks score for spawn rate increase

        this.leftPromptText = null; // For mobile control prompt
        this.rightPromptText = null; // For mobile control prompt
        this.leftPromptArrow = null; // Graphics for left arrow
        this.rightPromptArrow = null; // Graphics for right arrow

        this.elapsedTimeText = null; // Text object for displaying elapsed time
        this.sceneRunningTime = 0; // For accurate scene-specific timer display
        this.bladeFreeOverlay = null; // Static BladeFree overlay at the top
        this.royskatesOverlay = null; // Static Royskates overlay at the bottom
        this.muteButton = null;       // Mute button
        
        this.inventoryItems = [24, 25, 26, 28, 29, 30, 31]; // Frames for inventory items (excluding helmet)
        this.playerInventory = {};    // To track collected status e.g. {24: false, 25: true}
        this.inventoryUIIcons = {}; // To store references to UI sprites for inventory items
        // this.isGameOver = false; // No longer needed, scene state handles this

        // Mapping for collectible items
        this.collectibleData = {
            24: { name: 'Skates', points: 25 },
            25: { name: 'Wheels', points: 25 },
            26: { name: 'Wax', points: 25 },
            27: { name: 'Helmet', points: 50 }, // Helmet worth more
            28: { name: 'Bearings', points: 25 },
            29: { name: 'Knee Pads', points: 25 },
            30: { name: 'New Skate Video', points: 25 },
            31: { name: 'Baggie Jeans', points: 25 }
        };
    }

    preload() {
        // --- Player Spritesheet ---
        this.load.spritesheet('skater', 'assets/graphics/skater.png', {
            frameWidth: 32,
            frameHeight: 48
        });

        // --- Background Image ---
        this.load.image('asphalt_bg', 'assets/graphics/asphalt.png');
        this.load.image('asphalt_bladefree', 'assets/graphics/asphalt_bladefree.png'); // Load BladeFree tile
        this.load.image('asphalt_royskates', 'assets/graphics/asphalt_royskates.png'); // Load Royskates tile

        // --- Obstacle Placeholder ---
        // Obstacles will now use frames from the 'skater' spritesheet.
        // No separate placeholder texture needed.

        // --- Ramp Graphic ---
        this.load.image('ramp_graphic', 'assets/graphics/ramp.png');
        // No procedural placeholder needed anymore for ramps.

        // --- Grindable Graphic ---
        this.load.image('rail_graphic', 'assets/graphics/rail1.png');
        // No procedural placeholder needed anymore for grindables.
        // graphics.destroy(); // Ensure graphics object is destroyed if it was used last for ramp

        // --- Collectible Placeholder ---
        // Collectibles will now use frames from the 'skater' spritesheet.
        // No separate placeholder texture needed.

        // --- Load Audio Assets ---
        this.load.audio('music', 'assets/audio/music.mp3');
        this.load.audio('jump', 'assets/audio/jump.mp3');
        this.load.audio('collect', 'assets/audio/collect.mp3');
        this.load.audio('collide', 'assets/audio/collide.mp3');
        this.load.audio('grind_start', 'assets/audio/grind_start.mp3');
        this.load.audio('land', 'assets/audio/land.mp3'); // Renamed from grind_end
        // Also load UI confirm sound here in case it's needed for in-game UI later
        this.load.audio('ui_confirm', 'assets/audio/ui_confirm.mp3');
        // Load game over sound here so it's ready when transitioning
        this.load.audio('game_over', 'assets/audio/game_over.mp3');
        // Load dog bark sound
        this.load.audio('dog_bark', 'assets/audio/dog_bark.mp3');
        // Using 'collide' as placeholder for 'helmet_break' sound for now
        // this.load.audio('helmet_break', 'assets/audio/helmet_break.mp3');


        console.log("Assets preloaded");
    }

    create() {
        console.log("GameplayScene create started");
        
        // Add the tiling asphalt background
        this.background = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'asphalt_bg');
        this.background.setOrigin(0, 0); // Position at top-left
        this.background.setDepth(-1); // Ensure main background is behind other elements
        this.background.setScrollFactor(0); // Make it static relative to the camera
        // No need to setBackgroundColor if we have a full background image

        // Initialize game start time for difficulty scaling
        // this.gameStartTime = this.time.now; // Moved to later in create for more accuracy

        // Add the player sprite using the loaded spritesheet
        // Positioned horizontally centered, vertically at PLAYER_START_Y
        this.player = this.physics.add.sprite(GAME_WIDTH / 2, PLAYER_START_Y, 'skater'); // Use 'skater' key

        // Enable physics collision with the world bounds (edges of the screen)
        this.player.setCollideWorldBounds(true);

        // Prevent player from being pushed down by gravity (since world scrolls up)
        // If we add gravity later, it will be for specific jump mechanics.
        this.player.body.allowGravity = false; // Assuming default Arcade Physics gravity is y=300

        // Set player depth to render on top of obstacles/ramps (default depth is 0)
        this.player.setDepth(1);

        // Setup cursor keys for input
        this.cursors = this.input.keyboard.createCursorKeys();
        // Add A and D keys for movement
        this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

        // --- Mobile Touch Input ---
        this.input.on('pointerdown', (pointer) => {
            // Check if touch is on left or right half of the screen
            if (pointer.x < GAME_WIDTH / 2) {
                // Touch on left half - simulate left key press
                this.player.setVelocityX(-PLAYER_SPEED);
            } else {
                // Touch on right half - simulate right key press
                this.player.setVelocityX(PLAYER_SPEED);
            }
        });

        // Stop movement when touch is released
        this.input.on('pointerup', () => {
            // Only stop if not controlled by keyboard (prevents conflict)
            if (!this.cursors.left.isDown && !this.cursors.right.isDown) {
                 this.player.setVelocityX(0);
            }
        });


        // --- Obstacles ---
        // Create a physics group for obstacles
        this.obstacles = this.physics.add.group({
            allowGravity: false // Obstacles manage their own movement
        });

        // Create a physics group for ramps
        this.ramps = this.physics.add.group({
            allowGravity: false
        });

        // Create a physics group for grindables
        this.grindables = this.physics.add.group({
            allowGravity: false
        });

        // Create a physics group for collectibles
        this.collectibles = this.physics.add.group({
            allowGravity: false
        });

        // Setup a timed event to spawn obstacles, ramps, grindables or collectibles
        this.obstacleTimer = this.time.addEvent({
            delay: OBSTACLE_SPAWN_DELAY, // Reuse same timer, decide type in spawn function
            callback: this.spawnObstacle,
            callbackScope: this,
            loop: true
        });

        // --- Collisions & Overlaps ---
        // Add collider between player and obstacles (stops movement)
        this.physics.add.collider(this.player, this.obstacles, this.handleCollision, null, this);
        // Add overlap check between player and ramps (triggers jump)
        this.physics.add.overlap(this.player, this.ramps, this.handleRampOverlap, null, this);
        // Add overlap check between player and grindables (triggers grind)
        this.physics.add.overlap(this.player, this.grindables, this.handleGrindOverlap, null, this);
        // Add overlap check between player and collectibles (triggers collect)
        this.physics.add.overlap(this.player, this.collectibles, this.handleCollect, null, this);


        // --- Score and UI ---
        // Load high score from local storage
        this.highScore = localStorage.getItem('bladeFreeHighScore') || 0;

        // Score Text (Top Right)
        this.scoreText = this.add.text(GAME_WIDTH - 20, 20, 'Score: 0', {
            fontSize: '24px',
            fill: '#fff',
            fontFamily: 'Arial', // Basic fallback font
            align: 'right'
        }).setOrigin(1, 0).setDepth(3); // Anchor to top-right, ensure high depth

        // Elapsed Time Text (Below Score Text)
        this.elapsedTimeText = this.add.text(GAME_WIDTH - 20, this.scoreText.y + this.scoreText.height + 5, 'Time: 00:00', {
            fontSize: '20px', // Slightly smaller than score
            fill: '#fff',
            fontFamily: 'Arial',
            align: 'right'
        }).setOrigin(1, 0).setDepth(3); // Anchor to top-right (below score), ensure high depth


        // High Score Text (Top Left)
        // Ensure we display the loaded high score as an integer
        this.highScoreText = this.add.text(20, 20, `High Score: ${Math.floor(this.highScore)}`, {
            fontSize: '24px',
            fill: '#fff',
            fontFamily: 'Arial',
            align: 'left'
        }).setOrigin(0, 0).setDepth(3); // Anchor to top-left, ensure high depth


        // Helmet UI Icon (next to score)
        // Using frame 27 (helmet collectible) as the icon.
        this.helmetIcon = this.add.sprite(GAME_WIDTH - 20 - this.scoreText.width - 15, 20 + 12, 'skater', 27) // Adjusted X for larger icon
            .setOrigin(1, 0.5) // Align to the right of its position, vertically centered with score text
            .setScale(1.0) // Increased scale for better visibility
            .setVisible(false) // Initially hidden
            .setDepth(3); // Ensure it's on top of other UI like score text

        // --- Inventory UI Setup ---
        this.initializeInventory();


        // Reset score
        this.score = 0;
        this.scoreText.setText('Score: 0'); // Update display too

        // Reset player appearance and state if restarting
        this.player.setAlpha(1.0); // Make player fully visible
        this.player.setVelocity(0, 0); // Ensure player starts stationary
        this.isFalling = false; // Reset falling state on restart
        this.hasHelmet = false; // Reset helmet status
        this.initialHelmetSpawned = false; // Reset for next game
        this.updateHelmetIcon(); // Update UI

        // Reset transfer combo state
        this.lastTrickObject = null;
        this.lastTrickObjectType = null;
        this.timeLastTrickEnded = 0;

        // Reset jump animation timer
        if (this.jumpAnimationTimer) {
            this.jumpAnimationTimer.remove(false);
            this.jumpAnimationTimer = null;
        }

        // Reset grind name text
        if (this.grindNameText) {
            this.grindNameText.destroy();
            this.grindNameText = null;
        }
        if (this.grindPointsDisplay) { // Add reset for grindPointsDisplay
            this.grindPointsDisplay.destroy();
            this.grindPointsDisplay = null;
        }
        this.isPerformingRampJump = false;
        this.pointsForCurrentRampJump = 0;
        this.lastScoreThresholdForSpawnDelay = 0; // Reset for spawn rate scaling

        // Reset mobile prompts
        if (this.leftPromptText) {
            this.leftPromptText.destroy();
            this.leftPromptText = null;
        }
        if (this.rightPromptText) {
            this.rightPromptText.destroy();
            this.rightPromptText = null;
        }
        if (this.leftPromptArrow) {
            this.leftPromptArrow.destroy();
            this.leftPromptArrow = null;
        }
        if (this.rightPromptArrow) {
            this.rightPromptArrow.destroy();
            this.rightPromptArrow = null;
        }

        // Reset mute button if it exists
        if (this.muteButton) {
            this.muteButton.destroy();
            this.muteButton = null;
        }

        // Reset elapsed time text and scene running time
        if (this.elapsedTimeText) {
            this.elapsedTimeText.setText('Time: 00:00');
        }
        this.sceneRunningTime = 0; // Reset scene-specific running time

        // Reset static overlays if they exist from a previous game
        if (this.bladeFreeOverlay) {
            this.bladeFreeOverlay.destroy();
            this.bladeFreeOverlay = null;
        }
        if (this.royskatesOverlay) {
            this.royskatesOverlay.destroy();
            this.royskatesOverlay = null;
        }
        
        // --- Create Static Overlays AFTER potential destruction ---
        // Static BladeFree Overlay (Top Center)
        const topOverlayMargin = 10;
        this.bladeFreeOverlay = this.add.sprite(GAME_WIDTH / 2, topOverlayMargin, 'asphalt_bladefree')
            .setOrigin(0.5, 0) // Anchor top-center
            .setDepth(2);      // Depth to be above background, below main UI

        // Static Royskates Overlay (Bottom Center)
        const bottomOverlayMargin = 10;
        this.royskatesOverlay = this.add.sprite(GAME_WIDTH / 2, GAME_HEIGHT - bottomOverlayMargin, 'asphalt_royskates')
            .setOrigin(0.5, 1) // Anchor bottom-center
            .setDepth(2);      // Depth to be above background, below main UI
        
        // Explicitly use this.sys.time.now to ensure we're getting the most direct time reference
        this.gameStartTime = this.sys.time.now; // For difficulty scaling logic
        console.log(`GameplayScene.create: gameStartTime reset to ${this.gameStartTime} for difficulty scaling.`);


        // Ensure obstacle timer is running if restarting
        if (this.obstacleTimer) {
            this.obstacleTimer.remove(false); // Remove the old timer event completely
            this.obstacleTimer = null;      // Nullify the reference
        }
        // Always create a new timer event for this scene instance
        this.obstacleTimer = this.time.addEvent({
            delay: OBSTACLE_SPAWN_DELAY,
            callback: this.spawnObstacle,
            callbackScope: this,
            loop: true
        });
        // The new timer will start with OBSTACLE_SPAWN_DELAY by default.
        // If you need to adjust it immediately based on score (e.g. if starting with high score),
        // that logic would go here, but typically it starts fresh.

        // Clear any existing obstacles, ramps, grindables, collectibles if restarting
        this.obstacles.clear(true, true);
        this.ramps.clear(true, true);
        this.grindables.clear(true, true);
        this.collectibles.clear(true, true);
        // Static overlays are handled by their individual reset logic earlier in create()

        // --- Start Background Music ---
        // Stop previous music if restarting, before starting new one
        this.sound.stopByKey('music');
        // Play music looping, adjust volume as needed
        this.sound.play('music', { loop: true, volume: 0.5 });
        

        // --- Create Player Animations ---
        this.anims.create({
            key: 'skate-cycle',
            frames: this.anims.generateFrameNumbers('skater', { start: 0, end: 3 }),
            frameRate: 3, // Very slow frame rate for skating/gliding
            repeat: -1 // Loop forever
        });

        this.anims.create({
            key: 'jump-airborne',
            frames: [{ key: 'skater', frame: 9 }], // Use frame 9 (airborne pose)
            frameRate: 20
        });

        this.anims.create({
            key: 'jump-landing',
            frames: [{ key: 'skater', frame: 10 }], // Use frame 10 (landing pose)
            frameRate: 10,
            repeat: 0 // Play only once
        });

        this.anims.create({
            key: 'grind',
            frames: [{ key: 'skater', frame: 16 }], // Use frame 16 for grinding pose
            frameRate: 20
        });

        this.anims.create({
            key: 'fall',
            // Use frames that visually represent the fall sequence
            frames: this.anims.generateFrameNumbers('skater', { frames: [11, 2, 3] }), // Original fall
            frameRate: 8,
            repeat: 0 // Play once
        });

        // Set initial animation
        this.player.play('skate-cycle', true); // Start playing the skate cycle

        // Add animationcomplete listener for jump-landing
        this.player.on('animationcomplete-jump-landing', () => {
            console.log("Jump landing animation complete");
            if (!this.isGrinding && !this.isJumping && !this.isFalling && !this.isPaused) {
                console.log("Transitioning from landing to skate-cycle");
                this.player.play('skate-cycle', true);
            }
        }, this);

        // --- Pause Functionality ---
        this.pauseText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'PAUSED', {
            fontSize: '64px',
            fill: '#FFFF00',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5).setDepth(10).setVisible(false); // High depth, initially hidden

        this.input.keyboard.on('keydown-P', () => {
            this.togglePause();
        });

        // --- Mobile Control Prompts ---
        // Only show if it's likely a touch device (Phaser.Device.os.desktop is false)
        // Or, for testing, always show: true
        if (!this.sys.game.device.os.desktop) {
            const promptStyle = {
                fontSize: '20px',
                fill: '#ffffff',
                fontFamily: 'Arial',
                stroke: '#000000',
                strokeThickness: 4,
                align: 'center',
                backgroundColor: 'rgba(0,0,0,0.5)',
                padding: { x: 10, y: 5 }
            };
            const arrowYOffset = 40; // How far below the text the arrow is
            const arrowSize = 15; // Size of the arrowhead

            this.leftPromptText = this.add.text(GAME_WIDTH * 0.25, GAME_HEIGHT * 0.6, 'Tap Here\nMove Left', promptStyle)
                .setOrigin(0.5)
                .setDepth(5);
            
            this.leftPromptArrow = this.add.graphics().setDepth(5);
            this.leftPromptArrow.fillStyle(0x00ff00, 1); // Green
            this.leftPromptArrow.beginPath();
            this.leftPromptArrow.moveTo(this.leftPromptText.x + arrowSize / 2, this.leftPromptText.y + arrowYOffset);
            this.leftPromptArrow.lineTo(this.leftPromptText.x - arrowSize / 2, this.leftPromptText.y + arrowYOffset);
            this.leftPromptArrow.lineTo(this.leftPromptText.x - arrowSize / 2, this.leftPromptText.y + arrowYOffset - arrowSize / 2);
            this.leftPromptArrow.lineTo(this.leftPromptText.x - arrowSize * 1.5, this.leftPromptText.y + arrowYOffset); // Point of arrow
            this.leftPromptArrow.lineTo(this.leftPromptText.x - arrowSize / 2, this.leftPromptText.y + arrowYOffset + arrowSize / 2);
            this.leftPromptArrow.lineTo(this.leftPromptText.x - arrowSize / 2, this.leftPromptText.y + arrowYOffset);
            this.leftPromptArrow.closePath();
            this.leftPromptArrow.fillPath();


            this.rightPromptText = this.add.text(GAME_WIDTH * 0.75, GAME_HEIGHT * 0.6, 'Tap Here\nMove Right', promptStyle)
                .setOrigin(0.5)
                .setDepth(5);

            this.rightPromptArrow = this.add.graphics().setDepth(5);
            this.rightPromptArrow.fillStyle(0xb234e2, 1); // Purple (using existing helmet/transfer color)
            this.rightPromptArrow.beginPath();
            this.rightPromptArrow.moveTo(this.rightPromptText.x - arrowSize / 2, this.rightPromptText.y + arrowYOffset);
            this.rightPromptArrow.lineTo(this.rightPromptText.x + arrowSize / 2, this.rightPromptText.y + arrowYOffset);
            this.rightPromptArrow.lineTo(this.rightPromptText.x + arrowSize / 2, this.rightPromptText.y + arrowYOffset - arrowSize / 2);
            this.rightPromptArrow.lineTo(this.rightPromptText.x + arrowSize * 1.5, this.rightPromptText.y + arrowYOffset); // Point of arrow
            this.rightPromptArrow.lineTo(this.rightPromptText.x + arrowSize / 2, this.rightPromptText.y + arrowYOffset + arrowSize / 2);
            this.rightPromptArrow.lineTo(this.rightPromptText.x + arrowSize / 2, this.rightPromptText.y + arrowYOffset);
            this.rightPromptArrow.closePath();
            this.rightPromptArrow.fillPath();

            // Fade out prompts after a delay or on first move
            this.time.delayedCall(6000, () => { // Increased duration to 6 seconds
                this.hideMobilePrompts();
            }, [], this);
        }

        // Mute Button for GameplayScene
        const muteButtonPaddingGameplay = 20;
        const initialMuteTextGameplay = this.sound.mute ? 'Unmute' : 'Mute';
        this.muteButton = this.add.text(
            GAME_WIDTH - muteButtonPaddingGameplay, 
            GAME_HEIGHT - muteButtonPaddingGameplay, 
            initialMuteTextGameplay, 
            { 
                fontSize: '18px', 
                fill: '#fff', 
                fontFamily: 'Arial',
                backgroundColor: '#00000080',
                padding: { x: 8, y: 4 }
            }
        )
        .setOrigin(1, 1)
        .setDepth(100)
        .setInteractive({ useHandCursor: true });

        this.muteButton.on('pointerdown', () => {
            this.sound.mute = !this.sound.mute;
            this.muteButton.setText(this.sound.mute ? 'Unmute' : 'Mute');
            if (!this.sound.mute) {
                this.sound.play('ui_confirm', { volume: 0.3 });
            }
        });


        console.log("GameplayScene create/reset finished");
    }

    togglePause() {
        this.isPaused = !this.isPaused;

        if (this.isPaused) {
            console.log("Game Paused");
            this.physics.pause();
            if (this.obstacleTimer) this.obstacleTimer.paused = true;
            this.tweens.pauseAll();
            this.player.anims.pause();
            // Pause all group items' animations if they have any active
            [this.obstacles, this.ramps, this.grindables, this.collectibles].forEach(group => {
                group.children.each(item => {
                    if (item.anims) item.anims.pause();
                });
            });
            this.sound.pauseAll(); // Pauses all sounds, including music
            this.pauseText.setVisible(true);
        } else {
            console.log("Game Resumed");
            this.physics.resume();
            if (this.obstacleTimer) this.obstacleTimer.paused = false;
            this.tweens.resumeAll();
            if (this.player.anims.currentAnim) this.player.anims.resume(); else if (!this.isGrinding && !this.isJumping && !this.isFalling) this.player.play('skate-cycle', true);
            [this.obstacles, this.ramps, this.grindables, this.collectibles].forEach(group => {
                group.children.each(item => {
                    if (item.anims && item.anims.currentAnim) item.anims.resume();
                });
            });
            this.sound.resumeAll(); // Resumes all sounds
            this.pauseText.setVisible(false);
        }
    }

    hideMobilePrompts() {
        if (this.leftPromptText && this.leftPromptText.visible) {
            this.tweens.add({
                targets: this.leftPromptText,
                alpha: 0,
                duration: 500,
                onComplete: () => { if (this.leftPromptText) this.leftPromptText.destroy(); this.leftPromptText = null; }
            });
        }
        if (this.leftPromptArrow && this.leftPromptArrow.visible) {
            this.tweens.add({
                targets: this.leftPromptArrow,
                alpha: 0,
                duration: 500,
                onComplete: () => { if (this.leftPromptArrow) this.leftPromptArrow.destroy(); this.leftPromptArrow = null; }
            });
        }
        if (this.rightPromptText && this.rightPromptText.visible) {
            this.tweens.add({
                targets: this.rightPromptText,
                alpha: 0,
                duration: 500,
                onComplete: () => { if (this.rightPromptText) this.rightPromptText.destroy(); this.rightPromptText = null; }
            });
        }
        if (this.rightPromptArrow && this.rightPromptArrow.visible) {
            this.tweens.add({
                targets: this.rightPromptArrow,
                alpha: 0,
                duration: 500,
                onComplete: () => { if (this.rightPromptArrow) this.rightPromptArrow.destroy(); this.rightPromptArrow = null; }
            });
        }
    }

    initializeInventory() {
        // Clear previous icons if any (for restarts)
        for (const frame in this.inventoryUIIcons) {
            if (this.inventoryUIIcons[frame]) {
                this.inventoryUIIcons[frame].destroy();
            }
        }
        this.inventoryUIIcons = {};
        this.playerInventory = {};

        const startX = 20; // Starting X position for the first inventory icon in a row
        const iconYRow1 = 60;  // Y position for the first row of inventory icons
        const iconYRow2 = iconYRow1 + 40; // Y position for the second row
        const iconSpacing = 40; // Spacing between icons horizontally
        const iconScale = 0.75;
        const uncollectedTint = 0x707070; // Darker gray tint
        const uncollectedAlpha = 0.4;    // Subdued alpha
        const itemsPerRow = 4;

        this.inventoryItems.forEach((frame, index) => {
            this.playerInventory[frame] = false; // Initialize as not collected

            let iconX, iconY;
            if (index < itemsPerRow) { // First row
                iconX = startX + (index * iconSpacing);
                iconY = iconYRow1;
            } else { // Second row
                iconX = startX + ((index - itemsPerRow) * iconSpacing);
                iconY = iconYRow2;
            }

            const iconSprite = this.add.sprite(iconX, iconY, 'skater', frame)
                .setOrigin(0, 0.5) // Align to left, vertically centered
                .setScale(iconScale)
                .setTint(uncollectedTint)
                .setAlpha(uncollectedAlpha)
                .setDepth(1);
            this.inventoryUIIcons[frame] = iconSprite;
        });
    }

    checkInventoryComplete() {
        for (const frame of this.inventoryItems) {
            if (!this.playerInventory[frame]) {
                return false; // Not all items collected
            }
        }
        return true; // All items collected
    }

    resetInventoryDisplay() {
        const uncollectedTint = 0x707070; // Darker gray tint
        const uncollectedAlpha = 0.4;    // Subdued alpha
        this.inventoryItems.forEach(frame => {
            this.playerInventory[frame] = false;
            if (this.inventoryUIIcons[frame]) {
                this.inventoryUIIcons[frame].setTint(uncollectedTint).setAlpha(uncollectedAlpha);
            }
        });
    }


    // --- Obstacle/Ramp/Grindable/Collectible Spawning ---
    spawnObstacle() {
        let spawnType;

        // Force spawn a helmet as one of the first collectibles if not already done
        if (!this.initialHelmetSpawned) {
            spawnType = 'collectible_helmet'; // Special type for initial helmet
            this.initialHelmetSpawned = true;
            console.log("Attempting to spawn initial helmet.");
        } else {
            // Decide what to spawn: 20% ramp, 20% grindable, 25% collectible, 35% obstacle
            const rand = Phaser.Math.Between(1, 100);
            spawnType = 'obstacle'; // Default
            if (rand <= 20) { // 1-20
                spawnType = 'ramp';
            } else if (rand <= 40) { // 21-40
                spawnType = 'grindable';
            } else if (rand <= 65) { // 41-65
                 spawnType = 'collectible';
            }
            // else: 66-100 remains 'obstacle'
        }

        // Calculate a random horizontal position
        // Ensure it's not too close to the edges
        const spawnPadding = 50;
        const spawnX = Phaser.Math.Between(spawnPadding, GAME_WIDTH - spawnPadding);
        const spawnY = -50; // Start above the screen

        let spawnedItem = null;
        let itemKey = '';
        let group = null;

        if (spawnType === 'ramp') {
            itemKey = 'ramp_graphic'; // Use the new ramp graphic
            group = this.ramps;
            spawnedItem = group.create(spawnX, spawnY, itemKey);
            console.log(`Ramp (ramp.png) spawned at (${spawnX}, ${spawnY})`);
        } else if (spawnType === 'grindable') {
            itemKey = 'rail_graphic'; // Use the new rail graphic
            group = this.grindables;
            // Ensure grindables don't spawn too close to the edge
            const grindableWidth = 20; // Updated width of rail1.png
            const safeSpawnX = Phaser.Math.Clamp(spawnX, grindableWidth / 2 + spawnPadding, GAME_WIDTH - grindableWidth / 2 - spawnPadding); // Add padding
            spawnedItem = group.create(safeSpawnX, spawnY, itemKey);
            console.log(`Grindable (rail1.png) spawned at (${safeSpawnX}, ${spawnY})`);
        } else if (spawnType === 'collectible' || spawnType === 'collectible_helmet') {
            itemKey = 'skater'; // Use the main spritesheet
            group = this.collectibles;
            let randomFrame;
            if (spawnType === 'collectible_helmet') {
                randomFrame = 27; // Force helmet frame
            } else {
                // Base collectible frames (excluding helmet)
                let collectibleFrames = [24, 25, 26, 28, 29, 30, 31];
                // If player doesn't have a helmet, add helmet (frame 27) to potential spawns
                if (!this.hasHelmet) {
                    // Add helmet to the pool with a certain chance, or always if you prefer
                    // For example, 20% chance to be a helmet if a collectible spawns and player has no helmet
                    if (Phaser.Math.Between(1, 5) === 1) { 
                        collectibleFrames = [27]; // Make it a helmet
                    } else {
                         // Or, to just add it to the general pool:
                         // collectibleFrames.push(27);
                    }
                }
                // If collectibleFrames is empty (e.g. player has helmet and only helmet was forced by chance),
                // default to a non-helmet item or handle as needed. For now, let's ensure it's not empty.
                if (collectibleFrames.length === 0) {
                    collectibleFrames = [24, 25, 26, 28, 29, 30, 31]; // Fallback to non-helmet items
                }
                randomFrame = Phaser.Utils.Array.GetRandom(collectibleFrames);
            }
            spawnedItem = group.create(spawnX, spawnY, itemKey, randomFrame); // Create with specific frame
            // Make collectibles circular physics bodies (using sprite width)
            spawnedItem.body.setCircle(spawnedItem.width / 2);
            console.log(`Collectible (frame ${randomFrame}) spawned at (${spawnX}, ${spawnY})`);
        } else { // 'obstacle'
            itemKey = 'skater'; // Use the main spritesheet
            group = this.obstacles;
            // Randomly select an obstacle frame index (32-36)
            const obstacleFrames = [32, 33, 34, 35, 36];
            const randomFrame = Phaser.Utils.Array.GetRandom(obstacleFrames);
            spawnedItem = group.create(spawnX, spawnY, itemKey, randomFrame); // Create with specific frame
            // Randomly flip the obstacle horizontally
            if (Phaser.Math.Between(0, 1) === 0) {
                spawnedItem.setFlipX(true);
            }
            console.log(`Obstacle (frame ${randomFrame}, flipX: ${spawnedItem.flipX}) spawned at (${spawnX}, ${spawnY})`);
        }


        if (spawnedItem) {
            // Set its downward velocity
            spawnedItem.setVelocityY(SCROLL_SPEED);

            // Make sure physics body matches sprite size
            spawnedItem.body.setSize(spawnedItem.width, spawnedItem.height);

            // --- Difficulty Scaling: Apply horizontal movement to obstacles based on time ---
            if (spawnType === 'obstacle') {
                const currentTime = this.time.now; // Use the current time from the main game loop
                const sceneStartTime = this.gameStartTime; // The start time set in create()
                const elapsedTime = currentTime - sceneStartTime;
                console.log(`spawnObstacle: currentTime = ${currentTime}, sceneStartTime = ${sceneStartTime}, calculated elapsedTime = ${elapsedTime} for difficulty.`);
            
                let horizontalSpeed = 0;

                if (elapsedTime >= OBSTACLE_MOVEMENT_TIER2_TIME) {
                    horizontalSpeed = OBSTACLE_HORIZONTAL_SPEED_TIER2;
                } else if (elapsedTime >= OBSTACLE_MOVEMENT_TIER1_TIME) {
                    horizontalSpeed = OBSTACLE_HORIZONTAL_SPEED_TIER1;
                }

                if (horizontalSpeed > 0) {
                    spawnedItem.body.velocity.x = Phaser.Math.RND.sign() * horizontalSpeed;
                    console.log(`Obstacle spawned with horizontal speed: ${spawnedItem.body.velocity.x} (elapsed: ${elapsedTime}ms)`);
                }
            }

        } else {
            console.error(`Failed to create ${spawnType} sprite.`);
        }
    }

    // --- Collision Handling ---
    handleCollision(player, obstacle) {
        console.log("Collision detected!");

        if (this.isJumping) { // If player was jumping during collision
            if (this.jumpAnimationTimer) {
                this.jumpAnimationTimer.remove(false);
                this.jumpAnimationTimer = null;
            }
            this.isJumping = false; // Player is no longer in a controlled jump state
            if (this.isPerformingRampJump) { // Also reset ramp jump flag
                this.isPerformingRampJump = false;
                this.pointsForCurrentRampJump = 0;
            }
        }

        // player.setAlpha(0.5); // Remove transparency, rely on animation
        // REMOVED: this.obstacleTimer.paused = true; // This was pausing timer even with helmet

        // Optional: Stop the player's movement
        player.setVelocity(0, 0);

        // Optional: Stop the colliding obstacle's movement
        // obstacle.setVelocity(0, 0); // Let's keep the obstacle moving for now

        // --- Helmet Protection Check ---
        if (this.hasHelmet) {
            // this.hasHelmet = false; // We'll set this after the animation
            // this.updateHelmetIcon(); // We'll handle UI icon differently
            this.sound.play('collide'); // Placeholder for "helmet_break" sound
            console.log("Helmet protected player! Lost helmet.");

            // Immediately hide the UI helmet icon
            if (this.helmetIcon) {
                this.helmetIcon.setVisible(false);
            }
            this.hasHelmet = false; // Set helmet status immediately

            // Create a temporary falling helmet sprite at player's position
            const fallingHelmet = this.add.sprite(player.x, player.y - player.displayHeight / 2, 'skater', 27)
                .setOrigin(0.5)
                .setScale(0.75) // Match UI icon scale initially
                .setDepth(player.depth + 1); // Ensure it's on top

            // Animate the falling helmet
            this.tweens.add({
                targets: fallingHelmet,
                y: GAME_HEIGHT + fallingHelmet.displayHeight, // Fall off bottom of screen
                angle: 360 * 2, // Spin twice
                x: player.x + Phaser.Math.Between(-50, 50), // Slight horizontal drift
                duration: 1500, // Duration of fall
                ease: 'Sine.easeIn', // Accelerates downwards
                onComplete: () => {
                    fallingHelmet.destroy(); // Clean up the sprite
                }
            });
            
            // Show "Your helmet cracked..." message, centered on screen
            const helmetMessageDuration = 2000; // 2 seconds
            this.showPointsPopup(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 50, null, "You cracked your HELMET,\nbut not your HEAD!", true, helmetMessageDuration);


            // Flash screen red
            this.cameras.main.flash(150, 255, 0, 0, false); // duration, r, g, b, force

            // Make player flash briefly to indicate invulnerability/hit
            this.tweens.add({
                targets: player,
                alpha: 0.5,
                duration: 100,
                yoyo: true,
                repeat: 3, // Flash 3 times
                onComplete: () => {
                    player.setAlpha(1.0); // Ensure player is fully visible
                }
            });

            // Destroy the obstacle that was hit
            obstacle.destroy();
            return; // Player continues, game does not end
        }

        // --- No Helmet: Proceed with Game Over ---
        // Flash screen red
        this.cameras.main.flash(200, 255, 0, 0, false); // duration, r, g, b, force

        // --- High Score Check (Only on Game Over) ---
        const finalScore = Math.floor(this.score);
        if (finalScore > this.highScore) {
            this.highScore = finalScore; // Update the scene's high score variable
            localStorage.setItem('bladeFreeHighScore', this.highScore); // Save to localStorage
            // The GameOverScene will display this new high score.
            // No need to update GameplayScene's highScoreText here, as the game is ending.
            console.log(`New high score achieved: ${this.highScore}`);
        }

        // Stop the obstacle timer ONLY if game is truly over
        if (this.obstacleTimer) {
            this.obstacleTimer.paused = true;
        }
        this.sound.stopByKey('music');
        this.sound.play('collide'); // Collision sound
        this.sound.play('game_over'); // Play game over sound effect ONLY if no helmet

        // Stop player physics interaction and set collision pose
        this.isFalling = true; // Use this flag to manage animation state
        player.body.enable = false;
        player.setVelocity(0, 0);
        player.setTexture('skater', 11); // Collision pose
        player.setOrigin(0.5, 0.5); // Ensure origin

        const collisionPointX = player.x;
        const collisionPointY = player.y;
        const playerSpriteDepth = player.depth;

        // 1. Create lone dog sprite off-screen and tween it to the player
        const loneDogSprite = this.add.sprite(-player.displayWidth, collisionPointY, 'skater', 20)
            .setOrigin(0.5, 0.5)
            .setDepth(playerSpriteDepth);
        
        // Delay the dog bark sound by 1 second
        this.time.delayedCall(1000, () => {
            this.sound.play('dog_bark', { volume: 0.7 }); // Play dog bark sound
        }, [], this);

        this.tweens.add({
            targets: loneDogSprite,
            x: collisionPointX - player.displayWidth / 2, // Dog arrives next to player's left side
            duration: 700, // Duration for dog to reach player
            ease: 'Power1',
            onComplete: () => {
                // 2. Dog has reached player. Make player and lone dog invisible.
                player.setVisible(false);
                loneDogSprite.destroy(); // Destroy the temporary lone dog

                // 3. Create the composite "dog dragging skater" image
                //    (Dog - SkaterTorso - SkaterLegs)
                const dragDog = this.add.sprite(collisionPointX - player.displayWidth, collisionPointY, 'skater', 20)
                    .setOrigin(0.5, 0.5).setDepth(playerSpriteDepth);
                const dragSkaterMid = this.add.sprite(collisionPointX, collisionPointY, 'skater', 21)
                    .setOrigin(0.5, 0.5).setDepth(playerSpriteDepth);
                const dragSkaterEnd = this.add.sprite(collisionPointX + player.displayWidth, collisionPointY, 'skater', 22)
                    .setOrigin(0.5, 0.5).setDepth(playerSpriteDepth);

                const dragGroup = [dragDog, dragSkaterMid, dragSkaterEnd];

                // 4. Tween the composite image off-screen to the left
                this.tweens.add({
                    targets: dragGroup,
                    x: `-=${GAME_WIDTH + player.displayWidth * 3}`, // Move far enough left
                    duration: 1500, // Duration of the drag
                    ease: 'Linear',
                    onComplete: () => {
                        console.log(`Transitioning to GameOverScene with score: ${finalScore}`);
                        // Clean up the drag group sprites
                        dragGroup.forEach(s => s.destroy());
                        this.scene.start('GameOverScene', { score: finalScore });
                    }
                });
            }
        });
    }

    // --- Ramp Overlap Handling ---
    handleRampOverlap(player, ramp) {
        // Check if the ramp has already been hit
        if (ramp.getData('hit')) {
            return; // Ignore overlap if already hit
        }

        console.log("Ramp overlap detected!");

        // --- Transfer Combo Check ---
        if (this.lastTrickObjectType && (this.time.now - this.timeLastTrickEnded < TRANSFER_COMBO_WINDOW)) {
            let transferPoints = 0;
            let transferMessage = "";
            if (this.lastTrickObjectType === 'ramp') {
                transferPoints = RAMP_TO_RAMP_POINTS;
                transferMessage = "Ramp Transfer!";
                console.log("Ramp to Ramp Transfer!");
            } else if (this.lastTrickObjectType === 'rail') {
                transferPoints = RAIL_TO_RAMP_POINTS;
                transferMessage = "Rail to Ramp Transfer!";
                console.log("Rail to Ramp Transfer!");
            }
            if (transferPoints > 0) {
                this.score += transferPoints;
                this.scoreText.setText(`Score: ${Math.floor(this.score)}`);
                this.showPointsPopup(player.x, player.y - 60, transferPoints, transferMessage, true, 1500); // Show above normal ramp points, duration 1500ms
            }
        }

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
        this.isGrinding = false; // Ensure not grinding when jumping
        player.setVelocityY(-JUMP_VELOCITY);
        this.isJumping = true; // Set jumping flag
        player.anims.stop(); // Stop any current animation before setting texture for 360
        
        // --- 360 Animation ---
        player.setTexture('skater', 9); // Start with frame 9 for first half of jump
        const timeToApexMs = (JUMP_VELOCITY / JUMP_GRAVITY_PULL) * 1000; // Time to reach the peak of the jump

        if (this.jumpAnimationTimer) { // Clear any existing timer
            this.jumpAnimationTimer.remove(false);
        }
        // Switch to frame 17 later in the jump (e.g., at 133% of timeToApex) to make frame 9 visible longer
        const frameSwitchDelay = timeToApexMs * 1.33; 
        this.jumpAnimationTimer = this.time.delayedCall(frameSwitchDelay, () => {
            if (this.player && this.isJumping) { // Check if still jumping
                this.player.setTexture('skater', 17); // Switch to frame 17
            }
        }, [], this);
        
        console.log(`360 Jump initiated! VelocityY: ${player.body.velocity.y}, PlayerY: ${player.y}. Frame 17 in ${frameSwitchDelay}ms.`);
        this.sound.play('jump'); // Play jump sound

        // Don't destroy the ramp, let it scroll off. It's marked as 'hit' now.
        // ramp.destroy();

        // Update last trick info
        this.lastTrickObject = ramp;
        this.lastTrickObjectType = 'ramp';
        this.timeLastTrickEnded = this.time.now; // Mark time of current ramp interaction

        // Set flags for landing the 360 trick
        this.isPerformingRampJump = true;
        this.pointsForCurrentRampJump = rampPoints;
        // The "360" points pop-up will be shown on landing
    }

    // --- Collectible Handling ---
    handleCollect(player, collectible) {
        const frameIndex = collectible.frame.name; // Get the frame index (which is the name property)
        const itemData = this.collectibleData[frameIndex];

        if (!itemData) {
            console.warn(`Collected item with unknown frame index: ${frameIndex}`);
            collectible.destroy();
            return;
        }

        const itemName = itemData.name;
        const collectiblePoints = itemData.points;

        console.log(`${itemName} collected!`);

        // Special handling for helmet (frame 27)
        if (frameIndex == '27') { // Frame index is a string
            if (!this.hasHelmet) {
                this.hasHelmet = true;
                this.updateHelmetIcon();
                this.sound.play('ui_confirm'); // Sound for gaining helmet
                // Don't award points for the first helmet, it's a power-up
                console.log("Helmet acquired! SKULL PROTECTION!");
                // Show "SKULL PROTECTION" in larger letters, centered on screen
                this.showPointsPopup(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 50, null, "SKULL PROTECTION", true); 
            }
            // "Else" case for collecting helmet when already having one is removed
            // because helmets should not spawn if player already has one.
        } else {
            // Award points for other collectibles
            this.score += collectiblePoints;
            this.scoreText.setText(`Score: ${Math.floor(this.score)}`);
            console.log(`+${collectiblePoints} points for ${itemName}!`);
            this.sound.play('collect');
            this.showPointsPopup(player.x, player.y, collectiblePoints, itemName);

            // --- Inventory Collection Logic ---
            // Check if the collected item is part of the defined inventory set
            const itemFrameKey = parseInt(frameIndex, 10); // Ensure frameIndex is a number
            if (this.inventoryItems.includes(itemFrameKey) && !this.playerInventory[itemFrameKey]) {
                this.playerInventory[itemFrameKey] = true;
                if (this.inventoryUIIcons[itemFrameKey]) {
                    this.inventoryUIIcons[itemFrameKey].clearTint().setAlpha(1.0); // Make it look collected
                }
                console.log(`Inventory item ${itemName} (frame ${itemFrameKey}) collected!`);

                if (this.checkInventoryComplete()) {
                    console.log("COLLECTION COMPLETE!");
                    const bonusPoints = 500;
                    this.score += bonusPoints;
                    this.scoreText.setText(`Score: ${Math.floor(this.score)}`);
                    // Center the "COLLECTION COMPLETE!" message on the screen
                    const collectionMessage = "COLLECTION COMPLETE!\n500 Point Bonus!";
                    this.showPointsPopup(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 50, null, collectionMessage, true, 2500);
                    this.sound.play('ui_confirm'); // Placeholder for special bonus sound

                    // Reset inventory for next collection
                    this.resetInventoryDisplay();
                }
            }
        }

        // Destroy the collectible
        collectible.destroy();
    }

    // --- Update Helmet Icon UI ---
    updateHelmetIcon() {
        if (this.helmetIcon) {
            this.helmetIcon.setVisible(this.hasHelmet);
            // Adjust position if scoreText width changes significantly
            const scoreTextWidth = this.scoreText ? this.scoreText.width : 100;
            const helmetIconXOffset = 15 + (this.helmetIcon.displayWidth / 2); // Offset from score text, considering scaled width
            this.helmetIcon.x = GAME_WIDTH - 20 - scoreTextWidth - helmetIconXOffset;
            this.helmetIcon.y = 20 + (this.scoreText ? this.scoreText.height / 2 : 12); // Vertically align with score text
        }
    }

    // --- Show Points Pop-up ---
    showPointsPopup(x, y, points, itemName = null, isSpecialMessage = false, customDuration = null) { // Add customDuration
        // Construct the text string
        let popupText;
        let fontSize = '18px'; // Default font size

        if (isSpecialMessage && itemName) {
            popupText = itemName; // Only the special message
            fontSize = '28px'; // Larger font for special messages
        } else if (itemName) {
            popupText = `${itemName}\n+${points}`; // Item name and points
        } else {
            popupText = `+${points}`; // Just points
        }

        const pointsText = this.add.text(x, y, popupText, {
            fontSize: fontSize,
            fill: '#ffff00', // Yellow for points
            fontFamily: 'Arial',
            align: 'center', // Center align if multiple lines
            stroke: '#000000', // Black stroke for visibility
            strokeThickness: 4
        }).setOrigin(0.5);

        // Determine text color
        let fillColor = '#18ec21'; // Default green color
        if (isSpecialMessage && itemName) {
            if (itemName.includes('HELMET') || itemName.includes('SKULL')) {
                fillColor = '#b234e2'; // Purple/magenta for helmet messages
            } else if (itemName.toLowerCase().includes('transfer')) { // New condition for transfers (case-insensitive)
                fillColor = '#FF8C00'; // Dark Orange for transfers
            } else if (itemName.toLowerCase().includes('collection complete')) {
                 fillColor = '#FFFF00'; // Yellow for collection complete
            }
            // Default to yellow for other special messages if not specified above
            else if (isSpecialMessage) {
                fillColor = '#FFFF00';
            }
        }
        pointsText.setStyle({ fill: fillColor }); // Apply the determined color

        // Make sure popup is rendered on top
        pointsText.setDepth(2); // Higher than player (depth 1)

        // Create a tween to animate the text
        this.tweens.add({
            targets: pointsText,
            y: y - 50, // Move up
            alpha: 0, // Fade out
            duration: customDuration !== null ? customDuration : 800, // Use custom or default duration
            ease: 'Power1',
            onComplete: () => {
                pointsText.destroy(); // Remove text object when tween finishes
            }
        });
    }

    // --- Grind Overlap Handling ---
    handleGrindOverlap(player, grindable) {
        // Called continuously while overlapping

        // If not already grinding, start the grind
        if (!this.isGrinding) {
            if (this.isPerformingRampJump) { // Landed a 360 onto the rail
                this.showPointsPopup(player.x, player.y - 30, this.pointsForCurrentRampJump, "360"); // Show 360 points
                this.isPerformingRampJump = false;
                this.pointsForCurrentRampJump = 0;
            }
            if (this.jumpAnimationTimer) { // Cancel jump animation if landing into a grind
                this.jumpAnimationTimer.remove(false);
                this.jumpAnimationTimer = null;
            }

            // --- Transfer Combo Check ---
            if (this.lastTrickObjectType && (this.time.now - this.timeLastTrickEnded < TRANSFER_COMBO_WINDOW)) {
                let transferPoints = 0;
                let transferMessage = "";
                if (this.lastTrickObjectType === 'ramp') {
                    transferPoints = RAMP_TO_RAIL_POINTS;
                    transferMessage = "Ramp to Rail Transfer!";
                    console.log("Ramp to Rail Transfer!");
                } else if (this.lastTrickObjectType === 'rail') {
                    transferPoints = RAIL_TO_RAIL_POINTS;
                    transferMessage = "Rail Transfer!";
                    console.log("Rail to Rail Transfer!");
                }
                if (transferPoints > 0) {
                    this.score += transferPoints;
                    this.scoreText.setText(`Score: ${Math.floor(this.score)}`);
                    // Display this message slightly differently or ensure it doesn't overlap with grind points
                    this.showPointsPopup(player.x, player.y - 70, transferPoints, transferMessage, true, 1500); // Duration 1500ms
                }
            }

            this.isJumping = false; // Ensure not jumping when grinding
            this.isGrinding = true;
            this.activeGrindable = grindable; // Store reference to the active rail
            
            // Award points for initiating the "Royale Grind"
            const grindStartPoints = 10; 
            this.score += grindStartPoints;
            this.scoreText.setText(`Score: ${Math.floor(this.score)}`);
            // Ephemeral pop-up for "Royale Grind" + points removed.
            // this.showPointsPopup(player.x, player.y - 30, grindStartPoints, "Royale Grind"); 
            console.log("Royale Grind started! +10 points.");

            // Snap player's X position to the center of the rail
            player.x = grindable.x;

            // Snap player's vertical position relative to the BOTTOM of the rail
            // Place player's bottom edge slightly above the rail's bottom edge initially
            const snapOffset = 5; // Pixels above the rail bottom
            player.y = grindable.getBounds().bottom - (player.displayHeight / 2) - snapOffset; // Use displayHeight for visual size

            // Stop vertical movement (important!)
            player.setVelocityY(0);
            this.sound.play('grind_start'); // Play grind start sound

            // Optional: Visual cue for grinding (e.g., tint player)
            // player.setTint(0xffff00); // Yellow tint while grinding

            // Initialize and show grind points display
            this.currentGrindPoints = 0;
            if (!this.grindPointsDisplay) {
                this.grindPointsDisplay = this.add.text(player.x, player.y - 40, `+0`, { // Accumulating points
                    fontSize: '22px', fill: '#00ff00', fontFamily: 'Arial', stroke: '#000000', strokeThickness: 4
                }).setOrigin(0.5).setDepth(2);
            }
            this.grindPointsDisplay.setPosition(player.x, player.y - 40).setText(`+0`).setVisible(true);

            // Create and show persistent "Royale Grind" name text
            if (this.grindNameText) { // Destroy if one somehow exists
                this.grindNameText.destroy();
                this.grindNameText = null; // Explicitly nullify before recreating
            }
            this.grindNameText = this.add.text(player.x, player.y - 65, 'Royale Grind', { // Position above grind points display
                fontSize: '20px', fill: '#00ff00', fontFamily: 'Arial', stroke: '#000000', strokeThickness: 3
            }).setOrigin(0.5).setDepth(2).setVisible(true);

            // Update last trick info
            this.lastTrickObject = grindable;
            this.lastTrickObjectType = 'rail';
            this.timeLastTrickEnded = this.time.now; // Mark time of current grind start
        }

        // Points are awarded in the update loop based on the isGrinding flag
        // No need for continuous snapping here; player moves with the rail due to scroll speed
    }

    // --- End Grind Logic ---
    endGrind() {
        if (this.isGrinding) {
            this.isGrinding = false;
            // activeGrindable is used to update timeLastTrickEnded before being cleared
            console.log("Grind ended.");
            this.sound.play('land'); // Play landing sound (reused from grind end)
            
            if (this.grindPointsDisplay) {
                this.grindPointsDisplay.setVisible(false);
            }
            if (this.grindNameText) {
                this.grindNameText.destroy();
                this.grindNameText = null;
            }
            this.currentGrindPoints = 0; // Reset for next grind

            // Update timeLastTrickEnded to mark the end of this rail interaction
            // lastTrickObject and lastTrickObjectType remain as this rail
            if (this.activeGrindable) { 
                 this.timeLastTrickEnded = this.time.now;
            }
            this.activeGrindable = null; // Clear active rail reference now

            // Optional: Reset player tint if it was changed
            // player.clearTint();
            // Player will naturally fall due to gravity pull logic in update if they jumped off
        }
    }


    update(time, delta) {
        if (this.isPaused) {
            return; // Do nothing if paused
        }
        this.sceneRunningTime += delta; // Accumulate delta for scene-specific timer

        // --- Player Movement ---
        if (!this.player || !this.cursors) {
            return; // Exit if player or cursors aren't ready
        }

        // Game logic (movement, score) now runs continuously while this scene is active.
        // Collision handling transitions away from this scene.

        // --- Player Horizontal Movement (Keyboard) ---
        // Keyboard input overrides touch input if both are active
        let movingHorizontally = false;
        if (this.cursors.left.isDown || this.keyA.isDown) {
            movingHorizontally = true;
            this.player.setVelocityX(-PLAYER_SPEED);
        } else if (this.cursors.right.isDown || this.keyD.isDown) {
            movingHorizontally = true;
            this.player.setVelocityX(PLAYER_SPEED);
        } else {
            // Check touch input if keyboard isn't used
            if (this.input.activePointer.isDown) {
                 if (this.input.activePointer.x < GAME_WIDTH / 2) {
                     this.player.setVelocityX(-PLAYER_SPEED);
                     movingHorizontally = true;
                 } else {
                     this.player.setVelocityX(PLAYER_SPEED);
                     movingHorizontally = true;
                 }
            } else {
                 // No input active
                 this.player.setVelocityX(0);
                 movingHorizontally = false;
            }
        }

        // Hide mobile prompts if player starts moving and prompts are visible
        if (movingHorizontally && (this.leftPromptText || this.rightPromptText || this.leftPromptArrow || this.rightPromptArrow)) {
            this.hideMobilePrompts();
        }

        // --- Player Animation Control ---
        // Set animation based on state priority: falling > grinding > jumping > landing > skating
        if (this.isFalling) {
            // Fall animation is started in handleCollision. Ensure it continues if needed.
            if (this.player.anims.currentAnim?.key !== 'fall') {
                console.log("WARN: Fall animation was interrupted, restarting.");
                this.player.play('fall');
            }
        } else if (this.isGrinding) { // Check grinding next
            this.player.anims.stop(); // Explicitly stop previous animation
            // Direct frame setting for grinding
            this.player.setTexture('skater', 16); // Directly set to frame 16 for grinding
            // Keep player centered on the active rail
            if (this.activeGrindable) {
                this.player.x = this.activeGrindable.x;
            }
        } else if (this.isJumping) { 
            // Animation (frames 9 and 17) is handled by handleRampOverlap and its delayedCall.
            // No specific animation call needed here for the 360 jump.
            // If other types of jumps are added later, their animation logic might go here.
        } else {
            // On the ground, not falling or grinding or jumping
            // Check if landing animation is still playing
            if (this.player.anims.currentAnim?.key === 'jump-landing' && this.player.anims.isPlaying) {
                // Letting jump-landing animation finish
            } else {
                // Otherwise, play skate cycle
                // Play skating animation
                this.player.play('skate-cycle', true);
            }
        }

        // --- Score Increment ---
        if (this.isGrinding) {
            // Award points faster while grinding (e.g., 30 points per second)
            const grindPointsPerSecond = 30;
            const pointsThisFrame = (grindPointsPerSecond * delta) / 1000;
            this.score += pointsThisFrame;
            this.currentGrindPoints += pointsThisFrame;
            
            if (this.grindPointsDisplay && this.grindPointsDisplay.visible) {
                this.grindPointsDisplay.setText(`+${Math.floor(this.currentGrindPoints)}`);
                this.grindPointsDisplay.setPosition(this.player.x, this.player.y - 40); 
            }
            if (this.grindNameText && this.grindNameText.visible) {
                this.grindNameText.setPosition(this.player.x, this.player.y - 65); // Keep it above player and grind points
            }
        }
        // Removed the 'else' block that awarded points for survival time.
        this.scoreText.setText(`Score: ${Math.floor(this.score)}`);
        this.updateHelmetIcon(); // Update helmet icon position if score text width changes

        // --- Update Elapsed Time Display ---
        if (this.elapsedTimeText) {
            // this.sceneRunningTime is accumulated in the main update loop if not paused
            const totalSeconds = Math.floor(this.sceneRunningTime / 1000);
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;
            this.elapsedTimeText.setText(`Time: ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
        }

        // --- Difficulty Scaling: Spawn Rate ---
        const currentScoreTier = Math.floor(this.score / 700) * 700; // Changed interval to 700
        if (currentScoreTier > this.lastScoreThresholdForSpawnDelay && this.obstacleTimer) {
            const numIncrements = (currentScoreTier - this.lastScoreThresholdForSpawnDelay) / 700; // Changed interval to 700
            let newDelay = this.obstacleTimer.delay;
            for (let i = 0; i < numIncrements; i++) {
                newDelay -= SPAWN_DELAY_REDUCTION_PER_1000_PTS;
            }
            newDelay = Math.max(newDelay, MIN_OBSTACLE_SPAWN_DELAY);

            if (newDelay !== this.obstacleTimer.delay) {
                this.obstacleTimer.delay = newDelay;
                console.log(`Score reached ${currentScoreTier}. Obstacle spawn delay reduced to: ${this.obstacleTimer.delay}ms`);
            }
            this.lastScoreThresholdForSpawnDelay = currentScoreTier;
        }


        // --- Grind End Check ---
        // If currently grinding, check if still overlapping a grindable
        if (this.isGrinding) {
            let stillTouchingGrindable = false;
            // Check physics world for overlaps between player and any grindable
            this.physics.overlap(this.player, this.grindables, () => {
                stillTouchingGrindable = true;
            });

            if (!stillTouchingGrindable) {
                this.endGrind();
            }
        }


        // --- Player Vertical Movement (Post-Jump / Post-Grind) ---
        // Apply gravity pull if player is airborne (jumping or falling after grind) and not grinding
        if (!this.isGrinding && this.player.y < PLAYER_START_Y) {
            // Apply a downward acceleration to simulate gravity pulling them back
            this.player.body.velocity.y += JUMP_GRAVITY_PULL * (delta / 1000);
        }

        // Check for landing after a jump
        // Condition: Player was jumping AND is now at/below ground level AND moving downwards (or stopped at ground)
        if (this.isJumping && this.player.y >= PLAYER_START_Y && this.player.body.velocity.y >= 0) {
            console.log(`Landed after jump. Snapping player Y from ${this.player.y} to ${PLAYER_START_Y}, VelocityY: ${this.player.body.velocity.y}`);
            this.player.setVelocityY(0);
            this.player.setY(PLAYER_START_Y); // Snap back exactly to the start line
            this.sound.play('land'); // Play landing sound
            this.isJumping = false; // Reset jumping flag
            
            if (this.isPerformingRampJump) { // Landed a 360 on the ground
                this.showPointsPopup(this.player.x, this.player.y - 30, this.pointsForCurrentRampJump, "360");
                this.isPerformingRampJump = false;
                this.pointsForCurrentRampJump = 0;
            }

            if (this.jumpAnimationTimer) { // Cancel timer if it's still pending
                this.jumpAnimationTimer.remove(false);
                this.jumpAnimationTimer = null;
            }

            // If landed on ground (not a ramp or rail which would set their own lastTrickObject/Type),
            // then the combo chain is broken.
            // Check if player is currently overlapping a ramp or grindable.
            // If not, they landed on plain ground.
            let onTrickElement = false;
            // Temporarily enable player body for overlap check if it was disabled by collision
            const playerBodyWasEnabled = this.player.body.enable;
            if (!playerBodyWasEnabled) this.player.body.setEnable(true);

            this.physics.overlap(this.player, this.ramps, () => { onTrickElement = true; });
            if (!onTrickElement) {
                this.physics.overlap(this.player, this.grindables, () => { onTrickElement = true; });
            }
            
            if (!playerBodyWasEnabled) this.player.body.setEnable(false); // Restore body state


            if (!onTrickElement) {
                console.log("Landed on ground, combo chain broken.");
                this.lastTrickObject = null;
                this.lastTrickObjectType = null;
                // timeLastTrickEnded is not reset here, it holds the time of the last actual trick.
            }
            
            // Play landing animation (will transition back to skate in animationcomplete listener)
            this.player.play('jump-landing', true);
        }
        // Ensure player doesn't get stuck slightly below the line if not jumping/grinding
        else if (!this.isJumping && !this.isGrinding && this.player.y > PLAYER_START_Y) {
             this.player.setY(PLAYER_START_Y);
             this.player.setVelocityY(0);
        }


        // --- Scrolling (Placeholder) ---
        // The world/obstacles will move upwards in later phases.
        // The player's Y position remains fixed for now, unless jumping.

        // --- Obstacle Horizontal Movement & Edge Reversal ---
        this.obstacles.children.each(obstacle => {
            if (obstacle && obstacle.body) {
                // Check left boundary
                if (obstacle.body.velocity.x < 0 && obstacle.x < obstacle.displayWidth / 2) {
                    obstacle.body.velocity.x *= -1; // Reverse horizontal direction
                    obstacle.x = obstacle.displayWidth / 2 + 1; // Prevent getting stuck
                }
                // Check right boundary
                else if (obstacle.body.velocity.x > 0 && obstacle.x > GAME_WIDTH - obstacle.displayWidth / 2) {
                    obstacle.body.velocity.x *= -1; // Reverse horizontal direction
                    obstacle.x = GAME_WIDTH - obstacle.displayWidth / 2 - 1; // Prevent getting stuck
                }
            }
        });

        // --- Obstacle, Ramp, Grindable & Collectible Cleanup ---
        // Check items in all groups and destroy them if they go off-screen below
        // Static overlays (bladeFreeOverlay, royskatesOverlay) do not scroll and don't need cleanup here.
        [this.obstacles, this.ramps, this.grindables, this.collectibles].forEach(group => {
            if (group) { // Ensure group exists
                group.children.each(item => {
                    // Check if item exists and has a body (and isn't already marked for destruction)
                    if (item && item.body && item.y > GAME_HEIGHT + item.displayHeight) { // Use displayHeight for accurate check
                        // Log texture key and frame if available
                        const itemInfo = item.frame ? `${item.texture.key} (frame ${item.frame.name})` : item.texture.key;
                        console.log(`Destroying off-screen ${itemInfo}`);
                        group.remove(item, true, true); // Remove from group, destroy sprite & body
                    }
                });
            }
        });
    }
}


// --- Game Over Scene ---
class GameOverScene extends Phaser.Scene {
    constructor() {
        super('GameOverScene');
        this.finalScore = 0;
        this.highScore = 0;
        this.isShowingResetConfirmation = false;
        this.confirmationBg = null;
        this.confirmationText = null;
        this.yesButton = null;
        this.noButton = null;
        this.resetDot = null;
        this.versionText = null; // For displaying game version
        // Copyright text will be split into multiple parts for the link
        this.copyrightPrefixText = null;
        this.copyrightLinkText = null;
        this.copyrightSuffixText = null;
        this.muteButton = null; // Mute button
    }

    preload() {
        // Load UI confirmation sound if needed for restart button
        this.load.audio('ui_confirm', 'assets/audio/ui_confirm.mp3');
        // Load music for game over screen (can be same as start screen)
        this.load.audio('start_music', 'assets/audio/start_music.mp3');
        // Load game over background image
        this.load.image('game_over_bg', 'assets/graphics/end.png');
        // Load spray can rattle sound
        this.load.audio('spray_can_rattle', 'assets/audio/spray_can_rattle.mp3');
        // Load spray sound
        this.load.audio('spray', 'assets/audio/spray.mp3');
        // Load "Later Blader" image
        this.load.image('later_blader_img', 'assets/graphics/later_blader.png');
        // Game over sound is loaded by GameplayScene before transition
    }

    // Receive data from the scene that started this one (GameplayScene)
    init(data) {
        this.finalScore = data.score || 0; // Get score passed from GameplayScene
        console.log(`GameOverScene received score: ${this.finalScore}`);
    }

    create() {
        // Add the game over background image
        this.gameOverBackgroundImage = this.add.image(0, 0, 'game_over_bg').setOrigin(0,0);
        // No setBackgroundColor needed

        // Play game over screen music
        this.sound.play('start_music', { loop: true, volume: 0.4 }); // Adjust volume as needed
        
        // Play spray can rattle sound once
        const rattleSound = this.sound.add('spray_can_rattle', { volume: 0.6 });
        rattleSound.play();

        // Play spray sound after rattle sound completes
        rattleSound.once('complete', () => {
            this.sound.play('spray', { volume: 0.5 }); // Adjust volume as needed
        });
        
        // Load high score
        this.highScore = localStorage.getItem('bladeFreeHighScore') || 0;

        // "GAME OVER" text is now part of the background image.

        // Final Score Text - Positioned lower on the screen
        const scoreYPosition = GAME_HEIGHT * 0.65; // Adjust as needed
        // this.add.text(GAME_WIDTH / 2, scoreYPosition, `Your Score: ${this.finalScore}`, { // Removed duplicate
        //     fontSize: '32px',
        //     fill: '#FFFFFF', // White for better contrast on the new bg
        //     fontFamily: 'Arial',
        //     stroke: '#000000',
        //     strokeThickness: 5
        // }).setOrigin(0.5);

        // High Score Text - Positioned below final score
        // this.add.text(GAME_WIDTH / 2, scoreYPosition + 50, `High Score: ${this.highScore}`, { // Removed duplicate
        //     fontSize: '32px',
        //     fill: '#FFFFFF',
        //     fontFamily: 'Arial',
        //     stroke: '#000000',
        //     strokeThickness: 5
        // }).setOrigin(0.5);

        // Restart Text - Positioned further down
        // this.add.text(GAME_WIDTH / 2, scoreYPosition + 120, 'Press R to Restart', { // Removed duplicate
        //     fontSize: '28px',
        //     fill: '#FFFF00', // Yellow for emphasis
        //     fontFamily: 'Arial',
        //     stroke: '#000000',
        //     strokeThickness: 5
        // }).setOrigin(0.5);

        // Quit Text
        this.quitText = this.add.text(GAME_WIDTH / 2, scoreYPosition + 170, 'Press Q to Quit', {
            fontSize: '24px',
            fill: '#FFA500', // Orange for quit
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);


        // Store references to text elements to hide them later
        this.scoreTextDisplay = this.add.text(GAME_WIDTH / 2, scoreYPosition, `Your Score: ${this.finalScore}`, {
            fontSize: '32px', fill: '#FFFFFF', fontFamily: 'Arial', stroke: '#000000', strokeThickness: 5
        }).setOrigin(0.5);
        this.highScoreTextDisplay = this.add.text(GAME_WIDTH / 2, scoreYPosition + 50, `High Score: ${this.highScore}`, {
            fontSize: '32px', fill: '#FFFFFF', fontFamily: 'Arial', stroke: '#000000', strokeThickness: 5
        }).setOrigin(0.5);
        // this.restartTextDisplay = this.add.text(GAME_WIDTH / 2, scoreYPosition + 120, 'Press R to Restart', {
        //     fontSize: '28px', fill: '#FFFF00', fontFamily: 'Arial', stroke: '#000000', strokeThickness: 5
        // }).setOrigin(0.5); // Will be replaced by a button


        // --- Button Actions ---
        const performRestart = () => {
            if (this.isShowingResetConfirmation) return;
            if (!this.laterBladerImage || !this.laterBladerImage.visible) {
                this.sound.play('ui_confirm');
                this.sound.stopByKey('start_music');
                this.scene.start('GameplayScene');
            }
        };

        const performQuit = () => {
            if (this.isShowingResetConfirmation) return;
            if (this.laterBladerImage && this.laterBladerImage.visible) return;

            this.sound.stopAll();
            if (this.gameOverBackgroundImage) {
                this.gameOverBackgroundImage.setVisible(false);
            }
            this.cameras.main.setBackgroundColor('#000000');
            this.scoreTextDisplay.setVisible(false);
            this.highScoreTextDisplay.setVisible(false);
            this.restartButton.setVisible(false); 
            this.quitButton.setVisible(false); 
            if (this.muteButton) this.muteButton.setVisible(false); // Hide mute button during quit sequence
            if (this.resetDot) this.resetDot.setVisible(false); // Also hide reset dot

            this.laterBladerImage = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'later_blader_img')
                .setOrigin(0.5)
                .setScale(0.01)
                .setAngle(0);

            this.tweens.add({
                targets: this.laterBladerImage,
                scale: 1,
                angle: 360 * 3,
                duration: 1500,
                ease: 'Cubic.easeOut',
                onComplete: () => {
                    console.log("Later Blader animation complete.");
                    this.time.delayedCall(2000, () => {
                        this.scene.start('StartScene');
                    }, [], this);
                }
            });
        };

        // --- Restart Button (Lower Left) ---
        const buttonPadding = 30; // Padding from screen edges
        this.restartButton = this.add.text(buttonPadding, GAME_HEIGHT - buttonPadding, 'RESTART', {
            fontSize: '32px', fill: '#00FF00', fontFamily: 'Arial', stroke: '#000000', strokeThickness: 5,
            backgroundColor: '#333333', padding: { left: 15, right: 15, top: 10, bottom: 10 }
        }).setOrigin(0, 1).setInteractive({ useHandCursor: true }); // Origin bottom-left
        
        this.restartButton.on('pointerdown', performRestart);
        this.restartButton.on('pointerover', () => this.restartButton.setStyle({ fill: '#80FF80' }));
        this.restartButton.on('pointerout', () => this.restartButton.setStyle({ fill: '#00FF00' }));


        // --- Quit Button (Lower Right) ---
        this.quitButton = this.add.text(GAME_WIDTH - buttonPadding, GAME_HEIGHT - buttonPadding, 'QUIT', {
            fontSize: '32px', fill: '#b234e2', fontFamily: 'Arial', stroke: '#000000', strokeThickness: 5, // New color
            backgroundColor: '#333333', padding: { left: 15, right: 15, top: 10, bottom: 10 }
        }).setOrigin(1, 1).setInteractive({ useHandCursor: true }); // Origin bottom-right

        this.quitButton.on('pointerdown', performQuit);
        this.quitButton.on('pointerover', () => this.quitButton.setStyle({ fill: '#d154f2' })); // Lighter purple/magenta for hover
        this.quitButton.on('pointerout', () => this.quitButton.setStyle({ fill: '#b234e2' })); // Restore original new color


        // Listen for 'R' key press to restart
        this.input.keyboard.on('keydown-R', performRestart);

        // Listen for 'Q' key press to quit
        this.input.keyboard.on('keydown-Q', performQuit);

        // Hide the old text prompts if they were separate
        if(this.restartTextDisplay) this.restartTextDisplay.setVisible(false); // Hide old text if it exists
        if(this.quitText) this.quitText.setVisible(false); // Hide old text if it exists

        // --- Secret High Score Reset ---
        this.input.keyboard.on('keydown-DELETE', (event) => {
            if (this.isShowingResetConfirmation) return; // Don't allow if confirmation is up
            if (event.shiftKey) { // Check if Shift key is also held down
                console.log("Secret High Score Reset Activated!");
                localStorage.setItem('bladeFreeHighScore', '0');
                this.highScore = 0;
                if (this.highScoreTextDisplay) {
                    this.highScoreTextDisplay.setText(`High Score: ${this.highScore}`);
                }
                // Optional: Add a visual confirmation like a brief text popup
                const resetConfirmText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 80, 'High Score Reset!', {
                    fontSize: '18px', fill: '#ff0000', fontFamily: 'Arial'
                }).setOrigin(0.5);
                this.time.delayedCall(1500, () => { resetConfirmText.destroy(); });
            }
        });

        // --- Mobile High Score Reset Dot ---
        this.resetDot = this.add.graphics();
        this.resetDot.fillStyle(0xb234e2, 1); // Purple color
        this.resetDot.fillCircle(GAME_WIDTH - 15, 15, 7); // x, y, radius (made smaller and adjusted position slightly)
        this.resetDot.setInteractive(new Phaser.Geom.Circle(GAME_WIDTH - 15, 15, 7), Phaser.Geom.Circle.Contains);
        this.resetDot.setDepth(10); // Ensure it's on top

        this.resetDot.on('pointerdown', () => {
            if (this.isShowingResetConfirmation) return;
            this.showResetConfirmation();
        });

        // Mute Button for GameOverScene
        const muteButtonPaddingGameOver = 20;
        const initialMuteTextGameOver = this.sound.mute ? 'Unmute' : 'Mute';
        this.muteButton = this.add.text(
            GAME_WIDTH - muteButtonPaddingGameOver, 
            GAME_HEIGHT - muteButtonPaddingGameOver, 
            initialMuteTextGameOver, 
            { 
                fontSize: '18px', 
                fill: '#fff', 
                fontFamily: 'Arial',
                backgroundColor: '#00000080',
                padding: { x: 8, y: 4 }
            }
        )
        .setOrigin(1, 1)
        .setDepth(100) // Ensure it's on top, even above confirmation screen elements if needed
        .setInteractive({ useHandCursor: true });

        this.muteButton.on('pointerdown', () => {
            this.sound.mute = !this.sound.mute;
            this.muteButton.setText(this.sound.mute ? 'Unmute' : 'Mute');
            if (!this.sound.mute) {
                this.sound.play('ui_confirm', { volume: 0.3 });
            }
        });
        // Ensure mute button is hidden during "Later Blader" sequence
        // and restored if that sequence is interrupted or not active.
        // This will be handled by the quit logic that hides other buttons.


        console.log("GameOverScene created");
    }

    showResetConfirmation() {
        this.isShowingResetConfirmation = true;

        // Hide main game over elements
        if (this.gameOverBackgroundImage) this.gameOverBackgroundImage.setVisible(false);
        this.scoreTextDisplay.setVisible(false);
        this.highScoreTextDisplay.setVisible(false);
        this.restartButton.setVisible(false);
        this.quitButton.setVisible(false);
        this.resetDot.setVisible(false); // Hide the dot itself

        // Show confirmation screen background (using title.png)
        this.confirmationBg = this.add.image(0, 0, 'title_image').setOrigin(0,0).setDepth(19); // High depth

        // YES Button
        const buttonYPosition = GAME_HEIGHT * 0.7; // Position buttons lower
        this.yesButton = this.add.text(GAME_WIDTH / 2 - 100, buttonYPosition, 'YES', {
            fontSize: '40px', fill: '#00FF00', fontFamily: 'Arial', stroke: '#000000', strokeThickness: 5,
            backgroundColor: '#333333', padding: { left: 20, right: 20, top: 10, bottom: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(20);

        this.yesButton.on('pointerdown', () => {
            localStorage.setItem('bladeFreeHighScore', '0');
            this.highScore = 0;
            if (this.highScoreTextDisplay) { // Update the (currently hidden) display
                this.highScoreTextDisplay.setText(`High Score: ${this.highScore}`);
            }
            this.hideResetConfirmation(true); // Pass true to show reset message
        });

        // NO Button
        this.noButton = this.add.text(GAME_WIDTH / 2 + 100, buttonYPosition, 'NO', {
            fontSize: '40px', fill: '#FF0000', fontFamily: 'Arial', stroke: '#000000', strokeThickness: 5,
            backgroundColor: '#333333', padding: { left: 20, right: 20, top: 10, bottom: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(20);
        
        // Confirmation Text (now below buttons)
        this.confirmationText = this.add.text(GAME_WIDTH / 2, buttonYPosition + 80, 'Reset High Score?', {
            fontSize: '32px', fill: '#FFFF00', fontFamily: 'Arial', stroke: '#000000', strokeThickness: 6
        }).setOrigin(0.5).setDepth(20);

        this.noButton.on('pointerdown', () => {
            this.hideResetConfirmation(false);
        });

        // Add Version and Copyright Text
        const bottomPadding = 20;
        const infoTextStyle = {
            fontSize: '14px',
            fill: '#cccccc', // Light gray
            fontFamily: 'Arial',
            align: 'center'
        };

        this.versionText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - bottomPadding - 20, `Version: ${GAME_VERSION}`, infoTextStyle)
            .setOrigin(0.5, 1) // Anchor bottom-center
            .setDepth(20);

        // Copyright Text with Link
        const copyrightFullString = "Copyright 2025 royskates.com (GNU GPL v2)";
        const linkPart = "royskates.com";
        const prefixPart = copyrightFullString.substring(0, copyrightFullString.indexOf(linkPart));
        const suffixPart = copyrightFullString.substring(copyrightFullString.indexOf(linkPart) + linkPart.length);

        const linkTextStyle = { ...infoTextStyle, fill: '#66ccff', fontStyle: 'italic' }; // Blueish, italic for link

        // Calculate total width for centering
        let tempPrefix = this.add.text(0, 0, prefixPart, infoTextStyle).setVisible(false);
        let tempLink = this.add.text(0, 0, linkPart, linkTextStyle).setVisible(false);
        let tempSuffix = this.add.text(0, 0, suffixPart, infoTextStyle).setVisible(false);
        const totalCopyrightWidth = tempPrefix.width + tempLink.width + tempSuffix.width;
        tempPrefix.destroy();
        tempLink.destroy();
        tempSuffix.destroy();

        const copyrightY = GAME_HEIGHT - bottomPadding;
        let currentX = (GAME_WIDTH - totalCopyrightWidth) / 2;

        this.copyrightPrefixText = this.add.text(currentX, copyrightY, prefixPart, infoTextStyle)
            .setOrigin(0, 1).setDepth(20);
        
        currentX += this.copyrightPrefixText.width;

        this.copyrightLinkText = this.add.text(currentX, copyrightY, linkPart, linkTextStyle)
            .setOrigin(0, 1).setDepth(20).setInteractive({ useHandCursor: true });
        
        this.copyrightLinkText.on('pointerdown', () => {
            window.open('https://royskates.com', '_blank');
        });
        // Add underline effect for the link part using a graphics object
        const line = this.add.graphics({ lineStyle: { width: 1, color: 0x66ccff } }).setDepth(20);
        line.beginPath();
        line.moveTo(this.copyrightLinkText.x, this.copyrightLinkText.y -1); // Position slightly above baseline
        line.lineTo(this.copyrightLinkText.x + this.copyrightLinkText.width, this.copyrightLinkText.y -1);
        line.strokePath();
        // Store the line with the link text to clean it up
        this.copyrightLinkText.setData('underline', line);


        currentX += this.copyrightLinkText.width;

        this.copyrightSuffixText = this.add.text(currentX, copyrightY, suffixPart, infoTextStyle)
            .setOrigin(0, 1).setDepth(20);
    }

    hideResetConfirmation(didReset) {
        this.isShowingResetConfirmation = false;

        // Hide confirmation elements
        if (this.confirmationBg) this.confirmationBg.destroy();
        if (this.confirmationText) this.confirmationText.destroy();
        if (this.yesButton) this.yesButton.destroy();
        if (this.noButton) this.noButton.destroy();
        if (this.versionText) this.versionText.destroy(); 
        
        // Destroy copyright text parts
        if (this.copyrightPrefixText) this.copyrightPrefixText.destroy();
        if (this.copyrightLinkText) {
            const underline = this.copyrightLinkText.getData('underline');
            if (underline) underline.destroy();
            this.copyrightLinkText.destroy();
        }
        if (this.copyrightSuffixText) this.copyrightSuffixText.destroy();

        this.confirmationBg = null;
        this.confirmationText = null;
        this.yesButton = null;
        this.noButton = null;
        this.versionText = null;
        this.copyrightPrefixText = null;
        this.copyrightLinkText = null;
        this.copyrightSuffixText = null;


        // Restore main game over elements
        if (this.gameOverBackgroundImage) this.gameOverBackgroundImage.setVisible(true);
        this.scoreTextDisplay.setVisible(true);
        this.highScoreTextDisplay.setVisible(true); // Will show updated score if reset
        this.restartButton.setVisible(true);
        this.quitButton.setVisible(true);
        this.resetDot.setVisible(true);
        if (this.muteButton) this.muteButton.setVisible(true); // Restore mute button

        if (didReset) {
            const resetConfirmText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 80, 'High Score Reset!', {
                fontSize: '18px', fill: '#ff0000', fontFamily: 'Arial'
            }).setOrigin(0.5).setDepth(20);
            this.time.delayedCall(1500, () => { resetConfirmText.destroy(); });
        }
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
