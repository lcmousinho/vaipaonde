"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase-client";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError("");

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      router.push(nextUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao entrar.");
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
          <div className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
            Entrar
          </div>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
            Acede à tua conta
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            Entra para guardar viagens, desbloquear funções premium e continuar
            o teu planeamento.
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
                placeholder="A tua palavra-passe"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
              />
            </div>

            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={handleLogin}
              disabled={loading || !email.trim() || !password.trim()}
              className="inline-flex w-full items-center justify-center rounded-2xl bg-sky-200 px-5 py-3 text-sm font-medium text-slate-900 shadow-sm transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "A entrar..." : "Entrar"}
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-slate-600">
            Ainda não tens conta?{" "}
            <Link
              href={`/signup?next=${encodeURIComponent(nextUrl)}`}
              className="font-medium text-violet-700 hover:text-violet-800"
            >
              Criar conta
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}