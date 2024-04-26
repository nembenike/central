import express from 'express';
import prisma from '../../db';

import { sendLoginVerifyRequest } from '../../bot';

const router = express.Router();

type PluginResponse = {
    status: Number;
    message: string;
};

router.get<PluginResponse>('/', (req, res) => {
    res.json({
        status: 200,
        message: 'Plugin - 👋🌎🌍🌏',
    });
});

router.post<PluginResponse>('/', async (req, res) => {
    const { username } = req.body;

    if (!username) {
        res.json({
            status: 400,
            message: 'Minecraft username is required.',
        });
        return;
    }

    const existingMinecraftUser = await prisma.user.findFirst({
        where: {
            mc_username: username,
        },
    });

    if (!existingMinecraftUser) {
        res.json({
            status: 400,
            message: 'This Minecraft username is not registered.',
        });
        return;
    }

    sendLoginVerifyRequest(existingMinecraftUser?.discord_id as string);
});

export default router;