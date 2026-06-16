'use strict';

/* === NAVBAR: transparent hero → solid on scroll === */
const navbar = document.getElementById('navbar');
const hero = document.getElementById('hero');

function updateNav() {
  const threshold = hero ? hero.offsetHeight * 0.75 : window.innerHeight * 0.75;
  const scrolled = window.scrollY > threshold;
  navbar.classList.toggle('nav--scrolled', scrolled);
  navbar.classList.toggle('nav--hero', !scrolled);
}
window.addEventListener('scroll', updateNav, { passive: true });
updateNav();

/* === MOBILE MENU === */
const burger = document.getElementById('burger');
const mobileMenu = document.getElementById('mobileMenu');

burger.addEventListener('click', () => {
  const open = mobileMenu.classList.toggle('is-open');
  burger.classList.toggle('is-open', open);
  burger.setAttribute('aria-expanded', open);
  mobileMenu.setAttribute('aria-hidden', !open);
});
document.querySelectorAll('.mobile-link, .mobile-cta').forEach(el => {
  el.addEventListener('click', () => {
    mobileMenu.classList.remove('is-open');
    burger.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-hidden', 'true');
  });
});

/* === REVEAL ON SCROLL === */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const delay = parseInt(entry.target.dataset.delay || 0, 10);
    setTimeout(() => entry.target.classList.add('is-visible'), delay);
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => {
  const siblings = el.parentElement.querySelectorAll('.reveal');
  const idx = Array.from(siblings).indexOf(el);
  el.dataset.delay = Math.min(idx * 80, 280);
  revealObserver.observe(el);
});

/* === HERO PARALLAX === */
const heroImg = document.querySelector('.hero__img');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (heroImg && !reduceMotion) {
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = Math.min(window.scrollY, window.innerHeight);
      heroImg.style.transform = `translateY(${y * 0.07}px)`;
      ticking = false;
    });
  }, { passive: true });
}

/* === COUNTERS === */
function animateCount(el) {
  const target = parseInt(el.dataset.count, 10);
  const suffix = el.dataset.suffix || '';
  const dur = 1600;
  const start = performance.now();
  function step(now) {
    const p = Math.min((now - start) / dur, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(target * eased) + (p === 1 ? suffix : '');
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

const counters = document.querySelectorAll('[data-count]');
if (counters.length) {
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      reduceMotion
        ? (entry.target.textContent = entry.target.dataset.count + (entry.target.dataset.suffix || ''))
        : animateCount(entry.target);
      countObserver.unobserve(entry.target);
    });
  }, { threshold: 0.7 });
  counters.forEach(c => countObserver.observe(c));
}

/* === SMOOTH SCROLL === */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = navbar.offsetHeight;
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
  });
});

/* === CONTACT FORM === */
const form = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');
const submitBtn = document.getElementById('submitBtn');

function validateField(id, errorId, check, msg) {
  const el = document.getElementById(id);
  const err = document.getElementById(errorId);
  const valid = check(el.value.trim());
  el.classList.toggle('has-error', !valid);
  err.textContent = valid ? '' : msg;
  return valid;
}

['name', 'phone', 'email', 'message'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', () => {
    el.classList.remove('has-error');
    document.getElementById(id + 'Error').textContent = '';
  });
});

form.addEventListener('submit', async e => {
  e.preventDefault();
  const nameOk = validateField('name', 'nameError', v => v.length >= 2, 'Įveskite vardą (min. 2 simboliai)');
  const phoneOk = validateField('phone', 'phoneError', v => /^[\+\d\s\-\(\)]{7,}$/.test(v), 'Įveskite teisingą telefoną');
  const emailEl = document.getElementById('email');
  const emailVal = emailEl.value.trim();
  const emailOk = !emailVal || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal);
  if (!emailOk) {
    emailEl.classList.add('has-error');
    document.getElementById('emailError').textContent = 'Neteisingas el. pašto formatas';
  }
  const msgOk = validateField('message', 'messageError', v => v.length >= 10, 'Parašykite žinutę (min. 10 simbolių)');
  if (!nameOk || !phoneOk || !emailOk || !msgOk) {
    form.querySelector('.has-error')?.focus();
    return;
  }
  submitBtn.disabled = true;
  submitBtn.textContent = 'Siunčiama...';
  await new Promise(r => setTimeout(r, 1200));
  form.style.display = 'none';
  formSuccess.hidden = false;
  formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
});
