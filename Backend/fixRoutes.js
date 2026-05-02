const fs = require('fs');
const path = require('path');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Convert import controller from '../controllers/controller' to import * as controller from '../controllers/controller'
    content = content.replace(/import\s+([A-Za-z0-9_]+Controller)\s+from\s+(['"]\.\.\/controllers\/[^'"]+['"]);?/g, 'import * as $1 from $2;');

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

walkDir(path.join(__dirname, 'routes'));
console.log('Routes imports fixed!');
