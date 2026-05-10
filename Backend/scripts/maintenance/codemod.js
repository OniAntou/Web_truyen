const fs = require('fs');
const path = require('path');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Convert const { x } = require('y') to import { x } from 'y'
    content = content.replace(/const\s+\{([^}]+)\}\s*=\s*require\((['"])(.*?)\2\);?/g, 'import { $1 } from "$3";');
    
    // Convert const x = require('y') to import x from 'y'
    content = content.replace(/const\s+([A-Za-z0-9_]+)\s*=\s*require\((['"])(.*?)\2\);?/g, 'import $1 from "$3";');
    
    // Convert module.exports = x to export default x
    content = content.replace(/module\.exports\s*=\s*([A-Za-z0-9_{}]+);?/g, 'export default $1;');
    
    // Convert module.exports = { ... } to export default { ... }
    content = content.replace(/module\.exports\s*=\s*\{/g, 'export default {');

    fs.writeFileSync(filePath, content, 'utf8');
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (['node_modules', 'dist', '.git'].includes(file)) continue;
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.ts') && file !== 'rename.js' && file !== 'codemod.js') {
            processFile(fullPath);
        }
    }
}

walkDir(__dirname);
console.log('Codemod applied!');
