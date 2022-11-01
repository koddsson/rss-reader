const form = document.querySelector('form')
const input = form?.querySelector('input')!
const template = document.querySelector('template')
const items = document.querySelector('.items')

interface Subscription {
  url: string
}

form?.addEventListener('submit', event => {
  event.preventDefault()

  const subscriptions: Subscription[] = JSON.parse(localStorage.getItem('subscriptions') || '[]')
  const url = input!.value
  subscriptions.push({url})
  localStorage.setItem('subscriptions', JSON.stringify(subscriptions))

  fetchSubscriptions()

  input.value = ''
})

async function getSubscriptions() {
  const subscriptions: Subscription[] = JSON.parse(localStorage.getItem('subscriptions') || '[]')

  const cache = JSON.parse(localStorage.getItem('cache') || '{}')
  const results = []

  for (const sub of subscriptions) {
    if (!cache[sub.url]) {
      const response = await fetch(sub.url)
      const text = await response.text()
      cache[sub.url] = {text, date: new Date()}
    }
    results.push(cache[sub.url])
  }

  localStorage.setItem('cache', JSON.stringify(cache))

  return results
}

interface Post {
  title: string
  description: string
  date: Date
  link: string
}

function getPost(item: Element): Post {
  const title = item.querySelector('title')?.textContent || ''
  const description = item.querySelector('description')?.textContent || ''
  const date = new Date(item.querySelector('pubDate')?.textContent || '')
  const link = item.querySelector('link')?.textContent || ''

  return {title, description, date, link}
}

async function fetchSubscriptions() {
  const parser = new DOMParser()

  const subscriptionsXML = await getSubscriptions()

  const posts = []

  for (const {text} of subscriptionsXML) {
    const doc = parser.parseFromString(text, 'application/xml')
    for (const item of doc.querySelectorAll('item')) {
      const post = getPost(item)
      posts.push(post)
    }
  }

  posts.sort((a, b) => b.date - a.date)

  renderPosts(posts)
}

function renderPosts(posts: Post[]) {
  items.innerHTML = ''
  for (const post of posts) {
    const t = template?.content.cloneNode(true) as HTMLElement
    const link = document.createElement('a')
    link.href = post.link
    link.innerHTML = post.title.trim() ? post.title : 'No title'

    // Sometimes there's a paragraph in the title
    const p = link.querySelector('p')
    if (p) {
      const text = p.textContent
      link.textContent = text
    }

    t.querySelector('.title')!.append(link)
    const description = t.querySelector('.description')!
    description.innerHTML = post.description
    for (const img of description.querySelectorAll('img')) {
      img.setAttribute('loading', 'lazy')
    }

    t.querySelector('.date')!.textContent = post.date.toString()
    items?.append(t)
  }
}

async function ready(): Promise<void> {
  return new Promise(resolve => {
    if (document.readyState === 'interactive' || document.readyState === 'complete') resolve()
    document.addEventListener('DOMContentLoaded', () => resolve())
  })
}

await ready()
fetchSubscriptions()
