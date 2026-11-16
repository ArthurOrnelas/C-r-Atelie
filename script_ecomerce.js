/* =====================================================
   Barro Vivo Cerâmica — interatividade
   - Menu hambúrguer responsivo
   - Vitrine com filtro por categoria
   - Carrinho (drawer) com quantidade, subtotal e frete grátis
   - Slider de depoimentos (setas, bolinhas, swipe, autoplay)
   - Formulário de contato com validação e mensagens de erro
   - Animações ao rolar a página
   ===================================================== */

(() => {
  'use strict';

  /* ---------- Dados ---------- */
  const CATEGORIAS = {
    vasos: 'Vasos',
    canecas: 'Canecas',
    mesa: 'Mesa posta',
    cozinha: 'Cozinha',
    plantas: 'Plantas',
  };

  const PRODUTOS = [
    { id: 1,  nome: 'Vaso Duna',      cat: 'vasos',   tipo: 'vase',    preco: 189.00, c1: '#C98B5E', c2: '#A8683F', desc: 'Esmalte areia com faixas texturizadas.' },
    { id: 2,  nome: 'Vaso Oliva',     cat: 'vasos',   tipo: 'vase',    preco: 214.00, c1: '#7A8B6F', c2: '#5C6B52', desc: 'Verde-oliva fosco, ótimo para ramos secos.', selo: 'Novo' },
    { id: 3,  nome: 'Vaso Noite',     cat: 'vasos',   tipo: 'vase',    preco: 239.00, c1: '#2F3E4E', c2: '#1F2B37', desc: 'Azul profundo com brilho suave.' },
    { id: 4,  nome: 'Caneca Manhã',   cat: 'canecas', tipo: 'mug',     preco: 79.90,  c1: '#F1E4CF', c2: '#C4623A', desc: 'Creme com friso terracota, 300 ml.' },
    { id: 5,  nome: 'Caneca Brasa',   cat: 'canecas', tipo: 'mug',     preco: 84.90,  c1: '#C4623A', c2: '#8E3F22', desc: 'Terracota intenso, 300 ml.', selo: 'Mais vendido' },
    { id: 6,  nome: 'Tigela Cacau',   cat: 'mesa',    tipo: 'bowl',    preco: 98.00,  c1: '#6B4A3A', c2: '#4A3025', desc: 'Funda, ideal para sopas e açaí.' },
    { id: 7,  nome: 'Tigela Areia',   cat: 'mesa',    tipo: 'bowl',    preco: 98.00,  c1: '#E8D9C5', c2: '#C9B08A', desc: 'Tom neutro que combina com tudo.' },
    { id: 8,  nome: 'Prato Lua',      cat: 'mesa',    tipo: 'plate',   preco: 129.00, c1: '#F4EDE2', c2: '#D9C7AA', desc: 'Prato raso com borda levemente irregular.' },
    { id: 9,  nome: 'Pote Trigo',     cat: 'cozinha', tipo: 'jar',     preco: 119.00, c1: '#D8B26E', c2: '#B38B45', desc: 'Pote com tampa para mantimentos.' },
    { id: 10, nome: 'Pote Argila',    cat: 'cozinha', tipo: 'jar',     preco: 129.00, c1: '#A8683F', c2: '#7E4B2B', desc: 'Argila natural, acabamento rústico.', selo: 'Novo' },
    { id: 11, nome: 'Cachepô Folha',  cat: 'plantas', tipo: 'planter', preco: 109.00, c1: '#D9895F', c2: '#B0643E', desc: 'Para plantas de até 15 cm de vaso.' },
    { id: 12, nome: 'Cachepô Musgo',  cat: 'plantas', tipo: 'planter', preco: 109.00, c1: '#7A8B6F', c2: '#5C6B52', desc: 'Verde suave que valoriza a folhagem.' },
  ];

  const FRETE_GRATIS = 300;
  const MAX_QTD = 10;
  const STORE_KEY = 'barrovivo-carrinho';

  /* ---------- Utilidades ---------- */
  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));
  const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const reduzMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const porId = (id) => PRODUTOS.find((p) => p.id === Number(id));

  const pecaSVG = (p) =>
    `<svg viewBox="0 0 200 200" role="img" aria-label="${p.nome}" style="--c1:${p.c1};--c2:${p.c2}"><use href="#p-${p.tipo}"/></svg>`;

  /* ---------- Toast ---------- */
  const toastEl = $('#toast');
  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2600);
  }

  /* =====================================================
     MENU HAMBÚRGUER
     ===================================================== */
  const header = $('.site-header');
  const navToggle = $('#navToggle');
  const nav = $('#menu');

  function setMenu(aberto) {
    nav.classList.toggle('open', aberto);
    navToggle.setAttribute('aria-expanded', String(aberto));
    navToggle.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
  }

  navToggle.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('open')) { setMenu(false); navToggle.focus(); }
  });
  document.addEventListener('click', (e) => {
    if (nav.classList.contains('open') && !e.target.closest('.site-header')) setMenu(false);
  });
  window.matchMedia('(min-width: 769px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });

  // Sombra no cabeçalho ao rolar
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* =====================================================
     VITRINE DE PRODUTOS
     ===================================================== */
  const grid = $('#productGrid');
  const countEl = $('#resultsCount');
  const filtersEl = $('#filters');
  let filtroAtual = 'todos';

  function renderProdutos() {
    const lista = filtroAtual === 'todos' ? PRODUTOS : PRODUTOS.filter((p) => p.cat === filtroAtual);

    grid.innerHTML = lista.map((p, i) => `
      <article class="card" style="--i:${i}">
        <div class="card-media">
          ${p.selo ? `<span class="badge">${p.selo}</span>` : ''}
          ${pecaSVG(p)}
        </div>
        <div class="card-body">
          <p class="card-cat">${CATEGORIAS[p.cat]}</p>
          <h3>${p.nome}</h3>
          <p class="card-desc">${p.desc}</p>
          <p class="price">${brl.format(p.preco)}<small>ou 3x de ${brl.format(p.preco / 3)}</small></p>
          <button type="button" class="btn btn-primary btn-block" data-add="${p.id}" aria-label="Adicionar ${p.nome} ao carrinho">Adicionar ao carrinho</button>
        </div>
      </article>`).join('');

    const nome = filtroAtual === 'todos' ? 'todas as categorias' : CATEGORIAS[filtroAtual];
    countEl.textContent = `Mostrando ${lista.length} ${lista.length === 1 ? 'produto' : 'produtos'} em ${nome}.`;
  }

  filtersEl.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    filtroAtual = chip.dataset.filter;
    $$('.chip', filtersEl).forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
    renderProdutos();
  });

  grid.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-add]');
    if (!btn) return;
    adicionar(btn.dataset.add);

    // feedback visual no botão
    const original = btn.textContent;
    btn.textContent = 'Adicionado ✓';
    btn.classList.add('is-done');
    setTimeout(() => { btn.textContent = original; btn.classList.remove('is-done'); }, 1300);
  });

  /* =====================================================
     CARRINHO
     ===================================================== */
  const cartEl = $('#cart');
  const overlay = $('#overlay');
  const cartOpenBtn = $('#cartOpen');
  const cartCloseBtn = $('#cartClose');
  const cartItemsEl = $('#cartItems');
  const cartEmptyEl = $('#cartEmpty');
  const cartTotalEl = $('#cartTotal');
  const cartCountEl = $('#cartCount');
  const shippingText = $('#shippingText');
  const shippingBar = $('#shippingBar');
  const checkoutBtn = $('#checkoutBtn');
  let ultimoFoco = null;

  function carregarCarrinho() {
    try {
      const bruto = localStorage.getItem(STORE_KEY);
      const dados = bruto ? JSON.parse(bruto) : {};
      const limpo = {};
      Object.keys(dados || {}).forEach((id) => {
        const qtd = Number(dados[id]);
        if (porId(id) && qtd > 0) limpo[id] = Math.min(qtd, MAX_QTD);
      });
      return limpo;
    } catch (_) {
      return {};
    }
  }

  function salvarCarrinho() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(carrinho)); } catch (_) { /* sem armazenamento: segue em memória */ }
  }

  let carrinho = carregarCarrinho();

  function adicionar(id) {
    const p = porId(id);
    if (!p) return;
    if ((carrinho[p.id] || 0) >= MAX_QTD) {
      toast(`Limite de ${MAX_QTD} unidades por produto.`);
      return;
    }
    carrinho[p.id] = (carrinho[p.id] || 0) + 1;
    salvarCarrinho();
    renderCarrinho();
    toast(`${p.nome} foi para o carrinho`);
    cartOpenBtn.classList.remove('bump');
    void cartOpenBtn.offsetWidth; // reinicia a animação
    cartOpenBtn.classList.add('bump');
  }

  function alterarQtd(id, delta) {
    const nova = (carrinho[id] || 0) + delta;
    if (nova <= 0) delete carrinho[id];
    else carrinho[id] = Math.min(nova, MAX_QTD);
    salvarCarrinho();
    renderCarrinho();
  }

  function remover(id) {
    delete carrinho[id];
    salvarCarrinho();
    renderCarrinho();
  }

  function renderCarrinho() {
    const ids = Object.keys(carrinho);
    const totalItens = ids.reduce((s, id) => s + carrinho[id], 0);
    const subtotal = ids.reduce((s, id) => s + porId(id).preco * carrinho[id], 0);

    cartCountEl.textContent = totalItens;
    cartOpenBtn.setAttribute('aria-label', `Abrir carrinho, ${totalItens} ${totalItens === 1 ? 'item' : 'itens'}`);
    cartTotalEl.textContent = brl.format(subtotal);
    cartEmptyEl.hidden = ids.length > 0;
    checkoutBtn.disabled = ids.length === 0;
    checkoutBtn.style.opacity = ids.length === 0 ? '.5' : '1';

    cartItemsEl.innerHTML = ids.map((id) => {
      const p = porId(id);
      const q = carrinho[id];
      return `
        <li class="cart-item">
          <div class="cart-thumb">${pecaSVG(p)}</div>
          <div class="cart-info">
            <h3>${p.nome}</h3>
            <p>${brl.format(p.preco)}</p>
            <div class="qty" role="group" aria-label="Quantidade de ${p.nome}">
              <button type="button" data-action="dec" data-id="${p.id}" aria-label="Diminuir quantidade de ${p.nome}">−</button>
              <span>${q}</span>
              <button type="button" data-action="inc" data-id="${p.id}" aria-label="Aumentar quantidade de ${p.nome}">+</button>
            </div>
          </div>
          <button type="button" class="remove" data-action="remove" data-id="${p.id}" aria-label="Remover ${p.nome} do carrinho">×</button>
        </li>`;
    }).join('');

    // Barra de frete grátis
    const falta = FRETE_GRATIS - subtotal;
    if (ids.length === 0) {
      shippingText.textContent = `Frete grátis em compras acima de ${brl.format(FRETE_GRATIS)}.`;
    } else if (falta > 0) {
      shippingText.textContent = `Faltam ${brl.format(falta)} para ganhar frete grátis.`;
    } else {
      shippingText.textContent = 'Você ganhou frete grátis!';
    }
    shippingBar.style.width = `${Math.min(100, (subtotal / FRETE_GRATIS) * 100)}%`;
  }

  cartItemsEl.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const { action, id } = btn.dataset;
    if (action === 'inc') alterarQtd(id, 1);
    if (action === 'dec') alterarQtd(id, -1);
    if (action === 'remove') remover(id);
  });

  function abrirCarrinho() {
    ultimoFoco = document.activeElement;
    cartEl.classList.add('open');
    cartEl.setAttribute('aria-hidden', 'false');
    overlay.classList.add('show');
    document.body.classList.add('no-scroll');
    setTimeout(() => cartCloseBtn.focus(), 50);
  }

  function fecharCarrinho() {
    cartEl.classList.remove('open');
    cartEl.setAttribute('aria-hidden', 'true');
    overlay.classList.remove('show');
    document.body.classList.remove('no-scroll');
    if (ultimoFoco) ultimoFoco.focus();
  }

  cartOpenBtn.addEventListener('click', abrirCarrinho);
  cartCloseBtn.addEventListener('click', fecharCarrinho);
  overlay.addEventListener('click', fecharCarrinho);

  document.addEventListener('keydown', (e) => {
    if (!cartEl.classList.contains('open')) return;
    if (e.key === 'Escape') { fecharCarrinho(); return; }
    if (e.key === 'Tab') { // mantém o foco dentro do carrinho
      const focaveis = $$('button:not([disabled])', cartEl);
      if (!focaveis.length) return;
      const primeiro = focaveis[0];
      const ultimo = focaveis[focaveis.length - 1];
      if (e.shiftKey && document.activeElement === primeiro) { e.preventDefault(); ultimo.focus(); }
      else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primeiro.focus(); }
    }
  });

  checkoutBtn.addEventListener('click', () => {
    toast('Protótipo: a finalização da compra ainda não foi implementada.');
  });

  /* =====================================================
     SLIDER DE DEPOIMENTOS
     ===================================================== */
  (function iniciarSlider() {
    const root = $('#slider');
    const track = $('.slides', root);
    const slides = $$('.slide', root);
    const dotsEl = $('#dots');
    let atual = 0;
    let timer = null;

    const dots = slides.map((_, n) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'dot';
      b.setAttribute('aria-label', `Ir para o depoimento ${n + 1}`);
      b.addEventListener('click', () => ir(n, true));
      dotsEl.appendChild(b);
      return b;
    });

    function ir(n, manual) {
      atual = (n + slides.length) % slides.length;
      track.style.transform = `translateX(-${atual * 100}%)`;
      slides.forEach((s, k) => s.setAttribute('aria-hidden', String(k !== atual)));
      dots.forEach((d, k) => d.setAttribute('aria-current', String(k === atual)));
      if (manual) reiniciar();
    }

    function iniciar() {
      if (reduzMovimento) return;
      parar();
      timer = setInterval(() => ir(atual + 1), 6500);
    }
    function parar() { clearInterval(timer); timer = null; }
    function reiniciar() { parar(); iniciar(); }

    $('#prevSlide').addEventListener('click', () => ir(atual - 1, true));
    $('#nextSlide').addEventListener('click', () => ir(atual + 1, true));

    root.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') ir(atual - 1, true);
      if (e.key === 'ArrowRight') ir(atual + 1, true);
    });

    // pausa quando o usuário interage
    root.addEventListener('mouseenter', parar);
    root.addEventListener('mouseleave', iniciar);
    root.addEventListener('focusin', parar);
    root.addEventListener('focusout', iniciar);

    // swipe no celular
    let x0 = null;
    root.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
    root.addEventListener('touchend', (e) => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 50) ir(atual + (dx < 0 ? 1 : -1), true);
      x0 = null;
    });

    ir(0);
    iniciar();
  })();

  /* =====================================================
     FORMULÁRIO DE CONTATO (validação)
     ===================================================== */
  (function iniciarFormulario() {
    const form = $('#contactForm');
    const successEl = $('#formSuccess');
    const submitBtn = $('#submitBtn');
    const msgInput = $('#mensagem');
    const contador = $('#mensagem-contador');

    const regras = {
      nome(v) {
        const t = v.trim();
        if (!t) return 'Informe seu nome.';
        if (t.length < 3) return 'O nome deve ter pelo menos 3 caracteres.';
        if (!/^[\p{L}][\p{L}\s'.-]*$/u.test(t)) return 'Use apenas letras no nome.';
        return '';
      },
      email(v) {
        const t = v.trim();
        if (!t) return 'Informe seu e-mail.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(t)) return 'Digite um e-mail válido, como nome@exemplo.com.';
        return '';
      },
      assunto(v) {
        return v ? '' : 'Escolha um assunto.';
      },
      mensagem(v) {
        const t = v.trim();
        if (!t) return 'Escreva sua mensagem.';
        if (t.length < 10) return 'A mensagem precisa ter pelo menos 10 caracteres.';
        return '';
      },
    };

    function validarCampo(campo) {
      const wrap = campo.closest('.field');
      const erroEl = $(`#${campo.id}-erro`);
      const erro = regras[campo.name](campo.value);
      wrap.classList.toggle('invalid', Boolean(erro));
      wrap.classList.toggle('valid', !erro);
      campo.setAttribute('aria-invalid', String(Boolean(erro)));
      erroEl.textContent = erro;
      return !erro;
    }

    const campos = $$('input, select, textarea', form);

    // valida ao sair do campo e, depois de tocado, enquanto digita
    campos.forEach((campo) => {
      campo.addEventListener('blur', () => { campo.dataset.tocado = '1'; validarCampo(campo); });
      const aoMudar = () => { if (campo.dataset.tocado) validarCampo(campo); };
      campo.addEventListener('input', aoMudar);
      campo.addEventListener('change', aoMudar);
    });

    msgInput.addEventListener('input', () => {
      contador.textContent = `${msgInput.value.length}/${msgInput.maxLength}`;
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      successEl.hidden = true;

      let primeiroInvalido = null;
      campos.forEach((campo) => {
        campo.dataset.tocado = '1';
        if (!validarCampo(campo) && !primeiroInvalido) primeiroInvalido = campo;
      });

      if (primeiroInvalido) {
        primeiroInvalido.focus();
        return;
      }

      // Simula o envio (protótipo, sem servidor)
      const nome = $('#nome').value.trim().split(/\s+/)[0];
      submitBtn.disabled = true;
      submitBtn.textContent = 'Enviando…';

      setTimeout(() => {
        form.reset();
        campos.forEach((c) => {
          delete c.dataset.tocado;
          c.removeAttribute('aria-invalid');
          c.closest('.field').classList.remove('valid', 'invalid');
        });
        contador.textContent = `0/${msgInput.maxLength}`;
        submitBtn.disabled = false;
        submitBtn.textContent = 'Enviar mensagem';
        successEl.textContent = `Obrigado, ${nome}! Recebemos sua mensagem e responderemos em breve.`;
        successEl.hidden = false;
      }, 700);
    });
  })();

  /* =====================================================
     ANIMAÇÃO AO ROLAR + LINK ATIVO NO MENU
     ===================================================== */
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !reduzMovimento) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('is-visible'); obs.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    reveals.forEach((el, i) => {
      el.style.transitionDelay = `${(i % 4) * 70}ms`;
      io.observe(el);
    });
  } else {
    reveals.forEach((el) => el.classList.add('is-visible'));
  }

  if ('IntersectionObserver' in window) {
    const links = $$('.nav a');
    const secoes = links.map((a) => $(a.getAttribute('href'))).filter(Boolean);
    const ioNav = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        links.forEach((a) => {
          if (a.getAttribute('href') === `#${en.target.id}`) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    secoes.forEach((s) => ioNav.observe(s));
  }

  /* ---------- Início ---------- */
  $('#year').textContent = new Date().getFullYear();
  renderProdutos();
  renderCarrinho();
})();
