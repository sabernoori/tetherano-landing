// handling menu on mobile 

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

  // Close menu when any link inside the mobile menu is clicked
  // Bind directly to existing anchors, and also add a delegation fallback
  const menuAnchors = wrapper.querySelectorAll('a');
  if (menuAnchors.length) {
    menuAnchors.forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        log('Link clicked inside menu', { href: anchor.getAttribute('href') });
        // Do not block navigation; just trigger close behavior
        closeMenu(e);
      });
    });
    log('Bound click → menu anchors', menuAnchors.length);
  }
  // Delegation fallback for dynamically injected links
  wrapper.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;
    // Avoid double-calling if a direct handler already ran
    // (Heuristic: if "menuAnchors" includes this element, skip)
    try {
      if ([...menuAnchors].includes(link)) return;
    } catch (_) {}
    log('Delegated link click inside menu', { href: link.getAttribute('href') });
    closeMenu(e);
  });

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

// end of handling menu on mobile 

// start faq handling
// FAQ accordion animations: open/close the answer and rotate the icon
document.addEventListener('DOMContentLoaded', () => {
  const faqItems = Array.from(document.querySelectorAll('.faq_list .faq_item'));

  const measureAndOpen = (item, answer) => {
    // Set explicit max-height to allow smooth transition
    const h = answer.scrollHeight;
    answer.style.maxHeight = h + 'px';
    item.classList.add('is-open');
  };

  const closeItem = (item, answer) => {
    answer.style.maxHeight = '0px';
    item.classList.remove('is-open');
  };

  faqItems.forEach((item) => {
    const answer = item.querySelector('.pargraph[role="definition"]');
    if (!answer) return;

    // Initialize collapsed state
    closeItem(item, answer);

    // Toggle on click anywhere on the item
    item.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');
      if (isOpen) {
        closeItem(item, answer);
      } else {
        // Optional accordion behavior: close other open items
        faqItems.forEach((other) => {
          if (other !== item && other.classList.contains('is-open')) {
            const otherAns = other.querySelector('.pargraph[role="definition"]');
            if (otherAns) {
              otherAns.style.maxHeight = '0px';
            }
            other.classList.remove('is-open');
          }
        });
        measureAndOpen(item, answer);
      }
    });
  });

  // Keep open items height responsive (e.g., on viewport changes)
  window.addEventListener('resize', () => {
    document.querySelectorAll('.faq_item.is-open .pargraph[role="definition"]').forEach((ans) => {
      ans.style.maxHeight = ans.scrollHeight + 'px';
    });
  });
});

// ========================
// start swap form handling
// ========================
document.addEventListener('DOMContentLoaded', () => {
  const RATE = 165000; // 1 tether = 165,000 tomans

  const form = document.getElementById('swap-form');
  if (!form) return;

  const payInput = document.getElementById('pay');
  const getInput = document.getElementById('get');
  const swapBtn = form.querySelector('.swap_button');

  const firstCurrencyText = form.querySelector('.form_input-holder.is-first .form_currency .dropdown_toggle-text');
  const firstCurrencyImg = form.querySelector('.form_input-holder.is-first .form_currency img');
  const secondCurrencyText = form.querySelector('.form_input-holder.is-second .form_currency .dropdown_toggle-text');
  const secondCurrencyImg = form.querySelector('.form_input-holder.is-second .form_currency img');

  if (!payInput || !getInput) return;

  let payCurrency = (firstCurrencyText && firstCurrencyText.textContent.trim()) || 'تتر'; // default to tether
  let getCurrency = (secondCurrencyText && secondCurrencyText.textContent.trim()) || 'تومان';
  let isUpdating = false;

  function updatePlaceholders() {
    const equivalent = (165000).toLocaleString('en-US');
    if (payCurrency === 'تتر') {
      payInput.placeholder = '1';
      getInput.placeholder = equivalent;
    } else {
      payInput.placeholder = equivalent;
      getInput.placeholder = '1';
    }
  }

  function parseNumericString(str) {
    if (typeof str !== 'string') str = String(str || '');
    return Number(str.replace(/,/g, '').trim());
  }

  function formatTether(val) {
    const num = Number(val);
    if (!Number.isFinite(num)) return '';
    return num.toLocaleString('en-US', { useGrouping: true, maximumFractionDigits: 6 });
  }

  function formatToman(val) {
    const num = Number(val);
    if (!Number.isFinite(num)) return '';
    return Math.round(num).toLocaleString('en-US');
  }

  function recomputeFromPay() {
    if (isUpdating) return;
    isUpdating = true;
    const raw = payInput.value;
    const payVal = raw.trim() === '' ? 1 : parseNumericString(raw);
    if (Number.isFinite(payVal)) {
      // Always format the pay input according to its currency
      if (payCurrency === 'تتر') {
        payInput.value = formatTether(payVal);
        getInput.value = formatToman(payVal * RATE);
      } else {
        payInput.value = formatToman(payVal);
        // pay in toman -> get in tether
        getInput.value = formatTether(payVal / RATE);
      }
    } else {
      getInput.value = '';
    }
    isUpdating = false;
  }

  function recomputeFromGet() {
    if (isUpdating) return;
    isUpdating = true;
    const raw = getInput.value;
    const getVal = raw.trim() === '' ? 1 : parseNumericString(raw);
    if (Number.isFinite(getVal)) {
      // Always format the get input according to its currency
      if (getCurrency === 'تومان') {
        getInput.value = formatToman(getVal);
        // get is toman -> pay is tether
        payInput.value = formatTether(getVal / RATE);
      } else {
        getInput.value = formatTether(getVal);
        // get is tether -> pay is toman
        payInput.value = formatToman(getVal * RATE);
      }
    } else {
      payInput.value = '';
    }
    isUpdating = false;
  }

  payInput.addEventListener('input', recomputeFromPay);
  getInput.addEventListener('input', recomputeFromGet);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
  });

  function setCurrencies(payCur, getCur) {
    payCurrency = payCur;
    getCurrency = getCur;
    if (firstCurrencyText) firstCurrencyText.textContent = payCur;
    if (secondCurrencyText) secondCurrencyText.textContent = getCur;
    if (firstCurrencyImg && secondCurrencyImg) {
      if (payCur === 'تتر') {
        firstCurrencyImg.src = 'images/tether.avif';
        firstCurrencyImg.alt = 'Tether Logo';
        secondCurrencyImg.src = 'images/toman.avif';
        secondCurrencyImg.alt = 'Iraninan Toman';
      } else {
        firstCurrencyImg.src = 'images/toman.avif';
        firstCurrencyImg.alt = 'Iraninan Toman';
        secondCurrencyImg.src = 'images/tether.avif';
        secondCurrencyImg.alt = 'Tether Logo';
      }
    }
    updatePlaceholders();
  }

  if (swapBtn) {
    swapBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const newPay = payCurrency === 'تتر' ? 'تومان' : 'تتر';
      const newGet = getCurrency === 'تومان' ? 'تتر' : 'تومان';
      setCurrencies(newPay, newGet);
      // Ensure a default 1 is present if empty
      if (!payInput.value || payInput.value.trim() === '') {
        payInput.value = newPay === 'تتر' ? formatTether(1) : formatToman(1);
      }
      // Recompute based on whichever field currently has focus/value
      if (document.activeElement === payInput) {
        recomputeFromPay();
      } else if (document.activeElement === getInput) {
        recomputeFromGet();
      } else {
        // default to recompute from pay
        recomputeFromPay();
      }
    });
  }

  // initial compute and default value
  updatePlaceholders();
  if (!payInput.value || payInput.value.trim() === '') {
    payInput.value = payCurrency === 'تتر' ? formatTether(1) : formatToman(1);
  }
  recomputeFromPay();
});