/**
 * Serviço para consumo da API externa Random User API (randomuser.me)
 */
import axios from 'axios';
import dns from 'dns';
import { User } from '../models/User';

export class ApiService {
  private readonly baseUrl = 'https://randomuser.me/api';
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
   * Busca usuários da Random User API com retry automático
   * @param size Número de resultados (1-5000)
   * @param gender Filtro por gênero ('male' ou 'female') - opcional
   * @param nat Filtro por nacionalidade (ex: 'BR', 'US') - opcional
   */
  async fetchUsers(size: number = 10, gender?: string, nat?: string): Promise<User[]> {
    let lastError: any = null;
    
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          const delayMs = this.retryDelay * Math.pow(2, attempt - 1);
          console.log(`Tentativa ${attempt + 1}/${this.maxRetries} após ${delayMs}ms...`);
          await this.delay(delayMs);
        }
        
        // Monta a URL com os parâmetros suportados pela Random User API
        const params: string[] = [];
        params.push(`results=${size}`);
        if (gender) params.push(`gender=${encodeURIComponent(gender)}`);
        if (nat) params.push(`nat=${encodeURIComponent(nat)}`);
        const query = params.length ? `?${params.join('&')}` : '';
        const url = `${this.baseUrl}${query}`;
        
        console.log(`Buscando ${size} usuários da Random User API: ${url} (tentativa ${attempt + 1})`);
        const response = await axios.get<{ results: User[] }>(url, {
          timeout: 30000,
          validateStatus: (status) => status < 500,
        });
        
        if (response.data && response.data.results && Array.isArray(response.data.results) && response.data.results.length > 0) {
          console.log(`✅ Resposta recebida: ${response.status} - ${response.data.results.length} usuários`);
          return response.data.results;
        }
        
        throw new Error('Resposta vazia ou inválida da API');
      } catch (error: any) {
        lastError = error;
        console.error(`❌ Tentativa ${attempt + 1} falhou:`, error.message || error);
        
        // Erros 4xx (client error) não devem ser tentados novamente nem usar fallback
        // São erros de parâmetros inválidos, autenticação, etc.
        if (error.response && error.response.status >= 400 && error.response.status < 500) {
          throw new Error(`Erro do cliente (${error.response.status}): ${error.response.data?.error || error.message || 'Parâmetros inválidos'}`);
        }
      }
    }
    
    // Se todas as tentativas falharam (exceto 4xx), usa fallback com dados mock
    console.warn('⚠️ API externa indisponível após múltiplas tentativas. Usando dados mock como fallback.');
    console.warn(`Último erro: ${lastError?.message || lastError?.code || 'Erro desconhecido'}`);
    return this.generateMockUsers(size);
  }

  /**
   * Busca um único usuário da Random User API
   * Usa fallback automático se a API estiver indisponível
   */
  async fetchSingleUser(): Promise<User> {
    try {
      const url = `${this.baseUrl}?results=1`;
      const response = await axios.get<{ results: User[] }>(url, {
        timeout: 30000,
        validateStatus: (status) => status < 500,
      });
      
      if (response.data && response.data.results && response.data.results.length > 0) {
        return response.data.results[0];
      }
      
      throw new Error('Resposta vazia ou inválida da API');
    } catch (error) {
      console.warn('⚠️ API externa indisponível. Usando dados mock como fallback.');
      // Retorna um usuário mock como fallback
      const mockUsers = this.generateMockUsers(1);
      return mockUsers[0];
    }
  }
}
