/**
 * Serviço para consumo da API externa random-data-api
 */
import axios, { AxiosInstance } from 'axios';
import dns from 'dns';
import { User } from '../models/User';

export class ApiService {
  private client: AxiosInstance;
  private readonly baseUrl = 'https://random-data-api.com/api/v2';
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000; // 1 segundo

  constructor() {
    const dnsServers = process.env.DNS_SERVERS;
    if (dnsServers) {
      try {
        const servers = dnsServers.split(',').map(s => s.trim());
        dns.setServers(servers);
        console.log(`DNS configurado para usar servidores: ${servers.join(', ')}`);
      } catch (error) {
        console.warn('Erro ao configurar DNS alternativo:', error);
      }
    }

    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
      validateStatus: (status) => status < 500,
    });
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private generateMockUsers(count: number): User[] {
    const mockUsers: User[] = [];
    const firstNames = ['João', 'Maria', 'Pedro', 'Ana', 'Carlos', 'Julia', 'Rafael', 'Fernanda'];
    const lastNames = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Costa', 'Pereira', 'Almeida', 'Lima'];
    const cities = ['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Curitiba'];
    const states = ['SP', 'RJ', 'MG', 'PR'];
    const countries = ['Brasil'];
    const nats = ['BR'];

    for (let i = 0; i < count; i++) {
      const first = firstNames[Math.floor(Math.random() * firstNames.length)];
      const last = lastNames[Math.floor(Math.random() * lastNames.length)];
      const city = cities[Math.floor(Math.random() * cities.length)];
      const state = states[Math.floor(Math.random() * states.length)];
      const country = countries[0];
      const email = `${first.toLowerCase()}.${last.toLowerCase()}${i}@example.com`;
      const username = `${first.toLowerCase()}.${last.toLowerCase()}${i}`;
      const phone = `+55 ${Math.floor(10 + Math.random() * 89)} ${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
      const cell = `+55 ${Math.floor(10 + Math.random() * 89)} 9${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;

      mockUsers.push({
        gender: Math.random() > 0.5 ? 'male' : 'female',
        name: {
          title: Math.random() > 0.5 ? 'Sr.' : 'Sra.',
          first,
          last,
        },
        location: {
          street: {
            number: Math.floor(Math.random() * 9999) + 1,
            name: `Rua ${Math.floor(Math.random() * 1000)}`,
          },
          city,
          state,
          country,
          postcode: `${Math.floor(Math.random() * 90000) + 10000}`,
          coordinates: {
            latitude: (-23.5505 + (Math.random() - 0.5) * 0.1).toFixed(6),
            longitude: (-46.6333 + (Math.random() - 0.5) * 0.1).toFixed(6),
          },
          timezone: {
            offset: '-03:00',
            description: 'Brasília',
          },
        },
        email,
        login: {
          uuid: `${Date.now()}-${i}`,
          username,
        },
        dob: {
          date: new Date(1980 + Math.floor(Math.random() * 25), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString(),
          age: 20 + Math.floor(Math.random() * 40),
        },
        registered: {
          date: new Date(2010 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString(),
          age: 1 + Math.floor(Math.random() * 10),
        },
        phone,
        cell,
        id: {
          name: 'SSN',
          value: `${Math.floor(Math.random() * 900000000) + 100000000}`,
        },
        picture: {
          large: `https://ui-avatars.com/api/?name=${encodeURIComponent(`${first} ${last}`)}&size=256`,
          medium: `https://ui-avatars.com/api/?name=${encodeURIComponent(`${first} ${last}`)}&size=128`,
          thumbnail: `https://ui-avatars.com/api/?name=${encodeURIComponent(`${first} ${last}`)}&size=64`,
        },
        nat: nats[0],
      });
    }

    return mockUsers;
  }

  /**
   * Busca usuários da API com retry automático
   */
  async fetchUsers(size: number = 10, useFallback: boolean = true): Promise<User[]> {
    let lastError: any = null;
    
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          const delayMs = this.retryDelay * Math.pow(2, attempt - 1);
          console.log(`Tentativa ${attempt + 1}/${this.maxRetries} após ${delayMs}ms...`);
          await this.delay(delayMs);
        }
        
        console.log(`Buscando ${size} usuários da API: ${this.baseUrl}/users?size=${size} (tentativa ${attempt + 1})`);
        const response = await this.client.get<User[]>(`/users?size=${size}`);
        console.log(`✅ Resposta recebida: ${response.status} - ${response.data?.length || 0} usuários`);
        
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          return response.data;
        }
        
        throw new Error('Resposta vazia ou inválida da API');
      } catch (error: any) {
        lastError = error;
        console.error(`❌ Tentativa ${attempt + 1} falhou:`, error.message || error);
        
        if (error.response && error.response.status >= 400 && error.response.status < 500) {
          break;
        }
        
        if (attempt === this.maxRetries - 1) {
          if ((error.code === 'EAI_AGAIN' || error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') && useFallback) {
            console.warn('⚠️ API externa indisponível. Usando dados mock como fallback.');
            return this.generateMockUsers(size);
          }
        }
      }
    }
    
    const dnsError = lastError?.code === 'EAI_AGAIN' || lastError?.code === 'ENOTFOUND';
    throw new Error(
      dnsError
        ? 'Não foi possível resolver o endereço da API externa após múltiplas tentativas. Verifique sua conexão com a internet e as configurações de DNS.'
        : `Falha ao buscar usuários da API após ${this.maxRetries} tentativas: ${lastError?.message || 'Erro desconhecido'}`
    );
  }

  /**
   * Busca um único usuário da API
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
