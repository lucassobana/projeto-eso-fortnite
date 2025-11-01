import 'dotenv/config'
import axios from 'axios';
import { prisma } from '../lib/prisma.js'; // Importamos nosso cliente Prisma

// ==========================================================
// 1. CORREÇÃO NAS URLS (pt-BR)
// ==========================================================
const API_URL = 'https://fortnite-api.com/v2';
const COSMETICS_URL = `${API_URL}/cosmetics/br`; // Este está OK
const NEW_COSMETICS_URL = `${API_URL}/cosmetics/new?language=pt-BR`; // <-- CORRIGIDO
const SHOP_URL = `${API_URL}/shop?language=pt-BR`; // <-- CORRIGIDO
// ==========================================================

const API_KEY = process.env.FORTNITE_API_KEY;

// Se a chave não for encontrada, para o script
if (!API_KEY) {
  throw new Error('FORTNITE_API_KEY não encontrada. Verifique seu arquivo .env');
}

// Cria o cabeçalho (header) de autenticação
const headers = {
  'Authorization': API_KEY
};

// Interfaces para tipar os dados da API (simplificado)
interface ApiCosmetic {
  id: string;
  name: string;
  description: string | null;
  type: {
    value: string; // "outfit", "backpack" etc.
  } | null;
  rarity: {
    value: string; // "rare", "epic" etc.
  } | null;
  images: {
    icon: string | null;
  } | null;
  price?: number; // Opcional, nem todos têm preço
}

// Função principal de sincronia
export async function syncFortniteApi() {
  console.log('Iniciando sincronização com a API do Fortnite...');

  try {
    // 1. Buscar todos os cosméticos
    console.log('Buscando /cosmetics...');
    const cosmeticsResponse = await axios.get(COSMETICS_URL, { headers });
    const allCosmeticsData = cosmeticsResponse.data.data;
    // CORREÇÃO: Checa se 'allCosmeticsData' é realmente um array
    const allCosmetics = Array.isArray(allCosmeticsData)
      ? allCosmeticsData
      : [];

    // 2. Buscar cosméticos "novos"
    console.log('Buscando /cosmetics/new...');
    const newCosmeticsResponse = await axios.get(NEW_COSMETICS_URL, { headers });

    // CORREÇÃO: O caminho correto é data.data.items.br
    const newCosmeticsData = newCosmeticsResponse.data.data; // <-- CORRIGIDO
    const newCosmeticsArray = (newCosmeticsData && newCosmeticsData.items && Array.isArray(newCosmeticsData.items.br)) // <-- CORRIGIDO
      ? newCosmeticsData.items.br // <-- CORRIGIDO
      : [];

    // Criamos um 'Set' para busca rápida (O(1)) dos IDs que são novos
    const newCosmeticIds = new Set(newCosmeticsArray.map((c: ApiCosmetic) => c.id));

    // 3. Buscar cosméticos "à venda" (shop)
    console.log('Buscando /shop...');
    const shopResponse = await axios.get(SHOP_URL, { headers });

    const shopData = shopResponse.data.data; // Este é um objeto, não um array

    // Criamos um 'Map' para busca rápida dos IDs e seus preços
    const shopCosmeticsMap = new Map<string, number>();

    const shopEntries = (shopData && Array.isArray(shopData.entries))
      ? shopData.entries
      : [];

    // Iteramos por essa lista de "entries"
    shopEntries.forEach((entry: any) => {
      // O preço está na "entry" (pacote)
      const price = entry.finalPrice || 0;

      // Os itens estão dentro de "brItems" (como o JSON que você mandou)
      if (Array.isArray(entry.brItems)) {
        entry.brItems.forEach((item: any) => {
          shopCosmeticsMap.set(item.id, price);
        });
      }
    });

    console.log(`Encontrados ${allCosmetics.length} cosméticos no total.`);
    console.log(`Encontrados ${newCosmeticIds.size} cosméticos novos.`);
    console.log(`Encontrados ${shopCosmeticsMap.size} cosméticos à venda.`);

    // 4. Processar e salvar no nosso banco de dados
    console.log('Iniciando transação com o banco de dados...');

    // Pular se a lista principal estiver vazia
    if (allCosmetics.length === 0) {
      console.log('Nenhum cosmético principal encontrado. A transação será pulada.');
      await prisma.$disconnect(); // Desconecta antes de sair
      return;
    }

    const transactions = allCosmetics.map((cosmetic: ApiCosmetic) => {
      // Verificamos os status
      const isNew = newCosmeticIds.has(cosmetic.id);
      const isOnSale = shopCosmeticsMap.has(cosmetic.id);
      const price = shopCosmeticsMap.get(cosmetic.id) || 0;

      // Preparamos os dados para o nosso schema do Prisma
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

    // Executa todas as operações de upsert
    await prisma.$transaction(transactions);

    console.log('✅ Sincronização concluída com sucesso!');

  } catch (error: any) { // Tipando o erro para inspecioná-lo

    // Se for um erro do Axios, imprime a resposta da API
    if (axios.isAxiosError(error) && error.response) {
      console.error('❌ Erro na resposta da API:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('❌ Erro durante a sincronização:', error);
    }

  } finally {
    // 5. Desconecta do banco de dados ao final
    await prisma.$disconnect();
  }
}
