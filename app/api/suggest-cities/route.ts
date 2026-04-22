import { openai } from "@/lib/openai";
import { memoryCache } from "@/lib/cache";
import { createCacheKey } from "@/lib/cache-key";
import { NextRequest, NextResponse } from "next/server";
import {
  CityRequest,
  CitySuggestionsResponse,
} from "@/types";

const CITIES_CACHE_TTL_MS = 1000 * 60 * 60 * 12; // 12 horas

function safeJsonParse<T>(value: string): T {
  const cleaned = value.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned) as T;
}

export async function POST(req: NextRequest) {
  try {
    const body: CityRequest = await req.json();
    const { origem, orcamento, tipo, dias, mes, perfil, pais } = body;

    if (!origem || !orcamento || !tipo || !dias || !mes || !perfil || !pais) {
      return NextResponse.json(
        { error: "Campos obrigatórios em falta." },
        { status: 400 }
      );
    }

    const cacheKey = createCacheKey("suggest-cities", body);
    const cached = memoryCache.get<CitySuggestionsResponse>(cacheKey);

    if (cached) {
      return NextResponse.json(cached);
    }

    const prompt = `
És um especialista em planeamento de viagens.

Preferências:
- Origem: ${origem}
- País escolhido: ${pais}
- Orçamento máximo: €${orcamento}
- Tipo de viagem: ${tipo}
- Dias: ${dias}
- Mês: ${mes}
- Perfil: ${perfil}

Sugere 3 cidades reais dentro desse país que façam sentido para este perfil.
Para cada cidade, devolve:
- cidade
- resumo curto
- custoEstimado
- melhorPara
- 3 regiões ou bairros recomendados para hospedagem
- para cada região: nome, perfil, motivo

Ainda não quero roteiro detalhado.

Formato:
{
  "pais": "${pais}",
  "cidades": [
    {
      "cidade": "string",
      "resumo": "string",
      "custoEstimado": 0,
      "melhorPara": "string",
      "regioesHospedagem": [
        {
          "nome": "string",
          "perfil": "string",
          "motivo": "string"
        }
      ]
    }
  ]
}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.7,
      max_tokens: 900,
      messages: [
        {
          role: "system",
          content:
            "Responde sempre com JSON válido, sem markdown e sem texto fora do JSON.",
        },
        { role: "user", content: prompt },
      ],
    });

    const content = completion.choices[0].message.content;

    if (!content) {
      return NextResponse.json(
        { error: "A IA não devolveu conteúdo." },
        { status: 500 }
      );
    }

    const parsed = safeJsonParse<CitySuggestionsResponse>(content);

    memoryCache.set(cacheKey, parsed, CITIES_CACHE_TTL_MS);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Erro em /api/suggest-cities:", error);

    return NextResponse.json(
      { error: "Erro ao sugerir cidades." },
      { status: 500 }
    );
  }
}