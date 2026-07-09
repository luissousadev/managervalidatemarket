-- validar_login apenas autentica; regra de tipo fica no frontend de cada app.

DROP FUNCTION IF EXISTS public.validar_login_gestor(text, text);
DROP FUNCTION IF EXISTS public.validar_login_colaborador(text, text);

CREATE OR REPLACE FUNCTION public.validar_login(p_email text, p_senha text)
RETURNS TABLE(id bigint, nome text, email text, tipo_usuario_id bigint)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $$
  SELECT u.id, u.nome, u.email, u.tipo_usuario_id
  FROM public.usuarios u
  WHERE u.email = lower(trim(p_email))
    AND u.senha_hash = crypt(p_senha, u.senha_hash);
$$;
