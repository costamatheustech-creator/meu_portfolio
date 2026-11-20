(() => {
  const section = document.querySelector('.article-recommendations');
  const grid = section?.querySelector('[data-blog-related-list]');
  if (!section || !grid) return;

  const canonical = document.querySelector('link[rel="canonical"]');
  const currentPath = normalizePath(new URL(canonical?.href || window.location.href).pathname);
  const blogIndexUrl = new URL('/blog/', window.location.origin);

  // The published blog index is the source of truth, so unpublished ideas never appear here.
  fetch(blogIndexUrl.href, { credentials: 'same-origin', cache: 'no-store' })
    .then((response) => {
      if (!response.ok) throw new Error('Could not load the published blog index.');
      return response.text();
    })
    .then((html) => {
      const indexDocument = new DOMParser().parseFromString(html, 'text/html');
      const articles = Array.from(indexDocument.querySelectorAll('.blog-article-card'))
        .map(readArticleCard)
        .filter(Boolean)
        .filter((article) => normalizePath(article.url.pathname) !== currentPath)
        .slice(0, 3);

      if (!articles.length) {
        grid.setAttribute('aria-busy', 'false');
        return;
      }

      const fragment = document.createDocumentFragment();
      articles.forEach((article) => fragment.appendChild(createRecommendationCard(article)));
      grid.replaceChildren(fragment);
      grid.setAttribute('aria-busy', 'false');
    })
    .catch(() => {
      // Keep the real link to the full blog index as a useful fallback.
      grid.setAttribute('aria-busy', 'false');
    });

  function readArticleCard(card) {
    const titleLink = card.querySelector('.blog-card-title a[href]');
    const image = card.querySelector('.blog-card-image img[src]');
    const title = titleLink?.textContent.trim();
    const href = titleLink?.getAttribute('href');
    const imageSource = image?.getAttribute('src');
    if (!title || !href || !imageSource) return null;

    let url;
    let imageUrl;
    try {
      url = new URL(href, blogIndexUrl);
      imageUrl = new URL(imageSource, blogIndexUrl);
    } catch {
      return null;
    }

    if (url.origin !== window.location.origin || !url.pathname.startsWith('/blog/')) return null;
    if (url.pathname === '/blog/' || imageUrl.origin !== window.location.origin) return null;

    return {
      url,
      imageUrl,
      imageAlt: image.getAttribute('alt')?.trim(),
      imageWidth: positiveInteger(image.getAttribute('width')),
      imageHeight: positiveInteger(image.getAttribute('height')),
      title,
      summary: card.querySelector('.blog-card-content > p')?.textContent.trim() || '',
      category: card.querySelector('.blog-card-category')?.textContent.trim() || '',
    };
  }

  function createRecommendationCard(article) {
    const link = document.createElement('a');
    link.className = 'article-recommendation-card';
    link.href = article.url.href;

    const image = document.createElement('img');
    image.className = 'article-recommendation-card__image';
    image.src = article.imageUrl.href;
    image.alt = article.imageAlt || `Capa da matéria: ${article.title}`;
    image.loading = 'lazy';
    image.decoding = 'async';
    if (article.imageWidth) image.width = article.imageWidth;
    if (article.imageHeight) image.height = article.imageHeight;
    link.appendChild(image);

    const content = document.createElement('div');
    content.className = 'article-recommendation-card__body';

    if (article.category) {
      const category = document.createElement('span');
      category.className = 'article-recommendation-category';
      category.textContent = article.category;
      content.appendChild(category);
    }

    const title = document.createElement('h3');
    title.textContent = article.title;
    content.appendChild(title);

    if (article.summary) {
      const summary = document.createElement('p');
      summary.textContent = article.summary;
      content.appendChild(summary);
    }

    const cta = document.createElement('span');
    cta.className = 'article-recommendation-cta';
    cta.append('Ler matéria');
    const arrow = document.createElement('span');
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = '↗';
    cta.appendChild(arrow);
    content.appendChild(cta);

    link.appendChild(content);
    return link;
  }

  function normalizePath(path) {
    return path.replace(/\/+$/, '') || '/';
  }

  function positiveInteger(value) {
    const number = Number.parseInt(value, 10);
    return Number.isFinite(number) && number > 0 ? number : 0;
  }
})();
