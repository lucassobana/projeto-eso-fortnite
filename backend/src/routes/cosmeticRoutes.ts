import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { Prisma } from '@prisma/client';
import { syncFortniteApi } from '../services/syncFortniteApi.js';

const router = Router();

router.get('/cosmetics', async (req, res) => {
    try {
        const {
            name,        
            type,        
            rarity,      
            startDate,   
            endDate,     
            isNew,
            isOnSale
        } = req.query;

        const whereClause: Prisma.CosmeticWhereInput = {};

        if (name) {
            whereClause.name = {
                contains: String(name),
                mode: 'insensitive'
            };
        }

        if (type) {
            whereClause.type = String(type);
        }

        if (rarity) {
            whereClause.rarity = String(rarity);
        }

        const dateFilter: Prisma.DateTimeFilter = {}

        if (startDate) {
            dateFilter.gte = new Date(String(startDate)); 
        }
        if (endDate) {
            const adjustedEndDate = new Date(String(endDate));
            adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);
            dateFilter.lt = adjustedEndDate; 
        }

        if (Object.keys(dateFilter).length > 0) {
            whereClause.addedAt = dateFilter;
        }

        if (isNew === 'true') {
            whereClause.isNew = true;
        }

        if (isOnSale === 'true') {
            whereClause.isOnSale = true;
        }

        const cosmetics = await prisma.cosmetic.findMany({
            where: whereClause,
            orderBy: { name: 'asc' },
        });

        res.json(cosmetics);

    } catch (error) {
        if (error instanceof Error && error.message.includes("Invalid `new Date()`")) {
            return res.status(400).json({
                error: "Formato de data inválido. Use AAAA-MM-DD."
            });
        }
        res.status(500).json({ error: "Erro interno ao buscar cosméticos" });
    }
});

router.get('/cosmetics/new', async (req, res) => {
    try {
        const newCosmetics = await prisma.cosmetic.findMany({
            where: { isNew: true },
            orderBy: { name: 'asc' },
        });
        res.json(newCosmetics);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro interno ao buscar cosméticos novos" });
    }
});

router.get('/cosmetics/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const cosmetic = await prisma.cosmetic.findUnique({
            where: { id: id, }
        })

        if (!cosmetic) {
            return res.status(404).json({
                error: "Cosmético não encontrado"
            });
        }
        res.json(cosmetic);
    } catch (error) {
        console.error(error)
        res.status(500).json({
            error: "Erro interno ao buscar o cosmético"
        })
    }
})

router.get('/shop', async (req, res) => {
    try {
        const shopCosmetics = await prisma.cosmetic.findMany({
            where: { isOnSale: true, },
            orderBy: { name: 'asc' }
        });
        res.json(shopCosmetics);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro interno ao buscar itens da loja" })
    }
})

router.post('/sync', async (req, res) => {
    console.log('Recebida requisição de sincronização...');

    const authHeader = req.headers.authorization;
    const secret = process.env.CRON_SECRET;

    if (!secret) {
        console.error('CRON_SECRET não está configurado no servidor.');
        return res.status(500).json({ error: 'Configuração interna do servidor incompleta.' });
    }

    if (authHeader !== `Bearer ${secret}`) {
        console.warn('Tentativa de sincronização não autorizada.');
        return res.status(401).json({ error: 'Não autorizado' });
    }

    try {
        console.log('Autorização OK. Iniciando syncFortniteApi...');
        await syncFortniteApi();
        console.log('Sincronização concluída com sucesso pela rota /sync.');
        res.status(200).json({ message: 'Sincronização concluída com sucesso' });
    } catch (error) {
        console.error('Erro durante a sincronização via rota /sync:', error);
        res.status(500).json({ error: 'Erro ao executar a sincronização' });
    }
});

export { router as cosmeticRoutes };
