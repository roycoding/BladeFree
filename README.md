# BladeFree

**Current Version: 1.0.2**

BladeFree is a web browser-based game inspired by SkiFree's freestyle mode, featuring an aggressive inline skater. The game is a down-scrolling endless runner where the player avoids obstacles, performs tricks (jumps, grinds), and collects items for points.

This game is from [royskates.com](http://royskates.com).

## License

This project is licensed under the GNU General Public License v2.0. See the [LICENSE](LICENSE) file for details (you will need to create this file and add the GPL v2 text to it).

## How to Run the Game

1.  **Clone the repository (if you haven't already):**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Start a local web server:**
    The game consists of static HTML, JavaScript, and asset files. You need a local web server to run it due to browser security restrictions (CORS) when loading assets via `file:///` protocols.

    A simple way to do this is using Python's built-in HTTP server:

    *   If you have Python 3:
        ```bash
        python -m http.server
        ```
    *   If you have Python 2:
        ```bash
        python -m SimpleHTTPServer
        ```
    Alternatively, you can use other tools like `npx http-server` (requires Node.js).

3.  **Open the game in your browser:**
    Once the server is running, it will typically tell you the address (e.g., `Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/)`).
    Open your web browser and navigate to `http://localhost:8000` (or the port specified by your server).

## How to Play

*   **Start:** Click the "PLAY" button or press any key on the start screen.
*   **Movement:**
    *   **Keyboard:** Use the **Left Arrow** and **Right Arrow** keys to move the skater.
    *   **Mobile/Touch:** Tap on the left or right half of the screen to move the skater.
*   **Objective:** Skate as far as possible, avoid obstacles, and score points by:
    *   Surviving.
    *   Grinding on rails.
    *   Jumping off ramps.
    *   Collecting items (skates, wheels, wax, helmets, etc.).
*   **Jumping:** Skate onto a ramp to automatically jump.
*   **Grinding:** Skate onto a rail/ledge to automatically start grinding. Stay on the rail to accumulate points.
*   **Helmet:**
    *   Collect a helmet to gain "SKULL PROTECTION!"
    *   If you hit an obstacle while wearing a helmet, you will lose the helmet but continue skating.
    *   Collecting additional helmets while already wearing one awards bonus points.
*   **Pause:** Press the **P** key to pause and unpause the game.
*   **Game Over:**
    *   If you hit an obstacle without a helmet, the game ends.
    *   Your score will be displayed. If it's a new high score, it will be saved in your browser.
    *   Press **R** to restart.
    *   Press **Q** to quit (shows a "Later Blader" animation and returns to the start screen).

## Development

The game is built using [Phaser 3](https://phaser.io/) (v3.80.1 via CDN) and plain JavaScript (ES6 Classes).

*   **Main Game Logic:** `game.js` contains all the scene definitions and game mechanics.
*   **HTML Structure:** `index.html` is the entry point and hosts the Phaser canvas.
*   **Assets:**
    *   Graphics are in `assets/graphics/`.
    *   Audio files are in `assets/audio/`.
    *   Favicon files are in `assets/favicon/`.
*   **Planning Document:** `PLAN.md` outlines the development phases and features.
*   **Progress Summary:** `current_progress.md` provides a snapshot of the current development status.

### Making Changes

1.  Edit `game.js` for game logic or `index.html` for page structure/styles.
2.  Modify or add assets in the `assets/` subdirectories.
3.  Refresh the game in your browser to see the changes. Ensure your local web server is still running.

### Key Files for Development:

*   `index.html`: Main HTML file, CSS styles.
*   `game.js`: Core game logic, Phaser scene definitions.
*   `PLAN.md`: Development plan and feature checklist.
*   `assets/`: Directory for all game graphics and audio.

### Debugging

Phaser has a debug mode that can be enabled in the game configuration in `game.js`:
```javascript
// In game.js, within the 'config' object:
physics: {
    default: 'arcade',
    arcade: {
        gravity: { y: 0 },
        // debug: true // Uncomment this line
    }
},
```
This will draw outlines around physics bodies and show velocity vectors, which is helpful for debugging collisions and movement. Remember to turn it off for "production" as it can impact performance.
Use your browser's developer console (usually F12) to check for JavaScript errors and log messages.

## Audio Credits

The following sound effect files used in BladeFree were sourced from Pixabay and are used under the Pixabay Content License. For more details on the license, please visit: [Pixabay License Summary](https://pixabay.com/service/license-summary/).

*   `assets/audio/ui_confirm.mp3`
*   `assets/audio/jump.mp3`
*   `assets/audio/collect.mp3`
*   `assets/audio/collide.mp3`
*   `assets/audio/grind_start.mp3`
*   `assets/audio/land.mp3`
*   `assets/audio/dog_bark.mp3`
*   `assets/audio/spray_can_rattle.mp3`
*   `assets/audio/spray.mp3`
*   `assets/audio/game_over.mp3`

The main background music (`music.mp3`) and start screen music (`start_music.mp3`) were created by royskates.com.
