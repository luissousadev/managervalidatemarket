"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { criarUsuario } from "@/services/usersService";
import styles from "./page.module.css";

export default function NovoUsuario() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function cadastrar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    if (!nome.trim() || !email.trim() || !senha || !confirmarSenha) {
      alert("Preencha todos os campos.");
      return;
    }
    if (senha.length < 6) {
      alert("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (senha !== confirmarSenha) {
      alert("As senhas não conferem.");
      return;
    }

    setSalvando(true);
    try {
      await criarUsuario({ nome: nome.trim(), email: email.trim(), senha });
      alert("Cadastro realizado com sucesso! Faça login para continuar.");
      router.push("/login");
    } catch (erro) {
      console.error(erro);
      alert(
        erro instanceof Error ? erro.message : "Erro ao cadastrar usuário."
      );
      setSalvando(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.phone}>
        <main className={styles.screen}>
          <Link href="/login" className={styles.voltar} aria-label="Voltar">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
          </Link>

          <h1 className={styles.title}>Criar Conta</h1>
          <p className={styles.subtitle}>
            Informe seus dados para se cadastrar
          </p>

          <form className={styles.form} onSubmit={cadastrar}>
            <label className={styles.label} htmlFor="nome">
              Nome
            </label>
            <div className={styles.inputWrap}>
              <svg
                className={styles.icon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
              </svg>
              <input
                className={styles.input}
                id="nome"
                type="text"
                placeholder="Seu nome completo"
                value={nome}
                onChange={(evento) => setNome(evento.target.value)}
              />
            </div>

            <label className={styles.label} htmlFor="email">
              E-mail
            </label>
            <div className={styles.inputWrap}>
              <svg
                className={styles.icon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="M3 7l9 6 9-6" />
              </svg>
              <input
                className={styles.input}
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(evento) => setEmail(evento.target.value)}
              />
            </div>

            <label className={styles.label} htmlFor="senha">
              Senha
            </label>
            <div className={styles.inputWrap}>
              <svg
                className={styles.icon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="5" y="11" width="14" height="9" rx="2" />
                <path d="M8 11V7a4 4 0 0 1 8 0v4" />
              </svg>
              <input
                className={styles.input}
                id="senha"
                type="password"
                placeholder="••••••••"
                value={senha}
                onChange={(evento) => setSenha(evento.target.value)}
              />
            </div>

            <label className={styles.label} htmlFor="confirmarSenha">
              Confirmar senha
            </label>
            <div className={styles.inputWrap}>
              <svg
                className={styles.icon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="5" y="11" width="14" height="9" rx="2" />
                <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                <path d="M9 15.5l2 2 4-4" />
              </svg>
              <input
                className={styles.input}
                id="confirmarSenha"
                type="password"
                placeholder="••••••••"
                value={confirmarSenha}
                onChange={(evento) => setConfirmarSenha(evento.target.value)}
              />
            </div>

            <button className={styles.button} type="submit" disabled={salvando}>
              {salvando ? "Cadastrando..." : "Cadastrar"}
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}
