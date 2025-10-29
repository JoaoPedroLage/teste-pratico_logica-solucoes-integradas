/**
 * Serviço para gerenciamento de operações com arquivo CSV
 */
import * as fs from 'fs';
import * as path from 'path';
import csv from 'csv-parser';
import { createObjectCsvWriter } from 'csv-writer';
import { User } from '../models/User';

export class CsvService {
  private csvPath: string;
  private csvWriter: any;

  constructor(csvPath: string) {
    this.csvPath = csvPath;
    this.ensureCsvFileExists();
    this.initializeCsvWriter();
  }

  private ensureCsvFileExists(): void {
    const dir = path.dirname(this.csvPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(this.csvPath)) {
      const header = [
        'id',
        'uid',
        'first_name',
        'last_name',
        'username',
        'email',
        'avatar',
        'gender',
        'phone_number',
        'social_insurance_number',
        'date_of_birth',
        'employment_title',
        'employment_key_skill',
        'address_city',
        'address_street_name',
        'address_street_address',
        'address_zip_code',
        'address_state',
        'address_country',
        'credit_card_cc_number',
        'subscription_plan',
        'subscription_status',
        'subscription_payment_method',
        'subscription_term',
      ].join(',');
      fs.writeFileSync(this.csvPath, header + '\n');
    }
  }

  private initializeCsvWriter(): void {
    this.csvWriter = createObjectCsvWriter({
      path: this.csvPath,
      header: [
        { id: 'id', title: 'id' },
        { id: 'uid', title: 'uid' },
        { id: 'first_name', title: 'first_name' },
        { id: 'last_name', title: 'last_name' },
        { id: 'username', title: 'username' },
        { id: 'email', title: 'email' },
        { id: 'avatar', title: 'avatar' },
        { id: 'gender', title: 'gender' },
        { id: 'phone_number', title: 'phone_number' },
        { id: 'social_insurance_number', title: 'social_insurance_number' },
        { id: 'date_of_birth', title: 'date_of_birth' },
        { id: 'employment_title', title: 'employment_title' },
        { id: 'employment_key_skill', title: 'employment_key_skill' },
        { id: 'address_city', title: 'address_city' },
        { id: 'address_street_name', title: 'address_street_name' },
        { id: 'address_street_address', title: 'address_street_address' },
        { id: 'address_zip_code', title: 'address_zip_code' },
        { id: 'address_state', title: 'address_state' },
        { id: 'address_country', title: 'address_country' },
        { id: 'credit_card_cc_number', title: 'credit_card_cc_number' },
        { id: 'subscription_plan', title: 'subscription_plan' },
        { id: 'subscription_status', title: 'subscription_status' },
        { id: 'subscription_payment_method', title: 'subscription_payment_method' },
        { id: 'subscription_term', title: 'subscription_term' },
      ],
      append: true,
    });
  }

  private userToCsvRow(user: User, id: number): any {
    return {
      id: id.toString(),
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
      employment_title: user.employment?.title || '',
      employment_key_skill: user.employment?.key_skill || '',
      address_city: user.address?.city || '',
      address_street_name: user.address?.street_name || '',
      address_street_address: user.address?.street_address || '',
      address_zip_code: user.address?.zip_code || '',
      address_state: user.address?.state || '',
      address_country: user.address?.country || '',
      credit_card_cc_number: user.credit_card?.cc_number || '',
      subscription_plan: user.subscription?.plan || '',
      subscription_status: user.subscription?.status || '',
      subscription_payment_method: user.subscription?.payment_method || '',
      subscription_term: user.subscription?.term || '',
    };
  }

  /**
   * Converte uma linha CSV para objeto User
   */
  private csvRowToUser(row: any): User {
    return {
      id: parseInt(row.id),
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
      employment: {
        title: row.employment_title,
        key_skill: row.employment_key_skill,
      },
      address: {
        city: row.address_city,
        street_name: row.address_street_name,
        street_address: row.address_street_address,
        zip_code: row.address_zip_code,
        state: row.address_state,
        country: row.address_country,
        lng: 0,
        lat: 0,
      },
      credit_card: {
        cc_number: row.credit_card_cc_number,
      },
      subscription: {
        plan: row.subscription_plan,
        status: row.subscription_status,
        payment_method: row.subscription_payment_method,
        term: row.subscription_term,
      },
    };
  }

  /**
   * Adiciona usuários ao arquivo CSV
   */
  async addUsers(users: User[]): Promise<void> {
    try {
      const maxId = await this.getMaxId();
      const rows = users.map((user, index) =>
        this.userToCsvRow(user, maxId + index + 1)
      );
      await this.csvWriter.writeRecords(rows);
    } catch (error) {
      console.error('Erro ao adicionar usuários ao CSV:', error);
      throw new Error('Falha ao adicionar usuários ao CSV');
    }
  }

  /**
   * Lê todos os usuários do arquivo CSV
   */
  async getAllUsers(): Promise<User[]> {
    return new Promise((resolve, reject) => {
      const users: User[] = [];
      fs.createReadStream(this.csvPath)
        .pipe(csv())
        .on('data', (row) => {
          users.push(this.csvRowToUser(row));
        })
        .on('end', () => {
          resolve(users);
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }

  /**
   * Busca um usuário por ID
   */
  async getUserById(id: number): Promise<User | null> {
    const users = await this.getAllUsers();
    return users.find((u) => u.id === id) || null;
  }

  /**
   * Atualiza um usuário no arquivo CSV
   * Preserva a integridade do arquivo reescrevendo tudo
   */
  async updateUser(id: number, updatedUser: Partial<User>): Promise<User | null> {
    const users = await this.getAllUsers();
    const userIndex = users.findIndex((u) => u.id === id);

    if (userIndex === -1) {
      return null;
    }

    // Atualiza o usuário
    users[userIndex] = { ...users[userIndex], ...updatedUser };

    // Reescreve o arquivo completo preservando a ordem
    await this.rewriteCsvFile(users);

    return users[userIndex];
  }

  /**
   * Remove um usuário do arquivo CSV
   * Preserva a integridade do arquivo reescrevendo tudo
   */
  async deleteUser(id: number): Promise<boolean> {
    const users = await this.getAllUsers();
    const userIndex = users.findIndex((u) => u.id === id);

    if (userIndex === -1) {
      return false;
    }

    // Remove o usuário
    users.splice(userIndex, 1);

    // Reescreve o arquivo completo preservando a ordem
    await this.rewriteCsvFile(users);

    return true;
  }

  /**
   * Busca usuários com base em critérios de pesquisa
   */
  async searchUsers(
    searchTerm: string,
    fields: string[] = ['first_name', 'last_name', 'email']
  ): Promise<User[]> {
    const users = await this.getAllUsers();
    const lowerSearchTerm = searchTerm.toLowerCase();

    return users.filter((user) => {
      return fields.some((field) => {
        const value = this.getFieldValue(user, field);
        return value && value.toString().toLowerCase().includes(lowerSearchTerm);
      });
    });
  }

  /**
   * Obtém o valor de um campo do usuário usando notação de ponto
   */
  private getFieldValue(user: User, field: string): any {
    const parts = field.split('.');
    let value: any = user;
    for (const part of parts) {
      value = value?.[part];
    }
    return value;
  }

  /**
   * Obtém o maior ID do arquivo CSV
   */
  private async getMaxId(): Promise<number> {
    const users = await this.getAllUsers();
    if (users.length === 0) {
      return 0;
    }
    return Math.max(...users.map((u) => u.id));
  }

  async rewriteCsvFile(users: User[]): Promise<void> {
    const writer = createObjectCsvWriter({
      path: this.csvPath,
      header: [
        { id: 'id', title: 'id' },
        { id: 'uid', title: 'uid' },
        { id: 'first_name', title: 'first_name' },
        { id: 'last_name', title: 'last_name' },
        { id: 'username', title: 'username' },
        { id: 'email', title: 'email' },
        { id: 'avatar', title: 'avatar' },
        { id: 'gender', title: 'gender' },
        { id: 'phone_number', title: 'phone_number' },
        { id: 'social_insurance_number', title: 'social_insurance_number' },
        { id: 'date_of_birth', title: 'date_of_birth' },
        { id: 'employment_title', title: 'employment_title' },
        { id: 'employment_key_skill', title: 'employment_key_skill' },
        { id: 'address_city', title: 'address_city' },
        { id: 'address_street_name', title: 'address_street_name' },
        { id: 'address_street_address', title: 'address_street_address' },
        { id: 'address_zip_code', title: 'address_zip_code' },
        { id: 'address_state', title: 'address_state' },
        { id: 'address_country', title: 'address_country' },
        { id: 'credit_card_cc_number', title: 'credit_card_cc_number' },
        { id: 'subscription_plan', title: 'subscription_plan' },
        { id: 'subscription_status', title: 'subscription_status' },
        { id: 'subscription_payment_method', title: 'subscription_payment_method' },
        { id: 'subscription_term', title: 'subscription_term' },
      ],
    });

    const rows = users.map((user) => this.userToCsvRow(user, user.id));
    await writer.writeRecords(rows);
  }
}
