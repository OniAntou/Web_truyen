const express = require('express');
const router = express.Router();
const { Comic } = require('../Database/database');

router.get('/sitemap.xml', async (req, res) => {
    try {
        const comics = await Comic.find({}).select('_id updated_at id');
        
        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
        xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

        const baseUrl = process.env.FRONTEND_URL || 'https://domain.com';
        
        const staticRoutes = ['/', '/popular', '/latest', '/explore'];
        staticRoutes.forEach(route => {
            xml += `  <url>\n`;
            xml += `    <loc>${baseUrl}${route}</loc>\n`;
            xml += `    <changefreq>daily</changefreq>\n`;
            xml += `    <priority>1.0</priority>\n`;
            xml += `  </url>\n`;
        });

        comics.forEach(comic => {
            const comicId = comic.id || comic._id;
            const lastMod = comic.updated_at ? new Date(comic.updated_at).toISOString() : new Date().toISOString();
            xml += `  <url>\n`;
            xml += `    <loc>${baseUrl}/p/${comicId}</loc>\n`;
            xml += `    <lastmod>${lastMod}</lastmod>\n`;
            xml += `    <changefreq>weekly</changefreq>\n`;
            xml += `    <priority>0.8</priority>\n`;
            xml += `  </url>\n`;
        });

        xml += `</urlset>`;

        res.header('Content-Type', 'application/xml');
        res.send(xml);
    } catch (error) {
        console.error('Sitemap generation error:', error);
        res.status(500).end();
    }
});

module.exports = router;
