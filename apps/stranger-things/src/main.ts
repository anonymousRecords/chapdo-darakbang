import "./style.css";

const card = document.querySelector<HTMLDivElement>(".card")!;
const layerBack = document.querySelector<HTMLDivElement>(".card__layer--back")!;
const layerFront = document.querySelector<HTMLDivElement>(
  ".card__layer--front",
)!;
const glare = document.querySelector<HTMLDivElement>(".card__glare")!;
const particleCanvas =
  document.querySelector<HTMLCanvasElement>(".card__particles")!;
const ctx = particleCanvas.getContext("2d")!;

const CONFIG = {
  maxTilt: 15,
  parallaxBack: 10,
  parallaxFront: 25,
  particleCount: 50,
  glareIntensity: 0.6,
};

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  flickerSpeed: number;
}

let particles: Particle[] = [];
let isHovering = false;
let animationId: number;

function resizeCanvas() {
  const rect = card.getBoundingClientRect();
  particleCanvas.width = rect.width;
  particleCanvas.height = rect.height;
}

function initParticles() {
  particles = [];
  for (let i = 0; i < CONFIG.particleCount; i++) {
    particles.push({
      x: Math.random() * particleCanvas.width,
      y: Math.random() * particleCanvas.height,
      size: Math.random() * 2 + 0.5,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: Math.random() * -0.5 - 0.2,
      opacity: Math.random() * 0.7 + 0.3,
      flickerSpeed: Math.random() * 0.02 + 0.01,
    });
  }
}

function updateParticles() {
  ctx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);

  particles.forEach((p) => {
    p.x += p.speedX;
    p.y += p.speedY;

    p.opacity += Math.sin(Date.now() * p.flickerSpeed) * 0.02;
    p.opacity = Math.max(0.1, Math.min(1, p.opacity));

    if (p.y < -10) {
      p.y = particleCanvas.height + 10;
      p.x = Math.random() * particleCanvas.width;
    }
    if (p.x < -10) p.x = particleCanvas.width + 10;
    if (p.x > particleCanvas.width + 10) p.x = -10;

    const hue = Math.random() > 0.5 ? 180 : 0;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${hue}, 70%, 60%, ${p.opacity})`;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${hue}, 70%, 60%, ${p.opacity * 0.3})`;
    ctx.fill();
  });

  if (isHovering) {
    animationId = requestAnimationFrame(updateParticles);
  }
}

function handleMouseMove(e: MouseEvent) {
  const rect = card.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  const normalizedX = (e.clientX - centerX) / (rect.width / 2);
  const normalizedY = (e.clientY - centerY) / (rect.height / 2);

  const tiltX = -normalizedY * CONFIG.maxTilt;
  const tiltY = normalizedX * CONFIG.maxTilt;
  card.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;

  layerBack.style.transform = `translateX(${normalizedX * CONFIG.parallaxBack}px) translateY(${normalizedY * CONFIG.parallaxBack}px)`;
  layerFront.style.transform = `translateX(${normalizedX * CONFIG.parallaxFront}px) translateY(${normalizedY * CONFIG.parallaxFront}px)`;

  const glareX = ((e.clientX - rect.left) / rect.width) * 100;
  const glareY = ((e.clientY - rect.top) / rect.height) * 100;

  const blueIntensity = Math.max(0, 1 - normalizedX) * CONFIG.glareIntensity;
  const redIntensity =
    Math.max(0, normalizedX + 0.3) * CONFIG.glareIntensity * 0.8;

  glare.style.background = `
    radial-gradient(
      circle at ${glareX}% ${glareY}%,
      rgba(0, 150, 255, ${blueIntensity}) 0%,
      transparent 50%
    ),
    radial-gradient(
      circle at ${100 - glareX}% ${glareY}%,
      rgba(255, 30, 30, ${redIntensity}) 0%,
      transparent 50%
    ),
    linear-gradient(
      ${90 + normalizedX * 45}deg,
      transparent 30%,
      rgba(0, 100, 255, ${blueIntensity * 0.5}) 45%,
      rgba(255, 50, 50, ${redIntensity * 0.5}) 55%,
      transparent 70%
    )
  `;
}

function handleMouseEnter() {
  isHovering = true;
  resizeCanvas();
  initParticles();
  updateParticles();
}

function handleMouseLeave() {
  isHovering = false;
  cancelAnimationFrame(animationId);

  card.style.transform = "rotateX(0deg) rotateY(0deg)";
  layerBack.style.transform = "translateX(0px) translateY(0px)";
  layerFront.style.transform = "translateX(0px) translateY(0px)";
  glare.style.background = "";
}

card.addEventListener("mousemove", handleMouseMove);
card.addEventListener("mouseenter", handleMouseEnter);
card.addEventListener("mouseleave", handleMouseLeave);

resizeCanvas();
window.addEventListener("resize", resizeCanvas);
