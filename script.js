/**
 * 🌹 20/10 SPECIAL VISUAL FX - SCRIPT
 * Full Canvas Particles, Procedural Flowers, Floral Fireworks & Web Audio
 * Includes Personalized Recipient Banner & Admin Modal Sharing
 */

// ================= GLOBAL SETUP & RESIZING =================
const bgCanvas = document.getElementById('bgCanvas');
const gardenCanvas = document.getElementById('gardenCanvas');
const fireworkCanvas = document.getElementById('fireworkCanvas');
const particleCanvas = document.getElementById('particleCanvas');

const bgCtx = bgCanvas.getContext('2d');
const gardenCtx = gardenCanvas.getContext('2d');
const fwCtx = fireworkCanvas.getContext('2d');
const pCtx = particleCanvas.getContext('2d');

let width, height;

function resizeAll() {
    width = window.innerWidth;
    height = window.innerHeight;
    [bgCanvas, gardenCanvas, fireworkCanvas, particleCanvas].forEach(c => {
        c.width = width;
        c.height = height;
    });
}
resizeAll();
window.addEventListener('resize', resizeAll);

// ================= WEB AUDIO SYNTHESIZER =================
let audioCtx = null;
let audioEnabled = true;
const PENTATONIC_SCALE = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00];

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function playChime(noteFreq = null) {
    if (!audioEnabled) return;
    try {
        initAudio();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        const freq = noteFreq || PENTATONIC_SCALE[Math.floor(Math.random() * PENTATONIC_SCALE.length)];
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

        // Soft gentle bell chime curve
        gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.18, audioCtx.currentTime + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.2);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + 1.3);
    } catch (e) {
        // audio might be blocked by browser until first interaction
    }
}

function playChord() {
    if (!audioEnabled) return;
    [0, 2, 4].forEach((offset, idx) => {
        setTimeout(() => {
            const base = 4;
            playChime(PENTATONIC_SCALE[base + offset] || 523.25);
        }, idx * 90);
    });
}

// Unlock audio on first user touch/click if browser blocked autoplay
function unlockAudio() {
    initAudio();
    window.removeEventListener('pointerdown', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
}
window.addEventListener('pointerdown', unlockAudio);
window.addEventListener('keydown', unlockAudio);

// ================= BACKGROUND PARTICLES & PETALS =================
const bgParticles = [];
const TOTAL_BG_PETALS = 40;

class AmbientPetal {
    constructor() {
        this.reset(true);
    }

    reset(initial = false) {
        this.x = Math.random() * width;
        this.y = initial ? Math.random() * height : -30;
        this.size = Math.random() * 12 + 8;
        this.speedY = Math.random() * 1.2 + 0.6;
        this.speedX = Math.sin(Math.random() * Math.PI) * 0.8;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = (Math.random() - 0.5) * 1.5;
        this.opacity = Math.random() * 0.5 + 0.3;
        this.color = Math.random() > 0.4 ? 'rgba(255, 77, 141, ' : 'rgba(255, 140, 180, ';
        this.wobble = Math.random() * Math.PI * 2;
        this.wobbleSpeed = Math.random() * 0.03 + 0.01;
    }

    update() {
        this.y += this.speedY;
        this.wobble += this.wobbleSpeed;
        this.x += Math.sin(this.wobble) * 1.2 + this.speedX;
        this.rotation += this.rotationSpeed;

        if (this.y > height + 40 || this.x < -40 || this.x > width + 40) {
            this.reset(false);
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.fillStyle = `${this.color}${this.opacity})`;
        ctx.shadowColor = 'rgba(255, 42, 109, 0.4)';
        ctx.shadowBlur = 8;

        // Draw petal shape
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size, this.size * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

for (let i = 0; i < TOTAL_BG_PETALS; i++) {
    bgParticles.push(new AmbientPetal());
}

function renderBackground() {
    bgCtx.clearRect(0, 0, width, height);

    // Subtle dark gradient with warm glow
    const grad = bgCtx.createRadialGradient(width / 2, height / 2, 80, width / 2, height / 2, width * 0.8);
    grad.addColorStop(0, '#1c0314');
    grad.addColorStop(0.5, '#0e010a');
    grad.addColorStop(1, '#050004');
    bgCtx.fillStyle = grad;
    bgCtx.fillRect(0, 0, width, height);

    // Render petals
    bgParticles.forEach(p => {
        p.update();
        p.draw(bgCtx);
    });

    requestAnimationFrame(renderBackground);
}
renderBackground();

// ================= PROCEDURAL BLOOMING FLOWERS (Garden) =================
const activeFlowers = [];

class BloomingFlower {
    constructor(x, y, maxPetals = 12) {
        this.x = x;
        this.y = y;
        this.growth = 0; // 0 to 1
        this.maxSize = Math.random() * 28 + 24;
        this.stemHeight = Math.random() * 120 + 80;
        this.stemProgress = 0;
        this.petals = maxPetals;
        this.colorHue = Math.random() * 40 + 330; // 330 to 370 (pink/red range)
        this.isFullyGrown = false;
        this.life = 0;
        this.maxLife = 600; // frames before fade
        this.alpha = 1;
    }

    update() {
        if (this.growth < 1) {
            this.growth += 0.035;
        } else {
            this.life++;
            if (this.life > this.maxLife) {
                this.alpha -= 0.01;
            }
        }
    }

    draw(ctx) {
        if (this.alpha <= 0) return;

        ctx.save();
        ctx.globalAlpha = Math.max(0, this.alpha);
        ctx.translate(this.x, this.y);

        const currentSize = this.maxSize * Math.min(1, this.growth);

        // Petal Layers
        for (let ring = 3; ring >= 1; ring--) {
            const ringPetals = this.petals + ring * 2;
            const ringRadius = currentSize * (ring / 3);

            for (let i = 0; i < ringPetals; i++) {
                const angle = (i * Math.PI * 2) / ringPetals + (ring * 0.3);
                ctx.save();
                ctx.rotate(angle);

                const grad = ctx.createLinearGradient(0, 0, ringRadius, 0);
                grad.addColorStop(0, `hsla(${this.colorHue}, 100%, 75%, 0.9)`);
                grad.addColorStop(1, `hsla(${this.colorHue - 15}, 90%, 45%, 0.7)`);

                ctx.fillStyle = grad;
                ctx.shadowColor = `hsla(${this.colorHue}, 100%, 65%, 0.6)`;
                ctx.shadowBlur = 10;

                ctx.beginPath();
                ctx.ellipse(ringRadius * 0.6, 0, ringRadius * 0.6, ringRadius * 0.35, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }

        // Glowing center core
        const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, currentSize * 0.3);
        coreGrad.addColorStop(0, '#fff');
        coreGrad.addColorStop(0.5, '#ffd166');
        coreGrad.addColorStop(1, '#ff2a6d');

        ctx.beginPath();
        ctx.arc(0, 0, currentSize * 0.28, 0, Math.PI * 2);
        ctx.fillStyle = coreGrad;
        ctx.shadowColor = '#ffd166';
        ctx.shadowBlur = 15;
        ctx.fill();

        ctx.restore();
    }
}

function spawnFlower(x, y) {
    activeFlowers.push(new BloomingFlower(x, y));
    playChime();
    // Burst particles around bloom
    createPetalBurst(x, y, 16);
}

function renderGarden() {
    gardenCtx.clearRect(0, 0, width, height);

    for (let i = activeFlowers.length - 1; i >= 0; i--) {
        const flower = activeFlowers[i];
        flower.update();
        flower.draw(gardenCtx);
        if (flower.alpha <= 0) {
            activeFlowers.splice(i, 1);
        }
    }

    requestAnimationFrame(renderGarden);
}
renderGarden();

// ================= FLORAL FIREWORKS SYSTEM =================
const fireworks = [];

class FlowerFirework {
    constructor(targetX, targetY) {
        this.x = targetX || Math.random() * (width - 200) + 100;
        this.y = height;
        this.targetY = targetY || Math.random() * (height * 0.45) + 80;
        this.speed = Math.random() * 4 + 11;
        this.exploded = false;
        this.particles = [];
        this.color = `hsl(${Math.random() * 50 + 330}, 100%, 65%)`;
    }

    update() {
        if (!this.exploded) {
            this.y -= this.speed;
            this.speed *= 0.985;
            if (this.y <= this.targetY || this.speed < 2) {
                this.explode();
            }
        } else {
            for (let i = this.particles.length - 1; i >= 0; i--) {
                const p = this.particles[i];
                p.update();
                if (p.alpha <= 0) {
                    this.particles.splice(i, 1);
                }
            }
        }
    }

    explode() {
        this.exploded = true;
        playChime(659.25);

        // Floral Burst: Multiple Petal Rays
        const petalCount = 8;
        const sparksPerPetal = 12;

        for (let p = 0; p < petalCount; p++) {
            const petalAngle = (p * Math.PI * 2) / petalCount;
            for (let s = 0; s < sparksPerPetal; s++) {
                const spread = (Math.random() - 0.5) * 0.35;
                const angle = petalAngle + spread;
                const speed = (Math.random() * 4 + 3) * (0.8 + 0.2 * Math.cos(petalAngle));
                this.particles.push(new FWSpark(this.x, this.y, angle, speed, this.color));
            }
        }

        // Center golden burst
        for (let i = 0; i < 20; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 3 + 1;
            this.particles.push(new FWSpark(this.x, this.y, angle, speed, '#ffd166'));
        }
    }

    draw(ctx) {
        if (!this.exploded) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
            ctx.fillStyle = '#fff';
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 15;
            ctx.fill();
            ctx.restore();
        } else {
            this.particles.forEach(p => p.draw(ctx));
        }
    }
}

class FWSpark {
    constructor(x, y, angle, speed, color) {
        this.x = x;
        this.y = y;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.color = color;
        this.alpha = 1;
        this.decay = Math.random() * 0.018 + 0.012;
        this.gravity = 0.045;
        this.size = Math.random() * 2.5 + 1.5;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.vx *= 0.98;
        this.vy *= 0.98;
        this.alpha -= this.decay;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.alpha);
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

function launchFireworks(count = 3) {
    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            fireworks.push(new FlowerFirework());
        }, i * 280);
    }
}

function renderFireworks() {
    fwCtx.clearRect(0, 0, width, height);

    for (let i = fireworks.length - 1; i >= 0; i--) {
        const fw = fireworks[i];
        fw.update();
        fw.draw(fwCtx);
        if (fw.exploded && fw.particles.length === 0) {
            fireworks.splice(i, 1);
        }
    }

    requestAnimationFrame(renderFireworks);
}
renderFireworks();

// ================= PARTICLE EXPLOSIONS & TRAIL =================
const clickParticles = [];

class PetalParticle {
    constructor(x, y, char = null) {
        this.x = x;
        this.y = y;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 6 + 2;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed - 1.5;
        this.gravity = 0.08;
        this.alpha = 1;
        this.decay = Math.random() * 0.02 + 0.015;
        this.char = char;
        this.size = char ? Math.random() * 12 + 14 : Math.random() * 6 + 4;
        this.rotation = Math.random() * 360;
        this.rotSpeed = (Math.random() - 0.5) * 8;
        this.color = Math.random() > 0.3 ? '#ff2a6d' : '#ffd166';
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.rotation += this.rotSpeed;
        this.alpha -= this.decay;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.alpha);
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);

        if (this.char) {
            ctx.font = `${this.size}px serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.char, 0, 0);
        } else {
            ctx.fillStyle = this.color;
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.ellipse(0, 0, this.size, this.size * 0.5, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }
}

function createPetalBurst(x, y, count = 18, emoji = null) {
    for (let i = 0; i < count; i++) {
        clickParticles.push(new PetalParticle(x, y, emoji));
    }
}

function renderParticles() {
    pCtx.clearRect(0, 0, width, height);

    for (let i = clickParticles.length - 1; i >= 0; i--) {
        const p = clickParticles[i];
        p.update();
        p.draw(pCtx);
        if (p.alpha <= 0) {
            clickParticles.splice(i, 1);
        }
    }

    requestAnimationFrame(renderParticles);
}
renderParticles();

// ================= WELCOME SPECIAL CELEBRATION =================
function triggerWelcomeSpecial() {
    initAudio();
    playChord();
    launchFireworks(4);

    const cx = width / 2;
    const cy = height / 2;

    // Center bloom & rich burst
    spawnFlower(cx, cy);
    createPetalBurst(cx, cy, 35);
    createPetalBurst(cx, cy, 18, '🌸');
    createPetalBurst(cx, cy, 14, '💖');

    // Surrounding floral sparks
    setTimeout(() => {
        const spreadX = Math.min(130, width * 0.22);
        spawnFlower(cx - spreadX, cy + 50);
        spawnFlower(cx + spreadX, cy + 50);
        createPetalBurst(cx - spreadX, cy + 50, 16, '✨');
        createPetalBurst(cx + spreadX, cy + 50, 16, '✨');
    }, 350);

    setTimeout(() => {
        spawnFlower(cx, cy - 80);
        createPetalBurst(cx, cy - 80, 12, '🌷');
    }, 700);
}

// ================= INTERACTIVE CLICK / TOUCH TO BLOOM =================
const adminModal = document.getElementById('adminModal');

window.addEventListener('pointerdown', (e) => {
    // Avoid triggering blooms when interacting with docks, headers, modal, or toast
    if (
        e.target.closest('.actions-dock') ||
        e.target.closest('.header') ||
        e.target.closest('.modal-card') ||
        e.target.closest('.toast') ||
        (adminModal && adminModal.classList.contains('open'))
    ) {
        return;
    }

    const x = e.clientX;
    const y = e.clientY;

    spawnFlower(x, y);

    // Occasional firework trigger on double taps or random intervals
    if (Math.random() > 0.6) {
        fireworks.push(new FlowerFirework(x, y - 60));
    }
});

// Cursor Sparkle Trail
let lastTrailTime = 0;
window.addEventListener('pointermove', (e) => {
    if (adminModal && adminModal.classList.contains('open')) return;

    const now = performance.now();
    if (now - lastTrailTime > 40) {
        lastTrailTime = now;
        clickParticles.push(new PetalParticle(e.clientX, e.clientY));
    }
});

// Central Rose Interaction
const centerRose = document.getElementById('centerRose');
centerRose.addEventListener('click', (e) => {
    e.stopPropagation();
    const rect = centerRose.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    playChord();
    createPetalBurst(cx, cy, 40);
    createPetalBurst(cx, cy, 15, '🌸');
    createPetalBurst(cx, cy, 10, '💖');
    launchFireworks(4);
});

// ================= DOCK ACTION BUTTONS =================
// 1. Flower Storm (Bão Hoa)
document.getElementById('btnStorm').addEventListener('click', () => {
    playChord();
    const stormSymbols = ['🌸', '🌹', '🌷', '🏵️', '🌺'];
    for (let i = 0; i < 90; i++) {
        setTimeout(() => {
            const sym = stormSymbols[Math.floor(Math.random() * stormSymbols.length)];
            createPetalBurst(Math.random() * width, -20, 1, sym);
        }, i * 25);
    }
});

// 2. Fireworks (Pháo Hoa)
document.getElementById('btnFireworks').addEventListener('click', () => {
    launchFireworks(6);
});

// 3. Hearts (Mưa Tim)
document.getElementById('btnHearts').addEventListener('click', () => {
    playChord();
    const hearts = ['💖', '💕', '💗', '💓', '💝'];
    for (let i = 0; i < 60; i++) {
        setTimeout(() => {
            const sym = hearts[Math.floor(Math.random() * hearts.length)];
            createPetalBurst(Math.random() * width, height + 10, 1, sym);
        }, i * 35);
    }
});

// 4. Garden (Nở Rộ Vườn Hoa)
document.getElementById('btnGarden').addEventListener('click', () => {
    playChord();
    const count = Math.min(14, Math.floor(width / 90));
    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            const x = (width / (count + 1)) * (i + 1) + (Math.random() - 0.5) * 40;
            const y = height * 0.72 + (Math.random() - 0.5) * (height * 0.18);
            spawnFlower(x, y);
        }, i * 140);
    }
});

// 5. Audio Toggle
const btnAudio = document.getElementById('btnAudio');
const audioLabel = document.getElementById('audioLabel');
btnAudio.addEventListener('click', () => {
    audioEnabled = !audioEnabled;
    if (audioEnabled) {
        initAudio();
        playChime(523.25);
        btnAudio.classList.remove('active');
        audioLabel.textContent = 'Nhạc Chuông';
    } else {
        btnAudio.classList.add('active');
        audioLabel.textContent = 'Đã Tắt';
    }
});

// 6. Clear Screen
document.getElementById('btnClear').addEventListener('click', () => {
    activeFlowers.length = 0;
    fireworks.length = 0;
    clickParticles.length = 0;
    playChime(261.63);
});

// ================= RECIPIENT & ADMIN LINK SHARING =================
const recipientBanner = document.getElementById('recipientBanner');
const recipientNameText = document.getElementById('recipientNameText');
const btnAdmin = document.getElementById('btnAdmin');
const btnCloseModal = document.getElementById('btnCloseModal');
const adminNameInput = document.getElementById('adminNameInput');
const previewUrlText = document.getElementById('previewUrlText');
const btnApplyPreview = document.getElementById('btnApplyPreview');
const btnCopyLink = document.getElementById('btnCopyLink');
const toast = document.getElementById('toast');
const toastMsg = document.getElementById('toastMsg');

let toastTimeout = null;

// Display Toast Alert for 3 seconds
function showToast(message, icon = '✅') {
    if (!toast) return;
    if (toastMsg) toastMsg.textContent = message;
    const toastIcon = toast.querySelector('.toast-icon');
    if (toastIcon && icon) toastIcon.textContent = icon;

    toast.classList.add('show');

    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Get base URL for link sharing
function getBaseUrl() {
    if (window.location.origin && window.location.origin !== 'null' && window.location.protocol.startsWith('http')) {
        return `${window.location.origin}${window.location.pathname}`;
    }
    return window.location.href.split('?')[0].split('#')[0];
}

// Generate full shareable URL with ?to= parameter
function generateShareUrl(name) {
    const base = getBaseUrl();
    const trimmed = (name || '').trim();
    if (!trimmed) {
        return `${base}?to=...`;
    }
    return `${base}?to=${encodeURIComponent(trimmed)}`;
}

// Update the preview URL text inside Admin modal
function updatePreviewUrl(name) {
    if (previewUrlText) {
        previewUrlText.textContent = generateShareUrl(name);
    }
}

// Set Recipient Name and show Banner
function setRecipient(name) {
    if (!name) return;
    if (recipientNameText) recipientNameText.textContent = name;
    if (recipientBanner) recipientBanner.classList.add('active');
    document.title = `20/10 🌹 Gửi tặng ${name} | Happy Women's Day`;
}

// Parse Query Parameter (?to=... or ?name=...)
function getRecipientFromUrl() {
    try {
        const params = new URLSearchParams(window.location.search);
        let name = params.get('to') || params.get('name');
        if (!name) return null;
        try {
            name = decodeURIComponent(name.replace(/\+/g, ' '));
        } catch (e) {
            // keep raw name if decoding fails
        }
        return name.trim() || null;
    } catch (e) {
        return null;
    }
}

// Modal open/close controls
function openAdminModal() {
    if (!adminModal) return;

    if (!adminNameInput.value) {
        const currentName = (recipientBanner && recipientBanner.classList.contains('active'))
            ? recipientNameText.textContent.trim()
            : '';
        if (currentName && currentName !== 'Người Phụ Nữ Tuyệt Vời') {
            adminNameInput.value = currentName;
        }
    }

    updatePreviewUrl(adminNameInput.value);
    adminModal.classList.add('open');

    setTimeout(() => {
        if (adminNameInput) {
            adminNameInput.focus();
            if (adminNameInput.value) {
                adminNameInput.select();
            }
        }
    }, 120);
}

function closeAdminModal() {
    if (adminModal) {
        adminModal.classList.remove('open');
    }
}

// Fallback clipboard copy
function fallbackCopyText(text) {
    try {
        const tempInput = document.createElement('textarea');
        tempInput.value = text;
        tempInput.style.position = 'fixed';
        tempInput.style.top = '0';
        tempInput.style.left = '0';
        tempInput.style.width = '2em';
        tempInput.style.height = '2em';
        tempInput.style.padding = '0';
        tempInput.style.border = 'none';
        tempInput.style.outline = 'none';
        tempInput.style.boxShadow = 'none';
        tempInput.style.background = 'transparent';
        document.body.appendChild(tempInput);
        tempInput.focus();
        tempInput.select();
        const success = document.execCommand('copy');
        document.body.removeChild(tempInput);
        return success;
    } catch (err) {
        console.error('Fallback copy error:', err);
        return false;
    }
}

// Copy link action with navigator.clipboard and fallback
async function handleCopyLink() {
    const rawName = adminNameInput.value.trim() ||
        (recipientBanner.classList.contains('active') ? recipientNameText.textContent.trim() : '') ||
        'Người Phụ Nữ Tuyệt Vời';

    const base = getBaseUrl();
    const finalUrl = `${base}?to=${encodeURIComponent(rawName)}`;

    let copied = false;
    if (navigator.clipboard && window.isSecureContext) {
        try {
            await navigator.clipboard.writeText(finalUrl);
            copied = true;
        } catch (e) {
            copied = fallbackCopyText(finalUrl);
        }
    } else {
        copied = fallbackCopyText(finalUrl);
    }

    if (copied) {
        showToast('Đã sao chép link thành công! Gửi ngay cho người ấy nhé 💖');
    } else {
        showToast('Đã sao chép link thành công!');
    }
}

// Admin Event Listeners
if (btnAdmin) {
    btnAdmin.addEventListener('click', openAdminModal);
}

if (btnCloseModal) {
    btnCloseModal.addEventListener('click', closeAdminModal);
}

if (adminModal) {
    adminModal.addEventListener('click', (e) => {
        if (e.target === adminModal) {
            closeAdminModal();
        }
    });
}

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && adminModal && adminModal.classList.contains('open')) {
        closeAdminModal();
    }
});

if (adminNameInput) {
    adminNameInput.addEventListener('input', () => {
        updatePreviewUrl(adminNameInput.value);
    });

    adminNameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            if (btnApplyPreview) btnApplyPreview.click();
        }
    });
}

if (btnApplyPreview) {
    btnApplyPreview.addEventListener('click', () => {
        const name = adminNameInput.value.trim();
        if (!name) {
            adminNameInput.focus();
            showToast('Vui lòng nhập tên người nhận!', '⚠️');
            return;
        }

        setRecipient(name);

        try {
            const base = getBaseUrl();
            const newUrl = `${base}?to=${encodeURIComponent(name)}`;
            window.history.replaceState({}, '', newUrl);
        } catch (e) {
            // Handled for restrictive file:// schemes
        }

        closeAdminModal();
        triggerWelcomeSpecial();
        showToast(`Đã áp dụng tặng: "${name}"`, '🌹');
    });
}

if (btnCopyLink) {
    btnCopyLink.addEventListener('click', handleCopyLink);
}

// ================= INITIALIZATION & WELCOME SEQUENCE =================
const initialName = getRecipientFromUrl();

if (initialName) {
    setRecipient(initialName);
    if (adminNameInput) {
        adminNameInput.value = initialName;
    }
    updatePreviewUrl(initialName);

    setTimeout(() => {
        triggerWelcomeSpecial();
    }, 600);
} else {
    updatePreviewUrl('');

    setTimeout(() => {
        launchFireworks(2);
        spawnFlower(width * 0.25, height * 0.75);
        spawnFlower(width * 0.75, height * 0.75);
    }, 600);
}
