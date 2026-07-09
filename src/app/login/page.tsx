"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { salvarSessao, validarLogin } from "@/services/usersService";
import styles from "./page.module.css";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [entrando, setEntrando] = useState(false);

  async function entrar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    if (!email.trim() || !senha) {
      alert("Informe o login e a senha.");
      return;
    }

    setEntrando(true);
    try {
      const usuario = await validarLogin(email, senha);
      if (!usuario) {
        alert("Login ou senha incorretos.");
        setEntrando(false);
        return;
      }
      salvarSessao(usuario);
      router.push("/home");
    } catch (erro) {
      console.error(erro);
      alert(
        erro instanceof Error
          ? erro.message
          : "Erro ao entrar. Verifique sua conexão e tente novamente."
      );
      setEntrando(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.phone}>
        <main className={styles.screen}>
          <Image
            src="/logo.png"
            alt="Next Validade"
            width={270}
            height={100}
            className={styles.logo}
            priority
          />
          <h1 className={styles.title}>Bem-vindo!</h1>
          <p className={styles.subtitle}>
            Entre com suas credenciais para continuar
          </p>

          <form className={styles.form} onSubmit={entrar}>
            <label className={styles.label} htmlFor="email">
              Login
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
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(evento) => setEmail(evento.target.value)}
              />
            </div>

            <label className={styles.label} htmlFor="password">
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
                id="password"
                type="password"
                placeholder="••••••••"
                value={senha}
                onChange={(evento) => setSenha(evento.target.value)}
              />
            </div>

            <a className={styles.forgot} href="#">
              Esqueceu sua senha?
            </a>

            <button className={styles.button} type="submit" disabled={entrando}>
              {entrando ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <p className={styles.signup}>
            Não tem uma conta? <Link href="/novo-usuario">Cadastre-se</Link>
          </p>

          <p className={styles.footer}>
            © 2026 | Desenvolvido Next Sistemas | v1.000.000
          </p>
        </main>
      </div>
    </div>
  );
}
