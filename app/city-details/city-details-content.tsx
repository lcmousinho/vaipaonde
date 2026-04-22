"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type StayArea = {
  nome: string;
  perfil: string;
  motivo: string;
};

type ItineraryDay = {
  dia: number;
  titulo: string;
  descricao: string;
};

type CityDetailsResponse = {
  pais: string;
  cidade: string;
  resumo: string;
  estimativaVoo: number;
  estimativaHospedagem: number;
  estimativaComida: number;
  estimativaTransporte: number;
  custoTotal: number;
  melhorPara: string;
  regioesHospedagem: StayArea[];
  roteiro: ItineraryDay[];
};

type CityDetailsRequest = {
  origem: string;
  orcamento: number;
  tipo: string;
  dias: number;
  mes: string;
  perfil: string;
  pais: string;
  cidade: string;
  resumoCidade: string;
  melhorPara: string;
  custoEstimadoCidade: number;
};

function StatCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "sky" | "emerald" | "violet" | "amber";
}) {
  const toneClasses = {
    default: "border-slate-200 bg-slate-50/80",
    sky: "border-sky-200 bg-sky-50/70",
    emerald: "border-emerald-200 bg-emerald-50/70",
    violet: "border-violet-200 bg-violet-50/70",
    amber: "border-amber-200 bg-amber-50/70",
  };

  return (
    <div className={`rounded-2xl border p-4 ${toneClasses[tone]}`}>
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}

export default function CityDetailsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const requestData = useMemo<CityDetailsRequest | null>(() => {
    const origem = searchParams.get("origem");
    const orcamento = searchParams.get("orcamento");
    const tipo = searchParams.get("tipo");
    const dias = searchParams.get("dias");
    const mes = searchParams.get("mes");
    const perfil = searchParams.get("perfil");
    const pais = searchParams.get("pais");
    const cidade = searchParams.get("cidade");
    const resumoCidade = searchParams.get("resumoCidade");
    const melhorPara = searchParams.get("melhorPara");
    const custoEstimadoCidade = searchParams.get("custoEstimadoCidade");

    if (
      !origem ||
      !orcamento ||
      !tipo ||
      !dias ||
      !mes ||
      !perfil ||
      !pais ||
      !cidade ||
      !resumoCidade ||
      !melhorPara ||
      !custoEstimadoCidade
    ) {
      return null;
    }

    return {
      origem,
      orcamento: Number(orcamento),
      tipo,
      dias: Number(dias),
      mes,
      perfil,
      pais,
      cidade,
      resumoCidade,
      melhorPara,
      custoEstimadoCidade: Number(custoEstimadoCidade),
    };
  }, [searchParams]);

  const [details, setDetails] = useState<CityDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDetails = async () => {
      if (!requestData) {
        setError("Faltam dados para carregar os detalhes da cidade.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const res = await fetch("/api/city-details", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            origem: requestData.origem,
            orcamento: requestData.orcamento,
            tipo: requestData.tipo,
            dias: requestData.dias,
            mes: requestData.mes,
            perfil: requestData.perfil,
            pais: requestData.pais,
            cidade: requestData.cidade,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Erro ao carregar detalhe da cidade.");
        }

        setDetails(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro inesperado.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [requestData]);

  const handleGenerateFinalTrip = () => {
    if (!requestData) return;

    const params = new URLSearchParams({
      origem: requestData.origem,
      orcamento: String(requestData.orcamento),
      tipo: requestData.tipo,
      dias: String(requestData.dias),
      mes: requestData.mes,
      perfil: requestData.perfil,
      pais: requestData.pais,
      cidade: requestData.cidade,
      resumoCidade: requestData.resumoCidade,
      melhorPara: requestData.melhorPara,
      custoEstimadoCidade: String(requestData.custoEstimadoCidade),
    });

    router.push(`/final-trip?${params.toString()}`);
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fdfcf9_0%,#f7f7fb_55%,#f4f8fb_100%)] px-4 py-10 md:px-6 md:py-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center rounded-full border border-sky-200 bg-white/80 px-3 py-1 text-xs font-medium text-slate-600 shadow-sm backdrop-blur">
              Detalhe da cidade
            </div>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
              {requestData
                ? `${requestData.cidade}, ${requestData.pais}`
                : "Cidade selecionada"}
            </h1>

            {requestData && (
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                A partir de <strong>{requestData.origem}</strong>, para uma
                viagem de <strong>{requestData.dias} dias</strong>, com foco em{" "}
                <strong>{requestData.tipo}</strong>.
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center justify-center rounded-2xl border border-sky-200 bg-white/90 px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-sky-50"
          >
            Voltar
          </button>
        </div>

        {loading && (
          <div className="rounded-[28px] border border-slate-200/80 bg-white/90 p-10 text-center shadow-[0_8px_30px_rgba(148,163,184,0.12)]">
            <p className="text-sm text-slate-600">
              A carregar detalhes da cidade...
            </p>
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        {!loading && !error && details && (
          <div className="space-y-6">
            <section className="rounded-[28px] border border-slate-200/80 bg-white/90 p-6 shadow-[0_8px_30px_rgba(148,163,184,0.12)] md:p-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="max-w-3xl">
                  <div className="inline-flex items-center rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700">
                    Melhor para: {details.melhorPara}
                  </div>

                  <p className="mt-4 text-base leading-7 text-slate-600">
                    {details.resumo}
                  </p>
                </div>

                <div className="rounded-2xl bg-sky-100 px-5 py-4 text-slate-900">
                  <p className="text-xs uppercase tracking-[0.12em] text-slate-500">
                    Total estimado
                  </p>
                  <p className="mt-2 text-3xl font-semibold">
                    €{details.custoTotal}
                  </p>
                </div>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  label="Voo"
                  value={`€${details.estimativaVoo}`}
                  tone="sky"
                />
                <StatCard
                  label="Hospedagem"
                  value={`€${details.estimativaHospedagem}`}
                  tone="emerald"
                />
                <StatCard
                  label="Comida"
                  value={`€${details.estimativaComida}`}
                  tone="amber"
                />
                <StatCard
                  label="Transporte"
                  value={`€${details.estimativaTransporte}`}
                  tone="violet"
                />
              </div>
            </section>

            <section className="rounded-[28px] border border-slate-200/80 bg-white/90 p-6 shadow-[0_8px_30px_rgba(148,163,184,0.12)] md:p-8">
              <h2 className="text-xl font-semibold text-slate-900">
                Onde faz mais sentido ficar
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Estas zonas são pensadas para o teu perfil de viagem e ajudam a
                escolher uma base mais adequada.
              </p>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {details.regioesHospedagem.map((area, index) => (
                  <div
                    key={`${area.nome}-${index}`}
                    className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-900">
                        {area.nome}
                      </p>
                      <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs text-amber-800">
                        {area.perfil}
                      </span>
                    </div>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {area.motivo}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[28px] border border-slate-200/80 bg-white/90 p-6 shadow-[0_8px_30px_rgba(148,163,184,0.12)] md:p-8">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    Visão geral do roteiro
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Uma primeira ideia do que fazer em cada dia, antes de gerar a
                    versão final mais detalhada.
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {details.roteiro.map((day) => (
                  <div
                    key={day.dia}
                    className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-xs font-semibold text-violet-800">
                        {day.dia}
                      </div>
                      <p className="text-sm font-semibold text-slate-900">
                        Dia {day.dia}: {day.titulo}
                      </p>
                    </div>

                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {day.descricao}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[28px] border border-slate-200/80 bg-white/90 p-6 shadow-[0_8px_30px_rgba(148,163,184,0.12)] md:p-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="max-w-2xl">
                  <h2 className="text-xl font-semibold text-slate-900">
                    Avançar para a versão final da viagem
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Se esta cidade fizer sentido para ti, no próximo passo vamos
                    gerar uma versão final mais completa, com roteiro por manhã,
                    tarde e noite.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateFinalTrip}
                  className="inline-flex items-center justify-center rounded-2xl bg-sky-200 px-5 py-3 text-sm font-medium text-slate-900 shadow-sm transition duration-200 hover:bg-sky-300"
                >
                  Gerar viagem final
                </button>
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}