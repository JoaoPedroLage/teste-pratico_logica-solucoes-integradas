/**
 * Rotas relacionadas a usuários
 * Define os endpoints da API REST
 *
 * O UserController agora é instanciado por requisição
 * para lidar com o 'ownerId' dinâmico.
 */
import { Router, Request, Response, NextFunction } from 'express';
import { UserController } from '../controllers/UserController';

// Interface customizada para o Request do Express
// Isso informa ao TypeScript que nosso 'req' pode ter uma propriedade 'controller'
interface AppRequest extends Request {
  controller?: UserController;
}

const router = Router();
const dbPath = process.env.DB_PATH || './data/user_manager.db';
const csvPath = process.env.CSV_PATH || './data/users.csv';

// Middleware de "Injeção de Dependência"
const createControllerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const ownerIdHeader = req.headers['x-owner-id'];
  const ownerId = parseInt(ownerIdHeader as string, 10);

  // Se não houver um ownerId válido, rejeita a requisição
  if (isNaN(ownerId)) {
    return res.status(401).json({ error: 'Não autorizado: Header x-owner-id ausente ou inválido.' });
  }

  // 3. Crie e anexe uma nova instância do controller para esta requisição
  (req as AppRequest).controller = new UserController(dbPath, csvPath, ownerId);
  next();
};

router.use(createControllerMiddleware);

// GET /api/users/api - Busca usuários da API externa
router.get('/api', (req: AppRequest, res: Response) => req.controller!.fetchFromApi(req, res));

// POST /api/users/save - Salva usuários
router.post('/save', (req: AppRequest, res: Response) => req.controller!.saveUsers(req, res));

// GET /api/users - Lista todos os usuários
router.get('/', (req: AppRequest, res: Response) => req.controller!.listUsers(req, res));

// GET /api/users/search - Busca usuários
router.get('/search', (req: AppRequest, res: Response) => req.controller!.searchUsers(req, res));

// GET /api/users/:id - Busca um usuário por ID
router.get('/:id', (req: AppRequest, res: Response) => req.controller!.getUserById(req, res));

// PUT /api/users/:id - Atualiza um usuário
router.put('/:id', (req: AppRequest, res: Response) => req.controller!.updateUser(req, res));

// DELETE /api/users/:id - Remove um usuário
router.delete('/:id', (req: AppRequest, res: Response) => req.controller!.deleteUser(req, res));

// GET /api/users/download/csv - Download do arquivo CSV
router.get('/download/csv', (req: AppRequest, res: Response) => req.controller!.downloadCsv(req, res));

export { router as UserRoutes };