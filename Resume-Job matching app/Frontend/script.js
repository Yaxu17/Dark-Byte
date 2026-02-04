const API = "http://127.0.0.1:8000";
async function login(email, password) {
  const res = await fetch(`${API}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if (!data.success) {
    alert("Login failed");
    return;
  }

  localStorage.setItem("role", data.role);
  localStorage.setItem("token", data.token);

  location.reload();
}

function logout() {
  localStorage.clear();
  location.reload();
}

let allResults = [];

// Particle system variables
let particles = [];
const particleCount = window.innerWidth > 768 ? 100 : 50; // Fewer on mobile
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
let mouse = { x: null, y: null };

// Resize canvas
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Particle class
class Particle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.vx = (Math.random() - 0.5) * 0.5;
    this.vy = (Math.random() - 0.5) * 0.5;
    this.size = Math.random() * 2 + 1;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
    if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
  }
  draw() {
    ctx.fillStyle = 'rgba(102, 126, 234, 0.5)';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Initialize particles
for (let i = 0; i < particleCount; i++) {
  particles.push(new Particle());
}

// Animate particles
function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => {
    p.update();
    p.draw();
  });
  // Draw connections
  particles.forEach(p1 => {
    particles.forEach(p2 => {
      const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
      if (dist < 100) {
        ctx.strokeStyle = `rgba(102, 126, 234, ${1 - dist / 100})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
    });
  });
  requestAnimationFrame(animateParticles);
}
animateParticles();

// Mouse interaction for particles
canvas.addEventListener('mousemove', e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

// Typing effect for hero subtitle
function typeWriter(text, element, speed = 100) {
  let i = 0;
  element.textContent = '';
  function type() {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
      setTimeout(type, speed);
    }
  }
  type();
}
const heroSubtitle = document.getElementById('heroSubtitle');
setTimeout(() => typeWriter('Hire smarter. Faster. Fairer.', heroSubtitle), 1200);

// Parallax effect on hero background
window.addEventListener('scroll', () => {
  const scrolled = window.pageYOffset;
  const hero = document.querySelector('.hero');
  hero.style.backgroundPositionY = `${scrolled * 0.5}px`; // Subtle parallax
});

// Scroll-triggered animations
const observerOptions = { threshold: 0.1 };
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, observerOptions);

document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));

// Animated counters for stats
function animateCounter(element, target, duration = 2000) {
  let start = 0;
  const increment = target / (duration / 16); // 60fps
  const timer = setInterval(() => {
    start += increment;
    if (start >= target) {
      start = target;
      clearInterval(timer);
    }
    element.textContent = Math.floor(start);
  }, 16);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(document.getElementById('totalResumes'), 150); // Example values; replace with real data
      animateCounter(document.getElementById('shortlisted'), 120);
      animateCounter(document.getElementById('rejected'), 30);
      statsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

statsObserver.observe(document.querySelector('.admin'));

// Ripple effect on buttons
document.querySelectorAll('button').forEach(btn => {
  btn.addEventListener('click', function(e) {
    const ripple = document.createElement('span');
    ripple.style.position = 'absolute';
    ripple.style.borderRadius = '50%';
    ripple.style.background = 'rgba(255,255,255,0.6)';
    ripple.style.transform = 'scale(0)';
    ripple.style.animation = 'ripple 0.6s linear';
    ripple.style.left = `${e.offsetX - 10}px`;
    ripple.style.top = `${e.offsetY - 10}px`;
    this.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
});

// Enhanced loader animation
const loader = document.getElementById('loader');
if (loader) {
  loader.style.animation = 'pulseRotate 1s infinite';
}

// Function to handle resume matching via backend
async function matchResumes() {
  const jd = document.getElementById("jdInput").value;
  const resultsDiv = document.getElementById("results");
  const errorDiv = document.getElementById("error");

  if (!jd.trim()) {
    errorDiv.innerText = "Please enter a Job Description";
    return;
  }

  errorDiv.innerText = "";
  resultsDiv.innerHTML = "";
  loader.classList.remove("hidden");

  try {
    const response = await fetch("http://127.0.0.1:8000/match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ job_description: jd })
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    allResults = await response.json();
    loader.classList.add("hidden");
    displayResults(allResults);
  } catch (error) {
    loader.classList.add("hidden");
    errorDiv.innerText = `Error: ${error.message || "Backend not running or network issue."}`;
  }
}

// Function to display results with animation
function displayResults(data) {
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";

  data.forEach((r, index) => {
    let color = "red";
    if (r.score >= 70) color = "green";
    else if (r.score >= 40) color = "yellow";

    const resultCard = document.createElement('div');
    resultCard.className = 'stat-card tilt-card';
    resultCard.innerHTML = `
      <h3>${r.resume_id}</h3>
      <p><b>Match Score:</b> ${r.score}%</p>
      <div class="progress">
        <div class="progress-bar ${color}" style="width:${r.score}%"></div>
      </div>
    `;
    resultCard.style.animationDelay = `${index * 0.1}s`; // Stagger animation
    resultsDiv.appendChild(resultCard);
  });
}

// Function to filter results
function filterResults(value) {
  if (value === 5) {
    displayResults(allResults.slice(0, 5));
  } else {
    displayResults(allResults.filter(r => r.score >= value));
  }
}

// Function to show all results
function showAll() {
  displayResults(allResults);
}

// Advanced 3D tilt effect on mouse move
document.querySelectorAll(".tilt-card").forEach(card => {
  card.addEventListener("mousemove", e => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * 15;
    const rotateY = ((x - centerX) / centerX) * 15;

    card.style.transform = `
      perspective(1200px)
      rotateX(${-rotateX}deg)
      rotateY(${rotateY}deg)
      translateZ(30px)
    `;
    card.style.boxShadow = `0 20px 50px rgba(0,0,0,${0.5 + Math.abs(rotateX) / 100})`; // Deeper shadow
  });

  card.addEventListener("mouseleave", () => {
    card.style.transform = `
      perspective(1200px)
      rotateX(0deg)
      rotateY(0deg)
      translateZ(0)
    `;
    card.style.boxShadow = 'var(--shadow)';
  });
});

// File upload handler
document.getElementById("pdfUpload").addEventListener("change", function(event) {
  const file = event.target.files[0];
  if (file && file.type === "application/pdf") {
    console.log("PDF uploaded:", file.name);
    // Add your upload logic here (e.g., send to backend)
  } else {
    alert("Please upload a valid PDF file.");
  }
});

async function renderDashboard() {
  const role = localStorage.getItem("role");
  const dashboard = document.getElementById("dashboardCard");

  if (!dashboard) return;

  if (!role) {
    dashboard.innerHTML = `
      <h2>🔒 Please Login</h2>
      <p>Select a role from the top-right buttons.</p>
    `;
    return;
  }

  const res = await fetch(`${API}/dashboard/${role}`);
  const data = await res.json();

  // Admin / HR
  if (role === "admin" || role === "hr") {
    dashboard.innerHTML = `
      <h2>📊 Admin Dashboard</h2>
      <div class="stats">
        <div class="stat-card tilt-card">
          <h3>Total Resumes</h3>
          <b>${data.total_resumes}</b>
        </div>
        <div class="stat-card tilt-card">
          <h3>Shortlisted</h3>
          <b>${data.shortlisted}</b>
        </div>
        <div class="stat-card tilt-card">
          <h3>Rejected</h3>
          <b>${data.rejected}</b>
        </div>
      </div>
    `;
  }
  // User / Employee
  else {
    dashboard.innerHTML = `
      <h2>👤 My Dashboard</h2>
      <div class="stats">
        <div class="stat-card tilt-card">
          <h3>Resumes Uploaded</h3>
          <b>${data.uploaded}</b>
        </div>
        <div class="stat-card tilt-card">
          <h3>Status</h3>
          <b>${data.status}</b>
        </div>
        <div class="stat-card tilt-card">
          <h3>Best Match</h3>
          <b>${data.best_match}</b>
        </div>
      </div>
    `;
  }
}

renderDashboard();


