document.addEventListener('DOMContentLoaded', () => {
  // Global Viewport Modal Overlay Map Selectors
  const modalOverlay = document.getElementById('galleryModal');
  const modalClose = document.getElementById('modalClose');
  const modalImg = document.getElementById('modalImg');
  const modalTitle = document.getElementById('modalTitle');
  const modalTag = document.getElementById('modalTag');
  const modalDesc = document.getElementById('modalDesc');
  const modalVisualWrapper = document.getElementById('modalVisualWrapper');
  const modalAbstractWrapper = document.getElementById('modalAbstractWrapper');
  const modalAbstract = document.getElementById('modalAbstract');

  let lastActiveElement = null;

  const openModal = (title, tag, img, desc, abstract) => {
    lastActiveElement = document.activeElement;

    modalTitle.textContent = title || '';
    modalTag.textContent = tag || 'Highlight';
    modalDesc.textContent = desc || '';

    if (abstract) {
      modalImg.hidden = true;
      modalVisualWrapper.classList.add('abstract-mode');
      modalAbstractWrapper.hidden = false;
      modalAbstract.textContent = abstract;
    } else {
      modalImg.hidden = false;
      modalVisualWrapper.classList.remove('abstract-mode');
      modalAbstractWrapper.hidden = true;
      modalImg.src = img || '';
      modalImg.alt = title || 'Gallery image';
    }

    modalOverlay.classList.add('active');
    modalOverlay.setAttribute('aria-hidden', 'false');
    if (modalClose) modalClose.focus();
  };

  const closeModal = () => {
    if (!modalOverlay || !modalOverlay.classList.contains('active')) return;
    modalOverlay.classList.remove('active');
    modalOverlay.setAttribute('aria-hidden', 'true');
    if (lastActiveElement) lastActiveElement.focus();
  };

  if (modalOverlay && modalClose) {
    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }

  // Mobile nav toggle logic
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const siteNav = document.getElementById('siteNav');
  const mobileNavOverlay = document.getElementById('mobileNavOverlay');

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
    siteNav.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', (e) => {
        e.stopPropagation();
        closeMobileNav();
      });
    });
  }

  // Tech Video Controls
  const techVideo = document.getElementById('techVideo');
  const videoPlayPause = document.getElementById('videoPlayPause');
  const videoSeek = document.getElementById('videoSeek');

  if (techVideo && videoPlayPause && videoSeek) {
    techVideo.load();
    videoPlayPause.textContent = '▶';

    const updateSeek = () => {
      if (!Number.isNaN(techVideo.duration) && techVideo.duration > 0) {
        videoSeek.value = (techVideo.currentTime / techVideo.duration) * 100;
      }
    };

    const togglePlay = async () => {
      try {
        if (techVideo.paused) {
          await techVideo.play();
        } else {
          techVideo.pause();
        }
      } catch (err) {
        console.error('Video play failed:', err);
      }
    };

    videoPlayPause.addEventListener('click', togglePlay);
    techVideo.addEventListener('click', togglePlay);

    techVideo.addEventListener('play', () => {
      videoPlayPause.textContent = '⏸';
    });

    techVideo.addEventListener('pause', () => {
      videoPlayPause.textContent = '▶';
    });

    techVideo.addEventListener('ended', () => {
      videoPlayPause.textContent = '▶';
      videoSeek.value = 0;
    });

    techVideo.addEventListener('timeupdate', updateSeek);
    techVideo.addEventListener('loadedmetadata', () => {
      videoSeek.max = 100;
      updateSeek();
    });

    videoSeek.addEventListener('input', () => {
      if (!Number.isNaN(techVideo.duration)) {
        techVideo.currentTime = (videoSeek.value / 100) * techVideo.duration;
      }
    });

    techVideo.addEventListener('loadeddata', () => {
      console.log('Video loaded');
    });

    techVideo.addEventListener('error', () => {
      console.error('Video error:', techVideo.error);
    });
  }

  // Global keyboard handler: Escape closes modal and mobile nav
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
      closeMobileNav();
    }
  });

  // --- DYNAMIC COMPONENT UTILITIES ---

  function replaceAllTemplates(template, key, value) {
    return template.split(key).join(value || '');
  }

  // 1. Fetch & Initialize Hero Rotator Media Snippets
  Promise.all([
    fetch('components/photo-card.html?v=3').then((res) => res.text()),
    fetch('data/hero-rotator.json?v=3').then((res) => res.json())
  ]).then(([template, data]) => {
    const container = document.getElementById('heroContainer');
    const dotsContainer = document.getElementById('rotatorDots');
    if (!container || !Array.isArray(data) || data.length === 0) return;

    data.forEach((item, index) => {
      let cardHtml = replaceAllTemplates(template, '{{img}}', item.img);
      cardHtml = replaceAllTemplates(cardHtml, '{{title}}', item.title);
      cardHtml = replaceAllTemplates(cardHtml, '{{index}}', String(index));

      const parser = new DOMParser();
      const doc = parser.parseFromString(cardHtml, 'text/html');
      const cardElement = doc.body.firstElementChild;

      if (index === 0) cardElement.classList.add('active');

      cardElement.addEventListener('click', () => {
        openModal(item.title, item.tag, item.img, item.desc);
        clearInterval(window.rotatorInterval);
      });

      container.appendChild(cardElement);

      if (dotsContainer) {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.ariaLabel = `Slide ${index + 1}`;
        dot.className = `rotator-dot ${index === 0 ? 'active' : ''}`;
        dot.addEventListener('click', (e) => {
          e.stopPropagation();
          switchHeroPhoto(index);
        });
        dotsContainer.appendChild(dot);
      }
    });

    setupHeroRotator();
  }).catch((err) => console.error('Error building Hero modules:', err));

  // 2. Dynamic Generic Gallery Loader Function
  function loadGallerySection({ templatePath, dataPath, containerId, prevBtnId, nextBtnId }) {
    const container = document.getElementById(containerId);
    const scrollPrev = document.getElementById(prevBtnId);
    const scrollNext = document.getElementById(nextBtnId);

    if (!container) return;

    if (scrollPrev && scrollNext) {
      scrollPrev.addEventListener('click', () => container.scrollBy({ left: -320, behavior: 'smooth' }));
      scrollNext.addEventListener('click', () => container.scrollBy({ left: 320, behavior: 'smooth' }));
    }

    Promise.all([
      fetch(`${templatePath}?v=3`).then((res) => res.text()),
      fetch(`${dataPath}?v=3`).then((res) => res.json())
    ]).then(([template, data]) => {
      if (!Array.isArray(data)) return;

      data.forEach((item) => {
        const fullDesc = item.desc || '';
        const shortDesc = fullDesc.length > 90 ? `${fullDesc.substring(0, 90)}...` : fullDesc;

        const detailsMarkup = item.source
          ? `<a href="${item.source}" class="gallery-source-link" target="_blank" rel="noopener noreferrer">Open source paper ↗</a>`
          : `<p class="gallery-card-snippet">${shortDesc}</p>`;

        let cardHtml = replaceAllTemplates(template, '{{img}}', item.img);
        cardHtml = replaceAllTemplates(cardHtml, '{{title}}', item.title);
        cardHtml = replaceAllTemplates(cardHtml, '{{details}}', detailsMarkup);

        const parser = new DOMParser();
        const doc = parser.parseFromString(cardHtml, 'text/html');
        const cardElement = doc.body.firstElementChild;

        const sourceLink = cardElement.querySelector('.gallery-source-link');
        if (sourceLink) {
          sourceLink.addEventListener('click', (e) => {
            e.stopPropagation();
          });
        }

        cardElement.addEventListener('click', () => {
          openModal(item.title, item.tag, item.img, item.desc, item.abstract);
        });

        container.appendChild(cardElement);
      });
    }).catch((err) => console.error(`Error building Gallery module [${containerId}]:`, err));
  }

  // Initialize Lab Highlights Section
  loadGallerySection({
    templatePath: 'components/gallery-card.html',
    dataPath: 'data/highlights.json',
    containerId: 'highlightsContainer',
    prevBtnId: 'highlightsScrollPrev',
    nextBtnId: 'highlightsScrollNext'
  });

  // Initialize Publications Section
  loadGallerySection({
    templatePath: 'components/gallery-card.html',
    dataPath: 'data/publications.json',
    containerId: 'publicationsContainer',
    prevBtnId: 'publicationsScrollPrev',
    nextBtnId: 'publicationsScrollNext'
  });

  // --- CONTROLLER PIPELINES ---
  let currentHeroIndex = 0;
  window.rotatorInterval = null;

  function switchHeroPhoto(index) {
    const cards = document.querySelectorAll('#heroContainer .photo-card');
    const dots = document.querySelectorAll('#rotatorDots .rotator-dot');
    if (!cards.length) return;

    cards[currentHeroIndex]?.classList.remove('active');
    dots[currentHeroIndex]?.classList.remove('active');

    currentHeroIndex = index;

    cards[currentHeroIndex]?.classList.add('active');
    dots[currentHeroIndex]?.classList.add('active');
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
});