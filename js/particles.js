const canvas = document.getElementById('particle-canvas'); const ctx = canvas ? canvas.getContext('2d') : null; let particlesArray = [];
function resizeCanvas() { if(!canvas)return; canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
if(canvas) { window.addEventListener('resize', resizeCanvas); resizeCanvas(); }
class Particle {
    constructor(x, y) { this.x = x; this.y = y; this.vx = (Math.random() - 0.5) * 10; this.vy = (Math.random() - 1) * 10 - 5; this.size = Math.random() * 5 + 3; this.color = '#fbc531'; this.life = 1.0; this.gravity = 0.5; }
    update() { this.vy += this.gravity; this.x += this.vx; this.y += this.vy; this.life -= 0.02; this.size *= 0.95; }
    draw() { if(!ctx)return; ctx.save(); ctx.globalAlpha = Math.max(0, this.life); ctx.fillStyle = this.color; ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
}
function createExplosion(x, y, text) {
    if(!document.body) return; for (let i = 0; i < 15; i++) particlesArray.push(new Particle(x, y));
    const el = document.createElement("div"); el.classList.add("floating-text"); el.innerText = text; el.style.left = `${x + (Math.random() - 0.5) * 40}px`; el.style.top = `${y}px`; document.body.appendChild(el); setTimeout(() => el.remove(), 1000);
}
function animateParticles() {
    if(ctx && canvas) { ctx.clearRect(0, 0, canvas.width, canvas.height); for (let i = 0; i < particlesArray.length; i++) { particlesArray[i].update(); particlesArray[i].draw(); if (particlesArray[i].life <= 0) { particlesArray.splice(i, 1); i--; } } }
    requestAnimationFrame(animateParticles);
}
if(ctx) animateParticles();