// Initialize Kaboom, disable global imports, set background
const k = kaboom({
    global: false, // Prevent Kaboom functions from polluting the global namespace
    background: [0, 0, 0], // Set background color to black (RGB: 0, 0, 0)
});

// Log the Kaboom context BEFORE destructuring
// Define game constants
const PLAYER_SPEED = 200; // Pixels per second player moves horizontally
const SCROLL_SPEED = 120; // Pixels per second obstacles move up

// Add the player character
const player = k.add([ // k.add needs prefix
    rect(40, 40), // Component functions are called directly (no prefix)
    color(255, 0, 0),
    pos(k.width() / 2, k.height() - 60), // k.width/k.height need prefix
    origin('center'),
    area(),
    "player"
]);

// Player movement
k.onKeyPress("left", () => { // Use k.onKeyPress
    player.moveBy(-PLAYER_SPEED, 0);
});

k.onKeyPress("right", () => { // Use k.onKeyPress
    player.moveBy(PLAYER_SPEED, 0);
});

// Function to spawn an obstacle
function spawnObstacle() {
    k.add([ // k.add needs prefix
        rect(k.rand(20, 50), k.rand(20, 50)), // Component func called directly, k.rand needs prefix
        pos(k.rand(0, k.width()), k.height()), // Component func called directly, k.rand/width/height need prefix
        origin('botleft'),
        color(0, 0, 255),
        area(),
        move(k.UP, SCROLL_SPEED), // Component func called directly, k.UP needs prefix
        cleanup(),
        "obstacle"
    ]);
}

// Start spawning obstacles periodically
// Spawn a new obstacle every 1.5 seconds (adjust timing as needed)
k.loop(1.5, () => { // Use k.loop
    spawnObstacle();
});
