/* ============================================================
   Calculadoras VGI - App principal
   Renderiza escalas, calcula puntajes, persiste en localStorage.
   ============================================================ */
(function () {
  const STORAGE_KEY = 'vgi_app_state_v1';

  /** Estado global */
  const state = {
    activeId: null,
    patient: { name: '', age: '', sex: '', id: '', date: '' },
    notes: '',
    values: {}, // { scaleId: { itemId: value } }
    theme: localStorage.getItem('vgi_theme') || 'light',
  };

  /* ====== Persistencia ===================================== */
  function save() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          patient: state.patient,
          values: state.values,
          notes: state.notes,
          activeId: state.activeId,
        })
      );
    } catch (e) { /* ignore quota */ }
  }
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      Object.assign(state.patient, data.patient || {});
      state.values = data.values || {};
      state.notes = data.notes || '';
      state.activeId = data.activeId || null;
    } catch (e) { /* ignore */ }
  }

  /* ====== Tema ============================================= */
  function applyTheme() {
    document.documentElement.dataset.theme = state.theme;
    const btn = document.getElementById('btnTheme');
    if (btn) btn.querySelector('.theme-icon').textContent = state.theme === 'dark' ? '☀' : '◐';
  }

  /* ====== Sidebar nav ====================================== */
  function renderNav() {
    const nav = document.getElementById('scaleNav');
    if (!nav) return;
    nav.innerHTML = '';
    const groups = window.VGI_GROUPS;
    Object.keys(groups).forEach((cat) => {
      const wrap = document.createElement('div');
      wrap.className = 'scale-nav__group';
      const title = document.createElement('div');
      title.className = 'scale-nav__group-title';
      title.textContent = cat;
      wrap.appendChild(title);

      groups[cat].forEach((sc) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'scale-nav__btn';
        btn.dataset.id = sc.id;
        if (sc.id === state.activeId) btn.classList.add('is-active');

        const icon = document.createElement('span');
        icon.className = 'scale-nav__icon';
        icon.textContent = sc.icon || sc.short[0];
        btn.appendChild(icon);

        const label = document.createElement('span');
        label.textContent = sc.name;
        btn.appendChild(label);

        // Badge con puntaje actual si tiene datos
        const result = computeScale(sc.id);
        if (result && result.touched) {
          const badge = document.createElement('span');
          badge.className = 'scale-nav__badge';
          if (result.level === 'danger') badge.dataset.state = 'danger';
          else if (result.level === 'warn') badge.dataset.state = 'warn';
          badge.textContent = result.scoreDisplay;
          btn.appendChild(badge);
        }

        btn.addEventListener('click', () => {
          state.activeId = sc.id;
          save();
          renderView();
          renderNav();
          closeSidebarMobile();
        });
        wrap.appendChild(btn);
      });

      nav.appendChild(wrap);
    });
  }

  /* ====== Cálculo de puntaje =============================== */
  function getAllItems(sc) {
    if (sc.sections) {
      return sc.sections.flatMap((s) => s.items);
    }
    return sc.items || [];
  }
  function getMaxScore(sc) {
    return getAllItems(sc).reduce((acc, it) => {
      const max = Math.max(...it.options.map((o) => o.value));
      return acc + max;
    }, 0);
  }
  function computeScale(scaleId) {
    const sc = window.VGI_SCALES.find((x) => x.id === scaleId);
    if (!sc) return null;
    const values = state.values[scaleId] || {};
    const items = getAllItems(sc);
    let score = 0;
    let answered = 0;
    items.forEach((it) => {
      if (values[it.id] !== undefined && values[it.id] !== null) {
        score += Number(values[it.id]);
        answered++;
      }
    });
    const total = items.length;
    const max = getMaxScore(sc);
    const ctx = { values, patient: state.patient };
    const interp = sc.interpret ? sc.interpret(score, ctx) : null;
    return {
      score,
      max,
      total,
      answered,
      complete: answered === total,
      touched: answered > 0,
      level: interp?.level,
      label: interp?.label,
      detail: interp?.detail,
      scoreDisplay: `${score}/${max}`,
    };
  }

  /* ====== Render principal ================================ */
  function renderView() {
    const main = document.getElementById('scaleView');
    if (!main) return;

    if (!state.activeId) {
      main.innerHTML = renderWelcome();
      bindWelcome(main);
      return;
    }

    const sc = window.VGI_SCALES.find((x) => x.id === state.activeId);
    if (!sc) {
      main.innerHTML = '<div class="welcome"><p>Escala no encontrada.</p></div>';
      return;
    }

    main.innerHTML = '';
    // Header
    const header = document.createElement('section');
    header.className = 'scale-header';
    header.innerHTML = `
      <span class="scale-header__tag">${escapeHtml(sc.tag || sc.category)}</span>
      <h2>${escapeHtml(sc.name)}</h2>
      <p>${escapeHtml(sc.description || '')}</p>
    `;
    main.appendChild(header);

    // Body card
    const card = document.createElement('section');
    card.className = 'scale-card';
    card.appendChild(renderItems(sc));
    main.appendChild(card);

    // Notas
    const notesCard = document.createElement('section');
    notesCard.className = 'scale-card notes-card';
    notesCard.innerHTML = `
      <label for="scaleNotes">Notas / observaciones</label>
      <textarea id="scaleNotes" class="free-text" placeholder="Anotaciones clínicas, contexto, recomendaciones..."></textarea>
    `;
    const notesField = notesCard.querySelector('textarea');
    notesField.value = (state.values[`${sc.id}__notes`] || '');
    notesField.addEventListener('input', () => {
      state.values[`${sc.id}__notes`] = notesField.value;
      save();
    });
    main.appendChild(notesCard);

    // Result panel
    main.appendChild(renderResult(sc));
  }

  function renderItems(sc) {
    const frag = document.createDocumentFragment();
    if (sc.sections) {
      sc.sections.forEach((sec) => {
        const wrap = document.createElement('div');
        wrap.className = 'subsection';
        const title = document.createElement('div');
        title.className = 'subsection__title';
        title.innerHTML = `<span>${escapeHtml(sec.title)}</span>`;
        wrap.appendChild(title);
        sec.items.forEach((it, i) => wrap.appendChild(renderQuestion(sc, it, i + 1)));
        frag.appendChild(wrap);
      });
    } else {
      sc.items.forEach((it, i) => frag.appendChild(renderQuestion(sc, it, i + 1)));
    }
    return frag;
  }

  function renderQuestion(sc, item, num) {
    const wrap = document.createElement('div');
    wrap.className = 'question';

    const head = document.createElement('div');
    head.className = 'question__head';
    head.innerHTML = `
      <span class="question__num">${num}</span>
      <div>
        <div class="question__text">${escapeHtml(item.text)}</div>
        ${item.hint ? `<div class="question__hint">${escapeHtml(item.hint)}</div>` : ''}
      </div>
    `;
    wrap.appendChild(head);

    const opts = document.createElement('div');
    opts.className = 'options';
    const currentVal = (state.values[sc.id] || {})[item.id];

    item.options.forEach((op, idx) => {
      const label = document.createElement('label');
      label.className = 'option';
      // Comparamos por índice + valor para permitir duplicados de valor
      const isSelected = currentVal !== undefined && currentVal === op.value
        && (state.values[sc.id] || {})[`${item.id}__idx`] === idx;
      if (isSelected) label.classList.add('is-selected');
      label.innerHTML = `
        <input type="radio" name="${sc.id}-${item.id}" value="${op.value}" data-idx="${idx}" />
        <span>${escapeHtml(op.label)}</span>
        <span class="option__pts">${op.value}</span>
      `;
      label.querySelector('input').addEventListener('change', () => {
        if (!state.values[sc.id]) state.values[sc.id] = {};
        state.values[sc.id][item.id] = op.value;
        state.values[sc.id][`${item.id}__idx`] = idx;
        save();
        // Refresh only the options and the result, not all DOM
        Array.from(opts.children).forEach((c, i) => c.classList.toggle('is-selected', i === idx));
        updateResult(sc);
        renderNav();
      });
      opts.appendChild(label);
    });
    wrap.appendChild(opts);
    return wrap;
  }

  function renderResult(sc) {
    const panel = document.createElement('section');
    panel.className = 'result';
    panel.id = 'resultPanel';
    panel.innerHTML = buildResultHtml(sc);
    bindResultActions(panel, sc);
    return panel;
  }

  function updateResult(sc) {
    const panel = document.getElementById('resultPanel');
    if (!panel) return;
    panel.innerHTML = buildResultHtml(sc);
    bindResultActions(panel, sc);
  }

  function buildResultHtml(sc) {
    const r = computeScale(sc.id);
    if (!r) return '';
    const levelClass = r.level || 'info';
    return `
      <div class="result__score">
        <span class="result__score-label">Puntaje</span>
        <div>
          <span class="result__score-value">${r.score}</span>
          <span class="result__score-max">/ ${r.max}</span>
        </div>
        <span class="result__score-label" style="margin-top:.4rem">${r.answered}/${r.total} respondido</span>
      </div>
      <div class="result__interp">
        <span class="result__interp-label">Interpretación</span>
        <div class="result__interp-value">
          ${r.label ? `<span class="result__chip" data-level="${levelClass}">${escapeHtml(r.label)}</span>` : '<span class="result__chip" data-level="info">Pendiente</span>'}
        </div>
        ${r.detail ? `<div class="result__interp-detail">${escapeHtml(r.detail)}</div>` : ''}
      </div>
      <div class="result__actions">
        <button class="btn" data-action="reset" type="button">Limpiar</button>
        <button class="btn btn--primary" data-action="print" type="button">Imprimir / PDF</button>
      </div>
    `;
  }

  function bindResultActions(panel, sc) {
    panel.querySelector('[data-action="reset"]').addEventListener('click', () => {
      if (!confirm(`¿Limpiar las respuestas de ${sc.name}?`)) return;
      delete state.values[sc.id];
      save();
      renderView();
      renderNav();
    });
    panel.querySelector('[data-action="print"]').addEventListener('click', () => window.print());
  }

  /* ====== Welcome ========================================= */
  function renderWelcome() {
    const cards = window.VGI_SCALES.map((sc) => `
      <button class="welcome__card" data-id="${sc.id}" type="button">
        <h3>${escapeHtml(sc.name)}</h3>
        <p>${escapeHtml(sc.tag || '')}</p>
      </button>
    `).join('');
    return `
      <section class="scale-header">
        <span class="scale-header__tag">Bienvenido</span>
        <h2>Calculadoras VGI</h2>
        <p>Suite de escalas para la Valoración Geriátrica Integral. Selecciona una escala para comenzar; las respuestas se guardan automáticamente en tu dispositivo.</p>
      </section>
      <section class="scale-card">
        <div class="scale-card__title">Elige una escala</div>
        <div class="welcome__grid">${cards}</div>
      </section>
    `;
  }
  function bindWelcome(root) {
    root.querySelectorAll('.welcome__card').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.activeId = btn.dataset.id;
        save();
        renderView();
        renderNav();
      });
    });
  }

  /* ====== Paciente ========================================= */
  function bindPatientInputs() {
    const map = {
      pName: 'name', pAge: 'age', pSex: 'sex', pId: 'id', pDate: 'date',
    };
    Object.keys(map).forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.value = state.patient[map[id]] || '';
      el.addEventListener('input', () => {
        state.patient[map[id]] = el.value;
        save();
        // Re-render para que escalas que dependen de edad/sexo reaccionen
        if (state.activeId) updateResult(window.VGI_SCALES.find((x) => x.id === state.activeId));
      });
    });
    // Fecha por defecto = hoy
    if (!state.patient.date) {
      const d = new Date().toISOString().slice(0, 10);
      state.patient.date = d;
      const el = document.getElementById('pDate');
      if (el) el.value = d;
    }
  }

  /* ====== Sidebar móvil ==================================== */
  function bindMobileMenu() {
    const sb = document.getElementById('sidebar');
    const ov = document.getElementById('overlay');
    document.getElementById('btnMenu')?.addEventListener('click', () => {
      sb.classList.add('is-open');
      ov.hidden = false;
    });
    ov?.addEventListener('click', closeSidebarMobile);
  }
  function closeSidebarMobile() {
    document.getElementById('sidebar')?.classList.remove('is-open');
    const ov = document.getElementById('overlay');
    if (ov) ov.hidden = true;
  }

  /* ====== Theme ============================================ */
  function bindThemeToggle() {
    document.getElementById('btnTheme')?.addEventListener('click', () => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('vgi_theme', state.theme);
      applyTheme();
    });
  }

  /* ====== Footer actions (exportar/importar/limpiar) ====== */
  function bindGlobalActions() {
    document.getElementById('btnExport')?.addEventListener('click', exportJSON);
    document.getElementById('btnImport')?.addEventListener('click', () => {
      document.getElementById('fileImport')?.click();
    });
    document.getElementById('fileImport')?.addEventListener('change', importJSON);
    document.getElementById('btnClearAll')?.addEventListener('click', clearAll);
  }

  function exportJSON() {
    const dump = {
      patient: state.patient,
      values: state.values,
      timestamp: new Date().toISOString(),
      results: window.VGI_SCALES.map((sc) => {
        const r = computeScale(sc.id);
        return r && r.touched ? { id: sc.id, name: sc.name, score: r.score, max: r.max, label: r.label } : null;
      }).filter(Boolean),
    };
    const blob = new Blob([JSON.stringify(dump, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const name = (state.patient.name || 'paciente').replace(/[^\w]+/g, '_');
    a.download = `vgi_${name}_${state.patient.date || 'sin_fecha'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function importJSON(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (data.patient) Object.assign(state.patient, data.patient);
        if (data.values) state.values = data.values;
        save();
        // refresh
        bindPatientInputs();
        renderNav();
        renderView();
      } catch (err) {
        alert('Archivo no válido.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  function clearAll() {
    if (!confirm('Esto eliminará todas las respuestas y los datos del paciente. ¿Continuar?')) return;
    state.values = {};
    state.patient = { name: '', age: '', sex: '', id: '', date: new Date().toISOString().slice(0, 10) };
    state.activeId = null;
    save();
    bindPatientInputs();
    renderNav();
    renderView();
  }

  /* ====== Utils =========================================== */
  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));
  }

  /* ====== Init ============================================ */
  function init() {
    load();
    applyTheme();
    bindPatientInputs();
    bindMobileMenu();
    bindThemeToggle();
    bindGlobalActions();
    renderNav();
    renderView();
  }
  document.addEventListener('DOMContentLoaded', init);
})();
