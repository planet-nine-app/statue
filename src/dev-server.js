#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import chalk from 'chalk';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Use current working directory as root (where user runs npm run dev)
const rootDir = process.cwd();
const BUILD_DIR = path.join(rootDir, 'build');
const CONTENT_DIR = path.join(rootDir, 'content');
const SRC_DIR = path.join(rootDir, 'src');

let buildInProgress = false;
let needsRebuild = false;

console.log(chalk.blue('🗿 Statue development server starting...\n'));

// Function to run build
async function runBuild() {
  if (buildInProgress) {
    needsRebuild = true;
    return;
  }

  buildInProgress = true;
  console.log(chalk.gray('Building...'));

  return new Promise((resolve, reject) => {
    const buildProcess = spawn('node', [path.join(SRC_DIR, 'build.js')], {
      stdio: 'inherit',
      cwd: rootDir
    });

    buildProcess.on('close', (code) => {
      buildInProgress = false;

      if (code === 0) {
        console.log(chalk.green('✓ Build complete\n'));

        if (needsRebuild) {
          needsRebuild = false;
          runBuild();
        }
        resolve();
      } else {
        console.error(chalk.red('✗ Build failed\n'));
        reject(new Error('Build failed'));
      }
    });
  });
}

// Initial build
await runBuild();

// Watch for file changes
console.log(chalk.blue('👀 Watching for changes...\n'));

const watchOptions = { recursive: true };

// Watch content directory
if (await fs.pathExists(CONTENT_DIR)) {
  fs.watch(CONTENT_DIR, watchOptions, (eventType, filename) => {
    if (filename && filename.endsWith('.md')) {
      console.log(chalk.gray(`Content changed: ${filename}`));
      runBuild();
    }
  });
}

// Watch src directory (templates and styles)
fs.watch(path.join(SRC_DIR, 'templates'), watchOptions, (eventType, filename) => {
  if (filename && filename.endsWith('.js')) {
    console.log(chalk.gray(`Template changed: ${filename}`));
    runBuild();
  }
});

fs.watch(path.join(SRC_DIR, 'styles'), watchOptions, (eventType, filename) => {
  if (filename && filename.endsWith('.css')) {
    console.log(chalk.gray(`Style changed: ${filename}`));
    runBuild();
  }
});

// Watch site config
fs.watch(path.join(rootDir, 'site.config.js'), (eventType) => {
  console.log(chalk.gray('Config changed'));
  runBuild();
});

// Simple HTTP server to serve build directory
const PORT = 3000;

const server = http.createServer((req, res) => {
  let filePath = path.join(BUILD_DIR, req.url === '/' ? 'index.html' : req.url);

  // If path doesn't have extension, try adding index.html
  if (!path.extname(filePath)) {
    filePath = path.join(filePath, 'index.html');
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }

    // Set content type based on file extension
    const ext = path.extname(filePath);
    const contentTypes = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'text/javascript',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon'
    };

    res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'text/plain' });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(chalk.green(`\n🌐 Server running at http://localhost:${PORT}`));
  console.log(chalk.gray('Press Ctrl+C to stop\n'));
});
