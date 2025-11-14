import express from 'express';
import cors from 'cors';
import cron from 'node-cron';

import { cosmeticRoutes } from './routes/cosmeticRoutes.js';
import { syncFortniteApi } from './services/syncFortniteApi.js';
import { auth } from './routes/auth.js';
import { inventoryRoutes } from './routes/inventoryRoutes.js';
import { usersRoutes } from './routes/userRoutes.js';

async function startServer() {
  const app = express();
  const port = parseInt(process.env.PORT || "4000", 10);
  const HOST = '0.0.0.0';

  app.use(cors());
  app.use(express.json());

  app.use('/api', cosmeticRoutes, usersRoutes);
  app.use('/api/auth', auth);
  app.use('/api/user', inventoryRoutes);

  console.log('Sincronização inicial em andamento...');
  await syncFortniteApi();
  console.log('Sincronização inicial concluída.');

  cron.schedule('0 */4 * * *', async () => {
    console.log('Executando sincronização agendada (a cada 4 horas)...');
    await syncFortniteApi();
    console.log('Sincronização agendada concluída.');
  });

  app.listen(port, HOST, () => {
    console.log(`🚀 Servidor backend rodando em http://${HOST}:${port}`);
    console.log(`Sincronização automática agendada para cada 4 horas.`);

    console.log('Disparando sincronização inicial em background...');
    syncFortniteApi().then(() => {
      console.log('Sincronização inicial em background concluída.');
    }).catch(err => {
      console.error('Erro na sincronização inicial em background:', err);
    });
  });
}

startServer();
