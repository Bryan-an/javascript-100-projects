import './style.css';

const canvas = document.querySelector('canvas');
const $score = document.querySelector('#score');
const context = canvas.getContext('2d');

const BLOCK_SIZE = 20;
const BOARD_WIDTH = 14;
const BOARD_HEIGHT = 30;

let score = 0;

canvas.width = BLOCK_SIZE * BOARD_WIDTH;
canvas.height = BLOCK_SIZE * BOARD_HEIGHT;

context.scale(BLOCK_SIZE, BLOCK_SIZE);

const board = createBoard(BOARD_WIDTH, BOARD_HEIGHT);

function createBoard(width, height) {
  return Array.from({ length: height }, () => new Array(width).fill(0));
}

const piece = {
  position: { x: 5, y: 5 },
  shape: [
    [1, 1],
    [1, 1],
  ],
};

const SHAPES = [
  [
    [1, 1],
    [1, 1],
  ],
  [[1, 1, 1, 1]],
  [
    [1, 1, 0],
    [0, 1, 1],
  ],
  [
    [0, 1, 1],
    [1, 1, 0],
  ],
  [
    [1, 1, 1],
    [0, 1, 0],
  ],
  [
    [1, 1, 1],
    [1, 0, 0],
  ],
  [
    [1, 1, 1],
    [0, 0, 1],
  ],
];

let startTime;

function update(timestamp = 0) {
  if (!startTime) startTime = timestamp;
  const elapsedTime = timestamp - startTime;

  if (elapsedTime > 1000) {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    startTime = timestamp;
  }

  draw();
  window.requestAnimationFrame(update);
}

function draw() {
  context.fillStyle = '#000';
  context.fillRect(0, 0, canvas.width, canvas.height);

  board.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value === 1) {
        context.fillStyle = 'yellow';
        context.fillRect(x, y, 1, 1);
      }
    });
  });

  piece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value === 1) {
        context.fillStyle = 'red';
        context.fillRect(x + piece.position.x, y + piece.position.y, 1, 1);
      }
    });
  });
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') {
    piece.position.x--;
    if (checkCollision()) piece.position.x++;
  }

  if (event.key === 'ArrowRight') {
    piece.position.x++;
    if (checkCollision()) piece.position.x--;
  }

  if (event.key === 'ArrowDown') {
    piece.position.y++;

    if (checkCollision()) {
      piece.position.y--;
      solidifyPiece();
      removeRows();
    }
  }

  if (event.key === 'ArrowUp') {
    const previousShape = piece.shape;
    piece.shape = rotateShape(piece.shape);

    if (checkCollision()) {
      piece.shape = previousShape;
    }
  }
});

function checkCollision() {
  return piece.shape.some((row, y) => {
    return row.some((value, x) => {
      if (value === 0) return false;

      const boardX = x + piece.position.x;
      const boardY = y + piece.position.y;

      if (boardY >= BOARD_HEIGHT) return true;
      if (boardX < 0 || boardX >= BOARD_WIDTH) return true;
      return board[boardY][boardX] === 1;
    });
  });
}

function solidifyPiece() {
  piece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value === 1) {
        const boardX = x + piece.position.x;
        const boardY = y + piece.position.y;
        board[boardY][boardX] = 1;
      }
    });
  });

  if (piece.position.y === 0) {
    window.alert('Game Over');
    board.forEach((row) => row.fill(0));
  }

  piece.shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];

  piece.position.x = Math.floor(
    Math.random() * (BOARD_WIDTH - piece.shape[0].length)
  );

  piece.position.y = 0;
}

function removeRows() {
  const rowsToRemove = board.reduce((acc, row, y) => {
    if (row.every((value) => value === 1)) {
      acc.push(y);
    }

    return acc;
  }, []);

  rowsToRemove.forEach((y) => {
    board.splice(y, 1);
    board.unshift(new Array(BOARD_WIDTH).fill(0));
    score += 10;
    $score.innerText = score;
  });
}

function rotateShape(shape) {
  return Array.from({ length: shape[0].length }, (_, i) =>
    shape.toReversed().map((row) => row.at(i))
  );
}

update();
