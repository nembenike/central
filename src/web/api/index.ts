import express from "express";
import plugin from "./plugin";
import MessageResponse from "../interfaces/MessageResponse";

const router = express.Router();

router.get<{}, MessageResponse>("/", (req, res) => {
  res.json({
    message: "API - 👋🌎🌍🌏",
  });
});

router.use("/plugin", plugin);

export default router;
