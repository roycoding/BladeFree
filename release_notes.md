# BladeFree - Release Notes

## Version 1.0.1 (Current)

**Release Date:** 2025-05-11

This release includes a fix for the layout of graphics in the initial gameplay instructions.

### Bug Fixes:
*   **Instruction Display:** Corrected the positioning of ramp and rail icons in the initial instruction overlay to prevent visual overlap.

## Version 1.0.0 (🎉 Official Release! 🎉)

**Release Date:** 2025-05-11

BladeFree 1.0.0 is here! This version brings further difficulty enhancements and improved player instructions.

### New Features & Enhancements:
*   **Difficulty Scaling:**
    *   Added a third tier of horizontal obstacle speed, activating after 3 minutes of gameplay, making the late game more challenging.
*   **Gameplay Instructions:**
    *   The initial instruction overlay in the `GameplayScene` has been significantly enhanced. It now displays graphical icons for obstacles, collectibles, ramps, and rails alongside the text instructions, providing clearer guidance to new players. Layout and spacing have been improved for readability.
*   **Timer Accuracy:**
    *   Ensured the timer affecting obstacle speed-up difficulty now correctly uses `sceneRunningTime`, synchronizing it with the on-screen game timer and ensuring it resets accurately with each new game.
*   **Color Standardization:**
    *   Standardized the green color used for various pop-up messages (collectibles, tricks, grind points display) to `#18ec21` for visual consistency.
*   **Message Durations:**
    *   Increased the on-screen duration for important messages: "SKULL PROTECTION!", "You cracked your HELMET...", and transfer combo pop-ups.

## Version 0.2.8

**Release Date:** 2025-05-10

This release significantly enhances the new high score celebration animation and includes minor UI adjustments.

### Enhancements:
*   **Enhanced New High Score Celebration:**
    *   The animated sprite (previously just a dog/skate) now cycles through all collectible and obstacle items (frames 23-36).
    *   Each item performs a "spin, grow, then spin, shrink" animation sequence.
    *   The medal sprite's pulsing animation has been made more pronounced.
*   **UI Adjustment:**
    *   The `royskates.com` logo overlay in the Start, Gameplay, and "Later Blader" screens has been repositioned slightly for better visibility, especially on mobile devices.

## Version 0.2.7

**Release Date:** 2025-05-10

This release adds a visual celebration for achieving a new high score.

### Enhancements:
*   **New High Score Celebration:**
    *   When a new high score is achieved, the `GameOverScene` now displays a "NEW HIGH SCORE!" message.
    *   A spinning dog sprite (frame 34) appears on the left, centered above the "RESTART" button.
    *   A pulsing medal sprite (frame 15) appears on the right, centered above the "QUIT" button.
    *   Positions of these elements have been adjusted for better layout.

## Version 0.2.6

**Release Date:** 2025-05-10

This release includes visual enhancements to the Start Screen.

### Enhancements:
*   **Start Screen Visuals:**
    *   Added new skater graphics (`assets/graphics/start_skater.png`) to the left and right sides of the `StartScene`.
    *   Adjusted the vertical positioning of these skater graphics to prevent overlap with the main title.
    *   Added a pulsing (scaling) animation to the "PLAY" button on the `StartScene` for better visual feedback.

## Version 0.2.5

**Release Date:** 2025-05-10

This release updates the royskates.com overlay to be a clickable link.

### Enhancements:
*   **Clickable Overlay:** The `royskates_com.png` overlay graphic, displayed in the lower-left corner of the `StartScene` and `GameplayScene`, is now interactive and links to `https://royskates.com` when clicked.

## Version 0.2.4

**Release Date:** 2025-05-10

This release focuses on stability by reverting a recently attempted feature that introduced complexities.

### Changes:
*   **Reverted "Jump Off Rail Early" Feature:** The functionality allowing players to jump off rails early using horizontal input, along with its associated grind cooldown logic, has been reverted. This decision was made due to implementation complexities and unwanted side effects, such as issues with immediate re-grinding and unpredictable transfer behavior. The game now uses the previous, more stable grind mechanism where grinds end primarily when the player no longer overlaps the rail or reaches its end.
*   Documentation (`current_progress.md`) has been updated to reflect this reversion.

## Version 0.2.3

**Release Date:** 2025-05-09

This release includes an update to an asset dimension and incorporates all previous fixes.

### Enhancements:
*   **Asset Update:** The `assets/graphics/later_blader.png` image has been updated to 500x500 pixels. The game's quit sequence will now display this image at its new native resolution.

### (Features and fixes from v0.2.2 also included)

*   **Timer and Difficulty Reset:** Implemented a more robust reset mechanism for the in-game timer and the `gameStartTime` variable used for difficulty scaling. This ensures that both the displayed timer and the logic for obstacle movement/spawn rates correctly reflect the start of a new game session after a restart.
*   **Transfer Combos:** Added "Transfer Combo" scores and enhanced pop-up messages.
*   **Trick System & Animations:** Added "360" and "Royale Grind" tricks with respective animations and persistent grind name display.
*   **Difficulty Scaling:** Implemented time-based horizontal obstacle movement and score-based spawn rate increases.
*   **Mobile UI Enhancements:** Added on-screen prompts with arrows for mobile controls.
*   **Metadata & Planning:** Updated `index.html` with social media metadata and `PLAN.md` with deployment/optimization phase.
*   **Previous Bug Fixes (from v0.2.1 & v0.2.2):**
    *   Corrected 360 air animation frames.
    *   Addressed potential errors with grind name text display on creation and restart.
    *   Ensured game descriptions accurately reflect "aggressive inline skating".
    *   Fixed `grindPointsDisplay` reset on game restart.

## Version 0.2.2

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
