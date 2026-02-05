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
  season?: 'winter' | 'summer' | 'demi' | 'all' | null;
}

interface Weather {
  temperature: number;
  condition: string;
  humidity: number;
}

interface StylistRequest {
  weather: Weather;
  wardrobe: WardrobeItem[];
  occasion?: string;
  language?: string;
}

interface CategoryResult {
  category: string;
  item?: {
    wardrobe_item_id: string;
    reason: string;
  };
  missing?: boolean;
  skipped?: boolean;
  message?: string;
}

// Category configuration
const CATEGORIES = [
  { key: 'shoes', labelRu: 'Обувь', labelEn: 'Shoes', maxItems: 5, required: true, requiredTemp: null },
  { key: 'outerwear', labelRu: 'Верхняя одежда', labelEn: 'Outerwear', maxItems: 4, required: false, requiredTemp: 15 },
  { key: 'tops', labelRu: 'Верх', labelEn: 'Tops', maxItems: 5, required: true, requiredTemp: null },
  { key: 'bottoms', labelRu: 'Низ', labelEn: 'Bottoms', maxItems: 4, required: true, requiredTemp: null },
  { key: 'accessories', labelRu: 'Аксессуары', labelEn: 'Accessories', maxItems: 3, required: false, requiredTemp: null },
];

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

// Build multimodal content for a single category
async function buildCategoryContent(
  weather: Weather,
  items: WardrobeItem[],
  categoryLabel: string,
  language: string
): Promise<Array<{ type: string; text?: string; image_url?: { url: string } }>> {
  const content: Array<{ type: string; text?: string; image_url?: { url: string } }> = [];
  
  const intro = language === "ru"
    ? `Погода: ${weather.temperature}°C, ${weather.condition}

Анализируй ТОЛЬКО категорию "${categoryLabel}".
Ниже представлены вещи с фотографиями. ВНИМАТЕЛЬНО смотри на каждое изображение.

ВЕЩИ:`
    : `Weather: ${weather.temperature}°C, ${weather.condition}

Analyze ONLY the "${categoryLabel}" category.
Below are items with photos. CAREFULLY examine each image.

ITEMS:`;

  content.push({ type: "text", text: intro });

  let itemNumber = 1;
  for (const item of items) {
    // Add item description first
    const itemText = `\nВЕЩЬ №${itemNumber} [ID: ${item.id}]
Название: ${item.name}
${item.color ? `Цвет: ${item.color}` : ""}
${item.brand ? `Бренд: ${item.brand}` : ""}
(Изображение ниже ↓)`;

    content.push({ type: "text", text: itemText });

    // Then add image
    const base64Image = await fetchImageAsBase64(item.image_url);
    if (base64Image) {
      content.push({
        type: "image_url",
        image_url: { url: base64Image }
      });
    }

    itemNumber++;
  }

  return content;
}

// Analyze a single category with AI
async function analyzeCategoryWithAI(
  weather: Weather,
  items: WardrobeItem[],
  categoryLabel: string,
  language: string,
  apiKey: string
): Promise<{ wardrobe_item_id: string; reason: string } | null> {
  const systemPrompt = language === "ru"
    ? `Ты — профессиональный стилист с ВИЗУАЛЬНЫМ анализом.

ВАЖНО: Ты ВИДИШЬ фотографии вещей. Вещи пронумерованы (ВЕЩЬ №1, ВЕЩЬ №2...).
Изображение каждой вещи находится СРАЗУ ПОСЛЕ её описания.

ЗАДАЧА: Из представленных вещей выбери ОДНУ, которая лучше всего подходит для погоды ${weather.temperature}°C.

Внимательно смотри на ФОТО каждой вещи и оценивай визуально:
- Материал и плотность (тёплая или лёгкая вещь?)
- Тип (открытая/закрытая обувь, утеплённая/летняя)
- Сезонность по внешнему виду

СТРОГИЕ ПРАВИЛА:
- При температуре ниже +5°C НЕ выбирай визуально лёгкую обувь (кеды, кроссовки, сандалии)
- При температуре ниже 0°C нужна ОЧЕНЬ тёплая одежда
- Если НИ ОДНА вещь не подходит для погоды — верни пустой результат
- Лучше ничего не выбрать, чем выбрать неподходящее!

Используй функцию select_item для ответа.`
    : `You are a professional stylist with VISUAL analysis capabilities.

IMPORTANT: You CAN SEE the photos. Items are numbered (ITEM #1, ITEM #2...).
The image for each item appears IMMEDIATELY AFTER its description.

TASK: From the presented items, choose ONE that best suits the ${weather.temperature}°C weather.

Carefully examine each PHOTO and visually assess:
- Material and density (warm or light clothing?)
- Type (open/closed footwear, insulated/summer)
- Seasonality based on appearance

STRICT RULES:
- Below +5°C do NOT choose visually light footwear (sneakers, canvas shoes, sandals)
- Below 0°C you need VERY warm clothing
- If NO item suits the weather — return empty result
- It's better to select nothing than to select something unsuitable!

Use the select_item function to respond.`;

  const userContent = await buildCategoryContent(weather, items, categoryLabel, language);

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
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
            name: "select_item",
            description: "Select the best item for the weather, or indicate none is suitable",
            parameters: {
              type: "object",
              properties: {
                selected: {
                  type: "boolean",
                  description: "true if a suitable item was found, false if none is suitable",
                },
                wardrobe_item_id: {
                  type: "string",
                  description: "ID of the selected item (only if selected=true)",
                },
                reason: {
                  type: "string",
                  description: "Why this item was chosen, or why none is suitable",
                },
              },
              required: ["selected", "reason"],
              additionalProperties: false,
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "select_item" } },
    }),
  });

  if (!response.ok) {
    console.error(`AI error for category ${categoryLabel}:`, response.status);
    return null;
  }

  const aiResponse = await response.json();
  const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];

  if (!toolCall || toolCall.function.name !== "select_item") {
    return null;
  }

  const result = JSON.parse(toolCall.function.arguments);

  if (result.selected && result.wardrobe_item_id) {
    return {
      wardrobe_item_id: result.wardrobe_item_id,
      reason: result.reason,
    };
  }

  return null;
}

// Generate final explanation
async function generateFinalExplanation(
  weather: Weather,
  selectedItems: Array<{ item: WardrobeItem; reason: string }>,
  language: string,
  apiKey: string
): Promise<{ explanation: string; style_tips: string[] }> {
  const itemsList = selectedItems.map(i => `- ${i.item.name} (${i.item.category}): ${i.reason}`).join("\n");

  const prompt = language === "ru"
    ? `Погода: ${weather.temperature}°C, ${weather.condition}

Подобранные вещи:
${itemsList}

Напиши краткое объяснение почему этот образ подходит для погоды и 2-3 практичных совета по стилю.`
    : `Weather: ${weather.temperature}°C, ${weather.condition}

Selected items:
${itemsList}

Write a brief explanation of why this outfit suits the weather and 2-3 practical style tips.`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "user", content: prompt },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "provide_summary",
            description: "Provide outfit summary and tips",
            parameters: {
              type: "object",
              properties: {
                explanation: {
                  type: "string",
                  description: "Brief explanation of why this outfit works",
                },
                style_tips: {
                  type: "array",
                  items: { type: "string" },
                  description: "2-3 practical style tips",
                },
              },
              required: ["explanation", "style_tips"],
              additionalProperties: false,
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "provide_summary" } },
    }),
  });

  if (!response.ok) {
    return {
      explanation: language === "ru" ? "Образ подобран на основе погоды." : "Outfit selected based on weather.",
      style_tips: [],
    };
  }

  const aiResponse = await response.json();
  const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];

  if (toolCall?.function.name === "provide_summary") {
    return JSON.parse(toolCall.function.arguments);
  }

  return {
    explanation: language === "ru" ? "Образ подобран на основе погоды." : "Outfit selected based on weather.",
    style_tips: [],
  };
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

    const results: CategoryResult[] = [];
    const selectedItems: Array<{ item: WardrobeItem; reason: string; category: string }> = [];

    // Process each category iteratively
    for (const category of CATEGORIES) {
      // Check if category is required based on temperature
      const isRequired = category.required || 
        (category.requiredTemp !== null && weather.temperature < category.requiredTemp);

      // Filter items for this category
      const categoryItems = wardrobe.filter(i => i.category === category.key);

      if (categoryItems.length === 0) {
        if (isRequired) {
          results.push({
            category: category.key,
            missing: true,
            message: language === "ru" 
              ? `Нет ${category.labelRu.toLowerCase()} в гардеробе`
              : `No ${category.labelEn.toLowerCase()} in wardrobe`,
          });
        } else {
          results.push({
            category: category.key,
            skipped: true,
          });
        }
        continue;
      }

      // Analyze this category (limit items)
      const itemsToAnalyze = categoryItems.slice(0, category.maxItems);
      const categoryLabel = language === "ru" ? category.labelRu : category.labelEn;

      console.log(`Analyzing ${category.key} with ${itemsToAnalyze.length} items...`);

      const bestItem = await analyzeCategoryWithAI(
        weather,
        itemsToAnalyze,
        categoryLabel,
        language,
        LOVABLE_API_KEY
      );

      if (bestItem) {
        const wardrobeItem = wardrobe.find(w => w.id === bestItem.wardrobe_item_id);
        if (wardrobeItem) {
          results.push({
            category: category.key,
            item: bestItem,
          });
          selectedItems.push({
            item: wardrobeItem,
            reason: bestItem.reason,
            category: category.key,
          });
        }
      } else if (isRequired) {
        results.push({
          category: category.key,
          missing: true,
          message: language === "ru"
            ? `Подходящей ${category.labelRu.toLowerCase()} не найдено`
            : `No suitable ${category.labelEn.toLowerCase()} found`,
        });
      }
    }

    // Generate final explanation if we have items
    let explanation = "";
    let style_tips: string[] = [];

    if (selectedItems.length > 0) {
      const summary = await generateFinalExplanation(
        weather,
        selectedItems,
        language,
        LOVABLE_API_KEY
      );
      explanation = summary.explanation;
      style_tips = summary.style_tips;
    } else {
      explanation = language === "ru"
        ? "К сожалению, не удалось подобрать подходящие вещи для текущей погоды."
        : "Unfortunately, no suitable items were found for the current weather.";
    }

    // Build response with enriched items
    const enrichedItems = selectedItems.map(s => ({
      wardrobe_item_id: s.item.id,
      reason: s.reason,
      item: s.item,
    }));

    // Build analysis summary
    const analysisSummary = {
      total_analyzed: wardrobe.length,
      categories_checked: results.filter(r => !r.skipped).map(r => r.category),
      missing_categories: results.filter(r => r.missing).map(r => ({
        category: r.category,
        message: r.message,
      })),
    };

    return new Response(
      JSON.stringify({
        items: enrichedItems,
        explanation,
        style_tips,
        analysis_summary: analysisSummary,
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
