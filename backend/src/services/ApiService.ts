/**
 * Serviço responsável por consumir a API externa
 * Seguindo o princípio de Responsabilidade Única (SOLID)
 */
import axios, { AxiosInstance } from 'axios';
import { User } from '../models/User';

export class ApiService {
  private client: AxiosInstance;
  private readonly baseUrl = 'https://random-data-api.com/api/v2';

  constructor() {
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Busca uma lista de usuários da API
   * @param size Quantidade de usuários a buscar (padrão: 10)
   * @returns Promise com array de usuários
   */
  async fetchUsers(size: number = 10): Promise<User[]> {
    try {
      const response = await this.client.get<User[]>(`/users?size=${size}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar usuários da API:', error);
      throw new Error('Falha ao buscar usuários da API');
    }
  }

  /**
   * Busca um único usuário da API
   * @returns Promise com um usuário
   */
  async fetchSingleUser(): Promise<User> {
    try {
      const response = await this.client.get<User>('/users');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar usuário da API:', error);
      throw new Error('Falha ao buscar usuário da API');
    }
  }
}
