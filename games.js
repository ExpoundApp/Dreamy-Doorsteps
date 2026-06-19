/* =============================================================
   Dreamy Doorsteps — minigames
   Three canvas games. Each exposes start(canvas, onEnd).
   onEnd is called with the final score; app.js handles rewards.
   ============================================================= */

const Games = (() => {

  /* ============= shared helpers ============= */
  function fitCanvas(canvas) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, w: rect.width, h: rect.height };
  }

  function loop(step) {
    let raf;
    let last = performance.now();
    function frame(t) {
      const dt = Math.min(48, t - last) / 1000;
      last = t;
      if (step(dt) !== false) raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }

  function rand(a, b) { return a + Math.random() * (b - a); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  /* =====================================================
     BUBBLE POP
     Bubbles rise, tap to pop, miss = lose a life.
     ===================================================== */
  function bubblePop(canvas, onEnd, onScore) {
    let { ctx, w, h } = fitCanvas(canvas);
    let bubbles = [];
    let score = 0;
    let lives = 3;
    let spawnTimer = 0;
    let spawnEvery = 0.75;
    let speed = 70;
    let alive = true;
    const colors = ['#F4A6BC', '#A5D8C8', '#C5B3E0', '#F5C26B', '#F4D6E0'];
    const POP_PARTICLE_COUNT = 8;
    let particles = [];

    function spawn() {
      const r = rand(28, 42);
      bubbles.push({
        x: rand(r + 10, w - r - 10),
        y: h + r,
        r,
        color: pick(colors),
        wobble: rand(0, Math.PI * 2),
        ws: rand(1.5, 2.5)
      });
    }

    function pop(b) {
      for (let i = 0; i < POP_PARTICLE_COUNT; i++) {
        const a = (Math.PI * 2 * i) / POP_PARTICLE_COUNT;
        particles.push({
          x: b.x, y: b.y,
          vx: Math.cos(a) * 120, vy: Math.sin(a) * 120,
          life: 0.5, color: b.color
        });
      }
    }

    function onTap(e) {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const cx = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
      const cy = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
      for (let i = bubbles.length - 1; i >= 0; i--) {
        const b = bubbles[i];
        const dx = b.x - cx, dy = b.y - cy;
        if (dx * dx + dy * dy < b.r * b.r) {
          pop(b);
          bubbles.splice(i, 1);
          score++;
          onScore && onScore(score);
          return;
        }
      }
    }
    canvas.addEventListener('touchstart', onTap, { passive: false });
    canvas.addEventListener('mousedown', onTap);

    const stop = loop((dt) => {
      if (!alive) return false;
      // Difficulty ramps with score
      speed = 70 + Math.min(score * 3, 140);
      spawnEvery = Math.max(0.35, 0.75 - score * 0.012);
      spawnTimer += dt;
      while (spawnTimer >= spawnEvery) {
        spawnTimer -= spawnEvery;
        spawn();
      }
      bubbles.forEach(b => {
        b.y -= speed * dt;
        b.wobble += b.ws * dt;
        b.x += Math.sin(b.wobble) * 0.6;
      });
      // Cull bubbles that escaped
      for (let i = bubbles.length - 1; i >= 0; i--) {
        if (bubbles[i].y + bubbles[i].r < 0) {
          bubbles.splice(i, 1);
          lives--;
          if (lives <= 0) {
            alive = false;
            cleanup();
            onEnd(score);
            return false;
          }
        }
      }
      // Particles
      particles.forEach(p => {
        p.x += p.vx * dt; p.y += p.vy * dt;
        p.vy += 200 * dt;
        p.life -= dt;
      });
      particles = particles.filter(p => p.life > 0);

      // ===== draw =====
      ctx.clearRect(0, 0, w, h);
      // soft cloud background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.arc((i * 137 + 60) % w, 60 + (i % 2) * 40, 50, 0, Math.PI * 2);
        ctx.fill();
      }
      bubbles.forEach(b => {
        const grad = ctx.createRadialGradient(b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.2, b.x, b.y, b.r);
        grad.addColorStop(0, 'rgba(255,255,255,0.7)');
        grad.addColorStop(0.4, b.color);
        grad.addColorStop(1, b.color);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.6)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });
      particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.life * 2);
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      });
      // lives
      ctx.fillStyle = '#4A3B52';
      ctx.font = 'bold 18px Fredoka, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('Lives: ' + '❤️'.repeat(lives), 14, 30);
    });

    function cleanup() {
      canvas.removeEventListener('touchstart', onTap);
      canvas.removeEventListener('mousedown', onTap);
    }
    return { stop: () => { alive = false; stop(); cleanup(); } };
  }

  /* =====================================================
     SNAKE GARDEN
     Caterpillar grid-based; swipe to turn.
     ===================================================== */
  function snakeGarden(canvas, onEnd, onScore) {
    let { ctx, w, h } = fitCanvas(canvas);
    const cols = 14;
    const gridSize = Math.floor(w / cols);
    const realCols = Math.floor(w / gridSize);
    const realRows = Math.floor(h / gridSize);
    const offsetX = (w - realCols * gridSize) / 2;
    const offsetY = (h - realRows * gridSize) / 2;

    let snake = [{ x: Math.floor(realCols / 2), y: Math.floor(realRows / 2) }];
    let dir = { x: 1, y: 0 };
    let nextDir = { x: 1, y: 0 };
    let food = randomCell();
    let score = 0;
    let stepTime = 0.18;
    let stepAcc = 0;
    let alive = true;

    function randomCell() {
      let c;
      do {
        c = { x: Math.floor(Math.random() * realCols), y: Math.floor(Math.random() * realRows) };
      } while (snake.some(s => s.x === c.x && s.y === c.y));
      return c;
    }

    // Swipe input
    let startX, startY;
    function onTouchStart(e) {
      e.preventDefault();
      const t = e.touches ? e.touches[0] : e;
      startX = t.clientX; startY = t.clientY;
    }
    function onTouchEnd(e) {
      e.preventDefault();
      const t = e.changedTouches ? e.changedTouches[0] : e;
      const dx = t.clientX - startX, dy = t.clientY - startY;
      if (Math.abs(dx) < 18 && Math.abs(dy) < 18) return;
      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0 && dir.x !== -1) nextDir = { x: 1, y: 0 };
        else if (dx < 0 && dir.x !== 1) nextDir = { x: -1, y: 0 };
      } else {
        if (dy > 0 && dir.y !== -1) nextDir = { x: 0, y: 1 };
        else if (dy < 0 && dir.y !== 1) nextDir = { x: 0, y: -1 };
      }
    }
    function onKey(e) {
      const k = e.key;
      if (k === 'ArrowRight' && dir.x !== -1) nextDir = { x: 1, y: 0 };
      else if (k === 'ArrowLeft' && dir.x !== 1) nextDir = { x: -1, y: 0 };
      else if (k === 'ArrowDown' && dir.y !== -1) nextDir = { x: 0, y: 1 };
      else if (k === 'ArrowUp' && dir.y !== 1) nextDir = { x: 0, y: -1 };
    }
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd, { passive: false });
    canvas.addEventListener('mousedown', onTouchStart);
    canvas.addEventListener('mouseup', onTouchEnd);
    window.addEventListener('keydown', onKey);

    const stop = loop((dt) => {
      if (!alive) return false;
      stepAcc += dt;
      while (stepAcc >= stepTime) {
        stepAcc -= stepTime;
        dir = nextDir;
        const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
        // wall collision
        if (head.x < 0 || head.x >= realCols || head.y < 0 || head.y >= realRows) {
          alive = false; cleanup(); onEnd(score); return false;
        }
        // self collision
        if (snake.some(s => s.x === head.x && s.y === head.y)) {
          alive = false; cleanup(); onEnd(score); return false;
        }
        snake.unshift(head);
        if (head.x === food.x && head.y === food.y) {
          score++;
          onScore && onScore(score);
          stepTime = Math.max(0.08, stepTime * 0.96);
          food = randomCell();
        } else {
          snake.pop();
        }
      }
      // draw
      ctx.clearRect(0, 0, w, h);
      // background garden
      ctx.fillStyle = '#E8F4E0';
      ctx.fillRect(offsetX, offsetY, realCols * gridSize, realRows * gridSize);
      // grid speckle
      ctx.fillStyle = 'rgba(165, 212, 160, 0.25)';
      for (let i = 0; i < realCols; i++) {
        for (let j = 0; j < realRows; j++) {
          if ((i + j) % 2 === 0) {
            ctx.fillRect(offsetX + i * gridSize, offsetY + j * gridSize, gridSize, gridSize);
          }
        }
      }
      // food
      const fx = offsetX + food.x * gridSize + gridSize / 2;
      const fy = offsetY + food.y * gridSize + gridSize / 2;
      ctx.font = `${gridSize * 0.85}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🌸', fx, fy);
      // snake
      snake.forEach((s, i) => {
        const sx = offsetX + s.x * gridSize + gridSize / 2;
        const sy = offsetY + s.y * gridSize + gridSize / 2;
        if (i === 0) {
          ctx.fillStyle = '#74B5A2';
        } else {
          ctx.fillStyle = i % 2 === 0 ? '#A5D8C8' : '#92CCB8';
        }
        ctx.beginPath();
        ctx.arc(sx, sy, gridSize * 0.42, 0, Math.PI * 2);
        ctx.fill();
        if (i === 0) {
          // eyes
          ctx.fillStyle = '#4A3B52';
          ctx.beginPath();
          ctx.arc(sx - gridSize * 0.12, sy - gridSize * 0.1, gridSize * 0.08, 0, Math.PI * 2);
          ctx.arc(sx + gridSize * 0.12, sy - gridSize * 0.1, gridSize * 0.08, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    });

    function cleanup() {
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchend', onTouchEnd);
      canvas.removeEventListener('mousedown', onTouchStart);
      canvas.removeEventListener('mouseup', onTouchEnd);
      window.removeEventListener('keydown', onKey);
    }
    return { stop: () => { alive = false; stop(); cleanup(); } };
  }

  /* =====================================================
     SWEET STACK
     Cupcakes slide left/right, tap to drop. Overhang = trim.
     ===================================================== */
  function sweetStack(canvas, onEnd, onScore) {
    let { ctx, w, h } = fitCanvas(canvas);
    const blockH = 32;
    const baseY = h - 60;
    let stack = [{ x: w / 2 - 80, width: 160, color: '#F4A6BC' }];
    let moving = null;
    let score = 0;
    let alive = true;
    const colors = ['#F4A6BC', '#A5D8C8', '#C5B3E0', '#F5C26B', '#F4D6E0', '#92CCB8'];
    let particles = [];

    function spawnNext() {
      const top = stack[stack.length - 1];
      moving = {
        x: -top.width,
        y: baseY - stack.length * blockH,
        width: top.width,
        color: pick(colors),
        dir: 1,
        speed: 200 + score * 8
      };
    }
    spawnNext();

    function drop() {
      if (!moving) return;
      const top = stack[stack.length - 1];
      const leftDiff = moving.x - top.x;
      const rightDiff = (moving.x + moving.width) - (top.x + top.width);
      // overhang trim
      let newX = moving.x, newW = moving.width;
      if (leftDiff > 0) newW -= leftDiff;
      if (rightDiff > 0) newW -= rightDiff;
      if (leftDiff < 0) { newX = top.x; }
      if (newW <= 4) {
        alive = false; cleanup(); onEnd(score); return;
      }
      // particles for any trimmed overhang
      if (leftDiff < 0) {
        particles.push({ x: moving.x, y: moving.y, w: -leftDiff, color: moving.color, vy: 100 });
      }
      if (rightDiff > 0) {
        particles.push({ x: top.x + top.width, y: moving.y, w: rightDiff, color: moving.color, vy: 100 });
      }
      stack.push({ x: newX, y: moving.y, width: newW, color: moving.color });
      score++;
      onScore && onScore(score);
      spawnNext();
    }

    function onTap(e) {
      e.preventDefault();
      drop();
    }
    canvas.addEventListener('touchstart', onTap, { passive: false });
    canvas.addEventListener('mousedown', onTap);

    const stop = loop((dt) => {
      if (!alive) return false;
      if (moving) {
        moving.x += moving.dir * moving.speed * dt;
        if (moving.x + moving.width > w) { moving.dir = -1; moving.x = w - moving.width; }
        if (moving.x < 0) { moving.dir = 1; moving.x = 0; }
      }
      particles.forEach(p => {
        p.y += p.vy * dt;
        p.vy += 400 * dt;
      });
      particles = particles.filter(p => p.y < h + 40);

      // camera: keep top of stack visible
      const topY = baseY - stack.length * blockH;
      const camY = topY < 100 ? (100 - topY) : 0;

      ctx.clearRect(0, 0, w, h);
      // draw stack
      ctx.save();
      ctx.translate(0, camY);
      stack.forEach((s, i) => {
        const y = baseY - i * blockH;
        // shadow
        ctx.fillStyle = 'rgba(74, 59, 82, 0.08)';
        ctx.fillRect(s.x + 2, y + 2, s.width, blockH);
        // body
        ctx.fillStyle = s.color;
        const r = 6;
        roundRect(ctx, s.x, y, s.width, blockH, r);
        ctx.fill();
        // sprinkles
        if (s.width > 50) {
          ctx.fillStyle = 'rgba(255,255,255,0.7)';
          for (let k = 0; k < 3; k++) {
            ctx.fillRect(s.x + 12 + k * 18, y + 8, 4, 4);
          }
        }
      });
      if (moving) {
        ctx.fillStyle = moving.color;
        roundRect(ctx, moving.x, moving.y, moving.width, blockH, 6);
        ctx.fill();
        // cherry on top
        ctx.fillStyle = '#E76070';
        ctx.beginPath();
        ctx.arc(moving.x + moving.width / 2, moving.y - 6, 5, 0, Math.PI * 2);
        ctx.fill();
      }
      particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.w, blockH);
      });
      ctx.restore();

      // ground
      ctx.fillStyle = '#D4B895';
      ctx.fillRect(0, baseY + blockH + camY, w, h);
    });

    function roundRect(ctx, x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    }

    function cleanup() {
      canvas.removeEventListener('touchstart', onTap);
      canvas.removeEventListener('mousedown', onTap);
    }
    return { stop: () => { alive = false; stop(); cleanup(); } };
  }

  return {
    bubble: bubblePop,
    snake: snakeGarden,
    stack: sweetStack
  };
})();
