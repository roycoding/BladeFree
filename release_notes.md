# BladeFree - Release Notes

## Version 0.2.2 (Current)

**Release Date:** 2025-05-09

This release primarily addresses a bug with the in-game timer and obstacle spawn timing not resetting correctly upon game restart.

### Bug Fixes:
*   **Timer and Difficulty Reset:** Implemented a more robust reset mechanism for the in-game timer and the `gameStartTime` variable used for difficulty scaling. This ensures that both the displayed timer and the logic for obstacle movement/spawn rates correctly reflect the start of a new game session after a restart. This involved:
    *   Using `sceneRunningTime` accumulated via `delta` in the `update` loop for the visual timer.
    *   Ensuring `this.obstacleTimer` is completely removed and recreated on scene restart.
    *   Verifying `this.gameStartTime` is set using `this.sys.time.now` at the appropriate point in `GameplayScene.create()`.

### (Features and fixes from v0.2.1 also included)

*   **Transfer Combos:**
    *   Added "Transfer Combo" scores for transitioning between ramps and rails (Ramp-to-Ramp, Ramp-to-Rail, Rail-to-Ramp, Rail-to-Rail).
    *   Transfer combo pop-up messages now have a distinct color and stay on screen longer (1500ms).
*   **Trick System & Animations:**
    *   Added "360" trick for ramp jumps, displaying the trick name and points upon landing.
    *   Implemented a 2-frame (9 then 17) animation sequence for the 360 jump, with refined timing for clarity.
    *   Added "Royale Grind" trick when initiating a grind.
    *   "Royale Grind" name now displays persistently above the accumulating grind score during a grind.
    *   Removed the initial ephemeral pop-up for starting a grind, as the persistent display serves this purpose.
*   **Difficulty Scaling:**
    *   Obstacles start moving horizontally after 1 minute of gameplay, and faster after 2 minutes. Moving obstacles reverse direction at screen edges.
    *   Obstacle spawn rate increases (spawn delay decreases) for every 700 points scored by the player, up to a minimum spawn delay.
*   **Mobile UI Enhancements:**
    *   Added on-screen prompts for mobile controls ("Tap Here Move Left/Right") that appear at the start of gameplay on non-desktop devices.
    *   Prompts now include visual green (left) and purple (right) arrows instead of text arrows.
    *   Prompts stay on screen longer (6 seconds) or until the player first moves.
*   **Metadata & Planning:**
    *   Updated `index.html` with comprehensive Open Graph and Twitter Card metadata for social media sharing, accurately describing the game as an "aggressive inline skating" game.
    *   Updated `PLAN.md` to reflect the game as an "aggressive inline skating" game and added a new "Deployment & Optimization" phase.
*   **Previous Bug Fixes (from v0.2.1):**
    *   Ensured only frames 9 and 17 are displayed during the 360 air animation.
    *   Addressed a potential error with grind name text display by explicitly nullifying the text object reference after destruction and before recreation.
    *   Corrected game descriptions in `PLAN.md` and `index.html` from "skateboarding" to "aggressive inline skating".
    *   Fixed a potential null error on grind display text when restarting the game by ensuring `grindPointsDisplay` is properly reset.

## Version 0.2.1

**Release Date:** 2025-05-09

This release introduces several new gameplay mechanics, difficulty scaling, UI enhancements for mobile players, and improved metadata for sharing. It also includes a fix for a potential error during grind text display on game restart.

### New Features & Enhancements:

*   **Transfer Combos:**
    *   Added "Transfer Combo" scores for transitioning between ramps and rails (Ramp-to-Ramp, Ramp-to-Rail, Rail-to-Ramp, Rail-to-Rail).
    *   Transfer combo pop-up messages now have a distinct color and stay on screen longer (1500ms).
*   **Trick System & Animations:**
    *   Added "360" trick for ramp jumps, displaying the trick name and points upon landing.
    *   Implemented a 2-frame (9 then 17) animation sequence for the 360 jump, with refined timing for clarity.
    *   Added "Royale Grind" trick when initiating a grind.
    *   "Royale Grind" name now displays persistently above the accumulating grind score during a grind.
    *   Removed the initial ephemeral pop-up for starting a grind, as the persistent display serves this purpose.
*   **Difficulty Scaling:**
    *   Obstacles start moving horizontally after 1 minute of gameplay, and faster after 2 minutes. Moving obstacles reverse direction at screen edges.
    *   Obstacle spawn rate increases (spawn delay decreases) for every 700 points scored by the player, up to a minimum spawn delay.
*   **Mobile UI Enhancements:**
    *   Added on-screen prompts for mobile controls ("Tap Here Move Left/Right") that appear at the start of gameplay on non-desktop devices.
    *   Prompts now include visual green (left) and purple (right) arrows instead of text arrows.
    *   Prompts stay on screen longer (6 seconds) or until the player first moves.
*   **Metadata & Planning:**
    *   Updated `index.html` with comprehensive Open Graph and Twitter Card metadata for social media sharing, accurately describing the game as an "aggressive inline skating" game.
    *   Updated `PLAN.md` to reflect the game as an "aggressive inline skating" game and added a new "Deployment & Optimization" phase.

### Bug Fixes:

*   Ensured only frames 9 and 17 are displayed during the 360 air animation.
*   Addressed a potential error with grind name text display by explicitly nullifying the text object reference after destruction and before recreation.
*   Corrected game descriptions in `PLAN.md` and `index.html` from "skateboarding" to "aggressive inline skating".
*   Fixed a potential null error on grind display text when restarting the game by ensuring `grindPointsDisplay` is properly reset.

## Version 0.1.2

**Release Date:** 2025-05-08 (Approx.)

This release introduces several new gameplay mechanics, difficulty scaling, UI enhancements for mobile players, and improved metadata for sharing.

### New Features & Enhancements:

*   **Transfer Combos:**
    *   Added "Transfer Combo" scores for transitioning between ramps and rails (Ramp-to-Ramp, Ramp-to-Rail, Rail-to-Ramp, Rail-to-Rail).
    *   Transfer combo pop-up messages now have a distinct color and stay on screen longer (1500ms).
*   **Trick System & Animations:**
    *   Added "360" trick for ramp jumps, displaying the trick name and points upon landing.
    *   Implemented a 2-frame (9 then 17) animation sequence for the 360 jump, with refined timing for clarity.
    *   Added "Royale Grind" trick when initiating a grind.
    *   "Royale Grind" name now displays persistently above the accumulating grind score during a grind.
    *   Removed the initial ephemeral pop-up for starting a grind, as the persistent display serves this purpose.
*   **Difficulty Scaling:**
    *   Obstacles start moving horizontally after 1 minute of gameplay, and faster after 2 minutes. Moving obstacles reverse direction at screen edges.
    *   Obstacle spawn rate increases (spawn delay decreases) for every 700 points scored by the player, up to a minimum spawn delay.
*   **Mobile UI Enhancements:**
    *   Added on-screen prompts for mobile controls ("Tap Here Move Left/Right") that appear at the start of gameplay on non-desktop devices.
    *   Prompts now include visual green (left) and purple (right) arrows instead of text arrows.
    *   Prompts stay on screen longer (6 seconds) or until the player first moves.
*   **Metadata & Planning:**
    *   Updated `index.html` with comprehensive Open Graph and Twitter Card metadata for social media sharing, accurately describing the game as an "aggressive inline skating" game.
    *   Updated `PLAN.md` to reflect the game as an "aggressive inline skating" game and added a new "Deployment & Optimization" phase.

### Bug Fixes:

*   Ensured only frames 9 and 17 are displayed during the 360 air animation.
*   Addressed a potential error with grind name text display by explicitly nullifying the text object reference after destruction and before recreation.
*   Corrected game descriptions in `PLAN.md` and `index.html` from "skateboarding" to "aggressive inline skating".

## Version 0.1.1

**Release Date:** 2025-05-08 (Approx.)

This release focuses on refining existing features, enhancing player feedback, and improving UI elements.

### New Features & Enhancements:

*   **Helmet Spawning Logic:**
    *   Helmets no longer spawn as random collectibles if the player is already wearing one.
    *   Helmets can still spawn randomly if the player does not have one (in addition to the initial guaranteed helmet).
*   **Inventory System:**
    *   Players can now collect a set of distinct inventory items (skates, wheels, wax, bearings, knee pads, new skate video, baggie jeans).
    *   An inventory UI displays at the top of the screen, showing collected items normally and uncollected items as subdued (grayed out with reduced opacity).
    *   Collecting all items in the set awards a "COLLECTION COMPLETE! 500 Point Bonus!" message and points. The inventory then resets for potential re-collection.
*   **UI & Messaging Improvements:**
    *   Updated helmet collision message to: "You cracked your HELMET, but not your HEAD!"
    *   The "SKULL PROTECTION!" message (on first helmet pickup) and "COLLECTION COMPLETE!" message are now centered on the screen for better visibility.
    *   Uncollected inventory item icons are now more clearly subdued (darker gray tint and reduced alpha).
*   **Gameplay & Controls:**
    *   Added A/D keys as alternative keyboard controls for left/right movement.
*   **Visuals:**
    *   Added a special "BladeFree" logo asphalt tile that appears once near the top of the gameplay screen.
*   **Game Over Screen:**
    *   Restart and Quit buttons have been repositioned to the lower-left and lower-right corners, respectively.

### Bug Fixes:

*   (Implicitly) Removed redundant quit logic that was present at the end of `game.js`.

## Version 0.1.0

**Release Date:** 2025-05-08 (Approx.)

Initial public release of BladeFree. This version establishes the core gameplay mechanics and features.

### Key Features:

*   **Core Gameplay:** Endless down-scrolling skater game. Players control a skater, avoid obstacles, and aim for a high score.
*   **Movement:** Keyboard (Arrow keys) and basic mobile touch controls (tap left/right screen half).
*   **Obstacles & Collectibles:** Randomly spawning obstacles and collectible items (skates, wheels, wax, helmet, bearings, knee pads, VHS tape, baggie jeans) using sprite graphics.
*   **Ramps & Jumps:** Players can skate onto ramps to perform automatic jumps.
*   **Rails & Grinding:** Players can skate onto rails/ledges to automatically grind and accumulate points. Player is centered on the rail during grind.
*   **Scoring:** Points awarded for time survived, grinding, ramp jumps, and collecting items. High scores are saved locally.
*   **Helmet Power-Up:**
    *   Collecting a helmet provides "SKULL PROTECTION!"
    *   If the player collides with an obstacle while wearing a helmet, the helmet is lost (with a "cracked helmet" message and falling animation), but the game continues.
*   **Game States:**
    *   **Start Screen:** Features a title image, play button, and "Push START to SKATE" prompt. Plays start screen music. Audio context is initiated on first user interaction.
    *   **Gameplay Scene:** Main game area with scrolling asphalt background, player, obstacles, items, score display, and inventory UI. Plays gameplay music.
    *   **Game Over Screen:** Displays final score, high score, and options to "RESTART" (R key or button) or "QUIT" (Q key or button). Features a "dog dragging skater" animation on game over, and a "Later Blader" animated sequence on quit, before returning to the Start Screen. Plays game over music and sound effects (spray can rattle, spray).
*   **Visuals & Audio:**
    *   Custom graphics for player (spritesheet with animations for skating, jumping, grinding, falling), obstacles, collectibles, ramps, rails, title screen, game over screen, and BladeFree logo asphalt tile.
    *   Sound effects for UI confirmation, jump, land, collect, collide, grind start, game over sequence (dog bark, spray can, spray).
    *   Background music for Start, Gameplay, and Game Over scenes.
    *   Red screen flash on collision.
*   **Pause Functionality:** Game can be paused and resumed by pressing the 'P' key.
*   **Technical:**
    *   Built with Phaser 3.
    *   Includes `README.md` and `PLAN.md`.
    *   Favicon and basic HTML page styling.
    *   Canvas has rounded corners.
