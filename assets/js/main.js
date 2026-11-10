/* Coldwell Banker Deutschland – Startseiten-Entwurf (Vanilla JS, keine Abhängigkeiten) */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const scrollBehavior = reduceMotion ? 'auto' : 'smooth';
  const fmt = new Intl.NumberFormat('de-DE');

  /* ---------- Header & mobiles Menü ---------- */
  const header = $('#header');
  const mobileBar = $('#mobileBar');
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 10);
    mobileBar.classList.toggle('is-visible', y > window.innerHeight * 0.6);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Hero-Video ---------- */
  // Läuft stumm in Schleife. Bei „Bewegung reduzieren“ oder Datensparmodus bleibt das Standbild (Poster) stehen.
  const heroVideo = $('#heroVideo');
  const heroToggle = $('#heroToggle');
  const saveData = navigator.connection && navigator.connection.saveData;
  if (heroVideo && !reduceMotion && !saveData) {
    heroVideo.muted = true;
    heroVideo.setAttribute('preload', 'auto');
    const setPaused = paused => {
      heroToggle.setAttribute('aria-pressed', String(paused));
      heroToggle.setAttribute('aria-label', paused ? 'Hintergrundvideo abspielen' : 'Hintergrundvideo pausieren');
    };
    const start = () => heroVideo.play().then(() => { heroToggle.hidden = false; setPaused(false); }).catch(() => {});
    start();
    heroToggle.addEventListener('click', () => {
      if (heroVideo.paused) { heroVideo.play(); setPaused(false); } else { heroVideo.pause(); setPaused(true); }
    });
    // Außerhalb des sichtbaren Bereichs anhalten (spart Akku), danach weiterlaufen – außer es wurde bewusst pausiert
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([en]) => {
        if (heroToggle.getAttribute('aria-pressed') === 'true') return;
        if (en.isIntersecting) heroVideo.play().catch(() => {}); else heroVideo.pause();
      }).observe(heroVideo);
    }
  }

  const toggle = $('#menuToggle');
  const setMenu = (open) => {
    if (open) document.documentElement.style.setProperty('--nav-top', `${Math.max(0, header.getBoundingClientRect().bottom)}px`);
    document.body.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
  };
  toggle.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
  $$('#nav a').forEach(a => a.addEventListener('click', () => setMenu(false)));

  // Standorte-Untermenü (Klick/Tastatur; auf dem Desktop zusätzlich per Hover)
  const subToggle = $('.nav__toggle');
  const setSub = open => subToggle.setAttribute('aria-expanded', String(open));
  subToggle.addEventListener('click', e => { e.stopPropagation(); setSub(subToggle.getAttribute('aria-expanded') !== 'true'); });
  document.addEventListener('click', e => { if (!e.target.closest('.nav__item--sub')) setSub(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { setMenu(false); setSub(false); } });

  /* ---------- Reiter (Suche & Kontakt) ---------- */
  const initTabs = (tabs, onSelect) => {
    const select = (tab, focus) => {
      tabs.forEach(t => {
        const on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        $('#' + t.getAttribute('aria-controls')).hidden = !on;
      });
      if (focus) tab.focus();
      if (onSelect) onSelect(tab);
    };
    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => select(tab));
      tab.addEventListener('keydown', e => {
        const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (d) { e.preventDefault(); select(tabs[(i + d + tabs.length) % tabs.length], true); }
      });
    });
    return select;
  };
  initTabs($$('.search__tab'));
  const contactTabs = $$('.contact__tab');
  const selectContact = initTabs(contactTabs);

  /* ---------- Slider ---------- */
  $$('[data-carousel]').forEach(track => {
    const nav = $(`[data-carousel-nav="${track.dataset.carousel}"]`);
    if (!nav) return;
    const [prev, next] = $$('.carousel-btn', nav);
    const update = () => {
      const max = track.scrollWidth - track.clientWidth;
      nav.classList.toggle('is-static', max < 4);
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft >= max - 2;
    };
    $$('.carousel-btn', nav).forEach(btn => btn.addEventListener('click', () => {
      const item = track.querySelector(':scope > article:not([hidden])');
      const step = item ? item.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 0) : track.clientWidth;
      track.scrollBy({ left: step * Number(btn.dataset.dir), behavior: scrollBehavior });
    }));
    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    track.updateCarousel = update;
    update();
  });

  /* ---------- Objektfilter (über die Hero-Suche) ---------- */
  const listingsTrack = $('#listings');
  const listings = $$('.listing', listingsTrack);
  const filterStatus = $('#filterStatus');
  const regionNames = { hamburg: 'Hamburg', muenchen: 'Münchner Süden', international: 'International' };
  const kindNames = { wohnung: 'Wohnung', haus: 'Haus & Villa' };
  const applyFilter = (f) => {
    let n = 0;
    listings.forEach(el => {
      const d = el.dataset;
      const ok = !f || ((d.type === f.type)
        && (f.region === 'alle' || d.region === f.region)
        && (f.kind === 'alle' || d.kind === f.kind)
        && (!f.rooms || Number(d.rooms) >= f.rooms));
      el.hidden = !ok;
      if (ok) { n++; el.classList.add('is-in'); }
    });
    $('#listingsEmpty').hidden = n > 0;
    listingsTrack.classList.toggle('is-empty', n === 0);
    filterStatus.hidden = !f;
    if (f) {
      const parts = [f.type === 'mieten' ? 'Mieten' : 'Kaufen'];
      if (f.region !== 'alle') parts.push(regionNames[f.region]);
      if (f.kind !== 'alle') parts.push(kindNames[f.kind]);
      if (f.rooms) parts.push(`ab ${f.rooms} Zimmer`);
      $('#filterText').textContent = `${parts.join(' · ')}: ${n === 1 ? '1 Immobilie' : `${n} Immobilien`}.`;
    }
    listingsTrack.scrollLeft = 0;
    if (listingsTrack.updateCarousel) listingsTrack.updateCarousel();
  };
  $('#filterReset').addEventListener('click', () => applyFilter(null));
  $$('.listing__fav').forEach(b => b.addEventListener('click', () => {
    b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true'));
  }));

  /* ---------- Kontakt: E-Mail-Formular mit Anliegen öffnen ---------- */
  const topic = $('#f-topic');
  const openMailForm = (topicText, message) => {
    selectContact($('#ct-mail'));
    if (topicText) {
      let opt = [...topic.options].find(o => o.text === topicText);
      if (!opt) { opt = new Option(topicText, topicText); topic.add(opt, 0); }
      topic.value = opt.value;
    }
    if (message) $('#f-msg').value = message;
  };
  $$('[data-contact-topic]').forEach(a => a.addEventListener('click', () => openMailForm(a.dataset.contactTopic)));

  $$('.contact form').forEach(form => form.addEventListener('submit', e => {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const box = document.createElement('div');
    box.className = 'form__success';
    box.setAttribute('role', 'status');
    box.innerHTML = '<p></p>';
    box.querySelector('p').textContent = form.dataset.success;
    form.replaceChildren(box);
  }));

  /* ---------- Hero-Suche ---------- */
  $$('[data-search]').forEach(form => form.addEventListener('submit', e => {
    e.preventDefault();
    const mode = form.dataset.search;
    const data = new FormData(form);
    if (mode === 'verkaufen') {
      const ort = (data.get('ort') || '').trim();
      openMailForm('Immobilienbewertung', `Objekt: ${data.get('kind')}, Wohnfläche ${data.get('size')}${ort ? ', ' + ort : ''}.`);
      $('#kontakt').scrollIntoView({ behavior: scrollBehavior });
      return;
    }
    applyFilter({ type: mode, region: data.get('region'), kind: data.get('kind'), rooms: Number(data.get('rooms')) || 0 });
    $('#immobilien').scrollIntoView({ behavior: scrollBehavior });
  }));

  /* ---------- Kampagnenvideo (Zwei-Klick-Lösung) ---------- */
  const videoBox = $('#videoBox');
  $$('[data-play-video]').forEach(btn => btn.addEventListener('click', () => {
    if (videoBox.classList.contains('is-playing')) return;
    const iframe = document.createElement('iframe');
    iframe.src = 'https://www.youtube-nocookie.com/embed/JT-ZOpg4K5w?autoplay=1&rel=0';
    iframe.title = 'Live Well with Coldwell';
    iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    iframe.allowFullscreen = true;
    videoBox.replaceChildren(iframe);
    videoBox.classList.add('is-playing');
    if (btn.closest('.campaign__text')) videoBox.scrollIntoView({ behavior: scrollBehavior, block: 'center' });
  }));

  /* ---------- Standorte: Karte ↔ Karten ---------- */
  $$('.loc-card[data-loc]').forEach(card => {
    const pin = $(`.map__pin[data-pin="${card.dataset.loc}"]`);
    const on = v => { if (pin) pin.classList.toggle('is-active', v); card.classList.toggle('is-active', v); };
    card.addEventListener('mouseenter', () => on(true));
    card.addEventListener('mouseleave', () => on(false));
  });

  /* ---------- Netzwerk-Weltkarte ---------- */
  const wm = $('#weltkarte');
  if (wm) {
    const tip = $('#wmTip');
    const shapes = $$('.wm-cb, .wm-dot', wm);
    let tipFor = null;
    const showTip = (el, x, y) => {
      const r = wm.getBoundingClientRect();
      tip.textContent = el.dataset.name;
      tip.hidden = false;
      tip.style.left = `${x - r.left}px`;
      tip.style.top = `${y - r.top}px`;
      shapes.forEach(s => s.classList.toggle('is-hover', s.dataset.name === el.dataset.name));
      tipFor = el;
    };
    const hideTip = () => { tip.hidden = true; tipFor = null; shapes.forEach(s => s.classList.remove('is-hover')); };
    shapes.forEach(el => {
      el.addEventListener('mousemove', e => showTip(el, e.clientX, e.clientY));
      el.addEventListener('mouseleave', hideTip);
      el.addEventListener('click', e => {
        e.stopPropagation();
        if (tipFor === el) { hideTip(); return; }
        const b = el.getBoundingClientRect();
        showTip(el, b.left + b.width / 2, b.top);
      });
    });
    document.addEventListener('click', hideTip);

    // Regionskacheln heben ihre Länder auf der Karte hervor
    const setRegion = key => {
      wm.classList.toggle('is-filtered', !!key);
      shapes.forEach(s => s.classList.toggle('is-on', s.dataset.region === key));
    };
    const regions = $$('.region[data-region]');
    const openRegion = () => (regions.find(r => r.open) || {}).dataset;
    regions.forEach(r => {
      r.addEventListener('mouseenter', () => setRegion(r.dataset.region));
      r.addEventListener('mouseleave', () => setRegion(openRegion()?.region));
      r.addEventListener('toggle', () => setRegion(r.open ? r.dataset.region : openRegion()?.region));
    });

    // Auf schmalen Bildschirmen ist die Karte wischbar: Start mittig auf dem Atlantik
    const sc = $('.wm__scroll', wm);
    if (sc && sc.scrollWidth > sc.clientWidth) sc.scrollLeft = (sc.scrollWidth - sc.clientWidth) * 0.42;
  }

  /* ---------- Kennzahlen hochzählen ---------- */
  const countUp = el => {
    if (reduceMotion) return;
    const target = Number(el.dataset.count);
    const plain = el.hasAttribute('data-plain');
    const from = plain ? Math.max(0, target - 120) : 0;
    const t0 = performance.now(), dur = 1600;
    const step = t => {
      const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      const v = Math.round(from + (target - from) * e);
      el.textContent = plain ? String(v) : fmt.format(v);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  /* ---------- Reveal beim Scrollen ---------- */
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver(entries => entries.forEach(en => {
      if (!en.isIntersecting) return;
      en.target.classList.add('is-in');
      $$('[data-count]', en.target).forEach(countUp);
      if (en.target.matches('[data-count]')) countUp(en.target);
      io.unobserve(en.target);
    }), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    $$('.reveal').forEach((el, i) => { el.style.animationDelay = `${(i % 3) * 80}ms`; io.observe(el); });
  } else {
    $$('.reveal').forEach(el => el.classList.add('is-in'));
  }

  /* ---------- Präsentationsmodus: Entwurfshinweise ---------- */
  const notesBtn = $('#toggleNotes');
  let pop = null;
  const closePop = () => { if (pop) { pop.remove(); pop = null; } };
  $$('[data-note]').forEach((el, i) => {
    const pin = document.createElement('button');
    pin.type = 'button';
    pin.className = 'note-pin';
    pin.textContent = String(i + 1);
    pin.setAttribute('aria-label', `Entwurfshinweis ${i + 1}`);
    pin.addEventListener('click', e => {
      e.preventDefault(); e.stopPropagation();
      closePop();
      pop = document.createElement('div');
      pop.className = 'note-pop';
      pop.setAttribute('role', 'dialog');
      pop.innerHTML = `<button type="button" aria-label="Schließen">×</button><strong>Hinweis ${i + 1}</strong><p></p>`;
      pop.querySelector('p').textContent = el.dataset.note;
      pop.querySelector('button').addEventListener('click', closePop);
      document.body.appendChild(pop);
      const r = pin.getBoundingClientRect();
      const w = pop.offsetWidth;
      const left = Math.min(Math.max(16, r.right + window.scrollX - w), window.scrollX + document.documentElement.clientWidth - w - 16);
      pop.style.left = `${left}px`;
      pop.style.top = `${r.bottom + window.scrollY + 10}px`;
    });
    el.appendChild(pin);
  });
  document.addEventListener('click', e => { if (pop && !pop.contains(e.target)) closePop(); });
  const setNotes = on => {
    document.body.classList.toggle('notes-on', on);
    notesBtn.setAttribute('aria-pressed', String(on));
    if (!on) closePop();
  };
  notesBtn.addEventListener('click', () => setNotes(!document.body.classList.contains('notes-on')));
  if (new URLSearchParams(location.search).has('hinweise')) setNotes(true);
})();
