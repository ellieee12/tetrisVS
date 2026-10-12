<!-- src/App.vue -->
<template>
  <div class="tetris">
    <canvas ref="canvasRef" :width="WIDTH * UNITS" :height="HEIGHT * UNITS"></canvas>

    <aside>
      <div class="box"><small>Score</small><b>{{ score }}</b></div>
      <div class="box"><small>Lines</small><b>{{ lines }}</b></div>
      <div class="box"><small>Level</small><b>{{ level }}</b></div>
      <div class="box">
        <small>Next</small>
        <canvas ref="nextRef" :width="NEXT_UNITS * 4" :height="NEXT_UNITS * 4"></canvas>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { ref, onMounted, onUpdated, onBeforeUnmount } from "vue";

/* congfig */
const UNITS = 30;
const NEXT_UNITS = 24;
const WIDTH = 10;
const HEIGHT = 20;
const BASE_DROP_MS = 800;
const MIN_DROP_MS = 80;
const LEVEL_SPEEDUP = 0.85;
const LINES_PER_LEVEL = 10;
const LINE_SCORES = [100, 300, 500, 800];
const PIECES = {
  I: { color: "#4cc3d9", shape: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]] },
  O: { color: "#e8c547", shape: [[1,1],[1,1]] },
  T: { color: "#a56bd1", shape: [[0,1,0],[1,1,1],[0,0,0]] },
  S: { color: "#5cb85c", shape: [[0,1,1],[1,1,0],[0,0,0]] },
  Z: { color: "#e2574c", shape: [[1,1,0],[0,1,1],[0,0,0]] },
  J: { color: "#4a72d4", shape: [[1,0,0],[1,1,1],[0,0,0]] },
  L: { color: "#e8913a", shape: [[0,0,1],[1,1,1],[0,0,0]] },
};

const score = ref(0);
const lines = ref(0);
const level = ref(1);
const canvasRef = ref(null);
const nextRef = ref(null);

const TYPES = Object.keys(PIECES);
const randomType = () => TYPES[Math.floor(Math.random() * TYPES.length)];

let ctx, nctx, timer;
let board = Array.from({ length: HEIGHT }, () => Array(WIDTH).fill(null));
let nextType = randomType();
let piece;
let over = false;

const cellsOf = p => p.shape.flatMap((row, r) => row.flatMap((v, c) => (v ? [{ x: p.x + c, y: p.y + r }] : [])));
const isValid = p => cellsOf(p).every(({ x, y }) => x >= 0 && x < WIDTH && y < HEIGHT && !board[y][x]);

function tryMove(dx, dy) {
  const next = { ...piece, x: piece.x + dx, y: piece.y + dy };
  if (isValid(next)) piece = next;
  return next === piece;
}

function tryRotate() {
  const shape = piece.shape[0].map((_, c) => piece.shape.map(r => r[c]).reverse());
  for (const kick of [0, -1, 1, -2, 2]) {
    const next = { ...piece, shape, x: piece.x + kick };
    if (isValid(next)) { piece = next; return; }
  }
}

function spawn() {
  const { color, shape } = PIECES[nextType];
  piece = { color, shape, x: Math.floor((WIDTH - shape[0].length) / 2), y: 0 };
  if (!isValid(piece)) over = true;
  nextType = randomType();
}

function lock() {
  cellsOf(piece).forEach(({ x, y }) => (board[y][x] = piece.color));
  board = board.filter(row => !row.every(Boolean));
  const cleared = HEIGHT - board.length;
  while (board.length < HEIGHT) board.unshift(Array(WIDTH).fill(null));
  if (cleared) {
    score.value += LINE_SCORES[cleared - 1] * level.value;
    lines.value += cleared;
    level.value = 1 + Math.floor(lines.value / LINES_PER_LEVEL);
  }
  spawn();
}

/* drawing */
const drawCell = (c, x, y, color, size, alpha = 1) => {
  c.globalAlpha = alpha;
  c.fillStyle = color;
  c.fillRect(x * size + 1, y * size + 1, size - 2, size - 2);
  c.globalAlpha = 1;
};

function draw() {
  drawNext();
  ctx.fillStyle = "#262930";
  ctx.fillRect(0, 0, WIDTH * UNITS, HEIGHT * UNITS);
  board.forEach((row, y) => row.forEach((color, x) => color && drawCell(ctx, x, y, color, UNITS)));
  if (over) {
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.font = "bold 28px sans-serif";
    ctx.fillText("Game over", (WIDTH * UNITS) / 2, (HEIGHT * UNITS) / 2);
    return;
  }
  const ghost = { ...piece };
  while (isValid({ ...ghost, y: ghost.y + 1 })) ghost.y++;
  cellsOf(ghost).forEach(({ x, y }) => drawCell(ctx, x, y, piece.color, UNITS, 0.25));
  cellsOf(piece).forEach(({ x, y }) => drawCell(ctx, x, y, piece.color, UNITS));
}

function drawNext() {
  const { color, shape } = PIECES[nextType];
  const cells = cellsOf({ shape, x: 0, y: 0 });
  const off = k => (3 - Math.max(...cells.map(c => c[k])) - Math.min(...cells.map(c => c[k]))) / 2;
  nctx.clearRect(0, 0, NEXT_UNITS * 4, NEXT_UNITS * 4);
  cells.forEach(({ x, y }) => drawCell(nctx, x + off("x"), y + off("y"), color, NEXT_UNITS));
}

/* game loop & input */
function tick() {
  if (over) return;
  if (!tryMove(0, 1)) lock();
  draw();
  if (!over) timer = setTimeout(tick, Math.max(MIN_DROP_MS, BASE_DROP_MS * LEVEL_SPEEDUP ** (level.value - 1)));
}

function onKey(e) {
  if (over || !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " "].includes(e.key)) return;
  e.preventDefault();
  if (e.key === "ArrowLeft") tryMove(-1, 0);
  else if (e.key === "ArrowRight") tryMove(1, 0);
  else if (e.key === "ArrowUp") tryRotate();
  else if (e.key === "ArrowDown") tryMove(0, 1);
  else if (e.key === " ") { while (tryMove(0, 1)); lock(); }
  draw();
}

onMounted(() => {
  ctx = canvasRef.value.getContext("2d", {alpha: false});
  nctx = nextRef.value.getContext("2d", {alpha: false});
  window.addEventListener("keydown", onKey);
  spawn();
  tick();
});

onUpdated(draw);

onBeforeUnmount(() => {
  clearTimeout(timer);
  window.removeEventListener("keydown", onKey);
});
</script>