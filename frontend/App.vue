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
        <canvas ref="nextRef" :width="NEXT_SIZE * 4" :height="NEXT_SIZE * 4"></canvas>
      </div>

      <p class="keys">← / → move · ↑ rotate · ↓ drop</p>
    </aside>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";

/* ============ CONFIG: edit these ============ */
const UNITS = 30;            // pixel size of one cell
const WIDTH = 10;            // columns (minimum 4 so the I piece fits)
const HEIGHT = 20;           // rows
const BASE_DROP_MS = 800;    // time between automatic drops at level 1
const MIN_DROP_MS = 80;      // fastest possible drop interval
const LEVEL_SPEEDUP = 0.85;  // drop interval multiplied by this each level
const LINES_PER_LEVEL = 10;
const LINE_SCORES = [0, 100, 300, 500, 800]; // points for 0..4 lines (times level)
const SHOW_GHOST = true;
const SHOW_GRID = true;
const NEXT_SIZE = 24;        // cell size in the "next" preview
const COLORS = { bg: "#262930", grid: "#2e3139", text: "#ffffff" };
const PIECES = {             // 1 = filled cell; add your own shapes here
  I: { color: "#4cc3d9", shape: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]] },
  O: { color: "#e8c547", shape: [[1,1],[1,1]] },
  T: { color: "#a56bd1", shape: [[0,1,0],[1,1,1],[0,0,0]] },
  S: { color: "#5cb85c", shape: [[0,1,1],[1,1,0],[0,0,0]] },
  Z: { color: "#e2574c", shape: [[1,1,0],[0,1,1],[0,0,0]] },
  J: { color: "#4a72d4", shape: [[1,0,0],[1,1,1],[0,0,0]] },
  L: { color: "#e8913a", shape: [[0,0,1],[1,1,1],[0,0,0]] },
};
/* ============================================ */

// Reactive state (shown in the template)
const score = ref(0);
const lines = ref(0);
const level = ref(1);
const canvasRef = ref(null);
const nextRef = ref(null);

// Game state (not reactive: redrawn every frame on the canvas)
// board[row][col], row 0 is the top. null = empty, otherwise a color. Locked cells only.
let ctx, nctx, frameId;
let board, piece, nextType, bag, over, last, acc;

const emptyBoard = () => Array.from({ length: HEIGHT }, () => Array(WIDTH).fill(null));
const rotateMatrix = m => m[0].map((_, c) => m.map(r => r[c]).reverse()); // clockwise

const cellsOf = p => {
  const out = [];
  p.shape.forEach((row, r) => row.forEach((v, c) => { if (v) out.push({ x: p.x + c, y: p.y + r }); }));
  return out;
};
const isValid = p =>
  cellsOf(p).every(({ x, y }) => x >= 0 && x < WIDTH && y < HEIGHT && (y < 0 || !board[y][x]));

function nextFromBag() { // 7-bag randomizer: every piece appears before any repeats
  if (!bag.length) {
    bag = Object.keys(PIECES);
    for (let i = bag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [bag[i], bag[j]] = [bag[j], bag[i]];
    }
  }
  return bag.pop();
}

function spawn() {
  const type = nextType;
  nextType = nextFromBag();
  const def = PIECES[type];
  piece = { type, color: def.color, shape: def.shape.map(r => [...r]), x: 0, y: 0 };
  piece.x = Math.floor((WIDTH - piece.shape[0].length) / 2);
  if (!isValid(piece)) over = true;
  drawNext();
}

// "build a candidate, validate it, keep it if valid"
function tryMove(dx, dy) {
  const next = { ...piece, x: piece.x + dx, y: piece.y + dy };
  if (isValid(next)) { piece = next; return true; }
  return false;
}
function tryRotate() {
  const shape = rotateMatrix(piece.shape);
  for (const kick of [0, -1, 1, -2, 2]) { // simple wall kicks
    const next = { ...piece, shape, x: piece.x + kick };
    if (isValid(next)) { piece = next; return; }
  }
}

function lock() {
  cellsOf(piece).forEach(({ x, y }) => { if (y >= 0) board[y][x] = piece.color; });
  let cleared = 0;
  for (let y = HEIGHT - 1; y >= 0; y--) {
    if (board[y].every(Boolean)) {
      board.splice(y, 1);
      board.unshift(Array(WIDTH).fill(null));
      cleared++;
      y++; // re-check the same index after shifting
    }
  }
  if (cleared) {
    score.value += (LINE_SCORES[Math.min(cleared, 4)] || 0) * level.value;
    lines.value += cleared;
    level.value = 1 + Math.floor(lines.value / LINES_PER_LEVEL);
  }
  spawn();
}

function hardDrop() {
  let n = 0;
  while (tryMove(0, 1)) n++;
  score.value += n * 2;
  lock();
}

const dropInterval = () =>
  Math.max(MIN_DROP_MS, BASE_DROP_MS * Math.pow(LEVEL_SPEEDUP, level.value - 1));

/* ---------- drawing ---------- */
function drawCell(c, x, y, color, size, alpha = 1) {
  c.globalAlpha = alpha;
  c.fillStyle = color;
  c.fillRect(x * size + 1, y * size + 1, size - 2, size - 2);
  c.globalAlpha = 1;
}

function draw() {
  const w = WIDTH * UNITS, h = HEIGHT * UNITS;
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, w, h);

  if (SHOW_GRID) {
    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 1; x < WIDTH; x++) { ctx.moveTo(x * UNITS + .5, 0); ctx.lineTo(x * UNITS + .5, h); }
    for (let y = 1; y < HEIGHT; y++) { ctx.moveTo(0, y * UNITS + .5); ctx.lineTo(w, y * UNITS + .5); }
    ctx.stroke();
  }

  board.forEach((row, y) => row.forEach((color, x) => color && drawCell(ctx, x, y, color, UNITS)));

  if (!over) {
    if (SHOW_GHOST) {
      const ghost = { ...piece };
      while (isValid({ ...ghost, y: ghost.y + 1 })) ghost.y++;
      cellsOf(ghost).forEach(({ x, y }) => y >= 0 && drawCell(ctx, x, y, piece.color, UNITS, .25));
    }
    cellsOf(piece).forEach(({ x, y }) => y >= 0 && drawCell(ctx, x, y, piece.color, UNITS));
  }

  if (over) {
    ctx.fillStyle = "rgba(0,0,0,.55)";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = COLORS.text;
    ctx.textAlign = "center";
    ctx.font = `600 ${Math.max(16, UNITS * .9)}px system-ui, sans-serif`;
    ctx.fillText("Game over", w / 2, h / 2);
  }
}

function drawNext() {
  nctx.clearRect(0, 0, NEXT_SIZE * 4, NEXT_SIZE * 4);
  const def = PIECES[nextType];
  const h = def.shape.length, w = def.shape[0].length;
  def.shape.forEach((row, r) =>
    row.forEach((v, c) => v && drawCell(nctx, c + (4 - w) / 2, r + (4 - h) / 2, def.color, NEXT_SIZE)));
}

/* ---------- game loop ---------- */
function reset() {
  board = emptyBoard();
  bag = [];
  score.value = 0;
  lines.value = 0;
  level.value = 1;
  over = false;
  acc = 0;
  nextType = nextFromBag();
  spawn();
}

function step(now) {
  frameId = requestAnimationFrame(step);
  const dt = now - (last ?? now);
  last = now;
  if (!over) {
    acc += dt; // time-based gravity: same speed on any monitor refresh rate
    const interval = dropInterval();
    while (acc >= interval) {
      acc -= interval;
      if (!tryMove(0, 1)) { lock(); break; }
    }
  }
  draw();
}

/* ---------- input ---------- */
function press(key) {
  if (over) return;
  if (key === "ArrowLeft") tryMove(-1, 0);
  else if (key === "ArrowRight") tryMove(1, 0);
  else if (key === "ArrowUp") tryRotate();
  else if (key === "ArrowDown") hardDrop();
}

function onKeyDown(e) {
  if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) e.preventDefault();
  press(e.key);
}
onMounted(() => {
  ctx = canvasRef.value.getContext("2d");
  nctx = nextRef.value.getContext("2d");
  window.addEventListener("keydown", onKeyDown);
  reset();
  frameId = requestAnimationFrame(step);
});

// Clean up so the loop and listeners don't keep running after the component is gone
onBeforeUnmount(() => {
  cancelAnimationFrame(frameId);
  window.removeEventListener("keydown", onKeyDown);
});
</script>