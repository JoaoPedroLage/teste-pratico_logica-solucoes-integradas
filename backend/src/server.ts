/**
 * Servidor principal da aplicação
 * Responsável por inicializar o Express e configurar as rotas
 */
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { UserRoutes } from './routes/UserRoutes';
import { AuthRoutes } from './routes/AuthRoutes';

dotenv.config();

const app = express();
const DEFAULT_PORT = parseInt(process.env.PORT || '3001', 10);

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas
app.use('/api/auth', AuthRoutes);
app.use('/api/users', UserRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Servidor funcionando' });
});

/**
 * Inicia o servidor na primeira porta disponível
 */
function startServer(port: number = DEFAULT_PORT): void {
  const server = app.listen(port, () => {
    console.log(`✅ Servidor rodando na porta ${port}`);
    if (port !== DEFAULT_PORT) {
      console.log(`⚠️  Porta ${DEFAULT_PORT} ocupada. Usando porta ${port}.`);
      console.log(`   Frontend: defina NEXT_PUBLIC_BACKEND_PORT=${port}`);
    }
  });

  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Porta ${port} ocupada. Tentando ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('❌ Erro ao iniciar servidor:', err);
      process.exit(1);
    }
  });
}

startServer();