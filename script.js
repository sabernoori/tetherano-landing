// Mobile Menu Functionality
document.addEventListener('DOMContentLoaded', function() {
  const hamburgerButton = document.querySelector('.nav_button.is-hamburger');
  const mobileMenu = document.querySelector('.mob-menu');
  const overlay = document.querySelector('.overlay');
  const menuWrapper = document.querySelector('.mob-menu_wrapper');
  const closeButton = document.querySelector('.mob-menu_close-btn');
  const menuLinks = document.querySelectorAll('.mob-menu_link-item');

  // Function to open mobile menu
  function openMobileMenu() {
    mobileMenu.classList.add('active');
    hamburgerButton.classList.add('active');
    
    // Trigger reflow to ensure the display change is applied
    mobileMenu.offsetHeight;
    
    // Animate overlay opacity and menu position
    setTimeout(() => {
      overlay.classList.add('active');
      menuWrapper.classList.add('active');
    }, 10);
    
    // Prevent body scroll when menu is open
    document.body.style.overflow = 'hidden';
  }

  // Function to close mobile menu
  function closeMobileMenu() {
    // Reverse the animations
    overlay.classList.remove('active');
    menuWrapper.classList.remove('active');
    hamburgerButton.classList.remove('active');
    
    // Remove active class after animation completes
    setTimeout(() => {
      mobileMenu.classList.remove('active');
      document.body.style.overflow = '';
    }, 300);
  }

  // Event listeners
  if (hamburgerButton) {
    hamburgerButton.addEventListener('click', openMobileMenu);
  }

  if (closeButton) {
    closeButton.addEventListener('click', closeMobileMenu);
  }

  if (overlay) {
    overlay.addEventListener('click', closeMobileMenu);
  }

  // Close menu when clicking on menu links
  menuLinks.forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  // Close menu on window resize if it goes above 992px
  window.addEventListener('resize', function() {
    if (window.innerWidth > 991 && mobileMenu.classList.contains('active')) {
      closeMobileMenu();
    }
  });

  // Close menu on escape key press
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && mobileMenu.classList.contains('active')) {
      closeMobileMenu();
    }
  });
});

console.log("Mobile menu functionality loaded!");