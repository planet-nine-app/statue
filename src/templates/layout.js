// Base HTML layout template
export function layout({ title, description, content, navigation, footer, siteConfig }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title || siteConfig.site.name}</title>
  <meta name="description" content="${description || siteConfig.site.description}">

  <!-- Social meta tags -->
  <meta property="og:title" content="${title || siteConfig.site.name}">
  <meta property="og:description" content="${description || siteConfig.site.description}">
  <meta name="twitter:title" content="${title || siteConfig.site.name}">
  <meta name="twitter:description" content="${description || siteConfig.site.description}">

  <link rel="stylesheet" href="/styles/main.css">
</head>
<body>
  ${navigation || ''}

  <main>
    ${content}
  </main>

  ${footer || ''}
</body>
</html>`;
}

// Navigation bar template
export function navigationBar({ items = [], showSearch = false, searchPlaceholder = 'Search...', siteConfig }) {
  const navItems = items.map(item =>
    `<a href="${item.url}" class="nav-item">${item.title}</a>`
  ).join('');

  const searchBar = showSearch ? `
    <div class="search-container">
      <input type="text" placeholder="${searchPlaceholder}" class="search-input" id="search-input">
    </div>
  ` : '';

  return `
  <nav class="navbar">
    <div class="container">
      <div class="nav-brand">
        <a href="/">${siteConfig.site.name}</a>
      </div>
      <div class="nav-menu">
        ${navItems}
        ${searchBar}
      </div>
    </div>
  </nav>`;
}

// Footer template
export function footer({ directories = [], currentPath = '/', siteConfig }) {
  const year = new Date().getFullYear();

  const directoryLinks = directories.map(dir =>
    `<a href="${dir.url}" class="footer-link">${dir.title}</a>`
  ).join('');

  return `
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-section">
          <h3>${siteConfig.site.name}</h3>
          <p>${siteConfig.site.description}</p>
        </div>

        <div class="footer-section">
          <h4>Navigation</h4>
          <div class="footer-links">
            ${directoryLinks}
          </div>
        </div>

        <div class="footer-section">
          <h4>Contact</h4>
          <p>Email: ${siteConfig.contact.email}</p>
        </div>
      </div>

      <div class="footer-bottom">
        <p>&copy; ${year} ${siteConfig.site.name}. All rights reserved.</p>
      </div>
    </div>
  </footer>`;
}
