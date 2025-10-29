/**
 * Utilitário para detectar e usar a porta correta do backend
 * Adaptável via variáveis de ambiente
 */
import axios from 'axios';

let cachedBackendPort: string | null = null;
let cachedBackendHost: string | null = null;

/**
 * Limpa o cache da porta do backend
 * Útil quando o backend pode ter mudado de porta ou foi reiniciado
 */
export function clearBackendPortCache(): void {
  cachedBackendPort = null;
  cachedBackendHost = null;
}

/**
 * Obtém o host do backend a partir das variáveis de ambiente
 */
function getBackendHost(): string {
  if (cachedBackendHost) {
    return cachedBackendHost;
  }

  // Usa variável de ambiente ou padrão
  const envHost = process.env.NEXT_PUBLIC_BACKEND_HOST || 'localhost';
  cachedBackendHost = envHost;
  return envHost;
}

/**
 * Tenta descobrir em qual porta o backend está rodando
 * Testa portas sequenciais começando pela padrão ou da variável de ambiente
 */
async function discoverBackendPort(): Promise<string> {
  // Se já temos a porta cached, retorna
  if (cachedBackendPort) {
    return cachedBackendPort;
  }

  // Tenta a porta da variável de ambiente primeiro
  const envPort = process.env.NEXT_PUBLIC_BACKEND_PORT;
  if (envPort) {
    // Se a porta está definida na variável de ambiente, testa se está disponível
    const host = getBackendHost();
    const protocol = process.env.NEXT_PUBLIC_BACKEND_PROTOCOL || 'http';
    try {
      const response = await axios.get(`${protocol}://${host}:${envPort}/health`, {
        timeout: parseInt(process.env.NEXT_PUBLIC_BACKEND_TIMEOUT || '1000', 10),
      });
      if (response.data.status === 'OK') {
        cachedBackendPort = envPort;
        return envPort;
      }
    } catch (error) {
      // Se a porta definida não está disponível, continua com a busca automática
      console.warn(`Porta ${envPort} definida em NEXT_PUBLIC_BACKEND_PORT não está disponível. Tentando buscar automaticamente...`);
    }
  }

  // Tenta portas sequenciais começando da porta padrão
  const startPort = parseInt(envPort || process.env.NEXT_PUBLIC_BACKEND_PORT || '3001', 10);
  const maxAttempts = parseInt(process.env.NEXT_PUBLIC_BACKEND_PORT_RANGE || '5', 10);
  const host = getBackendHost();

  for (let i = 0; i < maxAttempts; i++) {
    const port = startPort + i;
    try {
      const protocol = process.env.NEXT_PUBLIC_BACKEND_PROTOCOL || 'http';
      const response = await axios.get(`${protocol}://${host}:${port}/health`, {
        timeout: parseInt(process.env.NEXT_PUBLIC_BACKEND_TIMEOUT || '1000', 10),
      });
      
      if (response.data.status === 'OK') {
        cachedBackendPort = port.toString();
        return port.toString();
      }
    } catch (error) {
      // Continua tentando próxima porta
      continue;
    }
  }

  // Fallback: retorna porta padrão da variável de ambiente ou 3001
  return envPort || process.env.NEXT_PUBLIC_BACKEND_PORT || '3001';
}

/**
 * Obtém a URL base da API do backend
 * @throws {Error} Se não conseguir encontrar o backend em nenhuma porta
 */
export async function getBackendApiUrl(): Promise<string> {
  const host = getBackendHost();
  const port = await discoverBackendPort();
  const protocol = process.env.NEXT_PUBLIC_BACKEND_PROTOCOL || 'http';
  const url = `${protocol}://${host}:${port}/api/users`;
  
  // Verifica se o backend está realmente disponível
  try {
    const healthUrl = `${protocol}://${host}:${port}/health`;
    const response = await axios.get(healthUrl, {
      timeout: parseInt(process.env.NEXT_PUBLIC_BACKEND_TIMEOUT || '2000', 10),
    });
    
    if (response.data.status !== 'OK') {
      throw new Error(`Backend na porta ${port} não está respondendo corretamente`);
    }
  } catch (error: any) {
    // Se não conseguiu conectar, lança erro informativo
    if (error.code === 'ECONNREFUSED' || error.message.includes('timeout') || error.message.includes('Network Error')) {
      throw new Error(
        `Não foi possível conectar ao backend na porta ${port}. ` +
        `Certifique-se de que o backend está rodando. ` +
        `Execute: cd backend && npm run dev`
      );
    }
    throw error;
  }
  
  return url;
}