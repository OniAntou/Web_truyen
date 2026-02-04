const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const { Comic, Chapter, Pages, Upload } = require('../Database/database');
const { uploadToR2, getFileUrl, resolveR2Url, R2_ENABLED } = require('./r2');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Multer: lưu file trong memory để gửi lên R2
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        const allowed = /^image\/(jpeg|jpg|png|gif|webp)$/i.test(file.mimetype);
        if (allowed) cb(null, true);
        else cb(new Error('Chỉ chấp nhận ảnh: JPEG, PNG, GIF, WebP'));
    },
});

// Middleware
app.use(cors());
app.use(express.json());



// Routes
app.get('/', (req, res) => {
    res.send('API is running...');
});

app.get('/api/test', (req, res) => {
    res.json({ message: 'Connection successful! Hello from Express!' });
});

// --- Cloudflare R2 / Upload ---
app.get('/api/r2/status', (req, res) => {
    res.json({ connected: R2_ENABLED, message: R2_ENABLED ? 'R2 đã kết nối' : 'R2 chưa cấu hình' });
});

// Lấy signed URL cho key (frontend dùng làm img src)
app.get('/api/media/signed-url', async (req, res) => {
    try {
        const key = req.query.key;
        if (!key) return res.status(400).json({ message: 'Thiếu query key' });
        const url = await getFileUrl(key, 3600);
        if (!url) return res.status(404).json({ message: 'Không tìm thấy hoặc R2 chưa cấu hình' });
        res.json({ url });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Upload ảnh bìa (cover) cho comic
app.post('/api/upload/cover/:comicId', upload.single('cover'), async (req, res) => {
    try {
        if (!R2_ENABLED) return res.status(503).json({ message: 'R2 chưa được cấu hình' });
        const comicId = req.params.comicId;
        let comic;
        if (comicId.match(/^[0-9a-fA-F]{24}$/)) {
            comic = await Comic.findById(comicId);
        } else {
            comic = await Comic.findOne({ id: parseInt(comicId) });
        }
        if (!comic) return res.status(404).json({ message: 'Comic không tồn tại' });
        if (!req.file) return res.status(400).json({ message: 'Cần gửi file ảnh (field: cover)' });
        const ext = (req.file.originalname || '').split('.').pop() || 'jpg';
        const key = `covers/${comicId}/${Date.now()}.${ext}`;
        const { key: r2Key } = await uploadToR2(key, req.file.buffer, req.file.mimetype);
        await Upload.create({ key: r2Key, type: 'cover', comic_id: comic._id });
        comic.cover_url = r2Key;
        await comic.save();
        res.status(201).json({ comic, cover_url: r2Key });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Upload ảnh chapter (nhiều ảnh → Pages)
app.post('/api/upload/chapter/:chapterId', upload.array('pages', 50), async (req, res) => {
    try {
        if (!R2_ENABLED) return res.status(503).json({ message: 'R2 chưa được cấu hình' });
        const chapterId = req.params.chapterId;
        const chapter = await Chapter.findById(chapterId);
        if (!chapter) return res.status(404).json({ message: 'Chapter không tồn tại' });
        const comicId = chapter.comic_id;
        if (!req.files?.length) return res.status(400).json({ message: 'Cần gửi ít nhất một ảnh (field: pages)' });
        const created = [];
        for (let i = 0; i < req.files.length; i++) {
            const f = req.files[i];
            const ext = (f.originalname || '').split('.').pop() || 'jpg';
            const key = `chapters/${chapterId}/${i + 1}.${ext}`;
            const { key: r2Key } = await uploadToR2(key, f.buffer, f.mimetype);
            await Upload.create({
                key: r2Key,
                type: 'page',
                comic_id: comicId,
                chapter_id: chapter._id,
                page_number: i + 1,
            });
            const page = await Pages.create({
                chapter_id: chapter._id,
                page_number: i + 1,
                image_url: r2Key,
            });
            created.push(page);
        }
        res.status(201).json({ chapter: chapterId, pages: created });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// GET dashboard stats
app.get('/api/stats', async (req, res) => {
    try {
        const comicCount = await Comic.countDocuments();

        // Calculate total views (sum of all comic views)
        // Since views are strings like "12.5M", we might need to parse them.
        // For now, let's just count documents to return a simple "Total Comics".
        // Calculating "Total Views" from strings like "12.5M" is tricky without parsing logic.
        // Let's defer exact view count for now or implement a basic parser if needed.
        // Or simply finding all comics and summing up a numeric field if we converted it.
        // Given the current status, we'll just return the comic count and a placeholder/sum for views if possible.

        const comics = await Comic.find();
        let totalViews = 0;

        // Helper to parse view string: "12.5M" -> 12500000
        const parseViews = (str) => {
            if (!str) return 0;
            const s = str.toString().toUpperCase();
            if (s.includes('M')) return parseFloat(s) * 1000000;
            if (s.includes('K')) return parseFloat(s) * 1000;
            return parseFloat(s) || 0;
        };

        comics.forEach(c => {
            totalViews += parseViews(c.views);
        });

        // Format back to compact string
        const formatViews = (num) => {
            if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
            if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
            return num.toString();
        };

        res.json({
            totalComics: comicCount,
            totalViews: formatViews(totalViews)
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET all comics
app.get('/api/comics', async (req, res) => {
    try {
        const { q } = req.query;
        let query = {};

        if (q) {
            query = { title: { $regex: q, $options: 'i' } };
        }

        const comics = await Comic.find(query);
        res.json(comics);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET partial comic by ID (supporting both MongoDB _id and legacy numeric id)
app.get('/api/comics/:id', async (req, res) => {
    try {
        const { id } = req.params;
        let comic;

        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            comic = await Comic.findById(id);
        } else {
            comic = await Comic.findOne({ id: parseInt(id) });
        }

        if (!comic) return res.status(404).json({ message: 'Comic not found' });

        // Fetch chapters và pages
        const chapters = await Chapter.find({ comic_id: comic._id }).sort({ chapter_number: 1 });
        const chaptersWithPages = await Promise.all(chapters.map(async (ch) => {
            const pages = await Pages.find({ chapter_id: ch._id }).sort({ page_number: 1 });
            const pagesWithUrls = await Promise.all(pages.map(async (p) => ({
                ...p.toObject(),
                image_url: await resolveR2Url(p.image_url) || p.image_url,
            })));
            return { ...ch.toObject(), pages: pagesWithUrls };
        }));

        const coverUrl = await resolveR2Url(comic.cover_url);
        const out = { ...comic.toObject(), cover_url: coverUrl || comic.cover_url, chapters: chaptersWithPages };
        res.json(out);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- ADMIN API ENDPOINTS ---

// CREATE a new comic
app.post('/api/comics', async (req, res) => {
    try {
        // Simple logic to generate a numeric ID if not provided (for legacy compatibility)
        // In a real app, you might want to rely solely on _id or a dedicated counter
        const lastComic = await Comic.findOne().sort({ id: -1 });
        const newId = lastComic && lastComic.id ? lastComic.id + 1 : 1;

        const comicData = {
            id: newId,
            ...req.body
        };

        const newComic = new Comic(comicData);
        await newComic.save();
        res.status(201).json(newComic);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// UPDATE a comic
app.put('/api/comics/:id', async (req, res) => {
    try {
        const { id } = req.params;
        let comic;

        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            comic = await Comic.findByIdAndUpdate(id, req.body, { new: true });
        } else {
            comic = await Comic.findOneAndUpdate({ id: parseInt(id) }, req.body, { new: true });
        }

        if (!comic) return res.status(404).json({ message: 'Comic not found' });
        res.json(comic);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE a comic
app.delete('/api/comics/:id', async (req, res) => {
    try {
        const { id } = req.params;
        let comic;

        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            comic = await Comic.findByIdAndDelete(id);
        } else {
            comic = await Comic.findOneAndDelete({ id: parseInt(id) });
        }

        if (!comic) return res.status(404).json({ message: 'Comic not found' });

        // Also delete associated chapters
        await Chapter.deleteMany({ comic_id: comic._id });

        res.json({ message: 'Comic deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// CREATE a new chapter
app.post('/api/chapters', async (req, res) => {
    try {
        const newChapter = new Chapter(req.body);
        await newChapter.save();
        res.status(201).json(newChapter);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE a chapter
app.delete('/api/chapters/:id', async (req, res) => {
    try {
        const chapter = await Chapter.findByIdAndDelete(req.params.id);
        if (!chapter) return res.status(404).json({ message: 'Chapter not found' });
        res.json({ message: 'Chapter deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});



app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} (WITH STATS)`);
});