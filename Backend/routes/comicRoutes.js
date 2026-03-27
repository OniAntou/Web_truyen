const express = require('express');
const router = express.Router();
const comicController = require('../controllers/comicController');
const authenticateToken = require('../middleware/auth');

router.get('/latest', comicController.getLatestComics);
router.get('/popular', comicController.getPopularComics);
router.get('/trending', comicController.getTrendingComics);
router.get('/', comicController.getAllComics);
router.get('/:id', comicController.getComicById);

router.post('/', authenticateToken, comicController.createComic);
router.put('/:id', comicController.updateComic);
router.delete('/:id', comicController.deleteComic);

module.exports = router;
