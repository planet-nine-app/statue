#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

// Get __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Use current working directory as root (where user runs npm run build)
const rootDir = process.cwd();

// Import content processor
import {
  getAllContent,
  getContentDirectories,
  getContentByDirectory
} from './lib/cms/content-processor.js';

// Import templates
import { layout, navigationBar, footer } from './templates/layout.js';
import { homepage, contentPage, contentListing } from './templates/pages.js';

// Import site configuration
import siteConfig from '../site.config.js';

// Build configuration
const BUILD_DIR = path.join(rootDir, 'build');
const STATIC_DIR = path.join(rootDir, 'static');
const STYLES_DIR = path.join(__dirname, 'styles');

console.log(chalk.blue('🗿 Building Statue static site...'));

async function build() {
  try {
    // Clean build directory
    console.log(chalk.gray('Cleaning build directory...'));
    await fs.emptyDir(BUILD_DIR);

    // Copy static files
    console.log(chalk.gray('Copying static files...'));
    if (await fs.pathExists(STATIC_DIR)) {
      await fs.copy(STATIC_DIR, BUILD_DIR);
    }

    // Copy styles
    console.log(chalk.gray('Copying styles...'));
    const stylesTarget = path.join(BUILD_DIR, 'styles');
    await fs.ensureDir(stylesTarget);
    await fs.copy(STYLES_DIR, stylesTarget);

    // Get all content and directories
    console.log(chalk.gray('Processing content...'));
    const allContent = getAllContent();
    const directories = getContentDirectories();

    // Sort content by date (newest first)
    const sortedContent = [...allContent].sort((a, b) => {
      const dateA = a.metadata.date ? new Date(a.metadata.date) : new Date(0);
      const dateB = b.metadata.date ? new Date(b.metadata.date) : new Date(0);
      return dateB - dateA;
    });

    // Generate navigation and footer HTML
    const navHtml = navigationBar({
      items: directories,
      showSearch: siteConfig.search?.enabled ?? false,
      searchPlaceholder: siteConfig.search?.placeholder ?? 'Search...',
      siteConfig
    });

    const footerHtml = footer({
      directories,
      currentPath: '/',
      siteConfig
    });

    // Build homepage
    console.log(chalk.gray('Building homepage...'));
    const homepageContent = homepage({
      directories,
      recentContent: sortedContent,
      siteConfig
    });

    const homepageHtml = layout({
      title: siteConfig.site.name,
      description: siteConfig.site.description,
      content: homepageContent,
      navigation: navHtml,
      footer: footerHtml,
      siteConfig
    });

    await fs.writeFile(path.join(BUILD_DIR, 'index.html'), homepageHtml);

    // Build individual content pages
    console.log(chalk.gray('Building content pages...'));
    for (const item of allContent) {
      const pageContent = contentPage({
        metadata: item.metadata,
        content: item.content
      });

      const pageHtml = layout({
        title: `${item.metadata.title} | ${siteConfig.site.name}`,
        description: item.metadata.description || siteConfig.site.description,
        content: pageContent,
        navigation: navHtml,
        footer: footerHtml,
        siteConfig
      });

      // Create directory structure for the page
      const pagePath = path.join(BUILD_DIR, item.url);
      await fs.ensureDir(pagePath);
      await fs.writeFile(path.join(pagePath, 'index.html'), pageHtml);
    }

    // Build directory listing pages
    console.log(chalk.gray('Building directory pages...'));
    for (const directory of directories) {
      const dirContent = getContentByDirectory(directory.name);

      const listingContent = contentListing({
        items: dirContent,
        directory: directory.name
      });

      const listingHtml = layout({
        title: `${directory.title} | ${siteConfig.site.name}`,
        description: `Browse all ${directory.title.toLowerCase()} content`,
        content: `<div class="content-listing"><div class="container"><h1>${directory.title}</h1></div></div>${listingContent}`,
        navigation: navHtml,
        footer: footerHtml,
        siteConfig
      });

      const dirPath = path.join(BUILD_DIR, directory.url);
      await fs.ensureDir(dirPath);
      await fs.writeFile(path.join(dirPath, 'index.html'), listingHtml);
    }

    // Generate sitemap.xml
    console.log(chalk.gray('Generating sitemap...'));
    const sitemap = generateSitemap(allContent, directories, siteConfig.site.url);
    await fs.writeFile(path.join(BUILD_DIR, 'sitemap.xml'), sitemap);

    // Generate robots.txt
    const robots = `User-agent: *
Allow: /

Sitemap: ${siteConfig.site.url}/sitemap.xml`;
    await fs.writeFile(path.join(BUILD_DIR, 'robots.txt'), robots);

    console.log(chalk.green('\n✅ Build complete!'));
    console.log(chalk.gray(`Built ${allContent.length} pages`));
    console.log(chalk.gray(`Built ${directories.length} directory listings`));
    console.log(chalk.gray(`Output directory: ${BUILD_DIR}`));

  } catch (error) {
    console.error(chalk.red('❌ Build failed:'), error);
    process.exit(1);
  }
}

function generateSitemap(content, directories, baseUrl) {
  const urls = [
    `  <url>
    <loc>${baseUrl}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`
  ];

  // Add directories
  for (const dir of directories) {
    urls.push(`  <url>
    <loc>${baseUrl}${dir.url}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`);
  }

  // Add content pages
  for (const item of content) {
    const lastmod = item.metadata.date
      ? new Date(item.metadata.date).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];

    urls.push(`  <url>
    <loc>${baseUrl}${item.url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`);
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;
}

// Run build
build();
