document.addEventListener('DOMContentLoaded', function() {
  const hamburger = document.querySelector('.is-hamburger');
  const mobileMenu = document.querySelector('.mob-menu');
  const overlay = document.querySelector('.overlay');

  if (hamburger && mobileMenu && overlay) {
    hamburger.addEventListener('click', function() {
      mobileMenu.classList.add('is-open');
    });

    overlay.addEventListener('click', function() {
      mobileMenu.classList.remove('is-open');
    });
  }
});