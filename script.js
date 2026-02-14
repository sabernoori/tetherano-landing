document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.querySelector('.nav_button.is-hamburger');
  const mobMenu = document.querySelector('.mob-menu');
  const overlay = document.querySelector('.overlay');

  if (hamburger && mobMenu && overlay) {
    hamburger.addEventListener('click', () => {
      mobMenu.classList.toggle('open');
    });

    overlay.addEventListener('click', () => {
      mobMenu.classList.remove('open');
    });
  }
});