const feedUrl = 'https://raw.githubusercontent.com/skawns7725/yescare/yescare-news/news.json';
const postUrl = 'https://blog.naver.com/yescare2026_new/';

function newsRow(post, topicLabel) {
  const row = document.createElement('li');
  row.dataset.topic = post.topic;
  row.innerHTML = '<a><time><strong></strong></time><span><strong></strong><small></small></span><span aria-hidden="true">↗</span></a>';
  const time = row.querySelector('time');
  time.dateTime = post.date;
  time.querySelector('strong').textContent = post.date.slice(8);
  time.append(post.date.slice(0, 7).replace('-', '.'));
  row.querySelector('a').href = postUrl + post.id;
  row.querySelector('span strong').textContent = post.title;
  row.querySelector('small').textContent = topicLabel;
  return row;
}

export function initNews() {
  const filters = document.querySelector('.news-filters');
  if (!filters) return;
  const buttons = [...filters.querySelectorAll('button[data-filter]')];
  const topics = new Map(buttons.slice(1).map(button => [button.dataset.filter, button.textContent]));
  const list = document.querySelector('.news-list');
  const news = document.querySelector('#news');
  const contact = news.querySelector('.home-contact');
  const status = document.querySelector('#news-status');
  const empty = document.querySelector('#news-empty');
  let selected = buttons[0];
  let requested = false;

  function showPosts(announce = false) {
    const limit = contact.hidden ? 12 : 4;
    let count = 0;
    for (const post of list.children) {
      const matches = selected.dataset.filter === 'all' || post.dataset.topic === selected.dataset.filter;
      post.hidden = !matches || count >= limit;
      if (!post.hidden) count++;
    }
    empty.hidden = count > 0;
    if (announce) status.textContent = selected.textContent + ' 소식 ' + count + '건';
  }

  async function loadFeed() {
    if (news.hidden || requested) return;
    requested = true;
    try {
      const response = await fetch(feedUrl, {
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
        signal: AbortSignal.timeout(6000),
      });
      if (!response.ok) return;
      const items = await response.json();
      if (!Array.isArray(items)) return;
      const rows = items.slice(0, 20).filter(post =>
        post && typeof post.id === 'string' && /^\d+$/.test(post.id) &&
        typeof post.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(post.date) &&
        typeof post.title === 'string' && post.title.trim() && topics.has(post.topic)
      ).map(post => newsRow(post, topics.get(post.topic)));
      if (!rows.length) return;
      const focusedLink = list.contains(document.activeElement) ? document.activeElement : null;
      list.replaceChildren(...rows);
      showPosts(selected !== buttons[0]);
      if (focusedLink) {
        const replacement = rows.find(row => !row.hidden && row.firstElementChild.href === focusedLink.href);
        (replacement?.firstElementChild ?? selected).focus({ preventScroll: true });
      }
    } catch {
      // The home page already contains a readable selection of blog posts.
    }
  }

  filters.hidden = false;
  filters.addEventListener('click', event => {
    const button = event.target.closest('button[data-filter]');
    if (!button) return;
    selected.setAttribute('aria-pressed', 'false');
    selected = button;
    selected.setAttribute('aria-pressed', 'true');
    showPosts(true);
  });
  window.addEventListener('hashchange', () => {
    showPosts();
    loadFeed();
  });
  showPosts();
  loadFeed();
}
