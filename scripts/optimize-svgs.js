const fs = require('fs');
const path = require('path');
const { optimize } = require('svgo');

const ROOT = path.resolve(__dirname, '..');
const EXCLUDE = ['node_modules', '.git', '.vscode', 'dist'];
const SVG_EXT = '.svg';

function walk(dir) {
  const files = [];
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (EXCLUDE.includes(name)) continue;
      files.push(...walk(full));
    } else if (path.extname(name).toLowerCase() === SVG_EXT) {
      files.push(full);
    }
  }
  return files;
}

function optimizeFile(file) {
  const source = fs.readFileSync(file, 'utf8');
  const result = optimize(source, {
    path: file,
    multipass: true,
    floatPrecision: 2,
    plugins: [
      {
        name: 'preset-default',
        params: {
          overrides: {
            // keep viewBox
            removeViewBox: false,
            // configure cleanupIDs via preset overrides
            cleanupIDs: { remove: true, minify: true },
            // keep data-* attrs disabled by default; adjust below if needed
            removeUnknownsAndDefaults: { keepDataAttrs: false }
          }
        }
      },
      // remove specific attrs if present
      { name: 'removeAttrs', params: { attrs: '(data-name|xmlns:xlink)' } }
    ],
  });

  if (result.error) {
    console.error('SVGO error:', file, result.error);
    return false;
  }
  const optimized = result.data;
  if (optimized.length < source.length) {
    fs.copyFileSync(file, file + '.bak');
    fs.writeFileSync(file, optimized, 'utf8');
    console.log(`Optimized: ${path.relative(ROOT, file)}  — ${source.length} → ${optimized.length}`);
    return true;
  } else {
    console.log(`No gain:  ${path.relative(ROOT, file)}`);
    return false;
  }
}

(function main() {
  const files = walk(ROOT);
  if (!files.length) {
    console.log('No SVG files found.');
    return;
  }
  let count = 0;
  for (const f of files) {
    try {
      if (optimizeFile(f)) count++;
    } catch (e) {
      console.error('Failed:', f, e.message);
    }
  }
  console.log(`Done. Optimized ${count} of ${files.length} SVG(s). Backups: *.bak`);
})();