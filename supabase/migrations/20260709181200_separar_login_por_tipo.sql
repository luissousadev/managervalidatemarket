-- Restaura login genérico e cria funções específicas por tipo de usuário.

CREATE OR REPLACE FUNCTION public.validar_login(p_email text, p_senha text)
RETURNS TABLE(id bigint, nome text, email text)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $$
  SELECT u.id, u.nome, u.email
  FROM public.usuarios u
  WHERE u.email = lower(trim(p_email))
    AND u.senha_hash = crypt(p_senha, u.senha_hash);
$$;

CREATE OR REPLACE FUNCTION public.validar_login_gestor(p_email text, p_senha text)
RETURNS TABLE(id bigint, nome text, email text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $$
DECLARE
  v_usuario public.usuarios%ROWTYPE;
BEGIN
  SELECT *
  INTO v_usuario
  FROM public.usuarios u
  WHERE u.email = lower(trim(p_email))
    AND u.senha_hash = crypt(p_senha, u.senha_hash);

  IF NOT FOUND THEN
    RETURN;
  END IF;

  IF v_usuario.tipo_usuario_id <> 2 THEN
    RAISE EXCEPTION 'acesso_apenas_gestor'
      USING ERRCODE = '42501';
  END IF;

  id := v_usuario.id;
  nome := v_usuario.nome;
  email := v_usuario.email;
  RETURN NEXT;
END;
$$;

CREATE OR REPLACE FUNCTION public.validar_login_colaborador(p_email text, p_senha text)
RETURNS TABLE(id bigint, nome text, email text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $$
DECLARE
  v_usuario public.usuarios%ROWTYPE;
BEGIN
  SELECT *
  INTO v_usuario
  FROM public.usuarios u
  WHERE u.email = lower(trim(p_email))
    AND u.senha_hash = crypt(p_senha, u.senha_hash);

  IF NOT FOUND THEN
    RETURN;
  END IF;

  IF v_usuario.tipo_usuario_id <> 1 THEN
    RAISE EXCEPTION 'acesso_apenas_colaborador'
      USING ERRCODE = '42501';
  END IF;

  id := v_usuario.id;
  nome := v_usuario.nome;
  email := v_usuario.email;
  RETURN NEXT;
END;
$$;
