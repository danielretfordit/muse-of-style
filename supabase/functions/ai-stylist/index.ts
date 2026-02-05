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

    const wardrobeDescription = wardrobe.map(item => 
      `- ${item.name} (${item.category}${item.color ? `, ${item.color}` : ""}${item.brand ? `, ${item.brand}` : ""}) [ID: ${item.id}]`
    ).join("\n");

    const systemPrompt = language === "ru" 
      ? `Ты — профессиональный стилист. Твоя задача — подобрать идеальный образ из гардероба пользователя, учитывая погоду и случай.

Правила:
1. Выбирай ТОЛЬКО вещи из предоставленного гардероба (используй их ID)
2. Подбирай 3-5 вещей для полного образа
3. Учитывай температуру, условия погоды и влажность
4. Объясняй выбор каждой вещи
5. Давай практичные советы по стилю
6. Отвечай на русском языке`
      : `You are a professional stylist. Your task is to create a perfect outfit from the user's wardrobe, considering weather and occasion.

Rules:
1. Choose ONLY items from the provided wardrobe (use their IDs)
2. Select 3-5 items for a complete outfit
3. Consider temperature, weather conditions, and humidity
4. Explain the choice for each item
5. Give practical style tips
6. Respond in English`;

    const userPrompt = language === "ru"
      ? `Погода сейчас:
- Температура: ${weather.temperature}°C
- Условия: ${weather.condition}
- Влажность: ${weather.humidity}%

Случай: ${occasion}

Гардероб пользователя:
${wardrobeDescription}

Подбери образ, используя функцию suggest_outfit.`
      : `Current weather:
- Temperature: ${weather.temperature}°C
- Conditions: ${weather.condition}
- Humidity: ${weather.humidity}%

Occasion: ${occasion}

User's wardrobe:
${wardrobeDescription}

Create an outfit using the suggest_outfit function.`;

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
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "suggest_outfit",
              description: "Suggest an outfit from the user's wardrobe based on weather and occasion",
              parameters: {
                type: "object",
                properties: {
                  items: {
                    type: "array",
                    description: "Selected wardrobe items for the outfit",
                    items: {
                      type: "object",
                      properties: {
                        wardrobe_item_id: {
                          type: "string",
                          description: "ID of the wardrobe item",
                        },
                        reason: {
                          type: "string",
                          description: "Why this item was chosen for the outfit",
                        },
                      },
                      required: ["wardrobe_item_id", "reason"],
                      additionalProperties: false,
                    },
                  },
                  explanation: {
                    type: "string",
                    description: "Overall explanation of why this outfit works for the weather and occasion",
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
