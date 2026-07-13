"use client";

import { useSyncExternalStore } from "react";
import { CHAVE_SESSAO, type Usuario } from "@/services/usersService";
import styles from "./CabecalhoGestor.module.css";

function assinarSessao(notificar: () => void) {
  window.addEventListener("storage", notificar);
  return () => window.removeEventListener("storage", notificar);
}

function lerSessao() {
  return localStorage.getItem(CHAVE_SESSAO);
}

function lerSessaoNoServidor() {
  return null;
}

export default function CabecalhoGestor() {
  const sessao = useSyncExternalStore(
    assinarSessao,
    lerSessao,
    lerSessaoNoServidor
  );

  if (!sessao) return null;

  let usuario: Usuario;
  try {
    usuario = JSON.parse(sessao) as Usuario;
  } catch {
    return null;
  }

  return (
    <header className={styles.cabecalho}>
      <h1 className={styles.titulo}>
        Gestor | <span className={styles.nome}>{usuario.nome}</span>
      </h1>
    </header>
  );
}
