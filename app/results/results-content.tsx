"use client";

import { getUserPremiumStatus } from "@/lib/get-user-premium";
import { useEffect, useMemo, useRef, useState } from "react";
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

type SearchFormWithPreset = TripFormData & {
  paisPreselecionado?: string;
};

export default function ResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const searchForm = useMemo<SearchFormWithPreset | null>(() => {
    const origem = searchParams.get("origem");
    const orcamento = searchParams.get("orcamento");
    const tipo = searchParams.get("tipo");
    const dias = searchParams.get("dias");
    const mes = searchParams.get("mes");
    const perfil = searchParams.get("perfil");
    const paisPreselecionado = searchParams.get("paisPreselecionado");

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
      paisPreselecionado: paisPreselecionado || "",
    };
  }, [searchParams]);

  const [countries, setCountries] = useState<CountrySuggestion[]>([]);
  const [cities, setCities] = useState<CitySuggestion[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  const [visibleCountries, setVisibleCountries] = useState(3);
  const [visibleCities, setVisibleCities] = useState(3);

  const [loadingCountries, setLoadingCountries] = useState(true);
  const [loadingCities, setLoadingCities] = useState(false);
  const [error, setError] = useState("");

  const [loggedIn, setLoggedIn] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [premiumLoading, setPremiumLoading] = useState(true);
  const [premiumModalOpen, setPremiumModalOpen] = useState(false);

  const autoSelectedCountryRef = useRef(false);

  useEffect(() => {
    const loadPremiumStatus = async () => {
      try {
        setPremiumLoading(true);
        const status = await getUserPremiumStatus();

        setLoggedIn(status.loggedIn);
        setIsPremium(status.isPremium);
      } catch (err) {
        console.error("Erro ao carregar estado premium:", err);
        setLoggedIn(false);
        setIsPremium(false);
      } finally {
        setPremiumLoading(false);
      }
    };

    loadPremiumStatus();
  }, []);

  const handleSelectCountry = async (pais: string) => {
    if (!searchForm) return;

    try {
      setLoadingCities(true);
      setError("");
      setSelectedCountry(pais);
      setCities([]);
      setVisibleCities(3);

      const res = await fetch("/api/suggest-cities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          origem: searchForm.origem,
          orcamento: searchForm.orcamento,
          tipo: searchForm.tipo,
          dias: searchForm.dias,
          mes: searchForm.mes,
          perfil: searchForm.perfil,
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
        setVisibleCountries(3);
        setVisibleCities(3);
        autoSelectedCountryRef.current = false;

        const res = await fetch("/api/suggest-countries", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            origem: searchForm.origem,
            orcamento: searchForm.orcamento,
            tipo: searchForm.tipo,
            dias: searchForm.dias,
            mes: searchForm.mes,
            perfil: searchForm.perfil,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Erro ao procurar países.");
        }

        const destinos: CountrySuggestion[] = data.destinos || [];
        setCountries(destinos);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro inesperado.");
      } finally {
        setLoadingCountries(false);
      }
    };

    fetchCountries();
  }, [searchForm]);

  useEffect(() => {
    if (
      loadingCountries ||
      !searchForm?.paisPreselecionado ||
      autoSelectedCountryRef.current ||
      countries.length === 0
    ) {
      return;
    }

    const match = countries.find(
      (item) =>
        item.pais.trim().toLowerCase() ===
        searchForm.paisPreselecionado?.trim().toLowerCase()
    );

    if (match) {
      autoSelectedCountryRef.current = true;
      handleSelectCountry(match.pais);
    }
  }, [countries, loadingCountries, searchForm]);

  const handleOpenCityDetails = (city: CitySuggestion) => {
    if (!searchForm || !selectedCountry) return;

    const params = new URLSearchParams({
      origem: searchForm.origem,
      orcamento: String(searchForm.orcamento),
      tipo: searchForm.tipo,
      dias: String(searchForm.dias),
      mes: searchForm.mes,
      perfil: searchForm.perfil,
      pais: selectedCountry,
      cidade: city.cidade,
      resumoCidade: city.resumo,
      melhorPara: city.melhorPara,
      custoEstimadoCidade: String(city.custoEstimado),
    });

    router.push(`/city-details?${params.toString()}`);
  };

  const handleShowMoreCountries = () => {
    if (isPremium) {
      setVisibleCountries((previous) => previous + 3);
      return;
    }

    setPremiumModalOpen(true);
  };

  const handleGoToLogin = () => {
    const currentUrl = `/results?${searchParams.toString()}`;
    router.push(`/login?next=${encodeURIComponent(currentUrl)}`);
  };

  const handleGoToSignup = () => {
    const currentUrl = `/results?${searchParams.toString()}`;
    router.push(`/signup?next=${encodeURIComponent(currentUrl)}`);
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
                    {countries
                      .slice(0, visibleCountries)
                      .map((country, index) => (
                        <CountryCard
                          key={`${country.pais}-${index}`}
                          country={country}
                          selected={selectedCountry === country.pais}
                          onClick={() => handleSelectCountry(country.pais)}
                        />
                      ))}

                    {visibleCountries < countries.length && (
                      <button
                        type="button"
                        onClick={handleShowMoreCountries}
                        className="w-full rounded-2xl border border-violet-200 bg-violet-50/80 px-4 py-3 text-sm font-medium text-violet-900 shadow-sm transition hover:bg-violet-100"
                      >
                        Ver mais destinos · Premium
                      </button>
                    )}
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
                      ? `Escolhe uma cidade em ${selectedCountry} para abrir a página de detalhe.`
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
                  <div className="grid gap-5">
                    {cities.slice(0, visibleCities).map((city, index) => (
                      <CityCard
                        key={`${city.cidade}-${index}`}
                        city={city}
                        onClick={() => handleOpenCityDetails(city)}
                      />
                    ))}

                    {visibleCities < cities.length && (
                      <button
                        type="button"
                        onClick={() =>
                          setVisibleCities((previous) => previous + 3)
                        }
                        className="w-full rounded-2xl border border-violet-200 bg-white/90 px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-violet-50"
                      >
                        Ver mais cidades
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </div>

      {premiumModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800">
                  Premium
                </div>

                <h2 className="mt-4 text-2xl font-semibold text-slate-900">
                  Mais destinos disponíveis no Premium
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Para carregar mais sugestões de destinos, precisas de uma conta
                  premium.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setPremiumModalOpen(false)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                Fechar
              </button>
            </div>

            <div className="mt-6 rounded-2xl border border-violet-200 bg-violet-50/70 p-4">
              <p className="text-sm font-medium text-violet-900">
                Com Premium podes:
              </p>
              <ul className="mt-2 space-y-1 text-sm leading-6 text-slate-700">
                <li>• Ver mais sugestões de destinos</li>
                <li>• Desbloquear roteiros detalhados</li>
                <li>• Guardar viagens</li>
                <li>• Enviar roteiros por email</li>
              </ul>
            </div>

            {loggedIn && !isPremium && (
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                Estás logado, mas esta conta ainda não tem Premium ativo.
              </div>
            )}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              {!loggedIn && (
                <>
                  <button
                    type="button"
                    onClick={handleGoToLogin}
                    className="inline-flex flex-1 items-center justify-center rounded-2xl bg-violet-200 px-5 py-3 text-sm font-medium text-slate-900 shadow-sm transition hover:bg-violet-300"
                  >
                    Entrar
                  </button>

                  <button
                    type="button"
                    onClick={handleGoToSignup}
                    className="inline-flex flex-1 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    Criar conta
                  </button>
                </>
              )}

              {loggedIn && !isPremium && (
                <button
                  type="button"
                  onClick={() => alert("Pagamento premium em breve.")}
                  className="inline-flex flex-1 items-center justify-center rounded-2xl bg-violet-200 px-5 py-3 text-sm font-medium text-slate-900 shadow-sm transition hover:bg-violet-300"
                >
                  Virar Premium
                </button>
              )}

              {premiumLoading && (
                <button
                  type="button"
                  disabled
                  className="inline-flex flex-1 cursor-not-allowed items-center justify-center rounded-2xl bg-slate-100 px-5 py-3 text-sm font-medium text-slate-500"
                >
                  A verificar...
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}