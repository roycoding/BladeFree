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
    - [x] `preload`: Load placeholder obstacle assets (e.g., cone, rock). *(Replaced with sprite frames)*
    - [x] `create`: Create a Phaser Group for obstacles (`this.obstacles`).
    - [x] Implement timed event/function to spawn obstacles periodically.
    - [x] Spawn obstacles above the top screen edge.
    - [x] Add spawned obstacles to the `obstacles` group.
    - [x] Set obstacle vertical velocity (moving down screen).
    - [x] Implement logic to destroy obstacles when they go off-screen below.
- [x] **Collision Detection:**
    - [x] `create`: Set up physics collider between player and `obstacles` group.
    - [x] Create `handleCollision(player, obstacle)` function.
    - [x] `handleCollision`: Implement initial game over logic (e.g., stop player, log message). *(Now transitions to GameOverScene)*

## Phase 3: Scoring & UI

- [x] **Basic Score:**
    - [x] Initialize `this.score = 0` in `create` or `init`.
    - [x] `update`: Increment score based on time/distance. *(Also increments on tricks/collect)*
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
    - [x] `preload`: Load ramp asset. *(Placeholder done)*
    - [x] `create`: Create `ramps` group.
    - [x] Implement spawning logic for ramps.
    - [x] `create`: Set up physics *overlap* check between player and `ramps`.
    - [x] Create `handleRampOverlap(player, ramp)` function.
    - [x] `handleRampOverlap`: Trigger jump state (velocity change, animation).
    - [x] `handleRampOverlap`: Add points for the jump.
    - [x] `handleRampOverlap`: Play jump sound/visual effect. *(Sound and point popup done)*
- [x] **Rails/Ledges & Grinding:**
    - [x] `preload`: Load rail/ledge asset. *(Placeholder done)*
    - [x] `create`: Create `grindables` group.
    - [x] Implement spawning logic for grindables.
    - [x] `create`: Set up physics *overlap* check between player and `grindables`.
    - [x] Create `handleGrindOverlapStart(player, grindable)` function. *(Implemented in `handleGrindOverlap`)*
    - [x] Create `handleGrindOverlapEnd(player, grindable)` function (or check in `update`). *(Implemented as `endGrind` and check in `update`)*
    - [x] `handleGrindOverlapStart`: Enter grinding state (snap position, change animation, sparks). *(Snap position and animation done)*
    - [x] `update` (while grinding): Add points based on duration.
    - [x] `handleGrindOverlapEnd`: Exit grinding state.
- [x] **Collectibles:**
    - [x] `preload`: Load collectible item assets (skates, wheels, etc.). *(Replaced with sprite frames)*
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
        - [x] `create`: Implement/play funny game over animation (dog drag). *(Multi-stage dog drag implemented)*
        - [x] `create`: Display "Restart?" / "Quit?" options. *(Restart only)*
        - [x] `create`: Add input listeners for restart/quit. *(Restart only)*
        - [x] On Restart: `this.scene.start('GameplayScene')`.
        - [ ] On Quit: Display "Later Blader 🤙" text.
- [x] **Rails/Ledges & Grinding (Enhancements):**
    - [x] `update` (while grinding): Add points based on duration. *(Running total of points as skater grinds is covered by this)*
    - [ ] `handleGrindOverlap`: Improve player snapping to align to the middle of the rail.
    - [ ] `update`: Lock player's X position to the rail's X position while grinding.
    - [ ] `spawnObstacle`: Implement rails and ledges of different lengths.
        - [ ] Randomly determine length for grindable.
        - [ ] Create grindable placeholder/sprite with variable height.
        - [ ] Ensure physics body of grindable matches its visual height.
- [x] **Helmet Power-up:**
    - [x] `GameplayScene`: Add `hasHelmet` boolean flag.
    - [x] `GameplayScene`: `preload` helmet icon asset for UI. *(Used frame 27 from skater.png)*
    - [x] `GameplayScene`: `create` add UI element for helmet status (e.g., near score).
    - [x] `GameplayScene`: `handleCollect`:
        - [x] If collected item is a helmet:
            - [x] If `!hasHelmet`, set `hasHelmet = true`, update UI, display "SKULL PROTECTION" message.
            - [x] If `hasHelmet`, award points only.
    - [x] `GameplayScene`: `handleCollision`:
        - [x] If `hasHelmet`, set `hasHelmet = false`, update UI, play "helmet break" sound, prevent game over.
        - [ ] Animate helmet flying off player on collision.
        - [x] If `!hasHelmet`, proceed with game over.
    - [ ] `GameplayScene`: `preload` "helmet break" sound. *(Used 'collide' as placeholder, needs dedicated sound)*

## Phase 5: Audio & Polish

- [x] **Sound Integration:**
    - [x] `preload`: Load background music file(s).
    - [x] `preload`: Load sound effect files (jump, grind, collect, collide, UI click).
    - [x] `create` (`GameplayScene`): Play background music (`loop: true`).
    - [x] Trigger sound effects on corresponding actions (`this.sound.play(...)`).
- [x] **Scene Music:**
    - [x] `StartScene`: `preload` and `create` music for the start screen.
    - [x] `StartScene`: Ensure music stops when transitioning to `GameplayScene`.
    - [x] `GameOverScene`: `preload` and `create` music for the game over screen (can reuse start screen music).
    - [x] `GameOverScene`: Ensure music stops when transitioning to `GameplayScene`.
    - [x] `GameplayScene`: Ensure its music stops when transitioning to `GameOverScene` and `StartScene` music stops if transitioning from there. *(Gameplay to GameOver was already handled; StartScene transition now also handles its music)*.
- [ ] **Audio Controls:**
    - [ ] `index.html`: Add mute button element.
    - [ ] `game.js`/UI: Implement `toggleMute()` function (`this.sound.mute`).
    - [ ] `game.js`/UI: Update mute button appearance based on state.
    - [ ] `game.js`/UI: Persist mute state in `localStorage`.
    - [ ] `index.html`: Add volume slider element (range input).
    - [ ] `game.js`/UI: Implement `setVolume(value)` function (`this.sound.volume`).
    - [ ] `game.js`/UI: Persist volume level in `localStorage`.
- [ ] **Graphics & Animation:**
    - [x] Replace placeholders with final retro-style graphics (inspired by `roy_skate1.png`). *(Obstacles and Collectibles done)*
    - [ ] Replace ramp placeholder with final graphics.
        - [ ] `preload` new ramp asset(s).
        - [ ] Update `spawnObstacle` to use new ramp graphics.
        - [ ] Adjust physics body if needed.
    - [ ] Replace rail/ledge placeholder with final graphics.
        - [ ] `preload` new rail/ledge asset(s).
        - [ ] Update `spawnObstacle` to use new rail/ledge graphics (consider variable lengths).
        - [ ] Adjust physics body if needed.
    - [x] Create sprite sheets for player animations (skating, jumping, grinding, falling).
    - [x] Use Phaser's animation manager (`this.anims.create`) to define animations.
    - [x] Play correct player animation based on state.
    - [ ] Add crash animation when skater collides (distinct from dog-drag setup).
    - [ ] Add particle effects (grind sparks, jump poof).
    - [x] Implement point pop-up visuals.
    - [x] Change background color/add background image. *(Canvas background color changed)*
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
- [ ] **Difficulty Scaling:**
    - [ ] `GameplayScene`: Add `timeSurvived` counter.
    - [ ] `GameplayScene`: `update`: Increment `timeSurvived`.
    - [ ] `GameplayScene`: `update`: Gradually increase `SCROLL_SPEED` based on `timeSurvived`.
        - [ ] Define a base scroll speed and a maximum scroll speed.
        - [ ] Define how quickly the speed increases (e.g., per second or per score milestone).
    - [ ] Consider other difficulty scaling factors (e.g., obstacle density, spawn patterns).
