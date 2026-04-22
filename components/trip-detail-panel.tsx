import { Trip } from "./trip-card";
import ItineraryDayCard from "./itinerary-day-card";

type Props = {
  trip: Trip | null;
};

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
      <span className="text-sm text-zinc-600">{label}</span>
      <span className="text-sm font-semibold text-zinc-900">{value}</span>
    </div>
  );
}

export default function TripDetailPanel({ trip }: Props) {
  if (!trip) {
    return (
      <section className="rounded-3xl border border-dashed border-zinc-300 bg-white p-8 text-center shadow-sm">
        <p className="text-sm text-zinc-500">
          Clica num destino para ver os detalhes completos.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_40px_rgba(0,0,0,0.04)] md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="max-w-2xl">
          <div className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-600">
            Detalhe do destino
          </div>

          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-900">
            {trip.nome}, {trip.pais}
          </h2>

          <p className="mt-3 text-base leading-7 text-zinc-600">{trip.resumo}</p>
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

      <div className="mt-8 grid gap-3 md:grid-cols-2">
        <InfoRow label="Ideal para" value={trip.melhorPara} />
        <InfoRow label="Voo" value={`€${trip.estimativaVoo}`} />
        <InfoRow label="Hospedagem" value={`€${trip.estimativaHospedagem}`} />
        <InfoRow label="Comida" value={`€${trip.estimativaComida}`} />
        <InfoRow label="Transporte" value={`€${trip.estimativaTransporte}`} />
      </div>

      <div className="mt-8 border-t border-zinc-100 pt-8">
        <h3 className="text-lg font-semibold text-zinc-900">Roteiro completo</h3>
        <p className="mt-2 text-sm text-zinc-600">
          Um plano mais detalhado para te ajudar a decidir se este destino faz sentido.
        </p>

        <div className="mt-5 space-y-3">
          {trip.roteiro.map((dia) => (
            <ItineraryDayCard key={dia.dia} dia={dia} />
          ))}
        </div>
      </div>
    </section>
  );
}