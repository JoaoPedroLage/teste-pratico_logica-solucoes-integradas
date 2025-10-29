/**
 * Servidor principal da aplicação
 * Responsável por inicializar o Express e configurar as rotas
 */
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { UserRoutes } from './routes/UserRoutes';

// Carrega variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas
app.use('/api/users', UserRoutes);

// Rota de health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Servidor funcionando' });
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
