"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { encerrarSessao } from "@/services/usersService";
import styles from "./MenuSuperior.module.css";

const itens = [
  {
    href: "/home",
    rotulo: "Home",
    icone: (
      <>
        <path d="M3 11l9-8 9 8" />
        <path d="M5 9v12h14V9" />
        <path d="M10 21v-6h4v6" />
      </>
    ),
  },
  {
    href: "/produtos",
    rotulo: "Produtos",
    icone: (
      <>
        <path d="M21 8l-9-5-9 5v8l9 5 9-5V8z" />
        <path d="M3 8l9 5 9-5" />
        <path d="M12 13v8" />
      </>
    ),
  },
  {
    href: "/lotes",
    rotulo: "Lotes",
    icone: (
      <>
        <path d="M3 21V8l9-5 9 5v13" />
        <path d="M9 21v-6h6v6" />
        <path d="M9 9h6" />
      </>
    ),
  },
];

export default function MenuSuperior() {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);

  function sair() {
    setAberto(false);
    encerrarSessao();
    router.push("/login");
  }

  return (
    <div className={styles.menuArea}>
      <button
        type="button"
        className={styles.hamburger}
        aria-label="Abrir menu"
        aria-expanded={aberto}
        onClick={() => setAberto((estado) => !estado)}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M3 6h18" />
          <path d="M3 12h18" />
          <path d="M3 18h18" />
        </svg>
      </button>

      {aberto && (
        <nav className={styles.dropdown}>
          {itens.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={styles.dropdownItem}
              onClick={() => setAberto(false)}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {item.icone}
              </svg>
              {item.rotulo}
            </Link>
          ))}

          <button type="button" className={styles.sair} onClick={sair}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <path d="M16 17l5-5-5-5" />
              <path d="M21 12H9" />
            </svg>
            Sair
          </button>
        </nav>
      )}
    </div>
  );
}
