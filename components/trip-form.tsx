"use client";

import { useState } from "react";

export type TripFormData = {
  origem: string;
  orcamento: number;
  tipo: string;
  dias: number;
  mes: string;
  perfil: string;
};

type Props = {
  onSearch: (data: TripFormData) => void;
  loading?: boolean;
};

type FormErrors = Partial<Record<keyof TripFormData, string>>;

const inputClassName =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition duration-200 focus:border-sky-300 focus:ring-4 focus:ring-sky-100";

const inputErrorClassName =
  "w-full rounded-2xl border border-rose-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition duration-200 focus:border-rose-400 focus:ring-4 focus:ring-rose-100";

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

export default function TripForm({ onSearch, loading = false }: Props) {
  const [form, setForm] = useState<TripFormData>({
    origem: "",
    orcamento: 800,
    tipo: "praia",
    dias: 5,
    mes: "",
    perfil: "equilibrado",
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (data: TripFormData): FormErrors => {
    const newErrors: FormErrors = {};

    if (!data.origem.trim()) {
      newErrors.origem = "Indica a cidade ou aeroporto de origem.";
    }

    if (!data.orcamento || Number.isNaN(data.orcamento)) {
      newErrors.orcamento = "Indica um orçamento.";
    } else if (data.orcamento < 50) {
      newErrors.orcamento = "O orçamento deve ser superior a €50.";
    }

    if (!data.dias || Number.isNaN(data.dias)) {
      newErrors.dias = "Indica a quantidade de dias.";
    } else if (data.dias < 1) {
      newErrors.dias = "A viagem deve ter pelo menos 1 dia.";
    } else if (data.dias > 30) {
      newErrors.dias = "Para já, o máximo é 30 dias.";
    }

    if (!data.mes) {
      newErrors.mes = "Seleciona o mês da viagem.";
    }

    if (!data.tipo) {
      newErrors.tipo = "Seleciona o tipo de viagem.";
    }

    if (!data.perfil) {
      newErrors.perfil = "Seleciona o ritmo da viagem.";
    }

    return newErrors;
  };

  const updateField = <K extends keyof TripFormData>(
    field: K,
    value: TripFormData[K]
  ) => {
    const updatedForm = { ...form, [field]: value };
    setForm(updatedForm);

    if (errors[field]) {
      const updatedErrors = validateForm(updatedForm);
      setErrors((prev) => ({
        ...prev,
        [field]: updatedErrors[field],
      }));
    }
  };

  const handleSubmit = () => {
    const validationErrors = validateForm(form);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    onSearch(form);
  };

  return (
    <section className="rounded-[28px] border border-slate-200/80 bg-white/90 p-6 shadow-[0_8px_30px_rgba(148,163,184,0.12)] backdrop-blur md:p-8">
      <div className="mb-8">
        <div className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
          Planeamento leve e claro
        </div>

        <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
          Encontra uma viagem que faça sentido para ti
        </h2>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
          Começa com o essencial. Depois nós ajudamos-te a afunilar opções de
          forma simples.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <FieldLabel htmlFor="origem">Origem</FieldLabel>
          <input
            id="origem"
            type="text"
            placeholder="Ex: Lisboa"
            value={form.origem}
            onChange={(e) => updateField("origem", e.target.value)}
            className={errors.origem ? inputErrorClassName : inputClassName}
          />
          <FieldError message={errors.origem} />
        </div>

        <div>
          <FieldLabel htmlFor="orcamento">Orçamento máximo</FieldLabel>
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">
              €
            </span>
            <input
              id="orcamento"
              type="number"
              min={0}
              value={form.orcamento}
              onChange={(e) => updateField("orcamento", Number(e.target.value))}
              className={`${
                errors.orcamento ? inputErrorClassName : inputClassName
              } pl-8`}
            />
          </div>
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
            className={errors.tipo ? inputErrorClassName : inputClassName}
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
            className={errors.perfil ? inputErrorClassName : inputClassName}
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
          As sugestões servem para ajudar a decidir mais rápido, sem excesso de
          opções logo no início.
        </p>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="inline-flex items-center justify-center rounded-2xl bg-sky-200 px-5 py-3 text-sm font-medium text-slate-900 shadow-sm transition duration-200 hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "A abrir resultados..." : "Gerar viagem"}
        </button>
      </div>
    </section>
  );
}