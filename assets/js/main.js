/* Coldwell Banker Deutschland – Startseiten-Entwurf (Vanilla JS, keine Abhängigkeiten) */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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

  const toggle = $('#menuToggle');
  const setMenu = (open) => {
    if (open) document.documentElement.style.setProperty('--nav-top', `${Math.max(0, header.getBoundingClientRect().bottom)}px`);
    document.body.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
  };
  toggle.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
  $$('#nav a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  /* ---------- Such-Reiter (Kaufen / Mieten / Verkaufen) ---------- */
  const tabs = $$('.search__tab');
  const selectTab = (tab, focus) => {
    tabs.forEach(t => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      $('#' + t.getAttribute('aria-controls')).hidden = !on;
    });
    if (focus) tab.focus();
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => selectTab(tab));
    tab.addEventListener('keydown', e => {
      const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (d) { e.preventDefault(); selectTab(tabs[(i + d + tabs.length) % tabs.length], true); }
    });
  });

  /* ---------- Objektfilter ---------- */
  const state = { type: 'alle', region: 'alle', kind: 'alle', maxPrice: 0, minRooms: 0 };
  const listings = $$('.listing');
  const chips = $$('.chip');
  const applyFilter = () => {
    let n = 0;
    listings.forEach(el => {
      const d = el.dataset;
      const price = Number(d.price);
      const ok = (state.type === 'alle' || d.type === state.type)
        && (state.region === 'alle' || d.region === state.region)
        && (state.kind === 'alle' || d.kind === state.kind)
        && (!state.maxPrice || (price > 0 && price <= state.maxPrice))
        && (!state.minRooms || Number(d.rooms) >= state.minRooms);
      el.hidden = !ok;
      if (ok) { n++; el.classList.add('is-in'); }
    });
    $('#listingsEmpty').hidden = n > 0;
    $('#listingCount').textContent = n === 1 ? '1 Objekt' : `${n} Objekte`;
    chips.forEach(c => {
      const f = c.dataset.filter, v = c.dataset.value;
      const pressed = f === 'type' ? state[f] === v : state.region === v;
      c.setAttribute('aria-pressed', String(pressed));
    });
  };
  chips.forEach(c => c.addEventListener('click', () => {
    const f = c.dataset.filter, v = c.dataset.value;
    if (f === 'region') state.region = state.region === v ? 'alle' : v;
    else state.type = v;
    state.kind = 'alle'; state.maxPrice = 0; state.minRooms = 0;
    applyFilter();
  }));
  $$('.listing__fav').forEach(b => b.addEventListener('click', () => {
    const on = b.getAttribute('aria-pressed') !== 'true';
    b.setAttribute('aria-pressed', String(on));
    b.setAttribute('aria-label', on ? 'Gemerkt' : 'Merken');
  }));

  /* ---------- Terminformular ---------- */
  const appointment = $('#appointment');
  const openBtn = $('#openAppointment');
  const topic = $('#f-topic');
  const openAppointment = (topicText, message) => {
    appointment.hidden = false;
    openBtn.setAttribute('aria-expanded', 'true');
    if (topicText) {
      let opt = [...topic.options].find(o => o.text === topicText);
      if (!opt) { opt = new Option(topicText, topicText); topic.add(opt, 0); }
      topic.value = opt.value;
    }
    if (message) $('#f-msg').value = message;
  };
  openBtn.addEventListener('click', () => {
    const open = appointment.hidden;
    appointment.hidden = !open;
    openBtn.setAttribute('aria-expanded', String(open));
    if (open) appointment.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  });
  $$('[data-open-appointment]').forEach(a => a.addEventListener('click', () => {
    openAppointment(a.dataset.openAppointment);
    setMenu(false);
  }));

  $('#appointmentForm').addEventListener('submit', e => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const name = $('#f-name').value.trim();
    form.innerHTML = `<div class="form__success" role="status"><h3>Vielen Dank${name ? ', ' + name.replace(/[<>&]/g, '') : ''}.</h3><p>Ihre Anfrage ist eingegangen. Wir melden uns innerhalb von 24 Stunden persönlich bei Ihnen, um den Termin zu bestätigen.</p></div>`;
  });

  /* ---------- Hero-Suche ---------- */
  $$('[data-search]').forEach(form => form.addEventListener('submit', e => {
    e.preventDefault();
    const mode = form.dataset.search;
    const data = new FormData(form);
    if (mode === 'verkaufen') {
      const msg = `Objekt: ${data.get('kind')}, ${data.get('size')}${data.get('ort') ? ', ' + data.get('ort') : ''}. Verkauf geplant: ${data.get('when')}.`;
      openAppointment('Kostenlose Wertermittlung', msg);
      $('#kontakt').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
      return;
    }
    Object.assign(state, {
      type: mode,
      region: data.get('region'),
      kind: data.get('kind'),
      maxPrice: Number(data.get('price')) || 0,
      minRooms: Number(data.get('rooms')) || 0,
    });
    applyFilter();
    $('#objekte').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
  }));

  /* ---------- Standorte: Liste ↔ Karte ---------- */
  $$('.loc[data-loc]').forEach(li => {
    const pin = $(`.map__pin[data-pin="${li.dataset.loc}"]`);
    const on = v => { pin && pin.classList.toggle('is-active', v); li.classList.toggle('is-active', v); };
    li.addEventListener('mouseenter', () => on(true));
    li.addEventListener('mouseleave', () => on(false));
  });

  /* ---------- Bewertungen: mitwachsendes Modul ---------- */
  // Beispielbewertungen – AUSSCHLIESSLICH zur Demonstration im Entwurf.
  // Im Relaunch werden hier verifizierte Bewertungen per Schnittstelle (Google / ProvenExpert) geladen.
  const demoReviews = [
    { text: 'Vom ersten Gespräch bis zum Notartermin hatten wir das Gefühl, in sehr guten Händen zu sein. Ruhig, präzise und immer erreichbar.', name: 'Familie K.', place: 'Hamburg-Blankenese', src: 'Google' },
    { text: 'Die Bewertung war realistisch und gut begründet – verkauft haben wir am Ende genau in diesem Rahmen. So stellt man sich das vor.', name: 'Dr. S. M.', place: 'Grünwald', src: 'ProvenExpert' },
    { text: 'Wir wollten diskret verkaufen. Das hat hervorragend funktioniert, ohne dass unser Haus je öffentlich inseriert wurde.', name: 'H. und C. B.', place: 'Hamburg-Othmarschen', src: 'Google' },
  ];
  const promises = [
    { icon: 'i-user', title: 'Ein Ansprechpartner', text: 'Sie haben vom ersten Gespräch bis zur Schlüsselübergabe eine feste Person an Ihrer Seite – mit Durchwahl.' },
    { icon: 'i-doc', title: 'Transparente Konditionen', text: 'Provision, Leistungen und Ablauf erhalten Sie vorab schriftlich. Ohne Kleingedrucktes.' },
  ];
  const star = '<svg><use href="#i-star"/></svg>';
  const stars = n => `<span class="stars" aria-label="${n} von 5 Sternen">${star.repeat(n)}</span>`;

  const renderReviews = (count) => {
    const wrap = $('#reviews');
    const summary = $('#ratingSummary');
    const note = $('#reviewsNote');
    if (count === 0) {
      summary.className = 'rating-summary rating-summary--empty';
      summary.innerHTML = `<div class="rating-summary__score">Neu in<br>Deutschland</div><div class="rating-summary__meta">Unsere ersten Kundinnen und Kunden<br>bewerten uns gerade. <b>Ihre Meinung zählt.</b></div>`;
      wrap.innerHTML = promises.map(p => `
        <article class="promise"><svg class="promise__icon"><use href="#${p.icon}"/></svg><h3>${p.title}</h3><p>${p.text}</p><span class="promise__label">Unser Versprechen</span></article>`).join('') + `
        <article class="review-invite"><h3>Sie haben mit uns verkauft, gekauft oder gemietet?</h3><p>Ihre ehrliche Bewertung hilft anderen bei einer wichtigen Entscheidung – und uns, noch besser zu werden.</p><a class="btn btn--light" href="#kontakt">Bewertung abgeben</a></article>`;
      note.textContent = 'Verifizierte Bewertungen erscheinen hier automatisch, sobald sie vorliegen.';
      return;
    }
    const shown = demoReviews.slice(0, 3);
    if (count < 10) {
      summary.className = 'rating-summary';
      summary.innerHTML = `${stars(5)}<div class="rating-summary__meta"><b>${count} verifizierte Bewertungen</b><br>auf Google und ProvenExpert</div>`;
    } else {
      summary.className = 'rating-summary';
      summary.innerHTML = `<div class="rating-summary__score">4,9</div><div>${stars(5)}<div class="rating-summary__meta"><b>${count} Bewertungen</b> · Google &amp; ProvenExpert</div></div>`;
    }
    wrap.innerHTML = shown.map(r => `
      <article class="review"><span class="review__demo">Beispiel</span>${stars(5)}<blockquote>„${r.text}“</blockquote>
        <footer><div><strong>${r.name}</strong><span>${r.place}</span></div><span class="review__src">${r.src}</span></footer></article>`).join('');
    note.innerHTML = count >= 10 ? `<a class="link-arrow" href="#bewertungen">Alle ${count} Bewertungen lesen <svg><use href="#i-arrow"/></svg></a>` : 'Bewertungen werden ausschließlich aus verifizierten Quellen übernommen.';
  };
  renderReviews(0);
  $$('[data-scenario]').forEach(b => b.addEventListener('click', () => {
    $$('[data-scenario]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    renderReviews(Number(b.dataset.scenario));
  }));

  /* ---------- Kennzahlen hochzählen ---------- */
  const countUp = el => {
    const target = Number(el.dataset.count);
    const plain = el.hasAttribute('data-plain');
    if (reduceMotion) return;
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
