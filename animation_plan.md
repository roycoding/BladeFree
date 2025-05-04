# BladeFree Animation Plan

This document outlines the suggested animations for the player character in BladeFree.

**Sprite Sheet Recommendation:** Use a **Grid Layout** sprite sheet for simplicity. Keep frame dimensions consistent (e.g., 32x48 or 48x64 pixels). Group related animations together on the sheet.

## Core Animations (Implement First)

1.  **Skating Cycle (Looping)**
    *   **Purpose:** Default animation for normal forward movement.
    *   **Frames:** 2-4 frames.
        *   Frame 1: Neutral/gliding pose.
        *   Frame 2: Right skate pushing back.
        *   Frame 3: Neutral/gliding pose (or same as Frame 1).
        *   Frame 4: Left skate pushing back (can mirror Frame 2).
    *   **Notes:** This single loop covers forward skating; horizontal movement is handled by changing the sprite's X position.

2.  **Grinding Pose (Static or Short Loop)**
    *   **Purpose:** Displayed while grinding.
    *   **Frames:** 1-2 frames.
    *   **Pose:** Start with one simple grind pose (e.g., soul grind or frontside).

3.  **Jump - Takeoff/Anticipation (Single Frame or Quick)**
    *   **Purpose:** Visual cue when hitting a ramp.
    *   **Frames:** 1-2 frames.
    *   **Pose:** Crouched down, knees bent.

4.  **Jump - Airborne (Static or Short Loop)**
    *   **Purpose:** Pose while ascending/floating.
    *   **Frames:** 1-2 frames.
    *   **Pose:** Simple tuck or neutral airborne pose.

5.  **Jump - Landing (Single Frame or Quick)**
    *   **Purpose:** Shows impact absorption.
    *   **Frames:** 1-2 frames.
    *   **Pose:** Knees bent, absorbing landing, transitioning to skating cycle.

6.  **Collision/Fall (Short Sequence)**
    *   **Purpose:** Played upon hitting an obstacle.
    *   **Frames:** 2-4 frames.
    *   **Pose:** Tumble, fall, or splat pose.

## Trick Animations (Implement Later)

7.  **Jump - Grab Trick (Single Frame)**
    *   **Purpose:** Replaces standard airborne pose for tricks.
    *   **Frames:** 1 static frame per grab type.
    *   **Pose:** Start with Indy grab; add others later.

8.  **Jump - Spin (Sequence or Rotation)**
    *   **Purpose:** Visual for spinning tricks.
    *   **Frames:** 4 frames for quarter-rotations, or use sprite rotation.

9.  **Grind Variations (Static Frames)**
    *   **Purpose:** Different poses for different grind types.
    *   **Frames:** 1 static frame per grind type (e.g., Makio, Mizou).

## Suggested Sprite Sheet Layout (Example Grid)

*   Row 1: Skating Cycle frames (4 frames)
*   Row 2: Jump Takeoff (1), Jump Airborne (1), Jump Landing (1), Collision1 (1)
*   Row 3: Grind Pose (1), Grab Trick 1 (1), Collision2 (1), Collision3 (1)
*   *(Adjust rows/columns and frame count as needed)*
*   Save as a single PNG file (e.g., `skater.png`).
