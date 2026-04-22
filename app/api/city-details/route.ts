import { openai } from "@/lib/openai";
import { memoryCache } from "@/lib/cache";
import { createCacheKey } from "@/lib/cache-key";
import { NextRequest, NextResponse } from "next/server";
import {
  CityDetailsRequest,
  CityDetailsResponse,
} from "@/types";

const CITY_DETAILS_CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24 horas

function safeJsonParse<T>(value: string): T {
  const cleaned = value.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned) as T;
}

export async function POST(req: NextRequest) {
  try {
    const body: CityDetailsRequest = await req.json();

    const {
      origem,
      orcamento,
      tipo,
      dias,
      mes,
      perfil,
      pais,
      cidade,
    } = body;

    if (
      !origem ||
      !orcamento ||
      !tipo ||
      !dias ||
      !mes ||
      !perfil ||
      !pais ||
      !cidade
    ) {
      return NextResponse.json(
        { error: "Campos obrigatórios em falta." },
        { status: 400 }
      );
    }

    const cacheKey = createCacheKey("city-details", body);
    const cached = memoryCache.get<CityDetailsResponse>(cacheKey);

    if (cached) {
      return NextResponse.json(cached);
    }

    const prompt = `
És um especialista em planeamento de viagens e turismo urbano.

Quero um plano detalhado para uma cidade específica.

Preferências do utilizador:
- Origem: ${origem}
- Orçamento máximo total: €${orcamento}
- Tipo de viagem: ${tipo}
- Quantidade de dias: ${dias}
- Mês da viagem: ${mes}
- Perfil da viagem: ${perfil}
- País: ${pais}
- Cidade: ${cidade}

Objetivo:
Criar um plano detalhado e útil para esta cidade, com foco em:
- custo total plausível
- bairros/regiões recomendadas para hospedagem
- roteiro diário completo

Regras:
- Responde em português de Portugal.
- Não uses markdown.
- Responde APENAS com JSON válido.
- O roteiro deve ter exatamente ${dias} dias.
- As estimativas devem ser plausíveis para a cidade e para o perfil informado.
- Sugere 3 regiões ou bairros para hospedagem.
- Para cada região, explica rapidamente para que perfil serve e porque vale a pena.
- O custo total deve tentar respeitar o orçamento.
- Se a cidade for apertada para o orçamento, continua a responder de forma útil e realista.
- O resumo deve ser curto, claro e útil.
- O campo "melhorPara" deve ser breve.
- Evita texto genérico.

Formato obrigatório:
{
  "pais": "${pais}",
  "cidade": "${cidade}",
  "resumo": "string",
  "estimativaVoo": 0,
  "estimativaHospedagem": 0,
  "estimativaComida": 0,
  "estimativaTransporte": 0,
  "custoTotal": 0,
  "melhorPara": "string",
  "regioesHospedagem": [
    {
      "nome": "string",
      "perfil": "string",
      "motivo": "string"
    }
  ],
  "roteiro": [
    {
      "dia": 1,
      "titulo": "string",
      "descricao": "string"
    }
  ]
}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.7,
      max_tokens: 1200,
      messages: [
        {
          role: "system",
          content:
            "Responde sempre com JSON válido, sem markdown, sem comentários e sem qualquer texto fora do JSON.",
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

    const parsed = safeJsonParse<CityDetailsResponse>(content);

    memoryCache.set(cacheKey, parsed, CITY_DETAILS_CACHE_TTL_MS);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Erro em /api/city-details:", error);

    return NextResponse.json(
      { error: "Erro ao gerar detalhe da cidade." },
      { status: 500 }
    );
  }
}