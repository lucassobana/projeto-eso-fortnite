import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

const router = Router();

router.get('/users', async (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    try {
        const [users, totalUsers] = await prisma.$transaction([
            prisma.user.findMany({
                select: {
                    id: true,
                    email: true,
                    vbucks: true,
                },
                orderBy: { email: 'asc' },
                skip: skip,
                take: limit,
            }),
            prisma.user.count(),
        ]);

        res.json({
            data: users,
            currentPage: page,
            totalPages: Math.ceil(totalUsers / limit),
            totalUsers: totalUsers,
        });
    } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        res.status(500).json({ error: 'Erro interno ao buscar usuários.' });
    }
});
router.get('/users/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                vbucks: true,
            },
        });

        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        res.json(user);
    } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        res.status(500).json({ error: 'Erro interno ao buscar usuário.' });
    }
});

export { router as usersRoutes };