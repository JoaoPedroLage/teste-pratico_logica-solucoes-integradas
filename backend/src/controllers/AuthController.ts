/**
 * Controller para autenticação
 */
import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { RegisterData, LoginData } from '../models/AuthUser';

export class AuthController {
  private authService: AuthService;

  constructor(dbPath: string) {
    this.authService = new AuthService(dbPath);
  }

  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, confirmPassword, name } = req.body;

      if (!email || !password || !confirmPassword || !name) {
        res.status(400).json({
          success: false,
          message: 'Todos os campos são obrigatórios',
        });
        return;
      }

      const result = await this.authService.register({
        email,
        password,
        confirmPassword,
        name,
      } as RegisterData);

      if (!result.success) {
        res.status(400).json({
          success: false,
          message: result.message,
          errors: result.errors || [],
        });
        return;
      }

      const loginResult = await this.authService.login({ email, password } as LoginData);

      res.status(201).json({
        success: true,
        message: result.message,
        token: loginResult.token,
        user: loginResult.user,
      });
    } catch (error) {
      console.error('Erro no registro:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: 'Email e senha são obrigatórios',
        });
        return;
      }

      const result = await this.authService.login({ email, password } as LoginData);

      if (!result.success) {
        res.status(401).json(result);
        return;
      }

      res.json({
        success: true,
        token: result.token,
        user: result.user,
      });
    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  async verifyToken(req: Request, res: Response): Promise<void> {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        res.status(401).json({
          success: false,
          message: 'Token não fornecido',
        });
        return;
      }

      const result = await this.authService.verifyToken(token);

      if (!result.valid) {
        res.status(401).json({
          success: false,
          message: 'Token inválido ou expirado',
        });
        return;
      }

      res.json({
        success: true,
        user: result.user,
      });
    } catch (error) {
      console.error('Erro na verificação do token:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }
}

