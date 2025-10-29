/**
 * Serviço para sincronização de dados entre SQLite e CSV
 */
import { DatabaseService } from './DatabaseService';
import { CsvService } from './CsvService';
import { User } from '../models/User';

export class SyncService {
  private databaseService: DatabaseService;
  private csvService: CsvService;

  constructor(databaseService: DatabaseService, csvService: CsvService) {
    this.databaseService = databaseService;
    this.csvService = csvService;
    this.initSync();
  }

  private async initSync(): Promise<void> {
    try {
      await this.databaseService.initDb();

      const dbUsers = await this.databaseService.getAllUsers();
      const csvUsers = await this.csvService.getAllUsers();

      if (dbUsers.length === 0 && csvUsers.length > 0) {
        console.log('Sincronizando: DB vazio, importando usuários do CSV para o DB...');
        await this.databaseService.addUsers(csvUsers);
        console.log(`Sincronização concluída: ${csvUsers.length} usuários importados para o DB.`);
      } else if (dbUsers.length > 0 && csvUsers.length === 0) {
        console.log('Sincronizando: CSV vazio, exportando usuários do DB para o CSV...');
        await this.csvService.rewriteCsvFile(dbUsers);
        console.log(`Sincronização concluída: ${dbUsers.length} usuários exportados para o CSV.`);
      } else if (dbUsers.length > 0 && csvUsers.length > 0 && dbUsers.length !== csvUsers.length) {
        console.warn('⚠️ Discrepância de dados entre DB e CSV detectada. Priorizando DB.');
        await this.csvService.rewriteCsvFile(dbUsers);
      } else {
        console.log('DB e CSV já estão sincronizados ou ambos vazios.');
      }
    } catch (error) {
      console.error('Erro durante a inicialização da sincronização:', error);
    }
  }

  /**
   * Adiciona usuários no SQLite e CSV
   */
  async addUsers(users: User[]): Promise<void> {
    try {
      await this.databaseService.addUsers(users);
      await this.csvService.addUsers(users);
      
      console.log(`✅ ${users.length} usuário(s) adicionado(s) em SQLite e CSV`);
    } catch (error) {
      console.error('Erro ao adicionar usuários:', error);
      throw error;
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      return await this.databaseService.getAllUsers();
    } catch (error) {
      console.error('Erro ao buscar usuários do SQLite, tentando CSV:', error);
      return await this.csvService.getAllUsers();
    }
  }

  async getUserById(id: number): Promise<User | null> {
    try {
      const user = await this.databaseService.getUserById(id);
      if (user) {
        return user;
      }
      return await this.csvService.getUserById(id);
    } catch (error) {
      console.error('Erro ao buscar usuário do SQLite, tentando CSV:', error);
      return await this.csvService.getUserById(id);
    }
  }

  async updateUser(id: number, updatedUser: Partial<User>): Promise<User | null> {
    try {
      const user = await this.databaseService.updateUser(id, updatedUser);
      
      if (!user) {
        return null;
      }

      await this.csvService.updateUser(id, updatedUser);
      
      console.log(`✅ Usuário ${id} atualizado em SQLite e CSV`);
      return user;
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    }
  }

  async deleteUser(id: number): Promise<boolean> {
    try {
      const deleted = await this.databaseService.deleteUser(id);
      
      if (!deleted) {
        return false;
      }

      await this.csvService.deleteUser(id);
      
      console.log(`✅ Usuário ${id} removido de SQLite e CSV`);
      return true;
    } catch (error) {
      console.error('Erro ao remover usuário:', error);
      throw error;
    }
  }

  async searchUsers(
    searchTerm: string,
    fields: string[] = ['first_name', 'last_name', 'email']
  ): Promise<User[]> {
    try {
      return await this.databaseService.searchUsers(searchTerm, fields);
    } catch (error) {
      console.error('Erro ao buscar no SQLite, tentando CSV:', error);
      return await this.csvService.searchUsers(searchTerm, fields);
    }
  }

  async syncDatabaseToCsv(): Promise<void> {
    try {
      const users = await this.databaseService.getAllUsers();
      
      for (const user of users) {
        const existingUser = await this.csvService.getUserById(user.id);
        if (existingUser) {
          await this.csvService.updateUser(user.id, user);
        } else {
          await this.csvService.addUsers([user]);
        }
      }
      
      console.log(`✅ Sincronização SQLite → CSV concluída: ${users.length} usuários`);
    } catch (error) {
      console.error('Erro ao sincronizar SQLite para CSV:', error);
      throw error;
    }
  }
}

