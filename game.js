// Initialize Kaboom, disable global imports, set background
const k = kaboom({
    global: false, // Prevent Kaboom functions from polluting the global namespace
    background: [0, 0, 0], // Set background color to black (RGB: 0, 0, 0)
});

// Destructure component functions and constants we need from the context
const { rect, color, pos, origin, area, move, cleanup, UP } = k;

// Log the Kaboom context to inspect its contents
console.log("Kaboom context:", k);

// Define game constants
const PLAYER_SPEED = 200; // Pixels per second player moves horizontally
const SCROLL_SPEED = 120; // Pixels per second obstacles move up

// Add the player character
const player = k.add([ // k.add still needs prefix
    rect(40, 40), // Use destructured component function
    color(255, 0, 0), // Use destructured component function
    pos(k.width() / 2, k.height() - 60), // Use destructured pos, but k.width/k.height still need prefix
    origin('center'), // Use destructured component function
    area(), // Use destructured component function
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
    k.add([ // k.add still needs prefix
        rect(k.rand(20, 50), k.rand(20, 50)), // Use destructured rect, k.rand needs prefix
        pos(k.rand(0, k.width()), k.height()), // Use destructured pos, k.rand/width/height need prefix
        origin('botleft'), // Use destructured component function
        color(0, 0, 255), // Use destructured component function
        area(),           // Use destructured component function
        move(UP, SCROLL_SPEED), // Use destructured move and UP constant
        cleanup(),        // Use destructured component function
        "obstacle"
    ]);
}

// Start spawning obstacles periodically
// Spawn a new obstacle every 1.5 seconds (adjust timing as needed)
k.loop(1.5, () => { // Use k.loop
    spawnObstacle();
});
