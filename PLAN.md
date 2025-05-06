# BladeFree Development Plan

## Phase 1: Project Setup & Core Mechanics

- [x] **Environment Setup:**
    - [x] Create `index.html` for the game host.
    - [x] Include Phaser 3 library (CDN or local file).
    - [x] Create `game.js` for game code.
    - [x] Initialize basic Phaser Game instance in `game.js` (set dimensions).
    - [x] Set up a local web server (e.g., using `npm install -g http-server` and running `http-server`).
- [x] **Create Main Game Scene (`GameplayScene`):**
    - [x] Define the `GameplayScene` class extending `Phaser.Scene`.
    - [x] Add `GameplayScene` to the Phaser game configuration.
    - [x] `preload`: Load placeholder skater asset.
    - [x] `create`: Add skater sprite.
    - [x] `create`: Enable Arcade Physics on the skater sprite.
- [x] **Player Movement:**
    - [x] `create`: Set up keyboard listeners (Left/Right arrows).
    - [x] `update`: Check key presses.
    - [x] `update`: Apply horizontal velocity/position change for movement.
    - [x] `update`: Constrain skater movement within screen bounds.
- [x] **Basic Scrolling World:**
    - [x] Keep player Y position relatively fixed.
    - [x] Define a constant scroll speed for obstacles/world elements.

## Phase 2: Obstacles & Collision

- [x] **Obstacle Creation:**
    - [x] `preload`: Load placeholder obstacle assets (e.g., cone, rock).
    - [x] `create`: Create a Phaser Group for obstacles (`this.obstacles`).
    - [x] Implement timed event/function to spawn obstacles periodically.
    - [x] Spawn obstacles above the top screen edge.
    - [x] Add spawned obstacles to the `obstacles` group.
    - [x] Set obstacle vertical velocity (moving down screen).
    - [x] Implement logic to destroy obstacles when they go off-screen below.
- [x] **Collision Detection:**
    - [x] `create`: Set up physics collider between player and `obstacles` group.
    - [x] Create `handleCollision(player, obstacle)` function.
    - [x] `handleCollision`: Implement initial game over logic (e.g., stop player, log message).

## Phase 3: Scoring & UI

- [x] **Basic Score:**
    - [x] Initialize `this.score = 0` in `create` or `init`.
    - [x] `update`: Increment score based on time/distance.
    - [x] `preload`: Load font or prepare to use default text.
    - [x] `create`: Create `this.scoreText` Phaser Text object.
    - [x] `create`: Position score text (e.g., top-right).
    - [x] `update`: Update `this.scoreText.setText()`.
- [x] **High Score:**
    - [x] `create`/`init`: Load high score from `localStorage` (default to 0).
    - [x] `create`: Create `this.highScoreText` Phaser Text object.
    - [x] `create`: Position high score text.
    - [x] `handleCollision`: Compare final score with high score.
    - [x] `handleCollision`: If higher, update high score variable and save to `localStorage`.

## Phase 4: Tricks, Collectibles & Game States

- [x] **Ramps & Jumps:**
    - [x] `preload`: Load ramp asset.
    - [x] `create`: Create `ramps` group.
    - [x] Implement spawning logic for ramps.
    - [x] `create`: Set up physics *overlap* check between player and `ramps`.
    - [x] Create `handleRampOverlap(player, ramp)` function.
    - [x] `handleRampOverlap`: Trigger jump state (velocity change, animation). *(Velocity change done)*
    - [x] `handleRampOverlap`: Add points for the jump.
    - [x] `handleRampOverlap`: Play jump sound/visual effect.
- [x] **Rails/Ledges & Grinding:**
    - [x] `preload`: Load rail/ledge asset. *(Placeholder done)*
    - [x] `create`: Create `grindables` group.
    - [x] Implement spawning logic for grindables.
    - [x] `create`: Set up physics *overlap* check between player and `grindables`.
    - [x] Create `handleGrindOverlapStart(player, grindable)` function. *(Implemented in `handleGrindOverlap`)*
    - [x] Create `handleGrindOverlapEnd(player, grindable)` function (or check in `update`). *(Implemented as `endGrind` and check in `update`)*
    - [x] `handleGrindOverlapStart`: Enter grinding state (snap position, change animation, sparks). *(Snap position done)*
    - [x] `update` (while grinding): Add points based on duration.
    - [x] `handleGrindOverlapEnd`: Exit grinding state.
- [x] **Collectibles:**
    - [x] `preload`: Load collectible item assets (skates, wheels, etc.). *(Placeholder done)*
    - [x] `create`: Create `collectibles` group.
    - [x] Implement spawning logic for collectibles.
    - [x] `create`: Set up physics *overlap* check between player and `collectibles`.
    - [x] Create `handleCollect(player, item)` function.
    - [x] `handleCollect`: Add points to score.
    - [x] `handleCollect`: Play collection sound effect.
    - [x] `handleCollect`: Show temporary points pop-up text.
    - [x] `handleCollect`: Destroy the collected item sprite (`item.destroy()`).
- [x] **Game State Management:**
    - [x] Create `StartScene` class.
    - [x] Create `GameOverScene` class.
    - [x] Add scenes to Phaser game config.
    - [x] **`StartScene`:**
        - [x] Display "Press an arrow key to BladeFree" text.
        - [x] Listen for keyboard input (any arrow key).
        - [x] On input, transition to `GameplayScene` (`this.scene.start('GameplayScene')`).
    - [x] **`GameplayScene`:**
        - [x] `handleCollision`: Transition to `GameOverScene`, passing score (`this.scene.start('GameOverScene', { score: this.score })`).
    - [x] **`GameOverScene`:**
        - [x] `init(data)`: Receive score (`this.finalScore = data.score`).
        - [x] `create`: Display final score.
        - [x] `create`: Display high scores (load from `localStorage`).
        - [ ] `create`: Implement/play funny game over animation (dog drag).
        - [x] `create`: Display "Restart?" / "Quit?" options.
        - [x] `create`: Add input listeners for restart/quit.
        - [x] On Restart: `this.scene.start('GameplayScene')`.
        - [ ] On Quit: Display "Later Blader 🤙" text.

## Phase 5: Audio & Polish

- [x] **Sound Integration:**
    - [x] `preload`: Load background music file(s).
    - [x] `preload`: Load sound effect files (jump, grind, collect, collide, UI click).
    - [x] `create` (`GameplayScene`): Play background music (`loop: true`).
    - [x] Trigger sound effects on corresponding actions (`this.sound.play(...)`).
- [ ] **Graphics & Animation:**
    - [x] Replace placeholders with final retro-style graphics (inspired by `roy_skate1.png`). *(Obstacles and Collectibles done)*
    - [x] Create sprite sheets for player animations (skating, jumping, grinding, falling).
    - [x] Use Phaser's animation manager (`this.anims.create`) to define animations.
    - [x] Play correct player animation based on state.
    - [ ] Add particle effects (grind sparks, jump poof).
    - [x] Implement point pop-up visuals.
- [x] **Mobile Controls:**
    - [x] `create`: Add touch input listeners (`this.input.on('pointerdown', ...)`).
    - [x] Implement logic to detect touch on left/right screen halves.
    - [x] Trigger player movement based on touch location.
    - [x] Handle touch end (`pointerup`) to stop movement.

## Phase 6: Testing & Balancing

- [ ] **Playtesting:**
    - [ ] Test thoroughly on desktop browsers.
    - [ ] Test thoroughly on mobile browsers.
    - [ ] Adjust game parameters (speed, frequency, points) for fun and challenge.
    - [ ] Identify and fix bugs.
    - [ ] Optimize performance if needed.
