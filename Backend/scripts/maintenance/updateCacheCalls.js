const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'controllers/chapterController.ts',
  'controllers/comicController.ts',
  'controllers/interactionController.ts'
];

filesToUpdate.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Replace apiCache.get
    content = content.replace(/apiCache\.get\(/g, 'await apiCache.get(');
    
    // Replace apiCache.set
    content = content.replace(/apiCache\.set\(/g, 'await apiCache.set(');

    // Replace apiCache.flush
    content = content.replace(/apiCache\.flush\(/g, 'await apiCache.flush(');

    // Replace `await await` in case it was already awaited
    content = content.replace(/await await/g, 'await');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
  } else {
    console.log(`File not found: ${file}`);
  }
});
