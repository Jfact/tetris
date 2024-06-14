import { Component, HostListener, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';

// Define the structure for Position and Player objects
interface Position {
  x: number;
  y: number;
}

interface Player {
  pos: Position;
  matrix: number[][];
}

// Define the type for Tetris pieces
type PieceType = 'T' | 'O' | 'L' | 'J' | 'I' | 'S' | 'Z';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormsModule],
  template: `
    <!-- app.component.html -->
    <div>
      <label for="username">Username:</label>
      <input id="username" [(ngModel)]="username" placeholder="Enter your username">
    </div>
    <canvas id="tetris"></canvas>
    <div>
      <p>Score: {{ score }}</p>
    </div>
  `,
  styles: [`
    div {
      font-family: Arial, sans-serif;
      margin-bottom: 10px;
    }
    #username {
      margin-bottom: 20px;
    }
    canvas {
      display: block;
      border: 1px solid black;
      margin: 20px auto;
      width: 240px;  // Adjust to match ngOnInit width
      height: 400px; // Adjust to match ngOnInit height
    }
    p {
      text-align: center;
      font-size: 20px;
    }
  `]
})
export class AppComponent implements OnInit {

  private canvas!: HTMLCanvasElement;
  private context!: CanvasRenderingContext2D;
  private arena: number[][] = this.createMatrix(12, 20);
  private player: Player = {
    pos: { x: 0, y: 0 },
    matrix: this.createPiece('T')
  };
  private dropCounter = 0;
  private dropInterval = 1000;
  private lastTime = 0;
  public score = 0;
  public username = '';
  private speedIncrement = 0.999;  // 0.1% speed increase

  // Initialize the game
  ngOnInit(): void {
    this.canvas = document.getElementById('tetris') as HTMLCanvasElement;
    this.canvas.width = 240;  // Set canvas width
    this.canvas.height = 400; // Set canvas height
    this.context = this.canvas.getContext('2d')!;
    this.context.scale(20, 20); // Scale canvas context
    this.playerReset(); // Reset player position and piece
    this.update(); // Start the game loop
  }

  // Create a matrix filled with zeros
  private createMatrix(width: number, height: number): number[][] {
    const matrix: number[][] = [];
    while (height--) {
      matrix.push(new Array(width).fill(0));
    }
    return matrix;
  }

  // Create Tetris pieces based on the type
  private createPiece(type: PieceType): number[][] {
    switch (type) {
      case 'T':
        return [
          [0, 0, 0],
          [1, 1, 1],
          [0, 1, 0],
        ];
      case 'O':
        return [
          [2, 2],
          [2, 2],
        ];
      case 'L':
        return [
          [0, 3, 0],
          [0, 3, 0],
          [0, 3, 3],
        ];
      case 'J':
        return [
          [0, 4, 0],
          [0, 4, 0],
          [4, 4, 0],
        ];
      case 'I':
        return [
          [0, 5, 0, 0],
          [0, 5, 0, 0],
          [0, 5, 0, 0],
          [0, 5, 0, 0],
        ];
      case 'S':
        return [
          [0, 6, 6],
          [6, 6, 0],
          [0, 0, 0],
        ];
      case 'Z':
        return [
          [7, 7, 0],
          [0, 7, 7],
          [0, 0, 0],
        ];
    }
  }

  // Merge the player's piece with the arena
  private merge(arena: number[][], player: Player): void {
    player.matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          arena[y + player.pos.y][x + player.pos.x] = value;
        }
      });
    });
  }

  // Rotate the player's piece
  private playerRotate(dir: number): void {
    const pos = this.player.pos.x;
    let offset = 1;
    this.rotate(this.player.matrix, dir);
    while (this.collide(this.arena, this.player)) {
      this.player.pos.x += offset;
      offset = -(offset + (offset > 0 ? 1 : -1));
      if (offset > this.player.matrix[0].length) {
        this.rotate(this.player.matrix, -dir);
        this.player.pos.x = pos;
        return;
      }
    }
  }

  // Rotate a matrix (Tetris piece)
  private rotate(matrix: number[][], dir: number): void {
    for (let y = 0; y < matrix.length; ++y) {
      for (let x = 0; x < y; ++x) {
        [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
      }
    }
    if (dir > 0) {
      matrix.forEach(row => row.reverse());
    } else {
      matrix.reverse();
    }
  }

  // Drop the player's piece
  private playerDrop(): void {
    this.player.pos.y++;
    if (this.collide(this.arena, this.player)) {
      this.player.pos.y--;
      this.merge(this.arena, this.player);
      this.playerReset();
      this.arenaSweep();
    }
    this.dropCounter = 0;
  }

  // Move the player's piece horizontally
  private playerMove(offset: number): void {
    this.player.pos.x += offset;
    if (this.collide(this.arena, this.player)) {
      this.player.pos.x -= offset;
    }
  }

  // Check for collision between the player's piece and the arena
  private collide(arena: number[][], player: Player): boolean {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; ++y) {
      for (let x = 0; x < m[y].length; ++x) {
        if (m[y][x] !== 0 &&
            (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
          return true;
        }
      }
    }
    return false;
  }

  // Reset the player's position and piece
  private playerReset(): void {
    const pieces: PieceType[] = 'TJLOSZI'.split('') as PieceType[];
    this.player.matrix = this.createPiece(pieces[(pieces.length * Math.random()) | 0]);
    this.player.pos.y = 0;
    this.player.pos.x = ((this.arena[0].length / 2) | 0) -
        ((this.player.matrix[0].length / 2) | 0);

    // Check for collision to determine game over
    if (this.collide(this.arena, this.player)) {
      this.arena.forEach(row => row.fill(0));
      this.score = 0; // Reset score when game is over
      this.dropInterval = 1000; // Reset speed when game is over
    }
  }

  // Clear completed lines and update score
  private arenaSweep(): void {
    let rowCount = 1;
    outer: for (let y = this.arena.length - 1; y > 0; --y) {
      for (let x = 0; x < this.arena[y].length; ++x) {
        if (this.arena[y][x] === 0) {
          continue outer;
        }
      }

      const row = this.arena.splice(y, 1)[0].fill(0);
      this.arena.unshift(row);
      ++y;

      this.score += rowCount; // Increment score by 1 for each row
      rowCount *= 2; // Multiply rowCount by 2 for the next row

      this.dropInterval *= this.speedIncrement; // Increase speed by 0.1%
    }
  }

  // Main game loop
  private update(time: number = 0): void {
    const deltaTime = time - this.lastTime;
    this.lastTime = time;

    this.dropCounter += deltaTime;
    if (this.dropCounter > this.dropInterval) {
      this.playerDrop();
    }

    this.draw();
    requestAnimationFrame(this.update.bind(this));
  }

  // Handle keyboard events for player controls
  @HostListener('window:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowLeft') {
      this.playerMove(-1);
    } else if (event.key === 'ArrowRight') {
      this.playerMove(1);
    } else if (event.key === 'ArrowDown') {
      this.playerDrop();
    } else if (event.key === 'ArrowUp') {
      this.playerRotate(1); // Rotate clockwise
    }
  }

  // Draw the game state
  private draw(): void {
    this.context.fillStyle = '#000';
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawMatrix(this.arena, { x: 0, y: 0 });
    this.drawMatrix(this.player.matrix, this.player.pos);
  }

  // Draw a matrix (Tetris piece or arena) on the canvas
  private drawMatrix(matrix: number[][], offset: Position): void {
    matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0 && this.colors[value] !== null) {
          this.context.fillStyle = this.colors[value]!;
          this.context.fillRect(x + offset.x, y + offset.y, 1, 1);
        }
      });
    });
  }

  // Define colors for the Tetris pieces
  private colors: (string | null)[] = [
    null,
    '#FF0D72', // T
    '#0DC2FF', // O
    '#0DFF72', // L
    '#F538FF', // J
    '#FF8E0D', // I
    '#FFE138', // S
    '#3877FF', // Z
  ];
}
