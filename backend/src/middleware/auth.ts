/**
 * Middleware de autenticação
 */
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';

const dbPath = process.env.DB_PATH || './data/user_manager.db';

export const authenticateToken = async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Token de autenticação não fornecido',
      });
      return;
    }

    const authService = new AuthService(dbPath);
    const result = await authService.verifyToken(token);

    if (!result.valid || !result.user) {
      res.status(401).json({
        success: false,
        message: 'Token inválido ou expirado',
      });
      return;
    }

    req.user = result.user;
    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao validar token',
    });
  }
};

