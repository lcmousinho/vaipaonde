"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase-client";

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSignup = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      if (password.length < 6) {
        throw new Error("A palavra-passe deve ter pelo menos 6 caracteres.");
      }

      if (password !== confirmPassword) {
        throw new Error("As palavras-passe não coincidem.");
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            typeof window !== "undefined"
              ? `${window.location.origin}${nextUrl}`
              : undefined,
        },
      });

      if (error) throw error;

      setSuccess(
        "Conta criada. Confirma o teu email para concluir o cadastro."
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar conta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fdfcf9_0%,#f7f7fb_55%,#f4f8fb_100%)] px-4 py-10 md:px-6 md:py-14">
      <div className="mx-auto max-w-md">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-2xl border border-sky-200 bg-white/90 px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-sky-50"
        >
          Voltar
        </Link>

        <section className="mt-8 rounded-[28px] border border-slate-200/80 bg-white/90 p-6 shadow-[0_8px_30px_rgba(148,163,184,0.12)] md:p-8">
          <div className="inline-flex items-center rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700">
            Criar conta
          </div>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
            Começa a guardar as tuas viagens
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            Cria uma conta para guardar roteiros, aceder a funções premium e
            continuar o planeamento mais tarde.
          </p>

          <div className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="teuemail@exemplo.com"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Palavra-passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Confirmar palavra-passe
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repete a palavra-passe"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
              />
            </div>

            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {success}
              </div>
            )}

            <button
              type="button"
              onClick={handleSignup}
              disabled={
                loading ||
                !email.trim() ||
                !password.trim() ||
                !confirmPassword.trim()
              }
              className="inline-flex w-full items-center justify-center rounded-2xl bg-violet-200 px-5 py-3 text-sm font-medium text-slate-900 shadow-sm transition hover:bg-violet-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "A criar conta..." : "Criar conta"}
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-slate-600">
            Já tens conta?{" "}
            <Link
              href={`/login?next=${encodeURIComponent(nextUrl)}`}
              className="font-medium text-sky-700 hover:text-sky-800"
            >
              Entrar
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}