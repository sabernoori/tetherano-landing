document.addEventListener('DOMContentLoaded', () => {
  const log = (...args) => console.log('[MobileMenu]', ...args);

  const hamburgerBtn = document.querySelector('.nav_button.is-hamburger');
  const mobMenu = document.querySelector('.mob-menu');
  const overlay = mobMenu ? mobMenu.querySelector('.overlay') : null;
  const wrapper = mobMenu ? mobMenu.querySelector('.mob-menu_wrapper') : null;
  const closeBtn = mobMenu ? mobMenu.querySelector('.mob-menu_close-btn') : null;

  log('DOM ready');
  log('Found elements:', {
    hamburgerBtn: !!hamburgerBtn,
    mobMenu: !!mobMenu,
    overlay: !!overlay,
    wrapper: !!wrapper,
  });

  if (!hamburgerBtn || !mobMenu || !overlay || !wrapper) {
    console.warn('[MobileMenu] Missing required elements. Check selectors.');
    return;
  }

  const isMobile = () => window.matchMedia('(max-width: 991px)').matches;
  let isAnimating = false;
  let phase = 'idle'; // 'idle' | 'opening' | 'open' | 'closing'

  function openMenu(evt) {
    log('Hamburger clicked', { isMobile: isMobile(), isAnimating, isOpen: mobMenu.classList.contains('is-open') });
    // Restrict to mobile/tablet widths only
    if (!isMobile()) {
      log('Ignored: not under 992px');
      return;
    }
    if (phase === 'opening' || phase === 'open') {
      log('Ignored: already opening/open');
      return;
    }
    isAnimating = true;
    phase = 'opening';
    mobMenu.classList.remove('is-closing');
    mobMenu.classList.add('is-open');
    log('Menu state → is-open; pre-frame display:', getComputedStyle(mobMenu).display);
    // Fallback: if display is still none due to cascade, force inline
    if (getComputedStyle(mobMenu).display === 'none') {
      mobMenu.style.display = 'flex';
      log('Forced inline display:flex as fallback');
    }
    // Log after the browser has applied styles (next frame)
    requestAnimationFrame(() => {
      log('Menu state → is-open; post-frame styles', {
        mobMenuDisplay: getComputedStyle(mobMenu).display,
        overlayOpacity: getComputedStyle(overlay).opacity,
        wrapperTransform: getComputedStyle(wrapper).transform,
      });
    });
    // When slide-in finishes, clear animating flag (only if still opening)
    wrapper.addEventListener('animationend', (e) => {
      log('Wrapper animationend (open-phase)', e.animationName, 'phase=', phase);
      if (phase !== 'opening') return;
      isAnimating = false;
      phase = 'open';
    }, { once: true });
    wrapper.addEventListener('animationstart', (e) => {
      log('Wrapper animationstart (open)', e.animationName);
    }, { once: true });
  }

  function closeMenu(evt) {
    log('Overlay clicked', { isAnimating, isOpen: mobMenu.classList.contains('is-open') });
    // Allow closing even if opening is in progress; block only if already closing or fully closed
    if (phase === 'closing' || (!mobMenu.classList.contains('is-open') && phase !== 'opening')) {
      log('Ignored: already closing or closed');
      return;
    }
    isAnimating = true;
    phase = 'closing';
    mobMenu.classList.remove('is-open');
    mobMenu.classList.add('is-closing');
    log('Menu state → is-closing; pre-frame display:', getComputedStyle(mobMenu).display);
    // Log after styles apply (next frame)
    requestAnimationFrame(() => {
      log('Menu state → is-closing; post-frame styles', {
        mobMenuDisplay: getComputedStyle(mobMenu).display,
        overlayOpacity: getComputedStyle(overlay).opacity,
        wrapperTransform: getComputedStyle(wrapper).transform,
      });
    });
    const finishClose = (source) => {
      log('Finish close via', source);
      mobMenu.classList.remove('is-closing');
      // Remove any inline fallback and force hide to guarantee base state
      if (mobMenu.style.display) {
        mobMenu.style.removeProperty('display');
      }
      mobMenu.style.display = 'none';
      isAnimating = false;
      log('Menu state → closed; computed display:', getComputedStyle(mobMenu).display);
      requestAnimationFrame(() => {
        log('After-close computed styles', {
          mobMenuDisplay: getComputedStyle(mobMenu).display,
          overlayOpacity: getComputedStyle(overlay).opacity,
          wrapperTransform: getComputedStyle(wrapper).transform,
        });
      });
    };

    // After slide-out completes, hide container (primary path, only if still closing)
    wrapper.addEventListener('animationend', (e) => {
      log('Wrapper animationend (close-phase)', e.animationName, 'phase=', phase);
      if (phase !== 'closing') return;
      finishClose('animationend');
    }, { once: true });

    // Fallback if animationend doesn’t fire
    const CLOSE_DURATION_MS = 320;
    setTimeout(() => {
      if (isAnimating) {
        log('Close timeout fallback fired');
        finishClose('timeout');
      }
    }, CLOSE_DURATION_MS);
    wrapper.addEventListener('animationstart', (e) => {
      log('Wrapper animationstart (close)', e.animationName);
    }, { once: true });
  }

  // Open on hamburger click (only mobile widths)
  hamburgerBtn.addEventListener('click', openMenu);
  log('Bound click → hamburger');

  // Overlay acts as close button
  overlay.addEventListener('click', closeMenu);
  log('Bound click → overlay');

  // Close button handler
  if (closeBtn) {
    closeBtn.addEventListener('click', closeMenu);
    log('Bound click → closeBtn');
  } else {
    log('Close button not found');
  }

  // If the viewport grows beyond mobile while menu is open, close it
  window.addEventListener('resize', () => {
    const mobile = isMobile();
    log('Resize', { mobile, isOpen: mobMenu.classList.contains('is-open') });
    if (!mobile && mobMenu.classList.contains('is-open')) {
      log('Closing due to viewport > 992px');
      closeMenu();
    }
  });

  // Initial state diagnostics
  log('Initial diagnostics', {
    isMobile: isMobile(),
    mobMenuDisplay: getComputedStyle(mobMenu).display,
    overlayOpacity: getComputedStyle(overlay).opacity,
    wrapperTransform: getComputedStyle(wrapper).transform,
  });
});