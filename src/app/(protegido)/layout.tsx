"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { CHAVE_SESSAO } from "@/services/usersService";

// Guarda de autenticação: toda tela dentro de (protegido) só renderiza com
// usuário logado. Acesso direto pela URL sem sessão redireciona para /login.

function assinarSessao(notificar: () => void) {
  // cobre logout/login feito em outra aba
  window.addEventListener("storage", notificar);
  return () => window.removeEventListener("storage", notificar);
}

function lerSessao() {
  return localStorage.getItem(CHAVE_SESSAO);
}

// no servidor (pré-renderização) não há sessão
function lerSessaoNoServidor() {
  return null;
}

export default function LayoutProtegido({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const sessao = useSyncExternalStore(
    assinarSessao,
    lerSessao,
    lerSessaoNoServidor
  );
  const logado = sessao !== null;

  useEffect(() => {
    // lê o valor ao vivo: durante a hidratação o snapshot ainda pode ser o
    // do servidor (null), o que causaria redirect indevido de quem está logado
    if (lerSessao() === null) router.replace("/login");
  }, [sessao, router]);

  if (!logado) return null;

  return children;
}
