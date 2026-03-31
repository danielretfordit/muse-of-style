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

interface WardrobeItem {
  id: string;
  name: string;
  category: string;
  subcategory: string | null;
  color: string | null;
  brand: string | null;
  season: string | null;
  price: number | null;
  currency: string | null;
  image_url: string;
  tags: string[] | null;
  ownership_status: string;
}

function buildWardrobeContext(items: WardrobeItem[]): string {
  if (items.length === 0) return "\nГАРДЕРОБ ПОЛЬЗОВАТЕЛЯ: Пуст. Предложи добавить вещи.";

  const owned = items.filter(i => i.ownership_status === "owned");
  const saved = items.filter(i => i.ownership_status === "saved");

  // Group by category
  const byCategory: Record<string, WardrobeItem[]> = {};
  for (const item of owned) {
    const cat = item.category || "other";
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(item);
  }

  let ctx = `\n\n📦 ГАРДЕРОБ ПОЛЬЗОВАТЕЛЯ (${owned.length} вещей в наличии, ${saved.length} сохранённых идей):`;

  for (const [cat, catItems] of Object.entries(byCategory)) {
    ctx += `\n\n[${cat.toUpperCase()}]:`;
    for (const item of catItems) {
      ctx += `\n• ID:${item.id} | "${item.name}"`;
      if (item.brand) ctx += ` | ${item.brand}`;
      if (item.color) ctx += ` | цвет: ${item.color}`;
      if (item.season) ctx += ` | сезон: ${item.season}`;
      if (item.tags?.length) ctx += ` | теги: ${item.tags.join(", ")}`;
    }
  }

  if (saved.length > 0) {
    ctx += `\n\n[СОХРАНЁННЫЕ ИДЕИ]:`;
    for (const item of saved.slice(0, 10)) {
      ctx += `\n• ID:${item.id} | "${item.name}"`;
      if (item.brand) ctx += ` | ${item.brand}`;
    }
  }

  return ctx;
}

function buildSystemPrompt(mode: string, wardrobeCtx: string): string {
  const outfitFormat = `

КОГДА ПОДБИРАЕШЬ ОБРАЗ — ОБЯЗАТЕЛЬНО используй формат ниже, чтобы показать вещи визуально.
Вставляй блок :::outfit в ответ:

:::outfit
[{"id":"uuid-вещи-1","reason":"краткая причина"},{"id":"uuid-вещи-2","reason":"краткая причина"}]
:::

ПРАВИЛА ДЛЯ :::outfit БЛОКОВ:
- Используй ТОЛЬКО реальные ID вещей из гардероба пользователя (формат UUID)
- Подбирай полный комплект: верх + низ + обувь (+ верхняя одежда если холодно, + аксессуары по желанию)
- Можно вставлять несколько :::outfit блоков если предлагаешь варианты
- После блока добавляй текстовое описание почему этот образ хорош`;

  const base: Record<string, string> = {
    chat: `Ты — Stilisti, персональный AI-стилист нового поколения. Ты дружелюбный, профессиональный и креативный.

ТВОИ ВОЗМОЖНОСТИ:
- У тебя есть ПОЛНЫЙ ДОСТУП к гардеробу пользователя (список вещей ниже)
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
- Когда рекомендуешь вещи — ссылайся на конкретные вещи из гардероба по имени
- Отвечай на русском языке
${outfitFormat}`,

    outfit: `Ты — AI-стилист Stilisti, специализирующийся на создании образов.
У тебя есть ПОЛНЫЙ ДОСТУП к гардеробу пользователя.

Когда пользователь просит подобрать образ:
1. Изучи гардероб пользователя ниже
2. Подбери конкретные вещи из его гардероба
3. ОБЯЗАТЕЛЬНО используй :::outfit блок с реальными ID вещей
4. Добавь описание образа и советы по стилю

Учитывай погоду, случай и предпочтения. Будь конкретным и креативным.
Отвечай на русском языке.
${outfitFormat}`,

    analyze: `Ты — AI-стилист Stilisti, эксперт по анализу стиля.
У тебя есть ПОЛНЫЙ ДОСТУП к гардеробу пользователя.

Анализируй гардероб пользователя, выявляй:
- Сильные стороны гардероба
- Пробелы и недостающие базовые вещи
- Рекомендации по улучшению
- Цветовую палитру и её гармоничность
- Какие капсулы можно собрать из имеющихся вещей

Когда предлагаешь комплекты — используй :::outfit блоки с реальными ID.
Отвечай на русском языке.
${outfitFormat}`,

    shopping: `Ты — AI-стилист Stilisti, эксперт по шопингу.
У тебя есть ПОЛНЫЙ ДОСТУП к гардеробу пользователя.

Помогай с:
- Составлением списков покупок на основе ПРОБЕЛОВ в гардеробе
- Приоритизацией покупок по важности
- Советами по бюджету
- Рекомендациями что купить чтобы дополнить имеющиеся вещи

Указывай конкретно какие вещи уже есть и чего не хватает.
Отвечай на русском языке.
${outfitFormat}`,
  };

  return (base[mode] || base.chat) + wardrobeCtx;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    // Fetch user's wardrobe from DB
    const { data: wardrobeItems, error: wardrobeError } = await supabaseClient
      .from("wardrobe_items")
      .select("id, name, category, subcategory, color, brand, season, price, currency, image_url, tags, ownership_status")
      .eq("user_id", userId)
      .limit(200);

    if (wardrobeError) {
      console.error("Wardrobe fetch error:", wardrobeError);
    }

    const wardrobe = (wardrobeItems || []) as WardrobeItem[];
    const wardrobeCtx = buildWardrobeContext(wardrobe);

    // Fetch user profile for additional context
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("gender, preferred_styles, favorite_colors, disliked_colors, body_type, height, weight")
      .eq("user_id", userId)
      .maybeSingle();

    let profileCtx = "";
    if (profile) {
      const parts: string[] = [];
      if (profile.gender) parts.push(`Пол: ${profile.gender}`);
      if (profile.body_type) parts.push(`Тип фигуры: ${profile.body_type}`);
      if (profile.height) parts.push(`Рост: ${profile.height}см`);
      if (profile.preferred_styles?.length) parts.push(`Стили: ${profile.preferred_styles.join(", ")}`);
      if (profile.favorite_colors?.length) parts.push(`Любимые цвета: ${profile.favorite_colors.join(", ")}`);
      if (profile.disliked_colors?.length) parts.push(`Нелюбимые цвета: ${profile.disliked_colors.join(", ")}`);
      if (parts.length > 0) profileCtx = `\n\nПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ: ${parts.join(" | ")}`;
    }

    // Build system prompt with wardrobe + profile + weather
    let systemPrompt = buildSystemPrompt(mode, wardrobeCtx + profileCtx);

    if (context?.weather) {
      systemPrompt += `\n\nТЕКУЩАЯ ПОГОДА: ${context.weather.temperature}°C, ${context.weather.condition}, влажность ${context.weather.humidity}%.`;
    }
    if (context?.occasion) {
      systemPrompt += `\nСЛУЧАЙ: ${context.occasion}`;
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
