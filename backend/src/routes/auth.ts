import { Router } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma.js";

const router = Router();

router.post("/register", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email e senha são obrigatórios." });
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return res.status(409).json({ error: "Este email já está em uso." });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                passwordHash,
                vbucks: 10000,
            },
            select: {
                id: true,
                email: true,
                vbucks: true,
            },
        });

        return res.status(201).json({
            message: "Usuário registrado com sucesso!",
            user,
        });
    } catch (error) {
        console.error("Erro ao registrar usuário:", error);
        return res.status(500).json({ error: "Erro interno do servidor." });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email e senha são obrigatórios." });
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return res.status(404).json({ error: "Usuário não encontrado." });
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

        if (!isPasswordValid) {
            return res.status(401).json({ error: "Senha incorreta." });
        }

        return res.status(200).json({
            message: "Login realizado com sucesso!",
            user: {
                id: user.id,
                email: user.email,
                vbucks: user.vbucks,
            },
        });
    } catch (error) {
        console.error("Erro ao realizar login:", error);
        return res.status(500).json({ error: "Erro interno do servidor." });
    }
});

router.get("/emails", async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: { email: true },
        });

        const emails = users.map((u) => u.email);

        res.json(emails);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro interno ao buscar e-mails" });
    }
});

router.delete("/delete", async (req, res) => {
    const { email } = req.body;
    try {
        const user = await prisma.user.delete({
            where: { email },
        });

        res.json({
            message: `Usuário ${user.email} foi deletado com sucesso.`,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro interno ao buscar e-mails" });
    }
});

export { router as auth };