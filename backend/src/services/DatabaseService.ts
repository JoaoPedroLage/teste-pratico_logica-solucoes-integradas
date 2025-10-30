/**
 * Serviço para gerenciamento de operações com banco de dados SQLite
 * ATUALIZADO para ser compatível com a interface User (de randomuser.me)
 */
import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs';
import { merge as deepMerge } from 'lodash'; // Para o updateUser
import { User } from '../models/User';

// Define o tipo de retorno: o User da API + o ID do nosso banco
// O ID do banco (PK) é 'db_id' para evitar conflito com 'user.id' (que é um objeto)
type StoredUser = User & { db_id: number };

export class DatabaseService {
  private db: sqlite3.Database;
  private dbPath: string;

  // Versões Promisified dos métodos do DB
  private dbRun: (sql: string, params?: any) => Promise<{ lastID: number; changes: number }>;
  private dbGet: (sql: string, params?: any) => Promise<any>;
  private dbAll: (sql: string, params?: any) => Promise<any[]>;
  private dbClose: () => Promise<void>;

  constructor(dbPath: string) {
    this.dbPath = dbPath;
    this.ensureDatabaseExists();
    this.db = new sqlite3.Database(this.dbPath);

    // Promisify dos métodos do DB para usar async/await
    // Usamos 'this' no 'run' para acessar 'this.lastID' e 'this.changes'
    this.dbRun = promisify(this.db.run.bind(this.db));
    this.dbGet = promisify(this.db.get.bind(this.db));
    this.dbAll = promisify(this.db.all.bind(this.db));
    this.dbClose = promisify(this.db.close.bind(this.db));

    this.initializeDatabase();
  }

  private ensureDatabaseExists(): void {
    const dir = path.dirname(this.dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  async initDb(): Promise<void> {
    return this.initializeDatabase();
  }

  private async initializeDatabase(): Promise<void> {
    try {
      // O 'db_id' é nossa Primary Key interna
      // O 'id_name' e 'id_value' vêm do objeto 'user.id' da API
      await this.dbRun(`
        CREATE TABLE IF NOT EXISTS users (
          db_id INTEGER PRIMARY KEY AUTOINCREMENT,
          owner_id INTEGER NOT NULL,
          gender TEXT,
          name_title TEXT,
          name_first TEXT,
          name_last TEXT,
          location_street_number INTEGER,
          location_street_name TEXT,
          location_city TEXT,
          location_state TEXT,
          location_country TEXT,
          location_postcode TEXT,
          location_coordinates_latitude TEXT,
          location_coordinates_longitude TEXT,
          location_timezone_offset TEXT,
          location_timezone_description TEXT,
          email TEXT,
          login_uuid TEXT UNIQUE,
          login_username TEXT,
          login_password TEXT,
          login_salt TEXT,
          login_md5 TEXT,
          login_sha1 TEXT,
          login_sha256 TEXT,
          dob_date TEXT,
          dob_age INTEGER,
          registered_date TEXT,
          registered_age INTEGER,
          phone TEXT,
          cell TEXT,
          id_name TEXT,
          id_value TEXT,
          picture_large TEXT,
          picture_medium TEXT,
          picture_thumbnail TEXT,
          nat TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Índices Corrigidos
      await this.dbRun(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
      await this.dbRun(`CREATE INDEX IF NOT EXISTS idx_users_name_first ON users(name_first)`);
      await this.dbRun(`CREATE INDEX IF NOT EXISTS idx_users_name_last ON users(name_last)`);
      await this.dbRun(`CREATE INDEX IF NOT EXISTS idx_users_owner_id ON users(owner_id)`);

      console.log('✅ Banco de dados SQLite inicializado com sucesso (Novo Schema)');

      // Cria o gatilho (trigger) para atualizar 'updated_at'
      await this.dbRun(`
        CREATE TRIGGER IF NOT EXISTS update_users_updated_at
        AFTER UPDATE ON users
        FOR EACH ROW
        BEGIN
          UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE db_id = OLD.db_id;
        END;
      `);

    } catch (err) {
      console.error('Erro ao inicializar o banco de dados:', err);
      throw err;
    }
  }

  /**
   * Converte um objeto User (da API) para um objeto plano para o DB
   */
  private userToDb(user: User, owner_id: number): any {
    return {
      $owner_id: owner_id,
      $gender: user.gender,
      $name_title: user.name?.title,
      $name_first: user.name?.first,
      $name_last: user.name?.last,
      $location_street_number: user.location?.street?.number,
      $location_street_name: user.location?.street?.name,
      $location_city: user.location?.city,
      $location_state: user.location?.state,
      $location_country: user.location?.country,
      $location_postcode: user.location?.postcode,
      $location_coordinates_latitude: user.location?.coordinates?.latitude,
      $location_coordinates_longitude: user.location?.coordinates?.longitude,
      $location_timezone_offset: user.location?.timezone?.offset,
      $location_timezone_description: user.location?.timezone?.description,
      $email: user.email,
      $login_uuid: user.login?.uuid,
      $login_username: user.login?.username,
      $dob_date: user.dob?.date,
      $dob_age: user.dob?.age,
      $registered_date: user.registered?.date,
      $registered_age: user.registered?.age,
      $phone: user.phone,
      $cell: user.cell,
      $id_name: user.id?.name,
      $id_value: user.id?.value,
      $picture_large: user.picture?.large,
      $picture_medium: user.picture?.medium,
      $picture_thumbnail: user.picture?.thumbnail,
      $nat: user.nat,
    };
  }

  /**
   * Converte dados do banco (linha plana) para objeto User (aninhado)
   */
  private dbToUser(row: any): StoredUser {
    if (!row) return null;

    return {
      db_id: row.db_id, // Nosso ID interno do DB
      gender: row.gender,
      name: {
        title: row.name_title,
        first: row.name_first,
        last: row.name_last,
      },
      location: {
        street: {
          number: row.location_street_number,
          name: row.location_street_name,
        },
        city: row.location_city,
        state: row.location_state,
        country: row.location_country,
        postcode: row.location_postcode,
        coordinates: {
          latitude: row.location_coordinates_latitude,
          longitude: row.location_coordinates_longitude,
        },
        timezone: {
          offset: row.location_timezone_offset,
          description: row.location_timezone_description,
        },
      },
      email: row.email,
      login: {
        uuid: row.login_uuid,
        username: row.login_username,
      },
      dob: {
        date: row.dob_date,
        age: row.dob_age,
      },
      registered: {
        date: row.registered_date,
        age: row.registered_age,
      },
      phone: row.phone,
      cell: row.cell,
      id: { // Recria o objeto 'id' original da API
        name: row.id_name,
        value: row.id_value,
      },
      picture: {
        large: row.picture_large,
        medium: row.picture_medium,
        thumbnail: row.picture_thumbnail,
      },
      nat: row.nat,
    };
  }


  /**
   * Adiciona usuários ao banco de dados
   */
  async addUsers(users: User[], owner_id: number): Promise<void> {
    // SQL para inserção (ignora conflito no login_uuid)
    const sql = `
      INSERT INTO users (
        owner_id, gender, name_title, name_first, name_last,
        location_street_number, location_street_name, location_city, location_state, location_country, location_postcode,
        location_coordinates_latitude, location_coordinates_longitude, location_timezone_offset, location_timezone_description,
        email, login_uuid, login_username,
        dob_date, dob_age, registered_date, registered_age, phone, cell,
        id_name, id_value, picture_large, picture_medium, picture_thumbnail, nat
      ) VALUES (
        $owner_id, $gender, $name_title, $name_first, $name_last,
        $location_street_number, $location_street_name, $location_city, $location_state, $location_country, $location_postcode,
        $location_coordinates_latitude, $location_coordinates_longitude, $location_timezone_offset, $location_timezone_description,
        $email, $login_uuid, $login_username,
        $dob_date, $dob_age, $registered_date, $registered_age, $phone, $cell,
        $id_name, $id_value, $picture_large, $picture_medium, $picture_thumbnail, $nat
      ) ON CONFLICT(login_uuid) DO NOTHING
    `;

    try {
      await this.dbRun('BEGIN TRANSACTION');
      
      for (const user of users) {
        const dbData = this.userToDb(user, owner_id);
        await this.dbRun(sql, dbData);
      }
      
      await this.dbRun('COMMIT');
    } catch (err) {
      await this.dbRun('ROLLBACK');
      console.error('Erro ao adicionar usuários em lote:', err);
      throw new Error('Falha ao adicionar usuários ao banco de dados');
    }
  }

  /**
   * Lista todos os usuários do banco
   */
  async getAllUsers(owner_id: number): Promise<StoredUser[]> {
    try {
      const rows = await this.dbAll('SELECT * FROM users WHERE owner_id = ? ORDER BY db_id', [owner_id]);
      // dbToUser é síncrono agora
      return rows.map(this.dbToUser);
    } catch (error) {
      console.error('Erro ao buscar todos os usuários:', error);
      throw error;
    }
  }

  /**
   * Busca um usuário pelo ID interno do banco
   */
  async getUserById(db_id: number, owner_id: number): Promise<StoredUser | null> {
    try {
      const row = await this.dbGet('SELECT * FROM users WHERE db_id = ? AND owner_id = ?', [db_id, owner_id]);
      return this.dbToUser(row);
    } catch (error) {
      console.error('Erro ao buscar usuário por ID:', error);
      throw error;
    }
  }

  /**
   * Atualiza um usuário (usando deep merge)
   */
  async updateUser(db_id: number, owner_id: number, updatedData: Partial<User>): Promise<StoredUser | null> {
    try {
      // 1. Busca o usuário existente
      const existingUser = await this.getUserById(db_id, owner_id);
      if (!existingUser) {
        return null;
      }

      // 2. Mescla profundamente os dados antigos com os novos
      const mergedUser: StoredUser = deepMerge({}, existingUser, updatedData);

      // 3. Converte o usuário mesclado de volta para o formato do DB (chaves com $)
      const dbData = this.userToDb(mergedUser, owner_id);
      
      // Adiciona o db_id para a cláusula WHERE
      dbData.$db_id = db_id;
      dbData.$owner_id = owner_id; // Garante o owner_id no 'where' também

      // 4. Gera e executa o UPDATE
      // (Remove o $owner_id e $db_id dos campos de SET, eles são para o WHERE)
      const setFields = Object.keys(dbData)
                              .filter(key => key !== '$db_id' && key !== '$owner_id')
                              .map(key => `${key.substring(1)} = ${key}`) // ex: name_first = $name_first
                              .join(', ');

      const sql = `
        UPDATE users SET ${setFields}
        WHERE db_id = $db_id AND owner_id = $owner_id
      `;
      
      await this.dbRun(sql, dbData);

      // 5. Retorna o usuário atualizado
      return this.getUserById(db_id, owner_id);

    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    }
  }

  /**
   * Remove um usuário
   */
  async deleteUser(db_id: number, owner_id: number): Promise<boolean> {
    try {
      const result = await this.dbRun('DELETE FROM users WHERE db_id = ? AND owner_id = ?', [db_id, owner_id]);
      return result.changes > 0;
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      throw error;
    }
  }

  /**
   * Busca usuários com base em critérios
   */
  async searchUsers(
    owner_id: number,
    searchTerm: string,
    // Campos padrão atualizados para o schema do DB
    fields: string[] = ['name_first', 'name_last', 'email', 'login_username']
  ): Promise<StoredUser[]> {
    try {
      const lowerSearchTerm = `%${searchTerm.toLowerCase()}%`;
      
      // Cria condições de busca para os campos do DB
      const conditions = fields.map((field) => {
        // Validação simples para evitar SQL injection no nome do campo
        if (!/^[a-zA-Z0-9_]+$/.test(field)) {
          throw new Error(`Campo de busca inválido: ${field}`);
        }
        return `LOWER(${field}) LIKE ?`;
      });

      const query = `
        SELECT * FROM users
        WHERE owner_id = ? AND (${conditions.join(' OR ')})
        ORDER BY db_id
      `;
      
      // Parâmetros: [owner_id, term, term, term, ...]
      const params = [owner_id, ...fields.map(() => lowerSearchTerm)];

      const rows = await this.dbAll(query, params);
      return rows.map(this.dbToUser);

    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      throw error;
    }
  }

  /**
   * Fecha a conexão com o banco
   */
  async close(): Promise<void> {
    try {
      await this.dbClose();
    } catch (error) {
      console.error('Erro ao fechar o banco de dados:', error);
      throw error;
    }
  }
}
