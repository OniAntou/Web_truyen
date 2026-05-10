const fs = require('fs');
const path = require('path');

function processFile(filePath, replacements) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    for (const [search, replace] of replacements) {
        if (content.match(search)) {
            content = content.replace(search, replace);
            changed = true;
        }
    }
    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
    }
}

// authController.ts
processFile(path.join(__dirname, 'controllers/authController.ts'), [
    [/user\.last_login\s*=\s*Date\.now\(\);/g, '(user as any).last_login = new Date();'],
    [/user\.last_login\s*=\s*new Date\(\);/g, '(user as any).last_login = new Date();']
]);

// chapterController.ts
processFile(path.join(__dirname, 'controllers/chapterController.ts'), [
    [/commentMap\[ch\._id\]/g, 'commentMap[ch._id.toString()]']
]);

// interactionController.ts
processFile(path.join(__dirname, 'controllers/interactionController.ts'), [
    [/const match = \{ comic_id: comic\._id \};/g, 'const match: any = { comic_id: comic._id };'],
    [/const commentData = \{/g, 'const commentData: any = {'],
    [/interaction\.comic_id\.cover_url/g, '(interaction.comic_id as any).cover_url'],
    [/interaction\.chapter_id\.chapter_number/g, '(interaction.chapter_id as any).chapter_number'],
    [/interaction\.chapter_id\.title/g, '(interaction.chapter_id as any).title'],
    [/c\.comic_id\.cover_url/g, '(c.comic_id as any).cover_url'],
    [/c\.comic_id\.title/g, '(c.comic_id as any).title'],
    [/c\.chapter_id\.chapter_number/g, '(c.chapter_id as any).chapter_number'],
    [/c\.chapter_id\.title/g, '(c.chapter_id as any).title'],
    [/c\.comic_id\.genres/g, '(c.comic_id as any).genres']
]);

// statsController.ts
processFile(path.join(__dirname, 'controllers/statsController.ts'), [
    [/\n\s*limit,/g, '\n    limit: limit ? parseInt(limit as string) : undefined,']
]);

console.log("Final fixes applied!");
