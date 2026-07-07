(() => {
  const GA4_ID = "G-2TWMWCBW59";
  const ADS_ID = "AW-972379565";

  if (window.__tmcAnalyticsInitialized) {
    return;
  }
  window.__tmcAnalyticsInitialized = true;

  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== "function") {
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };
    window.gtag("js", new Date());
  }

  const hasGtagScript = !!document.querySelector('script[src*="googletagmanager.com/gtag/js"]');
  if (!hasGtagScript) {
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
    document.head.appendChild(script);
  }

  window.gtag("config", GA4_ID);
  window.gtag("config", ADS_ID);
})();

document.addEventListener("DOMContentLoaded", async () => {
  const mobileNavQuery = window.matchMedia("(max-width: 960px)");

  const DEFAULT_NAV_RUNTIME = {
    phone: {
      number: "+506 87699448",
      href: "tel:+50687699448"
    },
    socialLinks: {
      instagram: "https://www.instagram.com/",
      tiktok: "https://www.tiktok.com/",
      facebook: "https://www.facebook.com/"
    }
  };

  const NAV_CONFIG = {
    logo: {
      webp: "/assets/logo-relax-massage-san-jose.webp",
      png: "/assets/logo-relax-massage-san-jose.png"
    },
    flags: {
      ES: '<svg viewBox="0 0 24 16" aria-hidden="true" focusable="false"><rect width="24" height="16" fill="#c60b1e"/><rect y="4" width="24" height="8" fill="#ffc400"/></svg>',
      EN: '<svg viewBox="0 0 24 16" aria-hidden="true" focusable="false"><rect width="24" height="16" fill="#012169"/><path d="M0 0 24 16M24 0 0 16" stroke="#fff" stroke-width="3"/><path d="M0 0 24 16M24 0 0 16" stroke="#c8102e" stroke-width="1.6"/><path d="M12 0v16M0 8h24" stroke="#fff" stroke-width="5"/><path d="M12 0v16M0 8h24" stroke="#c8102e" stroke-width="2.6"/></svg>'
    },
    social: [
      {
        key: "instagram",
        name: "Instagram",
        href: DEFAULT_NAV_RUNTIME.socialLinks.instagram,
        icon: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5a4.25 4.25 0 0 0 4.25-4.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5Zm8.9 1.9a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z"/></svg>'
      },
      {
        key: "tiktok",
        name: "TikTok",
        href: DEFAULT_NAV_RUNTIME.socialLinks.tiktok,
        icon: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M14.6 3h2.2c.2 1.9 1.3 3.4 3.1 3.8v2.3c-1.1 0-2.1-.3-3-.9v6.1a5.5 5.5 0 1 1-4.8-5.4v2.4a3.1 3.1 0 1 0 2.5 3V3Z"/></svg>'
      },
      {
        key: "facebook",
        name: "Facebook",
        href: DEFAULT_NAV_RUNTIME.socialLinks.facebook,
        icon: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M13.5 22v-8h2.7l.4-3h-3.1V9.1c0-.9.3-1.6 1.6-1.6h1.7V4.8c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 4V11H8v3h2.7v8h2.8Z"/></svg>'
      }
    ],
    locale: {
      en: {
        navLabel: "Primary",
        homeHref: "/tantra-massage-costa-rica",
        switchHref: "/es/",
        switchCode: "ES",
        footer: {
          brand: "Tantra Massage Costa Rica",
          tagline: "Expert wellness sessions for international clients.",
          rights: "All rights reserved."
        },
        links: [
          { key: "home", text: "Home", href: "/tantra-massage-costa-rica" },
          { key: "masseuses", text: "Masseuses", href: "/masseuses/" },
          { key: "services", text: "Services", href: "/services" },
          { key: "blog", text: "Blog", href: "/blog" }
        ]
      },
      es: {
        navLabel: "Principal",
        homeHref: "/es/",
        switchHref: "/tantra-massage-costa-rica/",
        switchCode: "EN",
        footer: {
          brand: "Masaje Tantra Costa Rica",
          tagline: "Sesiones de bienestar profesional para clientes internacionales.",
          rights: "Todos los derechos reservados."
        },
        links: [
          { key: "home", text: "Inicio", href: "/es/" },
          { key: "masseuses", text: "Masajistas", href: "/es/masajistas/" },
          { key: "services", text: "Servicios", href: "/es/servicios/" },
          { key: "blog", text: "Blog", href: "/es/blog/" }
        ]
      }
    }
  };

  async function loadNavRuntimeConfig() {
    try {
      const response = await fetch("/assets/nav-config.json", { cache: "no-store" });
      if (!response.ok) {
        return DEFAULT_NAV_RUNTIME;
      }

      const payload = await response.json();
      const phone = payload && typeof payload.phone === "object" ? payload.phone : {};
      const socialItems = Array.isArray(payload && payload.social) ? payload.social : [];

      const runtime = {
        phone: {
          number: typeof phone.number === "string" && phone.number.trim() ? phone.number.trim() : DEFAULT_NAV_RUNTIME.phone.number,
          href: typeof phone.href === "string" && phone.href.trim() ? phone.href.trim() : DEFAULT_NAV_RUNTIME.phone.href
        },
        socialLinks: { ...DEFAULT_NAV_RUNTIME.socialLinks }
      };

      socialItems.forEach((item) => {
        if (!item || typeof item.name !== "string" || typeof item.href !== "string") {
          return;
        }
        const key = item.name.trim().toLowerCase();
        if (key.includes("instagram")) runtime.socialLinks.instagram = item.href.trim();
        if (key.includes("tiktok")) runtime.socialLinks.tiktok = item.href.trim();
        if (key.includes("facebook")) runtime.socialLinks.facebook = item.href.trim();
      });

      return runtime;
    } catch (error) {
      return DEFAULT_NAV_RUNTIME;
    }
  }

  const runtimeConfig = await loadNavRuntimeConfig();
  NAV_CONFIG.phone = runtimeConfig.phone;
  NAV_CONFIG.social.forEach((item) => {
    if (item.key === "instagram") item.href = runtimeConfig.socialLinks.instagram;
    if (item.key === "tiktok") item.href = runtimeConfig.socialLinks.tiktok;
    if (item.key === "facebook") item.href = runtimeConfig.socialLinks.facebook;
  });

  function detectLocale(pathname) {
    return pathname.startsWith("/es/") || pathname === "/es" ? "es" : "en";
  }

  function detectActiveSection(pathname, localeCode) {
    const clean = pathname.toLowerCase();
    if (localeCode === "es") {
      if (clean === "/es" || clean === "/es/") return "home";
      if (clean.startsWith("/es/masajistas")) return "masseuses";
      if (clean.startsWith("/es/servicios")) return "services";
      if (clean.startsWith("/es/blog")) return "blog";
      return "home";
    }

    if (clean === "/tantra-massage-costa-rica" || clean === "/tantra-massage-costa-rica/") return "home";
    if (clean.startsWith("/masseuses")) return "masseuses";
    if (clean.startsWith("/services")) return "services";
    if (clean.startsWith("/blog")) return "blog";
    return "home";
  }

  function buildSocialMarkup(className = "social-link") {
    return NAV_CONFIG.social
      .map(
        (item) =>
          `<a class="${className}" href="${item.href}" target="_blank" rel="noopener noreferrer" aria-label="${item.name}">${item.icon}</a>`
      )
      .join("");
  }

  function buildNavLinksMarkup(localeCfg, activeKey) {
    const linksMarkup = localeCfg.links
      .map((item) => {
        const activeClass = item.key === activeKey ? " class=\"active\"" : "";
        return `<a${activeClass} href="${item.href}">${item.text}</a>`;
      })
      .join("");

    const switchCode = localeCfg.switchCode;
    const switchFlag = NAV_CONFIG.flags[switchCode] || "";
    const switchMarkup = `<a class="nav-lang nav-lang-${switchCode.toLowerCase()}" href="${localeCfg.switchHref}"><span class="lang-flag">${switchFlag}</span><span class="lang-code">${switchCode}</span></a>`;

    return `${linksMarkup}${switchMarkup}`;
  }

  function renderHeader(headerEl, index) {
    const localeCode = detectLocale(window.location.pathname);
    const localeCfg = NAV_CONFIG.locale[localeCode];
    const activeKey = detectActiveSection(window.location.pathname, localeCode);
    const navId = `primary-nav-${index + 1}`;

    headerEl.setAttribute("data-site-header", "true");
    headerEl.innerHTML = `
      <div class="container nav">
        <a class="brand brand-logo" href="${localeCfg.homeHref}">
          <picture class="brand-logo-picture">
            <source type="image/webp" srcset="${NAV_CONFIG.logo.webp}" />
            <img src="${NAV_CONFIG.logo.png}" alt="Tantric Therapeutic Massage San Jose logo" />
          </picture>
        </a>
        <div class="nav-social">
          <a class="nav-phone" href="${NAV_CONFIG.phone.href}" aria-label="Call ${NAV_CONFIG.phone.number}" title="${NAV_CONFIG.phone.number}" data-tooltip="${NAV_CONFIG.phone.number}">
            <span class="phone-icon" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 11.2 19a19.5 19.5 0 0 1-6.1-6.1A19.79 19.79 0 0 1 2.08 4.18 2 2 0 0 1 4.06 2h3a2 2 0 0 1 2 1.72c.12.81.35 1.6.68 2.34a2 2 0 0 1-.45 2.11L8 9.46a16 16 0 0 0 6.54 6.54l1.29-1.29a2 2 0 0 1 2.11-.45c.74.33 1.53.56 2.34.68a2 2 0 0 1 1.72 1.98Z"/></svg></span>
          </a>
          ${buildSocialMarkup()}
        </div>
        <button type="button" class="menu-toggle" aria-label="Toggle navigation menu" aria-expanded="false" aria-controls="${navId}"><span></span><span></span><span></span></button>
        <nav class="nav-links" id="${navId}" aria-label="${localeCfg.navLabel}">
          ${buildNavLinksMarkup(localeCfg, activeKey)}
        </nav>
      </div>
    `;
  }

  function setupMenuToggle(nav) {
    const toggle = nav.querySelector(".menu-toggle");
    const navLinks = nav.querySelector(".nav-links");
    if (!toggle || !navLinks) {
      return;
    }

    const closeMenu = () => {
      nav.classList.remove("nav-open");
      toggle.setAttribute("aria-expanded", "false");
    };

    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    navLinks.addEventListener("click", (event) => {
      if (!mobileNavQuery.matches) {
        return;
      }
      if (event.target instanceof Element && event.target.closest("a")) {
        closeMenu();
      }
    });

    const onViewportChange = (event) => {
      if (!event.matches) {
        closeMenu();
      }
    };

    if (typeof mobileNavQuery.addEventListener === "function") {
      mobileNavQuery.addEventListener("change", onViewportChange);
    } else if (typeof mobileNavQuery.addListener === "function") {
      mobileNavQuery.addListener(onViewportChange);
    }
  }

  function renderFooter(footerEl) {
    const localeCode = detectLocale(window.location.pathname);
    const localeCfg = NAV_CONFIG.locale[localeCode];
    const footerCfg = localeCfg.footer;
    const currentYear = new Date().getFullYear();

    footerEl.setAttribute("data-site-footer", "true");
    footerEl.innerHTML = `
      <div class="container site-footer-wrap">
        <p class="site-footer-brand"><strong>${footerCfg.brand}</strong></p>
        <p class="site-footer-copy">${footerCfg.tagline}</p>
        <div class="site-footer-social" aria-label="Social links">
          ${buildSocialMarkup("site-footer-social-link")}
        </div>
        <p class="site-footer-rights">&copy; ${currentYear} ${footerCfg.brand}. ${footerCfg.rights}</p>
      </div>
    `;
  }

  document.querySelectorAll("header[data-site-header]").forEach((headerEl, index) => {
    renderHeader(headerEl, index);
  });

  document.querySelectorAll("footer[data-site-footer]").forEach((footerEl) => {
    renderFooter(footerEl);
  });

  document.querySelectorAll(".nav").forEach((nav) => {
    setupMenuToggle(nav);
  });
});

/* Promo carousel behavior */
(function(){
  const carousel = document.getElementById('promo-carousel');
  if(!carousel) return;

  const track = carousel.querySelector('.carousel-track');
  const slides = Array.from(carousel.querySelectorAll('.carousel-slide'));
  const prev = carousel.querySelector('.carousel-prev');
  const next = carousel.querySelector('.carousel-next');
  const indicators = Array.from(carousel.querySelectorAll('.carousel-indicators button'));
  let index = 0;
  let timer = null;
  const interval = 9000;

  function goTo(i){
    index = (i + slides.length) % slides.length;
    const offset = -index * 100;
    track.style.transform = `translateX(${offset}%)`;
    slides.forEach((s,si)=> s.setAttribute('aria-hidden', si!==index ? 'true' : 'false'));
    indicators.forEach((btn,bi)=> btn.setAttribute('aria-selected', bi===index ? 'true' : 'false'));
  }

  function nextSlide(){ goTo(index+1); }
  function prevSlide(){ goTo(index-1); }

  if (next) {
    next.addEventListener('click', ()=>{ nextSlide(); resetTimer(); });
  }
  if (prev) {
    prev.addEventListener('click', ()=>{ prevSlide(); resetTimer(); });
  }

  indicators.forEach((btn,i)=> btn.addEventListener('click', ()=>{ goTo(i); resetTimer(); }));

  function startTimer(){ timer = setInterval(nextSlide, interval); }
  function stopTimer(){ if(timer){ clearInterval(timer); timer = null; } }
  function resetTimer(){ stopTimer(); startTimer(); }

  carousel.addEventListener('mouseenter', stopTimer);
  carousel.addEventListener('focusin', stopTimer);
  carousel.addEventListener('mouseleave', startTimer);
  carousel.addEventListener('focusout', startTimer);

  // initialize (start with the first slide)
  goTo(index);
  startTimer();
})();


/* Play/pause videos only when visible (used on profile cards) */
(function(){
  if(!('IntersectionObserver' in window)) return;
  const opts = { root: null, rootMargin: '0px', threshold: 0.5 };
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      const v = entry.target;
      if(entry.isIntersecting){
        if(v.paused) v.play().catch(()=>{});
      } else {
        if(!v.paused) v.pause();
      }
    });
  }, opts);

  document.addEventListener('DOMContentLoaded', ()=>{
    document.querySelectorAll('video[data-observe="true"]').forEach(v=>{
      // Ensure muted for autoplay policies
      v.muted = true;
      v.playsInline = true;
      io.observe(v);
    });
  });
})();
