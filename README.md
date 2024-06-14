Tetris Game

This project is a simple implementation of the classic Tetris game using Angular and TypeScript.

Setup:

1. Clone the repository:
   git clone https://github.com/your-username/tetris-game.git

2. Install dependencies:
   cd tetris-game
   npm install

3. Run the development server:
   ng serve

   Open your browser and navigate to http://localhost:4200/ to play the Tetris game.

Features:

- Basic Tetris gameplay mechanics.
- Pieces drop automatically with increasing speed.
- Controls:
    - Left Arrow: Move piece left.
    - Right Arrow: Move piece right.
    - Down Arrow: Drop piece faster.
    - Q/W: Rotate piece counterclockwise/clockwise.

How to Play:

- Use the arrow keys to move and rotate pieces to create horizontal lines without gaps.
- When a line is completed, it will disappear, and you will earn points.
- The game ends when the pieces stack up to the top of the screen.

Folder Structure:

- src/app/tetris/: Contains the Tetris game component files.
    - tetris.component.ts: TypeScript logic for the Tetris game.
    - tetris.component.html: HTML template for the Tetris game.
    - tetris.component.css: CSS styles for the Tetris game.

Technologies Used:

- Angular: Frontend framework for building the application.
- TypeScript: Programming language for writing scalable web applications.
- HTML5 Canvas: Used for rendering the game graphics and animations.

Contributing:

Contributions are welcome! Please fork the repository and create a pull request with your improvements.

License:

This project is licensed under the MIT License - see the LICENSE file for details.
