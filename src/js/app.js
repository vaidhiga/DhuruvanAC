document.addEventListener('DOMContentLoaded', () => {
  const config = window.getBusinessInfo ? window.getBusinessInfo() : {};

  document.querySelectorAll('[data-business-name]').forEach((el) => {
    el.textContent = config.businessName || 'BUSINESS_NAME';
  });

  document.querySelectorAll('[data-phone]').forEach((el) => {
    el.textContent = config.phoneNumber || 'PHONE_NUMBER';
    el.href = `tel:${String(config.phoneNumber || '').replace(/\D/g, '')}`;
  });

  document.querySelectorAll('[data-whatsapp]').forEach((el) => {
    const number = String(config.whatsappNumber || '').replace(/\D/g, '');
    el.href = number ? `https://wa.me/${number}` : '#';
  });

  document.querySelectorAll('[data-address]').forEach((el) => {
    el.textContent = config.address || 'YOUR_ADDRESS';
  });

  document.querySelectorAll('[data-hours]').forEach((el) => {
    el.textContent = config.openingHours || 'Mon-Sat: 9:00 AM - 8:00 PM';
  });

  document.querySelectorAll('[data-map-link]').forEach((el) => {
    el.href = config.mapsUrl || 'https://maps.google.com';
  });

  document.querySelectorAll('[data-email]').forEach((el) => {
    el.href = `mailto:${config.email || 'hello@example.com'}`;
    el.textContent = config.email || 'hello@example.com';
  });

  const navMenu = document.querySelector('.nav-menu');
  const navbar = document.querySelector('.navbar');

  if (navMenu && navbar && !document.querySelector('.menu-toggle')) {
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'menu-toggle';
    toggle.setAttribute('aria-label', 'Toggle menu');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.textContent = '☰';
    navbar.insertBefore(toggle, navbar.firstChild);

    toggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      toggle.textContent = isOpen ? '✕' : '☰';
    });

    navMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.textContent = '☰';
      });
    });
  }

  const menuToggle = document.querySelector('.menu-toggle');
  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('is-open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
      menuToggle.textContent = isOpen ? '✕' : '☰';
    });

    navMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('is-open');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.textContent = '☰';
      });
    });
  }
});
