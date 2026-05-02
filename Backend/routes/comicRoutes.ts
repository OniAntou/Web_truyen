import express from "express";
const router = express.Router();
import * as comicController from "../controllers/comicController";
import authenticateToken from "../middleware/auth";
import optionalAuth from "../middleware/optionalAuth";
import {  readLimiter, writeLimiter  } from "../middleware/rateLimiter";

router.get('/latest', readLimiter, comicController.getLatestComics);
router.get('/popular', readLimiter, comicController.getPopularComics);
router.get('/trending', readLimiter, comicController.getTrendingComics);
router.get('/home', readLimiter, comicController.getHomeData);
router.get('/', readLimiter, comicController.getAllComics);
router.get('/:id', readLimiter, optionalAuth, comicController.getComicById);
router.get('/:id/reader/:chapterId', readLimiter, optionalAuth, comicController.getReaderData);

router.post('/', writeLimiter, authenticateToken, comicController.createComic);
router.put('/:id', writeLimiter, authenticateToken, comicController.updateComic);
router.delete('/:id', writeLimiter, authenticateToken, comicController.deleteComic);

export default router;

