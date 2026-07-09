-- Permite informar o tipo no cadastro; padrão 1 (colaborador) para outros apps.

DROP FUNCTION IF EXISTS public.criar_usuario(text, text, text);

CREATE OR REPLACE FUNCTION public.criar_usuario(
  p_nome text,
  p_email text,
  p_senha text,
  p_tipo_usuario_id bigint DEFAULT 1
)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $$
DECLARE
  v_id bigint;
BEGIN
  INSERT INTO public.usuarios (nome, email, senha_hash, tipo_usuario_id)
  VALUES (
    trim(p_nome),
    lower(trim(p_email)),
    crypt(p_senha, gen_salt('bf')),
    p_tipo_usuario_id
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.criar_usuario(text, text, text, bigint) TO anon, authenticated;
