// Page templates for different content types

// Hero section for homepage
export function hero({
  badgeText = 'Powered by Statue SSG',
  titleLine1 = 'Welcome to Your Site!',
  titleLine2 = 'Static Site Generator',
  description = 'Create amazing static sites easily with Statue.',
  primaryButtonText = 'Explore Content',
  primaryButtonLink = '#content',
  secondaryButtonText = 'Documentation',
  secondaryButtonLink = '/docs'
}) {
  return `
  <div class="hero">
    <div class="container">
      <div class="hero-content">
        <div class="hero-badge">${badgeText}</div>

        <h1 class="hero-title">
          <span class="hero-title-primary">${titleLine1}</span><br>
          <span class="hero-title-secondary">${titleLine2}</span>
        </h1>

        <p class="hero-description">${description}</p>

        <div class="hero-buttons">
          <a href="${primaryButtonLink}" class="button button-primary">${primaryButtonText}</a>
          <a href="${secondaryButtonLink}" class="button button-secondary">${secondaryButtonText} →</a>
        </div>
      </div>
    </div>
  </div>`;
}

// Content listing for directory pages
export function contentListing({ items = [], directory = '' }) {
  if (items.length === 0) {
    return '<div class="container"><p>No content found.</p></div>';
  }

  const contentCards = items.map(item => `
    <article class="content-card">
      <h2><a href="${item.url}">${item.metadata.title}</a></h2>
      ${item.metadata.date ? `<time class="content-date">${new Date(item.metadata.date).toLocaleDateString()}</time>` : ''}
      ${item.metadata.description ? `<p class="content-description">${item.metadata.description}</p>` : ''}
      <a href="${item.url}" class="content-link">Read more →</a>
    </article>
  `).join('');

  return `
  <div class="content-listing">
    <div class="container">
      <div class="content-grid">
        ${contentCards}
      </div>
    </div>
  </div>`;
}

// Individual content page
export function contentPage({ metadata, content, tableOfContents = null }) {
  const toc = tableOfContents ? `
    <aside class="table-of-contents">
      <h3>Table of Contents</h3>
      ${tableOfContents}
    </aside>
  ` : '';

  return `
  <article class="content-page">
    <div class="container">
      <header class="content-header">
        <h1>${metadata.title}</h1>
        ${metadata.description ? `<p class="content-subtitle">${metadata.description}</p>` : ''}
        ${metadata.date ? `<time class="content-date">${new Date(metadata.date).toLocaleDateString()}</time>` : ''}
        ${metadata.author ? `<p class="content-author">By ${metadata.author}</p>` : ''}
      </header>

      <div class="content-body-wrapper">
        ${toc}
        <div class="content-body">
          ${content}
        </div>
      </div>
    </div>
  </article>`;
}

// Homepage template
export function homepage({ directories = [], recentContent = [], siteConfig }) {
  const categoriesSection = directories.length > 0 ? `
    <section class="categories">
      <div class="container">
        <h2>Explore by Category</h2>
        <div class="categories-grid">
          ${directories.map(dir => `
            <a href="${dir.url}" class="category-card">
              <h3>${dir.title}</h3>
            </a>
          `).join('')}
        </div>
      </div>
    </section>
  ` : '';

  const recentSection = recentContent.length > 0 ? `
    <section class="recent-content">
      <div class="container">
        <h2>Latest Content</h2>
        <div class="content-grid">
          ${recentContent.slice(0, 6).map(item => `
            <article class="content-card">
              <h3><a href="${item.url}">${item.metadata.title}</a></h3>
              ${item.metadata.date ? `<time>${new Date(item.metadata.date).toLocaleDateString()}</time>` : ''}
              ${item.metadata.description ? `<p>${item.metadata.description}</p>` : ''}
              <a href="${item.url}" class="content-link">Read more →</a>
            </article>
          `).join('')}
        </div>
      </div>
    </section>
  ` : '';

  return `
    ${hero({
      titleLine1: 'Welcome to',
      titleLine2: siteConfig.site.name,
      description: siteConfig.site.description
    })}
    ${categoriesSection}
    ${recentSection}
  `;
}
