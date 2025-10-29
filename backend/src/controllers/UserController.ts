/**
 * Controller responsável por gerenciar requisições relacionadas a usuários
 * Seguindo o princípio de Responsabilidade Única e Separation of Concerns (SOLID)
 */
import { Request, Response } from 'express';
import { ApiService } from '../services/ApiService';
import { CsvService } from '../services/CsvService';
import { User } from '../models/User';

export class UserController {
  private apiService: ApiService;
  private csvService: CsvService;

  constructor(csvPath: string) {
    this.apiService = new ApiService();
    this.csvService = new CsvService(csvPath);
  }

  /**
   * Busca usuários da API externa
   */
  async fetchFromApi(req: Request, res: Response): Promise<void> {
    try {
      const size = parseInt(req.query.size as string) || 10;
      const users = await this.apiService.fetchUsers(size);
      res.json({
        success: true,
        data: users,
        count: users.length,
      });
    } catch (error) {
      console.error('Erro ao buscar usuários da API:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar usuários da API',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }

  /**
   * Salva usuários no arquivo CSV
   */
  async saveUsers(req: Request, res: Response): Promise<void> {
    try {
      const users: User[] = req.body.users;
      if (!users || !Array.isArray(users) || users.length === 0) {
        res.status(400).json({
          success: false,
          message: 'É necessário fornecer um array de usuários',
        });
        return;
      }

      await this.csvService.addUsers(users);
      res.json({
        success: true,
        message: `${users.length} usuário(s) salvo(s) com sucesso`,
      });
    } catch (error) {
      console.error('Erro ao salvar usuários:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao salvar usuários',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }

  /**
   * Lista todos os usuários do CSV
   */
  async listUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await this.csvService.getAllUsers();
      res.json({
        success: true,
        data: users,
        count: users.length,
      });
    } catch (error) {
      console.error('Erro ao listar usuários:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao listar usuários',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }

  /**
   * Busca um usuário por ID
   */
  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'ID inválido',
        });
        return;
      }

      const user = await this.csvService.getUserById(id);
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuário não encontrado',
        });
        return;
      }

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar usuário',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }

  /**
   * Atualiza um usuário
   */
  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'ID inválido',
        });
        return;
      }

      const updatedUser = await this.csvService.updateUser(id, req.body);
      if (!updatedUser) {
        res.status(404).json({
          success: false,
          message: 'Usuário não encontrado',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Usuário atualizado com sucesso',
        data: updatedUser,
      });
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao atualizar usuário',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }

  /**
   * Remove um usuário
   */
  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'ID inválido',
        });
        return;
      }

      const deleted = await this.csvService.deleteUser(id);
      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Usuário não encontrado',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Usuário removido com sucesso',
      });
    } catch (error) {
      console.error('Erro ao remover usuário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao remover usuário',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }

  /**
   * Busca usuários com base em critérios de pesquisa
   */
  async searchUsers(req: Request, res: Response): Promise<void> {
    try {
      const searchTerm = req.query.q as string;
      const fieldsParam = req.query.fields as string;

      if (!searchTerm) {
        res.status(400).json({
          success: false,
          message: 'Parâmetro de busca (q) é obrigatório',
        });
        return;
      }

      const fields = fieldsParam ? fieldsParam.split(',') : ['first_name', 'last_name', 'email'];
      const users = await this.csvService.searchUsers(searchTerm, fields);

      res.json({
        success: true,
        data: users,
        count: users.length,
        searchTerm,
        fields,
      });
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar usuários',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }
}
