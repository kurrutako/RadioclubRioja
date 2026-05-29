const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const noticiasDir = path.join(__dirname, '..', 'content', 'noticias');
const dataDir = path.join(__dirname, '..', 'data');
const outputFile = path.join(dataDir, 'noticias.json');

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const files = fs.readdirSync(noticiasDir).filter(f => f.endsWith('.md'));

const noticias = files.map(file => {
  const content = fs.readFileSync(path.join(noticiasDir, file), 'utf8');
  const { data, content: body } = matter(content);

  const lines = body.trim().split('\n');
  const bodyHtml = lines.map(line => {
    if (line.startsWith('- ')) return `<li>${line.slice(2)}</li>`;
    if (line.trim() === '') return '';
    if (line.startsWith('## ')) return `<h3>${line.slice(3)}</h3>`;
    if (line.startsWith('# ')) return `<h2>${line.slice(2)}</h2>`;
    return `<p>${line}</p>`;
  }).filter(l => l !== '').join('\n');

  const bodyWithLists = bodyHtml.includes('<li>')
    ? bodyHtml.replace(/(<li>.*<\/li>)/gs, '<ul class="list-disc list-inside space-y-1 mt-2">$1</ul>')
    : bodyHtml;

  return {
    title: data.title || file.replace('.md', ''),
    date: data.date || '',
    author: data.author || 'EA1RCR',
    image: data.image || '',
    body: bodyWithLists
  };
}).sort((a, b) => new Date(b.date) - new Date(a.date));

fs.writeFileSync(outputFile, JSON.stringify(noticias, null, 2));
console.log(`✓ Generados ${noticias.length} noticias → data/noticias.json`);