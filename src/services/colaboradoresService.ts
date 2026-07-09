import { supabase } from "./supabaseClient";

export const TIPO_COLABORADOR = 1;
export const TIPO_GESTOR = 2;

export type Colaborador = {
  id: number;
  nome: string;
  email: string;
  criadoEm: string;
  tipoUsuarioId: number;
};

type UsuarioLinha = {
  id: number;
  nome: string;
  email: string;
  criado_em: string;
  tipo_usuario_id: number;
};

export async function listarColaboradores(): Promise<Colaborador[]> {
  const { data, error } = await supabase.rpc("listar_usuarios");

  if (error) {
    throw new Error(`Erro ao listar colaboradores: ${error.message}`);
  }

  return (data ?? [])
    .filter(
      (usuario: UsuarioLinha) =>
        Number(usuario.tipo_usuario_id) === TIPO_COLABORADOR
    )
    .map((usuario: UsuarioLinha) => ({
      id: Number(usuario.id),
      nome: usuario.nome,
      email: usuario.email,
      criadoEm: usuario.criado_em,
      tipoUsuarioId: Number(usuario.tipo_usuario_id),
    }));
}

export async function alterarTipoUsuario(
  usuarioId: number,
  tipoUsuarioId: number
): Promise<void> {
  if (tipoUsuarioId !== TIPO_COLABORADOR && tipoUsuarioId !== TIPO_GESTOR) {
    throw new Error("Tipo de usuário inválido.");
  }

  const { error } = await supabase.rpc("alterar_tipo_usuario", {
    p_usuario_id: usuarioId,
    p_tipo_usuario_id: tipoUsuarioId,
  });

  if (error) {
    if (error.message.includes("usuario_nao_encontrado")) {
      throw new Error("Usuário não encontrado.");
    }
    throw new Error(`Erro ao alterar tipo do usuário: ${error.message}`);
  }
}
