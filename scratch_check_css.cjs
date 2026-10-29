const fs = require('fs');
const path = require('path');

function getFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getFiles(filePath, fileList);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const componentFiles = getFiles('src/components').concat(['src/App.tsx']);
const classNames = new Set();

componentFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  // Match className="..." or className={`...`}
  const matches = content.match(/className=["'`]([^"'`]+)["'`]/g) || [];
  for (const m of matches) {
    const cleaned = m.replace(/^className=["'`]/, '').replace(/["'`]$/, '');
    const tokens = cleaned.split(/\s+/);
    for (const t of tokens) {
      const cleanToken = t.trim().replace(/[^a-zA-Z0-9_\-:\/]/g, '');
      if (cleanToken && cleanToken.length > 1 && !cleanToken.startsWith('ms-')) {
        classNames.add(cleanToken);
      }
    }
  }
});

const cssContent = fs.readFileSync('src/styles/mindsync.css', 'utf8') + '\n' + fs.readFileSync('src/styles/design-tokens.css', 'utf8');

const missing = [];
for (const cls of classNames) {
  // Check if class is present in CSS
  const escaped = cls.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  const re = new RegExp('\\.' + escaped + '(?=[^a-zA-Z0-9_-]|$)', 'm');
  if (!re.test(cssContent)) {
    missing.push(cls);
  }
}

console.log('Total classes used in components:', classNames.size);
console.log('Total missing from CSS:', missing.length);
console.log('Missing classes list:\n', JSON.stringify(missing.sort(), null, 2));
