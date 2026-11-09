import { initNews } from './news.js';

const groups = [
  { label: '요양원 소개', items: [
    ['facility-banner', '시설 소개'],
    ['facility', '공간별 시설 사진'],
    ['team', '케어팀 소개', './care-team.html'],
  ] },
  { label: '돌봄 서비스', items: [
    ['services', '서비스 안내'],
    ['guide', '요양정보 사전', './care-guide.html'],
  ] },
  { label: '입소 안내', items: [
    ['admission', '입소 절차·준비'],
    ['care-cost', '비용 안내'],
    ['faq-container', '자주 묻는 질문'],
    ['visit', '방문 문의'],
    ['location', '오시는 길'],
  ] },
  { label: '요양원 소식', items: [['news', '요양원 소식']] },
];

const main = document.querySelector('#main-content');
const header = document.querySelector('#main-header');
const categoryHeader = document.querySelector('#category-header');
const staticPage = document.body.dataset.staticDetail;
const desktop = window.matchMedia('(min-width: 960px)');
const hover = window.matchMedia('(hover: hover) and (pointer: fine)');

const logo = new URL('./public/assets/images/yescare_logo_transparent.png', import.meta.url).href;
const pageUrl = ([id, , url]) => url ?? './index.html?page=' + id;

function pageLink(item, activePage) {
  const [id, label] = item;
  const current = activePage === id ? ' aria-current="page"' : '';
  return '<a href="' + pageUrl(item) + '"' + current + '>' + label + '</a>';
}

header.innerHTML = `
  <a class="skip-link" href="#main-content">본문 바로가기</a>
  <div class="site-width header-inner">
    <a class="site-brand" href="./index.html" aria-label="예스케어 대전 요양원 홈">
      <img src="${logo}" alt="" width="94" height="42" />
      <span>예스케어 <strong>대전 요양원</strong></span>
    </a>
    <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-nav">메뉴</button>
    <nav id="site-nav" class="site-nav" aria-label="주 메뉴"></nav>
    <div class="header-actions">
      <a class="header-visit" href="./index.html?page=visit">방문 문의</a>
      <a class="site-button" href="tel:15336598">입소 상담</a>
    </div>
  </div>
`;

for (const link of main.querySelectorAll('[data-detail-link]')) {
  link.href = pageUrl([link.hash.slice(1)]);
}

const nav = header.querySelector('#site-nav');
const toggle = header.querySelector('.menu-toggle');
header.querySelector('.skip-link').addEventListener('click', event => {
  event.preventDefault();
  main.focus();
});

function closeDropdowns() {
  for (const group of nav.querySelectorAll('details[open]')) group.open = false;
}

function setMobileMenu(open) {
  const expanded = String(open);
  if (toggle.getAttribute('aria-expanded') !== expanded) {
    toggle.setAttribute('aria-expanded', expanded);
    toggle.textContent = open ? '닫기' : '메뉴';
  }
  if (!open) closeDropdowns();
}

toggle.addEventListener('click', () => setMobileMenu(toggle.getAttribute('aria-expanded') === 'false'));
desktop.addEventListener('change', () => setMobileMenu(false));

for (const type of ['click', 'focusin']) {
  document.addEventListener(type, event => {
    if (!header.contains(event.target)) setMobileMenu(false);
  });
}

document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  const openGroup = nav.querySelector('details[open]');
  if (openGroup) {
    event.preventDefault();
    openGroup.open = false;
    if (openGroup.contains(document.activeElement)) openGroup.querySelector('summary').focus();
  } else if (toggle.getAttribute('aria-expanded') === 'true') {
    event.preventDefault();
    setMobileMenu(false);
    toggle.focus();
  }
});

function renderMenu(activePage) {
  nav.innerHTML = groups.map(({ label, items }) => {
    if (items.length === 1) return pageLink(items[0], activePage);
    const active = items.some(([id]) => id === activePage) ? ' data-current' : '';
    return '<details name="site-category"' + active + '><summary>' + label +
      '</summary><ul>' + items.map(item => '<li>' + pageLink(item, activePage) + '</li>').join('') + '</ul></details>';
  }).join('') + '<div class="mobile-actions">' + header.querySelector('.header-actions').innerHTML + '</div>';

  for (const group of nav.querySelectorAll('details')) {
    const summary = group.querySelector('summary');
    let timer;
    let openedByHover = false;
    group.addEventListener('pointerenter', event => {
      if (event.pointerType !== 'mouse' || !desktop.matches || !hover.matches || group.open) return;
      timer = window.setTimeout(() => {
        const focusedGroup = nav.querySelector('details[open]:focus-within');
        if (focusedGroup && focusedGroup !== group) return;
        openedByHover = true;
        group.open = true;
      }, 120);
    });
    group.addEventListener('pointerleave', () => {
      window.clearTimeout(timer);
      if (openedByHover && !group.contains(document.activeElement)) group.open = false;
      openedByHover = false;
    });
    summary.addEventListener('click', event => {
      window.clearTimeout(timer);
      if (openedByHover && group.open) event.preventDefault();
      openedByHover = false;
    });
    group.addEventListener('focusout', event => {
      if (desktop.matches && !group.contains(event.relatedTarget)) group.open = false;
    });
  }
}

function renderPage() {
  const hash = window.location.hash.slice(1);
  const requestedPage = new URLSearchParams(window.location.search).get('page');
  if (!staticPage && requestedPage === null && hash === 'care-info') {
    window.location.replace('./care-guide.html');
    return;
  }
  const legacyPage = hash === 'care-team-summary' ? 'facility-banner' : hash;
  const candidate = staticPage ?? requestedPage ?? legacyPage;
  const group = groups.find(({ items }) => items.some(([id, , url]) => id === candidate && (staticPage || !url)));
  const activePage = group ? candidate : null;

  setMobileMenu(false);
  renderMenu(activePage);

  for (const section of main.querySelectorAll('[data-home], [data-detail]')) {
    section.hidden = activePage ? section.dataset.detail !== activePage : !section.hasAttribute('data-home');
  }

  if (!activePage) {
    categoryHeader.replaceChildren();
    document.title = '예스케어 대전 요양원 | 대덕구 상서동 입소 상담';
    return;
  }

  const [, label] = group.items.find(([id]) => id === activePage);
  if (!staticPage) document.title = label + ' | 예스케어 대전 요양원';
  const banner = staticPage ? '' : `
    <div class="category-hero">
      <div class="site-width">
        <p class="breadcrumbs"><a href="./index.html">홈</a> <span aria-hidden="true">/</span> ${group.label}</p>
        <h1>${label}</h1>
      </div>
    </div>
  `;
  const related = group.items.length > 1 ? `
    <nav class="category-nav" aria-label="${group.label} 세부 메뉴">
      <div class="site-width">${group.items.map(item => pageLink(item, activePage)).join('')}</div>
    </nav>
  ` : '';
  categoryHeader.innerHTML = banner + related;

  if (!staticPage && hash && !requestedPage) document.getElementById(hash)?.scrollIntoView();
}

renderPage();

window.addEventListener('hashchange', () => {
  if (!staticPage && !new URLSearchParams(window.location.search).has('page')) renderPage();
});

initNews();
