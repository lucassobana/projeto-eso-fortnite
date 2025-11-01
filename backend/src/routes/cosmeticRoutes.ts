import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

const router = Router();

router.get('/cosmetics', async (req, res) => {
    try {
        const cosmetics = await prisma.cosmetic.findMany({
            orderBy: { name: 'asc' },
        });
        res.json(cosmetics);
    } catch (error) {
        console.error(error);
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
        res.status(500).json({error: "Erro interno ao buscar itens da loja"})
    }
})

export { router as cosmeticRoutes };
