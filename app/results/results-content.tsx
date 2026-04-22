"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CountryCard from "@/components/country-card";
import CityCard from "@/components/city-card";
import { TripFormData } from "@/components/trip-form";

type CountrySuggestion = {
  pais: string;
  resumo: string;
  custoEstimado: number;
  motivoPrincipal: string;
};

type CitySuggestion = {
  cidade: string;
  resumo: string;
  custoEstimado: number;
  melhorPara: string;
};

export default function ResultsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const searchForm = useMemo<TripFormData | null>(() => {
    const origem = searchParams.get("origem");
    const orcamento = searchParams.get("orcamento");
    const tipo = searchParams.get("tipo");
    const dias = searchParams.get("dias");
    const mes = searchParams.get("mes");
    const perfil = searchParams.get("perfil");

    if (!origem || !orcamento || !tipo || !dias || !mes || !perfil) {
      return null;
    }

    return {
      origem,
      orcamento: Number(orcamento),
      tipo,
      dias: Number(dias),
      mes,
      perfil,
    };
  }, [searchParams]);

  const [countries, setCountries] = useState<CountrySuggestion[]>([]);
  const [cities, setCities] = useState<CitySuggestion[]>([]);

  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedCityData, setSelectedCityData] = useState<CitySuggestion | null>(
    null
  );

  const [loadingCountries, setLoadingCountries] = useState(true);
  const [loadingCities, setLoadingCities] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCountries = async () => {
      if (!searchForm) {
        setError("Faltam dados da pesquisa.");
        setLoadingCountries(false);
        return;
      }

      try {
        setLoadingCountries(true);
        setError("");
        setCountries([]);
        setCities([]);
        setSelectedCountry(null);
        setSelectedCity(null);
        setSelectedCityData(null);

        const res = await fetch("/api/suggest-countries", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(searchForm),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Erro ao procurar países.");
        }

        setCountries(data.destinos || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro inesperado.");
      } finally {
        setLoadingCountries(false);
      }
    };

    fetchCountries();
  }, [searchForm]);

  const handleSelectCountry = async (pais: string) => {
    if (!searchForm) return;

    try {
      setLoadingCities(true);
      setError("");
      setSelectedCountry(pais);
      setSelectedCity(null);
      setSelectedCityData(null);
      setCities([]);

      const res = await fetch("/api/suggest-cities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...searchForm,
          pais,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao procurar cidades.");
      }

      setCities(data.cidades || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setLoadingCities(false);
    }
  };

  const handleSelectCity = (city: CitySuggestion) => {
    setSelectedCity(city.cidade);
    setSelectedCityData(city);
  };

  const handleGenerateFinalTrip = () => {
    if (!searchForm || !selectedCountry || !selectedCityData) return;

    const params = new URLSearchParams({
      origem: searchForm.origem,
      orcamento: String(searchForm.orcamento),
      tipo: searchForm.tipo,
      dias: String(searchForm.dias),
      mes: searchForm.mes,
      perfil: searchForm.perfil,
      pais: selectedCountry,
      cidade: selectedCityData.cidade,
      resumoCidade: selectedCityData.resumo,
      melhorPara: selectedCityData.melhorPara,
      custoEstimadoCidade: String(selectedCityData.custoEstimado),
    });

    router.push(`/final-trip?${params.toString()}`);
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fdfcf9_0%,#f7f7fb_55%,#f4f8fb_100%)] px-4 py-10 md:px-6 md:py-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center rounded-full border border-sky-200 bg-white/80 px-3 py-1 text-xs font-medium text-slate-600 shadow-sm backdrop-blur">
              Resultados
            </div>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
              Escolhe primeiro o país, depois a cidade
            </h1>

            {searchForm && (
              <p className="mt-3 text-sm leading-6 text-slate-600">
                A sair de <strong>{searchForm.origem}</strong>, com orçamento de{" "}
                <strong>€{searchForm.orcamento}</strong>, durante{" "}
                <strong>{searchForm.dias} dias</strong>, com foco em{" "}
                <strong>{searchForm.tipo}</strong>.
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

        {error && (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        {loadingCountries && (
          <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-10 text-center shadow-sm">
            <p className="text-sm text-slate-600">A procurar países...</p>
          </div>
        )}

        {!loadingCountries && countries.length === 0 && !error && (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white/90 p-10 text-center shadow-sm">
            <p className="text-sm text-slate-500">
              Não foi possível encontrar sugestões para esta pesquisa.
            </p>
          </div>
        )}

        {!loadingCountries && countries.length > 0 && (
          <section>
            <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="space-y-5">
                <div className="sticky top-6">
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold text-slate-900">
                      1. Países sugeridos
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">
                      Começa por escolher o país que mais te chama a atenção.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {countries.map((country, index) => (
                      <CountryCard
                        key={`${country.pais}-${index}`}
                        country={country}
                        selected={selectedCountry === country.pais}
                        onClick={() => handleSelectCountry(country.pais)}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-slate-900">
                    2. Cidades sugeridas
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    {selectedCountry
                      ? `Agora escolhe uma cidade em ${selectedCountry}.`
                      : "Escolhe um país para veres as cidades aqui."}
                  </p>
                </div>

                {!selectedCountry && (
                  <div className="rounded-3xl border border-dashed border-slate-300 bg-white/90 p-10 text-center shadow-sm">
                    <p className="text-sm text-slate-500">
                      Nenhum país selecionado ainda.
                    </p>
                  </div>
                )}

                {selectedCountry && loadingCities && (
                  <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-10 text-center shadow-sm">
                    <p className="text-sm text-slate-600">
                      A procurar cidades em {selectedCountry}...
                    </p>
                  </div>
                )}

                {selectedCountry && !loadingCities && cities.length === 0 && (
                  <div className="rounded-3xl border border-dashed border-slate-300 bg-white/90 p-10 text-center shadow-sm">
                    <p className="text-sm text-slate-500">
                      Ainda não há cidades para mostrar.
                    </p>
                  </div>
                )}

                {!loadingCities && cities.length > 0 && (
                  <>
                    <div className="grid gap-5">
                      {cities.map((city, index) => (
                        <CityCard
                          key={`${city.cidade}-${index}`}
                          city={city}
                          selected={selectedCity === city.cidade}
                          onClick={() => handleSelectCity(city)}
                        />
                      ))}
                    </div>

                    {selectedCityData && (
                      <div className="mt-6 rounded-[26px] border border-slate-200/80 bg-white/90 p-6 shadow-[0_8px_30px_rgba(148,163,184,0.10)]">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm text-slate-600">
                              Cidade escolhida
                            </p>
                            <h3 className="mt-1 text-xl font-semibold text-slate-900">
                              {selectedCityData.cidade}
                            </h3>
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                              Vamos agora transformar esta escolha numa viagem
                              final mais detalhada, com zonas onde ficar e um
                              roteiro por manhã, tarde e noite.
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
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}