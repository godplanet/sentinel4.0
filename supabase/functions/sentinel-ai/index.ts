import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const GEMINI_FALLBACK = "gemini-1.5-flash";

interface RequestBody {
  action: "ping" | "generate" | "stream";
  provider: "gemini" | "openai";
  apiKey: string;
  model: string;
  prompt: string;
  systemPrompt?: string;
  contextData?: string;
}

function sanitizeGeminiModel(raw: string): string {
  let name = raw.trim();
  if (name.startsWith("models/")) {
    name = name.slice(7);
  }
  return name || GEMINI_FALLBACK;
}

function buildGeminiPayload(
  prompt: string,
  systemPrompt?: string,
  contextData?: string
) {
  const userText = contextData
    ? `[SAYFA BAGLAMI]\n${contextData}\n\n[KULLANICI SORUSU]\n${prompt}`
    : prompt;

  const body: Record<string, unknown> = {
    contents: [{ role: "user", parts: [{ text: userText }] }],
    generationConfig: {
      temperature: 0.7,
      topP: 0.95,
      maxOutputTokens: 4096,
    },
  };

  if (systemPrompt) {
    body.systemInstruction = { parts: [{ text: systemPrompt }] };
  }

  return body;
}

function buildOpenAIPayload(
  prompt: string,
  systemPrompt?: string,
  contextData?: string,
  stream = false
) {
  const messages: { role: string; content: string }[] = [];
  if (systemPrompt) messages.push({ role: "system", content: systemPrompt });
  const userText = contextData
    ? `[SAYFA BAGLAMI]\n${contextData}\n\n[KULLANICI SORUSU]\n${prompt}`
    : prompt;
  messages.push({ role: "user", content: userText });
  return { messages, stream };
}

function geminiErrorMessage(status: number, rawBody: string): string {
  if (status === 404) {
    return `Model bulunamadi (404). Lutfen model secimini degistirin veya "${GEMINI_FALLBACK}" deneyin.`;
  }
  if (status === 429) {
    return "API kotasi doldu (429). Ucretsiz plan limiti asilmis olabilir. Daha dusuk bir model deneyin veya bekleyin.";
  }
  if (status === 403) {
    return "Erisim reddedildi (403). API anahtarinizin bu modele yetkisi yok.";
  }
  if (status === 400 && rawBody.includes("API key")) {
    return "Gecersiz API anahtari. Lutfen Google AI Studio'dan kontrol edin.";
  }
  return rawBody || `Gemini API hatasi: ${status}`;
}

async function handleGeminiGenerate(body: RequestBody): Promise<Response> {
  const model = sanitizeGeminiModel(body.model);
  const payload = buildGeminiPayload(
    body.prompt,
    body.systemPrompt,
    body.contextData
  );
  const url = `${GEMINI_BASE}/${model}:generateContent?key=${body.apiKey}`;

  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!resp.ok) {
    const err = await resp.text();

    if ((resp.status === 404 || resp.status === 429) && model !== GEMINI_FALLBACK) {
      const fallbackUrl = `${GEMINI_BASE}/${GEMINI_FALLBACK}:generateContent?key=${body.apiKey}`;
      const fallbackResp = await fetch(fallbackUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (fallbackResp.ok) {
        const data = await fallbackResp.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        return new Response(JSON.stringify({ text, fallbackUsed: GEMINI_FALLBACK }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const msg = geminiErrorMessage(resp.status, err);
    return new Response(
      JSON.stringify({ error: true, message: msg, status: resp.status }),
      { status: resp.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const data = await resp.json();
  const text =
    data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

  return new Response(JSON.stringify({ text }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function handleGeminiStream(body: RequestBody): Promise<Response> {
  const model = sanitizeGeminiModel(body.model);
  const payload = buildGeminiPayload(
    body.prompt,
    body.systemPrompt,
    body.contextData
  );
  const url = `${GEMINI_BASE}/${model}:streamGenerateContent?alt=sse&key=${body.apiKey}`;

  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!resp.ok) {
    const err = await resp.text();

    if ((resp.status === 404 || resp.status === 429) && model !== GEMINI_FALLBACK) {
      const fallbackUrl = `${GEMINI_BASE}/${GEMINI_FALLBACK}:streamGenerateContent?alt=sse&key=${body.apiKey}`;
      const fallbackResp = await fetch(fallbackUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (fallbackResp.ok) {
        return new Response(fallbackResp.body, {
          headers: {
            ...corsHeaders,
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
          },
        });
      }
    }

    const msg = geminiErrorMessage(resp.status, err);
    return new Response(
      JSON.stringify({ error: true, message: msg, status: resp.status }),
      { status: resp.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  return new Response(resp.body, {
    headers: {
      ...corsHeaders,
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

async function handleOpenAIGenerate(body: RequestBody): Promise<Response> {
  const payload = buildOpenAIPayload(
    body.prompt,
    body.systemPrompt,
    body.contextData,
    false
  );

  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${body.apiKey}`,
    },
    body: JSON.stringify({ ...payload, model: body.model }),
  });

  if (!resp.ok) {
    const err = await resp.text();
    return new Response(
      JSON.stringify({ error: true, message: err, status: resp.status }),
      { status: resp.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const data = await resp.json();
  const text = data?.choices?.[0]?.message?.content || "";

  return new Response(JSON.stringify({ text }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function handleOpenAIStream(body: RequestBody): Promise<Response> {
  const payload = buildOpenAIPayload(
    body.prompt,
    body.systemPrompt,
    body.contextData,
    true
  );

  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${body.apiKey}`,
    },
    body: JSON.stringify({ ...payload, model: body.model }),
  });

  if (!resp.ok) {
    const err = await resp.text();
    return new Response(
      JSON.stringify({ error: true, message: err, status: resp.status }),
      { status: resp.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  return new Response(resp.body, {
    headers: {
      ...corsHeaders,
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body: RequestBody = await req.json();

    if (!body.apiKey || !body.model || !body.provider) {
      return new Response(
        JSON.stringify({ error: true, message: "apiKey, model ve provider zorunlu." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (body.action === "ping") {
      body.prompt = 'Merhaba. Sadece "OK" yaz.';

      if (body.provider === "gemini") {
        const result = await handleGeminiGenerate(body);
        const data = await result.json();
        const ok = !data.error && !!data.text;
        return new Response(
          JSON.stringify({
            ok,
            text: data.text || "",
            error: data.message || null,
            fallbackUsed: data.fallbackUsed || null,
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } else {
        const result = await handleOpenAIGenerate(body);
        const data = await result.json();
        const ok = !data.error && !!data.text;
        return new Response(
          JSON.stringify({ ok, text: data.text || "", error: data.message || null }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    if (body.action === "generate") {
      if (body.provider === "gemini") return handleGeminiGenerate(body);
      return handleOpenAIGenerate(body);
    }

    if (body.action === "stream") {
      if (body.provider === "gemini") return handleGeminiStream(body);
      return handleOpenAIStream(body);
    }

    return new Response(
      JSON.stringify({ error: true, message: "Gecersiz action. ping | generate | stream" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Bilinmeyen sunucu hatasi";
    return new Response(
      JSON.stringify({ error: true, message: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
