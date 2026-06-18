/* ═══════════════════════════════════════════════════════════
   EcoTrace — Animations & UI Effects
   Micro-animations, transitions, confetti, toasts
   ═══════════════════════════════════════════════════════════ */

const Animations = (() => {

  /**
   * Animated counter that ticks up/down to target value
   */
  function animateCounter(element, targetValue, options = {}) {
    const duration = options.duration || 1200;
    const decimals = options.decimals || 1;
    const startValue = options.startFrom !== undefined ? options.startFrom : 0;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out expo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      const current = startValue + (targetValue - startValue) * eased;
      
      if (typeof element === 'string') {
        const el = document.getElementById(element);
        if (el) el.textContent = current.toFixed(decimals);
      } else if (element) {
        element.textContent = current.toFixed(decimals);
      }

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  /**
   * Staggered entrance animation for child elements
   */
  function staggerEntrance(parentSelector, animationClass = 'animate-fade-in-up', delayMs = 60) {
    const parent = document.querySelector(parentSelector);
    if (!parent) return;

    Array.from(parent.children).forEach((child, i) => {
      child.style.opacity = '0';
      child.style.animationDelay = `${i * delayMs}ms`;
      child.classList.add(animationClass);
      
      child.addEventListener('animationend', () => {
        child.style.opacity = '';
      }, { once: true });
    });
  }

  /**
   * Confetti burst effect
   */
  function confetti(options = {}) {
    const count = options.count || 50;
    const colors = options.colors || ['#34d399', '#fbbf24', '#38bdf8', '#c084fc', '#f43f5e', '#a7f3d0'];
    
    const container = document.createElement('div');
    container.className = 'confetti-container';
    document.body.appendChild(container);

    for (let i = 0; i < count; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.left = Math.random() * 100 + '%';
      piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      piece.style.width = (Math.random() * 8 + 4) + 'px';
      piece.style.height = (Math.random() * 8 + 4) + 'px';
      piece.style.animationDuration = (Math.random() * 2 + 2) + 's';
      piece.style.animationDelay = (Math.random() * 0.5) + 's';
      
      if (Math.random() > 0.5) {
        piece.style.borderRadius = '50%';
      }
      
      container.appendChild(piece);
    }

    setTimeout(() => container.remove(), 4000);
  }

  /**
   * Toast notification
   */
  function toast(message, options = {}) {
    const type = options.type || 'success'; // success, warning, error
    const duration = options.duration || 3000;
    const emoji = options.emoji || (type === 'success' ? '✅' : type === 'warning' ? '⚠️' : '❌');

    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.innerHTML = `
      <span class="toast__icon">${emoji}</span>
      <span class="toast__message">${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast--exiting');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  /**
   * Ripple effect on button click
   */
  function addRipple(button, event) {
    const rect = button.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (event.clientX - rect.left - size / 2) + 'px';
    ripple.style.top = (event.clientY - rect.top - size / 2) + 'px';

    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  }

  /**
   * Page transition — slide views in/out
   */
  function transitionView(outElement, inElement, direction = 'left') {
    if (outElement) {
      outElement.style.animation = direction === 'left' 
        ? 'fadeOutLeft 250ms ease forwards'
        : 'fadeOutRight 250ms ease forwards';
      
      setTimeout(() => {
        outElement.style.display = 'none';
        outElement.style.animation = '';
      }, 250);
    }

    if (inElement) {
      setTimeout(() => {
        inElement.style.display = '';
        inElement.style.animation = direction === 'left'
          ? 'slideInRight 400ms cubic-bezier(0.19, 1, 0.22, 1)'
          : 'slideInLeft 400ms cubic-bezier(0.19, 1, 0.22, 1)';
        
        setTimeout(() => {
          inElement.style.animation = '';
        }, 400);
      }, outElement ? 200 : 0);
    }
  }

  /**
   * Pulse highlight effect
   */
  function pulse(element) {
    if (typeof element === 'string') element = document.querySelector(element);
    if (!element) return;

    element.style.animation = 'none';
    element.offsetHeight; // force reflow
    element.style.animation = 'glow 1s ease-in-out';
    setTimeout(() => { element.style.animation = ''; }, 1000);
  }

  /**
   * Number flip animation for CO2 counter
   */
  function flipNumber(element, newValue, decimals = 1) {
    if (typeof element === 'string') element = document.getElementById(element);
    if (!element) return;

    const current = parseFloat(element.textContent) || 0;
    animateCounter(element, newValue, { startFrom: current, decimals, duration: 600 });
  }

  // Initialize ripple effects on all buttons
  function initRipples() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn');
      if (btn) addRipple(btn, e);
    });
  }

  return {
    animateCounter, staggerEntrance, confetti, toast,
    addRipple, transitionView, pulse, flipNumber, initRipples
  };
})();
