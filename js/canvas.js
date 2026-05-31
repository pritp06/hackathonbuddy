/*
File: canvas.js

Purpose:
Provides the interactive background particle animation for the public landing page.
Handles rendering, physics (mouse interaction), resize observers, and accessibility 
preferences (e.g. prefers-reduced-motion).

Dependencies:
None

Used By:
- pages.js (Landing page setup)

====================================================
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
    
    // Accessibility check: Do not show moving particles if user prefers reduced motion
    this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.isMobile = window.innerWidth < 768;
    this.isSmallMobile = window.innerWidth < 480;

    // Bind methods to maintain `this` context when used as event listeners
    this.onResize = this.onResize.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
    this.loop = this.loop.bind(this);
    
    // Performance and debugging tracking
    this.frameCount = 0;
    this.lastFpsTime = 0;
    this.fps = 0;
    this.rafCount = 0;
    
    // Global debug object to monitor canvas health
    window.__HB_DEBUG__ = { particles: 0, running: false, fps: 0, mouseX: 0, mouseY: 0, rafCount: 0, listeners: 0 };
  }

  /*
  Purpose: Bootstraps the canvas rendering engine and sets up event listeners.
  Parameters: None
  Returns: undefined
  Side Effects: Modifies global debug object, binds listeners to `window`.
  */
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

  /*
  Purpose: Tears down the canvas, stops the animation loop, and removes listeners to prevent memory leaks.
  Parameters: None
  Returns: undefined
  Side Effects: Mutates global debug object, removes listeners from `window`.
  */
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

  /*
  Purpose: Adjusts the internal bounds and resolution of the canvas when the window resizes.
  Parameters: None
  Returns: undefined
  Side Effects: Resets particles based on new viewport dimensions.
  */
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

  /*
  Purpose: Tracks the user's mouse position relative to the canvas.
  Parameters: e (MouseEvent)
  Returns: undefined
  Side Effects: Updates internal `this.mouse` coordinates.
  */
  onMouseMove(e) {
    if (this.reducedMotion) return;
    const rect = this.canvas.getBoundingClientRect();
    this.mouse.x = e.clientX - rect.left;
    this.mouse.y = e.clientY - rect.top;
  }

  /*
  Purpose: Hides the interactive glow when the cursor leaves the window.
  Parameters: None
  Returns: undefined
  Side Effects: Updates internal `this.mouse` coordinates.
  */
  onMouseLeave() {
    this.mouse.x = -1000;
    this.mouse.y = -1000;
  }

  /*
  Purpose: Generates the initial layout of particles across the canvas.
  Parameters: None
  Returns: undefined
  Side Effects: Populates `this.particles`.
  */
  initParticles() {
    this.particles = [];
    // Do not generate particles for reduced motion or mobile devices
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

  /*
  Purpose: The primary rendering loop executed every frame via requestAnimationFrame.
  Parameters: time (Number) - High-resolution timestamp provided by rAF.
  Returns: undefined
  Side Effects: 
    - Clears and redraws the canvas.
    - Updates particle physics and positions.
    - Updates FPS counters.
  */
  loop(time) {
    if (!this.ctx) return;
    this.animationId = requestAnimationFrame(this.loop);
    this.rafCount++;

    // Track FPS over 1-second intervals
    this.frameCount++;
    if (time - this.lastFpsTime >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.lastFpsTime = time;
    }
    
    // Expose debug metrics
    window.__HB_DEBUG__.fps = this.fps;
    window.__HB_DEBUG__.mouseX = this.mouse.x;
    window.__HB_DEBUG__.mouseY = this.mouse.y;
    window.__HB_DEBUG__.particles = this.particles.length;
    window.__HB_DEBUG__.rafCount = this.rafCount;
    window.__HB_DEBUG__.running = true;

    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    this.ctx.clearRect(0, 0, this.bounds.width, this.bounds.height);

    // Fallback static glow for reduced motion users
    if (this.reducedMotion) {
      const glow = this.ctx.createRadialGradient(this.bounds.width / 2, this.bounds.height / 2, 0, this.bounds.width / 2, this.bounds.height / 2, this.bounds.width * 0.8);
      const glowColor = isDark ? "96, 165, 250" : "37, 99, 235";
      glow.addColorStop(0, `rgba(${glowColor}, 0.05)`);
      glow.addColorStop(1, `rgba(${glowColor}, 0)`);
      this.ctx.fillStyle = glow;
      this.ctx.fillRect(0, 0, this.bounds.width, this.bounds.height);
      return;
    }

    // Ease cursor position towards mouse position for smooth trailing effect
    this.cursor.x += (this.mouse.x - this.cursor.x) * 0.1;
    this.cursor.y += (this.mouse.y - this.cursor.y) * 0.1;

    // Draw the interactive glow around the cursor
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

    // Do not calculate/draw particles on mobile
    if (this.isMobile) return;

    const darkColors = ["96, 165, 250", "192, 132, 252", "34, 211, 238"];
    const lightColors = ["37, 99, 235", "124, 58, 237", "79, 70, 229"];
    const colors = isDark ? darkColors : lightColors;
    
    const interactionRadius = 150;
    const maxDisplacement = 12;

    // Calculate physics and draw each particle
    for (const p of this.particles) {
      // Calculate continuous drifting motion using sine waves
      const driftX = Math.sin(time * 0.0005 + p.phase) * 8;
      const driftY = Math.cos(time * 0.0007 + p.phase) * 8;
      
      let targetX = p.baseX + driftX;
      let targetY = p.baseY + driftY;

      // Apply repulsion force if the mouse is near the particle
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

      // Smoothly interpolate current position toward target position
      p.x += (targetX - p.x) * 0.04;
      p.y += (targetY - p.y) * 0.04;

      // Render the particle
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(${colors[p.colorIndex]}, ${p.opacity})`;
      this.ctx.fill();
    }
  }
}

export default new InteractiveBackground();
