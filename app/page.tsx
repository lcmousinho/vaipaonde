"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TripForm, { TripFormData } from "@/components/trip-form";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSearch = (form: TripFormData) => {
    setLoading(true);

    const params = new URLSearchParams({
      origem: form.origem,
      orcamento: String(form.orcamento),
      tipo: form.tipo,
      dias: String(form.dias),
      mes: form.mes,
      perfil: form.perfil,
    });

    router.push(`/results?${params.toString()}`);
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fdfcf9_0%,#f7f7fb_55%,#f4f8fb_100%)] px-4 py-10 md:px-6 md:py-14">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10">
          <div className="inline-flex items-center rounded-full border border-sky-200 bg-white/80 px-3 py-1 text-xs font-medium text-slate-600 shadow-sm backdrop-blur">
            Ideias de viagem para indecisos
          </div>

          <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-tight text-slate-900 md:text-6xl">
            Descobre para onde ir sem perder horas a comparar opções
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
            Diz quanto queres gastar, quantos dias tens e o estilo da viagem.
            Nós ajudamos-te a filtrar países, cidades e zonas onde faz mais
            sentido ficar.
          </p>
        </header>

        <TripForm onSearch={handleSearch} loading={loading} />
      </div>
    </main>
  );
}