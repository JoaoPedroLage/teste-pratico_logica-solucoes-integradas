/**
 * Rotas relacionadas a usuários
 * Define os endpoints da API REST
 */
import { Router } from 'express';
import { UserController } from '../controllers/UserController';

const router = Router();
const dbPath = process.env.DB_PATH || './data/user_manager.db';
const csvPath = process.env.CSV_PATH || './data/users.csv';
const userController = new UserController(dbPath, csvPath);

// GET /api/users/api - Busca usuários da API externa
router.get('/api', (req, res) => userController.fetchFromApi(req, res));

// POST /api/users/save - Salva usuários no CSV
router.post('/save', (req, res) => userController.saveUsers(req, res));

// GET /api/users - Lista todos os usuários do CSV
router.get('/', (req, res) => userController.listUsers(req, res));

// GET /api/users/search - Busca usuários
router.get('/search', (req, res) => userController.searchUsers(req, res));

// GET /api/users/:id - Busca um usuário por ID
router.get('/:id', (req, res) => userController.getUserById(req, res));

// PUT /api/users/:id - Atualiza um usuário
router.put('/:id', (req, res) => userController.updateUser(req, res));

// DELETE /api/users/:id - Remove um usuário
router.delete('/:id', (req, res) => userController.deleteUser(req, res));

// GET /api/users/download/csv - Download do arquivo CSV
router.get('/download/csv', (req, res) => userController.downloadCsv(req, res));

export { router as UserRoutes };
