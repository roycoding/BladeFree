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
const player = k.add([ // Use k.add
    k.rect(40, 40), // Use k.rect
    k.color(255, 0, 0), // Use k.color
    k.pos(k.width() / 2, k.height() - 60), // Use k.pos, k.width, k.height
    k.origin('center'), // Use k.origin - Re-enabled
    k.area(), // Use k.area
    "player" // Tag it as "player"
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
    k.add([ // Use k.add
        k.rect(k.rand(20, 50), k.rand(20, 50)), // Use k.rect, k.rand
        k.pos(k.rand(0, k.width()), k.height()), // Use k.pos, k.rand, k.width, k.height
        k.origin('botleft'), // Use k.origin
        k.color(0, 0, 255), // Use k.color
        k.area(),           // Use k.area
        k.move(k.UP, SCROLL_SPEED), // Use k.move, k.UP
        k.cleanup(),        // Use k.cleanup
        "obstacle"        // Tag it as an "obstacle"
    ]);
}

// Start spawning obstacles periodically
// Spawn a new obstacle every 1.5 seconds (adjust timing as needed)
k.loop(1.5, () => { // Use k.loop
    spawnObstacle();
});
