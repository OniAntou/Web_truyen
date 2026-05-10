const fs = require('fs');
const path = require('path');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Convert `export default { a, b }` back to `export { a, b }`
    // but only if it matches exactly export default { ... } at the end or standalone
    content = content.replace(/export default\s*\{([^}]+)\};?/g, 'export { $1 };');

    // Remove any leftover `;` from `export { ;`
    content = content.replace(/export\s*\{\s*;/g, 'export {');

    fs.writeFileSync(filePath, content, 'utf8');
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (['node_modules', 'dist', '.git'].includes(file)) continue;
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.ts')) {
            processFile(fullPath);
        }
    }
}

walkDir(__dirname);
console.log('Codemod 3 applied!');
