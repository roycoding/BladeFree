# BladeFree - Release Notes

## Version 0.1.1 (Current)

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
