// Initialize Kaboom with a black background
// Functions will be available globally
kaboom({
    background: [0, 0, 0], // Set background color to black (RGB: 0, 0, 0)
});

// Define game constants
const PLAYER_SPEED = 200; // Pixels per second player moves horizontally
const SCROLL_SPEED = 120; // Pixels per second obstacles move up

// Add the player character
const player = add([ // Use global add
    rect(40, 40), // Use global component functions
    color(255, 0, 0),
    pos(width() / 2, height() - 60), // Use global pos, width, height
    origin('center'), // Use global origin
    area(), // Use global area
    "player"
]);

// Player movement
onKeyPress("left", () => { // Use global onKeyPress
    player.moveBy(-PLAYER_SPEED, 0);
});

onKeyPress("right", () => { // Use global onKeyPress
    player.moveBy(PLAYER_SPEED, 0);
});

// Function to spawn an obstacle
function spawnObstacle() {
    add([ // Use global add
        rect(rand(20, 50), rand(20, 50)), // Use global rect, rand
        pos(rand(0, width()), height()), // Use global pos, rand, width, height
        origin('botleft'), // Use global origin
        color(0, 0, 255), // Use global color
        area(), // Use global area
        move(UP, SCROLL_SPEED), // Use global move, UP
        cleanup(), // Use global cleanup
        "obstacle"
    ]);
}

// Start spawning obstacles periodically
// Spawn a new obstacle every 1.5 seconds (adjust timing as needed)
loop(1.5, () => { // Use global loop
    spawnObstacle();
});
