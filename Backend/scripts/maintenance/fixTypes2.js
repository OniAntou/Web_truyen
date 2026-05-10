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

            // Fix empty object literals
            const regex = /(let|const)\s+([A-Za-z0-9_]+)\s*=\s*\{\};/g;
            if (content.match(regex)) {
                content = content.replace(regex, '$1 $2: any = {};');
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
            // Fix ObjectId populate issue
            content = content.replace(/interaction\.comic_id\.cover_url/g, '(interaction.comic_id as any).cover_url');
            content = content.replace(/c\.comic_id\.cover_url/g, '(c.comic_id as any).cover_url');
            content = content.replace(/c\.comic_id\.title/g, '(c.comic_id as any).title');
            content = content.replace(/interaction\.chapter_id\.chapter_number/g, '(interaction.chapter_id as any).chapter_number');
            content = content.replace(/interaction\.chapter_id\.title/g, '(interaction.chapter_id as any).title');
            content = content.replace(/c\.chapter_id\.chapter_number/g, '(c.chapter_id as any).chapter_number');
            content = content.replace(/c\.chapter_id\.title/g, '(c.chapter_id as any).title');
            content = content.replace(/c\.comic_id\.genres/g, '(c.comic_id as any).genres');

            // Fix .updated_at
            content = content.replace(/sitemap\[i\]\.updated_at/g, '(sitemap[i] as any).updated_at');

            // Fix .created_at = Date.now()
            content = content.replace(/req\.user\.created_at\s*=\s*Date\.now\(\)/g, 'req.user.created_at = new Date()');

            if (content !== fs.readFileSync(fullPath, 'utf8')) {
                fs.writeFileSync(fullPath, content, 'utf8');
            }
        }
    }
}

fixFiles(__dirname);
console.log('Fixes 2 applied!');
