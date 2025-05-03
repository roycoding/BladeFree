// Initialize Kaboom, disable global imports, set background
const k = kaboom({
    global: false, // Prevent Kaboom functions from polluting the global namespace
    background: [0, 0, 0], // Set background color to black (RGB: 0, 0, 0)
});

// Log the Kaboom context to inspect its contents
console.log("Kaboom context:", k);

// Define game constants
const PLAYER_SPEED = 200; // Pixels per second player moves horizontally
const SCROLL_SPEED = 120; // Pixels per second obstacles move up

// Add the player character
const player = k.add([
    rect(40, 40), // Component functions used directly
    color(255, 0, 0),
    pos(k.width() / 2, k.height() - 60), // k.width/k.height are fine here
    origin('center'), // Re-enable origin, without k. prefix
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
    k.add([
        rect(k.rand(20, 50), k.rand(20, 50)), // k.rand is fine here
        pos(k.rand(0, k.width()), k.height()), // k.rand, k.width, k.height are fine
        origin('botleft'), // Re-enable origin, without k. prefix
        color(0, 0, 255),
        area(),
        move(k.UP, SCROLL_SPEED), // k.UP is a constant on k
        cleanup(),
        "obstacle"
    ]);
}

// Start spawning obstacles periodically
// Spawn a new obstacle every 1.5 seconds (adjust timing as needed)
k.loop(1.5, () => { // Use k.loop
    spawnObstacle();
});
