import ItineraryDayCard from "./itinerary-day-card";

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

type Props = {
  open: boolean;
  onClose: () => void;
  details: CityDetailsResponse | null;
  loading: boolean;
};

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-base font-semibold text-slate-900">{value}</p>
    </div>
  );
}

export default function CityDetailModal({
  open,
  onClose,
  details,
  loading,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/30 p-4 backdrop-blur-sm md:p-8">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[30px] border border-slate-200 bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 px-6 py-4 backdrop-blur">
          <div>
            <p className="text-sm text-slate-500">Plano detalhado</p>
            <h2 className="text-xl font-semibold text-slate-900">
              {details ? `${details.cidade}, ${details.pais}` : "A carregar..."}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
          >
            Fechar
          </button>
        </div>

        <div className="p-6 md:p-8">
          {loading && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-10 text-center text-sm text-slate-600">
              A carregar detalhe da cidade...
            </div>
          )}

          {!loading && !details && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-10 text-center text-sm text-slate-600">
              Não foi possível carregar os detalhes.
            </div>
          )}

          {!loading && details && (
            <>
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="max-w-2xl">
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
                <InfoCard label="Voo" value={`€${details.estimativaVoo}`} />
                <InfoCard
                  label="Hospedagem"
                  value={`€${details.estimativaHospedagem}`}
                />
                <InfoCard label="Comida" value={`€${details.estimativaComida}`} />
                <InfoCard
                  label="Transporte"
                  value={`€${details.estimativaTransporte}`}
                />
              </div>

              <div className="mt-8 border-t border-slate-100 pt-8">
                <h3 className="text-lg font-semibold text-slate-900">
                  Onde ficar
                </h3>
                <div className="mt-4 grid gap-3">
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
              </div>

              <div className="mt-8 border-t border-slate-100 pt-8">
                <h3 className="text-lg font-semibold text-slate-900">
                  Roteiro detalhado
                </h3>
                <div className="mt-4 space-y-3">
                  {details.roteiro.map((dia) => (
                    <ItineraryDayCard key={dia.dia} dia={dia} />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}