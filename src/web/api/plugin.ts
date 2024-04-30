import express from "express";
import prisma from "../../db";

import { sendLoginVerifyRequest } from "../../bot/login";

const router = express.Router();

type PluginResponse = {
  status: Number;
  message: string;
};

router.post<PluginResponse>("/login", async (req, res) => {
  const { username, ip } = req.body;

  if (!username) {
    res.statusCode = 400;
    res.json({
      message: "Minecraft username is required.",
    });
    return;
  }

  const existingMinecraftUser = await prisma.user.findFirst({
    where: {
      mc_username: username,
    },
  });

  if (!existingMinecraftUser) {
    res.statusCode = 404;
    res.json({
      message: "This Minecraft username is not registered.",
    });
    return;
  }

  const existingRequest = await prisma.loginRequest.findFirst({
    where: {
      user_id: existingMinecraftUser.id,
      ip: ip,
    },
  });

  if (existingRequest) {
    if (existingRequest.isValidated) {
      res.statusCode = 204;
      res.json({
        message: "Already logged in.",
      });
      return;
    } else {
      res.statusCode = 403;
      res.json({
        message: "Login request awaiting.",
      });
      return;
    }
  }

  const loginRequest = await prisma.loginRequest.create({
    data: {
      user_id: existingMinecraftUser.id,
      ip: ip,
    },
  });

  const interaction = sendLoginVerifyRequest(
    existingMinecraftUser?.discord_id as string,
    ip
  );

  res.statusCode = 200;
  res.json({
    message: "Login request sent.",
    id: loginRequest.id,
  });

  interaction.then(async (response) => {
    if (response) {
      await prisma.loginRequest.update({
        where: {
          id: loginRequest.id,
        },
        data: {
          isValidated: true,
        },
      });

      console.log("Login validated");
    } else {
      await prisma.loginRequest.delete({
        where: {
          id: loginRequest.id,
        },
      });

      console.log("Session not created");
    }
  });
});

router.post("/logout", async (req, res) => {
  const { username, ip } = req.body;

  if (!username) {
    res.statusCode = 400;
    res.json({
      message: "Minecraft username is required.",
    });
    return;
  }

  const existingMinecraftUser = await prisma.user.findFirst({
    where: {
      mc_username: username,
    },
  });

  if (!existingMinecraftUser) {
    res.statusCode = 404;
    res.json({
      message: "This Minecraft username is not registered.",
    });
    return;
  }

  const existingRequest = await prisma.loginRequest.findFirst({
    where: {
      user_id: existingMinecraftUser.id,
      ip: ip,
      isValidated: true,
    },
  });

  if (!existingRequest) {
    res.statusCode = 404;
    res.json({
      message: "No login request found.",
    });
    return;
  }

  await prisma.loginRequest.delete({
    where: {
      id: existingRequest.id,
    },
  });

  res.statusCode = 200;
  res.json({
    message: "Logged out.",
  });
});

export default router;
