const express = require('express');
const router = express.Router();
const genreController = require('../controllers/genreController');
const { readLimiter, writeLimiter } = require('../middleware/rateLimiter');

router.get('/', readLimiter, genreController.getGenres);
router.get('/list', readLimiter, genreController.getGenreList);
router.get('/:idOrSlug', readLimiter, genreController.getGenreByIdOrSlug);
router.post('/', writeLimiter, genreController.createGenre);
router.put('/:id', writeLimiter, genreController.updateGenre);
router.delete('/:id', writeLimiter, genreController.deleteGenre);

module.exports = router;

