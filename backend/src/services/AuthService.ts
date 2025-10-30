/**
 * Serviço para autenticação de usuários
 */
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import sqlite3 from 'sqlite3';
import * as path from 'path';
import * as fs from 'fs';
import { AuthUser, RegisterData, LoginData } from '../models/AuthUser';
import { validatePassword } from '../utils/passwordValidator';

export class AuthService {
  private db: sqlite3.Database;
  private dbPath: string;
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta-jwt-aqui';
  private readonly JWT_EXPIRES_IN = '7d';

  constructor(dbPath: string) {
    this.dbPath = dbPath;
    this.ensureDatabaseExists();
    this.db = new sqlite3.Database(this.dbPath);
    this.ensureAuthTableExists();
  }

  private ensureDatabaseExists(): void {
    const dir = path.dirname(this.dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private ensureAuthTableExists(): void {
    this.db.serialize(() => {
      this.db.run(`
        CREATE TABLE IF NOT EXISTS auth_users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          name TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('Erro ao criar tabela auth_users:', err);
        } else {
          console.log('✅ Tabela auth_users verificada/criada com sucesso');
        }
      });
      this.db.run(`CREATE INDEX IF NOT EXISTS idx_auth_users_email ON auth_users(email)`, (err) => {
        if (err) {
          console.error('Erro ao criar índice auth_users:', err);
        }
      });
    });
  }

  async register(data: RegisterData): Promise<{ success: boolean; message: string; user?: any; errors?: string[] }> {
    if (data.password !== data.confirmPassword) {
      return { success: false, message: 'As senhas não coincidem' };
    }

    const passwordValidation = validatePassword(data.password);
    if (!passwordValidation.isValid) {
      return {
        success: false,
        message: 'A senha não atende aos requisitos de complexidade',
        errors: passwordValidation.errors,
      };
    }

    try {
      const existingUser = await this.findUserByEmail(data.email);
      if (existingUser) {
        return { success: false, message: 'Email já cadastrado' };
      }

      const hashedPassword = await bcrypt.hash(data.password, 10);
      const userId = await this.createUser({
        email: data.email,
        password: hashedPassword,
        name: data.name,
      });

      return {
        success: true,
        message: 'Usuário cadastrado com sucesso',
        user: { id: userId, email: data.email, name: data.name },
      };
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
      return { success: false, message: 'Erro ao cadastrar usuário' };
    }
  }

  async login(data: LoginData): Promise<{ success: boolean; token?: string; user?: any; message?: string }> {
    try {
      const user = await this.findUserByEmail(data.email);
      if (!user) {
        return { success: false, message: 'Email ou senha incorretos' };
      }

      const passwordMatch = await bcrypt.compare(data.password, user.password);
      if (!passwordMatch) {
        return { success: false, message: 'Email ou senha incorretos' };
      }

      const token = jwt.sign(
        { id: user.id, email: user.email },
        this.JWT_SECRET,
        { expiresIn: this.JWT_EXPIRES_IN }
      );

      return {
        success: true,
        token,
        user: { id: user.id, email: user.email, name: user.name },
      };
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      return { success: false, message: 'Erro ao fazer login' };
    }
  }

  async verifyToken(token: string): Promise<{ valid: boolean; user?: any }> {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as any;
      const user = await this.findUserById(decoded.id);
      
      if (!user) {
        return { valid: false };
      }

      return {
        valid: true,
        user: { id: user.id, email: user.email, name: user.name },
      };
    } catch (error) {
      return { valid: false };
    }
  }

  private async findUserByEmail(email: string): Promise<AuthUser | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM auth_users WHERE email = ?',
        [email],
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

  private async findUserById(id: number): Promise<AuthUser | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM auth_users WHERE id = ?',
        [id],
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

  private async createUser(data: { email: string; password: string; name: string }): Promise<number> {
    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT INTO auth_users (email, password, name) VALUES (?, ?, ?)',
        [data.email, data.password, data.name],
        function (err) {
          if (err) {
            reject(err);
            return;
          }
          resolve(this.lastID);
        }
      );
    });
  }

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

