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
  let result;
  try {
    result = optimize(source, {
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
              // cleanup IDs (via preset override)
              cleanupIDs: { remove: true, minify: true },
              // keep data-* attrs disabled by default; adjust below if needed
              removeUnknownsAndDefaults: { keepDataAttrs: false }
            }
          }
        }
        // intentionally avoid removeAttrs plugin due to regex incompatibilities
      ],
    });
  } catch (e) {
    console.error('SVGO error:', file, e.message);
    return false;
  }

  if (!result || result.error) {
    console.error('SVGO returned error:', file, result && result.error);
    return false;
  }

  let optimized = result.data;

  // Post-process to safely remove unwanted attributes (avoid plugin regex pitfalls)
  // remove xmlns:xlink and plain xmlns if present
  optimized = optimized.replace(/[\s\r\n]+xmlns(:xlink)?=(["'])[^\2]*?\2/gi, '');
  // remove data-name attributes
  optimized = optimized.replace(/[\s\r\n]+data-name=(["'])[^\1]*?\1/gi, '');

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