import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

const router = Router(); // <--- 1. Use 'router' em vez de 'cosmeticRoutes'

/**
 * [GET] /api/cosmetics
 */
router.get('/cosmetics', async (req, res) => { // <--- 2. Use 'router.get'
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

/**
 * [GET] /api/cosmetics/new
 */
router.get('/cosmetics/new', async (req, res) => { // <--- 3. Use 'router.get'
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

// 4. Exporte exatamente como você fez no testRoutes
export { router as cosmeticRoutes };