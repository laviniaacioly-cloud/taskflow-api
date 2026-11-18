
const express = require("express");
const router = express.Router();

const prioridadesController = require("../controllers/prioridades.controller");
const autenticar = require("../middlewares/autenticar");

// GET - LISTAR PRIORIDADES
router.get("/", autenticar, prioridadesController.listarTodas);

// POST - CADASTRAR PRIORIDADE
router.post("/", autenticar, prioridadesController.criar);

// PUT - EDITAR PRIORIDADE
router.put("/:id", autenticar, prioridadesController.atualizar);

// DELETE - EXCLUIR PRIORIDADE
router.delete("/:id", autenticar, prioridadesController.excluir);

module.exports = router;
