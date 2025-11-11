import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

const router = Router();

router.post('/buy', async (req, res) => {
    const { userId, cosmeticId } = req.body;

    if (!userId || !cosmeticId) {
        return res.status(400).json({ error: 'userId e cosmeticId são obrigatórios.' });
    }

    try {
        const result = await prisma.$transaction(async (tx) => {
            const cosmetic = await tx.cosmetic.findUnique({
                where: { id: cosmeticId },
            });
            const user = await tx.user.findUnique({
                where: { id: userId },
            });

            if (!cosmetic) {
                throw new Error('Cosmético não encontrado.');
            }
            if (!user) {
                throw new Error('Usuário não encontrado.');
            }

            const alreadyOwned = await tx.userInventory.findFirst({
                where: { userId: userId, cosmeticId: cosmeticId },
            });

            if (alreadyOwned) {
                throw new Error('Você já possui este item.');
            }

            if (user.vbucks < cosmetic.price) {
                throw new Error('V-Bucks insuficientes.');
            }

            const updatedUser = await tx.user.update({
                where: { id: userId },
                data: { vbucks: user.vbucks - cosmetic.price },
            });

            await tx.userInventory.create({
                data: {
                    userId: userId,
                    cosmeticId: cosmeticId,
                },
            });

            await tx.transactionHistory.create({
                data: {
                    userId: userId,
                    cosmeticId: cosmeticId,
                    type: 'COMPRA',
                    amountVbucks: cosmetic.price,
                },
            });

            return updatedUser;
        });

        res.status(200).json({
            message: 'Compra realizada com sucesso!',
            user: {
                id: result.id,
                email: result.email,
                vbucks: result.vbucks,
            },
        });

    } catch (error: any) {
        console.error('Erro na transação de compra:', error.message);
        res.status(400).json({ error: error.message || 'Erro interno ao processar a compra.' });
    }
});

router.get('/inventory/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const inventory = await prisma.userInventory.findMany({
            where: { userId: userId },
            include: {
                cosmetic: true, 
            },
        });

        const userCosmetics = inventory.map(item => item.cosmetic);
        res.json(userCosmetics);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar inventário do usuário.' });
    }
});

router.get('/history/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const history = await prisma.transactionHistory.findMany({
            where: { userId: userId },
            orderBy: { createdAt: 'desc' },
        });
        res.json(history);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar histórico de transações.' });
    }
});


export { router as inventoryRoutes };