/**
 * Serviço para sincronização de dados entre SQLite e CSV
 */
import { DatabaseService } from './DatabaseService';
import { CsvService } from './CsvService';
import { User } from '../models/User';

// Define os tipos de retorno dos serviços de persistência
type DbUser = User & { db_id: number };
type CsvUser = User & { csv_id: number };

export class SyncService {
  private databaseService: DatabaseService;
  private csvService: CsvService;
  private owner_id: number; // ID do "dono" dos registros

  constructor(
    databaseService: DatabaseService,
    csvService: CsvService,
    owner_id: number // O SyncService agora é instanciado POR usuário "dono"
  ) {
    this.databaseService = databaseService;
    this.csvService = csvService;
    this.owner_id = owner_id;
    this.initSync();
  }

  /**
   * Sincroniza o DB e o CSV na inicialização, com base no owner_id.
   * O DB é a fonte da verdade.
   */
  private async initSync(): Promise<void> {
    try {
      await this.databaseService.initDb();

      // Busca dados específicos deste "dono"
      const dbUsers = await this.databaseService.getAllUsers(this.owner_id);
      const csvUsers = await this.csvService.getAllUsers(); // O CsvService já é instanciado com o owner_id

      // --- TRANSFORMAÇÃO DE DADOS ---
      // Converte DbUser[] para CsvUser[] para compatibilidade
      const usersForCsv: CsvUser[] = dbUsers.map(dbUser => {
        const { db_id, ...user } = dbUser; // Separa o db_id do resto do objeto User
        return {
          ...user,         // Espalha as propriedades do User
          csv_id: db_id    // Mapeia db_id para csv_id
        };
      });

      if (dbUsers.length === 0 && csvUsers.length > 0) {
        console.log(`Sincronizando (Owner: ${this.owner_id}): DB vazio, importando usuários do CSV para o DB...`);
        // Adiciona os usuários do CSV ao DB sob este owner_id
        await this.databaseService.addUsers(csvUsers, this.owner_id);
        console.log(`Sincronização concluída: ${csvUsers.length} usuários importados para o DB.`);
      } else if (dbUsers.length > 0 && csvUsers.length === 0) {
        console.log(`Sincronizando (Owner: ${this.owner_id}): CSV vazio, exportando usuários do DB para o CSV...`);
        await this.csvService.rewriteCsvFile(usersForCsv);
        console.log(`Sincronização concluída: ${dbUsers.length} usuários exportados para o CSV.`);
      } else if (dbUsers.length > 0 && csvUsers.length > 0 && dbUsers.length !== csvUsers.length) {
        console.warn(`⚠️ (Owner: ${this.owner_id}) Discrepância de dados detectada. Priorizando DB.`);
        await this.csvService.rewriteCsvFile(usersForCsv);
      } else {
        console.log(`(Owner: ${this.owner_id}) DB e CSV já estão sincronizados ou ambos vazios.`);
      }
    } catch (error) {
      console.error('Erro durante a inicialização da sincronização:', error);
    }
  }

  /**
   * Adiciona usuários no SQLite (com owner_id) e no CSV
   */
  async addUsers(users: User[]): Promise<void> {
    try {
      await this.databaseService.addUsers(users, this.owner_id);
      await this.csvService.addUsers(users);
      
      console.log(`✅ (Owner: ${this.owner_id}) ${users.length} usuário(s) adicionado(s)`);
    } catch (error) {
      console.error('Erro ao adicionar usuários:', error);
      throw error;
    }
  }

  /**
   * Busca todos os usuários. O DB é a fonte da verdade.
   */
  async getAllUsers(): Promise<DbUser[]> {
    try {
      return await this.databaseService.getAllUsers(this.owner_id);
    } catch (error) {
      console.error('Erro ao buscar usuários do SQLite:', error);
      throw error; // Não há fallback para CSV aqui, pois os tipos de ID são incompatíveis
    }
  }

  /**
   * Busca um usuário pelo ID do banco de dados (db_id).
   */
  async getUserById(id: number): Promise<DbUser | null> {
    try {
      // O ID é o db_id
      return await this.databaseService.getUserById(id, this.owner_id);
    } catch (error) {
      console.error('Erro ao buscar usuário por ID:', error);
      throw error;
    }
  }

  /**
   * Atualiza um usuário no DB e no CSV.
   * O 'id' é o 'db_id'.
   */
  async updateUser(id: number, updatedUser: Partial<User>): Promise<DbUser | null> {
    try {
      // 1. Atualiza no DB
      const userFromDb = await this.databaseService.updateUser(id, this.owner_id, updatedUser);
      
      if (!userFromDb) {
        return null;
      }

      // 2. Encontra o usuário no CSV usando a chave única (login_uuid)
      const userUuid = userFromDb.login.uuid;
      const usersFromCsv = await this.csvService.searchUsers(userUuid, ['login.uuid']);

      if (usersFromCsv.length > 0) {
        const csv_id = usersFromCsv[0].csv_id;
        // 3. Atualiza no CSV usando o csv_id
        await this.csvService.updateUser(csv_id, updatedUser);
      } else {
        console.warn(`Usuário ${userUuid} atualizado no DB, mas não encontrado no CSV.`);
      }
      
      console.log(`✅ Usuário ${id} (db_id) atualizado em SQLite e CSV`);
      return userFromDb;
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    }
  }

  /**
   * Remove um usuário do DB e do CSV.
   * O 'id' é o 'db_id'.
   */
  async deleteUser(id: number): Promise<boolean> {
    try {
      // 1. Pega o usuário no DB para descobrir seu UUID antes de deletar
      const userToDelete = await this.databaseService.getUserById(id, this.owner_id);
      if (!userToDelete) {
        return false; // Usuário não existe
      }
      const userUuid = userToDelete.login.uuid;

      // 2. Deleta do DB
      const deletedFromDb = await this.databaseService.deleteUser(id, this.owner_id);
      if (!deletedFromDb) {
        return false;
      }

      // 3. Encontra no CSV pelo UUID
      const usersFromCsv = await this.csvService.searchUsers(userUuid, ['login.uuid']);
      if (usersFromCsv.length > 0) {
        const csv_id = usersFromCsv[0].csv_id;
        // 4. Deleta do CSV
        await this.csvService.deleteUser(csv_id);
      }
      
      console.log(`✅ Usuário ${id} (db_id) removido de SQLite e CSV`);
      return true;
    } catch (error) {
      console.error('Erro ao remover usuário:', error);
      throw error;
    }
  }

  /**
   * Busca usuários. O DB é a fonte da verdade.
   */
  async searchUsers(
    searchTerm: string,
    // Campos atualizados para o schema do DB
    fields: string[] = ['name_first', 'name_last', 'email', 'login_username']
  ): Promise<DbUser[]> {
    try {
      return await this.databaseService.searchUsers(this.owner_id, searchTerm, fields);
    } catch (error) {
      console.error('Erro ao buscar no SQLite:', error);
      throw error;
    }
  }

  /**
   * Força uma sincronização do DB para o CSV (sobrescreve o CSV)
   */
  async syncDatabaseToCsv(): Promise<void> {
    try {
      const users = await this.databaseService.getAllUsers(this.owner_id);
      // --- TRANSFORMAÇÃO DE DADOS ---
      // Converte DbUser[] para CsvUser[]
      const usersForCsv: CsvUser[] = users.map(dbUser => {
        const { db_id, ...user } = dbUser;
        return {
          ...user,
          csv_id: db_id
        };
      });
      // Simplesmente sobrescreve o CSV com o conteúdo do DB
      await this.csvService.rewriteCsvFile(usersForCsv);
      console.log(`✅ Sincronização forçada DB → CSV concluída: ${users.length} usuários`);
    } catch (error) {
      console.error('Erro ao sincronizar SQLite para CSV:', error);
      throw error;
    }
  }
}