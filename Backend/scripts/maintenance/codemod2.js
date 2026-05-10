const fs = require('fs');
const path = require('path');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    content = content.replace(/export default \{;/g, 'export default {');

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
console.log('Codemod fix applied!');
