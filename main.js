const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const box = 25;
const canvasWidth = 800;
const canvasHeight = 600;
let snake, direction, food, score, gameInterval, isGameOver;

function resetGame() {
    snake = [
        { x: 10 * box, y: 12 * box },
        { x: 9 * box, y: 12 * box },
        { x: 8 * box, y: 12 * box }
    ];
    direction = 'RIGHT';
    food = randomPosition();
    score = 0;
    isGameOver = false;
    document.getElementById('score').textContent = 'Score: ' + score;
    if (gameInterval) clearInterval(gameInterval);
    draw();
    gameInterval = setInterval(gameLoop, 80);
}

function randomPosition() {
    let pos;
    do {
        pos = {
            x: Math.floor(Math.random() * (canvasWidth / box)) * box,
            y: Math.floor(Math.random() * (canvasHeight / box)) * box
        };
    } while (snake && snake.some(segment => segment.x === pos.x && segment.y === pos.y));
    return pos;
}

function draw() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    // Draw grid
    ctx.save();
    ctx.strokeStyle = '#222b';
    for (let x = 0; x < canvasWidth; x += box) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvasHeight);
        ctx.stroke();
    }
    for (let y = 0; y < canvasHeight; y += box) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvasWidth, y);
        ctx.stroke();
    }
    ctx.restore();

    // Draw snake
    for (let i = 0; i < snake.length; i++) {
        ctx.fillStyle = i === 0 ? '#7fffd4' : '#fff';
        ctx.shadowColor = i === 0 ? '#7fffd4' : '#fff';
        ctx.shadowBlur = i === 0 ? 12 : 0;
        ctx.fillRect(snake[i].x, snake[i].y, box, box);
        ctx.shadowBlur = 0;
    }

    // Draw food
    ctx.save();
    ctx.fillStyle = '#ff4b2b';
    ctx.shadowColor = '#ff4b2b';
    ctx.shadowBlur = 10;
    ctx.fillRect(food.x, food.y, box, box);
    ctx.restore();

    document.getElementById('score').textContent = 'Score: ' + score;

    if (isGameOver) {
        ctx.save();
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = '#181c20';
        ctx.fillRect(0, canvasHeight / 2 - 60, canvasWidth, 120);
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 2.5em Segoe UI, Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over', canvasWidth / 2, canvasHeight / 2);
        ctx.font = '1.2em Segoe UI, Arial';
        ctx.fillText('Press Restart to play again', canvasWidth / 2, canvasHeight / 2 + 40);
        ctx.restore();
    }
}

function moveSnake() {
    if (isGameOver) return;
    let head = { ...snake[0] };
    if (direction === 'LEFT') head.x -= box;
    if (direction === 'UP') head.y -= box;
    if (direction === 'RIGHT') head.x += box;
    if (direction === 'DOWN') head.y += box;

    // Wall collision
    if (
        head.x < 0 || head.x >= canvasWidth ||
        head.y < 0 || head.y >= canvasHeight
    ) {
        endGame();
        return;
    }

    // Self collision
    for (let i = 0; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            endGame();
            return;
        }
    }

    snake.unshift(head);

    // Food collision
    if (head.x === food.x && head.y === food.y) {
        score++;
        food = randomPosition();
    } else {
        snake.pop();
    }
}

function endGame() {
    isGameOver = true;
    clearInterval(gameInterval);
    draw();
}

document.addEventListener('keydown', e => {
    if (isGameOver) return;
    if (e.key === 'ArrowLeft' && direction !== 'RIGHT') direction = 'LEFT';
    if (e.key === 'ArrowUp' && direction !== 'DOWN') direction = 'UP';
    if (e.key === 'ArrowRight' && direction !== 'LEFT') direction = 'RIGHT';
    if (e.key === 'ArrowDown' && direction !== 'UP') direction = 'DOWN';
});

document.getElementById('restartBtn').addEventListener('click', resetGame);

function gameLoop() {
    moveSnake();
    draw();
}

resetGame();
