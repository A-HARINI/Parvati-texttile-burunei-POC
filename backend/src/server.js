import 'dotenv/config';
import dns from 'node:dns';
import app from './app.js';
import { connectDatabase } from './config/db.js';
import { seedSuperAdmin } from './utils/seedSuperAdmin.js';

const port = Number(process.env.PORT) || 4000;
dns.setServers(['8.8.8.8', '1.1.1.1']);

async function start() {
  await connectDatabase();
  await seedSuperAdmin();
  app.listen(port, () => {
    console.log(`API http://localhost:${port}`);
  });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
