-- Leitura de usuários para o app (regras de tipo ficam no frontend).

CREATE OR REPLACE FUNCTION public.listar_usuarios()
RETURNS TABLE(
  id bigint,
  nome text,
  email text,
  criado_em timestamptz,
  tipo_usuario_id bigint
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT u.id, u.nome, u.email, u.criado_em, u.tipo_usuario_id
  FROM public.usuarios u
  ORDER BY u.nome;
$$;

GRANT EXECUTE ON FUNCTION public.listar_usuarios() TO anon, authenticated;
