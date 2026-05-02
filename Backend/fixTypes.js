const fs = require('fs');
const path = require('path');

function fixFiles(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (['node_modules', 'dist', '.git'].includes(file)) continue;
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            fixFiles(fullPath);
        } else if (fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let changed = false;

            // Fix let match = {}; to let match: any = {};
            if (content.match(/let\s+([A-Za-z0-9_]+)\s*=\s*\{\};/)) {
                content = content.replace(/let\s+([A-Za-z0-9_]+)\s*=\s*\{\};/g, 'let $1: any = {};');
                changed = true;
            }
            // Fix import vnpay
            if (content.match(/import\s+vnpay\s+from/)) {
                content = content.replace(/import\s+vnpay\s+from/g, 'import * as vnpay from');
                changed = true;
            }
            // Fix Date.now() for created_at / updated_at
            if (content.match(/\.updated_at\s*=\s*Date\.now\(\);/)) {
                content = content.replace(/\.updated_at\s*=\s*Date\.now\(\);/g, '.updated_at = new Date();');
                changed = true;
            }
            if (content.match(/\.created_at\s*=\s*Date\.now\(\);/)) {
                content = content.replace(/\.created_at\s*=\s*Date\.now\(\);/g, '.created_at = new Date();');
                changed = true;
            }
            // Fix ObjectId map issue map[id] -> map[id.toString()]
            if (content.match(/viewMap\[ch\._id\]/)) {
                content = content.replace(/viewMap\[ch\._id\]/g, 'viewMap[ch._id.toString()]');
                changed = true;
            }
            if (content.match(/commentMap\[ch\._id\]/)) {
                content = content.replace(/commentMap\[ch\._id\]/g, 'commentMap[ch._id.toString()]');
                changed = true;
            }

            if (changed) {
                fs.writeFileSync(fullPath, content, 'utf8');
            }
        }
    }
}

fixFiles(__dirname);
console.log('Fixes applied!');
