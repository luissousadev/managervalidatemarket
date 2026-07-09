import { supabase } from "./supabaseClient";

const TIPO_COLABORADOR = 1;

export type Colaborador = {
  id: number;
  nome: string;
  email: string;
  criadoEm: string;
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
    .filter((usuario: UsuarioLinha) => Number(usuario.tipo_usuario_id) === TIPO_COLABORADOR)
    .map((usuario: UsuarioLinha) => ({
      id: Number(usuario.id),
      nome: usuario.nome,
      email: usuario.email,
      criadoEm: usuario.criado_em,
    }));
}
