
const prisma = require("../database/prisma");

module.exports = {
  // LISTAR SOMENTE OS PROJETOS DO USUÁRIO
  listarProjetos: async (usuarioId) => {
    return await prisma.projetos.findMany({
      where: {
        usuario_id: Number(usuarioId),
      },
      orderBy: {
        nome: "asc",
      },
    });
  },

  // BUSCAR PROJETO DO USUÁRIO PELO ID
  buscarProjeto: async (id, usuarioId) => {
    const projeto = await prisma.projetos.findFirst({
      where: {
        id: Number(id),
        usuario_id: Number(usuarioId),
      },
    });

    return projeto || null;
  },

  // ADICIONAR PROJETO VINCULADO AO USUÁRIO AUTENTICADO
  adicionarProjeto: async ({ nome, descricao, usuarioId }) => {
    return await prisma.projetos.create({
      data: {
        nome,
        descricao: descricao ?? "",
        usuario_id: Number(usuarioId),
      },
    });
  },

  // ATUALIZAR SOMENTE PROJETO DO PRÓPRIO USUÁRIO
  atualizarProjeto: async (id, usuarioId, dados) => {
    const idNumerico = Number(id);

    const atual = await prisma.projetos.findFirst({
      where: {
        id: idNumerico,
        usuario_id: Number(usuarioId),
      },
    });

    if (!atual) {
      return null;
    }

    return await prisma.projetos.update({
      where: {
        id: idNumerico,
      },
      data: {
        nome: dados.nome ?? atual.nome,
        descricao: dados.descricao ?? atual.descricao,
      },
    });
  },

  // REMOVER SOMENTE PROJETO DO PRÓPRIO USUÁRIO
  removerProjetos: async (id, usuarioId) => {
    const idNumerico = Number(id);

    const projeto = await prisma.projetos.findFirst({
      where: {
        id: idNumerico,
        usuario_id: Number(usuarioId),
      },
    });

    if (!projeto) {
      return null;
    }

    try {
      return await prisma.projetos.delete({
        where: {
          id: idNumerico,
        },
      });
    } catch (erro) {
      if (erro.code === "P2025") {
        return null;
      }

      throw erro;
    }
  },
};
