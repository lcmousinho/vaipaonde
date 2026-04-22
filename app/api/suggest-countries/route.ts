import { openai } from "@/lib/openai";
import { memoryCache } from "@/lib/cache";
import { createCacheKey } from "@/lib/cache-key";
import { NextRequest, NextResponse } from "next/server";
import {
  CountrySuggestionsResponse,
  TripRequest,
} from "@/types";

const COUNTRIES_CACHE_TTL_MS = 1000 * 60 * 60 * 12; // 12 horas

function safeJsonParse<T>(value: string): T {
  const cleaned = value.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned) as T;
}

export async function POST(req: NextRequest) {
  try {
    const body: TripRequest = await req.json();
    const { origem, orcamento, tipo, dias, mes, perfil } = body;

    if (!origem || !orcamento || !tipo || !dias || !mes || !perfil) {
      return NextResponse.json(
        { error: "Campos obrigatórios em falta." },
        { status: 400 }
      );
    }

    const cacheKey = createCacheKey("suggest-countries", body);
    const cached = memoryCache.get<CountrySuggestionsResponse>(cacheKey);

    if (cached) {
      return NextResponse.json(cached);
    }

    const prompt = `
És um especialista em planeamento de viagens.

Com base nestas preferências:
- Origem: ${origem}
- Orçamento máximo: €${orcamento}
- Tipo de viagem: ${tipo}
- Dias: ${dias}
- Mês: ${mes}
- Perfil: ${perfil}

Sugere entre 3 e 8 países ou destinos macro realistas.
Ainda não quero cidades nem roteiros detalhados.

Para cada opção, devolve:
- pais
- custoEstimado
- resumo muito breve
- motivoPrincipal

Regras:
- Responde em português de Portugal
- Responde APENAS em JSON válido
- As sugestões devem ser plausíveis para o orçamento e duração
- O resumo deve ser curto
- O motivo principal também deve ser curto

Formato:
{
  "destinos": [
    {
      "pais": "string",
      "resumo": "string",
      "custoEstimado": 0,
      "motivoPrincipal": "string"
    }
  ]
}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.7,
      max_tokens: 700,
      messages: [
        {
          role: "system",
          content:
            "Responde sempre com JSON válido, sem markdown e sem texto fora do JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = completion.choices[0].message.content;

    if (!content) {
      return NextResponse.json(
        { error: "A IA não devolveu conteúdo." },
        { status: 500 }
      );
    }

    const parsed = safeJsonParse<CountrySuggestionsResponse>(content);

    memoryCache.set(cacheKey, parsed, COUNTRIES_CACHE_TTL_MS);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Erro em /api/suggest-countries:", error);

    return NextResponse.json(
      { error: "Erro ao sugerir países." },
      { status: 500 }
    );
  }
}