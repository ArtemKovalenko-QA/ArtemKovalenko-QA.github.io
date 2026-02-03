// ========================================
// ГЛАВНАЯ ФУНКЦИЯ ИНИЦИАЛИЗАЦИИ
// ========================================

(function () {
  'use strict';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    const navbar = document.querySelector('.navbar');
    const navbarToggle = document.getElementById('navbarToggle');
    const navbarMenu = document.getElementById('navbarMenu');
    const scrollToTopBtn = document.getElementById('scrollToTop');
    const contactLinks = document.querySelector('.contact-links');

    if (!navbar || !navbarToggle || !navbarMenu || !scrollToTopBtn) {
      console.warn('⚠️ Ключевые элементы не найдены. Проверьте HTML.');
      return;
    }

    const navbarLinks = document.querySelectorAll('.navbar-link');

    // ========================================
    // Мобильное меню
    // ========================================

    navbarToggle.addEventListener('click', () => {
      navbarMenu.classList.toggle('active');
      const isMenuOpen = navbarMenu.classList.contains('active');
      navbarToggle.innerHTML = isMenuOpen 
        ? '<i class="fas fa-times"></i>' 
        : '<i class="fas fa-bars"></i>';
    });

    navbarLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (navbarMenu.classList.contains('active')) {
          navbarMenu.classList.remove('active');
          navbarToggle.innerHTML = '<i class="fas fa-bars"></i>';
        }
      });
    });

    // ========================================
    // Прокрутка
    // ========================================

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll(navbar, scrollToTopBtn, navbarLinks);
          ticking = false;
        });
        ticking = true;
      }
    });

    function handleScroll(navbar, scrollToTopBtn, links) {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
      scrollToTopBtn.classList.toggle('show', window.scrollY > 300);

      const sections = document.querySelectorAll('.section');
      const scrollPos = window.scrollY + 100;

      sections.forEach(section => {
        const id = section.getAttribute('id');
        if (scrollPos >= section.offsetTop && scrollPos < section.offsetTop + section.offsetHeight) {
          links.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
          });
        }
      });
    }

    // ========================================
    // Плавная прокрутка
    // ========================================

    navbarLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        if (targetSection) {
          const offset = targetSection.offsetTop - 80;
          window.scrollTo({ top: offset, behavior: 'smooth' });
        }
      });
    });

    scrollToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // ========================================
    // Копирование телефона
    // ========================================

    if (contactLinks) {
      contactLinks.addEventListener('click', async (e) => {
        const item = e.target.closest('.contact-item.copyable');
        if (!item) return;

        e.preventDefault();
        const phone = item.dataset.value;
        if (!phone) return;

        try {
          await navigator.clipboard.writeText(phone);
          showNotification('Номер телефона скопирован!');
        } catch (err) {
          fallbackCopyTextToClipboard(phone);
          showNotification('Номер скопирован!');
        }
      });
    }

    function fallbackCopyTextToClipboard(text) {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      textArea.style.top = '-9999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
      } catch (err) {
        console.error('Не удалось скопировать:', err);
      }
      document.body.removeChild(textArea);
    }

    // ========================================
    // Уведомления
    // ========================================

    function showNotification(message, isError = false) {
      const existing = document.querySelector('.copy-notification');
      if (existing) existing.remove();

      const notification = document.createElement('div');
      notification.className = 'copy-notification';
      notification.textContent = message;
      notification.dataset.type = isError ? 'error' : 'success';
      
      document.body.appendChild(notification);
      notification.classList.add('show');

      setTimeout(() => {
        notification.classList.remove('show');
        notification.addEventListener('transitionend', () => notification.remove(), { once: true });
      }, 2500);
    }

    // ========================================
    // Анимация при прокрутке
    // ========================================

    const animateOnScroll = () => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }
        });
      }, { threshold: 0.1 });

      document.querySelectorAll('.card, .experience-item, .section > h2, .section > p').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
      });
    };

    setTimeout(animateOnScroll, 100);

    // ========================================
    // Подсказки на тач-устройствах
    // ========================================
    
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      document.querySelectorAll('.contact-item-wrapper').forEach(wrapper => {
        let touchTimer = null;

        wrapper.addEventListener('touchstart', (e) => {
          if (wrapper.querySelector('.copyable')) e.preventDefault();
          
          touchTimer = setTimeout(() => {
            const tooltip = wrapper.querySelector('.tooltip');
            if (tooltip) {
              tooltip.style.opacity = '1';
              tooltip.style.visibility = 'visible';
              tooltip.style.transform = 'translateX(-50%) translateY(0)';
            }
          }, 300);
        });

        const clearTouchTimer = () => {
          if (touchTimer) clearTimeout(touchTimer);
          touchTimer = null;
        };

        wrapper.addEventListener('touchend', clearTouchTimer);
        wrapper.addEventListener('touchmove', clearTouchTimer);
        wrapper.addEventListener('touchcancel', clearTouchTimer);
      });
    }
  }
})();