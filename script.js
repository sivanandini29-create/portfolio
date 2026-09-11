// Theme toggle with persistence
const root = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('portfolio-theme');
if (savedTheme) root.setAttribute('data-theme', savedTheme);

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const current = root.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('portfolio-theme', next);
  });
}

// Mobile menu toggle
const menuBtn = document.getElementById('menuBtn');
const navLinks = document.getElementById('navLinks');
if (menuBtn && navLinks) {
  menuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('mobile-open');
  });
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => navLinks.classList.remove('mobile-open'));
  });
}

// Ensure ambient mesh & glass curtain exist
function ensureGlassContainers() {
  if (!document.querySelector('.ambient-mesh')) {
    const mesh = document.createElement('div');
    mesh.className = 'ambient-mesh';
    mesh.setAttribute('aria-hidden', 'true');
    mesh.innerHTML = `
      <div class="ambient-orb orb-1"></div>
      <div class="ambient-orb orb-2"></div>
      <div class="ambient-orb orb-3"></div>
    `;
    document.body.prepend(mesh);
  }

  if (!document.getElementById('pageTransitionCurtain')) {
    const curtain = document.createElement('div');
    curtain.id = 'pageTransitionCurtain';
    curtain.className = 'glass-transition-curtain';
    curtain.setAttribute('aria-hidden', 'true');
    curtain.innerHTML = `<div class="transition-spinner"></div>`;
    document.body.appendChild(curtain);
  }
}

// Update Active Nav Link state
function updateActiveNavLinks(currentPath) {
  const normalizedCurrent = currentPath.split('/').pop().toLowerCase() || 'index.html';
  
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    
    const linkPath = href.split('#')[0].split('/').pop().toLowerCase() || 'index.html';
    
    if (linkPath === normalizedCurrent) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    } else {
      link.classList.remove('active');
      link.removeAttribute('aria-current');
    }
  });
}

// Interactive Glass Cursor Reflection Effect
function initGlassCardsEffect() {
  if (window.matchMedia('(pointer: coarse)').matches) return; // Skip touch devices

  const glassCards = document.querySelectorAll(
    '.project-card, .skill-card, .fact-card, .cert-card, .activity-card, .code-window, .contact-item'
  );

  glassCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -3;
      const rotateY = ((x - centerX) / centerX) * 3;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

// Certificate Lightbox Modal Logic
function initCertModal() {
  const certCards = document.querySelectorAll('.cert-card[data-cert-image]');
  const modalOverlay = document.getElementById('certModal');
  const modalImg = document.getElementById('certModalImg');
  const modalClose = document.getElementById('certModalClose');
  let lastFocusedElement = null;

  if (certCards.length > 0 && modalOverlay) {
    function openModal(imageSrc) {
      lastFocusedElement = document.activeElement;
      if (modalImg) modalImg.src = imageSrc;
      modalOverlay.classList.add('active');
      if (modalClose) modalClose.focus();
    }

    function closeModal() {
      modalOverlay.classList.remove('active');
      setTimeout(() => { if (modalImg) modalImg.src = ''; }, 300);
      if (lastFocusedElement) lastFocusedElement.focus();
    }

    certCards.forEach(card => {
      // Remove previous listener clone to prevent duplicates
      const newCard = card.cloneNode(true);
      card.parentNode.replaceChild(newCard, card);

      newCard.addEventListener('click', () => {
        const title = newCard.querySelector('h4')?.textContent || 'Certificate';
        if (modalImg) modalImg.alt = title;
        openModal(newCard.getAttribute('data-cert-image'));
      });
      newCard.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const title = newCard.querySelector('h4')?.textContent || 'Certificate';
          if (modalImg) modalImg.alt = title;
          openModal(newCard.getAttribute('data-cert-image'));
        }
      });
      newCard.setAttribute('tabindex', '0');
    });

    if (modalClose) {
      modalClose.onclick = closeModal;
    }
    modalOverlay.onclick = (e) => {
      if (e.target === modalOverlay) closeModal();
    };

    document.onkeydown = (e) => {
      if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
        closeModal();
      }
      if (e.key === 'Tab' && modalOverlay.classList.contains('active')) {
        e.preventDefault();
        if (modalClose) modalClose.focus();
      }
    };
  }
}

// EmailJS Contact Form Logic
function initContactForm() {
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.onsubmit = function (e) {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const msgBox = document.getElementById('formMessage');

      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
      msgBox.className = 'form-message';
      msgBox.style.display = 'none';

      if (typeof emailjs !== 'undefined') {
        emailjs.sendForm('REPLACE_WITH_YOUR_SERVICE_ID', 'REPLACE_WITH_YOUR_TEMPLATE_ID', this)
          .then(() => {
            msgBox.textContent = 'Message sent successfully! I will get back to you soon.';
            msgBox.className = 'form-message success';
            msgBox.style.display = 'block';
            contactForm.reset();
          }, (error) => {
            msgBox.textContent = 'Failed to send the message. Please try again later. Error: ' + JSON.stringify(error);
            msgBox.className = 'form-message error';
            msgBox.style.display = 'block';
          })
          .finally(() => {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send Message';
          });
      } else {
        msgBox.textContent = 'EmailJS is not configured yet. Set your keys to enable sending.';
        msgBox.className = 'form-message error';
        msgBox.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Message';
      }
    };
  }
}

// Bind links inside main content for page transitions
function bindTransitionLinks() {
  document.querySelectorAll('a').forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;

    // Check if it's an internal page link
    const isExternal = link.host && link.host !== window.location.host;
    const isDownload = link.hasAttribute('download');
    const isAnchorOnly = href.startsWith('#');
    const isMailOrTel = href.startsWith('mailto:') || href.startsWith('tel:');

    if (!isExternal && !isDownload && !isAnchorOnly && !isMailOrTel) {
      link.onclick = (e) => {
        // Allow command/ctrl clicks for opening in new tabs
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        navigateToPage(link.href, true);
      };
    }
  });
}

// Page Components Initializer
function initPageComponents() {
  initCertModal();
  initContactForm();
  initGlassCardsEffect();
  bindTransitionLinks();
}

// Glowing Glass Top Progress Stream
function showProgressBar() {
  let bar = document.getElementById('glassProgressBar');
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'glassProgressBar';
    bar.className = 'glass-progress-bar';
    document.body.prepend(bar);
  }
  bar.style.opacity = '1';
  bar.style.width = '35%';
  setTimeout(() => {
    if (bar.style.opacity === '1') bar.style.width = '70%';
  }, 140);
}

function finishProgressBar() {
  const bar = document.getElementById('glassProgressBar');
  if (!bar) return;
  bar.style.width = '100%';
  setTimeout(() => {
    bar.style.opacity = '0';
    setTimeout(() => {
      bar.style.width = '0%';
    }, 280);
  }, 160);
}

// Fluid Frosted Glass Page Transition Engine
let isNavigating = false;

async function navigateToPage(url, updateHistory = true) {
  if (isNavigating) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    if (updateHistory) window.location.href = url;
    return;
  }

  const currentUrl = new URL(window.location.href);
  const targetUrl = new URL(url, window.location.href);

  // If navigating to an anchor on the same page
  if (currentUrl.pathname === targetUrl.pathname && targetUrl.hash) {
    const el = document.querySelector(targetUrl.hash);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      if (updateHistory) history.pushState(null, '', url);
      return;
    }
  }

  isNavigating = true;
  showProgressBar();

  const main = document.querySelector('main');

  // 1. Visibly animate current page OUT (blur + glide up)
  if (main) {
    main.classList.remove('initial-load', 'page-enter-active', 'page-enter-prepare');
    main.classList.add('page-exit-active');
  }

  try {
    // Parallel fetch + guarantee smooth exit animation duration (220ms)
    const [response] = await Promise.all([
      fetch(url),
      new Promise(resolve => setTimeout(resolve, 220))
    ]);

    if (!response.ok) throw new Error(`HTTP status: ${response.status}`);
    const htmlText = await response.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, 'text/html');
    const newMain = doc.querySelector('main');

    if (!newMain) throw new Error('No <main> found in destination');

    // 2. Prepare new page content
    if (main) {
      main.innerHTML = newMain.innerHTML;
      main.className = newMain.className;
      main.id = newMain.id;
    }

    // Update title
    document.title = doc.title;

    // Update history
    if (updateHistory) {
      history.pushState(null, '', url);
    }

    // Handle scroll position
    if (targetUrl.hash) {
      const el = document.querySelector(targetUrl.hash);
      if (el) el.scrollIntoView();
      else window.scrollTo(0, 0);
    } else {
      window.scrollTo(0, 0);
    }

    // Update active nav indicators
    updateActiveNavLinks(targetUrl.pathname);

    // Rebind components for newly loaded page
    initPageComponents();

    // Finish progress bar
    finishProgressBar();

    // 3. Trigger fluid entrance animation with staggered cards
    if (main) {
      main.classList.remove('page-exit-active');
      main.classList.add('page-enter-prepare');
      
      // Force reflow
      void main.offsetHeight;

      requestAnimationFrame(() => {
        main.classList.remove('page-enter-prepare');
        main.classList.add('page-enter-active');
      });

      setTimeout(() => {
        main.classList.remove('page-enter-active');
        isNavigating = false;
      }, 550);
    } else {
      isNavigating = false;
    }

  } catch (error) {
    // Graceful fallback for file:// protocol, network error, or CSP restrictions
    console.warn('Transition fetch fallback to MPA navigation:', error);
    finishProgressBar();
    document.body.classList.add('glass-exit');
    setTimeout(() => {
      window.location.href = url;
    }, 160);
  }
}

// Browser Back / Forward Button Handling
window.addEventListener('popstate', () => {
  navigateToPage(window.location.href, false);
});

// Initial Setup on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  ensureGlassContainers();
  updateActiveNavLinks(window.location.pathname);
  initPageComponents();

  // Play initial page entrance bloom
  const main = document.querySelector('main');
  if (main) {
    main.classList.add('initial-load');
    setTimeout(() => {
      main.classList.remove('initial-load');
    }, 700);
  }
});
