/**
 * 🌹 20/10 SPECIAL VISUAL FX - INTERACTIVE E-CARD
 * Pure Visual Focus: 3D Envelope, Glowing Blooming Rose,
 * Web Audio Crystal Chimes, Floral Fireworks, Cursor Trail & Hidden Admin
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

// Gentle crystal chime for taps
function playChime(noteFreq = null) {
    if (!audioEnabled) return;
    try {
        initAudio();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        const freq = noteFreq || PENTATONIC_SCALE[Math.floor(Math.random() * PENTATONIC_SCALE.length)];
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

        gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.18, audioCtx.currentTime + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.2);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + 1.25);
    } catch (e) {
        // Audio might be waiting for user interaction
    }
}

// Celestial crystal harp arpeggio when opening envelope
function playCrystalChord() {
    if (!audioEnabled) return;
    try {
        initAudio();
        const arpeggio = [523.25, 659.25, 783.99, 987.77, 1046.50, 1318.51];
        arpeggio.forEach((freq, idx) => {
            setTimeout(() => {
                if (!audioCtx) return;
                const osc = audioCtx.createOscillator();
                const harmonic = audioCtx.createOscillator();
                const gain = audioCtx.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

                harmonic.type = 'triangle';
                harmonic.frequency.setValueAtTime(freq * 2, audioCtx.currentTime);

                const now = audioCtx.currentTime;
                gain.gain.setValueAtTime(0.0001, now);
                gain.gain.exponentialRampToValueAtTime(0.15, now + 0.04);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

                osc.connect(gain);
                harmonic.connect(gain);
                gain.connect(audioCtx.destination);

                osc.start(now);
                harmonic.start(now);
                osc.stop(now + 1.9);
                harmonic.stop(now + 1.9);
            }, idx * 100);
        });
    } catch (e) {
        // Ignore audio errors
    }
}

// Unlock audio on first user touch or click
function unlockAudio() {
    initAudio();
    window.removeEventListener('pointerdown', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
}
window.addEventListener('pointerdown', unlockAudio);
window.addEventListener('keydown', unlockAudio);

// ================= BACKGROUND PARTICLES & PETALS =================
const bgParticles = [];
const TOTAL_BG_PETALS = 38;

class AmbientPetal {
    constructor() {
        this.reset(true);
    }

    reset(initial = false) {
        this.x = Math.random() * width;
        this.y = initial ? Math.random() * height : -30;
        this.size = Math.random() * 12 + 8;
        this.speedY = Math.random() * 1.1 + 0.5;
        this.speedX = Math.sin(Math.random() * Math.PI) * 0.7;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = (Math.random() - 0.5) * 1.4;
        this.opacity = Math.random() * 0.45 + 0.25;
        this.color = Math.random() > 0.4 ? 'rgba(255, 77, 141, ' : 'rgba(255, 140, 180, ';
        this.wobble = Math.random() * Math.PI * 2;
        this.wobbleSpeed = Math.random() * 0.025 + 0.01;
    }

    update() {
        this.y += this.speedY;
        this.wobble += this.wobbleSpeed;
        this.x += Math.sin(this.wobble) * 1.1 + this.speedX;
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
        ctx.shadowColor = 'rgba(255, 42, 109, 0.35)';
        ctx.shadowBlur = 8;

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

    const grad = bgCtx.createRadialGradient(width / 2, height / 2, 70, width / 2, height / 2, width * 0.85);
    grad.addColorStop(0, '#190212');
    grad.addColorStop(0.5, '#0b0008');
    grad.addColorStop(1, '#040003');
    bgCtx.fillStyle = grad;
    bgCtx.fillRect(0, 0, width, height);

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
        this.growth = 0;
        this.maxSize = Math.random() * 26 + 22;
        this.petals = maxPetals;
        this.colorHue = Math.random() * 40 + 330;
        this.life = 0;
        this.maxLife = 500;
        this.alpha = 1;
    }

    update() {
        if (this.growth < 1) {
            this.growth += 0.04;
        } else {
            this.life++;
            if (this.life > this.maxLife) {
                this.alpha -= 0.012;
            }
        }
    }

    draw(ctx) {
        if (this.alpha <= 0) return;

        ctx.save();
        ctx.globalAlpha = Math.max(0, this.alpha);
        ctx.translate(this.x, this.y);

        const currentSize = this.maxSize * Math.min(1, this.growth);

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
    createPetalBurst(x, y, 14);
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
        this.x = targetX || Math.random() * (width - 160) + 80;
        this.y = height;
        this.targetY = targetY || Math.random() * (height * 0.42) + 70;
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

        for (let i = 0; i < 18; i++) {
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
        }, i * 260);
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
        const speed = Math.random() * 5.5 + 2;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed - 1.2;
        this.gravity = 0.08;
        this.alpha = 1;
        this.decay = Math.random() * 0.02 + 0.014;
        this.char = char;
        this.size = char ? Math.random() * 12 + 13 : Math.random() * 6 + 3.5;
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

// Cursor Sparkle Trail
let lastTrailTime = 0;
window.addEventListener('pointermove', (e) => {
    const adminModal = document.getElementById('adminModal');
    if (adminModal && adminModal.classList.contains('open')) return;

    const now = performance.now();
    if (now - lastTrailTime > 40) {
        lastTrailTime = now;
        clickParticles.push(new PetalParticle(e.clientX, e.clientY));
    }
});

// ================= INTERACTION: CLICK SCREEN TO BLOOM =================
window.addEventListener('pointerdown', (e) => {
    const adminModal = document.getElementById('adminModal');
    if (
        e.target.closest('#envelopeContainer') ||
        e.target.closest('#envelopeHint') ||
        e.target.closest('#centerRose') ||
        e.target.closest('#dateBadge') ||
        e.target.closest('#btnReplay') ||
        e.target.closest('#secretAdminBtn') ||
        e.target.closest('.modal-card') ||
        (adminModal && adminModal.classList.contains('open'))
    ) {
        return;
    }

    spawnFlower(e.clientX, e.clientY);

    if (Math.random() > 0.65) {
        fireworks.push(new FlowerFirework(e.clientX, e.clientY - 60));
    }
});

// ================= FLOW: ENVELOPE OPENING & REPLAY =================
const envelopeScene = document.getElementById('envelopeScene');
const envelopeContainer = document.getElementById('envelopeContainer');
const envelopeHint = document.getElementById('envelopeHint');
const cardScene = document.getElementById('cardScene');
const btnReplay = document.getElementById('btnReplay');
const centerRose = document.getElementById('centerRose');

let isOpening = false;

function openEnvelope() {
    if (isOpening) return;
    isOpening = true;

    // Trigger opening animation on envelope
    envelopeContainer.classList.add('opening');

    // Crystal melody
    playCrystalChord();

    // Petal & sparkle bursts at envelope center
    const rect = envelopeContainer.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    createPetalBurst(cx, cy, 30);
    createPetalBurst(cx, cy, 14, '🌸');
    createPetalBurst(cx, cy, 10, '💖');

    // Launch celebratory fireworks
    launchFireworks(4);

    // Transition smoothly to opened card
    setTimeout(() => {
        envelopeScene.classList.remove('active');
        cardScene.classList.add('active');

        // Blooming celebration around card
        spawnFlower(cx - Math.min(140, width * 0.25), cy + 40);
        spawnFlower(cx + Math.min(140, width * 0.25), cy + 40);
        createPetalBurst(cx, cy, 20, '✨');
        isOpening = false;
    }, 750);
}

function replayCard() {
    cardScene.classList.remove('active');
    envelopeContainer.classList.remove('opening');
    playChime(392.00);

    setTimeout(() => {
        envelopeScene.classList.add('active');
    }, 350);
}

if (envelopeContainer) {
    envelopeContainer.addEventListener('click', openEnvelope);
}
if (envelopeHint) {
    envelopeHint.addEventListener('click', openEnvelope);
}
if (btnReplay) {
    btnReplay.addEventListener('click', replayCard);
}

// Center Rose Interaction
if (centerRose) {
    centerRose.addEventListener('click', (e) => {
        e.stopPropagation();
        const rect = centerRose.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;

        playCrystalChord();
        createPetalBurst(cx, cy, 35);
        createPetalBurst(cx, cy, 16, '🌸');
        createPetalBurst(cx, cy, 12, '💖');
        launchFireworks(4);
    });
}

// ================= RECIPIENT & ADMIN LOGIC =================
const cardRecipientName = document.getElementById('cardRecipientName');
const secretAdminBtn = document.getElementById('secretAdminBtn');
const adminModal = document.getElementById('adminModal');
const btnCloseModal = document.getElementById('btnCloseModal');
const adminNameInput = document.getElementById('adminNameInput');
const previewUrlText = document.getElementById('previewUrlText');
const btnApplyPreview = document.getElementById('btnApplyPreview');
const btnCopyLink = document.getElementById('btnCopyLink');
const toast = document.getElementById('toast');
const toastMsg = document.getElementById('toastMsg');
const dateBadge = document.getElementById('dateBadge');

let toastTimeout = null;

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

function getBaseUrl() {
    if (window.location.origin && window.location.origin !== 'null' && window.location.protocol.startsWith('http')) {
        return `${window.location.origin}${window.location.pathname}`;
    }
    return window.location.href.split('?')[0].split('#')[0];
}

// Generate link strictly WITHOUT ?admin=true
function generateShareUrl(name) {
    const base = getBaseUrl();
    const trimmed = (name || '').trim();
    if (!trimmed) {
        return `${base}?to=...`;
    }
    return `${base}?to=${encodeURIComponent(trimmed)}`;
}

function updatePreviewUrl(name) {
    if (previewUrlText) {
        previewUrlText.textContent = generateShareUrl(name);
    }
}

function setRecipient(name) {
    const resolvedName = (name || '').trim() || 'Người Phụ Nữ Tuyệt Vời';
    if (cardRecipientName) {
        cardRecipientName.textContent = resolvedName;
    }
    document.title = `20/10 🌹 ${resolvedName} | Happy Women's Day`;
}

function getRecipientFromUrl() {
    try {
        const params = new URLSearchParams(window.location.search);
        let name = params.get('to') || params.get('name');
        if (!name) return null;
        try {
            name = decodeURIComponent(name.replace(/\+/g, ' '));
        } catch (e) {
            // keep raw
        }
        return name.trim() || null;
    } catch (e) {
        return null;
    }
}

function openAdminModal() {
    if (!adminModal) return;

    if (!adminNameInput.value) {
        const currentName = cardRecipientName ? cardRecipientName.textContent.trim() : '';
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

function unlockAdmin() {
    if (secretAdminBtn) {
        secretAdminBtn.classList.add('visible');
    }
    showToast('👑 Đã mở khóa Bảng Quản Trị Admin!', '✨');
    setTimeout(() => {
        openAdminModal();
    }, 350);
}

// 5-Click Easter Egg on "20 . 10" badge
let badgeClickCount = 0;
let lastBadgeClickTime = 0;

if (dateBadge) {
    dateBadge.addEventListener('click', (e) => {
        e.stopPropagation();
        const now = performance.now();
        if (now - lastBadgeClickTime < 700) {
            badgeClickCount++;
        } else {
            badgeClickCount = 1;
        }
        lastBadgeClickTime = now;

        createPetalBurst(e.clientX, e.clientY, 6, '✨');
        playChime(440 + badgeClickCount * 70);

        if (badgeClickCount >= 5) {
            badgeClickCount = 0;
            unlockAdmin();
        }
    });
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
        tempInput.style.background = 'transparent';
        document.body.appendChild(tempInput);
        tempInput.focus();
        tempInput.select();
        const success = document.execCommand('copy');
        document.body.removeChild(tempInput);
        return success;
    } catch (err) {
        return false;
    }
}

async function handleCopyLink() {
    const rawName = adminNameInput.value.trim() ||
        (cardRecipientName ? cardRecipientName.textContent.trim() : '') ||
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

if (secretAdminBtn) {
    secretAdminBtn.addEventListener('click', openAdminModal);
}
if (btnCloseModal) {
    btnCloseModal.addEventListener('click', closeAdminModal);
}
if (adminModal) {
    adminModal.addEventListener('click', (e) => {
        if (e.target === adminModal) closeAdminModal();
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
        } catch (e) {}

        closeAdminModal();
        // Replay opening to see the personalized card bloom
        replayCard();
        setTimeout(() => {
            openEnvelope();
        }, 400);
        showToast(`Đã áp dụng tặng: "${name}"`, '🌹');
    });
}

if (btnCopyLink) {
    btnCopyLink.addEventListener('click', handleCopyLink);
}

// ================= INITIALIZATION =================
const urlParams = new URLSearchParams(window.location.search);
const isAdminParam = urlParams.get('admin') === 'true';
const initialName = getRecipientFromUrl();

// Set initial recipient name
if (initialName) {
    setRecipient(initialName);
    if (adminNameInput) adminNameInput.value = initialName;
    updatePreviewUrl(initialName);
} else {
    setRecipient('Người Phụ Nữ Tuyệt Vời');
    updatePreviewUrl('');
}

// Handle Admin Query Parameter ?admin=true
if (isAdminParam) {
    if (secretAdminBtn) {
        secretAdminBtn.classList.add('visible');
    }
    setTimeout(() => {
        openAdminModal();
    }, 450);
}
