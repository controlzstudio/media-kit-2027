import { textos, type Idioma } from '../data/conteudo';
import { formatar, percentual, type Formato } from './formato';

const CHAVE_IDIOMA = 'mediakit-idioma';
const semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let idioma: Idioma = 'pt';

// "cards.0.titulo" → valor no dicionário
function buscar(caminho: string, dic: unknown): string {
  const valor = caminho.split('.').reduce<unknown>((acc, parte) => (acc as Record<string, unknown>)?.[parte], dic);
  return typeof valor === 'string' ? valor : '';
}

function textoIdade(de: string, ate: string): string {
  return textos[idioma].ageText.replace('{a}', de).replace('{b}', ate);
}

/* Idioma */

function aplicarIdioma(novo: Idioma) {
  idioma = novo;
  const t = textos[novo];
  document.documentElement.lang = novo === 'pt' ? 'pt-BR' : 'en';
  document.title = t.metaTitle;
  document.querySelector('meta[name="description"]')?.setAttribute('content', t.metaDescription);

  document.querySelectorAll<HTMLElement>('[data-t]').forEach((el) => {
    el.textContent = buscar(el.dataset.t!, t);
  });
  document.querySelectorAll<HTMLElement>('[data-t-html]').forEach((el) => {
    el.innerHTML = buscar(el.dataset.tHtml!, t);
  });
  document.querySelectorAll<HTMLElement>('[data-t-attr]').forEach((el) => {
    el.dataset.tAttr!.split(';').forEach((par) => {
      const [attr, chave] = par.split(':');
      el.setAttribute(attr, buscar(chave, t));
    });
  });
  // Números que não estão animando no momento
  document.querySelectorAll<HTMLElement>('[data-num]').forEach((el) => {
    if (el.dataset.animando) return;
    el.textContent = formatar(Number(el.dataset.num), el.dataset.fmt as Formato, novo);
  });
  const selecionada = document.querySelector<HTMLElement>('.coluna[aria-selected="true"]');
  const texto = document.querySelector<HTMLElement>('[data-idade-texto]');
  if (selecionada && texto) texto.textContent = textoIdade(selecionada.dataset.de!, selecionada.dataset.ate!);

  document.querySelectorAll<HTMLButtonElement>('[data-lang]').forEach((b) => {
    b.setAttribute('aria-pressed', String(b.dataset.lang === novo));
  });
}

function iniciarIdioma() {
  let salvo: string | null = null;
  try {
    salvo = localStorage.getItem(CHAVE_IDIOMA);
  } catch {}
  if (salvo === 'en') aplicarIdioma('en');

  document.querySelectorAll<HTMLButtonElement>('[data-lang]').forEach((b) => {
    b.addEventListener('click', () => {
      const novo = b.dataset.lang as Idioma;
      if (novo === idioma) return;
      aplicarIdioma(novo);
      try {
        localStorage.setItem(CHAVE_IDIOMA, novo);
      } catch {}
    });
  });
}

/* Contadores: 0 → valor, cubic-out, 1,7s */

function contar(el: HTMLElement, alvo: number, duracao = 1700) {
  const tipo = el.dataset.fmt as Formato;
  if (semMovimento) {
    el.textContent = formatar(alvo, tipo, idioma);
    return;
  }
  const casas = tipo === 'percentual' ? 10 : 1;
  const inicio = performance.now();
  el.dataset.animando = '1';
  const passo = (agora: number) => {
    const p = Math.min((agora - inicio) / duracao, 1);
    const v = Math.round(alvo * (1 - Math.pow(1 - p, 3)) * casas) / casas;
    el.textContent = formatar(v, tipo, idioma);
    if (p < 1) requestAnimationFrame(passo);
    else {
      delete el.dataset.animando;
      el.textContent = formatar(alvo, tipo, idioma);
    }
  };
  requestAnimationFrame(passo);
}

function iniciarContadores() {
  const secoes = document.querySelectorAll<HTMLElement>('[data-contadores]');
  if (!('IntersectionObserver' in window)) {
    secoes.forEach((s) => s.classList.add('is-on'));
    return;
  }
  // Antes de entrar na tela, os números aparecem zerados
  secoes.forEach((s) =>
    s.querySelectorAll<HTMLElement>('[data-contar]').forEach((el) => {
      if (!semMovimento) el.textContent = formatar(0, el.dataset.fmt as Formato, idioma);
    }),
  );
  const io = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((e) => {
        if (!e.isIntersecting) return;
        const secao = e.target as HTMLElement;
        secao.classList.add('is-on');
        secao.querySelectorAll<HTMLElement>('[data-contar]').forEach((el) => contar(el, Number(el.dataset.num)));
        io.unobserve(secao);
      });
    },
    { threshold: 0.25 },
  );
  secoes.forEach((s) => io.observe(s));
}

/* Reveal: só quando o navegador não tem animation-timeline */

function iniciarReveal() {
  if (CSS.supports('animation-timeline: view()')) return;
  const itens = document.querySelectorAll<HTMLElement>('.rv');
  if (!('IntersectionObserver' in window) || semMovimento) {
    itens.forEach((el) => el.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
  );
  itens.forEach((el) => io.observe(el));
}

/* Abas (Formatos e Faixa etária), com setas do teclado */

function navegarComTeclado(lista: HTMLElement, abas: HTMLElement[], ativar: (i: number) => void) {
  lista.addEventListener('keydown', (e) => {
    const atual = abas.indexOf(document.activeElement as HTMLElement);
    if (atual < 0) return;
    const mapa: Record<string, number> = {
      ArrowRight: atual + 1,
      ArrowDown: atual + 1,
      ArrowLeft: atual - 1,
      ArrowUp: atual - 1,
      Home: 0,
      End: abas.length - 1,
    };
    if (!(e.key in mapa)) return;
    e.preventDefault();
    const i = (mapa[e.key] + abas.length) % abas.length;
    ativar(i);
    abas[i].focus();
  });
}

function selecionar(abas: HTMLElement[], i: number) {
  abas.forEach((a, j) => {
    a.setAttribute('aria-selected', String(i === j));
    a.tabIndex = i === j ? 0 : -1;
  });
}

function iniciarFormatos() {
  const raiz = document.querySelector<HTMLElement>('[data-abas]');
  if (!raiz) return;
  const lista = raiz.querySelector<HTMLElement>('[role="tablist"]')!;
  const abas = [...lista.querySelectorAll<HTMLElement>('[role="tab"]')];
  const paineis = [...raiz.querySelectorAll<HTMLElement>('[role="tabpanel"]')];
  const ativar = (i: number) => {
    selecionar(abas, i);
    paineis.forEach((p, j) => (p.hidden = i !== j));
  };
  abas.forEach((a, i) => a.addEventListener('click', () => ativar(i)));
  navegarComTeclado(lista, abas, ativar);
}

function iniciarIdade() {
  const raiz = document.querySelector<HTMLElement>('[data-idade]');
  if (!raiz) return;
  const lista = raiz.querySelector<HTMLElement>('[role="tablist"]')!;
  const abas = [...lista.querySelectorAll<HTMLElement>('[role="tab"]')];
  const num = raiz.querySelector<HTMLElement>('[data-idade-num]')!;
  const texto = raiz.querySelector<HTMLElement>('[data-idade-texto]')!;
  const ativar = (i: number) => {
    selecionar(abas, i);
    const { pct, de, ate } = abas[i].dataset;
    num.dataset.num = pct;
    if (semMovimento) num.textContent = percentual(Number(pct), idioma);
    else contar(num, Number(pct), 600);
    texto.textContent = textoIdade(de!, ate!);
  };
  abas.forEach((a, i) => a.addEventListener('click', () => ativar(i)));
  navegarComTeclado(lista, abas, ativar);
}

/* Spotlight dos cards do Sobre */

function iniciarSpotlight() {
  if (!window.matchMedia('(hover: hover)').matches) return;
  document.querySelectorAll<HTMLElement>('[data-spotlight]').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });
}

iniciarIdioma();
iniciarContadores();
iniciarReveal();
iniciarFormatos();
iniciarIdade();
iniciarSpotlight();
