import { openai } from "@/lib/openai";
import { memoryCache } from "@/lib/cache";
import { createCacheKey } from "@/lib/cache-key";
import { NextRequest, NextResponse } from "next/server";
import { FinalTripRequest, FinalTripResponse } from "@/types";

const FINAL_TRIP_CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24 horas

function safeJsonParse<T>(value: string): T {
  const cleaned = value.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned) as T;
}

export async function POST(req: NextRequest) {
  try {
    const body: FinalTripRequest = await req.json();

    const {
      origem,
      orcamento,
      tipo,
      dias,
      mes,
      perfil,
      pais,
      cidade,
      resumoCidade,
      melhorPara,
      custoEstimadoCidade,
    } = body;

    if (
      !origem ||
      !orcamento ||
      !tipo ||
      !dias ||
      !mes ||
      !perfil ||
      !pais ||
      !cidade ||
      !resumoCidade ||
      !melhorPara ||
      !custoEstimadoCidade
    ) {
      return NextResponse.json(
        { error: "Campos obrigatórios em falta." },
        { status: 400 }
      );
    }

    const cacheKey = createCacheKey("final-trip", body);
    const cached = memoryCache.get<FinalTripResponse>(cacheKey);

    if (cached) {
      return NextResponse.json(cached);
    }

    const prompt = `
És um especialista em planeamento de viagens.

O utilizador já escolheu esta cidade e agora quer uma versão final da viagem.

Dados já conhecidos:
- Origem: ${origem}
- Orçamento máximo: €${orcamento}
- Tipo de viagem: ${tipo}
- Dias: ${dias}
- Mês: ${mes}
- Perfil: ${perfil}
- País: ${pais}
- Cidade: ${cidade}
- Resumo curto já mostrado antes: ${resumoCidade}
- Melhor para: ${melhorPara}
- Custo estimado anterior: €${custoEstimadoCidade}

Objetivo:
Gerar uma versão final da viagem, mais completa e mais útil, sem repetir de forma óbvia o resumo curto anterior.

Importante:
- Não repitas o mesmo texto do resumo anterior.
- Usa o resumo anterior apenas como contexto.
- O resultado final deve parecer uma evolução natural da escolha feita.
- O roteiro deve ter exatamente ${dias} dias.
- Para cada dia, cria 3 blocos:
  - manhã
  - tarde
  - noite
- Cada bloco deve ter:
  - titulo
  - descricao curta e concreta
- Sugere 3 zonas ou bairros para ficar hospedado.
- As estimativas devem ser plausíveis.
- O texto deve ser claro, útil e não genérico.
- Responde em português de Portugal.
- Responde APENAS com JSON válido.
- Não uses markdown.

Formato obrigatório:
{
  "pais": "${pais}",
  "cidade": "${cidade}",
  "resumoFinal": "string",
  "custoEstimadoTotal": 0,
  "vooEstimado": 0,
  "hospedagemEstimada": 0,
  "comidaEstimada": 0,
  "transporteEstimado": 0,
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
      "manha": {
        "periodo": "manhã",
        "titulo": "string",
        "descricao": "string"
      },
      "tarde": {
        "periodo": "tarde",
        "titulo": "string",
        "descricao": "string"
      },
      "noite": {
        "periodo": "noite",
        "titulo": "string",
        "descricao": "string"
      }
    }
  ],
  "dicasFinais": ["string", "string", "string"]
}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.7,
      max_tokens: 1600,
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

    const parsed = safeJsonParse<FinalTripResponse>(content);

    memoryCache.set(cacheKey, parsed, FINAL_TRIP_CACHE_TTL_MS);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Erro em /api/final-trip:", error);

    return NextResponse.json(
      { error: "Erro ao gerar a viagem final." },
      { status: 500 }
    );
  }
}