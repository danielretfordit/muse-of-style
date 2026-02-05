import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Category mapping for AI response
const categoryMapping: Record<string, string> = {
  "tops": "tops",
  "top": "tops",
  "shirt": "tops",
  "blouse": "tops",
  "sweater": "tops",
  "t-shirt": "tops",
  "свитер": "tops",
  "блузка": "tops",
  "футболка": "tops",
  "рубашка": "tops",
  "верх": "tops",
  
  "bottoms": "bottoms",
  "bottom": "bottoms",
  "pants": "bottoms",
  "jeans": "bottoms",
  "skirt": "bottoms",
  "shorts": "bottoms",
  "брюки": "bottoms",
  "джинсы": "bottoms",
  "юбка": "bottoms",
  "шорты": "bottoms",
  "низ": "bottoms",
  
  "dresses": "dresses",
  "dress": "dresses",
  "платье": "dresses",
  
  "outerwear": "outerwear",
  "coat": "outerwear",
  "jacket": "outerwear",
  "blazer": "outerwear",
  "пальто": "outerwear",
  "куртка": "outerwear",
  "пиджак": "outerwear",
  "верхняя одежда": "outerwear",
  
  "shoes": "shoes",
  "shoe": "shoes",
  "boots": "shoes",
  "sneakers": "shoes",
  "heels": "shoes",
  "обувь": "shoes",
  "ботинки": "shoes",
  "кроссовки": "shoes",
  "туфли": "shoes",
  "сапоги": "shoes",
  
  "accessories": "accessories",
  "accessory": "accessories",
  "bag": "accessories",
  "belt": "accessories",
  "scarf": "accessories",
  "jewelry": "accessories",
  "аксессуары": "accessories",
  "сумка": "accessories",
  "ремень": "accessories",
  "шарф": "accessories",
};

// Color mapping
const colorMapping: Record<string, string> = {
  "black": "black",
  "чёрный": "black",
  "черный": "black",
  "white": "white",
  "белый": "white",
  "gray": "gray",
  "grey": "gray",
  "серый": "gray",
  "beige": "beige",
  "бежевый": "beige",
  "brown": "brown",
  "коричневый": "brown",
  "navy": "navy",
  "тёмно-синий": "navy",
  "темно-синий": "navy",
  "blue": "blue",
  "синий": "blue",
  "голубой": "blue",
  "red": "red",
  "красный": "red",
  "pink": "pink",
  "розовый": "pink",
  "green": "green",
  "зелёный": "green",
  "зеленый": "green",
  "yellow": "yellow",
  "жёлтый": "yellow",
  "желтый": "yellow",
  "purple": "purple",
  "фиолетовый": "purple",
  "orange": "orange",
  "оранжевый": "orange",
  "multicolor": "multicolor",
  "многоцветный": "multicolor",
};

function normalizeCategory(category: string): string {
  const lower = category.toLowerCase().trim();
  return categoryMapping[lower] || "accessories";
}

function normalizeColor(color: string): string {
  const lower = color.toLowerCase().trim();
  return colorMapping[lower] || "multicolor";
}

async function fetchImageFromUrl(url: string): Promise<{ base64: string; contentType: string } | null> {
  try {
    // Handle Pinterest URLs - need to extract the actual image
    let imageUrl = url;
    
    // Pinterest pin URLs need special handling
    if (url.includes("pinterest.com") || url.includes("pin.it")) {
      // Fetch the page and extract og:image
      const pageResponse = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      });
      
      if (!pageResponse.ok) {
        console.error("Failed to fetch Pinterest page:", pageResponse.status);
        return null;
      }
      
      const html = await pageResponse.text();
      
      // Extract og:image from meta tag
      const ogImageMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/);
      if (ogImageMatch && ogImageMatch[1]) {
        imageUrl = ogImageMatch[1];
        console.log("Extracted Pinterest image URL:", imageUrl);
      } else {
        // Try another pattern
        const pinImgMatch = html.match(/"orig":{"url":"([^"]+)"/);
        if (pinImgMatch && pinImgMatch[1]) {
          imageUrl = pinImgMatch[1].replace(/\\u002F/g, "/");
          console.log("Extracted Pinterest image URL (orig):", imageUrl);
        } else {
          console.error("Could not extract image URL from Pinterest page");
          return null;
        }
      }
    }
    
    // Fetch the actual image
    const imageResponse = await fetch(imageUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    
    if (!imageResponse.ok) {
      console.error("Failed to fetch image:", imageResponse.status);
      return null;
    }
    
    const contentType = imageResponse.headers.get("content-type") || "image/jpeg";
    const arrayBuffer = await imageResponse.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Convert to base64
    let binary = "";
    for (let i = 0; i < uint8Array.length; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    const base64 = btoa(binary);
    
    return { base64, contentType };
  } catch (error) {
    console.error("Error fetching image:", error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, language = "ru" } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ error: "URL is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Analyzing URL:", url);

    // Fetch image from URL
    const imageData = await fetchImageFromUrl(url);
    
    if (!imageData) {
      return new Response(
        JSON.stringify({ error: "Could not fetch image from URL. Please try uploading the image directly." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Call AI to analyze the image
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = language === "ru" 
      ? `Ты - эксперт по моде. Проанализируй изображение одежды и определи:
1. Название предмета (кратко, например: "Кашемировый свитер" или "Шёлковая блузка")
2. Бренд (если видно на изображении, иначе null)
3. Категория (одна из: tops, bottoms, dresses, outerwear, shoes, accessories)
4. Основной цвет (один из: black, white, gray, beige, brown, navy, blue, red, pink, green, yellow, purple, orange, multicolor)
5. Краткое описание (материал, стиль, особенности - 1-2 предложения)

Отвечай ТОЛЬКО на русском языке.`
      : `You are a fashion expert. Analyze the clothing image and determine:
1. Item name (brief, e.g., "Cashmere Sweater" or "Silk Blouse")
2. Brand (if visible in the image, otherwise null)
3. Category (one of: tops, bottoms, dresses, outerwear, shoes, accessories)
4. Main color (one of: black, white, gray, beige, brown, navy, blue, red, pink, green, yellow, purple, orange, multicolor)
5. Brief description (material, style, features - 1-2 sentences)`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: `data:${imageData.contentType};base64,${imageData.base64}` },
              },
              {
                type: "text",
                text: language === "ru" 
                  ? "Проанализируй эту вещь и заполни данные."
                  : "Analyze this clothing item and fill in the data.",
              },
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "set_clothing_details",
              description: "Set the analyzed clothing details",
              parameters: {
                type: "object",
                properties: {
                  name: {
                    type: "string",
                    description: "Name of the clothing item",
                  },
                  brand: {
                    type: "string",
                    nullable: true,
                    description: "Brand name if visible, null otherwise",
                  },
                  category: {
                    type: "string",
                    enum: ["tops", "bottoms", "dresses", "outerwear", "shoes", "accessories"],
                    description: "Category of the item",
                  },
                  color: {
                    type: "string",
                    enum: ["black", "white", "gray", "beige", "brown", "navy", "blue", "red", "pink", "green", "yellow", "purple", "orange", "multicolor"],
                    description: "Main color of the item",
                  },
                  description: {
                    type: "string",
                    description: "Brief description of the item",
                  },
                },
                required: ["name", "category", "color"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "set_clothing_details" } },
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "AI analysis failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    console.log("AI response:", JSON.stringify(aiData));

    // Extract tool call result
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== "set_clothing_details") {
      return new Response(
        JSON.stringify({ error: "AI did not return expected data format" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const analysis = JSON.parse(toolCall.function.arguments);

    // Return the analysis along with the image
    return new Response(
      JSON.stringify({
        success: true,
        imageBase64: `data:${imageData.contentType};base64,${imageData.base64}`,
        analysis: {
          name: analysis.name || "",
          brand: analysis.brand || "",
          category: normalizeCategory(analysis.category || "accessories"),
          color: normalizeColor(analysis.color || "multicolor"),
          description: analysis.description || "",
        },
        sourceUrl: url,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error analyzing URL:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
