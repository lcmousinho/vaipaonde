import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

type StayArea = {
  nome: string;
  perfil: string;
  motivo: string;
};

type PeriodBlock = {
  periodo: "manhã" | "tarde" | "noite";
  titulo: string;
  descricao: string;
};

type FinalTripDay = {
  dia: number;
  manha: PeriodBlock;
  tarde: PeriodBlock;
  noite: PeriodBlock;
};

type FinalTripPayload = {
  pais: string;
  cidade: string;
  resumoFinal: string;
  custoEstimadoTotal: number;
  vooEstimado: number;
  hospedagemEstimada: number;
  comidaEstimada: number;
  transporteEstimado: number;
  melhorPara: string;
  regioesHospedagem: StayArea[];
  roteiro: FinalTripDay[];
  dicasFinais: string[];
};

type RequestBody = {
  email: string;
  trip: FinalTripPayload;
  premiumBypass?: boolean;
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function canUsePremiumTest(email: string, premiumBypass?: boolean) {
  if (!premiumBypass) return false;
  if (process.env.NEXT_PUBLIC_ENABLE_PREMIUM_TEST !== "true") return false;

  const allowedEmails = (process.env.PREMIUM_TEST_EMAILS || "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  if (allowedEmails.length === 0) return true;

  return allowedEmails.includes(email.toLowerCase());
}

function buildTripEmailHtml(trip: FinalTripPayload) {
  const stayAreas = trip.regioesHospedagem
    .map(
      (area) => `
        <li style="margin-bottom:10px;">
          <strong>${area.nome}</strong> — ${area.perfil}<br/>
          <span>${area.motivo}</span>
        </li>
      `
    )
    .join("");

  const itinerary = trip.roteiro
    .map(
      (day) => `
        <div style="margin-bottom:24px; padding:16px; border:1px solid #e2e8f0; border-radius:16px;">
          <h3 style="margin:0 0 12px 0;">Dia ${day.dia}</h3>
          <p><strong>Manhã:</strong> ${day.manha.titulo} — ${day.manha.descricao}</p>
          <p><strong>Tarde:</strong> ${day.tarde.titulo} — ${day.tarde.descricao}</p>
          <p><strong>Noite:</strong> ${day.noite.titulo} — ${day.noite.descricao}</p>
        </div>
      `
    )
    .join("");

  const tips = trip.dicasFinais
    .map((tip) => `<li style="margin-bottom:8px;">${tip}</li>`)
    .join("");

  return `
    <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6; max-width: 720px; margin: 0 auto; padding: 24px;">
      <h1 style="margin-bottom: 8px;">${trip.cidade}, ${trip.pais}</h1>
      <p style="margin-top:0; color:#475569;">Roteiro gerado pela tua app de viagens.</p>

      <div style="padding:16px; background:#f8fafc; border-radius:16px; border:1px solid #e2e8f0; margin-bottom:24px;">
        <p><strong>Resumo:</strong> ${trip.resumoFinal}</p>
        <p><strong>Melhor para:</strong> ${trip.melhorPara}</p>
        <p><strong>Custo estimado total:</strong> €${trip.custoEstimadoTotal}</p>
        <p><strong>Voo:</strong> €${trip.vooEstimado}</p>
        <p><strong>Hospedagem:</strong> €${trip.hospedagemEstimada}</p>
        <p><strong>Comida:</strong> €${trip.comidaEstimada}</p>
        <p><strong>Transporte:</strong> €${trip.transporteEstimado}</p>
      </div>

      <h2>Onde ficar</h2>
      <ul>${stayAreas}</ul>

      <h2>Roteiro</h2>
      ${itinerary}

      <h2>Dicas finais</h2>
      <ul>${tips}</ul>
    </div>
  `;
}

function buildTripEmailText(trip: FinalTripPayload) {
  const stayAreas = trip.regioesHospedagem
    .map((area) => `- ${area.nome} (${area.perfil}): ${area.motivo}`)
    .join("\n");

  const itinerary = trip.roteiro
    .map(
      (day) =>
        `Dia ${day.dia}\n` +
        `  Manhã: ${day.manha.titulo} - ${day.manha.descricao}\n` +
        `  Tarde: ${day.tarde.titulo} - ${day.tarde.descricao}\n` +
        `  Noite: ${day.noite.titulo} - ${day.noite.descricao}`
    )
    .join("\n\n");

  const tips = trip.dicasFinais.map((tip) => `- ${tip}`).join("\n");

  return `
${trip.cidade}, ${trip.pais}

Resumo:
${trip.resumoFinal}

Melhor para: ${trip.melhorPara}
Custo estimado total: €${trip.custoEstimadoTotal}

Voo: €${trip.vooEstimado}
Hospedagem: €${trip.hospedagemEstimada}
Comida: €${trip.comidaEstimada}
Transporte: €${trip.transporteEstimado}

Onde ficar:
${stayAreas}

Roteiro:
${itinerary}

Dicas finais:
${tips}
  `.trim();
}

export async function POST(req: NextRequest) {
  try {
    const body: RequestBody = await req.json();
    const { email, trip, premiumBypass } = body;

    if (!email || !trip) {
      return NextResponse.json(
        { error: "Email e roteiro são obrigatórios." },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "O email introduzido não é válido." },
        { status: 400 }
      );
    }

    const isAllowedForTest = canUsePremiumTest(email, premiumBypass);

    if (!isAllowedForTest) {
      return NextResponse.json(
        {
          error:
            "Esta funcionalidade é premium. O envio por email ainda não está disponível no plano gratuito.",
        },
        { status: 402 }
      );
    }

    const subject = `O teu roteiro para ${trip.cidade}, ${trip.pais}`;
    const html = buildTripEmailHtml(trip);
    const text = buildTripEmailText(trip);

    await sendEmail({
      to: email,
      subject,
      html,
      text,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro em /api/send-trip-email:", error);

    return NextResponse.json(
      { error: "Não foi possível enviar o email." },
      { status: 500 }
    );
  }
}