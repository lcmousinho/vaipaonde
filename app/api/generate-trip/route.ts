import { openai } from "@/lib/openai";
import { NextRequest, NextResponse } from "next/server";
import { TripRequest } from "@/types";

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

    const prompt = `
És um especialista em planeamento de viagens económicas e realistas.

Preferências do utilizador:
- Origem: ${origem}
- Orçamento máximo total: €${orcamento}
- Tipo de viagem: ${tipo}
- Quantidade de dias: ${dias}
- Mês da viagem: ${mes}
- Perfil da viagem: ${perfil}

Objetivo:
Sugere 3 destinos realistas e cria um plano completo.

Regras:
- Destinos plausíveis a partir da origem
- Custos realistas (voo + hotel + comida + transporte)
- Respeita o orçamento tanto quanto possível
- Roteiro com exatamente ${dias} dias
- Evita respostas genéricas
- Responde em português de Portugal
- Responde APENAS em JSON válido

Formato:
{
  "destinos": [
    {
      "nome": "string",
      "pais": "string",
      "resumo": "string",
      "estimativaVoo": 0,
      "estimativaHospedagem": 0,
      "estimativaComida": 0,
      "estimativaTransporte": 0,
      "custoTotal": 0,
      "melhorPara": "string",
      "roteiro": [
        {
          "dia": 1,
          "titulo": "string",
          "descricao": "string"
        }
      ]
    }
  ]
}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content:
            "Responde sempre com JSON válido, sem markdown, sem comentários e sem texto fora do JSON.",
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

    const parsed = JSON.parse(content);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Erro no generate-trip:", error);

    return NextResponse.json(
      { error: "Erro ao gerar a viagem." },
      { status: 500 }
    );
  }
}