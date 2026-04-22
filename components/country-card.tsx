type CountrySuggestion = {
  pais: string;
  resumo: string;
  custoEstimado: number;
  motivoPrincipal: string;
};

type Props = {
  country: CountrySuggestion;
  selected?: boolean;
  onClick?: () => void;
};

export default function CountryCard({
  country,
  selected = false,
  onClick,
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "w-full rounded-[26px] border p-5 text-left transition duration-200",
        "bg-white/90 shadow-[0_8px_30px_rgba(148,163,184,0.10)] backdrop-blur",
        "hover:-translate-y-0.5 hover:shadow-[0_12px_36px_rgba(148,163,184,0.14)]",
        selected
          ? "border-sky-300 bg-sky-50/70 ring-4 ring-sky-100"
          : "border-slate-200/80",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700">
            País sugerido
          </div>

          <h3 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">
            {country.pais}
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            {country.resumo}
          </p>
        </div>

        <div className="shrink-0 rounded-2xl bg-sky-100 px-4 py-3 text-slate-900">
          <p className="text-xs uppercase tracking-[0.12em] text-slate-500">
            Estimado
          </p>
          <p className="mt-1 text-2xl font-semibold">€{country.custoEstimado}</p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-amber-700">
          Porque escolher
        </p>
        <p className="mt-2 text-sm text-slate-700">{country.motivoPrincipal}</p>
      </div>

      <div className="mt-4 text-sm font-medium text-slate-700">
        Clique para ver cidades dentro deste país
      </div>
    </button>
  );
}