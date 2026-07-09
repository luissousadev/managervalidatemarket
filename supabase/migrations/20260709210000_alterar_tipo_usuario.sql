-- Atualização de tipo de usuário (regra de perfil fica no frontend).

CREATE OR REPLACE FUNCTION public.alterar_tipo_usuario(
  p_usuario_id bigint,
  p_tipo_usuario_id bigint
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF p_tipo_usuario_id NOT IN (1, 2) THEN
    RAISE EXCEPTION 'tipo_usuario_invalido';
  END IF;

  UPDATE public.usuarios
  SET tipo_usuario_id = p_tipo_usuario_id
  WHERE id = p_usuario_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'usuario_nao_encontrado';
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.alterar_tipo_usuario(bigint, bigint) TO anon, authenticated;
