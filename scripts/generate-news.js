const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const noticiasDir = path.join(__dirname, '..', 'content', 'noticias');
const outputFile = path.join(__dirname, '..', 'data', 'noticias.json');

const files = fs.readdirSync(noticiasDir).filter(f => f.endsWith('.md'));

const noticias = files.map(file => {
  const content = fs.readFileSync(path.join(noticiasDir, file), 'utf8');
  const { data, content: body } = matter(content);

  const bodyHtml = body
    .replace(/^## (.+)$/gm, '<h3>$1</h3>')
    .replace(/^# (.+)$/gm, '<h2>$1</h2>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^/, '<p>')
    .replace(/$/, '</p>')
    .replace(/<li>/g, '<ul class="list-disc list-inside space-y-1 mt-2"><li>')
    .replace(/<\/li>\n/g, '</li></ul>');

  return {
    title: data.title || file.replace('.md', ''),
    date: data.date || '',
    author: data.author || 'EA1RCR',
    image: data.image || '',
    body: bodyHtml
  };
}).sort((a, b) => new Date(b.date) - new Date(a.date));

fs.writeFileSync(outputFile, JSON.stringify(noticias, null, 2));
console.log(`✓ Generados ${noticias.length} noticias → data/noticias.json`);