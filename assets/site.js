document.addEventListener("DOMContentLoaded", () => {
  const mediaQuery = window.matchMedia("(max-width: 960px)");

  document.querySelectorAll(".nav").forEach((nav, index) => {
    const navLinks = nav.querySelector(".nav-links");
    if (!navLinks) return;

    const navId = navLinks.id || `primary-nav-${index + 1}`;
    navLinks.id = navId;

    let toggle = nav.querySelector(".menu-toggle");
    if (!toggle) {
      toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = "menu-toggle";
      toggle.setAttribute("aria-label", "Toggle navigation menu");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-controls", navId);
      toggle.innerHTML = "<span></span><span></span><span></span>";
      nav.insertBefore(toggle, navLinks);
    }

    const closeMenu = () => {
      nav.classList.remove("nav-open");
      toggle.setAttribute("aria-expanded", "false");
    };

    const toggleMenu = () => {
      const isOpen = nav.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    };

    toggle.addEventListener("click", toggleMenu);

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        if (mediaQuery.matches) closeMenu();
      });
    });

    window.addEventListener("resize", () => {
      if (!mediaQuery.matches) closeMenu();
    });
  });
});
