const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const PARTIALS = path.join(ROOT, 'partials');
const DIST = path.join(ROOT, 'dist');

const EXCLUDE_DIRS = new Set(['src', 'partials', 'dist', 'node_modules', '.git']);

// Step 1: Generate data JSON from markdown
require('./generate-news.js');
require('./generate-boletines.js');

// Nav page order
const PAGES = ['index', 'el-club', 'sede', 'junta', 'cursos', 'noticias', 'contacto'];

const DESKTOP_ACTIVE = 'nav-active';
const DESKTOP_INACTIVE = 'hover:text-slate-900 text-slate-600';
const MOBILE_ACTIVE = 'block px-3 py-2 rounded-lg bg-red-50 font-semibold text-slate-900';
const MOBILE_INACTIVE = 'block px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100';

// Load partials
const partials = {};
for (const file of fs.readdirSync(PARTIALS)) {
    if (file.endsWith('.html')) {
        partials[file.replace('.html', '')] = fs.readFileSync(path.join(PARTIALS, file), 'utf-8');
    }
}

// Clean dist
if (fs.existsSync(DIST)) {
    fs.rmSync(DIST, { recursive: true });
}
fs.mkdirSync(DIST, { recursive: true });

// Copy root assets first
function copy(src, dest) {
    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
        const s = path.join(src, entry.name);
        const d = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            if (!EXCLUDE_DIRS.has(entry.name)) {
                fs.mkdirSync(d, { recursive: true });
                copy(s, d);
            }
        } else {
            fs.copyFileSync(s, d);
        }
    }
}
copy(ROOT, DIST);

// Process HTML files
for (const file of fs.readdirSync(SRC)) {
    if (!file.endsWith('.html')) continue;
    let content = fs.readFileSync(path.join(SRC, file), 'utf-8');

    // Extract active page index
    const activeMatch = content.match(/@@ACTIVE_PAGE=(\d+)@@/);
    const activeIdx = activeMatch ? parseInt(activeMatch[1]) : -1;
    content = content.replace(/@@ACTIVE_PAGE=\d+@@\n?/, '');

    // Process header partial with active page markers
    let headerHtml = partials['header'];
    for (let i = 0; i < PAGES.length; i++) {
        const desktopActive = i === activeIdx ? DESKTOP_ACTIVE : DESKTOP_INACTIVE;
        const mobileActive = i === activeIdx ? MOBILE_ACTIVE : MOBILE_INACTIVE;
        headerHtml = headerHtml.replace('@@ACTIVE_DESKTOP_' + i + '@@', desktopActive);
        headerHtml = headerHtml.replace('@@ACTIVE_MOBILE_' + i + '@@', mobileActive);
    }

    // Replace all partial markers (override header with processed version)
    let result = content.replace(/\{\{(\w+)\}\}/g, (match, name) => {
        if (name === 'header') return headerHtml;
        return partials[name] || match;
    });

    fs.writeFileSync(path.join(DIST, file), result);
    console.log('  Built ' + file + (activeIdx >= 0 ? ' [active: ' + PAGES[activeIdx] + ']' : ''));
}

console.log('Build complete → dist/');
