// Initialize Kaboom with a black background
kaboom({
    background: [0, 0, 0], // Set background color to black (RGB: 0, 0, 0)
});

// Define game constants
// const PLAYER_SPEED = 200; // Pixels per second player moves horizontally // Temporarily commented out
const SCROLL_SPEED = 120; // Pixels per second obstacles move up

// Add the player character
const player = add([
    rect(40, 40), // Player shape: 40x40 rectangle
    color(255, 0, 0), // Color: Red
    pos(width() / 2, height() - 60), // Position: Center horizontally, near bottom vertically
    origin('center'), // Origin at the center for easier positioning and movement
    area(), // Give it a collision area
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
