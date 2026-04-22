type CitySuggestion = {
  cidade: string;
  resumo: string;
  custoEstimado: number;
  melhorPara: string;
};

type Props = {
  city: CitySuggestion;
  selected?: boolean;
  onClick?: () => void;
};

export default function CityCard({
  city,
  selected = false,
  onClick,
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "w-full rounded-[26px] border p-6 text-left transition duration-200",
        "bg-white/90 shadow-[0_8px_30px_rgba(148,163,184,0.10)] backdrop-blur",
        "hover:-translate-y-0.5 hover:shadow-[0_12px_36px_rgba(148,163,184,0.14)]",
        selected
          ? "border-violet-300 bg-violet-50/60 ring-4 ring-violet-100"
          : "border-slate-200/80",
      ].join(" ")}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
            Cidade sugerida
          </div>

          <h3 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">
            {city.cidade}
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-600">{city.resumo}</p>

          <div className="mt-4">
            <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-sm font-medium text-amber-800">
              Melhor para: {city.melhorPara}
            </span>
          </div>
        </div>

        <div className="rounded-2xl bg-emerald-100 px-4 py-3 text-slate-900">
          <p className="text-xs uppercase tracking-[0.12em] text-slate-500">
            Estimado
          </p>
          <p className="mt-1 text-2xl font-semibold">€{city.custoEstimado}</p>
        </div>
      </div>

      <div className="mt-5 text-sm font-medium text-slate-700">
        Seleciona esta cidade para gerar a viagem final
      </div>
    </button>
  );
}