/* =========================================================
   NestControl — laadt header.html en footer.html in elke
   pagina en zorgt dat ze zich overal identiek gedragen.
   ========================================================= */
(function () {

  function isHomePage() {
    const path = window.location.pathname;
    return path.endsWith('/index.html') || path.endsWith('/') || path === '';
  }

  function rewriteHashLinks(root) {
    if (isHomePage()) return;
    root.querySelectorAll('a[href^="#"]').forEach(a => {
      const href = a.getAttribute('href');
      if (href === '#') {
        a.setAttribute('href', 'index.html');
        a.classList.remove('scroll-to-top');
      } else {
        a.setAttribute('href', 'index.html' + href);
      }
    });
  }

  function loadPartial(placeholderId, url) {
    return fetch(url)
      .then(r => r.text())
      .then(html => {
        const el = document.getElementById(placeholderId);
        if (!el) return null;
        el.outerHTML = html;
        return true;
      })
      .catch(err => {
        console.error('Kon ' + url + ' niet laden:', err);
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
        document.documentElement.style.setProperty('--header-h', siteHeader.offsetHeight + 'px');
      };
      setHeaderHeight();
      window.addEventListener('resize', setHeaderHeight);
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(setHeaderHeight);
      }

      const toggleHeaderBg = () => {
        siteHeader.classList.toggle('scrolled', window.scrollY > 40);
      };
      toggleHeaderBg();
      window.addEventListener('scroll', toggleHeaderBg, { passive: true });
    }

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
      navLinks.querySelectorAll('a:not([href^="#"])').forEach(link => {
        link.addEventListener('click', () => {
          burger.classList.remove('active');
          navLinks.classList.remove('active');
          document.body.classList.remove('menu-open');
        });
      });
    }

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');

        if (targetId === '#' || this.classList.contains('scroll-to-top')) {
          e.preventDefault();
          const closeMenuAndScrollTop = () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            history.replaceState(null, null, window.location.pathname);
          };
          if (document.body.classList.contains('menu-open')) {
            if (burger) burger.classList.remove('active');
            if (navLinks) navLinks.classList.remove('active');
            document.body.classList.remove('menu-open');
            setTimeout(closeMenuAndScrollTop, 150);
          } else {
            closeMenuAndScrollTop();
          }
          return;
        }

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          const doScroll = () => {
            targetElement.scrollIntoView({ behavior: 'smooth' });
            history.pushState(null, null, targetId);
          };
          if (document.body.classList.contains('menu-open')) {
            if (burger) burger.classList.remove('active');
            if (navLinks) navLinks.classList.remove('active');
            document.body.classList.remove('menu-open');
            setTimeout(doScroll, 150);
          } else {
            doScroll();
          }
        }
      });
    });

    document.dispatchEvent(new CustomEvent('nc:header-footer-ready'));
  }

  document.addEventListener('DOMContentLoaded', () => {
    Promise.all([
      loadPartial('site-header', 'header.html'),
      loadPartial('site-footer', 'footer.html')
    ]).then(() => {
      rewriteHashLinks(document);
      initSharedBehavior();
    });
  });

})();
