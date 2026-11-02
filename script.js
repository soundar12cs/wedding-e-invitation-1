document.addEventListener('DOMContentLoaded', () => {
  AOS.init({ duration: 900, once: true, offset: 70, easing: 'ease-out-cubic' });

  const welcome = document.getElementById('welcome');
  const envelope = document.getElementById('openEnvelope');
  const invitation = document.getElementById('invitationCard');
  const main = document.getElementById('mainContent');
  let opened = false;

  envelope.addEventListener('click', () => {
    if (opened) return;
    opened = true;
    welcome.classList.add('opening');
    invitation.classList.add('show');
    invitation.setAttribute('aria-hidden', 'false');
    createPetals(28);
    if (typeof gsap !== 'undefined') gsap.fromTo(invitation, { y: -30 }, { y: 0, duration: 1.2, delay: 2 });
  });

  document.getElementById('enterInvitation').addEventListener('click', () => {
    gsap ? gsap.to(welcome, { opacity: 0, duration: 1, onComplete: () => {
      welcome.style.display = 'none'; document.body.style.overflow = '';
      main.classList.add('visible'); window.scrollTo(0, 0); AOS.refresh();
    }}) : (welcome.style.display = 'none', main.classList.add('visible'));
    startMusic();
  });

  document.body.style.overflow = 'hidden';

  function createPetals(count) {
    const layer = document.getElementById('petalLayer');
    for (let i = 0; i < count; i++) {
      const petal = document.createElement('span');
      petal.className = 'petal';
      petal.style.left = `${Math.random() * 100}%`;
      petal.style.animationDuration = `${4 + Math.random() * 5}s`;
      petal.style.animationDelay = `${Math.random() * 2}s`;
      petal.style.setProperty('--drift', `${-120 + Math.random() * 240}px`);
      layer.appendChild(petal);
      setTimeout(() => petal.remove(), 11000);
    }
  }

  // Countdown — replace with the ceremony date/time when finalizing.
  const weddingDate = new Date('2026-12-14T10:30:00+05:30').getTime();
  function updateCountdown() {
    const distance = Math.max(0, weddingDate - Date.now());
    document.getElementById('days').textContent = String(Math.floor(distance / 86400000)).padStart(2, '0');
    document.getElementById('hours').textContent = String(Math.floor(distance % 86400000 / 3600000)).padStart(2, '0');
    document.getElementById('minutes').textContent = String(Math.floor(distance % 3600000 / 60000)).padStart(2, '0');
    document.getElementById('seconds').textContent = String(Math.floor(distance % 60000 / 1000)).padStart(2, '0');
  }
  updateCountdown(); setInterval(updateCountdown, 1000);

  // Music remains paused until the guest activates the site.
  const audio = document.getElementById('backgroundMusic');
  const musicToggle = document.getElementById('musicToggle');
  let musicStarted = false;
  function setMusicButton(playing) {
    musicToggle.classList.toggle('playing', playing);
    musicToggle.setAttribute('aria-pressed', String(playing));
    musicToggle.setAttribute('aria-label', playing ? 'Pause background music' : 'Play background music');
    musicToggle.querySelector('i').className = playing ? 'fa-solid fa-pause' : 'fa-solid fa-play';
  }
  function startMusic() {
    if (musicStarted) return;
    musicStarted = true;
    audio.volume = 0.35;
    audio.play().then(() => setMusicButton(true)).catch(() => setMusicButton(false));
  }
  musicToggle.addEventListener('click', () => {
    if (audio.paused) audio.play().then(() => setMusicButton(true)).catch(() => {});
    else { audio.pause(); setMusicButton(false); }
  });

  // Sticky navigation appearance.
  const nav = document.querySelector('.wedding-nav');
  window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 80));
  document.querySelectorAll('.navbar-nav .nav-link').forEach(link => link.addEventListener('click', () => {
    const menu = document.querySelector('.navbar-collapse');
    if (menu.classList.contains('show') && bootstrap.Collapse) bootstrap.Collapse.getOrCreateInstance(menu).hide();
  }));

  // Canvas scratch card with responsive pointer coordinates.
  const canvas = document.getElementById('scratchCanvas');
  const ctx = canvas.getContext('2d');
  let scratching = false;
  function paintScratchLayer() {
    ctx.globalCompositeOperation = 'source-over';
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#b79052'); gradient.addColorStop(.4, '#f0d493');
    gradient.addColorStop(.7, '#c49a58'); gradient.addColorStop(1, '#e8c77e');
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.font = '24px Cormorant Garamond'; ctx.textAlign = 'center';
    ctx.fillText('SCRATCH HERE', canvas.width / 2, canvas.height / 2 + 7);
    ctx.fillStyle = 'rgba(255,255,255,.18)';
    for (let i = 0; i < 120; i++) ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 2, 2);
  }
  paintScratchLayer();
  function scratch(event) {
    if (event.cancelable) event.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const point = event.touches ? event.touches[0] : event;
    const x = (point.clientX - rect.left) * canvas.width / rect.width;
    const y = (point.clientY - rect.top) * canvas.height / rect.height;
    ctx.globalCompositeOperation = 'destination-out'; ctx.beginPath(); ctx.arc(x, y, 34, 0, Math.PI * 2); ctx.fill();
  }
  canvas.addEventListener('pointerdown', e => { scratching = true; scratch(e); });
  canvas.addEventListener('pointermove', e => { if (scratching) scratch(e); });
  window.addEventListener('pointerup', () => scratching = false);

  // Gallery lightbox.
  const lightbox = document.getElementById('lightbox');
  document.querySelectorAll('.gallery-grid figure').forEach(figure => figure.addEventListener('click', () => {
    lightbox.querySelector('img').src = figure.querySelector('img').src.replace(/w=\d+/, 'w=1600');
    lightbox.classList.add('open'); document.body.style.overflow = 'hidden';
  }));
  function closeLightbox() { lightbox.classList.remove('open'); document.body.style.overflow = ''; }
  lightbox.querySelector('button').addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });

  // Frontend RSVP persistence; replace saveRsvp with an API request for Spring Boot.
  const rsvpForm = document.getElementById('rsvpForm');
  rsvpForm.addEventListener('submit', e => {
    e.preventDefault();
    if (!rsvpForm.checkValidity()) { rsvpForm.reportValidity(); return; }
    const response = Object.fromEntries(new FormData(rsvpForm).entries());
    response.createdAt = new Date().toISOString();
    const saved = JSON.parse(localStorage.getItem('aaravMeeraRsvp') || '[]');
    saved.push(response); localStorage.setItem('aaravMeeraRsvp', JSON.stringify(saved));
    const status = document.getElementById('rsvpStatus');
    status.textContent = response.attendance === 'yes'
      ? 'Thank you! We cannot wait to celebrate with you. 💛'
      : 'Thank you for letting us know. You will be dearly missed. 💛';
    rsvpForm.reset();
  });

  // Guestbook persistence and rendering.
  const wishList = document.getElementById('wishList');
  function getWishes() { return JSON.parse(localStorage.getItem('aaravMeeraWishes') || '[]'); }
  function renderWishes() {
    const defaults = [{ name: 'The Sharma Family', wish: 'May your life together be filled with endless laughter and love.' }, { name: 'Ananya', wish: 'Wishing you a lifetime of beautiful adventures together!' }];
    const wishes = [...getWishes(), ...defaults].slice(-8).reverse();
    wishList.innerHTML = wishes.map(w => `<article class="wish-card"><i class="fa-solid fa-heart"></i><p>“${escapeHTML(w.wish)}”</p><small>— ${escapeHTML(w.name)}</small></article>`).join('');
  }
  function escapeHTML(value) { const div = document.createElement('div'); div.textContent = value; return div.innerHTML; }
  document.getElementById('guestbookForm').addEventListener('submit', e => {
    e.preventDefault(); const form = e.currentTarget; if (!form.checkValidity()) { form.reportValidity(); return; }
    const data = new FormData(form);
    const wishes = getWishes(); wishes.push({ name: data.get('name').trim(), wish: data.get('wish').trim() });
    localStorage.setItem('aaravMeeraWishes', JSON.stringify(wishes)); renderWishes(); form.reset();
    document.getElementById('guestbookStatus').textContent = 'Your blessing has been added with love.';
  });
  renderWishes();

  // WhatsApp sharing uses the current page link.
  const shareText = encodeURIComponent('You are invited to Aarav & Meera’s wedding on 14 December 2026. View the invitation: ' + window.location.href);
  document.getElementById('whatsappShare').href = `https://wa.me/?text=${shareText}`;

  // Print/save as PDF through the browser's PDF printer.
  document.getElementById('downloadInvitation').addEventListener('click', () => {
    window.print();
  });

  // Create soft petal ambience after the invitation opens.
  setInterval(() => { if (!welcome.isConnected || welcome.style.display === 'none') createPetals(2); }, 3500);
});
