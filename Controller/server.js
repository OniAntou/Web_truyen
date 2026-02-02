const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Allow all origins for now (dev mode)
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.send('API is running...');
});

app.get('/api/test', (req, res) => {
    res.json({ message: 'Connection successful! Hello from Express!' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
