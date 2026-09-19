// Pós-processa o dist/index.html gerado pelo `expo export --platform web` para
// injetar as tags de PWA (manifest + ícones) que o Metro web export não gera sozinho.
const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'dist', 'index.html');

if (!fs.existsSync(indexPath)) {
  console.error('[inject-pwa-meta] dist/index.html não encontrado. Rode "expo export --platform web" antes.');
  process.exit(1);
}

const injected = [
  '<link rel="manifest" href="/manifest.json">',
  '<link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192.png">',
  '<link rel="icon" type="image/png" sizes="512x512" href="/icons/icon-512.png">',
  '<link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png">',
  '<meta name="apple-mobile-web-app-capable" content="yes">',
  '<meta name="mobile-web-app-capable" content="yes">',
  '<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">',
  '<meta name="apple-mobile-web-app-title" content="Diamond Runner">',
].join('\n  ');

let html = fs.readFileSync(indexPath, 'utf8');

if (html.includes('rel="manifest"')) {
  console.log('[inject-pwa-meta] Tags de PWA já presentes, nada a fazer.');
  process.exit(0);
}

html = html.replace('</head>', `  ${injected}\n</head>`);
fs.writeFileSync(indexPath, html, 'utf8');
console.log('[inject-pwa-meta] Tags de PWA injetadas em dist/index.html');
