type Props = {
  dia: {
    dia: number;
    titulo: string;
    descricao: string;
  };
};

export default function ItineraryDayCard({ dia }: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-xs font-semibold text-violet-800">
          {dia.dia}
        </div>
        <p className="text-sm font-semibold text-slate-900">{dia.titulo}</p>
      </div>

      <p className="mt-3 text-sm leading-6 text-slate-600">{dia.descricao}</p>
    </div>
  );
}