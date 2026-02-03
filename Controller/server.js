const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Comic, Chapter } = require('../Model/database'); // Import models

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// --- SEED DATA (from mockData.js) ---
const seedData = async () => {
    try {
        const count = await Comic.countDocuments();
        if (count > 0) return; // Data already exists

        console.log('🌱 Seeding partial data...');

        const comics = [
            {
                id: 1,
                title: "Solo Leveling",
                author: "Chu-Gong",
                artist: "Jang Sung-Rak",
                status: "Ongoing",
                cover_url: "https://m.media-amazon.com/images/I/71s+KqR8etL._AC_UF1000,1000_QL80_.jpg",
                description: "In a world where hunters, humans who possess magical abilities, must battle deadly monsters to protect the human race from certain annihilation, a notoriously weak hunter named Sung Jinwoo finds himself in a seemingly endless struggle for survival.",
                rating: 4.8,
                views: "12.5M",
                genres: ["Action", "Adventure", "Fantasy"],
                chapters: 50
            },
            {
                id: 2,
                title: "One Piece",
                author: "Eiichiro Oda",
                artist: "Eiichiro Oda",
                status: "Ongoing",
                cover_url: "https://upload.wikimedia.org/wikipedia/en/9/90/One_Piece%2C_Volume_61_Cover_test.jpg",
                description: "Monkey D. Luffy refuses to let anyone or anything stand in the way of his quest to become the king of all pirates.",
                rating: 4.9,
                views: "500M",
                genres: ["Action", "Comedy", "Adventure"],
                chapters: 100
            },
            {
                id: 3,
                title: "Demon Slayer",
                author: "Koyoharu Gotouge",
                artist: "Koyoharu Gotouge",
                status: "Completed",
                cover_url: "https://m.media-amazon.com/images/I/81M40mJgaEL._AC_UF1000,1000_QL80_.jpg",
                description: "Tanjiro Kamado lives a modest but blissful life in the mountains with his family.",
                rating: 4.7,
                views: "45M",
                genres: ["Action", "Slayer", "History"],
                chapters: 20
            },
            {
                id: 4,
                title: "Jujutsu Kaisen",
                author: "Gege Akutami",
                artist: "Gege Akutami",
                status: "Ongoing",
                cover_url: "https://m.media-amazon.com/images/I/81sF2o1qVjL._AC_UF1000,1000_QL80_.jpg",
                description: "Yuji Itadori is a boy with tremendous physical strength, though he lives a completely ordinary high school life.",
                rating: 4.6,
                views: "30M",
                genres: ["Action", "Supernatural", "School"],
                chapters: 40
            },
            {
                id: 5,
                title: "My Hero Academia",
                author: "Kohei Horikoshi",
                artist: "Kohei Horikoshi",
                status: "Ongoing",
                cover_url: "https://m.media-amazon.com/images/I/81g1bHw2wPL._AC_UF1000,1000_QL80_.jpg",
                description: "Izuku Midoriya lives in a world where everyone has powers - but he was born without them.",
                rating: 4.5,
                views: "28M",
                genres: ["Action", "School", "Superhero"],
                chapters: 60
            },
            {
                id: 6,
                title: "Berserk",
                author: "Kentaro Miura",
                artist: "Kentaro Miura",
                status: "Hiatus",
                cover_url: "https://m.media-amazon.com/images/I/91D07epNE9L._AC_UF1000,1000_QL80_.jpg",
                description: "Guts, known as the Black Swordsman, seeks sanctuary from the demonic forces that pursue him.",
                rating: 4.95,
                views: "15M",
                genres: ["Dark Fantasy", "Action", "Seinen"],
                chapters: 30
            }
        ];

        for (const c of comics) {
            const newComic = new Comic({
                id: c.id,
                title: c.title,
                author: c.author,
                artist: c.artist,
                status: c.status,
                cover_url: c.cover_url,
                description: c.description,
                rating: c.rating,
                views: c.views,
                genres: c.genres
            });
            const savedComic = await newComic.save();

            // Create chapters
            const chapters = [];
            for (let i = 1; i <= c.chapters; i++) {
                chapters.push({
                    comic_id: savedComic._id,
                    chapter_number: i,
                    title: `Chapter ${i}`,
                    date: "Today"
                });
            }
            await Chapter.insertMany(chapters);
        }
        console.log('✅ Seeded mock data to MongoDB');
    } catch (err) {
        console.error('❌ Seeding error:', err);
    }
};

// Routes
app.get('/', (req, res) => {
    res.send('API is running...');
});

app.get('/api/test', (req, res) => {
    res.json({ message: 'Connection successful! Hello from Express!' });
});

// GET all comics
app.get('/api/comics', async (req, res) => {
    try {
        const comics = await Comic.find();
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

// Initialize DB and Seed
seedData();

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
