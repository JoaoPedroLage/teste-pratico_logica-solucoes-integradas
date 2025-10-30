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
  private csvService: CsvService;

  constructor(dbPath: string, csvPath: string, ownerId: number) {
    this.apiService = new ApiService();
    const databaseService = new DatabaseService(dbPath);
    this.csvService = new CsvService(csvPath, ownerId);
    this.syncService = new SyncService(databaseService, this.csvService, ownerId);
  }

  /**
   * Busca usuários da API externa Random User API
   */
  async fetchFromApi(req: Request, res: Response): Promise<void> {
    try {
      const size = parseInt(req.query.size as string) || 10;
      const gender = req.query.gender as string | undefined;
      const nat = req.query.nat as string | undefined;
      
      const users = await this.apiService.fetchUsers(size, gender, nat);
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
      // Aceita tanto req.body.users quanto req.body diretamente (array)
      const users: User[] = req.body.users || req.body;
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
   * Mapeia campos de notação de ponto (ex: 'name.first') para campos do banco de dados (ex: 'name_first')
   */
  private mapSearchFieldsToDbFields(fields: string[]): string[] {
    const fieldMapping: Record<string, string> = {
      'name.first': 'name_first',
      'name.last': 'name_last',
      'email': 'email',
      'login.username': 'login_username',
      'login.uuid': 'login_uuid',
      'location.city': 'location_city',
      'location.state': 'location_state',
      'location.country': 'location_country',
      'phone': 'phone',
      'cell': 'cell',
      'nat': 'nat',
    };

    return fields.map(field => {
      const trimmedField = field.trim();
      return fieldMapping[trimmedField] || trimmedField.replace(/\./g, '_');
    });
  }

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

      const requestedFields = fieldsParam ? fieldsParam.split(',').map(f => f.trim()) : DEFAULT_SEARCH_FIELDS;
      // Mapeia campos de notação de ponto para campos do banco de dados
      const dbFields = this.mapSearchFieldsToDbFields(requestedFields);
      const users = await this.syncService.searchUsers(searchTerm, dbFields);

      res.json({
        success: true,
        data: users,
        count: users.length,
        searchTerm,
        fields: requestedFields,
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
   * Valida se o arquivo CSV está bem formatado (cabeçalho correto e sem linhas vazias/inválidas)
   */
  private validateCsvFile(csvPath: string): boolean {
    try {
      const content = fs.readFileSync(csvPath, 'utf-8');
      const lines = content.trim().split('\n');
      
      if (lines.length === 0 || lines.length === 1) {
        // Apenas cabeçalho, sem dados (pode estar vazio, mas válido)
        return lines.length === 1;
      }
      
      const header = lines[0].trim();
      // Verifica se o cabeçalho começa com os campos esperados (não com um número)
      const expectedFirstFields = ['csv_id', 'gender', 'name_title'];
      const firstField = header.split(',')[0]?.trim();
      
      // Se o primeiro campo do cabeçalho é um número, o CSV está corrompido
      if (firstField && !isNaN(Number(firstField))) {
        console.warn('CSV corrompido detectado: cabeçalho contém dados numéricos');
        return false;
      }
      
      // Verifica se o cabeçalho contém pelo menos alguns campos esperados
      const hasExpectedFields = expectedFirstFields.some(field => 
        header.toLowerCase().includes(field.toLowerCase())
      );
      
      if (!hasExpectedFields) {
        console.warn('CSV corrompido detectado: cabeçalho não contém campos esperados');
        return false;
      }
      
      // Verifica se há linhas vazias ou inválidas (apenas csv_id sem outros dados)
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line === '' || line === ',') {
          console.warn(`CSV corrompido detectado: linha ${i + 1} está vazia`);
          return false;
        }
        
        const fields = line.split(',');
        if (fields.length === 0) continue;
        
        // Verifica se a linha tem apenas csv_id e campos vazios
        const firstFieldValue = fields[0]?.trim();
        const hasOnlyId = firstFieldValue && !isNaN(Number(firstFieldValue)) &&
                         fields.slice(1).every(field => !field || field.trim() === '');
        
        if (hasOnlyId) {
          console.warn(`CSV corrompido detectado: linha ${i + 1} contém apenas csv_id sem dados`);
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao validar arquivo CSV:', error);
      return false;
    }
  }

  async downloadCsv(req: Request, res: Response): Promise<void> {
    try {
      const csvPath = this.csvService.getCsvPath();
      
      // Verifica se o arquivo existe e está válido
      if (fs.existsSync(csvPath) && this.validateCsvFile(csvPath)) {
        // Envia o arquivo existente se estiver válido
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="users_${path.basename(csvPath)}"`);
        const fileStream = fs.createReadStream(csvPath);
        fileStream.pipe(res);
        return;
      }

      // Se o arquivo não existe ou está corrompido, gera CSV em memória a partir do banco de dados
      const users = await this.syncService.getAllUsers();
      
      if (users.length === 0) {
        res.status(404).json({
          success: false,
          message: 'Nenhum usuário encontrado para exportar',
        });
        return;
      }

      // Mapeia DbUser[] para StoredUser[] (converte db_id para csv_id)
      const storedUsers = users.map(user => ({ ...user, csv_id: user.db_id }));

      // Gera CSV em memória com validação completa
      const csvContent = this.csvService.generateCsvInMemory(storedUsers);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="users_${path.basename(csvPath)}"`);
      res.send(csvContent);
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
