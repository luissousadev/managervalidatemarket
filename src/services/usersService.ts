import { supabase } from "./supabaseClient";

// A tabela "usuarios" é protegida por RLS sem políticas: o app não lê nem
// escreve nela diretamente. Todo acesso passa pelas funções do banco
// (criar_usuario / validar_login), que guardam a senha com hash bcrypt.

export type Usuario = {
  id: number;
  nome: string;
  email: string;
};

export type NovoUsuario = {
  nome: string;
  email: string;
  senha: string;
};

export async function criarUsuario(usuario: NovoUsuario): Promise<number> {
  const { data, error } = await supabase.rpc("criar_usuario", {
    p_nome: usuario.nome,
    p_email: usuario.email,
    p_senha: usuario.senha,
  });

  if (error) {
    if (error.message.includes("duplicate key")) {
      throw new Error("Já existe um usuário cadastrado com este e-mail.");
    }
    throw new Error(`Erro ao cadastrar usuário: ${error.message}`);
  }
  return data as number;
}

// Retorna o usuário se e-mail e senha estiverem corretos; null caso contrário.
export async function validarLogin(
  email: string,
  senha: string
): Promise<Usuario | null> {
  const { data, error } = await supabase.rpc("validar_login", {
    p_email: email,
    p_senha: senha,
  });

  if (error) throw new Error(`Erro ao validar login: ${error.message}`);
  const usuarios = (data ?? []) as Usuario[];
  return usuarios.length > 0 ? usuarios[0] : null;
}

// --- Sessão do usuário logado (localStorage) ---

export const CHAVE_SESSAO = "usuarioLogado";

export function salvarSessao(usuario: Usuario) {
  localStorage.setItem(CHAVE_SESSAO, JSON.stringify(usuario));
}

export function obterSessao(): Usuario | null {
  const valor = localStorage.getItem(CHAVE_SESSAO);
  if (!valor) return null;
  try {
    return JSON.parse(valor) as Usuario;
  } catch {
    return null;
  }
}

export function encerrarSessao() {
  localStorage.removeItem(CHAVE_SESSAO);
}
