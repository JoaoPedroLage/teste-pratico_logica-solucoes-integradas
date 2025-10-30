/**
 * Serviço para gerenciamento de operações com arquivo CSV
 * ATUALIZADO para ser compatível com a interface User (de randomuser.me)
 */
import * as fs from 'fs';
import * as path from 'path';
import csv from 'csv-parser';
import { createObjectCsvWriter } from 'csv-writer';
import { User } from '../models/User';
import { merge as deepMerge } from 'lodash';

// Define a lista de cabeçalhos do CSV baseada na interface User
const csvHeaders = [
  { id: 'csv_id', title: 'csv_id' }, // Nosso ID interno do banco
  { id: 'gender', title: 'gender' },
  { id: 'name_title', title: 'name_title' },
  { id: 'name_first', title: 'name_first' },
  { id: 'name_last', title: 'name_last' },
  { id: 'location_street_number', title: 'location_street_number' },
  { id: 'location_street_name', title: 'location_street_name' },
  { id: 'location_city', title: 'location_city' },
  { id: 'location_state', title: 'location_state' },
  { id: 'location_country', title: 'location_country' },
  { id: 'location_postcode', title: 'location_postcode' },
  { id: 'location_coords_lat', title: 'location_coords_lat' },
  { id: 'location_coords_long', title: 'location_coords_long' },
  { id: 'location_tz_offset', title: 'location_tz_offset' },
  { id: 'location_tz_desc', title: 'location_tz_desc' },
  { id: 'email', title: 'email' },
  { id: 'login_uuid', title: 'login_uuid' },
  { id: 'login_username', title: 'login_username' },
  { id: 'dob_date', title: 'dob_date' },
  { id: 'dob_age', title: 'dob_age' },
  { id: 'registered_date', title: 'registered_date' },
  { id: 'registered_age', title: 'registered_age' },
  { id: 'phone', title: 'phone' },
  { id: 'cell', title: 'cell' },
  { id: 'id_name', title: 'id_name' }, // Propriedade 'id' da API
  { id: 'id_value', title: 'id_value' }, // Propriedade 'id' da API
  { id: 'picture_large', title: 'picture_large' },
  { id: 'picture_medium', title: 'picture_medium' },
  { id: 'picture_thumbnail', title: 'picture_thumbnail' },
  { id: 'nat', title: 'nat' },
];

// Define o tipo de retorno do serviço: o User da API + nosso csv_id
type StoredUser = User & { csv_id: number };

export class CsvService {
  private csvPath: string;
  private csvWriter: any;

  constructor(csvPath: string, ownerId: number) {
    this.csvPath = csvPath.replace(/\.csv$/, `_${ownerId}.csv`);
    this.ensureCsvFileExists();
    this.initializeCsvWriter();
  }

  private ensureCsvFileExists(): void {
    const dir = path.dirname(this.csvPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(this.csvPath)) {
      // Cria o cabeçalho com base nos títulos
      const header = csvHeaders.map((h) => h.title).join(',');
      fs.writeFileSync(this.csvPath, header + '\n');
    }
  }

  private initializeCsvWriter(): void {
    this.csvWriter = createObjectCsvWriter({
      path: this.csvPath,
      header: csvHeaders,
      append: true,
    });
  }

  /**
   * Converte um objeto User (da API) para uma linha plana de CSV
   */
  private userToCsvRow(user: User, csv_id: number): any {
    return {
      csv_id: csv_id.toString(),
      gender: user.gender || '',
      name_title: user.name?.title || '',
      name_first: user.name?.first || '',
      name_last: user.name?.last || '',
      location_street_number: user.location?.street?.number || '',
      location_street_name: user.location?.street?.name || '',
      location_city: user.location?.city || '',
      location_state: user.location?.state || '',
      location_country: user.location?.country || '',
      location_postcode: user.location?.postcode || '',
      location_coords_lat: user.location?.coordinates?.latitude || '',
      location_coords_long: user.location?.coordinates?.longitude || '',
      location_tz_offset: user.location?.timezone?.offset || '',
      location_tz_desc: user.location?.timezone?.description || '',
      email: user.email || '',
      login_uuid: user.login?.uuid || '',
      login_username: user.login?.username || '',
      dob_date: user.dob?.date || '',
      dob_age: user.dob?.age || '',
      registered_date: user.registered?.date || '',
      registered_age: user.registered?.age || '',
      phone: user.phone || '',
      cell: user.cell || '',
      id_name: user.id?.name || '',
      id_value: user.id?.value || '',
      picture_large: user.picture?.large || '',
      picture_medium: user.picture?.medium || '',
      picture_thumbnail: user.picture?.thumbnail || '',
      nat: user.nat || '',
    };
  }

  /**
   * Converte uma linha CSV de volta para um objeto User aninhado
   */
  private csvRowToUser(row: any): StoredUser {
    return {
      csv_id: parseInt(row.csv_id, 10), // Adiciona nosso ID interno
      gender: row.gender,
      name: {
        title: row.name_title,
        first: row.name_first,
        last: row.name_last,
      },
      location: {
        street: {
          number: parseInt(row.location_street_number, 10),
          name: row.location_street_name,
        },
        city: row.location_city,
        state: row.location_state,
        country: row.location_country,
        postcode: row.location_postcode,
        coordinates: {
          latitude: row.location_coords_lat,
          longitude: row.location_coords_long,
        },
        timezone: {
          offset: row.location_tz_offset,
          description: row.location_tz_desc,
        },
      },
      email: row.email,
      login: {
        uuid: row.login_uuid,
        username: row.login_username,
      },
      dob: {
        date: row.dob_date,
        age: parseInt(row.dob_age, 10),
      },
      registered: {
        date: row.registered_date,
        age: parseInt(row.registered_age, 10),
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
   * Adiciona usuários (vindos da API) ao arquivo CSV
   */
  async addUsers(users: User[]): Promise<void> {
    try {
      const maxId = await this.getMaxCsvId();
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
  async getAllUsers(): Promise<StoredUser[]> {
    return new Promise((resolve, reject) => {
      const users: StoredUser[] = [];
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
   * Busca um usuário pelo ID interno do CSV
   */
  async getUserByCsvId(id: number): Promise<StoredUser | null> {
    const users = await this.getAllUsers();
    return users.find((u) => u.csv_id === id) || null;
  }

 /**
   * Atualiza um usuário no arquivo CSV usando mesclagem profunda (deep merge)
   */
 async updateUser(
  csv_id: number,
  updatedData: Partial<User>
): Promise<StoredUser | null> {
  const users = await this.getAllUsers();
  const userIndex = users.findIndex((u) => u.csv_id === csv_id);

  if (userIndex === -1) {
    return null;
  }

  const originalUser = users[userIndex];

  // Usa o deepMerge do lodash.
  // Ele mescla 'updatedData' *sobre* 'originalUser' e lida com objetos aninhados.
  // Criamos um novo objeto {} como primeiro argumento para não mutar o original
  // (embora neste caso pudéssemos mutar 'originalUser' se quiséssemos).
  const updatedUser: StoredUser = deepMerge({}, originalUser, updatedData);

  // O csv_id é preservado, pois estava em 'originalUser' e não em 'updatedData'
  users[userIndex] = updatedUser;

  await this.rewriteCsvFile(users);
  return users[userIndex];
}

  /**
   * Remove um usuário do arquivo CSV pelo ID interno
   */
  async deleteUser(csv_id: number): Promise<boolean> {
    const users = await this.getAllUsers();
    const userIndex = users.findIndex((u) => u.csv_id === csv_id);

    if (userIndex === -1) {
      return false;
    }

    users.splice(userIndex, 1);
    await this.rewriteCsvFile(users);
    return true;
  }

  /**
   * Busca usuários com base em critérios de pesquisa
   * Campos padrão atualizados para o novo modelo
   */
  async searchUsers(
    searchTerm: string,
    fields: string[] = ['name.first', 'name.last', 'email', 'login.username']
  ): Promise<StoredUser[]> {
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
   * Obtém o valor de um campo do usuário usando notação de ponto (ex: 'name.first')
   */
  private getFieldValue(user: StoredUser, field: string): any {
    const parts = field.split('.');
    let value: any = user;
    for (const part of parts) {
      if (value === null || typeof value === 'undefined') {
        return undefined;
      }
      value = value[part];
    }
    return value;
  }

  /**
   * Obtém o maior ID interno do arquivo CSV
   */
  private async getMaxCsvId(): Promise<number> {
    const users = await this.getAllUsers();
    if (users.length === 0) {
      return 0;
    }
    return Math.max(...users.map((u) => u.csv_id));
  }

  /**
   * Reescreve o arquivo CSV com a lista de usuários fornecida
   */
  async rewriteCsvFile(users: StoredUser[]): Promise<void> {
    const writer = createObjectCsvWriter({
      path: this.csvPath,
      header: csvHeaders,
      // append: false é o padrão, o que sobrescreve o arquivo
    });

    // Mapeia os StoredUser de volta para linhas, passando o csv_id
    const rows = users.map((user) => this.userToCsvRow(user, user.csv_id));
    await writer.writeRecords(rows);
  }
}