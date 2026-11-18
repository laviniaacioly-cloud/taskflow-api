
const express = require("express");
const router = express.Router();

const autenticar = require("../middlewares/autenticar");
const tarefasController = require("../controllers/tarefas.controller");

const validar = require("../middlewares/validar");
const schemas = require("../middlewares/schemas");

const idValido = validar(schemas.id, "params");

// TODAS AS ROTAS DE TAREFAS EXIGEM LOGIN
router.use(autenticar);

// GET - LISTAR TAREFAS
router.get(
  "/",
  validar(schemas.filtroTarefas, "query"),
  tarefasController.listar,
);

// ESTATÍSTICAS
router.get("/estatisticas", tarefasController.estatisticas);
router.get("/estatisticas/resumo", tarefasController.resumo);

// POST - CRIAR
router.post(
  "/",
  validar(schemas.tarefa),
  tarefasController.criar,
);

// PUT - ATUALIZAR
router.put(
  "/:id",
  idValido,
  validar(schemas.tarefaAtualizacao),
  tarefasController.atualizar,
);

// DELETE - EXCLUIR
router.delete(
  "/:id",
  idValido,
  tarefasController.remover,
);

// GET - BUSCAR POR ID
router.get(
  "/:id",
  idValido,
  tarefasController.buscarPorId,
);

module.exports = router;
