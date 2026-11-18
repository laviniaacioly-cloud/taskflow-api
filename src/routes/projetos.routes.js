
const express = require("express");
const router = express.Router();

const autenticar = require("../middlewares/autenticar");
const projetosController = require("../controllers/projetos.controller");
const validar = require("../middlewares/validar");
const schemas = require("../middlewares/schemas");

// Todas as rotas de projetos exigem login
router.use(autenticar);

// GET - LISTAR PROJETOS DO USUÁRIO
router.get("/", projetosController.listarProjetos);

// GET - RESUMO DO PROJETO
router.get(
  "/:id/resumo",
  validar(schemas.id, "params"),
  projetosController.resumoProjeto,
);

// GET - BUSCAR PROJETO POR ID
router.get(
  "/:id",
  validar(schemas.id, "params"),
  projetosController.buscarProjetosId,
);

// POST - CRIAR PROJETO
router.post(
  "/",
  validar(schemas.projeto),
  projetosController.criarProjetos,
);

// PUT - ATUALIZAR PROJETO
router.put(
  "/:id",
  validar(schemas.id, "params"),
  validar(schemas.projeto),
  projetosController.atualizarProjetos,
);

// DELETE - EXCLUIR PROJETO
router.delete(
  "/:id",
  validar(schemas.id, "params"),
  projetosController.removerProjetos,
);

module.exports = router;
