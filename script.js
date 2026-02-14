document.addEventListener('DOMContentLoaded', () => {
  const log = (...args) => console.log('[MobileMenu]', ...args);

  const hamburgerBtn = document.querySelector('.nav_button.is-hamburger');
  const mobMenu = document.querySelector('.mob-menu');
  const overlay = mobMenu ? mobMenu.querySelector('.overlay') : null;
  const wrapper = mobMenu ? mobMenu.querySelector('.mob-menu_wrapper') : null;

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

  function openMenu(evt) {
    log('Hamburger clicked', { isMobile: isMobile(), isAnimating, isOpen: mobMenu.classList.contains('is-open') });
    if (!isMobile()) {
      log('Ignored: not under 992px');
      return;
    }
    if (isAnimating || mobMenu.classList.contains('is-open')) {
      log('Ignored: animation in progress or already open');
      return;
    }
    isAnimating = true;
    mobMenu.classList.remove('is-closing');
    mobMenu.classList.add('is-open');
    log('Menu state → is-open; display:', getComputedStyle(mobMenu).display);
    // When slide-in finishes, clear animating flag
    wrapper.addEventListener('animationend', (e) => {
      log('Wrapper animationend (open)', e.animationName);
      isAnimating = false;
    }, { once: true });
    wrapper.addEventListener('animationstart', (e) => {
      log('Wrapper animationstart (open)', e.animationName);
    }, { once: true });
  }

  function closeMenu(evt) {
    log('Overlay clicked', { isAnimating, isOpen: mobMenu.classList.contains('is-open') });
    if (isAnimating || !mobMenu.classList.contains('is-open')) {
      log('Ignored: animation in progress or already closed');
      return;
    }
    isAnimating = true;
    mobMenu.classList.remove('is-open');
    mobMenu.classList.add('is-closing');
    log('Menu state → is-closing; display:', getComputedStyle(mobMenu).display);
    // After slide-out completes, hide container
    wrapper.addEventListener('animationend', (e) => {
      log('Wrapper animationend (close)', e.animationName);
      mobMenu.classList.remove('is-closing');
      isAnimating = false;
      log('Menu state → closed; display should be none now:', getComputedStyle(mobMenu).display);
    }, { once: true });
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