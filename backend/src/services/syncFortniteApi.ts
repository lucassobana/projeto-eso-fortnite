import 'dotenv/config'
import axios from 'axios';
import { prisma } from '../lib/prisma.js';

const API_URL = 'https://fortnite-api.com/v2';
const COSMETICS_URL = `${API_URL}/cosmetics/br`;
const NEW_COSMETICS_URL = `${API_URL}/cosmetics/new?language=pt-BR`;
const SHOP_URL = `${API_URL}/shop?language=pt-BR`;

const API_KEY = process.env.FORTNITE_API_KEY;

if (!API_KEY) {
  throw new Error('FORTNITE_API_KEY não encontrada. Verifique seu arquivo .env');
}

const headers = {
  'Authorization': API_KEY
};

interface ApiCosmetic {
  id: string;
  name: string;
  description: string | null;
  type: {
    value: string;
  } | null;
  rarity: {
    value: string;
  } | null;
  images: {
    icon: string | null;
  } | null;
  price?: number;
}

export async function syncFortniteApi() {
  console.log('Iniciando sincronização com a API do Fortnite...');

  try {
    console.log('Buscando /cosmetics...');
    const cosmeticsResponse = await axios.get(COSMETICS_URL, { headers });
    const allCosmeticsData = cosmeticsResponse.data.data;
    const allCosmetics = Array.isArray(allCosmeticsData)
      ? allCosmeticsData
      : [];

    console.log('Buscando /cosmetics/new...');
    const newCosmeticsResponse = await axios.get(NEW_COSMETICS_URL, { headers });

    const newCosmeticsData = newCosmeticsResponse.data.data;
    const newCosmeticsArray = (newCosmeticsData && newCosmeticsData.items && Array.isArray(newCosmeticsData.items.br))
      ? newCosmeticsData.items.br
      : [];

    const newCosmeticIds = new Set(newCosmeticsArray.map((c: ApiCosmetic) => c.id));

    console.log('Buscando /shop...');
    const shopResponse = await axios.get(SHOP_URL, { headers });

    const shopData = shopResponse.data.data;

    const shopCosmeticsMap = new Map<string, number>();

    const shopEntries = (shopData && Array.isArray(shopData.entries))
      ? shopData.entries
      : [];

    shopEntries.forEach((entry: any) => {
      const price = entry.finalPrice || 0;

      if (Array.isArray(entry.brItems)) {
        entry.brItems.forEach((item: any) => {
          shopCosmeticsMap.set(item.id, price);
        });
      }
    });

    console.log(`Encontrados ${allCosmetics.length} cosméticos no total.`);
    console.log(`Encontrados ${newCosmeticIds.size} cosméticos novos.`);
    console.log(`Encontrados ${shopCosmeticsMap.size} cosméticos à venda.`);

    console.log('Iniciando transação com o banco de dados...');

    if (allCosmetics.length === 0) {
      console.log('Nenhum cosmético principal encontrado. A transação será pulada.');
      await prisma.$disconnect();
      return;
    }

    const transactions = allCosmetics.map((cosmetic: ApiCosmetic) => {
      const isNew = newCosmeticIds.has(cosmetic.id);
      const isOnSale = shopCosmeticsMap.has(cosmetic.id);
      const price = shopCosmeticsMap.get(cosmetic.id) || 0;

      const dataForDb = {
        id: cosmetic.id,
        name: cosmetic.name,
        description: cosmetic.description ?? null,
        type: cosmetic.type?.value ?? null,
        rarity: cosmetic.rarity?.value ?? null,
        imageUrl: cosmetic.images?.icon ?? null,
        price,
        isNew,
        isOnSale,
      };

      return prisma.cosmetic.upsert({
        where: { id: cosmetic.id },
        update: dataForDb,
        create: dataForDb,
      });
    });

    await prisma.$transaction(transactions);

    console.log('✅ Sincronização concluída com sucesso!');

  } catch (error: any) {

    if (axios.isAxiosError(error) && error.response) {
      console.error('❌ Erro na resposta da API:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('❌ Erro durante a sincronização:', error);
    }

  } finally {
    await prisma.$disconnect();
  }
}
