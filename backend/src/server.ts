import express from 'express';
import cors from 'cors';
// import cron from 'node-cron';

import { cosmeticRoutes } from './routes/cosmeticRoutes.js';
// import { syncFortniteApi } from './services/syncFortniteApi.js';

async function startServer() {
  const app = express();
  const port = process.env.PORT || 3333;

  app.use(cors());
  app.use(express.json());

  app.use('/api', cosmeticRoutes);

  // console.log('Sincronização inicial em andamento...');
  // await syncFortniteApi();
  // console.log('Sincronização inicial concluída.');

  // cron.schedule('0 8 * * *', async () => {
  //   console.log('Executando sincronização agendada (às 8:00 da manhã)...');
  //   await syncFortniteApi();
  //   console.log('Sincronização agendada concluída.');
  // });

  app.listen(port, () => {
    console.log(`🚀 Servidor backend rodando em http://localhost:${port}`);
  });
}

startServer();
