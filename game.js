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

    preload() {
        // Load UI confirmation sound
        this.load.audio('ui_confirm', 'assets/audio/ui_confirm.mp3');
        // Load start screen music
        this.load.audio('start_music', 'assets/audio/start_music.mp3');
    }

    create() {
        // Set the background color to a dark gray
        this.cameras.main.setBackgroundColor('#A9A9A9'); // Dark gray
        
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

        // Play start screen music
        this.sound.play('start_music', { loop: true, volume: 0.4 }); // Adjust volume as needed

        // Function to start the game and play sound
        const startGame = () => {
            this.sound.play('ui_confirm');
            this.sound.stopByKey('start_music'); // Stop start music before transitioning
            this.scene.start('GameplayScene');
        };

        // Listen for ANY key press to start (for debugging)
        this.input.keyboard.once('keydown', startGame);
        // this.input.keyboard.once('keydown-LEFT', startGame);
        // this.input.keyboard.once('keydown-RIGHT', startGame);
        // this.input.keyboard.once('keydown-UP', startGame); // Also allow Up/Down if desired
        // this.input.keyboard.once('keydown-DOWN', startGame);


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
        this.highScore = 0;         // Highest score achieved
        this.scoreText = null;      // Text object for current score
        this.highScoreText = null;  // Text object for high score
        this.hasHelmet = false;     // Flag for helmet power-up
        this.helmetIcon = null;     // UI icon for helmet status
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

        // --- Obstacle Placeholder ---
        // Obstacles will now use frames from the 'skater' spritesheet.
        // No separate placeholder texture needed.

        // --- Ramp Placeholder ---
        // Create a simple blue rectangle placeholder for ramps
        let graphics = this.make.graphics({ fillStyle: { color: 0x0000ff } }); // Blue color
        graphics.fillRect(0, 0, 80, 20); // 80 wide, 20 high rectangle
        graphics.generateTexture('ramp_placeholder', 80, 20);
        graphics.destroy();

        // --- Grindable Placeholder ---
        // Create a simple black rectangle placeholder for rails/ledges (vertically oriented)
        graphics = this.make.graphics({ fillStyle: { color: 0x000000 } }); // Black color
        const grindableWidth = 15; // Thin rail
        const grindableHeight = 250; // Long rail
        graphics.fillRect(0, 0, grindableWidth, grindableHeight);
        graphics.generateTexture('grindable_placeholder', grindableWidth, grindableHeight);
        graphics.destroy();

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
        // Using 'collide' as placeholder for 'helmet_break' sound for now
        // this.load.audio('helmet_break', 'assets/audio/helmet_break.mp3');


        console.log("Assets preloaded");
    }

    create() {
        console.log("GameplayScene create started");
        
        // Set the background color to a dark gray
        this.cameras.main.setBackgroundColor('#A9A9A9'); // Dark gray

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
        }).setOrigin(1, 0); // Anchor to top-right

        // High Score Text (Top Left)
        // Ensure we display the loaded high score as an integer
        this.highScoreText = this.add.text(20, 20, `High Score: ${Math.floor(this.highScore)}`, {
            fontSize: '24px',
            fill: '#fff',
            fontFamily: 'Arial',
            align: 'left'
        }).setOrigin(0, 0); // Anchor to top-left

        // Helmet UI Icon (next to score)
        // Using frame 27 (helmet collectible) as the icon. Scale it down.
        this.helmetIcon = this.add.sprite(GAME_WIDTH - 20 - this.scoreText.width - 10, 20 + 12, 'skater', 27)
            .setOrigin(1, 0.5) // Align to the right of its position, vertically centered with score text
            .setScale(0.75)
            .setVisible(false) // Initially hidden
            .setDepth(1);


        // Reset score
        this.score = 0;
        this.scoreText.setText('Score: 0'); // Update display too

        // Reset player appearance and state if restarting
        this.player.setAlpha(1.0); // Make player fully visible
        this.player.setVelocity(0, 0); // Ensure player starts stationary
        this.isFalling = false; // Reset falling state on restart
        this.hasHelmet = false; // Reset helmet status
        this.updateHelmetIcon(); // Update UI

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

        // Clear any existing obstacles, ramps, grindables, collectibles if restarting
        this.obstacles.clear(true, true);
        this.ramps.clear(true, true);
        this.grindables.clear(true, true);
        this.collectibles.clear(true, true);

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
            if (!this.isGrinding && !this.isJumping && !this.isFalling) {
                console.log("Transitioning from landing to skate-cycle");
                this.player.play('skate-cycle', true);
            }
        }, this);


        console.log("GameplayScene create/reset finished");
    }

    // --- Obstacle/Ramp/Grindable/Collectible Spawning ---
    spawnObstacle() {
        // Decide what to spawn: 50% obstacle, 15% ramp, 15% grindable, 20% collectible
        const rand = Phaser.Math.Between(1, 100);
        let spawnType = 'obstacle'; // Default
        if (rand <= 15) { // 1-15
            spawnType = 'ramp';
        } else if (rand <= 30) { // 16-30
            spawnType = 'grindable';
        } else if (rand <= 50) { // 31-50
             spawnType = 'collectible';
        }
        // else: 51-100 remains 'obstacle'

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
        } else if (spawnType === 'grindable') {
            itemKey = 'grindable_placeholder';
            group = this.grindables;
            // Ensure grindables don't spawn too close to the edge
            const grindableWidth = 15; // Match new placeholder width
            const safeSpawnX = Phaser.Math.Clamp(spawnX, grindableWidth / 2 + spawnPadding, GAME_WIDTH - grindableWidth / 2 - spawnPadding); // Add padding
            spawnedItem = group.create(safeSpawnX, spawnY, itemKey);
            console.log(`Grindable spawned at (${safeSpawnX}, ${spawnY})`);
        } else if (spawnType === 'collectible') {
            itemKey = 'skater'; // Use the main spritesheet
            group = this.collectibles;
            // Randomly select a collectible frame index (24-31)
            const collectibleFrames = [24, 25, 26, 27, 28, 29, 30, 31];
            const randomFrame = Phaser.Utils.Array.GetRandom(collectibleFrames);
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

        } else {
            console.error(`Failed to create ${spawnType} sprite.`);
        }
    }

    // --- Collision Handling ---
    handleCollision(player, obstacle) {
        console.log("Collision detected!");

        // Stop obstacle spawning
        // player.setAlpha(0.5); // Remove transparency, rely on animation
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
            // this.obstacleTimer.paused = true; // Don't pause if helmet protects
        }

        // --- Helmet Protection Check ---
        if (this.hasHelmet) {
            this.hasHelmet = false;
            this.updateHelmetIcon();
            this.sound.play('collide'); // Placeholder for "helmet_break" sound
            console.log("Helmet protected player! Lost helmet.");

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
        if (this.obstacleTimer) { // Pause timer if game is truly over
            this.obstacleTimer.paused = true;
        }
        this.sound.stopByKey('music');
        this.sound.play('collide');
        this.sound.play('game_over'); // Play game over sound effect

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
        // Play airborne animation immediately (takeoff is implicit)
        player.play('jump-airborne', true);
        console.log(`Jump initiated! VelocityY: ${player.body.velocity.y}, PlayerY: ${player.y}`);
        this.sound.play('jump'); // Play jump sound

        // Don't destroy the ramp, let it scroll off. It's marked as 'hit' now.
        // ramp.destroy();

        // Show points pop-up
        this.showPointsPopup(player.x, player.y - 30, rampPoints);
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
                console.log("Helmet acquired!");
                this.showPointsPopup(player.x, player.y, 0, "Helmet!"); // Show "Helmet!" with 0 points
            } else {
                // Already have a helmet, award points instead
                this.score += collectiblePoints;
                this.scoreText.setText(`Score: ${Math.floor(this.score)}`);
                console.log(`+${collectiblePoints} points for extra ${itemName}!`);
                this.sound.play('collect');
                this.showPointsPopup(player.x, player.y, collectiblePoints, `Extra ${itemName}`);
            }
        } else {
            // Award points for other collectibles
            this.score += collectiblePoints;
            this.scoreText.setText(`Score: ${Math.floor(this.score)}`);
            console.log(`+${collectiblePoints} points for ${itemName}!`);
            this.sound.play('collect');
            this.showPointsPopup(player.x, player.y, collectiblePoints, itemName);
        }

        // Destroy the collectible
        collectible.destroy();
    }

    // --- Update Helmet Icon UI ---
    updateHelmetIcon() {
        if (this.helmetIcon) {
            this.helmetIcon.setVisible(this.hasHelmet);
            // Adjust position if scoreText width changes significantly (optional refinement)
            this.helmetIcon.x = GAME_WIDTH - 20 - (this.scoreText ? this.scoreText.width : 100) - 25; // Reposition based on score text width
            this.helmetIcon.y = 20 + (this.scoreText ? this.scoreText.height / 2 : 12);
        }
    }

    // --- Show Points Pop-up ---
    showPointsPopup(x, y, points, itemName = null) { // Add itemName parameter
        // Construct the text string
        let popupText = `+${points}`;
        if (itemName) {
            popupText = `${itemName}\n+${points}`; // Add item name on a new line
        }

        const pointsText = this.add.text(x, y, popupText, {
            fontSize: '18px', // Slightly smaller to fit name
            fill: '#ffff00', // Yellow for points
            fontFamily: 'Arial',
            align: 'center', // Center align if multiple lines
            stroke: '#000000', // Black stroke for visibility
            strokeThickness: 4
        }).setOrigin(0.5);

        // Make sure popup is rendered on top
        pointsText.setDepth(2); // Higher than player (depth 1)

        // Create a tween to animate the text
        this.tweens.add({
            targets: pointsText,
            y: y - 50, // Move up
            alpha: 0, // Fade out
            duration: 800, // Duration in milliseconds
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
            this.isJumping = false; // Ensure not jumping when grinding
            this.isGrinding = true;
            console.log("Grind started!");

            // Snap player's vertical position relative to the BOTTOM of the rail
            // Place player's bottom edge slightly above the rail's bottom edge initially
            const snapOffset = 5; // Pixels above the rail bottom
            player.y = grindable.getBounds().bottom - (player.displayHeight / 2) - snapOffset; // Use displayHeight for visual size

            // Stop vertical movement (important!)
            player.setVelocityY(0);
            this.sound.play('grind_start'); // Play grind start sound

            // Optional: Visual cue for grinding (e.g., tint player)
            // player.setTint(0xffff00); // Yellow tint while grinding
        }

        // Points are awarded in the update loop based on the isGrinding flag
        // No need for continuous snapping here; player moves with the rail due to scroll speed
    }

    // --- End Grind Logic ---
    endGrind() {
        if (this.isGrinding) {
            this.isGrinding = false;
            console.log("Grind ended.");
            this.sound.play('land'); // Play landing sound (reused from grind end)
            // Optional: Reset player tint if it was changed
            // player.clearTint();
            // Player will naturally fall due to gravity pull logic in update if they jumped off
        }
    }


    update(time, delta) {
        // --- Player Movement ---
        if (!this.player || !this.cursors) {
            return; // Exit if player or cursors aren't ready
        }

        // Game logic (movement, score) now runs continuously while this scene is active.
        // Collision handling transitions away from this scene.

        // --- Player Horizontal Movement (Keyboard) ---
        // Keyboard input overrides touch input if both are active
        let movingHorizontally = false;
        if (this.cursors.left.isDown) {
            movingHorizontally = true;
            this.player.setVelocityX(-PLAYER_SPEED);
        } else if (this.cursors.right.isDown) {
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

            // If neither keyboard key is down, check if touch is still active
            // This check might be redundant now with the logic above
            // if (!this.input.activePointer.isDown) {
            //      this.player.setVelocityX(0);
            // }
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
        } else if (this.isJumping) { // Check jumping after grinding
            this.player.anims.stop(); // Explicitly stop previous animation
            // Direct frame setting for jumping
            this.player.setTexture('skater', 9); // Directly set to frame 9 for jumping
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
            this.score += (grindPointsPerSecond * delta) / 1000;
            // Adding points while grinding
        } else {
            // Normal score increment based on time (e.g., 10 points per second)
            const normalPointsPerSecond = 10;
            this.score += (normalPointsPerSecond * delta) / 1000;
        }
        this.scoreText.setText(`Score: ${Math.floor(this.score)}`);
        this.updateHelmetIcon(); // Update helmet icon position if score text width changes


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

        // --- Obstacle, Ramp, Grindable & Collectible Cleanup ---
        // Check items in all groups and destroy them if they go off-screen below
        [this.obstacles, this.ramps, this.grindables, this.collectibles].forEach(group => {
            group.children.each(item => {
                // Check if item exists and has a body (and isn't already marked for destruction)
                if (item && item.body && item.y > GAME_HEIGHT + item.displayHeight) { // Use displayHeight for accurate check
                    // Log texture key and frame if available
                    const itemInfo = item.frame ? `${item.texture.key} (frame ${item.frame.name})` : item.texture.key;
                    console.log(`Destroying off-screen ${itemInfo}`);
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

    preload() {
        // Load UI confirmation sound if needed for restart button
        this.load.audio('ui_confirm', 'assets/audio/ui_confirm.mp3');
        // Load music for game over screen (can be same as start screen)
        this.load.audio('start_music', 'assets/audio/start_music.mp3');
        // Game over sound is loaded by GameplayScene before transition
    }

    // Receive data from the scene that started this one (GameplayScene)
    init(data) {
        this.finalScore = data.score || 0; // Get score passed from GameplayScene
        console.log(`GameOverScene received score: ${this.finalScore}`);
    }

    create() {
        // Set the background color to a dark gray
        this.cameras.main.setBackgroundColor('#A9A9A9'); // Dark gray

        // Play game over screen music
        this.sound.play('start_music', { loop: true, volume: 0.4 }); // Adjust volume as needed
        
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
            this.sound.play('ui_confirm'); // Play sound on restart
            this.sound.stopByKey('start_music'); // Stop game over music
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
