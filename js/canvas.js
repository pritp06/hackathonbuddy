

/**
 * 1. Purpose
 *    - Interactive background canvas particle animation engine for landing screen decoration.
 * 2. Responsibilities
 *    - Initializes and resizes a radial background glow and floating bubble particles array.
 *    - Tracks cursor movement coordinates to calculate proximity-based particle displacement vectors.
 *    - Implements physics animation loops utilizing high-frequency `requestAnimationFrame` loops.
 *    - Adapts particle count limits and sizes dynamically to respect mobile viewport size constraints.
 *    - Respects system accessibility directives by switching off animation sequences if `prefers-reduced-motion` is active.
 *    - Registers diagnostic statistics (`__HB_DEBUG__` namespace) to allow live system profiling.
 *    - Provides clean initialization and destruction lifecycle functions to prevent browser memory leaks.
 * 3. Dependencies
 *    - Browser DOM & Graphics APIs: HTMLCanvasElement, CanvasRenderingContext2D, window, matchMedia, requestAnimationFrame.
 * 4. Important Functions
 *    - `init()`: Connects canvas hooks, attaches event listeners, and boots rendering frame cycles.
 *    - `destroy()`: Dismantles listeners, stops active rendering frames, and garbage collects instances.
 *    - `loop(time)`: Calculates drift physics, applies mouse displacements, clears screen canvas, and redraws elements.
 * 5. Data Flow
 *    - Page mount -> `init()` called -> Mouse coordinates track -> physics math in `loop()` -> canvas context draws -> Page unmount -> `destroy()` called.
 */

class InteractiveBackground {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.mouse = { x: -1000, y: -1000 };
    this.cursor = { x: -1000, y: -1000 };
    this.bounds = { width: 0, height: 0 };
    this.animationId = null;
    this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.isMobile = window.innerWidth < 768;
    this.isSmallMobile = window.innerWidth < 480;
    this.onResize = this.onResize.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
    this.loop = this.loop.bind(this);
    this.frameCount = 0;
    this.lastFpsTime = 0;
    this.fps = 0;
    this.rafCount = 0;
    window.__HB_DEBUG__ = { particles: 0, running: false, fps: 0, mouseX: 0, mouseY: 0, rafCount: 0, listeners: 0 };
  }

  
  init() {
    console.log("InteractiveBackground initialized");
    this.canvas = document.getElementById("hero-canvas");
    console.log("Canvas found:", this.canvas);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext("2d");
    this.onResize();
    this.initParticles();
    
    window.__HB_DEBUG__.running = true;
    window.__HB_DEBUG__.listeners = 3;
    window.__HB_DEBUG__.particles = this.particles.length;
    console.log("Particles:", this.particles.length);

    window.addEventListener("resize", this.onResize);
    window.addEventListener("mousemove", this.onMouseMove, { passive: true });
    window.addEventListener("mouseleave", this.onMouseLeave);

    this.loop();
  }

  
  destroy() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    window.removeEventListener("resize", this.onResize);
    window.removeEventListener("mousemove", this.onMouseMove);
    window.removeEventListener("mouseleave", this.onMouseLeave);
    
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    
    window.__HB_DEBUG__.running = false;
    window.__HB_DEBUG__.listeners = 0;
    window.__HB_DEBUG__.particles = 0;
  }

  
  onResize() {
    if (!this.canvas) return;
    const parent = this.canvas.parentElement;
    this.bounds.width = parent.clientWidth;
    this.bounds.height = parent.clientHeight;
    this.canvas.width = this.bounds.width;
    this.canvas.height = this.bounds.height;
    
    this.isMobile = window.innerWidth < 768;
    this.isSmallMobile = window.innerWidth < 480;
    this.initParticles();
  }

  
  onMouseMove(e) {
    if (this.reducedMotion) return;
    const rect = this.canvas.getBoundingClientRect();
    this.mouse.x = e.clientX - rect.left;
    this.mouse.y = e.clientY - rect.top;
  }

  
  onMouseLeave() {
    this.mouse.x = -1000;
    this.mouse.y = -1000;
  }

  
  initParticles() {
    this.particles = [];
    if (this.reducedMotion || this.isMobile) return;

    const count = window.innerWidth >= 1024 ? 30 : 15;
    
    for (let i = 0; i < count; i++) {
      const x = Math.random() * this.bounds.width;
      const y = Math.random() * this.bounds.height;
      this.particles.push({
        baseX: x,
        baseY: y,
        x: x,
        y: y,
        size: Math.random() * 2 + 2, // 2px to 4px
        opacity: Math.random() * 0.20 + 0.15, // 0.15 to 0.35
        phase: Math.random() * Math.PI * 2,
        colorIndex: Math.floor(Math.random() * 3)
      });
    }
  }

  
  loop(time) {
    if (!this.ctx) return;
    this.animationId = requestAnimationFrame(this.loop);
    this.rafCount++;
    this.frameCount++;
    if (time - this.lastFpsTime >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.lastFpsTime = time;
    }
    window.__HB_DEBUG__.fps = this.fps;
    window.__HB_DEBUG__.mouseX = this.mouse.x;
    window.__HB_DEBUG__.mouseY = this.mouse.y;
    window.__HB_DEBUG__.particles = this.particles.length;
    window.__HB_DEBUG__.rafCount = this.rafCount;
    window.__HB_DEBUG__.running = true;

    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    this.ctx.clearRect(0, 0, this.bounds.width, this.bounds.height);
    if (this.reducedMotion) {
      const glow = this.ctx.createRadialGradient(this.bounds.width / 2, this.bounds.height / 2, 0, this.bounds.width / 2, this.bounds.height / 2, this.bounds.width * 0.8);
      const glowColor = isDark ? "96, 165, 250" : "37, 99, 235";
      glow.addColorStop(0, `rgba(${glowColor}, 0.05)`);
      glow.addColorStop(1, `rgba(${glowColor}, 0)`);
      this.ctx.fillStyle = glow;
      this.ctx.fillRect(0, 0, this.bounds.width, this.bounds.height);
      return;
    }
    this.cursor.x += (this.mouse.x - this.cursor.x) * 0.1;
    this.cursor.y += (this.mouse.y - this.cursor.y) * 0.1;
    if (this.cursor.x > -500) {
      const glowRadius = this.isMobile ? 250 : window.innerWidth >= 1024 ? 500 : 350;
      const glowOpacity = window.innerWidth >= 1024 ? 0.12 : window.innerWidth >= 768 ? 0.08 : 0.05;
      const glow = this.ctx.createRadialGradient(this.cursor.x, this.cursor.y, 0, this.cursor.x, this.cursor.y, glowRadius);
      const glowColor = isDark ? "96, 165, 250" : "37, 99, 235";
      glow.addColorStop(0, `rgba(${glowColor}, ${glowOpacity})`);
      glow.addColorStop(1, `rgba(${glowColor}, 0)`);
      this.ctx.fillStyle = glow;
      this.ctx.fillRect(0, 0, this.bounds.width, this.bounds.height);
    }
    if (this.isMobile) return;

    const darkColors = ["96, 165, 250", "192, 132, 252", "34, 211, 238"];
    const lightColors = ["37, 99, 235", "124, 58, 237", "79, 70, 229"];
    const colors = isDark ? darkColors : lightColors;
    
    const interactionRadius = 150;
    const maxDisplacement = 12;
    for (const p of this.particles) {
      const driftX = Math.sin(time * 0.0005 + p.phase) * 8;
      const driftY = Math.cos(time * 0.0007 + p.phase) * 8;
      
      let targetX = p.baseX + driftX;
      let targetY = p.baseY + driftY;
      if (this.mouse.x > -500) {
        const dx = this.mouse.x - p.baseX;
        const dy = this.mouse.y - p.baseY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < interactionRadius) {
          const force = 1 - (dist / interactionRadius);
          const easedForce = force * force; // Non-linear falloff
          targetX -= (dx / dist) * easedForce * maxDisplacement;
          targetY -= (dy / dist) * easedForce * maxDisplacement;
        }
      }
      p.x += (targetX - p.x) * 0.04;
      p.y += (targetY - p.y) * 0.04;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(${colors[p.colorIndex]}, ${p.opacity})`;
      this.ctx.fill();
    }
  }
}

export default new InteractiveBackground();
