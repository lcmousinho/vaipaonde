"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type StayArea = {
  nome: string;
  perfil: string;
  motivo: string;
};

type PeriodBlock = {
  periodo: "manhã" | "tarde" | "noite";
  titulo: string;
  descricao: string;
};

type FinalTripDay = {
  dia: number;
  manha: PeriodBlock;
  tarde: PeriodBlock;
  noite: PeriodBlock;
};

type FinalTripResponse = {
  pais: string;
  cidade: string;
  resumoFinal: string;
  custoEstimadoTotal: number;
  vooEstimado: number;
  hospedagemEstimada: number;
  comidaEstimada: number;
  transporteEstimado: number;
  melhorPara: string;
  regioesHospedagem: StayArea[];
  roteiro: FinalTripDay[];
  dicasFinais: string[];
};

type FinalTripRequest = {
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

function PeriodCard({
  title,
  block,
  tone,
}: {
  title: string;
  block: PeriodBlock;
  tone: "sky" | "amber" | "violet";
}) {
  const toneClasses = {
    sky: "border-sky-200 bg-sky-50/70",
    amber: "border-amber-200 bg-amber-50/70",
    violet: "border-violet-200 bg-violet-50/70",
  };

  return (
    <div className={`rounded-2xl border p-4 ${toneClasses[tone]}`}>
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
        {title}
      </p>
      <p className="mt-2 text-base font-semibold text-slate-900">
        {block.titulo}
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        {block.descricao}
      </p>
    </div>
  );
}

export default function FinalTripContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const requestData = useMemo<FinalTripRequest | null>(() => {
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

  const [trip, setTrip] = useState<FinalTripResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFinalTrip = async () => {
      if (!requestData) {
        setError("Faltam dados para gerar a viagem final.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const res = await fetch("/api/final-trip", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Erro ao gerar a viagem final.");
        }

        setTrip(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro inesperado.");
      } finally {
        setLoading(false);
      }
    };

    fetchFinalTrip();
  }, [requestData]);

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fdfcf9_0%,#f7f7fb_55%,#f4f8fb_100%)] px-4 py-10 md:px-6 md:py-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center rounded-full border border-sky-200 bg-white/80 px-3 py-1 text-xs font-medium text-slate-600 shadow-sm backdrop-blur">
              Viagem final
            </div>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
              {requestData
                ? `${requestData.cidade}, ${requestData.pais}`
                : "Plano final"}
            </h1>

            {requestData && (
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                Roteiro final a partir de <strong>{requestData.origem}</strong>,
                para uma viagem de <strong>{requestData.dias} dias</strong>, com
                foco em <strong>{requestData.tipo}</strong>.
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
              A gerar a viagem final...
            </p>
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        {!loading && !error && trip && (
          <div className="space-y-6">
            <section className="rounded-[28px] border border-slate-200/80 bg-white/90 p-6 shadow-[0_8px_30px_rgba(148,163,184,0.12)] md:p-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="max-w-3xl">
                  <div className="inline-flex items-center rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700">
                    Melhor para: {trip.melhorPara}
                  </div>

                  <p className="mt-4 text-base leading-7 text-slate-600">
                    {trip.resumoFinal}
                  </p>
                </div>

                <div className="rounded-2xl bg-sky-100 px-5 py-4 text-slate-900">
                  <p className="text-xs uppercase tracking-[0.12em] text-slate-500">
                    Total estimado
                  </p>
                  <p className="mt-2 text-3xl font-semibold">
                    €{trip.custoEstimadoTotal}
                  </p>
                </div>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Voo" value={`€${trip.vooEstimado}`} tone="sky" />
                <StatCard
                  label="Hospedagem"
                  value={`€${trip.hospedagemEstimada}`}
                  tone="emerald"
                />
                <StatCard
                  label="Comida"
                  value={`€${trip.comidaEstimada}`}
                  tone="amber"
                />
                <StatCard
                  label="Transporte"
                  value={`€${trip.transporteEstimado}`}
                  tone="violet"
                />
              </div>
            </section>

            <section className="rounded-[28px] border border-slate-200/80 bg-white/90 p-6 shadow-[0_8px_30px_rgba(148,163,184,0.12)] md:p-8">
              <h2 className="text-xl font-semibold text-slate-900">
                Onde ficar
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Estas zonas foram escolhidas para tornar a estadia mais coerente
                com o teu perfil e com o ritmo da viagem.
              </p>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {trip.regioesHospedagem.map((area, index) => (
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
              <h2 className="text-xl font-semibold text-slate-900">
                Roteiro dia a dia
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Uma proposta final de viagem organizada por manhã, tarde e noite.
              </p>

              <div className="mt-6 space-y-5">
                {trip.roteiro.map((day) => (
                  <div
                    key={day.dia}
                    className="rounded-3xl border border-slate-200 bg-white p-5"
                  >
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-100 text-sm font-semibold text-violet-800">
                        {day.dia}
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        Dia {day.dia}
                      </h3>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <PeriodCard
                        title="Manhã"
                        block={day.manha}
                        tone="sky"
                      />
                      <PeriodCard
                        title="Tarde"
                        block={day.tarde}
                        tone="amber"
                      />
                      <PeriodCard
                        title="Noite"
                        block={day.noite}
                        tone="violet"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[28px] border border-slate-200/80 bg-white/90 p-6 shadow-[0_8px_30px_rgba(148,163,184,0.12)] md:p-8">
              <h2 className="text-xl font-semibold text-slate-900">
                Dicas finais
              </h2>

              <div className="mt-4 grid gap-3">
                {trip.dicasFinais.map((tip, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm leading-6 text-slate-600"
                  >
                    {tip}
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[28px] border border-slate-200/80 bg-white/90 p-6 shadow-[0_8px_30px_rgba(148,163,184,0.12)] md:p-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="max-w-2xl">
                  <h2 className="text-xl font-semibold text-slate-900">
                    Próximos passos
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Aqui podes fechar a experiência com uma ação prática. Mesmo
                    que ainda seja uma versão inicial, este bloco já ajuda a dar
                    sensação de conclusão.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-3">
                <button
                  type="button"
                  className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-4 text-left text-sm font-medium text-slate-800 transition hover:bg-slate-100"
                >
                  Guardar esta viagem
                </button>

                <button
                  type="button"
                  className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-4 text-left text-sm font-medium text-sky-900 transition hover:bg-sky-100"
                >
                  Ver hotéis nas zonas sugeridas
                </button>

                <button
                  type="button"
                  className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-left text-sm font-medium text-emerald-900 transition hover:bg-emerald-100"
                >
                  Procurar voos para {trip.cidade}
                </button>
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}