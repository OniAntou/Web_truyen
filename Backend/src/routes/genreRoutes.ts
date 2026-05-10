import express from "express";
const router = express.Router();
import * as genreController from "../controllers/genreController";
import {  readLimiter, writeLimiter  } from "../middleware/rateLimiter";

router.get('/', readLimiter, genreController.getGenres);
router.get('/list', readLimiter, genreController.getGenreList);
router.get('/:idOrSlug', readLimiter, genreController.getGenreByIdOrSlug);
router.post('/', writeLimiter, genreController.createGenre);
router.put('/:id', writeLimiter, genreController.updateGenre);
router.delete('/:id', writeLimiter, genreController.deleteGenre);

export default router;

