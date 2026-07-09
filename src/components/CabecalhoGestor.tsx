"use client";

import { useSyncExternalStore } from "react";
import { CHAVE_SESSAO, type Usuario } from "@/services/usersService";
import styles from "./CabecalhoGestor.module.css";

function assinarSessao(notificar: () => void) {
  window.addEventListener("storage", notificar);
  return () => window.removeEventListener("storage", notificar);
}

function lerUsuario(): Usuario | null {
  const valor = localStorage.getItem(CHAVE_SESSAO);
  if (!valor) return null;
  try {
    return JSON.parse(valor) as Usuario;
  } catch {
    return null;
  }
}

function lerUsuarioNoServidor() {
  return null;
}

export default function CabecalhoGestor() {
  const usuario = useSyncExternalStore(
    assinarSessao,
    lerUsuario,
    lerUsuarioNoServidor
  );

  if (!usuario) return null;

  return (
    <header className={styles.cabecalho}>
      <h1 className={styles.titulo}>
        Gestor | <span className={styles.nome}>{usuario.nome}</span>
      </h1>
    </header>
  );
}
