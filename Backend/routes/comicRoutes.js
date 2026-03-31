const express = require('express');
const router = express.Router();
const comicController = require('../controllers/comicController');
const authenticateToken = require('../middleware/auth');
const optionalAuth = require('../middleware/optionalAuth');

router.get('/latest', comicController.getLatestComics);
router.get('/popular', comicController.getPopularComics);
router.get('/trending', comicController.getTrendingComics);
router.get('/', comicController.getAllComics);
router.get('/:id', optionalAuth, comicController.getComicById);

router.post('/', authenticateToken, comicController.createComic);
router.put('/:id', authenticateToken, comicController.updateComic);
router.delete('/:id', authenticateToken, comicController.deleteComic);

module.exports = router;
