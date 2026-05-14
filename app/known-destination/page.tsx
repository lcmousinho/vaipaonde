"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

type DestinationMode = "pais" | "cidade";

type FormData = {
  origem: string;
  destino: string;
  tipoDestino: DestinationMode;
  paisDaCidade: string;
  orcamento: number;
  tipo: string;
  dias: number;
  mes: string;
  perfil: string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

const months = [
  { value: "", label: "Seleciona um mês" },
  { value: "janeiro", label: "Janeiro" },
  { value: "fevereiro", label: "Fevereiro" },
  { value: "marco", label: "Março" },
  { value: "abril", label: "Abril" },
  { value: "maio", label: "Maio" },
  { value: "junho", label: "Junho" },
  { value: "julho", label: "Julho" },
  { value: "agosto", label: "Agosto" },
  { value: "setembro", label: "Setembro" },
  { value: "outubro", label: "Outubro" },
  { value: "novembro", label: "Novembro" },
  { value: "dezembro", label: "Dezembro" },
];

const inputClassName =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition duration-200 focus:border-sky-300 focus:ring-4 focus:ring-sky-100";

const inputErrorClassName =
  "w-full rounded-2xl border border-rose-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition duration-200 focus:border-rose-400 focus:ring-4 focus:ring-rose-100";

function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-2 block text-sm font-medium text-slate-700"
    >
      {children}
    </label>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-2 text-sm text-rose-600">{message}</p>;
}

export default function KnownDestinationPage() {
  const router = useRouter();

  const [form, setForm] = useState<FormData>({
    origem: "",
    destino: "",
    tipoDestino: "pais",
    paisDaCidade: "",
    orcamento: 800,
    tipo: "cidade",
    dias: 5,
    mes: "",
    perfil: "equilibrado",
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (data: FormData): FormErrors => {
    const nextErrors: FormErrors = {};

    if (!data.origem.trim()) {
      nextErrors.origem = "Indica a origem.";
    }

    if (!data.destino.trim()) {
      nextErrors.destino =
        data.tipoDestino === "pais"
          ? "Indica o país que tens em mente."
          : "Indica a cidade que tens em mente.";
    }

    if (data.tipoDestino === "cidade" && !data.paisDaCidade.trim()) {
      nextErrors.paisDaCidade =
        "Indica também o país dessa cidade para evitar ambiguidades.";
    }

    if (!data.orcamento || Number.isNaN(data.orcamento)) {
      nextErrors.orcamento = "Indica um orçamento.";
    } else if (data.orcamento < 50) {
      nextErrors.orcamento = "O orçamento deve ser superior a €50.";
    }

    if (!data.dias || Number.isNaN(data.dias)) {
      nextErrors.dias = "Indica a quantidade de dias.";
    } else if (data.dias < 1 || data.dias > 30) {
      nextErrors.dias = "Indica entre 1 e 30 dias.";
    }

    if (!data.mes) {
      nextErrors.mes = "Seleciona o mês da viagem.";
    }

    if (!data.tipo) {
      nextErrors.tipo = "Seleciona o tipo de viagem.";
    }

    if (!data.perfil) {
      nextErrors.perfil = "Seleciona o ritmo da viagem.";
    }

    return nextErrors;
  };

  const updateField = <K extends keyof FormData>(
    field: K,
    value: FormData[K]
  ) => {
    const updated = { ...form, [field]: value };
    setForm(updated);

    if (errors[field]) {
      const updatedErrors = validateForm(updated);
      setErrors((prev) => ({
        ...prev,
        [field]: updatedErrors[field],
      }));
    }
  };

  const handleSubmit = () => {
    const nextErrors = validateForm(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    if (form.tipoDestino === "pais") {
      const params = new URLSearchParams({
        origem: form.origem,
        orcamento: String(form.orcamento),
        tipo: form.tipo,
        dias: String(form.dias),
        mes: form.mes,
        perfil: form.perfil,
        paisPreselecionado: form.destino,
      });

      router.push(`/results?${params.toString()}`);
      return;
    }

    const params = new URLSearchParams({
      origem: form.origem,
      orcamento: String(form.orcamento),
      tipo: form.tipo,
      dias: String(form.dias),
      mes: form.mes,
      perfil: form.perfil,
      pais: form.paisDaCidade,
      cidade: form.destino,
      resumoCidade: "",
      melhorPara: form.tipo,
      custoEstimadoCidade: "0",
      diretoCidade: "true",
    });

    router.push(`/city-details?${params.toString()}`);
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fdfcf9_0%,#f7f7fb_55%,#f4f8fb_100%)] px-4 py-10 md:px-6 md:py-14">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700">
              Destino conhecido
            </div>

            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900">
              Já sabes para onde queres viajar?
            </h1>

            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
              Podes começar por um país ou ir logo para uma cidade específica.
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-2xl border border-sky-200 bg-white/90 px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-sky-50"
          >
            Voltar para a página inicial
          </Link>
        </div>

        <section className="rounded-[28px] border border-slate-200/80 bg-white/90 p-6 shadow-[0_8px_30px_rgba(148,163,184,0.12)] md:p-8">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <FieldLabel htmlFor="origem">Origem</FieldLabel>
              <input
                id="origem"
                type="text"
                value={form.origem}
                onChange={(e) => updateField("origem", e.target.value)}
                className={errors.origem ? inputErrorClassName : inputClassName}
                placeholder="Ex: Lisboa"
              />
              <FieldError message={errors.origem} />
            </div>

            <div>
              <FieldLabel htmlFor="tipoDestino">Queres começar por</FieldLabel>
              <select
                id="tipoDestino"
                value={form.tipoDestino}
                onChange={(e) =>
                  updateField("tipoDestino", e.target.value as DestinationMode)
                }
                className={inputClassName}
              >
                <option value="pais">País</option>
                <option value="cidade">Cidade</option>
              </select>
            </div>

            <div>
              <FieldLabel htmlFor="destino">
                {form.tipoDestino === "pais" ? "País" : "Cidade"}
              </FieldLabel>
              <input
                id="destino"
                type="text"
                value={form.destino}
                onChange={(e) => updateField("destino", e.target.value)}
                className={errors.destino ? inputErrorClassName : inputClassName}
                placeholder={
                  form.tipoDestino === "pais" ? "Ex: Espanha" : "Ex: Málaga"
                }
              />
              <FieldError message={errors.destino} />
            </div>

            {form.tipoDestino === "cidade" && (
              <div className="md:col-span-2">
                <FieldLabel htmlFor="paisDaCidade">País dessa cidade</FieldLabel>
                <input
                  id="paisDaCidade"
                  type="text"
                  value={form.paisDaCidade}
                  onChange={(e) => updateField("paisDaCidade", e.target.value)}
                  className={
                    errors.paisDaCidade ? inputErrorClassName : inputClassName
                  }
                  placeholder="Ex: Espanha"
                />
                <FieldError message={errors.paisDaCidade} />
              </div>
            )}

            <div>
              <FieldLabel htmlFor="orcamento">Orçamento máximo</FieldLabel>
              <input
                id="orcamento"
                type="number"
                min={0}
                value={form.orcamento}
                onChange={(e) => updateField("orcamento", Number(e.target.value))}
                className={
                  errors.orcamento ? inputErrorClassName : inputClassName
                }
              />
              <FieldError message={errors.orcamento} />
            </div>

            <div>
              <FieldLabel htmlFor="dias">Número de dias</FieldLabel>
              <input
                id="dias"
                type="number"
                min={1}
                max={30}
                value={form.dias}
                onChange={(e) => updateField("dias", Number(e.target.value))}
                className={errors.dias ? inputErrorClassName : inputClassName}
              />
              <FieldError message={errors.dias} />
            </div>

            <div>
              <FieldLabel htmlFor="tipo">Tipo de viagem</FieldLabel>
              <select
                id="tipo"
                value={form.tipo}
                onChange={(e) => updateField("tipo", e.target.value)}
                className={inputClassName}
              >
                <option value="praia">Praia</option>
                <option value="cidade">Cidade</option>
                <option value="natureza">Natureza</option>
                <option value="aventura">Aventura</option>
              </select>
              <FieldError message={errors.tipo} />
            </div>

            <div>
              <FieldLabel htmlFor="mes">Mês da viagem</FieldLabel>
              <select
                id="mes"
                value={form.mes}
                onChange={(e) => updateField("mes", e.target.value)}
                className={errors.mes ? inputErrorClassName : inputClassName}
              >
                {months.map((month) => (
                  <option key={month.value || "empty"} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
              <FieldError message={errors.mes} />
            </div>

            <div className="md:col-span-2">
              <FieldLabel htmlFor="perfil">Ritmo da viagem</FieldLabel>
              <select
                id="perfil"
                value={form.perfil}
                onChange={(e) => updateField("perfil", e.target.value)}
                className={inputClassName}
              >
                <option value="descanso">Descanso</option>
                <option value="equilibrado">Equilibrado</option>
                <option value="explorar muito">Explorar muito</option>
              </select>
              <FieldError message={errors.perfil} />
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-4 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-xl text-sm leading-6 text-slate-500">
              Se escolheres uma cidade, saltamos diretamente para a página de
              detalhe dessa cidade.
            </p>

            <button
              type="button"
              onClick={handleSubmit}
              className="inline-flex items-center justify-center rounded-2xl bg-violet-200 px-5 py-3 text-sm font-medium text-slate-900 shadow-sm transition duration-200 hover:bg-violet-300"
            >
              Continuar
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}