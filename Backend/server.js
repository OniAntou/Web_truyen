const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Comic, Chapter } = require('../Database/database'); // Import models

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

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

        // Fetch chapters
        const chapters = await Chapter.find({ comic_id: comic._id }).sort({ chapter_number: 1 });

        // Return combined object to match frontend expectation
        res.json({ ...comic.toObject(), chapters });
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