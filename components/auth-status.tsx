"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";

export default function AuthStatus() {
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      setEmail(data.user?.email ?? null);
      setLoading(false);
    };

    loadUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setEmail(session?.user?.email ?? null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setEmail(null);
  };

  return (
    <div className="fixed right-4 top-4 z-40">
      {loading ? null : email ? (
        <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-white/90 px-3 py-2 text-xs shadow-sm backdrop-blur">
          <span className="max-w-[160px] truncate text-emerald-800">
            Logado: {email}
          </span>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full bg-slate-100 px-3 py-1 text-slate-700 hover:bg-slate-200"
          >
            Sair
          </button>
        </div>
      ) : (
        <Link
          href="/login"
          className="rounded-full border border-sky-200 bg-white/90 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm backdrop-blur hover:bg-sky-50"
        >
          Entrar
        </Link>
      )}
    </div>
  );
}