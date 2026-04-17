const canvas = document.getElementById("particle-canvas");
const ctx = canvas.getContext("2d");

if (canvas) {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

let particles = [];
let particleCount;
let mouse = {
  x: null,
  y: null,
  radius: 200,
};
let scrollY = 0;
let parallaxStrength = 0.5; // Adjust for parallax intensity
let explosionParticles = []; // Array to hold explosion particles

function isMobile() {
  return window.innerWidth <= 768;
}

// Responsive particle count based on screen size
function updateParticleCount() {
  const width = window.innerWidth;
  if (width <= 768) {
    particleCount = 15; // Mobile - reduced for performance
  } else if (width <= 1200) {
    particleCount = 100; // Tablet/Desktop medium
  } else {
    particleCount = 200; // Large desktop screens - increased for more density
  }
}

// Initialize particle count
updateParticleCount();

class Particle {
  constructor() {
    if (canvas) {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
    } else {
      this.x = 0;
      this.y = 0;
    }
    this.size = Math.random() * 1 + 0.8; // Size between 0.8-1.8
    this.baseX = this.x;
    this.baseY = this.y;
    this.density = Math.random() * 30 + 1;
    this.color = "#3fa9f5"; // Blue color
    this.opacity = 0.35;
    this.vx = (Math.random() - 0.5) * 1.2; // Slower velocity
    this.vy = (Math.random() - 0.5) * 1.2;
    this.isHovered = false; // Track hover state
  }

  draw() {
    let currentSize = this.isHovered ? this.size * 1.5 : this.size;
    ctx.fillStyle = `rgba(63, 169, 245, ${this.opacity})`; // 3fa9f5 with opacity
    ctx.beginPath();
    ctx.arc(this.x, this.y, currentSize, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
  }

  update() {
    // Parallax effect based on scroll
    let parallaxOffset = (this.density / 30) * scrollY * parallaxStrength;

    // Move particles with parallax
    this.x += this.vx;
    this.y += this.vy + parallaxOffset * 0.01; // Subtle vertical parallax

    // Wrap around edges instead of bounce
    if (this.x < 0) this.x = canvas.width;
    if (this.x > canvas.width) this.x = 0;
    if (this.y < 0) this.y = canvas.height;
    if (this.y > canvas.height) this.y = 0;

    // Mouse interaction - hover effect and attraction (simplified on mobile)
    if (mouse.x !== null && mouse.y !== null) {
      let dx = mouse.x - this.x;
      let dy = mouse.y - this.y;
      let distance = Math.sqrt(dx * dx + dy * dy);

      // Hover effect - particle grows when mouse is near (disabled on mobile)
      if (!isMobile() && distance < 50) {
        this.isHovered = true;
      } else {
        this.isHovered = false;
      }

      if (distance < mouse.radius && distance > 0) {
        // Attract particles to mouse (reduced strength on mobile)
        let forceDirectionX = dx / distance;
        let forceDirectionY = dy / distance;

        let maxDistance = mouse.radius;
        let force = (maxDistance - distance) / maxDistance;

        let attractionStrength = isMobile() ? 0.1 : 0.3; // Reduced attraction on mobile
        let directionX =
          forceDirectionX * force * this.density * attractionStrength;
        let directionY =
          forceDirectionY * force * this.density * attractionStrength;

        this.x += directionX;
        this.y += directionY;
      }
    }
  }
}

class ExplosionParticle {
  constructor(x, y, angle, speed) {
    this.x = x;
    this.y = y;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.size = Math.random() * 2 + 1;
    this.life = 60; // Frames to live
    this.maxLife = 60;
    this.color = "#3fa9f5"; // Blue color
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vx *= 0.98; // Friction
    this.vy *= 0.98; // Friction
    this.life--;
  }

  draw() {
    let opacity = this.life / this.maxLife;
    ctx.fillStyle = `rgba(63, 169, 245, ${opacity})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
  }
}

function createExplosion(x, y) {
  const particleCount = 20; // Number of explosion particles
  for (let i = 0; i < particleCount; i++) {
    const angle = (Math.PI * 2 * i) / particleCount; // Evenly distribute around circle
    const speed = Math.random() * 5 + 3; // Random speed between 3-8
    explosionParticles.push(new ExplosionParticle(x, y, angle, speed));
  }
}

function init() {
  particles = [];
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw connecting lines (plexus network)
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      let dx = particles[i].x - particles[j].x;
      let dy = particles[i].y - particles[j].y;
      let distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 150) {
        // Connection distance
        let opacity = 0.35 * (1 - distance / 150);

        ctx.strokeStyle = `rgba(63, 169, 245, ${opacity})`; // 3fa9f5 color
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }
  }

  // Update and draw explosion particles
  for (let i = explosionParticles.length - 1; i >= 0; i--) {
    explosionParticles[i].update();
    explosionParticles[i].draw();

    // Remove dead particles
    if (explosionParticles[i].life <= 0) {
      explosionParticles.splice(i, 1);
    }
  }

  for (let i = 0; i < particles.length; i++) {
    particles[i].update();
    particles[i].draw();
  }

  requestAnimationFrame(animate);
}

if (canvas && ctx) {
  init();
  animate();
}

const heroSection = document.getElementById("hero");

if (heroSection) {
  heroSection.addEventListener("mousemove", function (event) {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
  });

  heroSection.addEventListener("mouseleave", function () {
    mouse.x = null;
    mouse.y = null;
  });
}

window.addEventListener("scroll", function () {
  scrollY = window.scrollY;
});

if (canvas && !isMobile()) {
  canvas.addEventListener("click", function (event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    createExplosion(x, y);
  });
}

let resizeTimeout;
let isResizing = false;

window.addEventListener("resize", function () {
  if (!isResizing) {
    isResizing = true;
    requestAnimationFrame(() => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      updateParticleCount();
      init();
      isResizing = false;
    });
  }
});
