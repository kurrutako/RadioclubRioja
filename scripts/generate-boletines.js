const fs = require('fs');
const path = require('path');

const boletinesDir = path.join(__dirname, '..', 'content', 'boletines');
const dataDir = path.join(__dirname, '..', 'data');
const outputFile = path.join(dataDir, 'boletines.json');

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) return {};
  const data = {};
  match[1].split('\n').forEach(line => {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) return;
    const key = line.slice(0, colonIdx).trim();
    let val = line.slice(colonIdx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    data[key] = val;
  });
  return data;
}

const files = fs.readdirSync(boletinesDir).filter(f => f.endsWith('.md'));

const boletines = files.map(file => {
  const content = fs.readFileSync(path.join(boletinesDir, file), 'utf8');
  const data = parseFrontmatter(content);
  return {
    numero: data.numero ? parseInt(data.numero) : 0,
    fecha: data.fecha || '',
    pdf: data.pdf || '#',
    slug: file
  };
}).sort((a, b) => b.numero - a.numero);

fs.writeFileSync(outputFile, JSON.stringify(boletines, null, 2));
console.log('  Generados ' + boletines.length + ' boletines → data/boletines.json');
