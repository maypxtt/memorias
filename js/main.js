/**
 * ==========================================================================
 * PORTFÓLIO & MEMORIAL ESCOLAR — MAYLA
 * Comportamento, Interatividade e Lógica dos Componentes
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // Estado Global da Aplicação
  const state = {
    currentCategory: 'all',
    searchQuery: '',
    viewMode: 'grid', // 'grid' ou 'accordion'
    currentEssayId: 1,
    readerFontSize: 1.15, // em rem
    readerFontFamily: 'serif', // 'serif' ou 'sans'
    filteredEssays: [...ESSAYS_DATA]
  };

  // --------------------------------------------------------------------------
  // 1. GERENCIAMENTO DE TEMA (CLARO / ESCURO)
  // --------------------------------------------------------------------------
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const body = document.body;

  function initTheme() {
    const savedTheme = localStorage.getItem('mayla_theme');
    if (savedTheme) {
      body.classList.remove('light-theme', 'dark-theme');
      body.classList.add(savedTheme);
    } else {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        body.classList.remove('light-theme');
        body.classList.add('dark-theme');
      }
    }
  }

  themeToggleBtn.addEventListener('click', () => {
    if (body.classList.contains('dark-theme')) {
      body.classList.remove('dark-theme');
      body.classList.add('light-theme');
      localStorage.setItem('mayla_theme', 'light-theme');
      showToast('Tema claro ativado');
    } else {
      body.classList.remove('light-theme');
      body.classList.add('dark-theme');
      localStorage.setItem('mayla_theme', 'dark-theme');
      showToast('Tema escuro ativado');
    }
  });

  initTheme();

  // --------------------------------------------------------------------------
  // 2. BARRA DE PROGRESSO DE SCROLL & BOTÃO VOLTAR AO TOPO
  // --------------------------------------------------------------------------
  const progressBar = document.getElementById('scrollProgressBar');
  const backToTopBtn = document.getElementById('backToTopBtn');

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const progress = (scrollTop / (scrollHeight || 1)) * 100;
    
    if (progressBar) {
      progressBar.style.width = `${progress}%`;
    }

    if (backToTopBtn) {
      if (scrollTop > 400) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    }
  }, { passive: true });

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // --------------------------------------------------------------------------
  // 3. MENU DE NAVEGAÇÃO MOBILE (DRAWER)
  // --------------------------------------------------------------------------
  const mobileToggle = document.getElementById('mobileMenuToggle');
  const mobileDrawer = document.getElementById('mobileNavDrawer');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = mobileDrawer.classList.contains('open');
      if (isOpen) {
        mobileDrawer.classList.remove('open');
        mobileDrawer.setAttribute('aria-hidden', 'true');
        mobileToggle.setAttribute('aria-expanded', 'false');
      } else {
        mobileDrawer.classList.add('open');
        mobileDrawer.setAttribute('aria-hidden', 'false');
        mobileToggle.setAttribute('aria-expanded', 'true');
      }
    });

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
        mobileDrawer.setAttribute('aria-hidden', 'true');
        mobileToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // --------------------------------------------------------------------------
  // 4. RENDERIZAÇÃO DAS REDAÇÕES (CARDS & ACORDEÃO)
  // --------------------------------------------------------------------------
  const essaysGrid = document.getElementById('essaysGrid');
  const essaysAccordion = document.getElementById('essaysAccordion');
  const noResultsState = document.getElementById('noResultsState');
  const resultsCountText = document.getElementById('resultsCountText');
  const activeFilterBadge = document.getElementById('activeFilterBadge');

  function renderEssays() {
    const list = state.filteredEssays;

    // Atualiza contadores e estado de visualização vazia
    if (resultsCountText) {
      resultsCountText.textContent = `Mostrando ${list.length} de ${ESSAYS_DATA.length} redações`;
    }

    if (list.length === 0) {
      essaysGrid.style.display = 'none';
      essaysAccordion.style.display = 'none';
      noResultsState.style.display = 'block';
      return;
    }

    noResultsState.style.display = 'none';

    if (state.viewMode === 'grid') {
      essaysGrid.style.display = 'grid';
      essaysAccordion.style.display = 'none';
      renderGridMode(list);
    } else {
      essaysGrid.style.display = 'none';
      essaysAccordion.style.display = 'flex';
      renderAccordionMode(list);
    }
  }

  // Renderização em Cards
  function renderGridMode(essays) {
    essaysGrid.innerHTML = essays.map(essay => {
      const repChips = essay.repertory.map(r => `<span class="rep-chip">${escapeHtml(r)}</span>`).join('');
      
      return `
        <article class="essay-card" style="--card-accent-color: ${essay.themeColor};" data-essay-id="${essay.id}">
          <div class="card-top-bar" aria-hidden="true"></div>
          <div class="essay-card-body">
            <div class="card-header-tags">
              <span class="essay-num-badge">Redação #${essay.number}</span>
              <span class="essay-category-badge">${escapeHtml(essay.category)}</span>
            </div>
            
            <h3 class="essay-card-title" title="${escapeHtml(essay.title)}">${escapeHtml(essay.title)}</h3>
            
            <p class="essay-card-summary">${escapeHtml(essay.summary)}</p>
            
            <div class="card-repertory-chips">
              ${repChips}
            </div>
          </div>

          <div class="essay-card-footer">
            <div class="essay-meta-specs">
              <span>⏱ ${essay.readingTime}</span>
              <span>•</span>
              <span>${essay.wordCount} palavras</span>
            </div>
            <button class="read-essay-btn" onclick="window.openEssayModal(${essay.id})" aria-label="Ler redação completa: ${escapeHtml(essay.title)}">
              <span>Ler redação</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="arrow-icon">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        </article>
      `;
    }).join('');
  }

  // Renderização em Acordeão / Leitor Sanfonado
  function renderAccordionMode(essays) {
    essaysAccordion.innerHTML = essays.map((essay, idx) => {
      const parasHtml = essay.paragraphs.map(p => `<p>${escapeHtml(p)}</p>`).join('');
      const repChips = essay.repertory.map(r => `<span class="rep-chip">${escapeHtml(r)}</span>`).join('');

      return `
        <div class="accordion-item" id="accordionItem-${essay.id}" data-essay-id="${essay.id}">
          <button class="accordion-trigger" onclick="window.toggleAccordion(${essay.id})" aria-expanded="false" aria-controls="accordionBody-${essay.id}">
            <div class="accordion-title-group">
              <span class="accordion-num" style="color: ${essay.themeColor};">${essay.number}</span>
              <div class="accordion-text">
                <h4>${escapeHtml(essay.title)}</h4>
                <div class="accordion-sub">
                  <span>${escapeHtml(essay.category)}</span>
                  <span>•</span>
                  <span>⏱ ${essay.readingTime}</span>
                  <span>•</span>
                  <span>${essay.wordCount} palavras</span>
                </div>
              </div>
            </div>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="accordion-chevron">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
          
          <div class="accordion-content" id="accordionBody-${essay.id}">
            <div class="article-repertory-box" style="margin-top: 1rem;">
              <span class="rep-label">Repertórios em destaque:</span>
              <div class="rep-chips">${repChips}</div>
            </div>

            <div class="accordion-body-text">
              ${parasHtml}
            </div>

            <div class="accordion-actions-bar">
              <span class="essay-specs">${essay.wordCount} palavras • Modelo Dissertativo</span>
              <button class="btn btn-secondary" onclick="window.openEssayModal(${essay.id})">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="btn-icon">
                  <path d="M15 3h6v6M14 10l6.1-6.1M9 21H3v-6M10 14l-6.1 6.1"></path>
                </svg>
                Abrir no Modo Leitura
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Alternar acordeão individual
  window.toggleAccordion = function(id) {
    const item = document.getElementById(`accordionItem-${id}`);
    if (!item) return;
    const trigger = item.querySelector('.accordion-trigger');
    const isOpen = item.classList.contains('open');

    // Fecha outros acordeões se desejar foco único
    document.querySelectorAll('.accordion-item.open').forEach(el => {
      if (el !== item) {
        el.classList.remove('open');
        el.querySelector('.accordion-trigger')?.setAttribute('aria-expanded', 'false');
      }
    });

    if (isOpen) {
      item.classList.remove('open');
      trigger.setAttribute('aria-expanded', 'false');
    } else {
      item.classList.add('open');
      trigger.setAttribute('aria-expanded', 'true');
    }
  };

  // --------------------------------------------------------------------------
  // 5. FILTRAGEM E BUSCA EM TEMPO REAL
  // --------------------------------------------------------------------------
  const searchInput = document.getElementById('essaySearchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  const filterPills = document.querySelectorAll('.filter-pill');
  const resetSearchBtn = document.getElementById('resetSearchBtn');

  function applyFiltersAndSearch() {
    const query = state.searchQuery.trim().toLowerCase();
    const category = state.currentCategory;

    state.filteredEssays = ESSAYS_DATA.filter(essay => {
      // Filtro por Categoria
      const matchesCategory = (category === 'all') || (essay.categoryKey === category);
      if (!matchesCategory) return false;

      // Filtro por Busca Textual
      if (!query) return true;

      const titleMatch = essay.title.toLowerCase().includes(query);
      const summaryMatch = essay.summary.toLowerCase().includes(query);
      const categoryMatch = essay.category.toLowerCase().includes(query);
      const repertoryMatch = essay.repertory.some(r => r.toLowerCase().includes(query));
      const fullTextMatch = essay.fullText.toLowerCase().includes(query);

      return titleMatch || summaryMatch || categoryMatch || repertoryMatch || fullTextMatch;
    });

    // Atualiza badge de filtro ativo
    if (activeFilterBadge) {
      if (category !== 'all' || query) {
        activeFilterBadge.style.display = 'inline-block';
        let badgeText = [];
        if (category !== 'all') {
          const pill = document.querySelector(`.filter-pill[data-category="${category}"]`);
          badgeText.push(`Tema: ${pill ? pill.textContent.trim().split(' ')[1] : category}`);
        }
        if (query) {
          badgeText.push(`Busca: "${query}"`);
        }
        activeFilterBadge.textContent = badgeText.join(' | ');
      } else {
        activeFilterBadge.style.display = 'none';
      }
    }

    renderEssays();
  }

  // Eventos de Busca
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      if (clearSearchBtn) {
        clearSearchBtn.style.display = state.searchQuery ? 'flex' : 'none';
      }
      applyFiltersAndSearch();
    });
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      searchInput.value = '';
      state.searchQuery = '';
      clearSearchBtn.style.display = 'none';
      searchInput.focus();
      applyFiltersAndSearch();
    });
  }

  if (resetSearchBtn) {
    resetSearchBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      state.searchQuery = '';
      state.currentCategory = 'all';
      if (clearSearchBtn) clearSearchBtn.style.display = 'none';
      
      filterPills.forEach(p => p.classList.toggle('active', p.getAttribute('data-category') === 'all'));
      applyFiltersAndSearch();
    });
  }

  // Eventos de Filtro por Categoria
  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      state.currentCategory = pill.getAttribute('data-category') || 'all';
      applyFiltersAndSearch();
    });
  });

  // Alternador de Visualização (Cards vs Acordeão)
  const viewGridBtn = document.getElementById('viewGridBtn');
  const viewAccordionBtn = document.getElementById('viewAccordionBtn');

  if (viewGridBtn && viewAccordionBtn) {
    viewGridBtn.addEventListener('click', () => {
      state.viewMode = 'grid';
      viewGridBtn.classList.add('active');
      viewGridBtn.setAttribute('aria-pressed', 'true');
      viewAccordionBtn.classList.remove('active');
      viewAccordionBtn.setAttribute('aria-pressed', 'false');
      renderEssays();
    });

    viewAccordionBtn.addEventListener('click', () => {
      state.viewMode = 'accordion';
      viewAccordionBtn.classList.add('active');
      viewAccordionBtn.setAttribute('aria-pressed', 'true');
      viewGridBtn.classList.remove('active');
      viewGridBtn.setAttribute('aria-pressed', 'false');
      renderEssays();
    });
  }

  // --------------------------------------------------------------------------
  // 6. MODAL DO MODO LEITURA ("READER MODE")
  // --------------------------------------------------------------------------
  const essayModal = document.getElementById('essayModal');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const modalScrollBody = document.getElementById('modalScrollBody');

  const modalEssayNumber = document.getElementById('modalEssayNumber');
  const modalEssayCategory = document.getElementById('modalEssayCategory');
  const modalEssayReadTime = document.getElementById('modalEssayReadTime');
  const modalEssayTitle = document.getElementById('modalEssayTitle');
  const modalEssayRepertory = document.getElementById('modalEssayRepertory');
  const modalEssaySummary = document.getElementById('modalEssaySummary');
  const modalEssayText = document.getElementById('modalEssayText');
  const modalEssayWordCount = document.getElementById('modalEssayWordCount');

  const prevEssayBtn = document.getElementById('prevEssayBtn');
  const nextEssayBtn = document.getElementById('nextEssayBtn');
  const prevEssayTitlePreview = document.getElementById('prevEssayTitlePreview');
  const nextEssayTitlePreview = document.getElementById('nextEssayTitlePreview');
  const modalPositionIndicator = document.getElementById('modalPositionIndicator');

  // Abre Modal com a Redação Solicitada
  window.openEssayModal = function(id) {
    state.currentEssayId = id;
    const essay = ESSAYS_DATA.find(e => e.id === id);
    if (!essay) return;

    modalEssayNumber.textContent = `Redação #${essay.number}`;
    modalEssayCategory.textContent = essay.category;
    modalEssayReadTime.textContent = `${essay.readingTime} de leitura`;
    modalEssayTitle.textContent = essay.title;
    modalEssaySummary.textContent = essay.summary;
    modalEssayWordCount.textContent = `${essay.wordCount} palavras`;

    // Repertórios
    modalEssayRepertory.innerHTML = essay.repertory
      .map(r => `<span class="rep-chip">${escapeHtml(r)}</span>`)
      .join('');

    // Parágrafos
    modalEssayText.innerHTML = essay.paragraphs
      .map(p => `<p>${escapeHtml(p)}</p>`)
      .join('');

    // Ajusta navegação anterior / próxima
    updateModalNav();

    // Reset de scroll
    if (modalScrollBody) modalScrollBody.scrollTop = 0;

    // Abre
    essayModal.classList.add('open');
    essayModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  function closeModal() {
    essayModal.classList.remove('open');
    essayModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);

  // Navegação Prev / Next no Modal
  function updateModalNav() {
    const currentIndex = ESSAYS_DATA.findIndex(e => e.id === state.currentEssayId);
    if (currentIndex === -1) return;

    modalPositionIndicator.textContent = `${currentIndex + 1} de ${ESSAYS_DATA.length}`;

    // Anterior
    if (currentIndex > 0) {
      const prevEssay = ESSAYS_DATA[currentIndex - 1];
      prevEssayBtn.style.visibility = 'visible';
      prevEssayTitlePreview.textContent = `#${prevEssay.number} — ${prevEssay.title}`;
      prevEssayBtn.onclick = () => window.openEssayModal(prevEssay.id);
    } else {
      prevEssayBtn.style.visibility = 'hidden';
    }

    // Próximo
    if (currentIndex < ESSAYS_DATA.length - 1) {
      const nextEssay = ESSAYS_DATA[currentIndex + 1];
      nextEssayBtn.style.visibility = 'visible';
      nextEssayTitlePreview.textContent = `#${nextEssay.number} — ${nextEssay.title}`;
      nextEssayBtn.onclick = () => window.openEssayModal(nextEssay.id);
    } else {
      nextEssayBtn.style.visibility = 'hidden';
    }
  }

  // Ferramentas de Leitura (Fonte A- / A+ / Família / Copiar / Imprimir)
  const fontDecBtn = document.getElementById('fontDecBtn');
  const fontIncBtn = document.getElementById('fontIncBtn');
  const fontFamilyToggle = document.getElementById('fontFamilyToggle');
  const copyEssayBtn = document.getElementById('copyEssayBtn');
  const printEssayBtn = document.getElementById('printEssayBtn');

  if (fontDecBtn) {
    fontDecBtn.addEventListener('click', () => {
      if (state.readerFontSize > 0.95) {
        state.readerFontSize -= 0.1;
        modalEssayText.style.fontSize = `${state.readerFontSize}rem`;
      }
    });
  }

  if (fontIncBtn) {
    fontIncBtn.addEventListener('click', () => {
      if (state.readerFontSize < 1.6) {
        state.readerFontSize += 0.1;
        modalEssayText.style.fontSize = `${state.readerFontSize}rem`;
      }
    });
  }

  if (fontFamilyToggle) {
    fontFamilyToggle.addEventListener('click', () => {
      const label = fontFamilyToggle.querySelector('.font-toggle-label');
      if (state.readerFontFamily === 'serif') {
        state.readerFontFamily = 'sans';
        modalEssayText.classList.add('font-sans-mode');
        if (label) label.textContent = 'Sans';
      } else {
        state.readerFontFamily = 'serif';
        modalEssayText.classList.remove('font-sans-mode');
        if (label) label.textContent = 'Serif';
      }
    });
  }

  if (copyEssayBtn) {
    copyEssayBtn.addEventListener('click', () => {
      const essay = ESSAYS_DATA.find(e => e.id === state.currentEssayId);
      if (!essay) return;

      const fullFormatted = `REDAÇÃO #${essay.number} — ${essay.title}\nAutora: Mayla (3º Ano EM - C. E. Padre Cláudio Morelli)\n\n${essay.fullText}`;

      navigator.clipboard.writeText(fullFormatted)
        .then(() => {
          showToast(`Redação #${essay.number} copiada com sucesso!`);
        })
        .catch(() => {
          // Fallback para seleção de texto
          const range = document.createRange();
          range.selectNodeContents(modalEssayText);
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
          showToast('Texto selecionado. Pressione Ctrl+C para copiar.');
        });
    });
  }

  if (printEssayBtn) {
    printEssayBtn.addEventListener('click', () => {
      window.print();
    });
  }

  // --------------------------------------------------------------------------
  // 7. LIGHTBOX PARA FOTOS E EVIDÊNCIAS VISUAIS
  // --------------------------------------------------------------------------
  const photoLightbox = document.getElementById('photoLightbox');
  const lightboxBackdrop = document.getElementById('lightboxBackdrop');
  const closeLightboxBtn = document.getElementById('closeLightboxBtn');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');

  function openLightbox(src, caption) {
    lightboxImg.src = src;
    lightboxCaption.textContent = caption || '';
    photoLightbox.classList.add('open');
    photoLightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    photoLightbox.classList.remove('open');
    photoLightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (closeLightboxBtn) closeLightboxBtn.addEventListener('click', closeLightbox);
  if (lightboxBackdrop) lightboxBackdrop.addEventListener('click', closeLightbox);

  // Adiciona evento de clique nas fotos da galeria e fotos com data-zoomable
  document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      const photoSrc = item.getAttribute('data-photo');
      const caption = item.getAttribute('data-caption');
      openLightbox(photoSrc, caption);
    });
  });

  document.querySelectorAll('img[data-zoomable]').forEach(img => {
    img.addEventListener('click', () => {
      openLightbox(img.src, img.alt);
    });
  });

  // --------------------------------------------------------------------------
  // 8. ACESSIBILIDADE DE TECLADO (ESC PARA FECHAR, SETAS PARA NAVEGAR)
  // --------------------------------------------------------------------------
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (essayModal.classList.contains('open')) closeModal();
      if (photoLightbox.classList.contains('open')) closeLightbox();
      if (mobileDrawer && mobileDrawer.classList.contains('open')) {
        mobileDrawer.classList.remove('open');
      }
    }

    if (essayModal.classList.contains('open')) {
      if (e.key === 'ArrowLeft') {
        const curIdx = ESSAYS_DATA.findIndex(e => e.id === state.currentEssayId);
        if (curIdx > 0) window.openEssayModal(ESSAYS_DATA[curIdx - 1].id);
      } else if (e.key === 'ArrowRight') {
        const curIdx = ESSAYS_DATA.findIndex(e => e.id === state.currentEssayId);
        if (curIdx < ESSAYS_DATA.length - 1) window.openEssayModal(ESSAYS_DATA[curIdx + 1].id);
      }
    }
  });

  // --------------------------------------------------------------------------
  // 9. TOAST DE FEEDBACK
  // --------------------------------------------------------------------------
  const toastNotification = document.getElementById('toastNotification');
  const toastMessage = document.getElementById('toastMessage');
  let toastTimer = null;

  function showToast(msg) {
    if (!toastNotification || !toastMessage) return;
    toastMessage.textContent = msg;
    toastNotification.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastNotification.classList.remove('show');
    }, 3200);
  }

  // --------------------------------------------------------------------------
  // 10. FUNÇÕES UTILITÁRIAS
  // --------------------------------------------------------------------------
  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Inicializa a renderização das redações
  renderEssays();
});
