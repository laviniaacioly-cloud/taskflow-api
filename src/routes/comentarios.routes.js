
const express = require("express");
const router = express.Router();

const autenticar = require("../middlewares/autenticar");
const comentariosController = require("../controllers/comentarios.controller");

// Todas as rotas de comentários exigem autenticação
router.use(autenticar);

// GET - Listar comentários de uma tarefa
router.get(
  "/tarefas/:tarefaId",
  comentariosController.listar
);

// POST - Criar comentário em uma tarefa
router.post(
  "/tarefas/:tarefaId",
  comentariosController.criar
);

// DELETE - Excluir comentário
router.delete(
  "/tarefas/:tarefaId/:comentarioId",
  comentariosController.remover
);

module.exports = router;
