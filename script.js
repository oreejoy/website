document.addEventListener('DOMContentLoaded', () => {
  // Global Viewport Modal Overlay Map Selectors
  const modalOverlay = document.getElementById('galleryModal');
  const modalClose = document.getElementById('modalClose');
  const modalImg = document.getElementById('modalImg');
  const modalTitle = document.getElementById('modalTitle');
  const modalTag = document.getElementById('modalTag');
  const modalDesc = document.getElementById('modalDesc');

  const openModal = (title, tag, img, desc) => {
    modalTitle.textContent = title;
    modalTag.textContent = tag;
    modalImg.src = img;
    modalDesc.textContent = desc;
    modalOverlay.classList.add('active');
  };

  if (modalOverlay && modalClose) {
    modalClose.addEventListener('click', () => modalOverlay.classList.remove('active'));
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) modalOverlay.classList.remove('active');
    });
  }

  // Mobile nav toggle logic
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const siteNav = document.getElementById('siteNav');
  const mobileNavOverlay = document.getElementById('mobileNavOverlay');

  const techVideo = document.getElementById('techVideo');
  const videoPlayPause = document.getElementById('videoPlayPause');
  const videoSeek = document.getElementById('videoSeek');

  if (techVideo && videoPlayPause && videoSeek) {
    videoPlayPause.textContent = '▶';

    const updateSeek = () => {
      const progress = techVideo.duration ? (techVideo.currentTime / techVideo.duration) * 100 : 0;
      videoSeek.value = progress;
    };

    videoPlayPause.addEventListener('click', () => {
      if (techVideo.paused) {
        techVideo.play();
        videoPlayPause.textContent = '⏸';
      } else {
        techVideo.pause();
        videoPlayPause.textContent = '▶';
      }
    });

    videoSeek.addEventListener('input', () => {
      if (!techVideo.duration) return;
      const time = (videoSeek.value / 100) * techVideo.duration;
      techVideo.currentTime = time;
    });

    techVideo.addEventListener('timeupdate', updateSeek);
    techVideo.addEventListener('loadedmetadata', updateSeek);
    techVideo.addEventListener('ended', () => {
      videoPlayPause.textContent = '▶';
    });
  }

  function closeMobileNav() {
    if (!mobileMenuBtn || !siteNav || !mobileNavOverlay) return;
    mobileMenuBtn.setAttribute('aria-expanded', 'false');
    siteNav.classList.remove('mobile-open');
    mobileNavOverlay.classList.remove('active');
    mobileNavOverlay.setAttribute('aria-hidden', 'true');
  }

  function openMobileNav() {
    if (!mobileMenuBtn || !siteNav || !mobileNavOverlay) return;
    mobileMenuBtn.setAttribute('aria-expanded', 'true');
    siteNav.classList.add('mobile-open');
    mobileNavOverlay.classList.add('active');
    mobileNavOverlay.setAttribute('aria-hidden', 'false');
  }

  if (mobileMenuBtn && siteNav && mobileNavOverlay) {
    mobileMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const expanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
      if (expanded) closeMobileNav(); else openMobileNav();
    });

    document.addEventListener('click', (e) => {
      if (!siteNav.classList.contains('mobile-open')) return;
      if (siteNav.contains(e.target) || mobileMenuBtn.contains(e.target)) return;
      closeMobileNav();
    });

    // Close mobile nav when a navigation link is clicked
    siteNav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', (e) => {
        e.stopPropagation();
        closeMobileNav();
      });
    });
  }

  // Global keyboard handler: Escape closes modal and mobile nav
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (modalOverlay && modalOverlay.classList.contains('active')) modalOverlay.classList.remove('active');
      closeMobileNav();
    }
  });

  // --- DYNAMIC DUAL ENGINE COMPONENT ADDER ---

  function replaceAllTemplates(template, key, value) {
    return template.split(key).join(value);
  }

  // 1. Fetch & Initialize Hero Rotator Media Snippets
  Promise.all([
    fetch('components/photo-card.html?v=2').then(res => res.text()),
    fetch('data/hero-rotator.json?v=2').then(res => res.json())
  ]).then(([template, data]) => {
    const container = document.getElementById('heroContainer');
    const dotsContainer = document.getElementById('rotatorDots');
    if (!container) return;

    data.forEach((item, index) => {
      let cardHtml = replaceAllTemplates(template, '{{img}}', item.img);
      cardHtml = replaceAllTemplates(cardHtml, '{{title}}', item.title);
      cardHtml = replaceAllTemplates(cardHtml, '{{index}}', String(index));

      const parser = new DOMParser();
      const doc = parser.parseFromString(cardHtml, 'text/html');
      const cardElement = doc.body.firstChild;

      if (index === 0) cardElement.classList.add('active');

      cardElement.addEventListener('click', () => {
        openModal(item.title, item.tag, item.img, item.desc);
        clearInterval(window.rotatorInterval);
      });

      container.appendChild(cardElement);

      if (dotsContainer) {
        const dot = document.createElement('div');
        dot.className = `rotator-dot ${index === 0 ? 'active' : ''}`;
        dot.addEventListener('click', (e) => {
          e.stopPropagation();
          switchHeroPhoto(index);
        });
        dotsContainer.appendChild(dot);
      }
    });

    setupHeroRotator();
  }).catch(err => console.error("Error building Hero modules:", err));

  // 2. Fetch & Initialize Research Gallery Cards
  Promise.all([
    fetch('components/gallery-card.html?v=2').then(res => res.text()),
    fetch('data/publications.json?v=2').then(res => res.json())
  ]).then(([template, data]) => {
    const container = document.getElementById('galleryContainer');
    if (!container) return;

    data.forEach(item => {
      const shortDesc = item.desc.length > 85 ? item.desc.substring(0, 85) + '...' : item.desc;

      let cardHtml = replaceAllTemplates(template, '{{img}}', item.img);
      cardHtml = replaceAllTemplates(cardHtml, '{{title}}', item.title);
      cardHtml = replaceAllTemplates(cardHtml, '{{desc}}', shortDesc);

      const parser = new DOMParser();
      const doc = parser.parseFromString(cardHtml, 'text/html');
      const cardElement = doc.body.firstChild;

      cardElement.addEventListener('click', () => {
        openModal(item.title, item.tag, item.img, item.desc);
      });

      container.appendChild(cardElement);
    });
  }).catch(err => console.error("Error building Gallery modules:", err));

  // --- CONTROLLER PIPELINES ---
  let currentHeroIndex = 0;
  window.rotatorInterval = null;

  function switchHeroPhoto(index) {
    const cards = document.querySelectorAll('#heroContainer .photo-card');
    const dots = document.querySelectorAll('#rotatorDots .rotator-dot');
    if (!cards.length) return;

    cards[currentHeroIndex].classList.remove('active');
    if (dots[currentHeroIndex]) dots[currentHeroIndex].classList.remove('active');

    currentHeroIndex = index;

    cards[currentHeroIndex].classList.add('active');
    if (dots[currentHeroIndex]) dots[currentHeroIndex].classList.add('active');
  }

  function setupHeroRotator() {
    const cards = document.querySelectorAll('#heroContainer .photo-card');
    if (!cards.length) return;

    clearInterval(window.rotatorInterval);
    window.rotatorInterval = setInterval(() => {
      const nextIndex = (currentHeroIndex + 1) % cards.length;
      switchHeroPhoto(nextIndex);
    }, 3500);
  }

  // Gallery Horizontal Slider Scrolling Management
  const galleryContainer = document.getElementById('galleryContainer');
  const scrollPrev = document.getElementById('scrollPrev');
  const scrollNext = document.getElementById('scrollNext');

  if (galleryContainer && scrollPrev && scrollNext) {
    scrollPrev.addEventListener('click', () => galleryContainer.scrollBy({ left: -320, behavior: 'smooth' }));
    scrollNext.addEventListener('click', () => galleryContainer.scrollBy({ left: 320, behavior: 'smooth' }));
  }
});
