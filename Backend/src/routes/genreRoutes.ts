import express from "express";
const router = express.Router();
import * as genreController from "../controllers/genreController";
import authenticateToken, { requireAdmin } from "../middleware/auth";
import {  readLimiter, writeLimiter  } from "../middleware/rateLimiter";

router.get('/', readLimiter, genreController.getGenres);
router.get('/list', readLimiter, genreController.getGenreList);
router.get('/:idOrSlug', readLimiter, genreController.getGenreByIdOrSlug);
router.post('/', writeLimiter, authenticateToken, requireAdmin, genreController.createGenre);
router.put('/:id', writeLimiter, authenticateToken, requireAdmin, genreController.updateGenre);
router.delete('/:id', writeLimiter, authenticateToken, requireAdmin, genreController.deleteGenre);

export default router;
