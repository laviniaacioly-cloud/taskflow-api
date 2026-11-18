
const prisma = require("../database/prisma");

const comentarioModel = {
  // Verifica se a tarefa pertence ao usuário logado
  async buscarTarefaDoUsuario(tarefaId, usuarioId) {
    return prisma.tarefas.findFirst({
      where: {
        id: Number(tarefaId),
        usuario_id: Number(usuarioId),
      },
    });
  },

  // Lista os comentários de uma tarefa
  async listarPorTarefa(tarefaId) {
    return prisma.comentarios.findMany({
      where: {
        tarefa_id: Number(tarefaId),
      },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
      orderBy: {
        criado_em: "asc",
      },
    });
  },

  // Adiciona um comentário
  async adicionar({ texto, tarefaId, usuarioId }) {
    return prisma.comentarios.create({
      data: {
        texto,
        tarefa_id: Number(tarefaId),
        usuario_id: Number(usuarioId),
      },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
    });
  },

  // Busca um comentário de uma tarefa
  async buscarComentario(comentarioId, tarefaId) {
    return prisma.comentarios.findFirst({
      where: {
        id: Number(comentarioId),
        tarefa_id: Number(tarefaId),
      },
    });
  },

  // Exclui um comentário
  async remover(comentarioId) {
    return prisma.comentarios.delete({
      where: {
        id: Number(comentarioId),
      },
    });
  },
};

module.exports = comentarioModel;
