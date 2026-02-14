document.addEventListener('DOMContentLoaded', () => {
  const hamburgerBtn = document.querySelector('.nav_button.is-hamburger');
  const mobMenu = document.querySelector('.mob-menu');
  const overlay = mobMenu ? mobMenu.querySelector('.overlay') : null;
  const wrapper = mobMenu ? mobMenu.querySelector('.mob-menu_wrapper') : null;

  if (!hamburgerBtn || !mobMenu || !overlay || !wrapper) {
    // Elements not found; abort wiring.
    return;
  }

  const isMobile = () => window.matchMedia('(max-width: 991px)').matches;
  let isAnimating = false;

  function openMenu() {
    if (!isMobile() || isAnimating || mobMenu.classList.contains('is-open')) return;
    isAnimating = true;
    mobMenu.classList.remove('is-closing');
    mobMenu.classList.add('is-open');
    // When slide-in finishes, clear animating flag
    wrapper.addEventListener('animationend', () => {
      isAnimating = false;
    }, { once: true });
  }

  function closeMenu() {
    if (isAnimating || !mobMenu.classList.contains('is-open')) return;
    isAnimating = true;
    mobMenu.classList.remove('is-open');
    mobMenu.classList.add('is-closing');
    // After slide-out completes, hide container
    wrapper.addEventListener('animationend', () => {
      mobMenu.classList.remove('is-closing');
      isAnimating = false;
    }, { once: true });
  }

  // Open on hamburger click (only mobile widths)
  hamburgerBtn.addEventListener('click', openMenu);

  // Overlay acts as close button
  overlay.addEventListener('click', closeMenu);

  // If the viewport grows beyond mobile while menu is open, close it
  window.addEventListener('resize', () => {
    if (!isMobile() && mobMenu.classList.contains('is-open')) {
      closeMenu();
    }
  });
});