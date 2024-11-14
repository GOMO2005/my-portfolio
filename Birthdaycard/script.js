// Confetti setup
const canvas = document.getElementById("confetti-canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let confettiArray = [];

function showConfetti() {
  for (let i = 0; i < 100; i++) {
    const size = Math.random() * 5 + 5;
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const speedX = Math.random() * 2 - 1;
    const speedY = Math.random() * 2 + 2;
    const color = `hsl(${Math.floor(Math.random() * 360)}, 100%, 50%)`;

    confettiArray.push({ x, y, speedX, speedY, size, color });
  }

  animateConfetti();
}

function animateConfetti() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  confettiArray.forEach((confetti, index) => {
    confetti.x += confetti.speedX;
    confetti.y += confetti.speedY;

    if (confetti.y > canvas.height) confettiArray.splice(index, 1);

    ctx.beginPath();
    ctx.arc(confetti.x, confetti.y, confetti.size, 0, Math.PI * 2);
    ctx.fillStyle = confetti.color;
    ctx.fill();
  });

  if (confettiArray.length) requestAnimationFrame(animateConfetti);
}

// Adjust canvas size when the window is resized
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});
