// src/server.ts
import express from 'express';
import cors from 'cors';
import cron from 'node-cron'; // 1. Importa o agendador

import { cosmeticRoutes } from './routes/cosmeticRoutes.js';
import { syncFortniteApi } from './services/syncFortniteApi.js'; // 2. Importa sua função!

// Função principal para iniciar o servidor
async function startServer() {
  const app = express();
  const port = process.env.PORT || 3333;

  app.use(cors());
  app.use(express.json());

  // Rotas da API
  app.use('/api', cosmeticRoutes);

  // --- AUTOMAÇÃO DA SINCRONIZAÇÃO ---

  // 3. Roda a sincronização UMA VEZ assim que o servidor liga
  console.log('Sincronização inicial em andamento...');
  await syncFortniteApi();
  console.log('Sincronização inicial concluída.');

  // 4. Agenda a sincronização para rodar a cada 4 horas
  // (A string '0 */4 * * *' significa: "no minuto 0, a cada 4 horas, todo dia")
  cron.schedule('0 */4 * * *', async () => {
    console.log('Executando sincronização agendada (a cada 4 horas)...');
    await syncFortniteApi();
    console.log('Sincronização agendada concluída.');
  });
  // --- FIM DA AUTOMAÇÃO ---

  // Inicia o servidor
  app.listen(port, () => {
    console.log(`🚀 Servidor backend rodando em http://localhost:${port}`);
    console.log(`Sincronização automática agendada para cada 4 horas.`);
  });
}

// Executa a função principal
startServer();