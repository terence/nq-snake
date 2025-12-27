const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const box = 25;
let canvasWidth = 800;
let canvasHeight = 600;
let snake, direction, food, score, gameInterval, isGameOver;

function setDirection(nextDirection) {
    if (isGameOver) return;
    if (nextDirection === 'LEFT' && direction !== 'RIGHT') direction = 'LEFT';
    if (nextDirection === 'UP' && direction !== 'DOWN') direction = 'UP';
    if (nextDirection === 'RIGHT' && direction !== 'LEFT') direction = 'RIGHT';
    if (nextDirection === 'DOWN' && direction !== 'UP') direction = 'DOWN';
}

function resizeCanvasToViewport() {
    const dpr = Math.max(1, Math.min(3, window.devicePixelRatio || 1));
    const margin = 16;
    const maxCssWidth = Math.min(800, Math.max(240, window.innerWidth - margin * 2));
    const maxCssHeight = Math.min(600, Math.max(240, window.innerHeight - 260));

    const cols = Math.max(12, Math.floor(maxCssWidth / box));
    const rows = Math.max(12, Math.floor(maxCssHeight / box));
    canvasWidth = cols * box;
    canvasHeight = rows * box;

    canvas.style.width = canvasWidth + 'px';
    canvas.style.height = canvasHeight + 'px';
    canvas.width = Math.floor(canvasWidth * dpr);
    canvas.height = Math.floor(canvasHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function resetGame() {
    resizeCanvasToViewport();

    const startCol = Math.floor((canvasWidth / box) / 2);
    const startRow = Math.floor((canvasHeight / box) / 2);

    snake = [
        { x: startCol * box, y: startRow * box },
        { x: (startCol - 1) * box, y: startRow * box },
        { x: (startCol - 2) * box, y: startRow * box }
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
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
    }
    if (e.key === 'ArrowLeft') setDirection('LEFT');
    if (e.key === 'ArrowUp') setDirection('UP');
    if (e.key === 'ArrowRight') setDirection('RIGHT');
    if (e.key === 'ArrowDown') setDirection('DOWN');
});

let swipeStartX = null;
let swipeStartY = null;
let swipeActive = false;
const SWIPE_MIN_DISTANCE = 18;

function onPointerDown(e) {
    swipeActive = true;
    swipeStartX = e.clientX;
    swipeStartY = e.clientY;
}

function onPointerMove(e) {
    if (!swipeActive || swipeStartX == null || swipeStartY == null) return;
    const dx = e.clientX - swipeStartX;
    const dy = e.clientY - swipeStartY;
    const adx = Math.abs(dx);
    const ady = Math.abs(dy);
    if (Math.max(adx, ady) < SWIPE_MIN_DISTANCE) return;

    if (adx > ady) {
        setDirection(dx > 0 ? 'RIGHT' : 'LEFT');
    } else {
        setDirection(dy > 0 ? 'DOWN' : 'UP');
    }

    swipeStartX = e.clientX;
    swipeStartY = e.clientY;
}

function onPointerUp() {
    swipeActive = false;
    swipeStartX = null;
    swipeStartY = null;
}

canvas.addEventListener('pointerdown', onPointerDown, { passive: true });
canvas.addEventListener('pointermove', onPointerMove, { passive: true });
canvas.addEventListener('pointerup', onPointerUp, { passive: true });
canvas.addEventListener('pointercancel', onPointerUp, { passive: true });

canvas.addEventListener('touchstart', e => e.preventDefault(), { passive: false });
canvas.addEventListener('touchmove', e => e.preventDefault(), { passive: false });

window.addEventListener('resize', () => {
    const prevWidth = canvasWidth;
    const prevHeight = canvasHeight;
    resizeCanvasToViewport();
    const needsReset = !snake || snake.some(s => s.x < 0 || s.y < 0 || s.x >= canvasWidth || s.y >= canvasHeight);
    if (needsReset || prevWidth !== canvasWidth || prevHeight !== canvasHeight) {
        resetGame();
        return;
    }
    draw();
});

document.getElementById('restartBtn').addEventListener('click', resetGame);

function gameLoop() {
    moveSnake();
    draw();
}

resetGame();
