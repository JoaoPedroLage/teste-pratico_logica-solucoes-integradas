/**
 * Serviço para gerenciamento de operações com banco de dados SQLite
 */
import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs';
import { User } from '../models/User';

export class DatabaseService {
  private db: sqlite3.Database;
  private dbPath: string;

  constructor(dbPath: string) {
    this.dbPath = dbPath;
    this.ensureDatabaseExists();
    this.db = new sqlite3.Database(this.dbPath);
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
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.run(`
          CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            uid TEXT NOT NULL,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            username TEXT NOT NULL,
            email TEXT NOT NULL,
            avatar TEXT,
            gender TEXT,
            phone_number TEXT,
            social_insurance_number TEXT,
            date_of_birth TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `, (err) => {
          if (err) {
            console.error('Erro ao criar tabela users:', err);
            reject(err);
            return;
          }
        });

        this.db.run(`
          CREATE TABLE IF NOT EXISTS employment (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            title TEXT,
            key_skill TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
          )
        `, (err) => {
          if (err) {
            console.error('Erro ao criar tabela employment:', err);
            reject(err);
            return;
          }
        });

        this.db.run(`
          CREATE TABLE IF NOT EXISTS address (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            city TEXT,
            street_name TEXT,
            street_address TEXT,
            zip_code TEXT,
            state TEXT,
            country TEXT,
            lng REAL,
            lat REAL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
          )
        `, (err) => {
          if (err) {
            console.error('Erro ao criar tabela address:', err);
            reject(err);
            return;
          }
        });

        this.db.run(`
          CREATE TABLE IF NOT EXISTS credit_card (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL UNIQUE,
            cc_number TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
          )
        `, (err) => {
          if (err) {
            console.error('Erro ao criar tabela credit_card:', err);
            reject(err);
            return;
          }
        });

        this.db.run(`
          CREATE TABLE IF NOT EXISTS subscription (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL UNIQUE,
            plan TEXT,
            status TEXT,
            payment_method TEXT,
            term TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
          )
        `, (err) => {
          if (err) {
            console.error('Erro ao criar tabela subscription:', err);
            reject(err);
            return;
          }
          console.log('✅ Banco de dados SQLite inicializado com sucesso');
          resolve();
        });

        this.db.run(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
        this.db.run(`CREATE INDEX IF NOT EXISTS idx_users_first_name ON users(first_name)`);
        this.db.run(`CREATE INDEX IF NOT EXISTS idx_users_last_name ON users(last_name)`);
      });
    });
  }

  private userToDb(user: User, userId?: number): any {
    return {
      id: userId || user.id || null,
      uid: user.uid || '',
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      username: user.username || '',
      email: user.email || '',
      avatar: user.avatar || '',
      gender: user.gender || '',
      phone_number: user.phone_number || '',
      social_insurance_number: user.social_insurance_number || '',
      date_of_birth: user.date_of_birth || '',
    };
  }

  /**
   * Converte dados do banco para objeto User
   */
  private async dbToUser(row: any): Promise<User> {
    // Busca dados relacionados
    const employment = await this.getEmployment(row.id);
    const address = await this.getAddress(row.id);
    const creditCard = await this.getCreditCard(row.id);
    const subscription = await this.getSubscription(row.id);

    return {
      id: row.id,
      uid: row.uid,
      first_name: row.first_name,
      last_name: row.last_name,
      username: row.username,
      email: row.email,
      avatar: row.avatar,
      gender: row.gender,
      phone_number: row.phone_number,
      social_insurance_number: row.social_insurance_number,
      date_of_birth: row.date_of_birth,
      employment: employment || { title: '', key_skill: '' },
      address: address || {
        city: '',
        street_name: '',
        street_address: '',
        zip_code: '',
        state: '',
        country: '',
        lng: 0,
        lat: 0,
      },
      credit_card: creditCard || { cc_number: '' },
      subscription: subscription || {
        plan: '',
        status: '',
        payment_method: '',
        term: '',
      },
    };
  }

  /**
   * Busca employment de um usuário
   */
  private async getEmployment(userId: number): Promise<{ title: string; key_skill: string } | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT title, key_skill FROM employment WHERE user_id = ?',
        [userId],
        (err, row: any) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(row || null);
        }
      );
    });
  }

  /**
   * Busca address de um usuário
   */
  private async getAddress(userId: number): Promise<any | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT city, street_name, street_address, zip_code, state, country, lng, lat FROM address WHERE user_id = ?',
        [userId],
        (err, row: any) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(row || null);
        }
      );
    });
  }

  /**
   * Busca credit_card de um usuário
   */
  private async getCreditCard(userId: number): Promise<{ cc_number: string } | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT cc_number FROM credit_card WHERE user_id = ?',
        [userId],
        (err, row: any) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(row ? { cc_number: row.cc_number } : null);
        }
      );
    });
  }

  /**
   * Busca subscription de um usuário
   */
  private async getSubscription(userId: number): Promise<any | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT plan, status, payment_method, term FROM subscription WHERE user_id = ?',
        [userId],
        (err, row: any) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(row || null);
        }
      );
    });
  }

  /**
   * Adiciona usuários ao banco de dados
   */
  async addUsers(users: User[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const db = this.db; // Referência para usar nos callbacks
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        let processedCount = 0;
        const totalUsers = users.length;

        users.forEach((user) => {
          const userData = this.userToDb(user);

          // Insere usuário principal
          db.run(
            `INSERT INTO users (uid, first_name, last_name, username, email, avatar, gender, phone_number, social_insurance_number, date_of_birth)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              userData.uid,
              userData.first_name,
              userData.last_name,
              userData.username,
              userData.email,
              userData.avatar,
              userData.gender,
              userData.phone_number,
              userData.social_insurance_number,
              userData.date_of_birth,
            ],
            function (err: Error | null) {
              if (err) {
                db.run('ROLLBACK');
                reject(err);
                return;
              }

              const userId = this.lastID;

              // Insere employment
              if (user.employment) {
                db.run(
                  'INSERT INTO employment (user_id, title, key_skill) VALUES (?, ?, ?)',
                  [userId, user.employment.title || '', user.employment.key_skill || '']
                );
              }

              // Insere address
              if (user.address) {
                db.run(
                  `INSERT INTO address (user_id, city, street_name, street_address, zip_code, state, country, lng, lat)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                  [
                    userId,
                    user.address.city || '',
                    user.address.street_name || '',
                    user.address.street_address || '',
                    user.address.zip_code || '',
                    user.address.state || '',
                    user.address.country || '',
                    user.address.lng || 0,
                    user.address.lat || 0,
                  ]
                );
              }

              // Insere credit_card
              if (user.credit_card) {
                db.run(
                  'INSERT INTO credit_card (user_id, cc_number) VALUES (?, ?)',
                  [userId, user.credit_card.cc_number || '']
                );
              }

              // Insere subscription
              if (user.subscription) {
                db.run(
                  `INSERT INTO subscription (user_id, plan, status, payment_method, term)
                   VALUES (?, ?, ?, ?, ?)`,
                  [
                    userId,
                    user.subscription.plan || '',
                    user.subscription.status || '',
                    user.subscription.payment_method || '',
                    user.subscription.term || '',
                  ]
                );
              }

              processedCount++;
              
              // Quando todos os usuários foram processados
              if (processedCount === totalUsers) {
                db.run('COMMIT', (err: Error | null) => {
                  if (err) {
                    db.run('ROLLBACK');
                    reject(err);
                    return;
                  }
                  resolve();
                });
              }
            }
          );
        });
      });
    });
  }

  /**
   * Lista todos os usuários do banco
   */
  async getAllUsers(): Promise<User[]> {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM users ORDER BY id', [], async (err, rows: any[]) => {
        if (err) {
          reject(err);
          return;
        }

        try {
          const users = await Promise.all(rows.map((row) => this.dbToUser(row)));
          resolve(users);
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  /**
   * Busca um usuário por ID
   */
  async getUserById(id: number): Promise<User | null> {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM users WHERE id = ?', [id], async (err, row: any) => {
        if (err) {
          reject(err);
          return;
        }

        if (!row) {
          resolve(null);
          return;
        }

        try {
          const user = await this.dbToUser(row);
          resolve(user);
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  /**
   * Atualiza um usuário
   */
  async updateUser(id: number, updatedUser: Partial<User>): Promise<User | null> {
    return new Promise((resolve, reject) => {
      const db = this.db; // Referência para usar nos callbacks
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        // Atualiza tabela principal
        if (updatedUser.first_name || updatedUser.last_name || updatedUser.email) {
          const updates: string[] = [];
          const values: any[] = [];

          if (updatedUser.first_name) {
            updates.push('first_name = ?');
            values.push(updatedUser.first_name);
          }
          if (updatedUser.last_name) {
            updates.push('last_name = ?');
            values.push(updatedUser.last_name);
          }
          if (updatedUser.email) {
            updates.push('email = ?');
            values.push(updatedUser.email);
          }
          if (updatedUser.username) {
            updates.push('username = ?');
            values.push(updatedUser.username);
          }
          if (updatedUser.avatar) {
            updates.push('avatar = ?');
            values.push(updatedUser.avatar);
          }
          if (updatedUser.gender) {
            updates.push('gender = ?');
            values.push(updatedUser.gender);
          }
          if (updatedUser.phone_number) {
            updates.push('phone_number = ?');
            values.push(updatedUser.phone_number);
          }
          if (updatedUser.social_insurance_number) {
            updates.push('social_insurance_number = ?');
            values.push(updatedUser.social_insurance_number);
          }
          if (updatedUser.date_of_birth) {
            updates.push('date_of_birth = ?');
            values.push(updatedUser.date_of_birth);
          }

          updates.push('updated_at = CURRENT_TIMESTAMP');
          values.push(id);

          db.run(
            `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
            values,
            (err: Error | null) => {
              if (err) {
                db.run('ROLLBACK');
                reject(err);
                return;
              }
            }
          );
        }

        // Atualiza tabelas relacionadas
        if (updatedUser.employment) {
          db.run(
            `UPDATE employment SET title = ?, key_skill = ? WHERE user_id = ?`,
            [
              updatedUser.employment.title || '',
              updatedUser.employment.key_skill || '',
              id,
            ],
            (err: Error | null) => {
              if (err) {
                console.warn('Erro ao atualizar employment:', err);
              }
            }
          );
        }

        if (updatedUser.address) {
          db.run(
            `UPDATE address SET city = ?, street_name = ?, street_address = ?, zip_code = ?, state = ?, country = ?, lng = ?, lat = ? WHERE user_id = ?`,
            [
              updatedUser.address.city || '',
              updatedUser.address.street_name || '',
              updatedUser.address.street_address || '',
              updatedUser.address.zip_code || '',
              updatedUser.address.state || '',
              updatedUser.address.country || '',
              updatedUser.address.lng || 0,
              updatedUser.address.lat || 0,
              id,
            ],
            (err: Error | null) => {
              if (err) {
                console.warn('Erro ao atualizar address:', err);
              }
            }
          );
        }

        if (updatedUser.credit_card) {
          db.run(
            `UPDATE credit_card SET cc_number = ? WHERE user_id = ?`,
            [updatedUser.credit_card.cc_number || '', id],
            (err: Error | null) => {
              if (err) {
                console.warn('Erro ao atualizar credit_card:', err);
              }
            }
          );
        }

        if (updatedUser.subscription) {
          db.run(
            `UPDATE subscription SET plan = ?, status = ?, payment_method = ?, term = ? WHERE user_id = ?`,
            [
              updatedUser.subscription.plan || '',
              updatedUser.subscription.status || '',
              updatedUser.subscription.payment_method || '',
              updatedUser.subscription.term || '',
              id,
            ],
            (err: Error | null) => {
              if (err) {
                console.warn('Erro ao atualizar subscription:', err);
              }
            }
          );
        }

        db.run('COMMIT', async (err: Error | null) => {
          if (err) {
            db.run('ROLLBACK');
            reject(err);
            return;
          }

          try {
            const user = await this.getUserById(id);
            resolve(user);
          } catch (error) {
            reject(error);
          }
        });
      });
    });
  }

  /**
   * Remove um usuário
   */
  async deleteUser(id: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM users WHERE id = ?', [id], function (err) {
        if (err) {
          reject(err);
          return;
        }
        resolve(this.changes > 0);
      });
    });
  }

  /**
   * Busca usuários com base em critérios
   */
  async searchUsers(
    searchTerm: string,
    fields: string[] = ['first_name', 'last_name', 'email']
  ): Promise<User[]> {
    return new Promise((resolve, reject) => {
      const lowerSearchTerm = `%${searchTerm.toLowerCase()}%`;
      
      // Cria condições de busca para os campos especificados
      const conditions = fields.map((field) => {
        return `LOWER(${field}) LIKE ?`;
      });

      const query = `SELECT * FROM users WHERE ${conditions.join(' OR ')} ORDER BY id`;
      const params = fields.map(() => lowerSearchTerm);

      this.db.all(query, params, async (err, rows: any[]) => {
        if (err) {
          reject(err);
          return;
        }

        try {
          const users = await Promise.all(rows.map((row) => this.dbToUser(row)));
          resolve(users);
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  /**
   * Fecha a conexão com o banco
   */
  close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }
}

