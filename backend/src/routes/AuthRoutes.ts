/**
 * Rotas de autenticação
 */
import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';

const router = Router();
const dbPath = process.env.DB_PATH || './data/user_manager.db';
const authController = new AuthController(dbPath);

router.post('/register', (req, res) => authController.register(req, res));
router.post('/login', (req, res) => authController.login(req, res));
router.get('/verify', (req, res) => authController.verifyToken(req, res));

export { router as AuthRoutes };

