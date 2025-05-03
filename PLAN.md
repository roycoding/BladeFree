# BladeFree Development Plan

## Phase 1: Project Setup & Core Mechanics

- [ ] **Environment Setup:**
    - [ ] Create `index.html` for the game host.
    - [ ] Include Phaser 3 library (CDN or local file).
    - [ ] Create `game.js` for game code.
    - [ ] Initialize basic Phaser Game instance in `game.js` (set dimensions).
    - [ ] Set up a local web server (e.g., using `npm install -g http-server` and running `http-server`).
- [ ] **Create Main Game Scene (`GameplayScene`):**
    - [ ] Define the `GameplayScene` class extending `Phaser.Scene`.
    - [ ] Add `GameplayScene` to the Phaser game configuration.
    - [ ] `preload`: Load placeholder skater asset.
    - [ ] `create`: Add skater sprite.
    - [ ] `create`: Enable Arcade Physics on the skater sprite.
- [ ] **Player Movement:**
    - [ ] `create`: Set up keyboard listeners (Left/Right arrows).
    - [ ] `update`: Check key presses.
    - [ ] `update`: Apply horizontal velocity/position change for movement.
    - [ ] `update`: Constrain skater movement within screen bounds.
- [ ] **Basic Scrolling World:**
    - [ ] Keep player Y position relatively fixed.
    - [ ] Define a constant scroll speed for obstacles/world elements.

## Phase 2: Obstacles & Collision

- [ ] **Obstacle Creation:**
    - [ ] `preload`: Load placeholder obstacle assets (e.g., cone, rock).
    - [ ] `create`: Create a Phaser Group for obstacles (`this.obstacles`).
    - [ ] Implement timed event/function to spawn obstacles periodically.
    - [ ] Spawn obstacles above the top screen edge.
    - [ ] Add spawned obstacles to the `obstacles` group.
    - [ ] Set obstacle vertical velocity (moving down screen).
    - [ ] Implement logic to destroy obstacles when they go off-screen below.
- [ ] **Collision Detection:**
    - [ ] `create`: Set up physics collider between player and `obstacles` group.
    - [ ] Create `handleCollision(player, obstacle)` function.
    - [ ] `handleCollision`: Implement initial game over logic (e.g., stop player, log message).

## Phase 3: Scoring & UI

- [ ] **Basic Score:**
    - [ ] Initialize `this.score = 0` in `create` or `init`.
    - [ ] `update`: Increment score based on time/distance.
    - [ ] `preload`: Load font or prepare to use default text.
    - [ ] `create`: Create `this.scoreText` Phaser Text object.
    - [ ] `create`: Position score text (e.g., top-right).
    - [ ] `update`: Update `this.scoreText.setText()`.
- [ ] **High Score:**
    - [ ] `create`/`init`: Load high score from `localStorage` (default to 0).
    - [ ] `create`: Create `this.highScoreText` Phaser Text object.
    - [ ] `create`: Position high score text.
    - [ ] `handleCollision`: Compare final score with high score.
    - [ ] `handleCollision`: If higher, update high score variable and save to `localStorage`.

## Phase 4: Tricks, Collectibles & Game States

- [ ] **Ramps & Jumps:**
    - [ ] `preload`: Load ramp asset.
    - [ ] `create`: Create `ramps` group.
    - [ ] Implement spawning logic for ramps.
    - [ ] `create`: Set up physics *overlap* check between player and `ramps`.
    - [ ] Create `handleRampOverlap(player, ramp)` function.
    - [ ] `handleRampOverlap`: Trigger jump state (velocity change, animation).
    - [ ] `handleRampOverlap`: Add points for the jump.
    - [ ] `handleRampOverlap`: Play jump sound/visual effect.
- [ ] **Rails/Ledges & Grinding:**
    - [ ] `preload`: Load rail/ledge asset.
    - [ ] `create`: Create `grindables` group.
    - [ ] Implement spawning logic for grindables.
    - [ ] `create`: Set up physics *overlap* check between player and `grindables`.
    - [ ] Create `handleGrindOverlapStart(player, grindable)` function.
    - [ ] Create `handleGrindOverlapEnd(player, grindable)` function (or check in `update`).
    - [ ] `handleGrindOverlapStart`: Enter grinding state (snap position, change animation, sparks).
    - [ ] `update` (while grinding): Add points based on duration.
    - [ ] `handleGrindOverlapEnd`: Exit grinding state.
- [ ] **Collectibles:**
    - [ ] `preload`: Load collectible item assets (skates, wheels, etc.).
    - [ ] `create`: Create `collectibles` group.
    - [ ] Implement spawning logic for collectibles.
    - [ ] `create`: Set up physics *overlap* check between player and `collectibles`.
    - [ ] Create `handleCollect(player, item)` function.
    - [ ] `handleCollect`: Add points to score.
    - [ ] `handleCollect`: Play collection sound effect.
    - [ ] `handleCollect`: Show temporary points pop-up text.
    - [ ] `handleCollect`: Destroy the collected item sprite (`item.destroy()`).
- [ ] **Game State Management:**
    - [ ] Create `StartScene` class.
    - [ ] Create `GameOverScene` class.
    - [ ] Add scenes to Phaser game config.
    - [ ] **`StartScene`:**
        - [ ] Display "Press an arrow key to BladeFree" text.
        - [ ] Listen for keyboard input (any arrow key).
        - [ ] On input, transition to `GameplayScene` (`this.scene.start('GameplayScene')`).
    - [ ] **`GameplayScene`:**
        - [ ] `handleCollision`: Transition to `GameOverScene`, passing score (`this.scene.start('GameOverScene', { score: this.score })`).
    - [ ] **`GameOverScene`:**
        - [ ] `init(data)`: Receive score (`this.finalScore = data.score`).
        - [ ] `create`: Display final score.
        - [ ] `create`: Display high scores (load from `localStorage`).
        - [ ] `create`: Implement/play funny game over animation (dog drag).
        - [ ] `create`: Display "Restart?" / "Quit?" options.
        - [ ] `create`: Add input listeners for restart/quit.
        - [ ] On Restart: `this.scene.start('GameplayScene')`.
        - [ ] On Quit: Display "Later Blader 🤙" text.

## Phase 5: Audio & Polish

- [ ] **Sound Integration:**
    - [ ] `preload`: Load background music file(s).
    - [ ] `preload`: Load sound effect files (jump, grind, collect, collide, UI click).
    - [ ] `create` (`GameplayScene`): Play background music (`loop: true`).
    - [ ] Trigger sound effects on corresponding actions (`this.sound.play(...)`).
- [ ] **Graphics & Animation:**
    - [ ] Replace placeholders with final retro-style graphics (inspired by `roy_skate1.png`).
    - [ ] Create sprite sheets for player animations (skating, jumping, grinding, falling).
    - [ ] Use Phaser's animation manager (`this.anims.create`) to define animations.
    - [ ] Play correct player animation based on state.
    - [ ] Add particle effects (grind sparks, jump poof).
    - [ ] Implement point pop-up visuals.
- [ ] **Mobile Controls:**
    - [ ] `create`: Add touch input listeners (`this.input.on('pointerdown', ...)`).
    - [ ] Implement logic to detect touch on left/right screen halves.
    - [ ] Trigger player movement based on touch location.
    - [ ] Handle touch end (`pointerup`) to stop movement.

## Phase 6: Testing & Balancing

- [ ] **Playtesting:**
    - [ ] Test thoroughly on desktop browsers.
    - [ ] Test thoroughly on mobile browsers.
    - [ ] Adjust game parameters (speed, frequency, points) for fun and challenge.
    - [ ] Identify and fix bugs.
    - [ ] Optimize performance if needed.
