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
  const interval = 5000;

  function goTo(i){
    index = (i + slides.length) % slides.length;
    const offset = -index * 100;
    track.style.transform = `translateX(${offset}%)`;
    slides.forEach((s,si)=> s.setAttribute('aria-hidden', si!==index ? 'true' : 'false'));
    indicators.forEach((btn,bi)=> btn.setAttribute('aria-selected', bi===index ? 'true' : 'false'));
  }

  function nextSlide(){ goTo(index+1); }
  function prevSlide(){ goTo(index-1); }

  next.addEventListener('click', ()=>{ nextSlide(); resetTimer(); });
  prev.addEventListener('click', ()=>{ prevSlide(); resetTimer(); });

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
