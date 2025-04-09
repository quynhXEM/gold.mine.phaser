# Gold Mining Game

A classic gold mining game built with Phaser 3.

## How to Play

1. Click the "Start Game" button on the start screen to begin.
2. The hook will swing back and forth automatically like a pendulum.
3. Press the down arrow key or space bar to extend the hook when it's pointing in the direction of gold.
4. The hook will continue extending until it hits the border of the game or an obstacle (gold or rock).
5. When the hook hits something or the border, it automatically retracts.
6. Collect gold to increase your score. Different sizes of gold are worth different points:
   - Small gold: 10 points (faster to pull)
   - Medium gold: 25 points (moderate pull speed)
   - Large gold: 50 points (slower to pull)
7. Rocks can also be collected for a score bonus, but they are heavier and pull up more slowly:
   - Small rocks: 3 points (moderately slow)
   - Medium rocks: 5 points (slow)
   - Large rocks: 8 points (very slow)
8. Both gold and rocks appear in random sizes. Larger objects are worth more points but take longer to retrieve.
9. Visit the shop to purchase upgrades:
   - Better Rope: Pull gold and rocks faster
   - Stronger Hook: Carry more gold
   - Dynamite: Break rocks that block your path
10. Try to collect as much gold as possible before the time runs out!

## Setup

This game requires a web server to run. You can use any simple local server like:

- Node.js with http-server: `npx http-server`
- Python's built-in server: `python -m http.server`
- Or simply run: `node server.js` to use the included Node.js server

Then open your browser and navigate to `http://localhost:8080` (or whichever port your server uses).

## Controls

- Down Arrow Key or Space Bar: Extend the hook
- Shop button: Open the shop
- Back button in shop: Return to game

## Technologies Used

- Phaser 3 game framework
- HTML5
- JavaScript 