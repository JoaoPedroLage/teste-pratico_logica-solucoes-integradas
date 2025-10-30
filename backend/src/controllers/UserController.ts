/**
 * Controller para gerenciamento de requisições relacionadas a usuários
 */
import { Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { ApiService } from '../services/ApiService';
import { DatabaseService } from '../services/DatabaseService';
import { CsvService } from '../services/CsvService';
import { SyncService } from '../services/SyncService';
import { User } from '../models/User';
import { SearchParams, DEFAULT_SEARCH_FIELDS } from '../constants/ApiConstants';

export class UserController {
  private apiService: ApiService;
  private syncService: SyncService;

  constructor(dbPath: string, csvPath: string) {
    this.apiService = new ApiService();
    const databaseService = new DatabaseService(dbPath);
    const csvService = new CsvService(csvPath);
    this.syncService = new SyncService(databaseService, csvService);
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
      
      let statusCode = 500;
      let errorMessage = 'Erro desconhecido';
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        if (error.message.includes('DNS') || 
            error.message.includes('resolver o endereço') ||
            error.message.includes('conectar à API externa') ||
            error.message.includes('timeout')) {
          statusCode = 503;
        }
        else if (error.message.includes('configurar') || 
                 error.message.includes('inválido')) {
          statusCode = 400;
        }
      }
      
      res.status(statusCode).json({
        success: false,
        message: 'Erro ao buscar usuários da API',
        error: errorMessage,
        timestamp: new Date().toISOString(),
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

      await this.syncService.addUsers(users);
      res.json({
        success: true,
        message: `${users.length} usuário(s) salvo(s) com sucesso em SQLite e CSV`,
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
   * Lista todos os usuários (SQLite + CSV sincronizados)
   */
  async listUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await this.syncService.getAllUsers();
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

      const user = await this.syncService.getUserById(id);
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

      const updatedUser = await this.syncService.updateUser(id, req.body);
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

      const deleted = await this.syncService.deleteUser(id);
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
      // Aceita tanto 'q' quanto 'term' para compatibilidade
      const searchTerm = (req.query[SearchParams.QUERY] || req.query[SearchParams.TERM]) as string;
      const fieldsParam = req.query[SearchParams.FIELDS] as string;

      if (!searchTerm) {
        res.status(400).json({
          success: false,
          message: `Parâmetro de busca (${SearchParams.QUERY} ou ${SearchParams.TERM}) é obrigatório`,
        });
        return;
      }

      const fields = fieldsParam ? fieldsParam.split(',') : DEFAULT_SEARCH_FIELDS;
      const users = await this.syncService.searchUsers(searchTerm, fields);

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

  /**
   * Download do arquivo CSV
   */
  async downloadCsv(req: Request, res: Response): Promise<void> {
    try {
      const csvPath = process.env.CSV_PATH || './data/users.csv';
      
      if (!fs.existsSync(csvPath)) {
        res.status(404).json({
          success: false,
          message: 'Arquivo CSV não encontrado',
        });
        return;
      }

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="users.csv"');
      
      const fileStream = fs.createReadStream(csvPath);
      fileStream.pipe(res);
    } catch (error) {
      console.error('Erro ao fazer download do CSV:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao fazer download do CSV',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }
}
