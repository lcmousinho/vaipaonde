export interface TripRequest {
  origem: string;
  orcamento: number;
  tipo: string;
  dias: number;
  mes: string;
  perfil: string;
}

export interface CountrySuggestion {
  pais: string;
  resumo: string;
  custoEstimado: number;
  motivoPrincipal: string;
}

export interface CountrySuggestionsResponse {
  destinos: CountrySuggestion[];
}

export interface CityRequest extends TripRequest {
  pais: string;
}

export interface StayArea {
  nome: string;
  perfil: string;
  motivo: string;
}

export interface CitySuggestion {
  cidade: string;
  resumo: string;
  custoEstimado: number;
  melhorPara: string;
  regioesHospedagem: StayArea[];
}

export interface CitySuggestionsResponse {
  pais: string;
  cidades: CitySuggestion[];
}

export interface CityDetailsRequest extends TripRequest {
  pais: string;
  cidade: string;
}

export interface ItineraryDay {
  dia: number;
  titulo: string;
  descricao: string;
}

export interface CityDetailsResponse {
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
}

export interface FinalTripRequest extends TripRequest {
  pais: string;
  cidade: string;
  resumoCidade: string;
  melhorPara: string;
  custoEstimadoCidade: number;
}

export interface FinalTripStayArea {
  nome: string;
  perfil: string;
  motivo: string;
}

export interface FinalTripPeriod {
  periodo: "manhã" | "tarde" | "noite";
  titulo: string;
  descricao: string;
}

export interface FinalTripDay {
  dia: number;
  manha: FinalTripPeriod;
  tarde: FinalTripPeriod;
  noite: FinalTripPeriod;
}

export interface FinalTripResponse {
  pais: string;
  cidade: string;
  resumoFinal: string;
  custoEstimadoTotal: number;
  vooEstimado: number;
  hospedagemEstimada: number;
  comidaEstimada: number;
  transporteEstimado: number;
  melhorPara: string;
  regioesHospedagem: FinalTripStayArea[];
  roteiro: FinalTripDay[];
  dicasFinais: string[];
}

/**
 * Mantém este alias para não quebrar componentes antigos
 * que ainda usam Trip.
 */
export type Trip = CityDetailsResponse;

/**
 * Mantém este tipo se o frontend do formulário já importa daqui.
 */
export type TripFormData = TripRequest;
