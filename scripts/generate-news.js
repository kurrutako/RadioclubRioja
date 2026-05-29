const fs = require('fs');
const path = require('path');

const noticiasDir = path.join(__dirname, '..', 'content', 'noticias');
const dataDir = path.join(__dirname, '..', 'data');
const outputFile = path.join(dataDir, 'noticias.json');

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

// Parser simple de frontmatter YAML
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { data: {}, body: content };

  const yamlStr = match[1];
  const body = match[2];
  const data = {};

  yamlStr.split('\n').forEach(line => {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) return;
    const key = line.slice(0, colonIdx).trim();
    let val = line.slice(colonIdx + 1).trim();
    // Fecha ISO
    if (val.match(/^\d{4}-\d{2}-\d{2}/)) val = new Date(val).toISOString();
    data[key] = val;
  });

  return { data, body: body.trim() };
}

// Conversor básico markdown → HTML
function markdownToHtml(text) {
  const lines = text.split('\n');
  const html = [];
  let inList = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) { if (inList) { html.push('</ul>'); inList = false; } continue; }
    if (trimmed.startsWith('- ')) {
      if (!inList) { html.push('<ul class="list-disc list-inside space-y-1 mt-2">'); inList = true; }
      html.push(`<li>${trimmed.slice(2)}</li>`);
    } else {
      if (inList) { html.push('</ul>'); inList = false; }
      if (trimmed.startsWith('## ')) html.push(`<h3>${trimmed.slice(3)}</h3>`);
      else if (trimmed.startsWith('# ')) html.push(`<h2>${trimmed.slice(2)}</h2>`);
      else html.push(`<p>${trimmed}</p>`);
    }
  }
  if (inList) html.push('</ul>');
  return html.join('\n');
}

const files = fs.readdirSync(noticiasDir).filter(f => f.endsWith('.md'));

const noticias = files.map(file => {
  const content = fs.readFileSync(path.join(noticiasDir, file), 'utf8');
  const { data, body } = parseFrontmatter(content);

  return {
    title: data.title || file.replace('.md', ''),
    date: data.date || '',
    author: data.author || 'EA1RCR',
    image: data.image || '',
    body: markdownToHtml(body)
  };
}).sort((a, b) => new Date(b.date) - new Date(a.date));

fs.writeFileSync(outputFile, JSON.stringify(noticias, null, 2));
console.log(`✓ Generados ${noticias.length} noticias → data/noticias.json`);