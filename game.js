// Initialize Kaboom, disable global imports, set background
const k = kaboom({
    global: false, // Prevent Kaboom functions from polluting the global namespace
    background: [0, 0, 0], // Set background color to black (RGB: 0, 0, 0)
});

// Log the Kaboom context to inspect its contents
console.log("Kaboom context:", k);

// Define game constants
// const PLAYER_SPEED = 200; // Pixels per second player moves horizontally // Temporarily commented out
const SCROLL_SPEED = 120; // Pixels per second obstacles move up

// Add the player character
const player = k.add([ // Use k.add
    k.rect(40, 40), // Use k.rect
    k.color(255, 0, 0), // Use k.color
    k.pos(k.width() / 2, k.height() - 60), // Use k.pos, k.width, k.height
    // k.origin('center'), // Temporarily comment out k.origin to see if it's the specific issue
    k.area(), // Use k.area
    "player" // Tag it as "player"
]);

// Player movement - Temporarily removed
// onKeyPress("left", () => {
//     player.moveBy(-PLAYER_SPEED, 0);
// });
//
// onKeyPress("right", () => {
//     player.moveBy(PLAYER_SPEED, 0);
// });

// Obstacle spawning - Temporarily removed
// function spawnObstacle() {
//     add([
//         rect(rand(20, 50), rand(20, 50)), // Obstacle shape: random width/height rectangle
//         pos(rand(0, width()), height()), // Position: random X, at the very bottom (Y = canvas height)
//         origin('botleft'), // Origin at bottom-left simplifies positioning at the bottom edge
//         color(0, 0, 255), // Color: Blue (placeholder)
//         area(),           // Give it a collision area
//         move(UP, SCROLL_SPEED), // Make it move upwards automatically at SCROLL_SPEED
//         cleanup(),        // Automatically destroy the object when it goes out of screen view
//         "obstacle"        // Tag it as an "obstacle"
//     ]);
// }
//
// loop(1.5, () => {
//     spawnObstacle();
// });
