
const comentarioModel = require("../models/comentario.model");

function validarId(valor) {
  const numero = Number(valor);
  return Number.isInteger(numero) && numero > 0;
}

const comentariosController = {
  // GET - LISTAR COMENTÁRIOS
  async listar(req, res) {
    try {
      const { tarefaId } = req.params;
      const usuarioId = req.usuario.id;

      if (!validarId(tarefaId)) {
        return res.status(400).json({
          erro: "ID da tarefa inválido",
        });
      }

      const tarefa = await comentarioModel.buscarTarefaDoUsuario(
        tarefaId,
        usuarioId
      );

      if (!tarefa) {
        return res.status(404).json({
          erro: "Tarefa não encontrada",
        });
      }

      const comentarios = await comentarioModel.listarPorTarefa(tarefaId);

      res.json(comentarios);
    } catch (erro) {
      console.error("Erro ao listar comentários:", erro);

      res.status(500).json({
        erro: "Erro ao listar comentários",
      });
    }
  },

  // POST - CRIAR COMENTÁRIO
  async criar(req, res) {
    try {
      const { tarefaId } = req.params;
      const usuarioId = req.usuario.id;
      const { texto } = req.body;

      if (!validarId(tarefaId)) {
        return res.status(400).json({
          erro: "ID da tarefa inválido",
        });
      }

      if (typeof texto !== "string" || !texto.trim()) {
        return res.status(400).json({
          erro: "O texto do comentário é obrigatório",
        });
      }

      const tarefa = await comentarioModel.buscarTarefaDoUsuario(
        tarefaId,
        usuarioId
      );

      if (!tarefa) {
        return res.status(404).json({
          erro: "Tarefa não encontrada",
        });
      }

      const comentario = await comentarioModel.adicionar({
        texto: texto.trim(),
        tarefaId,
        usuarioId,
      });

      res.status(201).json(comentario);
    } catch (erro) {
      console.error("Erro ao criar comentário:", erro);

      res.status(500).json({
        erro: "Erro ao criar comentário",
      });
    }
  },

  // DELETE - EXCLUIR COMENTÁRIO
  async remover(req, res) {
    try {
      const { tarefaId, comentarioId } = req.params;
      const usuarioId = req.usuario.id;

      if (!validarId(tarefaId) || !validarId(comentarioId)) {
        return res.status(400).json({
          erro: "ID da tarefa ou do comentário inválido",
        });
      }

      const tarefa = await comentarioModel.buscarTarefaDoUsuario(
        tarefaId,
        usuarioId
      );

      if (!tarefa) {
        return res.status(404).json({
          erro: "Tarefa não encontrada",
        });
      }

      const comentario = await comentarioModel.buscarComentario(
        comentarioId,
        tarefaId
      );

      if (!comentario) {
        return res.status(404).json({
          erro: "Comentário não encontrado",
        });
      }

      if (Number(comentario.usuario_id) !== Number(usuarioId)) {
        return res.status(403).json({
          erro: "Você só pode excluir seus próprios comentários",
        });
      }

      await comentarioModel.remover(comentarioId);

      res.json({
        mensagem: "Comentário removido com sucesso",
      });
    } catch (erro) {
      console.error("Erro ao excluir comentário:", erro);

      res.status(500).json({
        erro: "Erro ao excluir comentário",
      });
    }
  },
};

module.exports = comentariosController;
