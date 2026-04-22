import ItineraryDayCard from "./itinerary-day-card";

type ItineraryDay = {
  dia: number;
  titulo: string;
  descricao: string;
};

export type Trip = {
  nome: string;
  pais: string;
  resumo: string;
  estimativaVoo: number;
  estimativaHospedagem: number;
  estimativaComida: number;
  estimativaTransporte: number;
  custoTotal: number;
  melhorPara: string;
  roteiro: ItineraryDay[];
};

type Props = {
  trip: Trip;
  onClick?: () => void;
  selected?: boolean;
};

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">
        {label}
      </p>
      <p className="mt-2 text-xl font-semibold tracking-tight text-zinc-900">
        €{value}
      </p>
    </div>
  );
}

export default function TripCard({ trip, onClick, selected = false }: Props) {
  return (
    <article
      onClick={onClick}
      className={[
        "rounded-3xl border bg-white p-6 transition duration-200 md:p-8",
        "shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_40px_rgba(0,0,0,0.04)]",
        "cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_50px_rgba(0,0,0,0.07)]",
        selected ? "border-zinc-900 ring-2 ring-zinc-900/10" : "border-zinc-200",
      ].join(" ")}
    >
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div className="max-w-2xl">
          <div className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-600">
            {trip.melhorPara}
          </div>

          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl">
            {trip.nome}, {trip.pais}
          </h2>

          <p className="mt-3 text-sm leading-6 text-zinc-600 md:text-base">
            {trip.resumo}
          </p>
        </div>

        <div className="rounded-2xl bg-zinc-900 px-5 py-4 text-white">
          <p className="text-xs uppercase tracking-[0.12em] text-zinc-300">
            Total estimado
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-tight">
            €{trip.custoTotal}
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Voo" value={trip.estimativaVoo} />
        <StatCard label="Hospedagem" value={trip.estimativaHospedagem} />
        <StatCard label="Comida" value={trip.estimativaComida} />
        <StatCard label="Transporte" value={trip.estimativaTransporte} />
      </div>

      <div className="mt-6 text-sm font-medium text-zinc-700">
        Clique para ver mais detalhes
      </div>
    </article>
  );
}