(function () {

  function isHomePage() {
    const path = window.location.pathname;
    return path.endsWith('/index.html') ||
           path.endsWith('/NestControl/') ||
           path === '';
  }

  function rewriteHashLinks(root) {
    if (isHomePage()) return;

    root.querySelectorAll('a[href^="#"]').forEach(a => {
      const href = a.getAttribute('href');

      if (href === '#') {
        a.setAttribute('href', '/NestControl/index.html');
        a.classList.remove('scroll-to-top');
      } else {
        a.setAttribute('href', '/NestControl/index.html' + href);
      }
    });
  }

  function loadPartial(placeholderId, url) {
    return fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error(
            `HTTP ${response.status}: ${response.statusText}`
          );
        }

        return response.text();
      })
      .then(html => {
        const el = document.getElementById(placeholderId);

        if (!el) {
          console.error(
            `Placeholder #${placeholderId} niet gevonden.`
          );
          return null;
        }

        el.outerHTML = html;
        return true;
      })
      .catch(error => {
        console.error(
          `Kon ${url} niet laden:`,
          error
        );
        return null;
      });
  }

  function initSharedBehavior() {

    const siteHeader = document.querySelector('header');
    const burger = document.querySelector('.burger');
    const navLinks = document.querySelector('.nav-links');
    const closeBtn = document.querySelector('.mobile-menu-close');

    if (siteHeader) {

      const setHeaderHeight = () => {
        document.documentElement.style.setProperty(
          '--header-h',
          siteHeader.offsetHeight + 'px'
        );
      };

      setHeaderHeight();

      window.addEventListener(
        'resize',
        setHeaderHeight
      );

      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(setHeaderHeight);
      }

      const toggleHeaderBg = () => {
        siteHeader.classList.toggle(
          'scrolled',
          window.scrollY > 40
        );
      };

      toggleHeaderBg();

      window.addEventListener(
        'scroll',
        toggleHeaderBg,
        { passive: true }
      );
    }

    document
      .querySelectorAll('.nav-item-dropdown > .nav-link-trigger')
      .forEach(trigger => {

        trigger.addEventListener('click', (e) => {

          e.preventDefault();

          const parent = trigger.closest('.nav-item-dropdown');
          const wasOpen = parent.classList.contains('open');

          document
            .querySelectorAll('.nav-item-dropdown.open')
            .forEach(el => {
              if (el !== parent) el.classList.remove('open');
            });

          parent.classList.toggle('open', !wasOpen);

        });

      });

    if (burger && navLinks) {

      burger.addEventListener('click', () => {
        burger.classList.toggle('active');
        navLinks.classList.toggle('active');
        document.body.classList.toggle('menu-open');
      });

      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          burger.classList.remove('active');
          navLinks.classList.remove('active');
          document.body.classList.remove('menu-open');
        });
      }

      navLinks
        .querySelectorAll('a:not([href^="#"])')
        .forEach(link => {

          link.addEventListener('click', () => {
            burger.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.classList.remove('menu-open');
          });

        });
    }

    document
      .querySelectorAll('a[href^="#"]')
      .forEach(anchor => {

        anchor.addEventListener('click', function (e) {

          const targetId = this.getAttribute('href');

          if (
            targetId === '#' ||
            this.classList.contains('scroll-to-top')
          ) {

            e.preventDefault();

            const closeMenuAndScrollTop = () => {

              window.scrollTo({
                top: 0,
                behavior: 'smooth'
              });

              history.replaceState(
                null,
                null,
                window.location.pathname
              );
            };

            if (
              document.body.classList.contains('menu-open')
            ) {

              if (burger) {
                burger.classList.remove('active');
              }

              if (navLinks) {
                navLinks.classList.remove('active');
              }

              document.body.classList.remove('menu-open');

              setTimeout(
                closeMenuAndScrollTop,
                150
              );

            } else {

              closeMenuAndScrollTop();

            }

            return;
          }

          const targetElement =
            document.querySelector(targetId);

          if (targetElement) {

            e.preventDefault();

            const doScroll = () => {

              targetElement.scrollIntoView({
                behavior: 'smooth'
              });

              history.pushState(
                null,
                null,
                targetId
              );
            };

            if (
              document.body.classList.contains('menu-open')
            ) {

              if (burger) {
                burger.classList.remove('active');
              }

              if (navLinks) {
                navLinks.classList.remove('active');
              }

              document.body.classList.remove('menu-open');

              setTimeout(
                doScroll,
                150
              );

            } else {

              doScroll();

            }
          }

        });

      });

    document.dispatchEvent(
      new CustomEvent('nc:header-footer-ready')
    );
  }

  document.addEventListener(
    'DOMContentLoaded',
    () => {

      Promise.all([

        loadPartial(
          'site-header',
          '/NestControl/header.html'
        ),

        loadPartial(
          'site-footer',
          '/NestControl/footer.html'
        )

      ]).then(() => {

        rewriteHashLinks(document);
        initSharedBehavior();

      });

    }
  );

})();
