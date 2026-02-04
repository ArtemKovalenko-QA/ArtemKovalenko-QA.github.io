(function () {
  'use strict';

  const init = () => {
    // Получаем элементы DOM
    const navbar = document.querySelector('.navbar');
    const toggle = document.getElementById('navbarToggle');
    const menu = document.getElementById('navbarMenu');
    const topBtn = document.getElementById('scrollToTop');
    const contacts = document.querySelector('.contact-links');
    const links = document.querySelectorAll('.navbar-link');

    // Проверка наличия критичных элементов
    if (!navbar || !toggle || !menu || !topBtn) return;

    // ==================== Мобильное меню ====================
    
    // Функция обновления иконки меню
    const updateMenuIcon = isOpen => toggle.innerHTML = isOpen 
      ? '<i class="fas fa-times"></i>' 
      : '<i class="fas fa-bars"></i>';

    // Переключение меню по клику на кнопку
    toggle.addEventListener('click', () => {
      menu.classList.toggle('active');
      updateMenuIcon(menu.classList.contains('active'));
    });

    // Закрытие меню при клике на ссылку
    links.forEach(link => {
      link.addEventListener('click', () => {
        if (menu.classList.contains('active')) {
          menu.classList.remove('active');
          updateMenuIcon(false);
        }
      });
    });

    // ==================== Обработка прокрутки ====================
    
    let ticking = false;
    
    // Функция обработки прокрутки страницы
    const handleScroll = () => {
      // Добавляем/убираем класс 'scrolled' при прокрутке
      navbar.classList.toggle('scrolled', window.scrollY > 50);
      // Показываем/скрываем кнопку "вверх"
      topBtn.classList.toggle('show', window.scrollY > 300);

      // Определяем текущую секцию для активной ссылки
      const scrollPos = window.scrollY + 100;
      document.querySelectorAll('.section').forEach(section => {
        const id = section.id;
        // Проверяем, находится ли секция в зоне видимости
        if (scrollPos >= section.offsetTop && scrollPos < section.offsetTop + section.offsetHeight) {
          // Активируем соответствующую ссылку в меню
          links.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
          });
        }
      });
    };

    // Оптимизированный обработчик прокрутки (с использованием requestAnimationFrame)
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    });

    // ==================== Плавная прокрутка ====================
    
    // Универсальная функция прокрутки к элементу
    const scrollTo = (element, offset = 0) => {
      window.scrollTo({ top: element.offsetTop - offset, behavior: 'smooth' });
    };

    // Прокрутка к секции при клике на ссылку меню
    links.forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute('href'));
        if (target) scrollTo(target, 80);
      });
    });

    // Прокрутка вверх при клике на кнопку
    topBtn.addEventListener('click', () => scrollTo(document.documentElement));

    // ==================== Копирование телефона ====================
    
    // Обработчик клика на контактные данные
    if (contacts) {
      contacts.addEventListener('click', async e => {
        const item = e.target.closest('.contact-item.copyable');
        if (!item || !item.dataset.value) return;

        e.preventDefault();
        try {
          // Копируем текст в буфер обмена
          await navigator.clipboard.writeText(item.dataset.value);
          showNotification('Скопировано!');
        } catch {
          // Резервный метод копирования для старых браузеров
          fallbackCopy(item.dataset.value);
        }
      });
    }

    // Резервный метод копирования через создание временного элемента
    const fallbackCopy = text => {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.cssText = 'position:fixed;left:-9999px;top:-9999px;';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    };

    // Показ уведомления о копировании
    const showNotification = msg => {
      // Удаляем предыдущее уведомление, если оно есть
      const existing = document.querySelector('.copy-notification');
      if (existing) existing.remove();

      // Создаем новое уведомление
      const notif = document.createElement('div');
      notif.className = 'copy-notification';
      notif.textContent = msg;
      document.body.appendChild(notif);
      
      // Показываем уведомление с задержкой
      setTimeout(() => notif.classList.add('show'), 10);
      // Скрываем и удаляем через 2.5 секунды
      setTimeout(() => {
        notif.classList.remove('show');
        notif.addEventListener('transitionend', () => notif.remove(), { once: true });
      }, 2500);
    };

    // ==================== Анимация при прокрутке ====================
    
    // Функция анимации элементов при появлении в зоне видимости
    const animateOnScroll = () => {
      // Создаем наблюдатель за видимостью элементов
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          // Если элемент виден, убираем эффекты
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }
        });
      }, { threshold: 0.1 });

      // Применяем анимацию к карточкам, секциям и другим элементам
      document.querySelectorAll('.card, .experience-item, .section > h2, .section > p, .skill-category')
        .forEach(el => {
          // Устанавливаем начальные стили (прозрачность и смещение)
          Object.assign(el.style, {
            opacity: '0',
            transform: 'translateY(20px)',
            transition: 'opacity 0.6s ease, transform 0.6s ease'
          });
          // Начинаем наблюдение за элементом
          observer.observe(el);
        });
    };

    // Запускаем анимацию с небольшой задержкой
    setTimeout(animateOnScroll, 100);

    // ==================== Подсказки на тач-устройствах ====================
    
    // Проверка на наличие тач-устройства
    if ('ontouchstart' in window || navigator.maxTouchPoints) {
      document.querySelectorAll('.contact-item-wrapper').forEach(wrapper => {
        let timer = null;

        // Показ подсказки при долгом тапе
        const showTooltip = () => {
          const tooltip = wrapper.querySelector('.tooltip');
          if (tooltip) {
            Object.assign(tooltip.style, {
              opacity: '1',
              visibility: 'visible',
              transform: 'translateX(-50%) translateY(0)'
            });
          }
        };

        // Скрытие подсказки
        const hideTooltip = () => {
          if (timer) clearTimeout(timer);
          timer = null;
        };

        // Обработчик долгого нажатия
        wrapper.addEventListener('touchstart', e => {
          if (wrapper.querySelector('.copyable')) e.preventDefault();
          timer = setTimeout(showTooltip, 300);
        });

        // Скрытие подсказки при завершении/отмене/сдвиге
        ['touchend', 'touchmove', 'touchcancel'].forEach(event => {
          wrapper.addEventListener(event, hideTooltip);
        });
      });
    }
  };

  // Запуск инициализации после загрузки страницы
  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();

})();