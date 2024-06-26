import '@github/time-elements';

import './register-service-worker';

const form = document.querySelector('form');
const input = form?.querySelector('input');
const template = document.querySelector('template');
const items = document.querySelector('.items');

interface Subscription {
  url: string;
}

form?.addEventListener('submit', (event) => {
  event.preventDefault();

  const subscriptions: Subscription[] = JSON.parse(
    localStorage.getItem('subscriptions') || '[]',
  );
  const url = input!.value;
  subscriptions.push({ url });
  localStorage.setItem('subscriptions', JSON.stringify(subscriptions));

  fetchSubscriptions();

  input!.value = '';
});

async function getSubscriptions() {
  const subscriptions: Subscription[] = JSON.parse(
    localStorage.getItem('subscriptions') || '[]',
  );

  const cache = JSON.parse(localStorage.getItem('cache') || '{}');
  const results = [];

  for (const sub of subscriptions) {
    if (cache[sub.url]) {
      const then = new Date(cache[sub.url].date).getTime();
      const now = Date.now();
      const oneHour = 60 * 60 * 1000;
      const moreThanOneHourAgo = now - then > oneHour;

      if (moreThanOneHourAgo) {
        try {
          const response = await fetch(sub.url);
          const text = await response.text();
          cache[sub.url] = { text, date: new Date() };
        } catch (error) {
          console.error(`Failed to fetch`, error);
          continue;
        }
      }
    } else {
      try {
        const response = await fetch(sub.url);
        const text = await response.text();
        cache[sub.url] = { text, date: new Date() };
      } catch (error) {
        console.error(`Failed to fetch ${sub.url}`, error);
        continue;
      }
    }

    results.push(cache[sub.url]);
  }

  localStorage.setItem('cache', JSON.stringify(cache));

  return results;
}

interface Post {
  title: string;
  description: string;
  date: Date;
  link: string;
}

function getPost(item: Element): Post {
  const title = item.querySelector('title')?.textContent || '';
  const description =
    item.querySelector('description, content')?.textContent || '';
  const date = new Date(
    item.querySelector('pubDate, updated')?.textContent || '',
  );
  const link = item.querySelector('link')?.textContent || '';

  return { title, description, date, link };
}

async function fetchSubscriptions() {
  const parser = new DOMParser();

  const subscriptionsXML = await getSubscriptions();

  const posts = [];

  for (const { text } of subscriptionsXML) {
    const document_ = parser.parseFromString(text, 'application/xml');
    for (const item of document_.querySelectorAll('item, entry')) {
      const post = getPost(item);
      posts.push(post);
    }
  }

  posts.sort((a, b) => b.date - a.date);

  renderPosts(posts);
}

function renderPosts(posts: Post[]) {
  items.innerHTML = '';
  for (const post of posts) {
    const t = template?.content.cloneNode(true) as HTMLElement;
    const link = document.createElement('a');
    link.href = post.link;
    link.innerHTML = post.title.trim() ? post.title : 'No title';

    // Sometimes there's a paragraph in the title
    const p = link.querySelector('p');
    if (p) {
      const text = p.textContent;
      link.textContent = text;
    }

    t.querySelector('.title')!.append(link);
    const description = t.querySelector('.description')!;
    description.innerHTML = post.description;
    for (const img of description.querySelectorAll('img')) {
      img.setAttribute('loading', 'lazy');
    }

    t.querySelector('.date')!.setAttribute('datetime', post.date.toString());
    t.querySelector('.date')!.textContent = post.date.toString();
    items?.append(t);
  }
}

async function ready(): Promise<void> {
  return new Promise((resolve) => {
    if (
      document.readyState === 'interactive' ||
      document.readyState === 'complete'
    )
      resolve();
    document.addEventListener('DOMContentLoaded', () => resolve());
  });
}

// Custom function to emit toast notifications
//
// API Documentation: https://shoelace.style/components/alert/
function notify(
  message: string,
  { variant = 'warning', icon = 'exclamation-triangle', duration = 3000 } = {},
) {
  const alert: HTMLElement = Object.assign(document.createElement('sl-alert'), {
    variant,
    closable: true,
    duration,
    innerHTML: `
        <sl-icon name="${icon}" slot="icon"></sl-icon>
        ${message}
      `,
  });

  document.body.append(alert);
  // @ts-expect-error TypeScript doesn't know about `sl-alert`.
  return alert.toast();
}

if (
  new URL(window.location.toString(), window.location.origin).searchParams.get(
    'debug',
  ) === 'true'
) {
  window.addEventListener('unhandledrejection', (event) => {
    notify(`[unhandledrejection]: ${event.reason}`);
  });
  window.addEventListener('error', (event) => {
    notify(`[error]: ${event.type}: ${event.message}\n`, {
      duration: Number.POSITIVE_INFINITY,
    });
  });
}

await ready();
await fetchSubscriptions();
