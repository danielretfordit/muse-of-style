import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  mode: "chat" | "outfit" | "analyze" | "shopping";
  context?: {
    weather?: { temperature: number; condition: string; humidity: number };
    occasion?: string;
    wardrobeCount?: number;
    profileSummary?: string;
  };
}

const SYSTEM_PROMPTS: Record<string, string> = {
  chat: `Ты — Stilisti, персональный AI-стилист нового поколения. Ты дружелюбный, профессиональный и креативный.

ТВОИ ВОЗМОЖНОСТИ:
- Консультации по стилю и моде
- Советы по сочетанию цветов и текстур
- Рекомендации по выбору одежды для событий
- Анализ трендов и персонализированные советы
- Помощь с капсульным гардеробом

ПРАВИЛА:
- Отвечай кратко и по делу, но дружелюбно
- Используй эмодзи умеренно для выразительности
- Давай конкретные, практичные советы
- Учитывай контекст погоды и предпочтения пользователя
- Отвечай на русском языке`,

  outfit: `Ты — AI-стилист Stilisti, специализирующийся на создании образов.
Когда пользователь просит подобрать образ, дай детальное описание:
1. Верх (конкретная вещь, цвет, материал)
2. Низ
3. Обувь
4. Верхняя одежда (если нужна)
5. Аксессуары
6. Общее описание стиля

Учитывай погоду, случай и предпочтения. Будь конкретным и креативным.
Отвечай на русском языке.`,

  analyze: `Ты — AI-стилист Stilisti, эксперт по анализу стиля.
Анализируй гардероб пользователя, выявляй:
- Сильные стороны гардероба
- Пробелы и недостающие базовые вещи
- Рекомендации по улучшению
- Цветовую палитру и её гармоничность
Отвечай на русском языке.`,

  shopping: `Ты — AI-стилист Stilisti, эксперт по шопингу.
Помогай с:
- Составлением списков покупок
- Приоритизацией покупок по важности
- Советами по бюджету
- Рекомендациями по брендам и магазинам
Отвечай на русском языке.`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } =
      await supabaseClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;
    console.log("ai-stylist-chat called by user:", userId);

    const body: ChatRequest = await req.json();
    const { messages, mode = "chat", context } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Messages required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (messages.length > 50) {
      return new Response(
        JSON.stringify({ error: "Too many messages (max 50)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build system prompt with context
    let systemPrompt = SYSTEM_PROMPTS[mode] || SYSTEM_PROMPTS.chat;

    if (context?.weather) {
      systemPrompt += `\n\nТЕКУЩАЯ ПОГОДА: ${context.weather.temperature}°C, ${context.weather.condition}, влажность ${context.weather.humidity}%.`;
    }
    if (context?.occasion) {
      systemPrompt += `\nСЛУЧАЙ: ${context.occasion}`;
    }
    if (context?.wardrobeCount !== undefined) {
      systemPrompt += `\nВЕЩЕЙ В ГАРДЕРОБЕ: ${context.wardrobeCount}`;
    }
    if (context?.profileSummary) {
      systemPrompt += `\nПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ: ${context.profileSummary}`;
    }

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages.map((m) => ({ role: m.role, content: m.content })),
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Слишком много запросов. Попробуйте позже." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Лимит запросов исчерпан." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ai-stylist-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
