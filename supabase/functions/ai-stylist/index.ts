import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface WardrobeItem {
  id: string;
  name: string;
  category: string;
  color: string | null;
  brand: string | null;
  image_url: string;
}

interface StylistRequest {
  weather: {
    temperature: number;
    condition: string;
    humidity: number;
  };
  wardrobe: WardrobeItem[];
  occasion?: string;
  language?: string;
}

// Fetch image and convert to base64 data URL
async function fetchImageAsBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Failed to fetch image: ${response.status} ${url}`);
      return null;
    }
    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Convert to base64 using Deno's btoa
    let binary = "";
    for (let i = 0; i < uint8Array.length; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    const base64 = btoa(binary);
    
    const contentType = response.headers.get("content-type") || "image/jpeg";
    return `data:${contentType};base64,${base64}`;
  } catch (error) {
    console.error("Failed to fetch image:", error);
    return null;
  }
}

// Build multimodal content array with images
async function buildMultimodalContent(
  weather: StylistRequest["weather"],
  wardrobe: WardrobeItem[],
  occasion: string,
  language: string
): Promise<Array<{ type: string; text?: string; image_url?: { url: string } }>> {
  const content: Array<{ type: string; text?: string; image_url?: { url: string } }> = [];
  
  // Weather and instructions
  const weatherText = language === "ru"
    ? `Погода сейчас:
- Температура: ${weather.temperature}°C
- Условия: ${weather.condition}
- Влажность: ${weather.humidity}%

Случай: ${occasion}

Ниже представлены фотографии вещей из гардероба. ВНИМАТЕЛЬНО РАССМОТРИ КАЖДОЕ ИЗОБРАЖЕНИЕ и оцени:
- Материал и плотность (тёплая или лёгкая вещь?)
- Тип обуви (открытая/закрытая, утеплённая/летняя)
- Сезонность по внешнему виду

Подбери образ, используя функцию suggest_outfit.`
    : `Current weather:
- Temperature: ${weather.temperature}°C
- Conditions: ${weather.condition}
- Humidity: ${weather.humidity}%

Occasion: ${occasion}

Below are photos of wardrobe items. CAREFULLY EXAMINE EACH IMAGE and assess:
- Material and density (is it warm or light clothing?)
- Type of footwear (open/closed, insulated/summer)
- Seasonality based on appearance

Create an outfit using the suggest_outfit function.`;
  
  content.push({ type: "text", text: weatherText });
  
  // Limit to 15 items to avoid API limits
  const limitedWardrobe = wardrobe.slice(0, 15);
  
  // Add each item with its image
  for (const item of limitedWardrobe) {
    // Try to fetch and convert image to base64
    const base64Image = await fetchImageAsBase64(item.image_url);
    
    if (base64Image) {
      content.push({
        type: "image_url",
        image_url: { url: base64Image }
      });
    }
    
    // Add item metadata
    const itemText = `[ID: ${item.id}] ${item.name} (${item.category}${item.color ? `, ${item.color}` : ""}${item.brand ? `, ${item.brand}` : ""})`;
    content.push({ type: "text", text: itemText });
  }
  
  return content;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { weather, wardrobe, occasion = "casual", language = "en" }: StylistRequest = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!wardrobe || wardrobe.length === 0) {
      return new Response(
        JSON.stringify({ error: "No wardrobe items provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build system prompt with strict visual analysis rules
    const systemPrompt = language === "ru" 
      ? `Ты — профессиональный стилист с ВИЗУАЛЬНЫМ анализом.

ВАЖНО: Ты ВИДИШЬ фотографии каждой вещи. Это твоя главная способность!

КРИТИЧЕСКОЕ ПРАВИЛО ДЛЯ ФОРМИРОВАНИЯ ОТВЕТА:
В массив items функции suggest_outfit включай ТОЛЬКО те вещи, которые РЕАЛЬНО подходят для текущей погоды. 
НЕ добавляй туда вещи "на всякий случай" или "как вариант".

Примеры:
- Температура: -15°C, кеды выглядят как летняя обувь → НЕ добавляй их в items
- Температура: -15°C, зимние ботинки → Добавь в items  
- Если зимней обуви нет в гардеробе → Верни образ БЕЗ обуви и объясни в explanation что нужно купить

Анализируй КАЖДОЕ изображение и оценивай:
1. Материал и плотность (визуально определи — это тёплая или лёгкая вещь?)
2. Тип обуви (открытая/закрытая, утеплённая/летняя, кроссовки/ботинки/сандалии)
3. Сезонность по внешнему виду (пуховик vs ветровка, свитер vs футболка)

СТРОГИЕ ПРАВИЛА БЕЗОПАСНОСТИ:
- При температуре ниже +5°C КАТЕГОРИЧЕСКИ НЕ добавляй в items визуально лёгкую обувь (кеды, кроссовки, мокасины, сандалии)
- При температуре ниже 0°C обязательно добавь в items тёплую верхнюю одежду (пуховик, шуба, тёплое пальто)
- При температуре ниже -10°C нужна ОЧЕНЬ тёплая одежда — оцени это по фото!
- Если подходящих тёплых вещей НЕТ — ЧЕСТНО скажи об этом в explanation, но НЕ добавляй неподходящие вещи в items!
- Лучше вернуть 2-3 подходящие вещи, чем 5 с неподходящими

Правила выбора:
1. Выбирай ТОЛЬКО вещи из предоставленного гардероба (используй их ID)
2. Подбирай 3-5 вещей для полного образа (но меньше, если подходящих мало!)
3. Объясняй выбор каждой вещи С УЧЁТОМ того что ты ВИДИШЬ на фото
4. Отвечай на русском языке`
      : `You are a professional stylist with VISUAL analysis capabilities.

IMPORTANT: You CAN SEE the photos of each item. This is your main ability!

CRITICAL RULE FOR RESPONSE FORMATION:
Include in the items array of suggest_outfit function ONLY items that ACTUALLY suit the current weather.
Do NOT add items "just in case" or "as an option".

Examples:
- Temperature: -15°C, sneakers look like summer shoes → DO NOT add them to items
- Temperature: -15°C, winter boots → Add to items
- If no winter footwear exists in wardrobe → Return outfit WITHOUT shoes and explain in explanation what needs to be purchased

Analyze EACH image and assess:
1. Material and density (visually determine — is this warm or light clothing?)
2. Type of footwear (open/closed, insulated/summer, sneakers/boots/sandals)
3. Seasonality by appearance (puffer jacket vs windbreaker, sweater vs t-shirt)

STRICT SAFETY RULES:
- Below +5°C NEVER add visually light footwear to items (sneakers, canvas shoes, loafers, sandals)
- Below 0°C you MUST add warm outerwear to items (puffer jacket, fur coat, warm coat)
- Below -10°C you need VERY warm clothing — assess this from the photos!
- If suitable warm items are NOT available — HONESTLY say this in explanation, but DO NOT add unsuitable items to items!
- It's better to return 2-3 suitable items than 5 with unsuitable ones

Selection rules:
1. Choose ONLY items from the provided wardrobe (use their IDs)
2. Select 3-5 items for a complete outfit (but fewer if suitable items are limited!)
3. Explain each choice BASED ON what you SEE in the photos
4. Respond in English`;

    // Build multimodal content with images
    const userContent = await buildMultimodalContent(weather, wardrobe, occasion, language);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "suggest_outfit",
              description: "Suggest an outfit from the user's wardrobe based on weather, occasion, and VISUAL analysis of item photos",
              parameters: {
                type: "object",
                properties: {
                  items: {
                    type: "array",
                    description: "ONLY weather-appropriate items from the wardrobe. EXCLUDE items that don't match the temperature requirements based on visual analysis. It's better to return fewer items than include unsuitable ones. If no suitable item exists for a category (e.g., no winter boots), omit that category entirely.",
                    items: {
                      type: "object",
                      properties: {
                        wardrobe_item_id: {
                          type: "string",
                          description: "ID of the wardrobe item",
                        },
                        reason: {
                          type: "string",
                          description: "Why this item was chosen, including visual observations from the photo",
                        },
                      },
                      required: ["wardrobe_item_id", "reason"],
                      additionalProperties: false,
                    },
                  },
                  explanation: {
                    type: "string",
                    description: "Overall explanation of why this outfit works for the weather and occasion. If no suitable warm items exist, explain what's missing.",
                  },
                  style_tips: {
                    type: "array",
                    description: "Practical style tips for wearing this outfit",
                    items: { type: "string" },
                  },
                },
                required: ["items", "explanation", "style_tips"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "suggest_outfit" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall || toolCall.function.name !== "suggest_outfit") {
      throw new Error("Unexpected AI response format");
    }

    const recommendation = JSON.parse(toolCall.function.arguments);

    // Enrich items with full wardrobe data
    const enrichedItems = recommendation.items.map((item: { wardrobe_item_id: string; reason: string }) => {
      const wardrobeItem = wardrobe.find(w => w.id === item.wardrobe_item_id);
      return {
        ...item,
        item: wardrobeItem || null,
      };
    }).filter((item: { item: WardrobeItem | null }) => item.item !== null);

    return new Response(
      JSON.stringify({
        items: enrichedItems,
        explanation: recommendation.explanation,
        style_tips: recommendation.style_tips,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("ai-stylist error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
