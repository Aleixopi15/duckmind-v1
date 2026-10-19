const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const jsonHeaders = { ...corsHeaders, "Content-Type": "application/json" };

function cleanJsonResponse(rawText: string): string {
  let text = rawText.trim();
  if (text.startsWith("```")) {
    text = text.replace(/^```(?:json)?\\s*\\n?/, "").replace(/\\n?```\\s*$/, "").trim();
  }

  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    text = text.slice(firstBrace, lastBrace + 1);
  }

  let repaired = "";
  let insideString = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (character === '"' && text[index - 1] !== "\\\\") {
      insideString = !insideString;
      repaired += character;
      continue;
    }

    if (insideString && character === "\\\\") {
      const next = text[index + 1] ?? "";
      const nextNext = text[index + 2] ?? "";
      const isUnicodeEscape = next === "u" && /^[0-9a-fA-F]{4}$/.test(text.slice(index + 2, index + 6));
      const isJsonEscape = next === '"' || next === "\\\\" || next === "/" || ["b", "f", "n", "r", "t"].includes(next);
      const looksLikeLatexCommand = ["b", "f", "n", "r", "t", "u"].includes(next) && /[A-Za-z]/.test(nextNext);

      if (isJsonEscape && !looksLikeLatexCommand || isUnicodeEscape) {
        repaired += character;
      } else {
        repaired += "\\\\\\\\";
      }
      continue;
    }

    if (insideString && character === "\\n") {
      repaired += "\\\\n";
      continue;
    }

    repaired += character;
  }

  return repaired;
}

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "A análise inteligente ainda não está configurada." }), { status: 503, headers: jsonHeaders });
    }

    const body = await request.json();
    const imageData = typeof body.imageData === "string" ? body.imageData : "";
    const mimeType = typeof body.mimeType === "string" ? body.mimeType : "";
    const studentAnswer = typeof body.studentAnswer === "string" ? body.studentAnswer : "";
    const correctAnswer = typeof body.correctAnswer === "string" ? body.correctAnswer : "";
    const edital = Array.isArray(body.edital) ? body.edital : [];

    if (!imageData || !/^image\/(jpeg|png|webp)$/.test(mimeType) || imageData.length > 8_000_000) {
      return new Response(JSON.stringify({ error: "Envie uma imagem JPG, PNG ou WEBP de até 6 MB." }), { status: 400, headers: jsonHeaders });
    }
    if (!/^[A-E]$/.test(studentAnswer) || !/^[A-E]$/.test(correctAnswer)) {
      return new Response(JSON.stringify({ error: "Informe a alternativa marcada e o gabarito." }), { status: 400, headers: jsonHeaders });
    }

    const editalContext = edital.map((subject: { name?: string; topics?: { name?: string }[] }) =>
      `${subject.name ?? ""}: ${(subject.topics ?? []).map(topic => topic.name ?? "").join(", ")}`,
    ).join("\n");

    const base64 = imageData.includes(",") ? imageData.split(",", 2)[1] : imageData;

    const prompt = `Você é o Copiloto de um Caderno de Erros para estudantes do ENEM. Analise a imagem da questão e responda SOMENTE com um JSON válido (sem markdown, sem texto adicional) no seguinte formato exato:

{
  "materiaSugerida": "nome da matéria do edital",
  "topicoSugerido": "nome do tópico do edital",
  "enunciadoLatex": "enunciado transcrito com LaTeX",
  "diagnosticoErro": "explicação do porquê o aluno errou",
  "resolucaoPassoAPasso": "resolução passo a passo com LaTeX",
  "dicaFlashcard": "uma frase de memorização"
}

REGRAS CRÍTICAS PARA LaTeX NO JSON:
- Todas as barras invertidas dos comandos LaTeX devem ser DUPLAMENTE escapadas no JSON: use "\\\\text{...}" em vez de "\\text{...}", "\\\\approx" em vez de "\\approx", "\\\\rightarrow" em vez de "\\rightarrow".
- Sempre coloque um espaço antes e depois de comandos LaTeX dentro de texto: escreva "v \\\\approx 340 \\\\text{ m/s}" e nunca "v\\\\approx340\\\\text{m/s}".
- Use \\$...\\$ para fórmulas inline e \\$\\$...\\$\\$ para fórmulas em bloco.
- Nunca concatene texto com comandos LaTeX sem espaços. Exemplo correto: "A velocidade \\\\text{ \\'e } $v \\\\approx 340$ \\\\text{ m/s }."
- Garanta que cada comando LaTeX tenha suas chaves fechadas corretamente.

Resposta marcada pelo aluno: ${studentAnswer}
Gabarito correto: ${correctAnswer}

Classifique obrigatoriamente usando uma matéria e um tópico da lista abaixo. Nunca invente nomes; se não houver correspondência perfeita, escolha a opção mais próxima.
EDITAL COMPLETO:
${editalContext}

Transcreva o enunciado e todos os cálculos com LaTeX. Explique a pegadinha e por que a alternativa marcada está incorreta. A dica deve ser uma única frase de memorização.`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`;

    const geminiBody = {
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            { inlineData: { mimeType, data: base64 } },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.2,
      },
    };

    const geminiResponse = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(geminiBody),
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error("Gemini API error:", geminiResponse.status, errorText);
      return new Response(JSON.stringify({ error: `Erro da IA (${geminiResponse.status}): ${errorText.slice(0, 200)}` }), { status: 502, headers: jsonHeaders });
    }

    const geminiData = await geminiResponse.json();
    const candidate = geminiData?.candidates?.[0];
    const rawText = candidate?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("").trim();

    if (!rawText) {
      const blockReason = candidate?.finishReason ?? "UNKNOWN";
      console.error("No text in Gemini response. finishReason:", blockReason, "full data:", JSON.stringify(geminiData).slice(0, 500));
      return new Response(JSON.stringify({ error: `A IA não retornou texto. Motivo: ${blockReason}` }), { status: 502, headers: jsonHeaders });
    }

    const analysis = JSON.parse(cleanJsonResponse(rawText));
    return new Response(JSON.stringify(analysis), { status: 200, headers: jsonHeaders });
  } catch (error) {
    console.error("error question analysis failed", error);
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: `Erro interno: ${msg.slice(0, 200)}` }), { status: 500, headers: jsonHeaders });
  }
});
